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

Active Session History (ASH) is a time-series sampling-based observability feature that helps you troubleshoot SQL performance issues by capturing what work was actively executing on your cluster at specific points in time. Unlike traditional [statement statistics]({% link {{ page.version.version }}/ui-statements-page.md %}) that aggregate data over time, ASH provides point-in-time snapshots of active execution, making it easier to diagnose transient performance problems and understand resource usage patterns.

ASH is accessible via CockroachDB SQL and is disabled by default. To enable ASH, refer to [Enable Active Session History](#enable-active-session-history).

{{site.data.alerts.callout_danger}}
By default, ASH allocates approximately 200MB of memory per node **even when disabled**. To avoid this memory allocation on clusters where you do not plan to use ASH, set the [`obs.ash.buffer_size` cluster setting](#ash-cluster-settings) to `0`.
{{site.data.alerts.end}}

## How ASH sampling works

ASH captures point-in-time snapshots of each node's active work by sampling cluster activity at regular intervals (determined by the [`obs.ash.sample_interval` cluster setting](#ash-cluster-settings)). At each sample point, ASH examines all goroutines that are actively executing or waiting, and it records what each one is doing. Each of these samples is about 200 bytes, and each captures details like the workload that the goroutine belongs to (statement fingerprint, job ID, or system task) and the activity the goroutine is occupied with. These samples fill an in-memory circular ring buffer, the size of which is determined by the [`obs.ash.buffer_size` cluster setting](#ash-cluster-settings). When the buffer fills, the oldest samples are overwritten. Samples do not persist on disk. They are lost on node restart.

Because ASH is sampling-based rather than event-based, the sample count for a particular activity is proportional to how much time was spent on that activity. For example, if a query appears in 45 out of 60 sample points over one minute, it was actively consuming resources for approximately 45 seconds of that minute. This approach provides an accurate picture of resource usage patterns over time, but it means that short-lived operations completed between sampling points may not be captured. To troubleshoot very brief operations, you may need to reduce the `obs.ash.sample_interval` cluster setting.

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

## ASH cluster settings

The following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) control ASH behavior:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `obs.ash.enabled` | bool | `false` | Enables ASH sampling on the cluster. |
| `obs.ash.sample_interval` | duration | `1s` | Time interval between samples. |
| `obs.ash.buffer_size` | int | `1,000,000` | Max samples retained in memory. At ~200 bytes/sample, the default uses ~200MB per node. Changes take effect immediately. |
| `obs.ash.log_interval` | duration | `10m` | How often a top-N workload summary is emitted to the OPS log channel. Also used as the lookback window for ASH reports written by the environment sampler profiler. |
| `obs.ash.log_top_n` | int | `10` | Max entries in each periodic log summary. |
| `obs.ash.report.total_dump_size_limit` | byte size | `32MiB` | Garbage collection limit for ASH report files on disk. |

## ASH table reference

ASH data is accessible through two views in the [`information_schema`]({% link {{ page.version.version }}/information-schema.md %}) system catalog:

- [`information_schema.crdb_node_active_session_history`]({% link {{ page.version.version }}/information-schema.md %}#crdb_node_active_session_history): Includes samples from the local node.
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
| `UNKNOWN` | Unidentified |

### `work_event` columns

The `work_event_type` categorizes the resource being consumed or waited on. Types include `CPU`, `IO`, `LOCK`, `NETWORK`, `ADMISSION`, and `OTHER`. The `work_event` gives the specific activity.

**`CPU`** — active computation:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `Optimize` | [SQL optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) | Cost-based query optimization |
| `ReplicaSend` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Replica-level batch evaluation |
| `DistSenderLocal` | [KV client]({% link {{ page.version.version }}/architecture/distribution-layer.md %}) | DistSender processing a local batch |
| `BatchFlowCoordinator` | [DistSQL (columnar)]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Columnar flow coordination |
| `ColExecSync` | [DistSQL (columnar)]({% link {{ page.version.version }}/vectorized-execution.md %}) | Synchronous columnar execution |
| *(processor name)* | [DistSQL processors]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Dynamic — each DistSQL processor registers with its own name (e.g. `hashJoiner`, `tablereader`) |

**`IO`** — storage I/O:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `KVEval` | [KV server]({% link {{ page.version.version }}/architecture/storage-layer.md %}) | Batch evaluation in the storage layer |

**`LOCK`** — lock and latch contention:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `LockWait` | [Concurrency manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#concurrency-control) | Waiting to acquire a key-level lock |
| `LatchWait` | [Span latch manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#latch-manager) | Waiting to acquire a span latch |
| `TxnPushWait` | [Concurrency manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#concurrency-control) | Waiting for a conflicting transaction to be pushed |
| `TxnQueryWait` | [Concurrency manager]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#concurrency-control) | Waiting for the status of a conflicting transaction |

**`NETWORK`** — remote RPCs:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `DistSenderRemote` | [KV client]({% link {{ page.version.version }}/architecture/distribution-layer.md %}) | DistSender waiting on a remote node RPC |
| `InboxRecv` | [DistSQL]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Receiving data from a remote DistSQL flow |
| `OutboxSend` | [DistSQL]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) | Sending data to a remote DistSQL flow |

**`ADMISSION`** — admission control queues:

| `work_event` | Location | Description |
|--------------|----------|-------------|
| `kv-regular-cpu-queue` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | KV regular work waiting for CPU admission |
| `kv-elastic-store-queue` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | KV elastic work waiting for store admission |
| `kv-regular-store-queue` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | KV regular work waiting for store admission |
| `sql-kv-response` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | SQL layer waiting for KV response admission |
| `sql-sql-response` | [Admission control]({% link {{ page.version.version }}/admission-control.md %}) | SQL layer waiting for DistSQL response admission |
| `ReplicationFlowControl` | [Replication admission]({% link {{ page.version.version }}/admission-control.md %}#replication-admission-control) | Waiting for replication flow control token |

**`OTHER`** — miscellaneous wait points:

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

When the environment sampler triggers goroutine dumps or CPU profiles, ASH writes aggregated report files (`.txt` and `.json`) alongside them. These reports are included in `cockroach debug zip` output. The lookback window for these reports is controlled by the [`obs.ash.log_interval` cluster setting](#ash-cluster-settings).

## Common use cases and examples

### Enable Active Session History

To enable ASH on your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING obs.ash.enabled = true;
~~~

Enabling ASH begins collecting samples immediately. The in-memory buffer will fill up over time based on workload activity and the configured [ASH cluster settings](#ash-cluster-settings).

### View local work event data from the past minute

To see what resources the local node has been consuming, query the node-level ASH view and group by work event type:

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
  work_event_type |    work_event     | sample_count
------------------+-------------------+---------------
  OTHER           | RaftProposalWait  |           14
  CPU             | ReplicaSend       |            3
  IO              | KVEval            |            2
  CPU             | create statistics |            1
  CPU             | flow coordinator  |            1
(5 rows)
~~~

### View cluster-wide workload data from the past 10 minutes

To identify the top workloads consuming resources across the entire cluster, query the cluster-wide ASH view:

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
  workload_type |     workload_id     |                  app_name                   | sample_count
----------------+---------------------+---------------------------------------------+---------------
  STATEMENT     | ad360b79112da7e3    | tpcc                                        |           59
  SYSTEM        | INTENT_RESOLUTION   |                                             |           40
  SYSTEM        | TIMESERIES          |                                             |           26
  UNKNOWN       |                     |                                             |           13
  STATEMENT     | 3be3baac97a1c623    | $ internal-write-job-progress-history-prune |            5
  SYSTEM        | RAFT_LOG_TRUNCATION |                                             |            5
  SYSTEM        | GC                  |                                             |            4
  STATEMENT     | 0351d79a175f5ba7    | tpcc                                        |            4
  STATEMENT     | b8e5459dbf4cc094    | $ internal-create-stats                     |            4
  STATEMENT     | b254ac5884b1eacc    | $ internal-job-update-job                   |            3
(10 rows)
~~~

### Find recent lock contention hotspots

To diagnose lock contention issues, filter ASH samples to show only lock-related wait events:

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

### Get details about what a specific job is spending time on

To understand where a specific background job is spending its time, filter by workload type and job ID:

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
  work_event_type |    work_event     | sample_count
------------------+-------------------+---------------
  CPU             | sample aggregator |            1
(1 row)
~~~

## Limitations

- ASH is not recommended for nodes with 64 or more vCPUs, due to degraded performance on those nodes.
- On Basic and Standard CockroachDB {{ site.data.products.cloud }} clusters, ASH samples only cover work running on the SQL pod. KV-level work (storage I/O, lock waits, replication, etc.) is not visible in ASH samples.
- KV work triggered during COMMIT (for example, intent resolution, Raft proposals deferred from earlier statements in an explicit transaction) is attributed to the last statement's fingerprint, not the statement that originally caused the work.

## See also

- [Troubleshoot SQL Statements]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
- [Statements Page]({% link {{ page.version.version }}/ui-statements-page.md %})
- [Insights Page]({% link {{ page.version.version }}/ui-insights-page.md %})
- [Monitor and Analyze Transaction Contention]({% link {{ page.version.version }}/monitor-and-analyze-transaction-contention.md %})
- [Performance Tuning Recipes]({% link {{ page.version.version }}/performance-recipes.md %})
- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})
