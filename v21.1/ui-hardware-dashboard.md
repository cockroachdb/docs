---
title: Hardware Dashboard
summary: The Hardware dashboard lets you monitor CPU usage, disk throughput, network traffic, storage capacity, and memory.
toc: true
redirect_from: admin-ui-hardware-dashboard.html
---

The **Hardware** dashboard lets you monitor the hardware utilization of your cluster. This includes CPU usage, disk throughput, network traffic, storage capacity, and memory. 

To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Hardware**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Hardware** dashboard displays the following time series graphs:

## CPU Percent

<img src="{{ 'images/v21.1/ui_cpu_percent.png' | relative_url }}" alt="DB Console CPU Percent graph" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
This graph shows the CPU consumption by the CockroachDB process only and is useful as long as there are no other processes consuming significant CPU on the node. In case you have other processes running on the node, use a separate monitoring tool to measure the total CPU consumption across all processes.
{{site.data.alerts.end}}

- In the node view, the graph shows the percentage of CPU in use by the CockroachDB process for the selected node.

- In the cluster view, the graph shows the percentage of CPU in use by the CockroachDB process across all nodes.

{{site.data.alerts.callout_info}}
For multi-core systems, the percentage of CPU usage is calculated by normalizing the CPU usage across all cores, whereby 100% utilization indicates that all cores are fully utilized.
{{site.data.alerts.end}}

## Memory Usage

<img src="{{ 'images/v21.1/ui_memory_usage_new.png' | relative_url }}" alt="DB Console Memory Usage graph" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
This graph shows the memory consumption by the CockroachDB process only and is useful as long as there are no other processes consuming significant memory on the node. In case you have other processes running on the node, use a separate monitoring tool to measure the total memory consumption across all processes.
{{site.data.alerts.end}}

- In the node view, the graph shows the memory in use by CockroachDB for the selected node.

- In the cluster view, the graph shows the memory in use by CockroachDB across all nodes in the cluster.

## Disk Read Bytes

<img src="{{ 'images/v21.1/ui_disk_read_bytes.png' | relative_url }}" alt="DB Console Disk Read Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, across all nodes.

## Disk Write Bytes

<img src="{{ 'images/v21.1/ui_disk_write_bytes.png' | relative_url }}" alt="DB Console Disk Write Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, across all nodes.

## Disk Read Ops

<img src="{{ 'images/v21.1/ui_disk_read_ops.png' | relative_url }}" alt="DB Console Disk Read Ops graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, across all nodes.

## Disk Write Ops

<img src="{{ 'images/v21.1/ui_disk_write_ops.png' | relative_url }}" alt="DB Console Disk Write Ops graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, across all nodes.

## Disk IOPS in Progress

<img src="{{ 'images/v21.1/ui_disk_iops.png' | relative_url }}" alt="DB Console Disk IOPS in Progress graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, across all nodes in the cluster.

{{site.data.alerts.callout_info}}
For Mac OS, this graph is not populated and shows zero disk IOPS in progress. This is a [known limitation](https://github.com/cockroachdb/cockroach/issues/27927) that may be lifted in the future.
{{site.data.alerts.end}}

## Available Disk Capacity

<img src="{{ 'images/v21.1/ui_available_disk_capacity.png' | relative_url }}" alt="DB Console Disk Capacity graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|--------
**Available Disk Capacity** | Free disk space available to CockroachDB data on each node.

### Capacity metrics

The **available** disk capacity equals the amount of empty disk space, up to the value of the maximum store size. The store size is determined as follows:

- If a store size was specified using the [`--store`](cockroach-start.html#store) flag when starting nodes, this value is used as the limit for CockroachDB data.
- If no store size has been explicitly set, the actual disk capacity is used as the limit for CockroachDB data.

The disk usage of the Cockroach binary, operating system, and other system files is not shown on the **Available Disk Capacity** graph.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

## Network Bytes Received

<img src="{{ 'images/v21.1/ui_network_bytes_received.png' | relative_url }}" alt="DB Console Network Bytes Received graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of network bytes received per second for all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of network bytes received for all processes, including CockroachDB, per second across all nodes.

## Network Bytes Sent

<img src="{{ 'images/v21.1/ui_network_bytes_sent.png' | relative_url }}" alt="DB Console Network Bytes Sent graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of network bytes sent per second by all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of network bytes sent per second by all processes, including CockroachDB, across all nodes.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
