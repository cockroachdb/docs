![DB Console CPU Percent graph](/images/v22.1/ui_cpu_percent.png)

{{site.data.alerts.callout_info}}
This graph shows the CPU consumption by the CockroachDB process, and excludes other processes on the node. Use a separate monitoring tool to measure the total CPU consumption across all processes.
{{site.data.alerts.end}}

- In the node view, the graph shows the percentage of CPU in use by the CockroachDB process for the selected node.

- In the cluster view, the graph shows the percentage of CPU in use by the CockroachDB process across all nodes.

{% include "_includes/25.1/prod-deployment/healthy-cpu-percent.md" %}

{{site.data.alerts.callout_info}}
For multi-core systems, the percentage of CPU usage is calculated by normalizing the CPU usage across all cores, whereby 100% utilization indicates that all cores are fully utilized.
{{site.data.alerts.end}}
