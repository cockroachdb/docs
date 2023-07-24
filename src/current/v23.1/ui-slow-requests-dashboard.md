---
title: Slow Requests Dashboard
summary: The Slow Requests dashboard lets you monitor important cluster tasks that take longer than expected to complete.
toc: true
docs_area: reference.db_console
---

The **Slow Requests** dashboard lets you monitor important cluster tasks that take longer than expected to complete.

To view this dashboard, [access the DB Console](ui-overview.html#db-console-access) and click **Metrics** on the left-hand navigation, and then select **Dashboard** > **Slow Requests**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

{{site.data.alerts.callout_info}}
All timestamps in the DB Console are shown in Coordinated Universal Time (UTC).
{{site.data.alerts.end}}

The **Slow Requests** dashboard displays the following time series graphs:

## Slow Raft Proposals

<img src="{{ 'images/v22.1/ui_slow_raft.png' | relative_url }}" alt="DB Console slow Raft proposals graph" style="border:1px solid #eee;max-width:100%" />

The **Slow Raft Proposals** graph displays requests that have been stuck for longer than usual in [Raft](architecture/replication-layer.html#raft).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Raft Proposals | The number of requests that have been stuck for longer than usual in [Raft](architecture/replication-layer.html#raft), as tracked by the `requests.slow.raft` metric.

## Slow DistSender RPCs

<img src="{{ 'images/v22.1/ui_slow_distsender.png' | relative_url }}" alt="DB Console slow DistSender RPCs graph" style="border:1px solid #eee;max-width:100%" />

The **Slow DistSender RPCs** graph displays requests that have been stuck for longer than usual in [`DistSender`](architecture/distribution-layer.html#distsender).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow DistSender RPCs | The number of requests that have been stuck for longer than usual in [`DistSender`](architecture/distribution-layer.html#distsender), as tracked by the `requests.slow.distsender` metric.

## Slow Lease Acquisitions

<img src="{{ 'images/v22.1/ui_slow_lease.png' | relative_url }}" alt="DB Console slow lease acquisitions graph" style="border:1px solid #eee;max-width:100%" />

The **Slow Lease Acquisitions** graph displays requests that have been stuck for longer than usual while attempting to acquire a [lease](architecture/replication-layer.html#leases).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Lease Acquisitions | The number of requests that have been stuck for longer than usual while attempting to acquire a [lease](architecture/replication-layer.html#leases), as tracked by the `requests.slow.lease` metric.

## Slow Latch Acquisitions

<img src="{{ 'images/v22.1/ui_slow_latch.png' | relative_url }}" alt="DB Console slow latch acquisitions graph" style="border:1px solid #eee;max-width:100%" />

The **Slow Latch Acquisitions** graph displays requests that have been stuck for longer than usual while attempting to acquire a [latch](architecture/transaction-layer.html#latch-manager).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Latch Acquisitions | The number of requests that have been stuck for longer than usual while attempting to acquire a [latch](architecture/transaction-layer.html#latch-manager).

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
