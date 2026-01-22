---
title: Slow Requests Dashboard
summary: The Slow Requests dashboard lets you monitor important cluster tasks that take longer than expected to complete.
toc: true
docs_area: reference.db_console
---

The **Slow Requests** dashboard lets you monitor important cluster tasks that take longer than expected to complete.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Metrics** on the left-hand navigation, and then select **Dashboard** > **Slow Requests**.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

{{site.data.alerts.callout_info}}
All timestamps in the DB Console are shown in Coordinated Universal Time (UTC).
{{site.data.alerts.end}}

The **Slow Requests** dashboard displays the following time series graphs:

## Slow Raft Proposals

<img src="{{ 'images/{{ page.version.version }}/ui_slow_raft.png' | relative_url }}" alt="DB Console slow Raft proposals graph" style="border:1px solid #eee;max-width:100%" />

The **Slow Raft Proposals** graph displays requests that have been stuck for longer than usual in [Raft]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Raft Proposals | The number of requests that have been stuck for longer than usual in [Raft]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft), as tracked by the `requests.slow.raft` metric. This can be a symptom of a [leader-leaseholder split]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leader-leaseholder-splits).

## Slow DistSender RPCs

<img src="{{ 'images/{{ page.version.version }}/ui_slow_distsender.png' | relative_url }}" alt="DB Console slow DistSender RPCs graph" style="border:1px solid #eee;max-width:100%" />

The **Slow DistSender RPCs** graph displays requests that have been stuck for longer than usual in [`DistSender`]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#distsender).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow DistSender RPCs | The number of requests that have been stuck for longer than usual in [`DistSender`]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#distsender), as tracked by the `requests.slow.distsender` metric.

## Slow Lease Acquisitions

<img src="{{ 'images/{{ page.version.version }}/ui_slow_lease.png' | relative_url }}" alt="DB Console slow lease acquisitions graph" style="border:1px solid #eee;max-width:100%" />

The **Slow Lease Acquisitions** graph displays requests that have been stuck for longer than usual while attempting to acquire a [lease]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Lease Acquisitions | The number of requests that have been stuck for longer than usual while attempting to acquire a [lease]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases), as tracked by the `requests.slow.lease` metric.

## Slow Latch Acquisitions

<img src="{{ 'images/{{ page.version.version }}/ui_slow_latch.png' | relative_url }}" alt="DB Console slow latch acquisitions graph" style="border:1px solid #eee;max-width:100%" />

The **Slow Latch Acquisitions** graph displays requests that have been stuck for longer than usual while attempting to acquire a [latch]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#latch-manager).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Latch Acquisitions | The number of requests that have been stuck for longer than usual while attempting to acquire a [latch]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#latch-manager).

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
