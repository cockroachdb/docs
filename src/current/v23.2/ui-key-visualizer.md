---
title: Key Visualizer
summary: The Key Visualizer page provides insight into potential problems and hot ranges in your deployment.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include {{ page.version.version }}/ui/admin-access-only.md %}

The **Key Visualizer** page of the DB Console provides access to the Key Visualizer tool, which enables the visualization of current and historical [key-value (KV)]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#table-data-kv-structure) traffic serviced by your cluster.

The Key Visualizer is a useful troubleshooting tool when experiencing performance problems with your cluster, surfacing historical and current KV [hot spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots) in your keyspace, drawing attention to [range splits]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-splits), and highlighting potentially-unnecessary [full-table scans]({% link {{ page.version.version }}/make-queries-fast.md %}) that might benefit from the creation of a targeted index, among others.

The Key Visualizer is disabled by default. Once [enabled](#enable-the-key-visualizer), the Key Visualizer continuously collects keyspace usage data across your cluster in the background at a [configurable sampling rate](#key-visualizer-customization). Data shown in the Key Visualizer is retained for a maximum period of seven days.

To access the Key Visualizer, [navigate to the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Advanced Debug** in the left-hand navigation, then click **Key Visualizer** under the **Even More Advanced Debugging** heading.

## Required privileges

To view the **Advanced Debug** page and work with the Key Visualizer, the user must be a member of the `admin` role or must have the `VIEWDEBUG` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) defined.

## Enable the Key Visualizer

To use the Key Visualizer, the `keyvisualizer.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) must be set to `true`, using the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement:

~~~ sql
> SET CLUSTER SETTING keyvisualizer.enabled = true;
~~~

The Key Visualizer is disabled by default.

## Key Visualizer features

Once you have enabled the Key Visualizer, CockroachDB will begin monitoring keyspace usage across your cluster. Data is only collected while the Key Visualizer is enabled; you cannot visualize data from a time period before you enabled it.

When navigating to the **Key Visualizer** page in the DB Console, after a brief loading time, CockroachDB will present the collected data in a visualization designed to help you see data traffic trends at a glance.

<img src="/docs/images/{{ page.version.version }}/key-visualizer-hot-range.png" alt="Key Visualizer showing hot range" style="max-width:80%" />

The Key Visualizer presents the following information:

- The entire [table data keyspace]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#table-data-kv-structure) is represented on the Y-axis, and is broken up into buckets representing whole ranges of the keyspace, or aggregated ranges if the number of ranges in the keyspace exceeds the [configured number of buckets](#key-visualizer-customization).

- Time is represented on the X-axis, with its granularity (i.e., frequency of data collection) being controlled by the [configured sample period](#key-visualizer-customization).

- Keyspace activity is visualized on a color scale from black to red, representing "cold" and "hot" respectively. Thus, a range shown in bright red indicates a [hot spot]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots), while a range shown in black indicates a range with little to no active reads or writes. Hot spots are identified relative to other ranges; for example, a range that receives one write per minute could be considered a hot spot if the rest of the ranges on the cluster aren't receiving any. A range shown in red is therefore not necessarily itself indicative of a problem, but it may help to narrow a problem down to a specific range or group of ranges when troubleshooting cluster performance.

- Boundaries between buckets and time samples appear as grey lines. You can disable the drawing of these lines by deselecting the **Show span boundaries** checkbox below the Key Visualizer.

- You can zoom in to focus on a particular range or sample period, or zoom out to see the entire keyspace at once, up to the maximum historical data retention period of seven days.

- Hovering over a range in the Key Visualizer presents a tooltip with the start key, end key, number of requests, and timestamp of the recorded sample. 

## Key Visualizer customization

Beyond the `keyvisualizer.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), which must be enabled in order to use the Key Visualizer, there are two additional cluster settings that may be adjusted to control its behavior:

        Cluster Setting         |             Description
--------------------------------|---------------------------------------------
`keyvisualizer.sample_interval` | Controls the frequency at which the Key Visualizer collects samples.<br>**Default:** `5m`
`keyvisualizer.max_buckets` | Controls the maximum number of buckets in a sample. This value can range from `1` to `1024`.<br>**Default:** `256`

Together, these cluster settings control the sampling resolution, or granularity, of the key data that the Key Visualizer collects and presents. 

If your cluster has a large number of ranges, and the storage headroom to store the increased historical data, you might increase `keyvisualizer.max_buckets` to get more granularity in the visualizer, making pinpointing a specific problematic key range easier. Similarly, you might lower `keyvisualizer.sample_interval` to achieve more frequent samples, identifying changes between recorded samples more closely to when they actually occurred.

If your cluster has limited storage space available, you might decrease `keyvisualizer.max_buckets` and raise `keyvisualizer.sample_interval` to effectively store less collected data, at the cost of the Key Visualizer presenting a broader, less granular view of the keyspace.

If you adjust either of these values, new keyspace activity data collected by the Key Visualizer will reflect the new values, but previously-collected activity data will remain unchanged.

## Troubleshooting performance with the Key Visualizer

When troubleshooting a performance issue with your cluster, use the Key Visualizer to identify which range or ranges in your keyspace to focus on. If needed, consider adjusting the Key Visualizer's [granularity of data collection](#key-visualizer-customization) to more closely focus on a problematic range of keys if necessary, especially if the keyspace is very large and you have the storage headroom in your cluster to store the additional sample data.

The Key Visualizer was designed to make potentially problematic ranges stand out visually; as such, bright red spot are generally good places to begin a performance investigation. For example, consider the following cases:

### Identifying hot spots

The following image shows the Key Visualizer highlighting a series of [hot spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots): ranges with much higher-than-average write rates as compared to the rest of the cluster.

<img src="/docs/images/{{ page.version.version }}/key-visualizer-range-split.png" alt="Key Visualizer showing range split" style="max-width:80%" />

**Remediation:** If you've identified a potentially-problematic range as a hot spot, follow the recommended best practices to [reduce hot spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#reduce-hot-spots). In the case of the screenshot above, the increased write cadence is due to a series of [range splits]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-splits), where a range experiencing a large volume of incoming writes is splitting its keyspace to accommodate the growing range. This is often part of normal operation, but can be indicative of a data modeling issue if the range split is unexpected or causing cluster performance issues.

### Identifying full table scans

The following image shows the Key Visualizer highlighting a [full-table scan]({% link {{ page.version.version }}/make-queries-fast.md %}), where the lack of an appropriate index causes the query planner to need to scan the entire table to find the requested records in a query. This can be seen most clearly by the cascading series of bright red ranges that proceed in diagonal fashion to each other, such as the series of three shown at the mouse cursor. This cascade represents the sequential scan of contiguous ranges in the keyspace as the query planner attempts to locate requested data without an index.

<img src="/docs/images/{{ page.version.version }}/key-visualizer-table-scan.png" alt="Key Visualizer showing table scan" style="max-width:80%" />

**Remediation:**  If you've identified a full table scan, follow the guidance to [optimize statement performance]({% link {{ page.version.version }}/make-queries-fast.md %}). You can also [analyze your queries with `EXPLAIN`]({% link {{ page.version.version }}/sql-tuning-with-explain.md %}) to investigate if an index was used in the execution of the query.

## See also

- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Hot Ranges Page]({% link {{ page.version.version }}/ui-hot-ranges-page.md %})
- [Reduce Hot Spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#reduce-hot-spots)
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
