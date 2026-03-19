This graph displays the current user and system CPU percentage consumed by the CockroachDB process, normalized by number of cores, as tracked by the `sys.cpu.combined.percent-normalized` metric.

{{site.data.alerts.callout_info}}
This graph shows the CPU consumption by the CockroachDB process, and excludes other processes on the node. Use the [Host CPU Percent graph]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#host-cpu-percent) to measure the total CPU consumption across all processes.
{{site.data.alerts.end}}

- In the node view, the graph shows the percentage of CPU utilization of the CockroachDB process as measured by the host for the selected node.

- In the cluster view, the graph shows the percentage of CPU utilization of the CockroachDB process as measured by the host across all nodes.

{% include {{ page.version.version }}/prod-deployment/healthy-cpu-percent.md %}

{{site.data.alerts.callout_info}}
For multi-core systems, the percentage of CPU usage is calculated by normalizing the CPU usage across all cores, whereby 100% utilization indicates that all cores are fully utilized.
{{site.data.alerts.end}}
