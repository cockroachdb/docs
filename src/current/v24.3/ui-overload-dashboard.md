---
title: Overload Dashboard
summary: The Overload dashboard lets you monitor the performance of the admission control system.
toc: true
docs_area: reference.db_console
---

The **Overload dashboard** lets you monitor the performance of the parts of your cluster relevant to the cluster's [admission control system]({% link {{ page.version.version }}/admission-control.md %}). This includes CPU usage, the runnable goroutines waiting per CPU, the health of the persistent stores, and the performance of the admission control system when it is enabled.

The charts allow you to monitor:

- Metrics that help determine which resource is constrained, such as IO and CPU,
- Metrics that narrow down which admission control queues have requests waiting, and
- More advanced metrics about the system health, such as the goroutine scheduler and L0 sublevels.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Overload**.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Overload** dashboard displays the following time series graphs:

## CPU Utilization

{% include {{ page.version.version }}/ui/cpu-percent-graph.md %}

## KV Admission CPU Slots Exhausted Duration Per Second

This graph shows the relative time the node had exhausted slots for foreground (regular) CPU work per second of wall time, measured in microseconds/second, as tracked by the `admission.granter.slots_exhausted_duration.kv` metric. Increased slot exhausted duration indicates CPU resource exhaustion.

KV admission slots are an internal aspect of the [admission control system]({% link {{ page.version.version }}/admission-control.md %}), and are dynamically adjusted to allow for high CPU utilization, but without causing CPU overload. If the used slots are often equal to the available slots, then the admission control system is queueing work in order to prevent overload. A shortage of KV slots will cause queuing not only at the [KV layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %}), but also at the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}), since both layers can be significant consumers of CPU.

- In the node view, the graph shows the admission slots exhausted duration in microseconds/second on the selected node.
- In the cluster view, the graph shows the admission slots exhausted duration in microseconds/second across all nodes in the cluster.

## Admission IO Tokens Exhausted Duration Per Second

This graph shows the relative time the node had exhausted IO tokens for all IO-bound work per second of wall time, measured in microseconds/second, as tracked by the `admission.granter.io_tokens_exhausted_duration.kv` and `admission.granter.elastic_io_tokens_exhausted_duration.kv` metrics. There are separate lines for regular IO exhausted duration and elastic IO exhausted duration. Increased IO token exhausted duration indicates IO resource exhaustion.

This graph indicates write IO overload, which affects KV write operations to [storage]({% link {{ page.version.version }}/architecture/storage-layer.md %}). The [admission control system]({% link {{ page.version.version }}/admission-control.md %}) dynamically calculates write tokens (similar to a [token bucket](https://wikipedia.org/wiki/Token_bucket)) to allow for high write throughput without severely overloading each store. This graph displays the microseconds per second that there were no write tokens left for arriving write requests. When there are no write tokens, these write requests are queued.

- In the node view, the graph shows the regular (foreground) IO exhausted duration and the elastic (background) IO exhausted duration in microseconds per second on the selected node.
- In the cluster view, the graph shows the regular (foreground) IO exhausted duration and the elastic (background) IO exhausted duration in microseconds per second across all nodes in the cluster.

## IO Overload

This graph shows a derived score based on [admission control's]({% link {{ page.version.version }}/admission-control.md %}) view of the store, as tracked by the `admission.io.overload` metric. Admission control attempts to maintain a score of 0.5.

This graph indicates the health of the [persistent stores]({% link {{ page.version.version }}/architecture/storage-layer.md %}), which are implemented as log-structured merge (LSM) trees. Level 0 is the highest level of the LSM tree and consists of files containing the latest data written to the [Pebble storage engine]({% link {{ page.version.version }}/cockroach-start.md %}#storage-engine). For more information about LSM levels and how LSMs work, see [Log-structured Merge-trees]({% link {{ page.version.version }}/architecture/storage-layer.md %}#log-structured-merge-trees).

This graph specifically shows the number of sublevels and files in Level 0 normalized by admission thresholds. The 1-normalized float indicates whether IO admission control considers the store as overloaded with respect to compaction out of Level 0 (considers sublevel and file counts).

- In the node view, the graph shows the IO overload score on the selected node.
- In the cluster view, the graph shows the IO overload score across all nodes in the cluster.

{% include {{ page.version.version }}/prod-deployment/healthy-lsm.md %}

## Elastic CPU Tokens Exhausted Duration Per Second

This graph shows the relative time the node had exhausted tokens for background (elastic) CPU work per second of wall time, measured in microseconds/second, as tracked by the `admission.elastic_cpu.nanos_exhausted_duration` metric. Increased token exhausted duration indicates CPU resource exhaustion, specifically for background (elastic) work.

- In the node view, the graph shows the elastic CPU exhausted duration in microseconds per second on the selected node.
- In the cluster view, the graph shows the elastic CPU exhausted duration in microseconds per second across all nodes in the cluster.

## Admission Queueing Delay p99 – Foreground (Regular) CPU

This graph shows the 99th percentile latency of requests waiting in the various [admission control]({% link {{ page.version.version }}/admission-control.md %}) CPU queues, as tracked by the `admission.wait_durations.kv-p99`, `admission.wait_durations.sql-kv-response-p99`, and `admission.wait_durations.sql-sql-response-p99` metrics. There are separate lines for KV, SQL-KV response, and SQL-SQL response.

- In the node view, the graph shows the delay duration for KV, SQL-KV response, and SQL-SQL response on the selected node.
- In the cluster view, the graph shows the delay duration for KV, SQL-KV response, and SQL-SQL response across all nodes in the cluster.

## Admission Queueing Delay p99 – Store

This graph shows the 99th percentile latency of requests waiting in the admission control store queue, as tracked by the `admission.wait_durations.kv-stores-p99` and the `admission.wait_durations.elastic-stores-p99` metrics. There are separate lines for KV write and elastic (background) write.

- In the node view, the graph shows the delay duration of KV write and elastic (background) write on the selected node.
- In the cluster view, the graph shows the delay duration of KV write and elastic (background) write across all nodes in the cluster.

## Admission Queueing Delay p99 – Background (Elastic) CPU

This graph shows the 99th percentile latency of requests waiting in the [admission control]({% link {{ page.version.version }}/admission-control.md %}) elastic CPU queue, as tracked by the `admission.wait_durations.elastic-cpu-p99` metric.

- In the node view, the graph shows the delay duration of KV write on the selected node.
- In the cluster view, the graph shows the delay duration of KV write across all nodes in the cluster.

## Admission Queueing Delay p99 – Replication Admission Control

This graph shows the 99th percentile latency of requests waiting in the replication [admission control]({% link {{ page.version.version }}/admission-control.md %}) queue, as tracked by the `kvadmission.flow_controller.regular_wait_duration-p99` and the `kvadmission.flow_controller.elastic_wait_duration-p99` metrics. There are separate lines for regular flow token wait time and elastic (background) flow token wait time. These metrics are indicative of store overload on replicas.

- In the node view, the graph shows the wait duration of regular flow token wait time and elastic flow token wait time on the selected node.
- In the cluster view, the graph shows the wait duration of regular flow token wait time and elastic flow token wait time across all nodes in the cluster.

## Blocked Replication Streams

This graph shows the blocked replication streams per node in replication [admission control]({% link {{ page.version.version }}/admission-control.md %}), separated by admission priority {regular, elastic}, as tracked by the `kvflowcontrol.streams.eval.regular.blocked_count` and the `kvflowcontrol.streams.eval.elastic.blocked_count` metrics. There are separate lines for blocked regular streams and blocked elastic (background) streams.
 
- In the node view, the graph shows the number of blocked regular streams and blocked elastic streams on the selected node.
- In the cluster view, the graph shows the number of blocked regular streams and blocked elastic streams across all nodes in the cluster.

## Elastic CPU Utilization

This graph shows the CPU utilization by elastic (background) work, compared to the limit set for elastic work, as tracked by the `admission.elastic_cpu.utilization` and the `admission.elastic_cpu.utilization_limit` metrics.

- In the node view, the graph shows elastic CPU utilization and elastic CPU utilization limit as percentages on the selected node.
- In the cluster view, the graph shows elastic CPU utilization and elastic CPU utilization limit as percentages across all nodes in the cluster.

## Goroutine Scheduling Latency: 99th percentile

This graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of scheduling latency for [Goroutines](https://golangbot.com/goroutines/), as tracked by the `go.scheduler_latency-p99` metric. A value above `1ms` here indicates high load that causes background (elastic) CPU work to be throttled.

- In the node view, the graph shows the 99th percentile of scheduling latency for Goroutines on the selected node.
- In the cluster view, the graph shows the 99th percentile of scheduling latency for Goroutines across all nodes in the cluster.

## Goroutine Scheduling Latency: 99.9th percentile

This graph shows the 99.9th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of scheduling latency for [Goroutines](https://golangbot.com/goroutines/), as tracked by the `go.scheduler_latency-p99.9` metric.  A high value here can be indicative of high tail latency in various queries.

- In the node view, the graph shows the 99.9th percentile of scheduling latency for Goroutines on the selected node.
- In the cluster view, the graph shows the 99.9th percentile of scheduling latency for Goroutines across all nodes in the cluster.

## Runnable Goroutines per CPU

{% include {{ page.version.version }}/ui/runnable-goroutines-graph.md %}

## LSM L0 Sublevels

This graph shows the number of sublevels in L0 of the LSM, as tracked by the `storage.l0-sublevels` metric. A sustained value above `10` typically indicates that the store is overloaded. For more information about LSM levels and how LSMs work, see [Log-structured Merge-trees]({% link {{ page.version.version }}/architecture/storage-layer.md %}#log-structured-merge-trees).

- In the node view, the graph shows the number of L0 sublevels on the selected node.
- In the cluster view, the graph shows the number of L0 sublevels across all nodes in the cluster.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}
