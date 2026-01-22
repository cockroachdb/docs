---
title: Hardware Dashboard
summary: The Hardware dashboard lets you monitor CPU usage, disk throughput, network traffic, storage capacity, and memory.
toc: true
docs_area: reference.db_console
---

The **Hardware** dashboard lets you monitor the hardware utilization of your cluster. This includes CPU usage, disk throughput, storage capacity, and memory.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Hardware**.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Hardware** dashboard displays the following time series graphs:

## CPU Percent

{% include {{ page.version.version }}/ui/cpu-percent-graph.md %}

## Host CPU Percent

<img src="{{ 'images/{{ page.version.version }}/ui_host_cpu_percent.png' | relative_url }}" alt="DB Console CPU Percent graph" style="border:1px solid #eee;max-width:100%" />

The **Host CPU Percent** graph displays the current user and system CPU percentage consumed by all processes on the host OS, normalized by number of cores, as tracked by the `sys.cpu.host.combined.percent-normalized` metric. If the CockroachDB process is run in a containerized environment, the host OS is the container since the CockroachDB process cannot inspect CPU usage beyond the container.

- In the node view, the graph shows the percentage of CPU in use by all processes for the selected node.

- In the cluster view, the graph shows the percentage of CPU in use by all processes across all nodes.

{{site.data.alerts.callout_info}}
For multi-core systems, the percentage of CPU usage is calculated by normalizing the CPU usage across all cores, where 100% utilization indicates that all cores are fully utilized.
{{site.data.alerts.end}}

## Memory Usage

<img src="{{ 'images/{{ page.version.version }}/ui_memory_usage_new.png' | relative_url }}" alt="DB Console Memory Usage graph" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
This graph shows the memory consumption by the CockroachDB process only and is useful as long as there are no other processes consuming significant memory on the node. In case you have other processes running on the node, use a separate monitoring tool to measure the total memory consumption across all processes.
{{site.data.alerts.end}}

- In the node view, the graph shows the memory in use by CockroachDB for the selected node.

- In the cluster view, the graph shows the memory in use by CockroachDB across all nodes in the cluster.

## Disk Read Bytes

<img src="{{ 'images/{{ page.version.version }}/ui_disk_read_bytes.png' | relative_url }}" alt="DB Console Disk Read Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of bytes read per second by all processes, including CockroachDB, across all nodes.

## Disk Write Bytes

<img src="{{ 'images/{{ page.version.version }}/ui_disk_write_bytes.png' | relative_url }}" alt="DB Console Disk Write Bytes graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of bytes written per second by all processes, including CockroachDB, across all nodes.

## Disk Read Ops

<img src="{{ 'images/{{ page.version.version }}/ui_disk_read_ops.png' | relative_url }}" alt="DB Console Disk Read Ops graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the 10-second average of the number of disk read ops per second for all processes, including CockroachDB, across all nodes.

## Disk Write Ops

<img src="{{ 'images/{{ page.version.version }}/ui_disk_write_ops.png' | relative_url }}" alt="DB Console Disk Write Ops graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, for the node.

- In the cluster view, the graph shows the 10-second average of the number of disk write ops per second for all processes, including CockroachDB, across all nodes.

## Disk Ops In Progress

- In the node view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, for the selected node.

- In the cluster view, the graph shows the number of disk reads and writes in queue for all processes, including CockroachDB, across all nodes in the cluster.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/healthy-disk-ops-in-progress.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
On macOS, this graph is currently not populated and shows zero disk ops in progress.
{{site.data.alerts.end}}

## Available Disk Capacity

<img src="{{ 'images/{{ page.version.version }}/ui_available_disk_capacity.png' | relative_url }}" alt="DB Console Disk Capacity graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|--------
**Available Disk Capacity** | Free disk space available to CockroachDB data on each node.

### Capacity metrics

The **available** disk capacity equals the amount of empty disk space, up to the value of the maximum store size. The store size is determined as follows:

- If a store size was specified using the [`--store`]({% link {{ page.version.version }}/cockroach-start.md %}#store) flag when starting nodes, this value is used as the limit for CockroachDB data.
- If no store size has been explicitly set, the actual disk capacity is used as the limit for CockroachDB data.

The disk usage of the Cockroach binary, operating system, and other system files is not shown on the **Available Disk Capacity** graph.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
