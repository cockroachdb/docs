---
title: Physical Cluster Replication Dashboard
summary: The Physical Cluster Replication Dashboard lets you monitor and observe replication streams between a primary and standby cluster.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The **Physical Cluster Replication** dashboard in the DB Console lets you monitor the [physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) streams between a primary and standby cluster.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) for your standby cluster, click **Metrics** on the left-hand navigation bar, and select **Physical Cluster Replication** from the **Dashboard** dropdown.

{{site.data.alerts.callout_info}}
The **Physical Cluster Replication** dashboard is distinct from the [**Replication** dashboard]({% link {{ page.version.version }}/ui-replication-dashboard.md %}), which tracks metrics related to how data is replicated across the cluster, e.g., range status, replicas per store, and replica quiescence.
{{site.data.alerts.end}}

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Physical Cluster Replication** dashboard displays the following time-series graphs:

## Logical bytes

<img src="{{ 'images/v24.1/ui-logical-bytes.png' | relative_url }}" alt="DB Console Logical Bytes graph showing results over the past hour" style="border:1px solid #eee;max-width:100%" />

The **Logical Bytes** graph displays the throughput of the replicated bytes. The graph displays the rate at which the logical bytes (sum of keys + values) are ingested by all replication jobs.

Hovering over the graph displays:

- The date and time.
- The number of logical bytes replicated.

{{site.data.alerts.callout_info}}
When you [start a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication), the **Logical Bytes** graph will record a spike of throughput as the initial scan completes. {% comment %}link to technical details here{% endcomment %}
{{site.data.alerts.end}}

## SST bytes

<img src="{{ 'images/v24.1/ui-sst-bytes.png' | relative_url }}" alt="DB Console SST bytes graph showing results over the past hour" style="border:1px solid #eee;max-width:100%" />

The **SST Bytes** graph displays the rate at which all [SST]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) bytes are sent to the [KV layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) by physical cluster replication jobs.

Hovering over the graph displays:

- The date and time.
- The number of SST bytes replicated.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
