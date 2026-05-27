---
title: Top Ranges Page
summary: The Top Ranges page provides details about the highest-ranked ranges by metrics such as reads, writes, QPS, and CPU.
toc: true
docs_area: reference.db_console
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by users belonging to the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustermetadata) [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy `VIEWACTIVITY` or `VIEWACTIVITYREDACTED` [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)) defined. The [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) [system privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) **do not** grant access to this page.
{{site.data.alerts.end}}

The **Top Ranges** page of the DB Console provides details about the highest-ranked ranges by metrics such as reads, writes, queries per second (QPS), and CPU. Ranges that rank highly by these measures may indicate [*hot ranges*]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-range), but are not necessarily problematic.

When optimizing or troubleshooting statement performance, this page can help you identify nodes, ranges, or tables that are experiencing [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}).

To view this page, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Top Ranges** in the left-hand navigation.

## Select nodes

In the **Select Nodes** filter, choose one or more nodes with high activity, such as high CPU usage, to investigate potential hotspots. Selecting fewer nodes can help identify the hottest ranges more quickly and improve page load time.

Selecting a region, such as `us-east1`, selects all nodes in that region.

In the **Select Nodes** search box, enter numbers to search for specific node IDs. For example, in a cluster with 12 nodes, entering `1` returns checkboxes for node IDs `n1`, `n10`, `n11`, and `n12`. 

Click **Apply** to view the [top ranges list](#top-ranges-list) for the selected nodes.

## Filter top ranges

After [selecting nodes](#select-nodes), use the **Filter** menu to filter the [top ranges list](#top-ranges-list). You can choose to view top ranges across a specific table, index, store ID, and one or more databases.

In the **Databases** dropdown list, you can choose to filter by specific databases (optional).

In the **Table** and **Index** search boxes, enter the complete name of a table or index to return results. For example, in the [`movr` database]({% link {{ page.version.version }}/movr.md %}), search for the exact index name `users_pkey` to return results. Entering a partial index name, such as `user` or `users` returns no results.

In the **Store ID** search box, enter numbers to search for specific store IDs. For example, in a cluster with 12 stores, entering `1` returns results for store IDs `1`, `10`, `11`, and `12`.

Click **Apply** to view the filtered [top ranges list](#top-ranges-list).

## Top ranges list

The **Top ranges** list displays the ranges with the highest queries per second (QPS) from each node [`store`]({% link {{ page.version.version }}/architecture/storage-layer.md %}).

{{site.data.alerts.callout_info}}
Top ranges are not necessarily problematic. Some ranges naturally experience higher QPS than others. For example, a range for a frequently accessed table will have a higher QPS.

However, a significant increase in traffic can also indicate a *hotspot* on the range that should be reduced. For more information, refer to [Understand hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-range).
{{site.data.alerts.end}}

To view the [Range Report](#range-report) for a top range, click its range ID.

Parameter | Description
----------|------------
Range ID | The ID of the top range. Click the range ID to view the [Range Report](#range-report) for this range.
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

If your aim is to [reduce hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}#reduce-hotspots), refer to the following fields:

- `Key Range` shows the interval of the [key space]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-descriptors) that is "hottest" (i.e., read by the processor). This is expressed as a span of key values.
- `Lease Holder QPS` shows the queries executed per second on the node that holds the [range lease]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases). If a top range is not properly using [load-based splitting]({% link {{ page.version.version }}/load-based-splitting.md %}), this will be greater than the value configured by the `kv.range_split.load_qps_threshold` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) (`2500` by default).

## See also

- [Understand Hotspots]({% link {{ page.version.version }}/understand-hotspots.md %})
- [Hash-sharded Indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %})
- [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %})
