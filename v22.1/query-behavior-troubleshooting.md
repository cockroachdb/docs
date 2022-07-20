---
title: Troubleshoot Statement Behavior
summary: Learn how to troubleshoot issues with specific SQL statements with CockroachDB
toc: true
docs_area: manage
---

If a [SQL statement](sql-statements.html) returns an unexpected result or takes longer than expected to process, this page will help you troubleshoot the issue.

{{site.data.alerts.callout_success}}
For a developer-centric overview of optimizing SQL statement performance, see [Optimize Statement Performance Overview](make-queries-fast.html).
{{site.data.alerts.end}}

## Query issues

### Identify slow queries

Use the [slow query log](logging-use-cases.html#sql_perf) or DB Console to detect slow queries in your cluster.

You can identify high-latency SQL statements on the [Statements](ui-statements-page.html) page of the DB Console. You can collect richer diagnostics of a high-latency statement by creating a [diagnostics bundle](ui-statements-page.html#diagnostics) when a statement fingerprint exceeds a certain latency.

You can also check the [service latency graph](ui-sql-dashboard.html#service-latency-sql-99th-percentile) and the [CPU graph](ui-hardware-dashboard.html#cpu-percent) on the SQL and Hardware Dashboards, respectively. If the graphs show latency spikes or CPU usage spikes, these might indicate slow queries in your cluster.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/resolution-untuned-query.md %}
{{site.data.alerts.end}}

### Visualize statement traces in Jaeger

You can look more closely at the behavior of a statement by visualizing a [statement trace](show-trace.html#trace-description) in [Jaeger](https://www.jaegertracing.io/). A statement trace contains messages and timing information from all nodes involved in the execution.

#### Run Jaeger

1. Start Jaeger:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    docker run -d --name jaeger -p 6831:6831/udp -p 16686:16686 jaegertracing/all-in-one:latest
    ~~~
    This runs the latest version of Jaeger, and forwards two ports to the container. `6831` is the trace ingestion port, `16686` is the UI port. By default, Jaeger will store all received traces in memory.


#### Import a trace from a diagnostics bundle into Jaeger

1. Activate [statement diagnostics](ui-statements-page.html#diagnostics) on the DB Console Statements Page or run [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#debug-option) to obtain a diagnostics bundle for the statement.

1. Go to [`http://localhost:16686`](http://localhost:16686).

1. Click **JSON File** in the Jaeger UI and upload `trace-jaeger.json` from the diagnostics bundle. The trace will appear in the list on the right.

    <img src="{{ 'images/v22.1/jaeger-trace-json.png' | relative_url }}" alt="Jaeger Trace Upload JSON" style="border:1px solid #eee;max-width:40%" />

1. Click the trace to view its details. It is visualized as a collection of spans with timestamps. These may include operations executed by different nodes.

    <img src="{{ 'images/v22.1/jaeger-trace-spans.png' | relative_url }}" alt="Jaeger Trace Spans" style="border:1px solid #eee;max-width:100%" />

    The full timeline displays the execution time and [execution phases](architecture/sql-layer.html#sql-parser-planner-executor) for the statement.

1. Click a span to view details for that span and log messages.

    <img src="{{ 'images/v22.1/jaeger-trace-log-messages.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

1. You can troubleshoot [transaction contention](performance-best-practices-overview.html#transaction-contention), for example, by gathering [diagnostics](ui-statements-page.html#diagnostics) on statements with high latency and looking through the log messages in `trace-jaeger.json` for jumps in latency.

    In the following example, the trace shows that there is significant latency between a push attempt on a transaction that is holding a [lock](architecture/transaction-layer.html#writing) (56.85ms) and that transaction being committed (131.37ms).

    <img src="{{ 'images/v22.1/jaeger-trace-transaction-contention.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

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

    <img src="{{ 'images/v22.1/jaeger-cockroachdb.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

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

If you have consistently slow queries in your cluster, use the [Statement Details](ui-statements-page.html#statement-details-page) page to drill down to an individual statement and [collect diagnostics](ui-statements-page.html#diagnostics) for the statement. A diagnostics bundle contains a record of transaction events across nodes for the SQL statement.

You can also use an [`EXPLAIN ANALYZE`](explain-analyze.html) statement, which executes a SQL query and returns a physical query plan with execution statistics. You can use query plans to troubleshoot slow queries by indicating where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc.

Cockroach Labs recommends sending either the diagnostics bundle (preferred) or the `EXPLAIN ANALYZE` output to our [support team](support-resources.html) for analysis.

### Queries are sometimes slow

If the query performance is irregular:

1.  Run [`SHOW TRACE FOR SESSION`](show-trace.html) for the query twice: once when the query is performing as expected and once when the query is slow.

2.  [Contact support](support-resources.html) to help analyze the outputs of the `SHOW TRACE` command.

### `SELECT` statements are slow

The common reasons for a sub-optimal `SELECT` performance are inefficient scans, full scans, and incorrect use of indexes. To improve the performance of `SELECT` statements, refer to the following documents:

-  [Table scan best practices](performance-best-practices-overview.html#table-scan-best-practices)

-  [Indexes best practices](schema-design-indexes.html#best-practices)

### `SELECT` statements with `GROUP BY` columns are slow

Suppose you have a [slow selection query](selection-queries.html) that

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

Use the [Statements page](ui-statements-page.html) to identify the slow [SQL statements](sql-statements.html).

Refer to the following pages to improve `INSERT`  and `UPDATE` performance:

-   [Multi-row DML](performance-best-practices-overview.html#dml-best-practices)

-   [Bulk-Insert best practices](performance-best-practices-overview.html#bulk-insert-best-practices)

### Cancel running queries

See [Cancel long-running queries](manage-long-running-queries.html#cancel-long-running-queries).

### Low throughput

Throughput is affected by the disk I/O, CPU usage, and network latency. Use the DB Console to check the following metrics:

- Disk I/O: [Disk IOPS in progress](ui-hardware-dashboard.html#disk-ops-in-progress)

- CPU usage: [CPU percent](ui-hardware-dashboard.html#cpu-percent)

- Network latency: [Network Latency](ui-network-latency-page.html)

## Node issues

### Single hot node

A *hot node* is one that has much higher resource usage than other nodes. To determine if you have a hot node in your cluster, [access the DB Console](ui-overview.html#db-console-access) and check the following:

- Click **Metrics** and navigate to the following graphs. Hover over each graph to see the per-node values of the metrics. If one of the nodes has a higher value, you have a hot node in your cluster.
  - [**Replication** dashboard](ui-replication-dashboard.html#other-graphs) > **Average Queries per Store** graph
  - [**Overview** dashboard](ui-overview-dashboard.html#service-latency-sql-99th-percentile) > **Service Latency** graph
  - [**Hardware** dashboard](ui-hardware-dashboard.html#cpu-percent) > **CPU Percent** graph
  - [**SQL** dashboard](ui-sql-dashboard.html#connection-latency-99th-percentile) > **SQL Connections** graph
  - [**Hardware** dashboard](ui-hardware-dashboard.html#disk-ops-in-progress) > **Disk IOPS in Progress** graph
- Open the [**Hot Ranges** page](ui-hot-ranges-page.html) and check for ranges with significantly higher QPS on any nodes.

#### Solution

- If you have a small table that fits into one range, then only one of the nodes will be used. This is expected behavior. However, you can [split your range](split-at.html) to distribute the table across multiple nodes.

- If the SQL Connections graph shows that one node has a higher number of SQL connections and other nodes have zero connections, check if your app is set to talk to only one node.

- Check load balancer settings.

- Check for [transaction contention](performance-best-practices-overview.html#transaction-contention).

- If you have a monotonically increasing index column or primary Key, then your index or primary key should be redesigned. For more information, see [Unique ID best practices](performance-best-practices-overview.html#unique-id-best-practices).

- If a range has significantly higher QPS on a node, there may be a hot spot on the range that needs to be reduced. For more information, see [Hot spots](performance-best-practices-overview.html#hot-spots).

- If you have a monotonically increasing index column or primary key, then your index or primary key should be redesigned. See [Unique ID best practices](performance-best-practices-overview.html#unique-id-best-practices) for more information.

### Per-node queries per second (QPS) is high

If a cluster is not idle, it is useful to monitor the per-node queries per second. CockroachDB will automatically distribute load throughout the cluster. If one or more nodes is not performing any queries there is likely something to investigate. See `exec_success` and `exec_errors` which track operations at the KV layer and `sql_{select,insert,update,delete}_count` which track operations at the SQL layer.

### Increasing number of nodes does not improve performance

See [Why would increasing the number of nodes not result in more operations per second?](operational-faqs.html#why-would-increasing-the-number-of-nodes-not-result-in-more-operations-per-second)

### `bad connection` and `closed` responses

A response of `bad connection` or `closed` normally indicates that the node to which you are connected has terminated. You can check this by connecting to another node in the cluster and running [`cockroach node status`](cockroach-node.html#show-the-status-of-all-nodes).

Once you find the node, you can check its [logs](logging.html) (stored in `cockroach-data/logs` by [default](configure-logs.html#default-logging-configuration)).

Because this kind of behavior is unexpected, you should [file an issue](file-an-issue.html).

### Log queries executed by a specific node

If you are testing CockroachDB locally and want to log queries executed by a specific node, you can either pass a CLI flag at node startup or execute a SQL function on a running node.

Using the CLI to start a new node, use the `--vmodule` flag with the [`cockroach start`](cockroach-start.html) command. For example, to start a single node locally and log all client-generated SQL queries it executes, run:

~~~ shell
$ cockroach start --insecure --listen-addr=localhost --vmodule=exec_log=2 --join=<join addresses>
~~~

{{site.data.alerts.callout_success}}
To log CockroachDB-generated SQL queries as well, use `--vmodule=exec_log=3`.
{{site.data.alerts.end}}

From the SQL prompt on a running node, execute the `crdb_internal.set_vmodule()` [function](functions-and-operators.html):

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

Once the logging is enabled, all client-generated SQL queries executed by the node will be written to the `DEV` [logging channel](logging.html#dev), which outputs by [default](configure-logs.html#default-logging-configuration) to the primary `cockroach` log file in `/cockroach-data/logs`. Use the symlink `cockroach.log` to open the most recent log.

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

The following [cluster settings](cluster-settings.html) are supported:

<table>
<thead><tr><th>Setting</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>trace.opentelemetry.collector</code></td><td>string</td><td><code></code></td><td>The address of an OpenTelemetry trace collector to receive traces using the OTEL gRPC protocol, as <code>&lt;host&gt;:&lt;port&gt;</code>. If no port is specified, <code>4317</code> is used.</td></tr>
<tr><td><code>trace.jaeger.agent</code></td><td>string</td><td><code></code></td><td>The address of a Jaeger agent to receive traces using the Jaeger UDP Thrift protocol, as <code>&lt;host&gt;:&lt;port&gt;</code>. If no port is specified, <code>6381</code> is used.</td></tr>
<tr><td><code>trace.zipkin.collector</code></td><td>string</td><td><code></code></td><td>The address of a Zipkin instance to receive traces, as <code>&lt;host&gt;:&lt;port&gt;</code>. If no port is specified, <code>9411</code> is used.</td></tr>
</tbody>
</table>

## Something else?

Try searching the rest of our docs for answers or using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
