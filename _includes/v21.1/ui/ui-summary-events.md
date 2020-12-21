## Summary and events

### Summary panel

A **Summary** panel of key metrics is displayed to the right of the timeseries graphs.

<img src="{{ 'images/v21.1/ui_summary_panel.png' | relative_url }}" alt="DB Console Summary Panel" style="border:1px solid #eee;max-width:40%" />

Metric | Description
--------|----
Total Nodes | The total number of nodes in the cluster. [Decommissioned nodes](remove-nodes.html) are not included in this count.
Capacity Used | The storage capacity used as a percentage of [usable capacity](ui-cluster-overview-page.html#capacity-metrics) allocated across all nodes.
Unavailable Ranges | The number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster.
Queries per second | The total number of `SELECT`, `UPDATE`, `INSERT`, and `DELETE` queries executed per second across the cluster.
P99 Latency | The 99th percentile of service latency.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

### Events panel

Underneath the [Summary](#summary-panel) panel, the **Events** panel lists the 5 most recent events logged for all nodes across the cluster. To list all events, click **View all events**.

<img src="{{ 'images/v21.1/ui_events.png' | relative_url }}" alt="DB Console Events" style="border:1px solid #eee;max-width:40%" />

The following types of events are listed:

- Database created
- Database dropped
- Table created
- Table dropped
- Table altered
- Index created
- Index dropped
- View created
- View dropped
- Schema change reversed
- Schema change finished
- Node joined
- Node decommissioned
- Node restarted
- Cluster setting changed