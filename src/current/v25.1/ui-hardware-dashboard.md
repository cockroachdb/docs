---
title: Hardware Dashboard
summary: The Hardware dashboard lets you monitor CPU usage, disk throughput, network traffic, storage capacity, and memory.
toc: true
docs_area: reference.db_console
---

The **Hardware** dashboard lets you monitor the hardware utilization of your cluster. This includes CPU usage, disk throughput, storage capacity, and memory.

To view this dashboard, [access the DB Console]({{ page.version.version }}/ui-overview.md#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Hardware**.

## Dashboard navigation


The **Hardware** dashboard displays the following time series graphs:

## CPU Percent


## Host CPU Percent

![DB Console CPU Percent graph](/images/v24.2/ui_host_cpu_percent.png)

The **Host CPU Percent** graph displays the current user and system CPU percentage consumed by all processes on the host OS, normalized by number of cores, as tracked by the `sys.cpu.host.combined.percent-normalized` metric. If the CockroachDB process is run in a containerized environment, the host OS is the container since the CockroachDB process cannot inspect CPU usage beyond the container.

- In the node view, the graph shows the percentage of CPU in use by all processes for the selected node.

- In the cluster view, the graph shows the percentage of CPU in use by all processes across all nodes.

{{site.data.alerts.callout_info}}
For multi-core systems, the percentage of CPU usage is calculated by normalizing the CPU usage across all cores, where 100% utilization indicates that all cores are fully utilized.
{{site.data.alerts.end}}

## Memory Usage

![DB Console Memory Usage graph](/images/v24.2/ui_memory_usage_new.png)

{{site.data.alerts.callout_info}}
This graph shows the memory consumption by the CockroachDB process only and is useful as long as there are no other processes consuming significant memory on the node. In case you have other processes running on the node, use a separate monitoring tool to measure the total memory consumption across all processes.
{{site.data.alerts.end}}

- In the node view, the graph shows the memory in use by CockroachDB for the selected node.

- In the cluster view, the graph shows the memory in use by CockroachDB across all nodes in the cluster.

## Disk Read Bytes

![DB Console Disk Read Bytes graph](/images/v24.2/ui_disk_read_bytes.png)

- In the node view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, across all nodes.

## Disk Write Bytes

![DB Console Disk Write Bytes graph](/images/v24.2/ui_disk_write_bytes.png)

- In the node view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, across all nodes.

## Disk Read Ops

![DB Console Disk Read Ops graph](/images/v24.2/ui_disk_read_ops.png)

- In the node view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, across all nodes.

## Disk Write Ops

![DB Console Disk Write Ops graph](/images/v24.2/ui_disk_write_ops.png)

- In the node view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, across all nodes.

## Disk Ops In Progress

- In the node view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, across all nodes in the cluster.

{{site.data.alerts.callout_info}}
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
On macOS, this graph is currently not populated and shows zero disk ops in progress.
{{site.data.alerts.end}}

## Available Disk Capacity

![DB Console Disk Capacity graph](/images/v24.2/ui_available_disk_capacity.png)

Metric | Description
--------|--------
**Available Disk Capacity** | Free disk space available to CockroachDB data on each node.

### Capacity metrics

The **available** disk capacity equals the amount of empty disk space, up to the value of the maximum store size. The store size is determined as follows:

- If a store size was specified using the [`--store`]({{ page.version.version }}/cockroach-start.md#store) flag when starting nodes, this value is used as the limit for CockroachDB data.
- If no store size has been explicitly set, the actual disk capacity is used as the limit for CockroachDB data.

The disk usage of the Cockroach binary, operating system, and other system files is not shown on the **Available Disk Capacity** graph.

{{site.data.alerts.callout_info}}
{{site.data.alerts.end}}


## See also

- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)
- [Support Resources]({{ page.version.version }}/support-resources.md)
- [Raw Status Endpoints]({{ page.version.version }}/monitoring-and-alerting.md#raw-status-endpoints)