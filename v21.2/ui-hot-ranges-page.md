---
title: Hot Ranges Page
summary: The Hot Ranges page provides details about ranges receiving a high number of reads or writes.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by a SQL user with the `VIEWACTIVITY` or `VIEWACTIVITYREDACTED` role option.
{{site.data.alerts.end}}

The **Hot Ranges** page of the DB Console provides details about ranges receiving a high number of reads or writes. These are known as *hot ranges*.

When [optimizing](performance-best-practices-overview.html#hot-spots) or [troubleshooting](query-behavior-troubleshooting.html#single-hot-node) statement performance, this page can help you identify nodes, ranges, or tables that are experiencing hot spots.

To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Hot Ranges** in the left-hand navigation.

## Filter hot ranges

Use the **Filter** menu to filter the [hot ranges list](#hot-ranges-list) on any combination of: node ID, store ID, database, table, index, or locality.

## Hot ranges list

The **Hot ranges** list displays the ranges with the highest queries per second (QPS) from each node [`store`](architecture/storage-layer.html).

{{site.data.alerts.callout_info}}
Hot ranges are not necessarily problematic. Some ranges naturally experience higher QPS than others. For example, a range for a frequently accessed table will have a higher QPS.

However, a significant increase in traffic can also indicate a *hot spot* on the range that should be reduced. For more information, see [Hot spots](performance-best-practices-overview.html#hot-spots).
{{site.data.alerts.end}}

To view the [Range Report](#range-report) for a hot range, click its range ID.

Parameter | Description
----------|------------
Range ID | The ID of the hot range. Click the range ID to view the [Range Report](#range-report) for this range.
QPS | Total number of `SELECT`, `UPDATE`, `INSERT`, and `DELETE` queries executed per second on this range.
Nodes | The ID of each node where the range data is found.
Store ID | The ID of the store where the range data is found.
Leaseholder | The ID of the node that has the [range lease](architecture/reads-and-writes-overview.html#cockroachdb-architecture-terms).
Database | The database where the range data is found.
Table | The table where the range data is found.
Index | The index where the range data is indexed, if applicable.
Locality | The locality of the node where the range data is found.

## Range Report

The **Range Report** is typically used for [advanced debugging](ui-debug-pages.html#even-more-advanced-debugging) purposes.

If your aim is to [reduce hot spots](performance-best-practices-overview.html#hot-spots), refer to the following fields:

- `Key Range` shows the interval of the [key space](architecture/distribution-layer.html#range-descriptors) that is "hottest" (i.e., read by the processor). This is expressed as a span of key values.
- `Lease Holder QPS` shows the queries executed per second on the node that holds the [range lease](architecture/replication-layer.html#leases). If a hot range is not properly using [load-based splitting](load-based-splitting.html), this will be greater than the value configured by the `kv.range_split.load_qps_threshold` [cluster setting](cluster-settings.html) (`2500` by default).

## See also

- [Hot spots](performance-best-practices-overview.html#hot-spots)
- [Hash-sharded Indexes](hash-sharded-indexes.html)
- [Architecture Overview](architecture/overview.html)
