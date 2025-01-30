---
title: Physical Cluster Replication Dashboard
summary: The Physical Cluster Replication Dashboard lets you monitor and observe replication streams between a primary and standby cluster.
toc: true
docs_area: reference.db_console
---

The **Physical Cluster Replication** dashboard in the DB Console lets you monitor the [physical cluster replication]({{ page.version.version }}/physical-cluster-replication-overview.md) streams between a primary and standby cluster.

To view this dashboard, [access the DB Console]({{ page.version.version }}/ui-overview.md#db-console-access) for your standby cluster, click **Metrics** on the left-hand navigation bar, and select **Physical Cluster Replication** from the **Dashboard** dropdown.

{{site.data.alerts.callout_info}}
The **Physical Cluster Replication** dashboard is distinct from the [**Replication** dashboard]({{ page.version.version }}/ui-replication-dashboard.md), which tracks metrics related to how data is replicated across the cluster, e.g., range status, replicas per store, and replica quiescence.
{{site.data.alerts.end}}

## Dashboard navigation


The **Physical Cluster Replication** dashboard displays the following time-series graphs:

## Logical bytes

![DB Console Logical Bytes graph showing results over the past hour](/images/v24.2/ui-logical-bytes.png)

The **Logical Bytes** graph displays the throughput of the replicated bytes. The graph displays the rate at which the logical bytes (sum of keys + values) are ingested by all replication jobs.

Hovering over the graph displays:

- The date and time.
- The number of logical bytes replicated.

{{site.data.alerts.callout_info}}
When you [start a replication stream]({{ page.version.version }}/set-up-physical-cluster-replication.md#step-4-start-replication), the **Logical Bytes** graph will record a spike of throughput as the initial scan completes. {% comment %}link to technical details here{% endcomment %}
{{site.data.alerts.end}}

## SST bytes

![DB Console SST bytes graph showing results over the past hour](/images/v24.2/ui-sst-bytes.png)

The **SST Bytes** graph displays the rate at which all [SST]({{ page.version.version }}/architecture/storage-layer.md#ssts) bytes are sent to the [KV layer]({{ page.version.version }}/architecture/storage-layer.md) by physical cluster replication jobs.

Hovering over the graph displays:

- The date and time.
- The number of SST bytes replicated.

## Replication lag

![DB Console Replication Lag graph showing results over the past hour](/images/v24.2/ui-replication-lag.png)

The **Replication Lag** graph displays the [replication lag]({{ page.version.version }}/physical-cluster-replication-technical-overview.md) between the primary and standby cluster. This is the time between the most up-to-date replicated time and the actual time.

Hovering over the graph displays:

- The specific date and time of the replication lag.
- The reported replication lag time.


## See also

- [Physical Cluster Replication Overview]({{ page.version.version }}/physical-cluster-replication-overview.md)
- [Physical Cluster Replication Monitoring]({{ page.version.version }}/physical-cluster-replication-monitoring.md)
- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)
- [Support Resources]({{ page.version.version }}/support-resources.md)