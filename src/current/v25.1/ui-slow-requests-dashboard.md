---
title: Slow Requests Dashboard
summary: The Slow Requests dashboard lets you monitor important cluster tasks that take longer than expected to complete.
toc: true
docs_area: reference.db_console
---

The **Slow Requests** dashboard lets you monitor important cluster tasks that take longer than expected to complete.

To view this dashboard, [access the DB Console]({{ page.version.version }}/ui-overview.md#db-console-access) and click **Metrics** on the left-hand navigation, and then select **Dashboard** > **Slow Requests**.

## Dashboard navigation


{{site.data.alerts.callout_info}}
All timestamps in the DB Console are shown in Coordinated Universal Time (UTC).
{{site.data.alerts.end}}

The **Slow Requests** dashboard displays the following time series graphs:

## Slow Raft Proposals

![DB Console slow Raft proposals graph](/images/v22.1/ui_slow_raft.png)

The **Slow Raft Proposals** graph displays requests that have been stuck for longer than usual in [Raft]({{ page.version.version }}/architecture/replication-layer.md#raft).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Raft Proposals | The number of requests that have been stuck for longer than usual in [Raft]({{ page.version.version }}/architecture/replication-layer.md#raft), as tracked by the `requests.slow.raft` metric.

## Slow DistSender RPCs

![DB Console slow DistSender RPCs graph](/images/v22.1/ui_slow_distsender.png)

The **Slow DistSender RPCs** graph displays requests that have been stuck for longer than usual in [`DistSender`]({{ page.version.version }}/architecture/distribution-layer.md#distsender).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow DistSender RPCs | The number of requests that have been stuck for longer than usual in [`DistSender`]({{ page.version.version }}/architecture/distribution-layer.md#distsender), as tracked by the `requests.slow.distsender` metric.

## Slow Lease Acquisitions

![DB Console slow lease acquisitions graph](/images/v22.1/ui_slow_lease.png)

The **Slow Lease Acquisitions** graph displays requests that have been stuck for longer than usual while attempting to acquire a [lease]({{ page.version.version }}/architecture/replication-layer.md#leases).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Lease Acquisitions | The number of requests that have been stuck for longer than usual while attempting to acquire a [lease]({{ page.version.version }}/architecture/replication-layer.md#leases), as tracked by the `requests.slow.lease` metric.

## Slow Latch Acquisitions

![DB Console slow latch acquisitions graph](/images/v22.1/ui_slow_latch.png)

The **Slow Latch Acquisitions** graph displays requests that have been stuck for longer than usual while attempting to acquire a [latch]({{ page.version.version }}/architecture/transaction-layer.md#latch-manager).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Slow Latch Acquisitions | The number of requests that have been stuck for longer than usual while attempting to acquire a [latch]({{ page.version.version }}/architecture/transaction-layer.md#latch-manager).


## See also

- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)
- [Support Resources]({{ page.version.version }}/support-resources.md)
- [Raw Status Endpoints]({{ page.version.version }}/monitoring-and-alerting.md#raw-status-endpoints)