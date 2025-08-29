---
title: Test Your Application Locally
summary: Best practices for locally testing an application built on CockroachDB
toc: true
docs_area: develop
---

This page documents best practices for unit testing applications built on CockroachDB in a local environment.

If you are deploying a self-hosted cluster, see the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}) for information about preparing your cluster for production.

{{site.data.alerts.callout_danger}}
The settings described on this page are **not recommended** for use in production clusters. They are only recommended for use during unit testing and continuous integration testing (CI).
{{site.data.alerts.end}}

## Use a local, single-node cluster with in-memory storage

The [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) command below starts a single-node, insecure cluster with [in-memory storage]({% link {{ page.version.version }}/cockroach-start-single-node.md %}#store). Using in-memory storage improves the speed of the cluster for local testing purposes.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start-single-node --insecure --store=type=mem,size=0.25 --advertise-addr=localhost
~~~

We recommend the following additional [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) and [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}#data-definition-statements) for improved performance during functional unit testing and continuous integration testing. In particular, some of these settings will increase the performance of [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), since repeated [creation]({% link {{ page.version.version }}/create-schema.md %}) and [dropping]({% link {{ page.version.version }}/drop-schema.md %}) of schemas are common in automated testing.

| Setting                                                      | Value     | Description                                                                                                                                                                                                               |
|--------------------------------------------------------------+-----------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `kv.range_merge.queue_interval`                              | `50ms`    | Frequent [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) or [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}) creates extra ranges, which we want to merge more quickly. In real usage, range merges are rate limited because they require rebalancing. |
| `jobs.registry.interval.gc`                                  | `30s`     | CockroachDB executes internal queries that scan the [jobs]({% link {{ page.version.version }}/show-jobs.md %}) table. More schema changes create more jobs, which we can delete faster to make internal job queries faster.                                   |
| `jobs.registry.interval.cancel`                              | `180s`    | Timing of an internal task that queries the [jobs]({% link {{ page.version.version }}/show-jobs.md %}) table. For testing, the default is too fast.                                                                                                           |
| `jobs.retention_time`                                        | `15s`     | More [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}) create more [jobs]({% link {{ page.version.version }}/show-jobs.md %}), which affects job query performance. We don’t need to retain jobs during testing and can set a more aggressive delete policy.       |
| `sql.stats.automatic_collection.enabled`                     | `false`   | Turn off [statistics]({% link {{ page.version.version }}/show-statistics.md %}) collection, since automatic statistics contribute to table contention alongside schema changes. Each schema change triggers an asynchronous auto statistics job.              |
| `ALTER RANGE default CONFIGURE ZONE USING "gc.ttlseconds"`   | `600`       | Faster descriptor cleanup. For more information, see [`ALTER RANGE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-range.md %}#configure-zone).                                                                                                                                   |
| `ALTER DATABASE system CONFIGURE ZONE USING "gc.ttlseconds"` | `600`       | Faster jobs table cleanup. For more information, see [`ALTER DATABASE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#configure-zone).                                                                                                                             |

To change all of the settings described above at once, run the following SQL statements:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING kv.range_merge.queue_interval = '50ms';
SET CLUSTER SETTING jobs.registry.interval.gc = '30s';
SET CLUSTER SETTING jobs.registry.interval.cancel = '180s';
SET CLUSTER SETTING jobs.retention_time = '15s';
SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
SET CLUSTER SETTING kv.range_split.by_load_merge_delay = '5s';
ALTER RANGE default CONFIGURE ZONE USING "gc.ttlseconds" = 600;
ALTER DATABASE system CONFIGURE ZONE USING "gc.ttlseconds" = 600;
~~~

{{site.data.alerts.callout_danger}}
These settings **are not** recommended for [performance benchmarking of CockroachDB]({% link {{ page.version.version }}/performance-benchmarking-with-tpcc-local.md %}) since they will lead to inaccurate results.
{{site.data.alerts.end}}

## Scope tests to a database when possible

It is better to scope tests to a [database]({% link {{ page.version.version }}/create-database.md %}) than to a [user-defined schema]({% link {{ page.version.version }}/create-schema.md %}) due to inefficient user-defined schema validation. The performance of user-defined schema validation may be improved in a future release.

## Log test output to a file

By default, `cockroach start-single-node` logs cluster activity to a file with the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration). When you specify the `--store=type=mem` flag, the command prints cluster activity directly to the console instead.

To customize logging behavior for local clusters, use the [`--log` flag]({% link {{ page.version.version }}/cockroach-start-single-node.md %}#logging):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start-single-node --insecure --store=type=mem,size=0.25 --advertise-addr=localhost --log="{file-defaults: {dir: /path/to/logs}, sinks: {stderr: {filter: NONE}}}"
~~~

The `log` flag has two suboptions:

- `file-defaults`, which specifies the path of the file in which to log events (`/path/to/logs`).
- `sinks`, which provides a secondary destination to which to log events (`stderr`).

For more information about logging, see [Configure logs]({% link {{ page.version.version }}/configure-logs.md %}).

## Use a local file server for bulk operations

To test bulk operations like [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) or [`RESTORE`]({% link {{ page.version.version }}/restore.md %}), we recommend using a local file server.

For more details, see [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %}).

## Use Docker-specific testing and development tools

When you use the `cockroach start-single-node` command to start a single-node cluster with Docker, some additional features are available to help with testing and development. Refer to [Start a local cluster in Docker (Linux)]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-linux.md %}) and [Start a local cluster in Docker (macOS)]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-mac.md %}).


## See also

- [Troubleshoot SQL Statements]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
- [Optimize Statement Performance]({% link {{ page.version.version }}/make-queries-fast.md %})
