---
title: Hardware Dashboard
summary: The Hardware dashboard lets you monitor CPU usage, disk throughput, network traffic, storage capacity, and memory.
toc: true
---

The **Hardware** dashboard lets you monitor CPU usage, disk throughput, network traffic, storage capacity, and memory. To view this dashboard, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), click **Metrics** on the left, and then select **Dashboard** > **Hardware**.

The **Hardware** dashboard displays the following time series graphs:

## CPU Percent

<img src="{{ 'images/v2.1/admin_ui_cpu_percent.png' | relative_url }}" alt="CockroachDB Admin UI CPU Percent graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the percentage of CPU in use by the CockroachDB process for the selected node.

- In the cluster view, the graph shows the percentage of CPU in use by the CockroachDB process across all nodes.

{{site.data.alerts.callout_info}}
For multi-core systems, the percentage of CPU usage is calculated by normalizing the CPU usage across all cores, whereby 100% utilization indicates that all cores are fully utilized. 
{{site.data.alerts.end}}

## Memory Usage

<img src="{{ 'images/v2.1/admin_ui_memory_usage_new.png' | relative_url }}" alt="CockroachDB Admin UI Memory Usage graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the memory in use by CockroachDB for the selected node.

- In the cluster view, the graph shows the memory in use by CockroachDB across all nodes in the cluster.

## Disk Read Bytes

<img src="{{ 'images/v2.1/admin_ui_disk_read_bytes.png' | relative_url }}" alt="CockroachDB Admin UI Disk Read Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, across all nodes.

## Disk Write Bytes

<img src="{{ 'images/v2.1/admin_ui_disk_write_bytes.png' | relative_url }}" alt="CockroachDB Admin UI Disk Write Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, across all nodes.

## Disk Read Ops

<img src="{{ 'images/v2.1/admin_ui_disk_read_ops.png' | relative_url }}" alt="CockroachDB Admin UI Disk Read Ops graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, across all nodes.

## Disk Write Ops

<img src="{{ 'images/v2.1/admin_ui_disk_write_ops.png' | relative_url }}" alt="CockroachDB Admin UI Disk Write Ops graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, across all nodes.

## Disk IOPS in Progress

<img src="{{ 'images/v2.1/admin_ui_disk_iops.png' | relative_url }}" alt="CockroachDB Admin UI Disk IOPS in Progress graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, across all nodes in the cluster.

{{site.data.alerts.callout_info}}
For Mac OS, this graph is not populated and shows zero disk IOPS in progress. This is a [known limitation](https://github.com/cockroachdb/cockroach/issues/27927) that may be lifted in the future.
{{site.data.alerts.end}}

## Available Disk Capacity

<img src="{{ 'images/v2.1/admin_ui_available_disk_capacity.png' | relative_url }}" alt="CockroachDB Admin UI Disk Capacity graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the available storage capacity for the selected node.

- In the cluster view, the graph shows the available storage capacity across all nodes in the cluster.

{{site.data.alerts.callout_info}}
{% include v2.1/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

## Network Bytes Received

<img src="{{ 'images/v2.1/admin_ui_network_bytes_received.png' | relative_url }}" alt="CockroachDB Admin UI Network Bytes Received graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of network bytes received per second for all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of network bytes received for all processes, including CockroachDB, per second across all nodes.

## Network Bytes Sent

<img src="{{ 'images/v2.1/admin_ui_network_bytes_sent.png' | relative_url }}" alt="CockroachDB Admin UI Network Bytes Sent graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of network bytes sent per second by all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of network bytes sent per second by all processes, including CockroachDB, across all nodes.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
