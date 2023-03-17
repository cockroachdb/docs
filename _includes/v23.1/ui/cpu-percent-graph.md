<img src="{{ 'images/v23.1/ui_cpu_percent.png' | relative_url }}" alt="DB Console CPU Percent graph" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
This graph shows the CPU consumption by the CockroachDB process, and excludes other processes on the node. To measure the total CPU consumption across all processes, use the **Host CPU Percent** graph instead.
{{site.data.alerts.end}}

- In the node view, the graph shows the percentage of CPU in use by the CockroachDB process for the selected node.

- In the cluster view, the graph shows the percentage of CPU in use by the CockroachDB process across all nodes.

{% include {{ page.version.version }}/prod-deployment/healthy-cpu-percent.md %}

{{site.data.alerts.callout_info}}
For multi-core systems, the percentage of CPU usage is calculated by normalizing the CPU usage across all cores, whereby 100% utilization indicates that all cores are fully utilized.
{{site.data.alerts.end}}