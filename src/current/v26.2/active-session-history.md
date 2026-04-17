---
title: Active Session History
summary: Learn how to use Active Session History (ASH) to troubleshoot SQL performance issues and understand resource usage patterns.
toc: true
docs_area: manage
preview: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Active Session History (ASH) is a time-series sampling-based observability feature that helps you troubleshoot workload performance issues by capturing what work was actively executing on your cluster at specific points in time. Unlike traditional [statement statistics]({% link {{ page.version.version }}/ui-statements-page.md %}) that aggregate data over time, ASH provides point-in-time snapshots of active execution, making it easier to diagnose transient performance problems and understand resource usage patterns.

ASH is accessible via CockroachDB SQL and is disabled by default. To enable ASH, refer to [Enable Active Session History](#enable-active-session-history).

## How ASH sampling works

ASH captures point-in-time snapshots of each node's active work by sampling cluster activity at regular intervals (determined by the [`obs.ash.sample_interval` cluster setting](#configuration)). At each sample point, ASH examines all goroutines that are actively executing or waiting, and it records what each one is doing. Each sample captures details like the workload that the goroutine belongs to (statement fingerprint, job ID, or system task) and the activity the goroutine is occupied with. These samples fill an in-memory circular ring buffer, the size of which is determined by the [`obs.ash.buffer_size` cluster setting](#configuration). When the buffer fills, the oldest samples are overwritten. Samples do not persist on disk. They are lost on node restart.

A user can query the ASH data for the specific node to which their SQL shell is connected (the gateway node) or across the whole cluster.

Because ASH is sampling-based rather than event-based, the sample count for a particular activity is proportional to how much time was spent on that activity. For example, if a query appears in 45 out of 60 sample points over one minute, it was actively consuming resources for approximately 45 seconds of that minute. This approach provides an accurate picture of resource usage patterns over time, but it means that short-lived operations completed between sampling points may not be captured. To troubleshoot very brief operations, you may need to reduce the `obs.ash.sample_interval` cluster setting, or use [statement diagnostics](#use-ash-alongside-other-monitoring-tools). However, use caution when reducing the sampling interval, as this will cause the buffer to fill up quickly.

ASH does not provide exact resource accounting per query or job, nor does it provide the exact timing of individual executions. Its sampling-based approach instead provides a statistically reliable view of the system at a given time, which can help with troubleshooting.

These point-in-time samples can be used to:

- **Root-cause slow queries**: Understand exactly what a query was doing at specific points in time (e.g., waiting for locks, performing I/O, consuming CPU).
- **Identify bottlenecks**: Determine which resources (CPU, locks, I/O, network, admission control) are constraining workload performance.
- **Troubleshoot transient issues**: Diagnose performance problems that don't show up in aggregated statistics because they're intermittent or short-lived.
- **Analyze resource usage patterns**: Understand how different workloads (user queries, background jobs, system operations) consume cluster resources.
- **Compare performance across time**: Analyze how workload behavior changes during different time periods (e.g., peak vs. off-peak hours).

### Use ASH alongside other monitoring tools

ASH complements CockroachDB's existing observability tools. Each tool serves a different purpose:

| Tool | What it's best for |
|------|-------------------|
| [Prometheus metrics]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) | Real-time alerts on resource usage, latency, or errors. Monitoring overall cluster health and capacity trends over time. ASH is retrospective and sampling-based, not designed for alerting, and its in-memory storage means samples are lost on restart. |
| [Statements Page]({% link {{ page.version.version }}/ui-statements-page.md %}) | Aggregated statistics about query performance over hours, days, or weeks. Identifying slow queries based on latency percentiles, tracking performance changes after schema updates, and understanding total resource consumption across all executions. ASH shows what was actively running at specific moments, but not the aggregated trends needed for performance baselines. |
| [Insights Page]({% link {{ page.version.version }}/ui-insights-page.md %}) | Automatically flagging queries with performance problems such as high contention, failed executions, or suboptimal plans. Provides optimization recommendations without requiring diagnostic queries. ASH helps investigate why a problem occurred at a specific time, while Insights tells you which queries are problematic. |
| [Statement diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics) and [execution logs]({% link {{ page.version.version }}/logging-use-cases.md %}#sql_exec) | Complete traces of single query executions, including all operators, data flow, and exact execution plans with timings. ASH's sampling may miss short-lived operations and doesn't provide operator-level detail. |

ASH can often be used with these other tools to help troubleshoot issues. For example, Prometheus metrics might alert you to a problem (such as a CPU spike at 2:15 PM). ASH shows which queries and jobs were actively running during that spike and which took a disproportionate amount of time to run. The Statements Page then provides aggregated performance data for those queries over a longer period of time, and statement diagnostics give detailed execution plans for deeper analysis.

## Configuration

The following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) configure ASH behavior:

| Cluster Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `obs.ash.enabled` | bool | `false` | Enables ASH sampling on the cluster. |
| `obs.ash.sample_interval` | duration | `1s` | Time interval between samples. |
| `obs.ash.buffer_size` | int | `1,000,000` | Max samples retained in memory. At ~200 bytes/sample, the default uses ~200MB per node. Changes take effect immediately. |
| `obs.ash.log_interval` | duration | `10m` | How often a top-N workload summary is emitted to the OPS log channel. Also used as the lookback window for ASH reports written by the environment sampler profiler. |
| `obs.ash.log_top_n` | int | `10` | Max entries in each periodic log summary. |
| `obs.ash.report.total_dump_size_limit` | byte size | `32MiB` | Garbage collection limit for ASH report files on disk. |
| `obs.ash.response_limit` | int | `10,000` | Max number of samples that each node will return to the gateway node when a user queries the cluster-wide view. This helps ensure that the gateway node does not run out of memory. |

## ASH table reference

ASH data is accessible through two views in the [`information_schema`]({% link {{ page.version.version }}/information-schema.md %}) system catalog:

- [`information_schema.crdb_node_active_session_history`]({% link {{ page.version.version }}/information-schema.md %}#crdb_node_active_session_history): Includes samples from the gateway node.
- [`information_schema.crdb_cluster_active_session_history`]({% link {{ page.version.version }}/information-schema.md %}#crdb_cluster_active_session_history): Includes samples from all nodes in the cluster. Querying the cluster-wide view may be more resource-intensive for large clusters.

The data for each sample is placed into a row with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `sample_time` | `TIMESTAMPTZ NOT NULL` | When the sample was taken |
| `node_id` | `INT NOT NULL` | Node where the sample was captured |
| `tenant_id` | `INT NOT NULL` | Tenant that owns the work |
| `workload_id` | `STRING` | Identifies the workload (refer to [`workload` columns](#workload-columns)) |
| `workload_type` | `STRING NOT NULL` | Kind of workload (refer to [`workload` columns](#workload-columns)) |
| `app_name` | `STRING` | Application name; only set for SQL statement workloads |
| `work_event_type` | `STRING NOT NULL` | Resource category (refer to [`work_event` columns](#work_event-columns)) |
| `work_event` | `STRING NOT NULL` | Specific activity label (refer to [`work_event` columns](#work_event-columns) |
| `goroutine_id` | `INT NOT NULL` | Go runtime goroutine ID |

### `workload` columns

Each sample is attributed to a workload via the `workload_type` and `workload_id` columns. The encoding of `workload_id` depends on the `workload_type`:

| `workload_type` | What `workload_id` contains |
|------------------|-----------------------------|
| `STATEMENT` | Hex-encoded [statement fingerprint]({% link {{ page.version.version }}/ui-statements-page.md %}#sql-statement-fingerprints) ID |
| `JOB` | Decimal [job ID]({% link {{ page.version.version }}/show-jobs.md %}) |
| `SYSTEM` | One of the following system task names: <br>`LDR`, `RAFT`, `STORELIVENESS`, `RPC_HEARTBEAT`, `NODE_LIVENESS`, `SQL_LIVENESS`, `TIMESERIES`, `RAFT_LOG_TRUNCATION`, `TXN_HEARTBEAT`, `INTENT_RESOLUTION`, `LEASE_ACQUISITION`, `MERGE_QUEUE`, `CIRCUIT_BREAKER_PROBE`, `GC`, `RANGEFEED`, `REPLICATE_QUEUE`, `SPLIT_QUEUE`, `DESCRIPTOR_LEASE` |
| `UNKNOWN` | Unidentified. If you're seeing many unattributed samples for your workload, you may want to [file an issue](  https://github.com/cockroachdb/cockroach/issues/new?template=bug_report.md). |

### `work_event` columns

The `work_event_type` categorizes the resource being consumed or waited on. Types include `CPU`, `IO`, `LOCK`, `NETWORK`, `ADMISSION`, and `OTHER`. The `work_event` gives the specific activity.

#### `CPU`

`work_events` whose `work_event_type` is `CPU` represent active computation:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `Optimize` | [SQL optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) | Cost-based query optimization |
| `ReplicaSend` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Replica-level batch evaluation |
| `DistSenderLocal` | [KV client]({% link {{ page.version.version }}/architecture/distribution-layer.md %}) | DistSender processing a local batch |
| `BatchFlowCoordinator` | [DistSQL (columnar)]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Columnar flow coordination |
| `ColExecSync` | [DistSQL (columnar)]({% link {{ page.version.version }}/vectorized-execution.md %}) | Synchronous columnar execution |
| *(processor name)* | [DistSQL processors]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Dynamic — each DistSQL processor registers with its own name (e.g. `hashJoiner`, `tablereader`) |

#### `IO`

`work_events` whose `work_event_type` is `IO` represent storage I/O:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `KVEval` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Batch evaluation in the storage layer |

#### `LOCK`

`work_events` whose `work_event_type` is `LOCK` represent lock and latch contention:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `LockWait` | [Concurrency manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#concurrency-control) | Waiting to acquire a key-level lock |
| `LatchWait` | [Span latch manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#latch-manager) | Waiting to acquire a span latch |
| `TxnPushWait` | [Concurrency manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#concurrency-control) | Waiting for a conflicting transaction to be pushed |
| `TxnQueryWait` | [Concurrency manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#concurrency-control) | Waiting for the status of a conflicting transaction |

#### `NETWORK`

`work_events` whose `work_event_type` is `NETWORK` represent remote RPCs:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `DistSenderRemote` | [KV client]({% link {{ page.version.version }}/architecture/distribution-layer.md %}) | DistSender waiting on a remote node RPC |
| `InboxRecv` | [DistSQL]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Receiving data from a remote DistSQL flow |
| `OutboxSend` | [DistSQL]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Sending data to a remote DistSQL flow |

#### `ADMISSION`

`work_events` whose `work_event_type` is `ADMISSION` represent admission control queues:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `kv-regular-cpu-queue` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | KV regular work waiting for CPU admission |
| `kv-elastic-store-queue` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | KV elastic work waiting for store admission |
| `kv-regular-store-queue` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | KV regular work waiting for store admission |
| `sql-kv-response` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | SQL layer waiting for KV response admission |
| `sql-sql-response` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | SQL layer waiting for DistSQL response admission |
| `ReplicationFlowControl` | [Replication admission]({% link {{ page.version.version }}/admission-control.md %}#replication-admission-control) | Waiting for replication flow control token |

#### `OTHER`

`work_events` whose `work_event_type` is `OTHER` represent miscellaneous wait points:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `CommitWaitSleep` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Transaction commit-wait for linearizability |
| `RaftProposalWait` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Waiting for a Raft proposal to be applied |
| `Backpressure` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Range backpressure from splits/merges |
| `LeaseAcquisition` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Waiting to acquire a range lease |
| `TenantRateLimit` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Tenant rate limiter throttling |

## ASH Metrics

The following [metrics]({% link {{ page.version.version }}/metrics.md %}) monitor ASH behavior:

| Metric | Type | Description |
|--------|------|-------------|
| `ash.work_states.active` | Gauge | Number of goroutines with an active work state |
| `ash.sampler.take_sample.latency` | Histogram | Latency of each sample collection tick |
| `ash.samples.collected` | Counter | Total ASH samples collected |

## Debug zip integration

When the environment sampler triggers [goroutine dumps]({% link {{ page.version.version }}/automatic-go-execution-tracer.md %}) or [CPU profiles]({% link {{ page.version.version }}/automatic-cpu-profiler.md %}), ASH writes aggregated report files (`.txt` and `.json`) alongside them. These reports are included in [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) output. The lookback window for these reports is controlled by the [`obs.ash.log_interval` cluster setting](#configuration).

## Common use cases and examples

ASH is accessed through the built-in CockroachDB SQL shell. Run [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) to open the shell. CockroachDB Cloud deployments can also use the [SQL Shell page]({% link cockroachcloud/sql-shell.md %}) on the Console.

### Enable Active Session History

To enable ASH on your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING obs.ash.enabled = true;
~~~

Enabling ASH begins collecting samples immediately. The in-memory buffer will fill up over time based on workload activity and the configured [ASH cluster settings](#configuration).

### View a node's work event data from the past minute

**Scenario**: A node is experiencing high resource utilization, but it's unclear which subsystem (CPU, I/O, locks, network) is consuming resources and what specific operations are involved.

You can query the node-level ASH view to see what resources the node has been consuming:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT work_event_type, work_event, count(*) AS sample_count
FROM information_schema.crdb_node_active_session_history
WHERE sample_time > now() - INTERVAL '1 minute'
GROUP BY work_event_type, work_event
ORDER BY sample_count DESC;
~~~

The query returns the count of samples for each work event type and specific event:

~~~
  work_event_type |      work_event        | sample_count
------------------+------------------------+--------------
  NETWORK         | DistSenderRemote       |           42
  OTHER           | RaftProposalWait       |           38
  CPU             | upsert                 |           19
  ADMISSION       | ReplicationFlowControl |           12
  LOCK            | LockWait               |            8
  IO              | KVEval                 |            5
  CPU             | ReplicaSend            |            3
  NETWORK         | InboxRecv              |            2
(8 rows)
~~~

The results show this node's activity is dominated by network waits (`DistSenderRemote`) and Raft consensus waits (`RaftProposalWait`), which is typical for write-heavy workloads that must replicate data across nodes. The upsert `CPU` samples show time spent executing upsert statements, while `ReplicationFlowControl` admission samples indicate that the system is throttling writes due to replication backpressure. The `LockWait` samples indicate some transaction-level lock contention on hot keys. To identify which specific workloads are causing these waits, add `workload_type`, `workload_id`, and `app_name` to the query and group by them.

### View cluster-wide workload data from the past 10 minutes

**Scenario**: Overall cluster resource consumption is high, but it's unclear which workloads (user queries, background jobs, or system tasks) are responsible for the activity.

You can query the cluster-wide ASH view to identify the top workloads consuming resources across all nodes:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT workload_type, workload_id, app_name, count(*) AS sample_count
FROM information_schema.crdb_cluster_active_session_history
WHERE sample_time > now() - INTERVAL '10 minutes'
GROUP BY workload_type, workload_id, app_name
ORDER BY sample_count DESC
LIMIT 10;
~~~

The query returns the top 10 workloads by sample count:

~~~
  workload_type |     workload_id      |        app_name         | sample_count
----------------+----------------------+-------------------------+--------------
  STATEMENT     | 9bef06d795045524     | kv                      |         2603
  SYSTEM        | INTENT_RESOLUTION    |                         |         1383
  JOB           | 1028061800150958081  |                         |          925
  SYSTEM        | TXN_HEARTBEAT        |                         |          166
  SYSTEM        | GC                   |                         |           91
  STATEMENT     | 61a0effae6169169     | $ internal-create-stats |           23
  SYSTEM        | LEASE_ACQUISITION    |                         |           17
  SYSTEM        | NODE_LIVENESS        |                         |           12
  STATEMENT     | ad360b79112da7e3     | myapp                   |            9
  SYSTEM        | TIMESERIES           |                         |            7
(10 rows)
~~~

The results show that a single SQL statement fingerprint (`9bef06d795045524`) from the `kv` application is the largest consumer of cluster resources. System tasks like `INTENT_RESOLUTION` (async cleanup of transaction intents) and `TXN_HEARTBEAT` are also significant. To investigate the statement, use the `workload_id` to find the statement on the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}). To investigate the job, use its `workload_id` on the [Jobs page]({% link {{ page.version.version }}/ui-jobs-page.md %}).

### Find recent lock contention hotspots

**Scenario**: Elevated p99 latency and increased transaction retries indicate contention, but it's unclear which specific workloads are experiencing lock waits and what type of contention is occurring.

You can filter ASH samples to show only lock-related wait events:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT workload_id, work_event, app_name, count(*) AS sample_count
FROM information_schema.crdb_node_active_session_history
WHERE work_event_type = 'LOCK'
  AND sample_time > now() - INTERVAL '5 minutes'
GROUP BY workload_id, work_event, app_name
ORDER BY sample_count DESC;
~~~

The query shows which workloads experienced lock contention and what type of lock events they encountered:

~~~
    workload_id    | work_event |                  app_name                   | sample_count
-------------------+------------+---------------------------------------------+---------------
  3be3baac97a1c623 | LatchWait  | $ internal-write-job-progress-history-prune |            1
(1 row)
~~~

The results identify the statement fingerprint experiencing latch waits. Use the `workload_id` to locate the query on the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) and examine its execution plan and contention time. Review the [Insights page]({% link {{ page.version.version }}/ui-insights-page.md %}) for contention insights on this statement. If multiple workloads show `LockWait` events, investigate whether they're accessing the same tables or rows by examining their query patterns. For detailed contention analysis, see [Monitor and Analyze Transaction Contention]({% link {{ page.version.version }}/monitor-and-analyze-transaction-contention.md %}).

### Get details about what a specific job is spending time on

**Scenario**: A background job (such as a backup, schema change, or import) is running longer than expected, but it's unclear whether the job is consuming CPU, waiting on I/O, or blocked by other resources.

You can filter by workload type and job ID to understand where the job is spending its time:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT work_event_type, work_event, count(*) AS sample_count
FROM information_schema.crdb_node_active_session_history
WHERE workload_type = 'JOB'
  AND workload_id = '12345'
  AND sample_time > now() - INTERVAL '30 minutes'
GROUP BY work_event_type, work_event
ORDER BY sample_count DESC;
~~~

The query breaks down the job's resource consumption by work event type and specific activity:

~~~
  work_event_type |     work_event      | sample_count
  -----------------+---------------------+--------------
  CPU              | backupDataProcessor |           10
  CPU              | ReplicaSend         |           10
(3 rows)
~~~

The results show the job spent most of its time on active computation. The remaining samples show the job waiting for locks (`LockWait`). This breakdown helps identify that the backup job is primarily CPU-bound rather than I/O or lock-constrained. To find the job ID for a running job, query the [Jobs page]({% link {{ page.version.version }}/ui-jobs-page.md %}) or use `SELECT job_id, description, status FROM [SHOW JOBS]`.

## Known limitations

{% include {{page.version.version}}/known-limitations/active-session-history.md %}

## See also

- [Troubleshoot SQL Statements]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
- [Statements Page]({% link {{ page.version.version }}/ui-statements-page.md %})
- [Insights Page]({% link {{ page.version.version }}/ui-insights-page.md %})
- [Monitor and Analyze Transaction Contention]({% link {{ page.version.version }}/monitor-and-analyze-transaction-contention.md %})
- [Performance Tuning Recipes]({% link {{ page.version.version }}/performance-recipes.md %})
- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})
