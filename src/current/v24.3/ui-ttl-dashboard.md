---
title: TTL Dashboard
summary: The TTL dashboard lets you monitor the progress of batch deleting expired data using Row-Level TTL running on your cluster.
toc: true
docs_area: reference.db_console
---

The **TTL** dashboard lets you monitor the progress and performance of [batch deleting expired data using Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) from your cluster.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **TTL**.

## Dashboard navigation

{% include {{page.version.version}}/ui/ui-metrics-navigation.md %}

The **TTL** dashboard displays the following time series graphs:

## Processing Rate

You can monitor the **Processing Rate** graph to see how many rows per second are being processed by [TTL jobs]({% link {{ page.version.version }}/row-level-ttl.md %}#view-running-ttl-jobs).

<img src="{{ 'images/{{ page.version.version }}/ttl-processing-rate.png' | relative_url }}" alt="TTL processing rate graph" style="border:1px solid #eee;max-width:100%" />

| Metric        | Description                                 |
|---------------+---------------------------------------------|
| rows selected | The number of rows selected for deletion by the TTL job. |
| rows deleted  | The number of rows deleted by the TTL job.  |

## Estimated Rows

Monitor the **Estimated Rows** graph to see approximately how many rows are on the TTL table.

<img src="{{ 'images/{{ page.version.version }}/ttl-estimated-rows.png' | relative_url }}" alt="TTL estimated rows graph" style="border:1px solid #eee;max-width:100%" />

| Metric                             | Description                                                     |
|------------------------------------+-----------------------------------------------------------------|
| approximate number of rows         | The number of rows in all tables with TTL settings.             |
| approximate number of expired rows | The number of expired rows across all tables with TTL settings. |

## Job Latency

Monitor the **Job Latency** graph to see the latency of scanning and deleting within your cluster's [TTL jobs]({% link {{ page.version.version }}/row-level-ttl.md %}#view-running-ttl-jobs).

<img src="{{ 'images/{{ page.version.version }}/ttl-job-latency.png' | relative_url }}" alt="TTL job latency graph" style="border:1px solid #eee;max-width:100%" />

## Ranges in Progress

Monitor the **Ranges in Progress** graph to see the number of ranges currently being processed by [TTL jobs]({% link {{ page.version.version }}/row-level-ttl.md %}#view-running-ttl-jobs).

<img src="{{ 'images/{{ page.version.version }}/ttl-ranges-in-progress.png' | relative_url }}" alt="TTL ranges in progress graph" style="border:1px solid #eee;max-width:100%" />

| Metric                           | Description                                                                                                                                             |
|----------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------|
| number of ranges being processed | How many [ranges]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#overview) are currently being processed by [TTL jobs]({% link {{ page.version.version }}/row-level-ttl.md %}#view-running-ttl-jobs). |

{% include {{page.version.version}}/ui/ui-summary-events.md %}

## See also

- [Batch Delete Expired Data with Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %})
- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
