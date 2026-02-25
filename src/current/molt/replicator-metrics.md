---
title: MOLT Replicator Metrics
summary: Learn how to monitor stages of the MOLT Replicator pipeline.
toc: true
docs_area: migrate
---

[MOLT Replicator]({% link molt/molt-replicator.md %}) exposes Prometheus metrics at each stage of the [replication pipeline](#replication-pipeline). When using Replicator to perform [forward replication]({% link molt/molt-replicator.md %}#forward-replication-after-initial-load) or [failback]({% link molt/molt-replicator.md %}#failback-replication), you should monitor the health of each relevant pipeline stage to quickly detect issues. 

This page describes and provides usage guidelines for Replicator metrics, according to the replication source:

- PostgreSQL
- MySQL
- Oracle
- CockroachDB (during [failback]({% link molt/molt-replicator.md %}#failback-replication))

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
    <button class="filter-button" data-scope="cockroachdb">CockroachDB</button>
</div>

## Replication pipeline

[MOLT Replicator]({% link molt/molt-replicator.md %}) replicates data as a pipeline of change events that travel from the source database to the target database where changes are applied. The Replicator pipeline consists of four stages:

- [**Source read**](#source-read): Connects Replicator to the source database and captures changes via logical replication (PostgreSQL, MySQL), LogMiner (Oracle), or [changefeed messages]({% link {{ site.current_cloud_version }}/changefeed-messages.md %}) (CockroachDB).

<section class="filter-content" markdown="1" data-scope="postgres mysql oracle">
- **Staging**: Buffers mutations for ordered processing and crash recovery.
</section>

<section class="filter-content" markdown="1" data-scope="cockroachdb">
- [**Staging**](#staging): Buffers mutations for ordered processing and crash recovery.
</section>

<section class="filter-content" markdown="1" data-scope="postgres oracle cockroachdb">
- [**Core sequencer**](#core-sequencer): Processes staged mutations, maintains ordering guarantees, and coordinates transaction application.
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
- **Core sequencer**: Processes staged mutations, maintains ordering guarantees, and coordinates transaction application.
</section>

- [**Target apply**](#target-apply): Applies mutations to the target database.

## Set up metrics

Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following command exposes metrics on port `30005`:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start \
--targetConn $TARGET \
--stagingConn $STAGING \
--metricsAddr :30005
...
~~~

To collect Replicator metrics, set up [Prometheus](https://prometheus.io/) to scrape the [Replicator metrics endpoint](#metrics-endpoints). To [visualize Replicator metrics](#visualize-metrics), use [Grafana](https://grafana.com/) to create dashboards.

## Metrics endpoints

The following endpoints are available when you [enable Replicator metrics](#set-up-metrics):

|     Endpoint    |                                Description                                 |
|-----------------|----------------------------------------------------------------------------|
| `/_/varz`       | Prometheus metrics endpoint.                                               |
| `/_/diag`       | Structured diagnostic information (JSON).                                  |
| `/_/healthz`    | Health check endpoint.                                                     |
| `/debug/pprof/` | Go pprof handlers for profiling.                                           |

For example, to view the current snapshot of Replicator metrics on port `30005`, open `http://localhost:30005/_/varz` in a browser. To track metrics over time and create visualizations, use Prometheus and Grafana as described in [Set up metrics](#set-up-metrics).

To check Replicator health:

{% include_cached copy-clipboard.html %}
~~~ shell
curl http://localhost:30005/_/healthz
~~~

~~~
OK
~~~

### Visualize metrics

<section class="filter-content" markdown="1" data-scope="postgres mysql cockroachdb">
Use the Replicator Grafana dashboard [bundled with your binary]({% link molt/molt-replicator-installation.md %}) (`replicator_grafana_dashboard.json`) to visualize metrics. The bundled dashboard matches your binary version. Alternatively, you can download the [latest dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json).
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Use the Replicator Grafana dashboards [bundled with your binary]({% link molt/molt-replicator-installation.md %}) to visualize metrics. The general Replicator dashboard (`replicator_grafana_dashboard.json`) displays overall replication metrics, and the Oracle-specific dashboard (`replicator_oracle_grafana_dashboard.json`) displays [Oracle source metrics](#oracle-source). The bundled dashboards match your binary version. Alternatively, you can download the latest dashboards for [Replicator](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) and [Oracle source metrics](https://replicator.cockroachdb.com/replicator_oracle_grafana_dashboard.json).
</section>

## Overall replication metrics

### High-level performance metrics

Monitor the following metrics to track the overall health of the [replication pipeline](#replication-pipeline):

<section class="filter-content" markdown="1" data-scope="postgres mysql">
- <a id="core-source-lag-seconds"></a>`core_source_lag_seconds`
    - Description: Age of the most recently received checkpoint. This represents the time from source commit to `COMMIT` event processing.
    - Interpretation: If consistently increasing, Replicator is falling behind in reading source changes, and cannot keep pace with database changes.
</section>
<section class="filter-content" markdown="1" data-scope="cockroachdb">
- <a id="core-source-lag-seconds"></a>`core_source_lag_seconds`
    - Description: Age of the most recently received checkpoint. This represents the time elapsed since the latest received resolved timestamp.
    - Interpretation: If consistently increasing, Replicator is falling behind in reading source changes, and cannot keep pace with database changes.
</section>
<section class="filter-content" markdown="1" data-scope="postgres mysql cockroachdb">
- <a id="target-apply-mutation-age-seconds"></a>`target_apply_mutation_age_seconds`
    - Description: End-to-end replication lag per mutation from source commit to target apply. Measures the difference between current wall time and the mutation's [MVCC timestamp]({% link {{ site.current_cloud_version }}/architecture/storage-layer.md %}#mvcc).
    - Interpretation: Higher values mean that older mutations are being applied, and indicate end-to-end pipeline delays. Compare across tables to find bottlenecks.
</section>
<section class="filter-content" markdown="1" data-scope="postgres oracle">
- <a id="target-apply-queue-utilization-percent"></a>`target_apply_queue_utilization_percent`
    - Description: Percentage of target apply queue capacity utilization.
	- Interpretation: Values above 90 percent indicate severe backpressure throughout the pipeline, and potential data processing delays. Increase [`--targetApplyQueueSize`]({% link molt/replicator-flags.md %}#target-apply-queue-size) or investigate target database performance.
</section>
<section class="filter-content" markdown="1" data-scope="mysql cockroachdb">
- <a id="target-apply-queue-utilization-percent"></a>`target_apply_queue_utilization_percent`
    - Description: Percentage of target apply queue capacity utilization.
	- Interpretation: Values above 90 percent indicate severe backpressure throughout the pipeline, and potential data processing delays. Investigate target database performance.
</section>

### Replication lag
Monitor the following metrics to track end-to-end replication lag:

<section class="filter-content" markdown="1" data-scope="postgres mysql oracle cockroachdb">
- <a id="source-commit-to-apply-lag-seconds"></a>`source_commit_to_apply_lag_seconds`
	- Description: Time delta between writing a mutation to the source and writing it to the target.
	- Interpretation: High values (often seconds or hundreds of milliseconds) indicate the steady state of replication. This may indicate the duration of a [minimum downtime window]({% link molt/migration-considerations-replication.md %}#permissible-downtime) due to drainage.
</section>


<section class="filter-content" markdown="1" data-scope="postgres mysql cockroachdb">
- <a id="target-apply-transaction-lag-seconds"></a>`target_apply_transaction_lag_seconds`
    - Description: Age of the transaction applied to the target table, measuring time from source commit to target apply.
    - Interpretation: Consistently high values indicate bottlenecks in the pipeline. Compare with `core_source_lag_seconds` to determine if the delay is in source read or target apply.
</section>

<section class="filter-content" markdown="1" data-scope="cockroachdb">
### Progress tracking

Monitor the following metrics to track checkpoint progress:

- <a id="target-applied-timestamp-seconds"></a>`target_applied_timestamp_seconds`
	- Description: Wall time (Unix timestamp) of the most recently applied resolved timestamp.
	- Interpretation: Use to verify continuous progress. Stale values indicate apply stalls.
- <a id="target-pending-timestamp-seconds"></a>`target_pending_timestamp_seconds`
	- Description: Wall time (Unix timestamp) of the most recently received resolved timestamp.
	- Interpretation: A gap between this metric and `target_applied_timestamp_seconds` indicates apply backlog, meaning that the pipeline cannot keep up with incoming changes.
</section>

## Replication pipeline metrics

### Source read

[Source read](#replication-pipeline) metrics track the health of connections to source databases and the volume of incoming changes.

<section class="filter-content" markdown="1" data-scope="cockroachdb">
#### CockroachDB source

- <a id="checkpoint-committed-age-seconds"></a>`checkpoint_committed_age_seconds`
	- Description: Age of the committed checkpoint.
	- Interpretation: Increasing values indicate checkpoint commits are falling behind, which affects crash recovery capability.
- <a id="checkpoint-proposed-age-seconds"></a>`checkpoint_proposed_age_seconds`
	- Description: Age of the proposed checkpoint.
	- Interpretation: A gap with `checkpoint_committed_age_seconds` indicates checkpoint commit lag.
- <a id="checkpoint-commit-duration-seconds"></a>`checkpoint_commit_duration_seconds`
	- Description: Amount of time taken to save the committed checkpoint to the staging database.
	- Interpretation: High values indicate staging database bottlenecks due to write contention or performance issues.
- <a id="checkpoint-proposed-going-backwards-errors-total"></a>`checkpoint_proposed_going_backwards_errors_total`
	- Description: Number of times an error condition occurred where the changefeed was restarted.
	- Interpretation: Indicates source changefeed restart or time regression. Requires immediate investigation of source changefeed stability.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
#### Oracle source

{{site.data.alerts.callout_success}}
To visualize the following metrics, import the Oracle Grafana dashboard [bundled with your binary]({% link molt/molt-replicator-installation.md %}) (`replicator_oracle_grafana_dashboard.json`). The bundled dashboard matches your binary version. Alternatively, you can download the [latest dashboard](https://replicator.cockroachdb.com/replicator_oracle_grafana_dashboard.json).
{{site.data.alerts.end}}

- <a id="oraclelogminer-scn-interval-size"></a>`oraclelogminer_scn_interval_size`
	- Description: Size of the interval from the start SCN to the current Oracle SCN.
	- Interpretation: Values larger than the [`--scnWindowSize`]({% link molt/replicator-flags.md %}#scn-window-size) flag value indicate replication lag, or that replication is idle.
- <a id="oraclelogminer-time-per-window-seconds"></a>`oraclelogminer_time_per_window_seconds`
	- Description: Amount of time taken to fully process an SCN interval.
	- Interpretation: Large values indicate Oracle slowdown, blocked replication loop, or slow processing.
- <a id="oraclelogminer-query-redo-logs-duration-seconds"></a>`oraclelogminer_query_redo_logs_duration_seconds`
	- Description: Amount of time taken to query redo logs from LogMiner.
	- Interpretation: High values indicate Oracle is under load or the SCN interval is too large.
- <a id="oraclelogminer-num-inflight-transactions-in-memory"></a>`oraclelogminer_num_inflight_transactions_in_memory`
	- Description: Current number of in-flight transactions in memory.
	- Interpretation: High counts indicate long-running transactions on source. Monitor for memory usage.
- <a id="oraclelogminer-num-async-checkpoints-in-queue"></a>`oraclelogminer_num_async_checkpoints_in_queue`
	- Description: Checkpoints queued for processing against staging database.
	- Interpretation: Values close to the `--checkpointQueueBufferSize` flag value indicate checkpoint processing cannot keep up with incoming checkpoints.
- <a id="oraclelogminer-upsert-checkpoints-duration"></a>`oraclelogminer_upsert_checkpoints_duration`
	- Description: Amount of time taken to upsert checkpoint batch into staging database.
	- Interpretation: High values indicate the staging database is under heavy load or batch size is too large.
- <a id="oraclelogminer-delete-checkpoints-duration"></a>`oraclelogminer_delete_checkpoints_duration`
	- Description: Amount of time taken to delete old checkpoints from the staging database.
	- Interpretation: High values indicate staging database load or long-running transactions preventing checkpoint deletion.
- <a id="oracle-mutation-total"></a>`mutation_total`
	- Description: Total number of mutations processed, labeled by source and mutation type (insert/update/delete).
    - Interpretation: Use to monitor replication throughput and identify traffic patterns.
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
#### MySQL source

- <a id="mylogical-dial-success-total"></a>`mylogical_dial_success_total`
	- Description: Number of times Replicator successfully started logical replication.
	- Interpretation: Multiple successes may indicate reconnects. Monitor for connection stability.
- <a id="mylogical-dial-failure-total"></a>`mylogical_dial_failure_total`
	- Description: Number of times Replicator failed to start logical replication.
	- Interpretation: Nonzero values indicate connection issues. Check network connectivity and source database health.
- <a id="mysql-mutation-total"></a>`mutation_total`
	- Description: Total number of mutations processed, labeled by source and mutation type (insert/update/delete).
    - Interpretation: Use to monitor replication throughput and identify traffic patterns.
</section>

<section class="filter-content" markdown="1" data-scope="postgres">
#### PostgreSQL source

- <a id="pglogical-dial-success-total"></a>`pglogical_dial_success_total`
	- Description: Number of times Replicator successfully started logical replication (executed `START_REPLICATION` command).
	- Interpretation: Multiple successes may indicate reconnects. Monitor for connection stability.
- <a id="pglogical-dial-failure-total"></a>`pglogical_dial_failure_total`
	- Description: Number of times Replicator failed to start logical replication (failure to execute `START_REPLICATION` command).
	- Interpretation: Nonzero values indicate connection issues. Check network connectivity and source database health.
- <a id="postgres-mutation-total"></a>`mutation_total`
	- Description: Total number of mutations processed, labeled by source and mutation type (insert/update/delete).
    - Interpretation: Use to monitor replication throughput and identify traffic patterns.
</section>

<section class="filter-content" markdown="1" data-scope="cockroachdb">
### Staging

[Staging](#replication-pipeline) metrics track the health of the staging layer where mutations are buffered for ordered processing.

{{site.data.alerts.callout_info}}
For checkpoint terminology, refer to the [MOLT Replicator documentation]({% link molt/molt-replicator.md %}#terminology).
{{site.data.alerts.end}}

- <a id="stage-commit-lag-seconds"></a>`stage_commit_lag_seconds`
	- Description: Time between writing a mutation to source and writing it to staging.
	- Interpretation: High values indicate delays in getting data into the staging layer.
- <a id="stage-mutations-total"></a>`stage_mutations_total`
	- Description: Number of mutations staged for each table.
    - Interpretation: Use to monitor staging throughput per table.
- <a id="stage-duration-seconds"></a>`stage_duration_seconds`
	- Description: Amount of time taken to successfully stage mutations.
	- Interpretation: High values indicate write performance issues on the staging database.
</section>

<section class="filter-content" markdown="1" data-scope="postgres oracle cockroachdb">
### Core sequencer

[Core sequencer](#replication-pipeline) metrics track mutation processing, ordering, and transaction coordination.

- <a id="core-sweep-duration-seconds"></a>`core_sweep_duration_seconds`
	- Description: Duration of each schema sweep operation, which looks for and applies staged mutations.
	- Interpretation: Long durations indicate that large backlogs, slow staging reads, or slow target writes are affecting throughput.
- <a id="core-sweep-mutations-applied-total"></a>`core_sweep_mutations_applied_total`
	- Description: Total count of mutations read from staging and successfully applied to the target database during a sweep.
	- Interpretation: Use to monitor processing throughput. A flat line indicates no mutations are being applied.
- <a id="core-sweep-success-timestamp-seconds"></a>`core_sweep_success_timestamp_seconds`
	- Description: Wall time (Unix timestamp) at which a sweep attempt last succeeded.
	- Interpretation: If this value stops updating and becomes stale, it indicates that the sweep has stopped.
- <a id="core-parallelism-utilization-percent"></a>`core_parallelism_utilization_percent`
	- Description: Percentage of the configured parallelism that is actively being used for concurrent transaction processing.
    - Interpretation: High utilization indicates bottlenecks in mutation processing.
</section>

### Target apply

[Target apply](#replication-pipeline) metrics track mutation application to the target database.

- <a id="target-apply-queue-size"></a>`target_apply_queue_size`
	- Description: Number of transactions waiting in the target apply queue.
	- Interpretation: High values indicate target apply cannot keep up with incoming transactions.
- <a id="apply-duration-seconds"></a>`apply_duration_seconds`
	- Description: Amount of time taken to successfully apply mutations to a table.
	- Interpretation: High values indicate target database performance issues or contention.
- <a id="apply-upserts-total"></a>`apply_upserts_total`
	- Description: Number of rows upserted to the target.
    - Interpretation: Use to monitor write throughput. Should grow steadily during active replication.
- <a id="apply-deletes-total"></a>`apply_deletes_total`
	- Description: Number of rows deleted from the target.
    - Interpretation: Use to monitor delete throughput. Compare with delete operations on the source database.
- <a id="apply-errors-total"></a>`apply_errors_total`
	- Description: Number of times an error was encountered while applying mutations.
	- Interpretation: Growing error count indicates target database issues or constraint violations.
- <a id="apply-conflicts-total"></a>`apply_conflicts_total`
	- Description: Number of rows that experienced a compare-and-set (CAS) conflict.
	- Interpretation: High counts indicate concurrent modifications or stale data conflicts. May require conflict resolution tuning.
- <a id="apply-resolves-total"></a>`apply_resolves_total`
	- Description: Number of rows that experienced a compare-and-set (CAS) conflict and were successfully resolved.
    - Interpretation: Compare with `apply_conflicts_total` to verify conflict resolution is working. Should be close to or equal to conflicts.

## Userscript metrics

[Userscripts]({% link molt/userscript-overview.md %}) allow you to define how rows are transformed, filtered, and routed before Replicator writes them to the target database. Replicator exposes Prometheus [metrics]({% link molt/userscript-metrics.md %}) that provide insight into userscript activity, performance, and stability.

{% include molt/userscript-metrics.md %}

[Read more about userscript metrics]({% link molt/userscript-metrics.md %}).

## Metrics snapshots

When enabled, the metrics snapshotter periodically writes out a point-in-time snapshot of Replicator's Prometheus metrics to a file in the [Replicator data directory]({% link molt/replicator-flags.md %}#data-dir). Metrics snapshots can help with debugging when direct access to the Prometheus server is not available, and you can [bundle snapshots and send them to CockroachDB support](#bundle-and-send-metrics-snapshots) to help resolve an issue. A metrics snapshot includes all of the metrics on this page. 

Metrics snapshotting is disabled by default, and can be enabled with the [`--metricsSnapshotPeriod`]({% link molt/replicator-flags.md %}#metrics-snapshot-period) Replicator flag. [Replicator metrics must be enabled](#set-up-metrics) (with the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag) in order for metrics snapshotting to work.

If snapshotting is enabled, the snapshot period must be at least 15 seconds. The recommended range for the snapshot period is 15-60 seconds. The retention policy for metrics snapshot files can be determined by [time]({% link molt/replicator-flags.md %}#metrics-snapshot-retention-time) and by the [total size]({% link molt/replicator-flags.md %}#metrics-snapshot-retention-size) of the snapshot data subdirectory. At least one retention policy must be configured. Snapshots can also be [compressed to a gzip file]({% link molt/replicator-flags.md %}#metrics-snapshot-compression).

Changing the snapshotter's configuration requires restarting the Replicator binary with different flags.

### Enable metrics snapshotting

#### Step 1. Run Replicator with the snapshot flags

The following is an example of a `replicator` command where snapshotting is configured:

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
    <button class="filter-button" data-scope="cockroachdb">CockroachDB</button>
</div>

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~shell
replicator pglogical \
--targetConn postgres://postgres:postgres@localhost:5432/molt?sslmode=disable \
--stagingConn postgres://root@localhost:26257/_replicator?sslmode=disable \
--slotName molt_slot \
--bindAddr 0.0.0.0:30004 \
--stagingSchema _replicator \
--stagingCreateSchema \
--disableAuthentication \
--tlsSelfSigned \
--stageMode crdb \
--bestEffortWindow 1s \
--flushSize 1000 \
--metricsAddr :30005 \
--metricsSnapshotPeriod 15s \
--metricsSnapshotCompression gzip \
--metricsSnapshotRetentionTime 168h \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~shell
replicator mylogical \
--targetConn postgres://postgres:postgres@localhost:5432/molt?sslmode=disable \
--stagingConn postgres://root@localhost:26257/_replicator?sslmode=disable \
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29' \
--bindAddr 0.0.0.0:30004 \
--stagingSchema _replicator \
--stagingCreateSchema \
--disableAuthentication \
--tlsSelfSigned \
--stageMode crdb \
--bestEffortWindow 1s \
--flushSize 1000 \
--metricsAddr :30005 \
--metricsSnapshotPeriod 15s \
--metricsSnapshotCompression gzip \
--metricsSnapshotRetentionTime 168h \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~shell
replicator oraclelogminer \
--targetConn postgres://postgres:postgres@localhost:5432/molt?sslmode=disable \
--stagingConn postgres://root@localhost:26257/_replicator?sslmode=disable \
--scn 26685786 \
--backfillFromSCN 26685444 \
--bindAddr 0.0.0.0:30004 \
--stagingSchema _replicator \
--stagingCreateSchema \
--disableAuthentication \
--tlsSelfSigned \
--stageMode crdb \
--bestEffortWindow 1s \
--flushSize 1000 \
--metricsAddr :30005 \
--metricsSnapshotPeriod 15s \
--metricsSnapshotCompression gzip \
--metricsSnapshotRetentionTime 168h \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="cockroachdb">
{% include_cached copy-clipboard.html %}
~~~shell
replicator start \
--targetConn postgres://postgres:postgres@localhost:5432/molt?sslmode=disable \
--stagingConn postgres://root@localhost:26257/_replicator?sslmode=disable \
--bindAddr 0.0.0.0:30004 \
--stagingSchema _replicator \
--stagingCreateSchema \
--disableAuthentication \
--tlsSelfSigned \
--stageMode crdb \
--bestEffortWindow 1s \
--flushSize 1000 \
--metricsAddr :30005 \
--metricsSnapshotPeriod 15s \
--metricsSnapshotCompression gzip \
--metricsSnapshotRetentionTime 168h \
-v
~~~
</section>

If successful, Replicator will start, and the console output will indicate that the snapshotter has started as well:

~~~
INFO   [Feb  2 10:20:32] Replicator starting
...
INFO   [Feb  2 10:20:32] metrics snapshotter started, writing to replicator-data/metrics-snapshots every 15s, retaining 168h0m0s
~~~

Upon interruption of Replicator, the snapshotter will be stopped:

~~~                    
INFO   [Feb  2 10:26:45] Interrupted                                  
INFO   [Feb  2 10:26:45] metrics snapshotter stopped
INFO   [Feb  2 10:26:45] Server shutdown complete
~~~

#### Step 2. Find the snapshot files in the data directory

You can find the snapshot files in the [Replicator data directory]({% link molt/replicator-flags.md %}#data-dir):

{% include_cached copy-clipboard.html %}
~~~shell
cd replicator-data/metrics-snapshots && ls . | tail -n 5
~~~

~~~
snapshot-20260202T152405.737Z.txt.gz
snapshot-20260202T152420.736Z.txt.gz
snapshot-20260202T152435.736Z.txt.gz
snapshot-20260202T152450.735Z.txt.gz
snapshot-20260202T152505.735Z.txt.gz
~~~

The uncompressed files list the metrics collected at that snapshot:

{% include_cached copy-clipboard.html %}
~~~shell
gzcat snapshot-20260202T152505.735Z.txt.gz | head -n 3
~~~

~~~
# HELP cdc_resolved_timestamp_buffer_size Current size of the resolved timestamp buffer channel which is yet to be processed by Pebble Stager
# TYPE cdc_resolved_timestamp_buffer_size gauge
cdc_resolved_timestamp_buffer_size 0.0 1.770045905735e+09
~~~

### Bundle and send metrics snapshots

The following requires a Linux system that supports bash.

#### Step 1. Download the export script

Download the [metrics snapshot export script](https://replicator.cockroachdb.com/export-metrics-snapshots.sh). Ensure it's accessible and can be run by the current user.

#### Step 2. Run a snapshot export

Run an export, indicating the `metrics-snapshots` directory within your [Replicator data directory]({% link molt/replicator-flags.md %}#data-dir). You can also provide start and end timestamps to define a subset of metrics to bundle. Times are specified as UTC and should be of the format `YYYYMMDDTHHMMSS`.

Running the script without timestamps bundles all of the data in the snapshot directory. For example:

{% include_cached copy-clipboard.html %}
~~~shell
./export-metrics-snapshots.sh ./replicator-data/metrics-snapshots
~~~

Running the script with one timestamp bundles all of the data in the snapshot directory beginning at that timestamp. For example:

{% include_cached copy-clipboard.html %}
~~~shell
./export-metrics-snapshots.sh ./replicator-data/metrics-snapshots 20260115T120000
~~~

Running the script with two timestamps bundles all of the data in the snapshot directory within the two timestamps. For example:

{% include_cached copy-clipboard.html %}
~~~shell
./export-metrics-snapshots.sh ./replicator-data/metrics-snapshots 20260115T120000 20260115T140000
~~~

The resulting output is a `.tar.gz` file placed in the directory from which you ran the script (or to a path specified as an optional argument).

#### Step 3. Upload output file to a support ticket

Include this bundled metrics snapshot file on a [support ticket]({% link {{ site.current_cloud_version }}/support-resources.md %}) to give support metrics information that's relevant to your issue.

## See also

- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [Replicator Flags]({% link molt/replicator-flags.md %})
- [MOLT Replicator Best Practices]({% link molt/molt-replicator-best-practices.md %})
- [MOLT Replicator Troubleshooting]({% link molt/molt-replicator-troubleshooting.md %})
