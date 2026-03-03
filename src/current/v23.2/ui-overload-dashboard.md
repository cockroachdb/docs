---
title: Overload Dashboard
summary: The Overload dashboard lets you monitor the performance of the admission control system.
toc: true
docs_area: reference.db_console
---

The **Overload dashboard** lets you monitor the performance of the parts of your cluster relevant to the cluster's [admission control system]({% link {{ page.version.version }}/admission-control.md %}). This includes CPU usage, the runnable goroutines waiting per CPU, the health of the persistent stores, and the performance of admission control system when it is enabled.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Overload**.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Overload** dashboard displays the following time series graphs:

## CPU percent

{% include {{ page.version.version }}/ui/cpu-percent-graph.md %}

## Goroutine Scheduling Latency: 99th percentile

This graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of scheduling latency for [Goroutines](https://golangbot.com/goroutines/), as tracked by the `go.scheduler_latency-p99` metric. A value above `1ms` here indicates high load that causes background (elastic) CPU work to be throttled.

- In the node view, the graph shows the 99th percentile of scheduling latency for Goroutines on the selected node.
- In the cluster view, the graph shows the 99th percentile of scheduling latency for Goroutines across all nodes in the cluster.

## Runnable Goroutines per CPU

{% include {{ page.version.version }}/ui/runnable-goroutines-graph.md %}

## Elastic CPU Utilization

This graph shows the CPU utilization by elastic (background) work, compared to the limit set for elastic work, as tracked by the `admission.elastic_cpu.utilization` and the `admission.elastic_cpu.utilization_limit` metrics.

- In the node view, the graph shows elastic CPU utilization and elastic CPU utilization limit as percentages on the selected node.
- In the cluster view, the graph shows elastic CPU utilization and elastic CPU utilization limit as percentages across all nodes in the cluster.

## Elastic CPU Exhausted Duration Per Second

This graph shows the relative time the node had exhausted tokens for background (elastic) CPU work per second of wall time, measured in microseconds/second, as tracked by the `admission.elastic_cpu.nanos_exhausted_duration` metric. Increased token exhausted duration indicates CPU resource exhaustion, specifically for background (elastic) work.

- In the node view, the graph shows the elastic CPU exhausted duration in microseconds per second on the selected node.
- In the cluster view, the graph shows the elastic CPU exhausted duration in microseconds per second across all nodes in the cluster.

## IO Overload

This graph shows the health of the [persistent stores]({% link {{ page.version.version }}/architecture/storage-layer.md %}), which are implemented as log-structured merge (LSM) trees. Level 0 is the highest level of the LSM tree and consists of files containing the latest data written to the [Pebble storage engine]({% link {{ page.version.version }}/cockroach-start.md %}#storage-engine). For more information about LSM levels and how LSMs work, see [Log-structured Merge-trees]({% link {{ page.version.version }}/architecture/storage-layer.md %}#log-structured-merge-trees).

This graph specifically shows the number of sub-levels and files in Level 0 normalized by admission thresholds, as tracked by the `cr.store.admission.io.overload` metric. The 1-normalized float indicates whether IO admission control considers the store as overloaded with respect to compaction out of Level 0 (considers sub-level and file counts).

- In the node view, the graph shows the health of the persistent store on the selected node.
- In the cluster view, the graph shows the health of the persistent stores across all nodes in the cluster.

{% include {{ page.version.version }}/prod-deployment/healthy-lsm.md %}

## KV Admission Slots Exhausted

This graph shows the total duration when KV admission slots were exhausted, in microseconds, as tracked by the `cr.node.admission.granter.slots_exhausted_duration.kv` metric.

KV admission slots are an internal aspect of the admission control system, and are dynamically adjusted to allow for high CPU utilization, but without causing CPU overload. If the used slots are often equal to the available slots, then the admission control system is queueing work in order to prevent overload. A shortage of KV slots will cause queuing not only at the KV layer, but also at the SQL layer, since both layers can be significant consumers of CPU.

- In the node view, the graph shows the total duration when KV slots were exhausted on the selected node.
- In the cluster view, the graph shows the total duration when KV slots were exhausted across all nodes in the cluster.

## KV Admission IO Tokens Exhausted Duration Per Second

This graph indicates write I/O overload, which affects KV write operations to storage. The admission control system dynamically calculates write tokens (similar to a [token bucket](https://wikipedia.org/wiki/Token_bucket)) to allow for high write throughput without severely overloading each store. This graph displays the microseconds per second that there were no write tokens left for arriving write requests. When there are no write tokens, these write requests are queued.

- In the node view, the graph shows the number of microseconds per second that there were no write tokens on the selected node.
- In the cluster view, the graph shows the number of microseconds per second that there were no write tokens across all nodes in the cluster.

## Flow Tokens Wait Time: 75th percentile

This graph shows the 75th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of latency for regular requests and elastic requests spent waiting for flow tokens, as tracked respectively by the `cr.node.kvadmission.flow_controller.regular_wait_duration-p75` and the `cr.node.kvadmission.flow_controller.elastic_wait_duration-p75` metrics. There are separate lines for regular flow token wait time and elastic flow token wait time.

- In the node view, the graph shows the 75th percentile of latency for regular requests and elastic requests spent waiting for flow tokens on the selected node.
- In the cluster view, the graph shows the 75th percentile of latency for regular requests and elastic requests spent waiting for flow tokens across all nodes in the cluster.

## Requests Waiting For Flow Tokens

This graph shows the number of regular requests and elastic requests waiting for flow tokens, as tracked respectively by the `cr.node.kvadmission.flow_controller.regular_requests_waiting` and the `cr.node.kvadmission.flow_controller.elastic_requests_waiting` metrics. There are separate lines for regular requests waiting and elastic requests waiting.

- In the node view, the graph shows the number of regular requests and elastic requests waiting for flow tokens on the selected node.
- In the cluster view, the graph shows the number of regular requests and elastic requests waiting for flow tokens across all nodes in the cluster.

## Blocked Replication Streams

This graph shows the number of replication streams with no flow tokens available for regular requests and elastic requests, as tracked respectively by the `cr.node.kvadmission.flow_controller.regular_blocked_stream_count` and the `cr.node.kvadmission.flow_controller.elastic_blocked_stream_count` metrics. There are separate lines for blocked regular streams and blocked elastic streams.
 
- In the node view, the graph shows the number of replication streams with no flow tokens available for regular requests and elastic requests on the selected node.
- In the cluster view, the graph shows the number of replication streams with no flow tokens available for regular requests and elastic requests across all nodes in the cluster.

## Admission Work Rate

This graph shows the rate that operations within the admission control system are processed. There are lines for requests within the KV layer, write requests within the KV layer, responses between the KV and SQL layer, and responses within the SQL layer when receiving DistSQL responses.

- In the node view, the graph shows the rate of operations within the work queues on the selected node.
- In the cluster view, the graph shows the rate of operations within the work queues across all nodes in the cluster.

## Admission Delay Rate

This graph shows the latency when admitting operations to the work queues within the admission control system. There are lines for requests within the KV layer, write requests within the KV layer, responses between the KV and SQL layer, and responses within the SQL layer when receiving DistSQL responses.

This sums up the delay experienced by operations of each kind, and takes the rate per second. Dividing this rate by the rate observed in the Admission Work Rate graph gives the mean delay experienced per operation.

- In the node view, the graph shows the rate of latency within the work queues on the selected node.
- In the cluster view, the graph shows the rate of latency within the work queues across all nodes in the cluster.

## Admission Delay: 75th percentile

This graph shows the 75th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of latency when admitting operations to the work queues within the admission control system. There are lines for requests within the KV layer, write requests within the KV layer, responses between the KV and SQL layer, and responses within the SQL layer when receiving DistSQL responses.

This 75th percentile is computed over requests that waited in the admission queue. Work that did not wait is not represented on the graph.

- In the node view, the graph shows the 75th percentile of latency within the work queues on the selected node. Over the last minute the admission control system admitted 75% of operations within this time.
- In the cluster view, the graph shows the 75th percentile of latency within the work queues across all nodes in the cluster. Over the last minute the admission control system admitted 75% of operations within this time.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}
