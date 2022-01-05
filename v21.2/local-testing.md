---
title: Test Your Application
summary: Best practices for locally testing an application built on CockroachDB
toc: true
---

This page documents best practices for unit testing applications built on CockroachDB.

If you are deploying a self-hosted cluster, see the [Production Checklist](recommended-production-settings.html) for information about preparing your cluster for production.

{{site.data.alerts.callout_danger}}
The settings described on this page are **not recommended** for use in production clusters. They are only recommended for use during unit testing and continuous integration testing (CI).
{{site.data.alerts.end}}

## Use a local, single-node cluster with in-memory storage

The [`cockroach start-single-node`](cockroach-start-single-node.html) command below starts a single-node, insecure cluster with [in-memory storage](cockroach-start-single-node.html#store). Using in-memory storage improves the speed of the cluster for local testing purposes.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start-single-node --insecure --store=type=mem,size=0.25 --advertise-addr=localhost
~~~

We recommend the following additional [cluster settings](cluster-settings.html) and [SQL statements](sql-statements.html#data-definition-statements) for improved performance during functional unit testing and continuous integration testing:

| Setting                                                      | Value     | Description                                                                                                                                                                          |
|--------------------------------------------------------------+-----------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `kv.raft_log.disable_synchronization_unsafe`                 | `true`    | Improves performance by not syncing data to disk. Data is lost if a node crashes.                                                                                                    |
| `kv.range_merge.queue_interval`                              | `50ms`    | Frequent CREATE TABLE or DROP TABLE creates extra ranges, which we want to merge more quickly. In real usage, range merges are rate limited because they require rebalancing.        |
| `jobs.registry.interval.gc`                                  | `30s`     | CockroachDB executes internal queries that scan the jobs table. More schema changes create more jobs, which we can delete faster to make internal job queries faster.                |
| `jobs.registry.interval.cancel`                              | `180s`    | Timing of an internal task that queries the jobs table. For testing, the default is too fast.                                                                                        |
| `jobs.retention_time`                                        | `15s`     | More schema changes create more jobs, which affects job query performance. We don’t need to retain jobs during testing and can set a more aggressive delete policy.                  |
| `schemachanger.backfiller.buffer_increment`                  | `128 KiB` | During table backfills, we fill up buffers which have a large default. A lower setting reduces memory usage.                                                                         |
| `sql.catalog.unsafe_skip_system_config_trigger`              | `true`    | Turn off gossiping the system config span, which is not necessary in a test environment. (Available in v22.1 and later.)                                                             |
| `sql.stats.automatic_collection.enabled`                     | `false`   | Turn off statistics collection, since automatic statistics contribute to table contention alongside schema changes. Each schema change triggers an asynchronous auto statistics job. |
| `ALTER RANGE default CONFIGURE ZONE USING "gc.ttlseconds"`   | `5s`      | Faster descriptor cleanup. For more information, see [`ALTER RANGE`](alter-range.html).                                                                                              |
| `ALTER DATABASE system CONFIGURE ZONE USING "gc.ttlseconds"` | `5s`      | Faster jobs table cleanup. For more information, see [`ALTER DATABASE`](alter-database.html).                                                                                        |

## Scope tests to a database when possible

It is better to scope tests to a [database](create-database.html) than to a [user-defined schema](create-schema.html) due to inefficient user-defined schema validation. The performance of user-defined schema validation may be improved in a future release.

## Log test output to a file

By default, `cockroach start-single-node` logs cluster activity to a file with the [default logging configuration](configure-logs.html#default-logging-configuration). When you specify the `--store=type=mem` flag, the command prints cluster activity directly to the console instead.

To customize logging behavior for local clusters, use the [`--log` flag](cockroach-start-single-node.html#logging):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start-single-node --insecure --store=type=mem,size=0.25 --advertise-addr=localhost --log="{file-defaults: {dir: /path/to/logs}, sinks: {stderr: {filter: NONE}}}"
~~~

The `log` flag has two suboptions:

- `file-defaults`, which specifies the path of the file in which to log events (`/path/to/logs`).
- `sinks`, which provides a secondary destination to which to log events (`stderr`).

For more information about logging, see [Configure logs](configure-logs.html).

## Use a local file server for bulk operations

To test bulk operations like [`IMPORT`](import.html), [`BACKUP`](backup.html), or [`RESTORE`](restore.html), we recommend using a local file server.

For more details, see [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html).

## See also

- [Error Handling and Troubleshooting](error-handling-and-troubleshooting.html)
- [Optimize Statement Performance](make-queries-fast.html)
