---
title: Overload Dashboard
summary: The Overload dashboard lets you monitor CPU usage, the runnable goroutines waiting per CPU, the files and subfiles in memory, and the performance of the admission control system.
toc: true
---

<span class="version-tag">New in v21.2:</span> The **Overload dashboard** lets you monitor the performance of the parts of your cluster relevant to the cluster's [admission control system](architecture/admission-control.html). This includes CPU usage, the runnable goroutines waiting per CPU, the files and subfiles in memory, and the performance of admission control system when it is enabled.

To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Overload**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Overload** dashboard displays the following time series graphs:

## CPU percent

{% include {{ page.version.version }}/ui/cpu-percent-graph.md %}

## Runnable Goroutines per CPU

This graph shows the number of [Goroutines](https://golangbot.com/goroutines/) waiting per CPU. This graph should rise and fall based on load.

- In the node view, the graph shows the number of Goroutines waiting per CPU on the selected node.

- In the cluster view, the graph shows the number of Goroutines waiting per CPU across all nodes in the cluster.

## LSM L0 Health

This graph shows the number of files and sublevels within level 0 of the [LSM tree](https://en.wikipedia.org/wiki/Log-structured_merge-tree) used by the [Pebble storage engine](cockroach-start.html#storage-engine). Level 0 is the part of the LSM tree that is in memory. High values indicate heavy load.

- In the node view, the graph shows the number of files and sublevels within level 0 on the selected node.
- In the cluster view, the graph shows the number of files and sublevels within level 0 across all nodes in the cluster.

## KV Admission Slots

This graph shows the number of slots used by the [KV layer of the admission control system](architecture/admission-control.html). There are lines for available slots and used slots.

- In the node view, the graph shows the number of slots used on the selected node.
- In the cluster view, the graph shows the number of slots used across all nodes in the cluster.

## KV Admission IO Tokens Exhausted Duration Per Second

This graph shows the duration of operations admitted to the work queue in the KV layer of the admission control system.

- In the node view, the graph shows the duration of operations admitted to the KV layer work queue on the selected node.
- In the cluster view, the graph shows the duration of operations admitted to the KV layer work queue across all nodes in the cluster.

## Admission Work Rate

This graph shows the rate that operations within the admission control system are processed. There are lines for requests within the KV layer, write requests within the KV layer, responses between the KV and SQL layer, and responses within the SQL layer when receiving DistSQL responses.

- In the node view, the graph shows the rate of operations within the work queues on the selected node.
- In the cluster view, the graph shows the rate of operations within the work queues across all nodes in the cluster.

## Admission Delay Rate

This graph shows the latency when admitting operations to the work queues within the admission control system. There are lines for requests within the KV layer, write requests within the KV layer, responses between the KV and SQL layer, and responses within the SQL layer when receiving DistSQL responses.

- In the node view, the graph shows the rate of latency within the work queues on the selected node.
- In the cluster view, the graph shows the rate of latency within the work queues across all nodes in the cluster.

## Admission Delay: 75th percentile

This graph shows the 75th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of latency when admitting operations to the work queues within the admission control system. There are lines for requests within the KV layer, write requests within the KV layer, responses between the KV and SQL layer, and responses within the SQL layer when receiving DistSQL responses.

- In the node view, the graph shows the 75th percentile of latency within the work queues on the selected node. Over the last minute the admission control system admitted 75% of operations within this time.
- In the cluster view, the graph shows the 75th percentile of latency within the work queues across all nodes in the cluster. Over the last minute the admission control system admitted 75% of operations within this time.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}