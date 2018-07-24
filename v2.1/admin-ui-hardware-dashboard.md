---
title: Hardware Dashboard
summary: The Hardware dashboard lets you monitor CPU usage, disk throughput, network traffic, storage capacity, and memory.
toc: true
---

The **Hardware** dashboard lets you monitor CPU usage, disk throughput, network traffic, storage capacity, and memory. To view this dashboard, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **Hardware**.

The **Hardware** dashboard displays the following time series graphs:

## User CPU Percent

<img src="{{ 'images/v2.1/admin_ui_user_cpu.png' | relative_url }}" alt="CockroachDB Admin UI User CPU Percent graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the User CPU Percent graph shows the percentage of the total CPU seconds per second used by the CockroachDB process for the selected node.

- In the cluster view, the graph shows the percentage of the total CPU seconds per second used by the CockroachDB process across all nodes.

{{site.data.alerts.callout_info}}
For multi-core systems, the User CPU Percent can be greater than 100%. Full utilization of one core is considered as 100% CPU usage. If you have n cores, then the User CPU Percent can range from 0% (indicating an idle system) to (n*100)% (indicating full utilization).
{{site.data.alerts.end}}

## System CPU Percent

<img src="{{ 'images/v2.1/admin_ui_system_cpu.png' | relative_url }}" alt="CockroachDB Admin UI System CPU Percent graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the percentage of the total CPU seconds per second used by the system calls made by CockroachDB for the selected node.

- In the cluster view, the graph shows the percentage of the total CPU seconds per second used by the system calls made by CockroachDB across all nodes.

{{site.data.alerts.callout_info}}
For multi-core systems, the System CPU Percent can be greater than 100%. Full utilization of one core is considered as 100% CPU usage. If you have n cores, then the User CPU Percent can range from 0% (indicating an idle system) to (n*100)% (indicating full utilization).
{{site.data.alerts.end}}

## Memory Usage

<img src="{{ 'images/v2.1/admin_ui_memory_usage_new.png' | relative_url }}" alt="CockroachDB Admin UI Memory Usage graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the memory in use by CockroachDB for the selected node.

- In the cluster view, the graph shows the memory in use by CockroachDB across all nodes in the cluster.

## Disk Read Bytes

<img src="{{ 'images/v2.1/admin_ui_disk_read_bytes.png' | relative_url }}" alt="CockroachDB Admin UI Disk Read Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the current moving average, over the last 10 seconds, of the number of bytes read per second by all processes including CockroachDB for the selected node.

- In the cluster view, the graph shows the current moving average, over the last 10 seconds, of the number of bytes read per second by all processes including CockroachDB across all nodes.

## Disk Write Bytes

<img src="{{ 'images/v2.1/admin_ui_disk_write_bytes.png' | relative_url }}" alt="CockroachDB Admin UI Disk Write Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the current moving average, over the last 10 seconds, of the number of bytes written per second by all processes including CockroachDB for the node.

- In the cluster view, the graph shows the current moving average, over the last 10 seconds, of the number of bytes written per second by all processes including CockroachDB across all nodes.

## Disk IOPS in Progress

<img src="{{ 'images/v2.1/admin_ui_disk_iops.png' | relative_url }}" alt="CockroachDB Admin UI Disk IOPS in Progress graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of disk reads and writes in queue for all processes including CockroachDB for the selected node.

- In the cluster view, the graph shows the number of disk reads and writes in queue for all processes including CockroachDB across all nodes in the cluster.

## Disk Capacity

<img src="{{ 'images/v2.1/admin_ui_disk_capacity.png' | relative_url }}" alt="CockroachDB Admin UI Disk Capacity graph" style="border:1px solid #eee;max-width:100%" />

You can monitor the **Disk Capacity** graph to determine when additional storage is needed.

- In the node view, the graph shows the maximum allocated capacity, available storage capacity, and capacity used by CockroachDB for the selected node.

- In the cluster view, the graph shows the maximum allocated capacity, available storage capacity, and capacity used by CockroachDB across all nodes in the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Capacity | The maximum storage capacity allocated to CockroachDB. You can configure the maximum allocated storage capacity for CockroachDB using the <code>--store</code> flag. For more information, see [Start a Node](start-a-node.html#store).
Available | The free storage capacity available to CockroachDB.
Used | Disk space used by the data in the CockroachDB store. Note that this value is less than (Capacity - Available) because Capacity and Available metrics consider the entire disk and all applications on the disk including CockroachDB, whereas Used metric tracks only the store's disk usage.

{{site.data.alerts.callout_info}}
{% include v2.1/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

## Network Bytes Received

<img src="{{ 'images/v2.1/admin_ui_network_bytes_received.png' | relative_url }}" alt="CockroachDB Admin UI Network Bytes Received graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the current moving average, over the last 10 seconds, of the number of network bytes received per second for all processes including CockroachDB for the node.

- In the cluster view, the graph shows the current moving average, over the last 10 seconds, of the number of network bytes received for all processes including CockroachDB per second across all nodes.

## Network Bytes Sent

<img src="{{ 'images/v2.1/admin_ui_network_bytes_sent.png' | relative_url }}" alt="CockroachDB Admin UI Network Bytes Sent graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the current moving average, over the last 10 seconds, of the number of network bytes sent per second by all processes including CockroachDB for the node.

- In the cluster view, the graph shows the current moving average, over the last 10 seconds, of the number of network bytes sent per second by all processes including CockroachDB across all nodes.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
