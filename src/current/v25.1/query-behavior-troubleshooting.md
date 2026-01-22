---
title: Troubleshoot SQL Statements
summary: Learn how to troubleshoot issues with specific SQL statements with CockroachDB
toc: true
docs_area: manage
---

If a [SQL statement]({% link {{ page.version.version }}/sql-statements.md %}) returns an unexpected result or takes longer than expected to process, this page will help you troubleshoot the issue.

{{site.data.alerts.callout_success}}
For a developer-centric overview of optimizing SQL statement performance, see [Optimize Statement Performance Overview]({% link {{ page.version.version }}/make-queries-fast.md %}).
{{site.data.alerts.end}}

## Query issues

### Hanging or stuck queries

When you experience a hanging or stuck query and the cluster is healthy (i.e., no [unavailable ranges]({% link {{ page.version.version }}/ui-replication-dashboard.md %}#unavailable-ranges), [network partitions]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition), etc), the cause could be a long-running transaction holding [write intents]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) or [locking reads]({% link {{ page.version.version }}/select-for-update.md %}#lock-strengths) on the same rows as your query.

Such long-running queries can hold locks for (practically) unlimited durations. If your query tries to access those rows, it must wait for that transaction to complete (by [committing]({% link {{ page.version.version }}/commit-transaction.md %}) or [rolling back]({% link {{ page.version.version }}/rollback-transaction.md %})) before it can make progress. Until the transaction is committed or rolled back, the chances of concurrent transactions internally retrying and throwing a retry error increase.

Refer to the performance tuning recipe for [identifying and unblocking a waiting transaction]({% link {{ page.version.version }}/performance-recipes.md %}#waiting-transaction).

If you experience this issue on a CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster, your cluster may be throttled or disabled because you've reached your monthly [resource limits]({% link cockroachcloud/troubleshooting-page.md %}#hanging-or-stuck-queries).

### Identify slow queries

You can identify high-latency SQL statements on the [**Insights**]({% link {{ page.version.version }}/ui-insights-page.md %}) or [**Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}) pages in the DB Console. If these graphs reveal latency spikes, CPU usage spikes, or slow requests, these might indicate slow queries in your cluster.

You can also enable the [slow query log]({% link {{ page.version.version }}/logging-use-cases.md %}#sql_perf) to log all queries whose latency exceeds a configured threshold, as well as queries that perform a full table or index scan.

You can collect richer diagnostics of a high-latency statement by creating a [diagnostics bundle]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) when a statement fingerprint exceeds a certain latency.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/resolution-untuned-query.md %}
{{site.data.alerts.end}}

### Visualize statement traces in Jaeger

You can look more closely at the behavior of a statement by visualizing a [statement trace]({% link {{ page.version.version }}/show-trace.md %}#trace-description) in [Jaeger](https://www.jaegertracing.io/). A statement trace contains messages and timing information from all nodes involved in the execution.

#### Run Jaeger

1. Start Jaeger:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker run -d --name jaeger -p 6831:6831/udp -p 16686:16686 jaegertracing/all-in-one:latest
    ~~~
    This runs the latest version of Jaeger, and forwards two ports to the container. `6831` is the trace ingestion port, `16686` is the UI port. By default, Jaeger will store all received traces in memory.


#### Import a trace from a diagnostics bundle into Jaeger

1. Activate [statement diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) on the DB Console Statements Page or run [`EXPLAIN ANALYZE (DEBUG)`]({% link {{ page.version.version }}/explain-analyze.md %}#debug-option) to obtain a diagnostics bundle for the statement.

1. Go to [`http://localhost:16686`](http://localhost:16686).

1. Click **JSON File** in the Jaeger UI and upload `trace-jaeger.json` from the diagnostics bundle. The trace will appear in the list on the right.

    <img src="{{ 'images/{{ page.version.version }}/jaeger-trace-json.png' | relative_url }}" alt="Jaeger Trace Upload JSON" style="border:1px solid #eee;max-width:40%" />

1. Click the trace to view its details. It is visualized as a collection of spans with timestamps. These may include operations executed by different nodes.

    <img src="{{ 'images/{{ page.version.version }}/jaeger-trace-spans.png' | relative_url }}" alt="Jaeger Trace Spans" style="border:1px solid #eee;max-width:100%" />

    The full timeline displays the execution time and [execution phases]({% link {{ page.version.version }}/architecture/sql-layer.md %}#sql-parser-planner-executor) for the statement.

1. Click a span to view details for that span and log messages.

    <img src="{{ 'images/{{ page.version.version }}/jaeger-trace-log-messages.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

1. You can troubleshoot [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention), for example, by gathering [diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) on statements with high latency and looking through the log messages in `trace-jaeger.json` for jumps in latency.

    In the following example, the trace shows that there is significant latency between a push attempt on a transaction that is holding a [lock]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#writing) (56.85ms) and that transaction being committed (131.37ms).

    <img src="{{ 'images/{{ page.version.version }}/jaeger-trace-transaction-contention.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

#### Visualize traces sent directly from CockroachDB

This example shows how to configure CockroachDB to route all traces to Jaeger. For details on sending traces from CockroachDB to Jaeger and other trace collectors, see [Configure CockroachDB to send traces to a third-party trace collector](#configure-cockroachdb-to-send-traces-to-a-third-party-trace-collector).

{{site.data.alerts.callout_danger}}
Enabling full tracing is expensive both in terms of CPU usage and memory footprint, and is not suitable for high throughput production environments.
{{site.data.alerts.end}}

1. Run CockroachDB and set the Jaeger agent configuration:

    ~~~ sql
    SET CLUSTER SETTING trace.jaeger.agent='localhost:6831'
    ~~~

1. Go to [`http://localhost:16686`](http://localhost:16686).
1. In the Service field, select **CockroachDB**.

    <img src="{{ 'images/{{ page.version.version }}/jaeger-cockroachdb.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

1. Click **Find Traces**.

Instead of searching through log messages in an unstructured fashion, the logs are now graphed in a tree format based on how the contexts were passed around. This also traverses machine boundaries so you don't have to look at different flat `.log` files to correlate events.

Jaeger's memory storage works well for small use cases, but can result in out of memory errors when collecting many traces over a long period of time. Jaeger also supports disk-backed local storage using [Badger](https://www.jaegertracing.io/docs/1.32/deployment/#badger---local-storage). To use this, start Jaeger by running the following Docker command:

~~~ shell
docker run -d --name jaeger \
-e SPAN_STORAGE_TYPE=badger -e BADGER_EPHEMERAL=false \
-e BADGER_DIRECTORY_VALUE=/badger/data -e BADGER_DIRECTORY_KEY=/badger/key \
-v /mnt/data1/jaeger:/badger \
-p 6831:6831/udp -p 16686:16686 jaegertracing/all-in-one:latest
~~~

<a id="query-is-always-slow"></a>

### Queries are always slow

If you have consistently slow queries in your cluster, use the [Statement Fingerprint]({% link {{ page.version.version }}/ui-statements-page.md %}#statement-fingerprint-page) page to drill down to an individual statement and [collect diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) for the statement. A diagnostics bundle contains a record of transaction events across nodes for the SQL statement.

You can also use an [`EXPLAIN ANALYZE`]({% link {{ page.version.version }}/explain-analyze.md %}) statement, which executes a SQL query and returns a physical query plan with execution statistics. You can use query plans to troubleshoot slow queries by indicating where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc.

Cockroach Labs recommends sending either the diagnostics bundle (preferred) or the `EXPLAIN ANALYZE` output to our [support team]({% link {{ page.version.version }}/support-resources.md %}) for analysis.

### Queries are sometimes slow

If the query performance is irregular:

1.  Run [`SHOW TRACE FOR SESSION`]({% link {{ page.version.version }}/show-trace.md %}) for the query twice: once when the query is performing as expected and once when the query is slow.

1.  [Contact support]({% link {{ page.version.version }}/support-resources.md %}) to help analyze the outputs of the `SHOW TRACE` command.

### `SELECT` statements are slow

The common reasons for a sub-optimal `SELECT` performance are inefficient scans, full scans, and incorrect use of indexes. To improve the performance of `SELECT` statements, refer to the following documents:

-  [Table scan best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#table-scan-best-practices)

-  [Indexes best practices]({% link {{ page.version.version }}/schema-design-indexes.md %}#best-practices)

### `SELECT` statements with `GROUP BY` columns are slow

Suppose you have a [slow selection query]({% link {{ page.version.version }}/selection-queries.md %}) that

-  Has a `GROUP BY` clause.
-  Uses an index that has a `STORING` clause.
-  Where some or all of the columns in the query's `GROUP BY` clause are part of the index's `STORING` clause and are **not** index key columns.

For example:

~~~ sql
SELECT
  cnt, organization, concat(os, '-', version) AS bucket
FROM
  (
    SELECT
      count(1)::FLOAT8 AS cnt, organization, os, version
    FROM
      nodes
    WHERE
      lastseen > ($1)::TIMESTAMPTZ AND lastseen <= ($2)::TIMESTAMPTZ
    GROUP BY
      organization, os, version
  )

Arguments:
  $1: '2021-07-27 13:22:09.000058Z'
  $2: '2021-10-25 13:22:09.000058Z'
~~~

The columns in the `GROUP BY` clause are `organization`, `os`, and `version`.

The query plan shows that it is using index `nodes_lastseen_organization_storing`:

~~~

                     distribution         full
                     vectorized           true
render                                                                                                      (cnt float, organization varchar, bucket string)
 │                   estimated row count  3760
 │                   render 0             (concat((os)[string], ('-')[string], (version)[string]))[string]
 │                   render 1             ((count_rows)[int]::FLOAT8)[float]
 │                   render 2             (organization)[varchar]
 └── group                                                                                                  (organization varchar, os string, version string, count_rows int)
      │              estimated row count  3760
      │              aggregate 0          count_rows()
      │              group by             organization, os, version
      └── project                                                                                           (organization varchar, os string, version string)
           └── scan                                                                                         (organization varchar, lastseen timestamptz, os string, version string)
                     estimated row count  2330245
                     table                nodes@nodes_lastseen_organization_storing
                     spans                /2021-07-27T13:22:09.000059Z-/2021-10-25T13:22:09.000058001Z
~~~

Here is the table schema for the example query:

~~~ sql
CREATE TABLE public.nodes (
	id VARCHAR(60) NOT NULL,
	ampuuid UUID NULL,
	organization VARCHAR(60) NULL,
	created TIMESTAMPTZ NULL DEFAULT now():::TIMESTAMPTZ,
	disabled BOOL NOT NULL DEFAULT false,
	lastseen TIMESTAMPTZ NULL DEFAULT now():::TIMESTAMPTZ,
	os STRING NOT NULL,
	arch STRING NOT NULL,
	autotags JSONB NULL,
	version STRING NOT NULL DEFAULT '':::STRING,
	clone BOOL NOT NULL DEFAULT false,
	cloneof VARCHAR(60) NOT NULL DEFAULT '':::STRING,
	endpoint_type STRING NOT NULL DEFAULT 'amp':::STRING,
	ip INET NULL,
	osqueryversion STRING NOT NULL DEFAULT '':::STRING,
	CONSTRAINT "primary" PRIMARY KEY (id ASC),
	INDEX nodes_organization_ampuuid (organization ASC, ampuuid ASC),
	INDEX nodes_created_asc_organization (created ASC, organization ASC),
	INDEX nodes_created_desc_organization (created DESC, organization ASC),
	INDEX nodes_organization_os_version (organization ASC, os ASC, version ASC),
	INDEX nodes_organization_version (organization ASC, version ASC),
	INDEX nodes_lastseen_organization_storing (lastseen ASC, organization ASC) STORING (os, version),
	FAMILY "primary" (id, ampuuid, organization, created, disabled, lastseen, os, arch, autotags, version, clone, cloneof, endpoint_type, ip, osqueryversion)
);

~~~

The `nodes_lastseen_organization_storing` index has the `GROUP BY` column `organization` as an index key column. However, the `STORING` clause includes the `GROUP BY` columns `os` and `version`.

#### Solution

Create a new secondary index that has all of the `GROUP BY` columns as key columns in the index.

~~~ sql
CREATE INDEX "nodes_lastseen_organization_os_version" (lastseen, organization, os, version)
~~~

This index allows CockroachDB to perform a streaming `GROUP BY` rather than a hash `GROUP BY`. After you make this change, you should notice an improvement in the latency of the example query.

### `INSERT` and `UPDATE` statements are slow

Use the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) to identify the slow [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}).

Refer to the following pages to improve `INSERT`  and `UPDATE` performance:

-   [Multi-row DML]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#dml-best-practices)

-   [Bulk-Insert best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#bulk-insert-best-practices)

### Cancel running queries

See [Cancel long-running queries]({% link {{ page.version.version }}/manage-long-running-queries.md %}#cancel-long-running-queries).

### Low throughput

Throughput is affected by the disk I/O, CPU usage, and network latency. Use the DB Console to check the following metrics:

- Disk I/O: [Disk IOPS in progress]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#disk-ops-in-progress)

- CPU usage: [CPU percent]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent)

- Network latency: [Network Latency]({% link {{ page.version.version }}/ui-network-latency-page.md %})

### Query runs out of memory

If your query returns the error code `SQLSTATE: 53200` with the message `ERROR: root: memory budget exceeded`, follow the guidelines in [memory budget exceeded]({% link {{ page.version.version }}/common-errors.md %}#memory-budget-exceeded).

## Transaction retry errors

Messages with the error code `40001` and the string `restart transaction` are known as [*transaction retry errors*]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}). These indicate that a transaction failed due to [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#understanding-and-avoiding-transaction-contention) with another concurrent or recent transaction attempting to write to the same data. The transaction needs to be retried by the client.

{% include {{ page.version.version }}/performance/transaction-retry-error-actions.md %}

## Unsupported SQL features

CockroachDB has support for [most SQL features]({% link {{ page.version.version }}/sql-feature-support.md %}).

Additionally, CockroachDB supports [the PostgreSQL wire protocol and the majority of its syntax]({% link {{ page.version.version }}/postgresql-compatibility.md %}). This means that existing applications can often be migrated to CockroachDB without changing application code.

However, you may encounter features of SQL or the PostgreSQL dialect that are not supported by CockroachDB. For example, the following PostgreSQL features are not supported:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

For more information about the differences between CockroachDB and PostgreSQL feature support, see [PostgreSQL Compatibility]({% link {{ page.version.version }}/postgresql-compatibility.md %}).

For more information about the SQL standard features supported by CockroachDB, see [SQL Feature Support]({% link {{ page.version.version }}/sql-feature-support.md %}).

## Node issues

### Single hot node

A [*hot node*]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-node) is one that has much higher resource usage than other nodes. To determine if you have a hot node in your cluster, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and check the following:

- Click **Metrics** and navigate to the following graphs. Hover over each graph to see the per-node values of the metrics. If one of the nodes has a higher value, you have a hot node in your cluster.
  - [**Replication** dashboard]({% link {{ page.version.version }}/ui-replication-dashboard.md %}#other-graphs) > **Average Queries per Store** graph
  - [**Overview** dashboard]({% link {{ page.version.version }}/ui-overview-dashboard.md %}#service-latency-sql-99th-percentile) > **Service Latency** graph
  - [**Hardware** dashboard]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent) > **CPU Percent** graph
  - [**SQL** dashboard]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#connection-latency-99th-percentile) > **SQL Connections** graph
  - [**Hardware** dashboard]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#disk-ops-in-progress) > **Disk IOPS in Progress** graph
- Open the [**Hot Ranges** page]({% link {{ page.version.version }}/ui-hot-ranges-page.md %}) and check for ranges with significantly higher QPS on any nodes.

#### Solution

- If you have a small table that fits into one range, then only one of the nodes will be used. This is expected behavior. However, you can [split your range]({% link {{ page.version.version }}/alter-table.md %}#split-at) to distribute the table across multiple nodes.

- If the SQL Connections graph shows that one node has a higher number of SQL connections and other nodes have zero connections, check if your app is set to talk to only one node.

- Check load balancer settings.

- Check for [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).

- If you have a monotonically increasing index column or primary Key, then your index or primary key should be redesigned. For more information, see [Unique ID best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#unique-id-best-practices).

- If a range has significantly higher QPS on a node, it may indicate a hotspot that needs to be addressed. For more information, refer to [Hot range]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-range).

- If you have a monotonically increasing index column or primary key, then your index or primary key should be redesigned. See [Unique ID best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#unique-id-best-practices) for more information.

### Per-node queries per second (QPS) is high

If a cluster is not idle, it is useful to monitor the per-node queries per second. CockroachDB will automatically distribute load throughout the cluster. If one or more nodes is not performing any queries there is likely something to investigate. See `exec_success` and `exec_errors` which track operations at the KV layer and `sql_{select,insert,update,delete}_count` which track operations at the SQL layer.

### Increasing number of nodes does not improve performance

See [Why would increasing the number of nodes not result in more operations per second?]({% link {{ page.version.version }}/operational-faqs.md %}#why-would-increasing-the-number-of-nodes-not-result-in-more-operations-per-second)

### `bad connection` and `closed` responses

A response of `bad connection` or `closed` normally indicates that the node to which you are connected has terminated. You can check this by connecting to another node in the cluster and running [`cockroach node status`]({% link {{ page.version.version }}/cockroach-node.md %}#show-the-status-of-all-nodes).

Once you find the node, you can check its [logs]({% link {{ page.version.version }}/logging.md %}) (stored in `cockroach-data/logs` by [default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration)).

Because this kind of behavior is unexpected, you should [file an issue]({% link {{ page.version.version }}/file-an-issue.md %}).

### Log queries executed by a specific node

If you are testing CockroachDB locally and want to log queries executed by a specific node, you can either pass a CLI flag at node startup or execute a SQL function on a running node.

Using the CLI to start a new node, use the `--vmodule` flag with the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command. For example, to start a single node locally and log all client-generated SQL queries it executes, run:

~~~ shell
$ cockroach start --insecure --listen-addr=localhost --vmodule=exec_log=2 --join=<join addresses>
~~~

{{site.data.alerts.callout_success}}
To log CockroachDB-generated SQL queries as well, use `--vmodule=exec_log=3`.
{{site.data.alerts.end}}

From the SQL prompt on a running node, execute the `crdb_internal.set_vmodule()` [function]({% link {{ page.version.version }}/functions-and-operators.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT crdb_internal.set_vmodule('exec_log=2');
~~~

This will result in the following output:

~~~
  crdb_internal.set_vmodule
+---------------------------+
                          0
(1 row)
~~~

Once the logging is enabled, all client-generated SQL queries executed by the node will be written to the `DEV` [logging channel]({% link {{ page.version.version }}/logging.md %}#dev), which outputs by [default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration) to the primary `cockroach` log file in `/cockroach-data/logs`. Use the symlink `cockroach.log` to open the most recent log.

~~~
I180402 19:12:28.112957 394661 sql/exec_log.go:173  [n1,client=127.0.0.1:50155,user=root] exec "psql" {} "SELECT version()" {} 0.795 1 ""
~~~

## Configure CockroachDB to send traces to a third-party trace collector

You can configure CockroachDB to send traces to a third-party collector. CockroachDB supports [Jaeger](https://www.jaegertracing.io/), [Zipkin](https://zipkin.io/), and any trace collector that can ingest traces over the standard OTLP protocol. Enabling tracing also activates all the log messages, at all verbosity levels, as traces include the log messages printed in the respective trace context.

{{site.data.alerts.callout_danger}}
Enabling full tracing is expensive both in terms of CPU usage and memory footprint, and is not suitable for high throughput production environments.
{{site.data.alerts.end}}

You can configure the CockroachDB tracer to route to the OpenTelemetry tracer, with OpenTelemetry being supported by all observability tools. In particular, you can configure CockroachDB to output traces to:

- A collector that uses the OpenTelemetry Protocol (OTLP).
- The OpenTelemetry (OTEL) collector, which can in turn route them to other tools. The OTEL collector is a canonical collector, using the OTLP protocol, that can buffer traces and perform some processing on them before exporting them to Jaeger, Zipkin, and other OTLP tools.
- Jaeger or Zipkin using their native protocols. This is implemented by using the Jaeger and Zipkin dedicated "exporters" from the OTEL SDK.

The following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) are supported:

<table>
<thead><tr><th>Setting</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>trace.opentelemetry.collector</code></td><td>string</td><td><code></code></td><td>The address of an OpenTelemetry trace collector to receive traces using the OTEL gRPC protocol, as <code>&lt;host&gt;:&lt;port&gt;</code>. If no port is specified, <code>4317</code> is used.</td></tr>
<tr><td><code>trace.jaeger.agent</code></td><td>string</td><td><code></code></td><td>The address of a Jaeger agent to receive traces using the Jaeger UDP Thrift protocol, as <code>&lt;host&gt;:&lt;port&gt;</code>. If no port is specified, <code>6381</code> is used.</td></tr>
<tr><td><code>trace.zipkin.collector</code></td><td>string</td><td><code></code></td><td>The address of a Zipkin instance to receive traces, as <code>&lt;host&gt;:&lt;port&gt;</code>. If no port is specified, <code>9411</code> is used.</td></tr>
</tbody>
</table>

## Troubleshoot SQL client application problems

<a name="scram-client-troubleshooting"></a>

### High client CPU load, connection pool exhaustion, or increased connection latency when SCRAM Password-based Authentication is enabled

+ [Overview](#overview)
+ [Mitigation steps while keeping SCRAM enabled](#mitigation-steps-while-keeping-scram-enabled)
+ [Downgrade from SCRAM authentication](#downgrade-from-scram-authentication)

#### Overview

When [SASL/SCRAM-SHA-256 Secure Password-based Authentication]({% link {{ page.version.version }}/security-reference/scram-authentication.md %}) (SCRAM Authentication) is enabled on a cluster, some additional CPU load is incurred on client applications, which are responsible for handling SCRAM hashing. It's important to plan for this additional CPU load to avoid performance degradation, CPU starvation, and [connection pool]({% link {{ page.version.version }}/connection-pooling.md %}) exhaustion on the client. For example, the following set of circumstances can exhaust the client application's resources:

1. SCRAM Authentication is enabled on the cluster (the `server.user_login.password_encryption` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-user-login-password-encryption) is set to `scram-sha-256`).
1. The client driver's [connection pool]({% link {{ page.version.version }}/connection-pooling.md %}) has no defined maximum number of connections, or is configured to close idle connections eagerly.
1. The client application issues [transactions]({% link {{ page.version.version }}/transactions.md %}) concurrently.

In this situation, each new connection uses more CPU on the client application server than connecting to a cluster without SCRAM Authentication enabled. Because of this additional CPU load, each concurrent transaction is slower, and a larger quantity of concurrent transactions can accumulate, in conjunction with a larger number of concurrent connections. In this situation, it can be difficult for the client application server to recover.

Some applications may also see increased connection latency. This can happen because SCRAM incurs additional round trips during authentication which can add latency to the initial connection.

For more information about how SCRAM works, see [SASL/SCRAM-SHA-256 Secure Password-based Authentication]({% link {{ page.version.version }}/security-reference/scram-authentication.md %}).

#### Mitigation steps while keeping SCRAM enabled

To mitigate against this situation while keeping SCRAM authentication enabled, Cockroach Labs recommends that you:

{% include_cached {{page.version.version}}/scram-authentication-recommendations.md %}

If the above steps don't work, you can try lowering the default hashing cost and reapplying the password as described below.

##### Lower default hashing cost and reapply the password

To decrease the CPU usage of SCRAM password hashing while keeping SCRAM enabled:

1. Set the [`server.user_login.password_hashes.default_cost.scram_sha_256` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-user-login-password-hashes-default-cost-scram-sha-256) to `4096`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.user_login.password_hashes.default_cost.scram_sha_256 = 4096;
    ~~~

1. Make sure the [`server.user_login.rehash_scram_stored_passwords_on_cost_change.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) is set to `true` (the default).

{{site.data.alerts.callout_success}}
When lowering the default hashing cost, we recommend that you use strong, complex passwords for [SQL users]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users).
{{site.data.alerts.end}}

If you are still seeing higher connection latencies than before, you can [downgrade from SCRAM authentication](#downgrade-from-scram-authentication).

#### Downgrade from SCRAM authentication

As an alternative to the [mitigation steps listed above](#mitigation-steps-while-keeping-scram-enabled), you can downgrade from SCRAM authentication to bcrypt as follows:

1. Set the [`server.user_login.password_encryption` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-user-login-password-encryption) to `crdb-bcrypt`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.user_login.password_encryption = 'crdb-bcrypt';
    ~~~

1. Ensure the [`server.user_login.downgrade_scram_stored_passwords_to_bcrypt.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-user-login-downgrade-scram-stored-passwords-to-bcrypt-enabled) is set to `true`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.user_login.downgrade_scram_stored_passwords_to_bcrypt.enabled = true;
    ~~~

{{site.data.alerts.callout_info}}
The [`server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-user-login-upgrade-bcrypt-stored-passwords-to-scram-enabled) can be left at its default value of `true`.
{{site.data.alerts.end}}


## Something else?

Try searching the rest of our docs for answers:

- [Connect to a CockroachDB Cluster]({% link {{ page.version.version }}/connect-to-the-database.md %})
- [Run Multi-Statement Transactions]({% link {{ page.version.version }}/run-multi-statement-transactions.md %})
- [Optimize Statement Performance Overview][fast]
- [Common Errors and Solutions]({% link {{ page.version.version }}/common-errors.md %})
- [Transactions]({% link {{ page.version.version }}/transactions.md %})
- [Client-side transaction retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling)
- [SQL Layer][sql]

Or try using our other [support resources]({% link {{ page.version.version }}/support-resources.md %}), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)

{% comment %} Reference Links {% endcomment %}

[sql]: architecture/sql-layer.html
[fast]: {% link {{ page.version.version }}/make-queries-fast.md %}
