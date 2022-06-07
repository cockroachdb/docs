---
title: Overload Dashboard
summary: The Overload dashboard lets you monitor the performance of the admission control system.
toc: true
docs_area: reference.db_console
---

{% include_cached new-in.html version="v21.2" %} The **Overload dashboard** lets you monitor the performance of the parts of your cluster relevant to the cluster's [admission control system](architecture/admission-control.html). This includes CPU usage, the runnable goroutines waiting per CPU, the health of the persistent stores, and the performance of admission control system when it is enabled.

To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Overload**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Overload** dashboard displays the following time series graphs:

## CPU percent

{% include {{ page.version.version }}/ui/cpu-percent-graph.md %}

## Runnable Goroutines per CPU

{% include {{ page.version.version }}/ui/runnable-goroutines-graph.md %}

## LSM L0 Health

This graph shows the health of the [persistent stores](architecture/storage-layer.html), which are implemented as log-structured merge (LSM) trees. Level 0 is the highest level of the LSM tree and consists of files containing the latest data written to the [Pebble storage engine](cockroach-start.html#storage-engine). For more information about LSM levels and how LSMs work, see [Log-structured Merge-trees](architecture/storage-layer.html#log-structured-merge-trees).

- In the node view, the graph shows the health of the persistent store on the selected node.
- In the cluster view, the graph shows the health of the persistent stores across all nodes in the cluster.

{% include {{ page.version.version }}/prod-deployment/healthy-lsm.md %}

## KV Admission Slots

This graph shows the number of slots used internally by the [KV layer of the admission control system](architecture/admission-control.html). There are lines for available slots and used slots.

KV admission slots are an internal aspect of the admission control system, and are dynamically adjusted to allow for high CPU utilization, but without causing CPU overload. If the used slots are often equal to the available slots, then the admission control system is queueing work in order to prevent overload. A shortage of KV slots will cause queuing not only at the KV layer, but also at the SQL layer, since both layers can be significant consumers of CPU.

- In the node view, the graph shows the number of slots used on the selected node.
- In the cluster view, the graph shows the number of slots used across all nodes in the cluster.

## KV Admission IO Tokens Exhausted Duration Per Second

This graph indicates write I/O overload, which affects KV write operations to storage. The admission control system dynamically calculates write tokens (similar to a [token bucket](https://en.wikipedia.org/wiki/Token_bucket)) to allow for high write throughput without severely overloading each store. This graph displays the microseconds per second that there were no write tokens left for arriving write requests. When there are no write tokens, these write requests are queued.

- In the node view, the graph shows the number of microseconds per second that there were no write tokens on the selected node.
- In the cluster view, the graph shows the number of microseconds per second that there were no write tokens across all nodes in the cluster.

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

This graph shows the 75th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of latency when admitting operations to the work queues within the admission control system. There are lines for requests within the KV layer, write requests within the KV layer, responses between the KV and SQL layer, and responses within the SQL layer when receiving DistSQL responses.

This 75th percentile is computed over requests that waited in the admission queue. Work that did not wait is not represented on the graph.

- In the node view, the graph shows the 75th percentile of latency within the work queues on the selected node. Over the last minute the admission control system admitted 75% of operations within this time.
- In the cluster view, the graph shows the 75th percentile of latency within the work queues across all nodes in the cluster. Over the last minute the admission control system admitted 75% of operations within this time.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}
