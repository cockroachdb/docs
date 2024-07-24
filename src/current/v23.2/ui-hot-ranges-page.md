---
title: Hot Ranges Page
summary: The Hot Ranges page provides details about ranges receiving a high number of reads or writes.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by users belonging to the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustermetadata) [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy `VIEWACTIVITY` or `VIEWACTIVITYREDACTED` [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)) defined. The [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) [system privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) **do not** grant access to this page.
{{site.data.alerts.end}}

The **Hot Ranges** page of the DB Console provides details about ranges receiving a high number of reads or writes. These are known as *hot ranges*.

When [optimizing]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots) or [troubleshooting]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#single-hot-node) statement performance, this page can help you identify nodes, ranges, or tables that are experiencing hot spots.

To view this page, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Hot Ranges** in the left-hand navigation.

## Filter hot ranges

Use the **Filter** menu to filter the [hot ranges list](#hot-ranges-list) on any combination of: node ID, store ID, database, table, index, or locality.

## Hot ranges list

The **Hot ranges** list displays the ranges with the highest queries per second (QPS) from each node [`store`]({% link {{ page.version.version }}/architecture/storage-layer.md %}).

{{site.data.alerts.callout_info}}
Hot ranges are not necessarily problematic. Some ranges naturally experience higher QPS than others. For example, a range for a frequently accessed table will have a higher QPS.

However, a significant increase in traffic can also indicate a *hot spot* on the range that should be reduced. For more information, see [Hot spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots).
{{site.data.alerts.end}}

To view the [Range Report](#range-report) for a hot range, click its range ID.

Parameter | Description
----------|------------
Range ID | The ID of the hot range. Click the range ID to view the [Range Report](#range-report) for this range.
QPS | The total number of [`SELECT`]({% link {{ page.version.version }}/selection-queries.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), [`INSERT`]({% link {{ page.version.version }}/insert.md %}), and [`DELETE`]({% link {{ page.version.version }}/delete.md %}) queries executed per second on this range. The per-second rate is averaged over the last 30 minutes.
CPU | The total CPU time per second used in processing this range. The per-second rate is averaged over the last 30 minutes.
Write (keys) | The total number of keys written per second on this range. The per-second rate is averaged over the last 30 minutes.
Write (bytes) | The total number of bytes written per second on this range. The per-second rate is averaged over the last 30 minutes.
Read (keys) | The total number of bytes written per second on this range. The per-second rate is averaged over the last 30 minutes.
Read (bytes) | The total number of bytes read per second on this range. The per-second rate is averaged over the last 30 minutes.
Nodes | The ID of each node where the range data is found.
Store ID | The ID of the store where the range data is found.
Leaseholder | The ID of the node that has the [range lease]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %}#cockroachdb-architecture-terms).
Database | The database where the range data is found.
Table | The table where the range data is found.
Index | The index where the range data is indexed, if applicable.
Locality | The locality of the node where the range data is found.

## Range Report

The **Range Report** is typically used for [advanced debugging]({% link {{ page.version.version }}/ui-debug-pages.md %}#even-more-advanced-debugging) purposes.

If your aim is to [reduce hot spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots), refer to the following fields:

- `Key Range` shows the interval of the [key space]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-descriptors) that is "hottest" (i.e., read by the processor). This is expressed as a span of key values.
- `Lease Holder QPS` shows the queries executed per second on the node that holds the [range lease]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases). If a hot range is not properly using [load-based splitting]({% link {{ page.version.version }}/load-based-splitting.md %}), this will be greater than the value configured by the `kv.range_split.load_qps_threshold` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) (`2500` by default).

## See also

- [Hot spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots)
- [Hash-sharded Indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %})
- [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %})