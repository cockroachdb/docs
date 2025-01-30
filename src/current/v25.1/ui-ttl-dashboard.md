---
title: TTL Dashboard
summary: The TTL dashboard lets you monitor the progress of batch deleting expired data using Row-Level TTL running on your cluster.
toc: true
docs_area: reference.db_console
---

The **TTL** dashboard lets you monitor the progress and performance of [batch deleting expired data using Row-Level TTL]({{ page.version.version }}/row-level-ttl.md) from your cluster.

To view this dashboard, [access the DB Console]({{ page.version.version }}/ui-overview.md#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **TTL**.

## Dashboard navigation


The **TTL** dashboard displays the following time series graphs:

## Processing Rate

You can monitor the **Processing Rate** graph to see how many rows per second are being processed by [TTL jobs]({{ page.version.version }}/row-level-ttl.md#view-running-ttl-jobs).

![TTL processing rate graph](/images/v24.2/ttl-processing-rate.png)

| Metric        | Description                                 |
|---------------+---------------------------------------------|
| rows selected | The number of rows selected for deletion by the TTL job. |
| rows deleted  | The number of rows deleted by the TTL job.  |

## Estimated Rows

Monitor the **Estimated Rows** graph to see approximately how many rows are on the TTL table.

![TTL estimated rows graph](/images/v24.2/ttl-estimated-rows.png)

| Metric                             | Description                                                     |
|------------------------------------+-----------------------------------------------------------------|
| approximate number of rows         | The number of rows in all tables with TTL settings.             |
| approximate number of expired rows | The number of expired rows across all tables with TTL settings. |

## Job Latency

Monitor the **Job Latency** graph to see the latency of scanning and deleting within your cluster's [TTL jobs]({{ page.version.version }}/row-level-ttl.md#view-running-ttl-jobs).

![TTL job latency graph](/images/v24.2/ttl-job-latency.png)

## Ranges in Progress

Monitor the **Ranges in Progress** graph to see the number of ranges currently being processed by [TTL jobs]({{ page.version.version }}/row-level-ttl.md#view-running-ttl-jobs).

![TTL ranges in progress graph](/images/v24.2/ttl-ranges-in-progress.png)

| Metric                           | Description                                                                                                                                             |
|----------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------|
| number of ranges being processed | How many [ranges]({{ page.version.version }}/architecture/distribution-layer.md#overview) are currently being processed by [TTL jobs]({{ page.version.version }}/row-level-ttl.md#view-running-ttl-jobs). |


## See also

- [Batch Delete Expired Data with Row-Level TTL]({{ page.version.version }}/row-level-ttl.md)
- [DB Console Overview]({{ page.version.version }}/ui-overview.md)
- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)
- [Support Resources]({{ page.version.version }}/support-resources.md)
- [Raw Status Endpoints]({{ page.version.version }}/monitoring-and-alerting.md#raw-status-endpoints)