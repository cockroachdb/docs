---
title: Table Localities
summary: Learn how to use table localities in a CockroachDB multi-region cluster.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: deploy
key: when-to-use-regional-vs-global-tables.html
---

_Table locality_ determines how CockroachDB optimizes access to the table's data. Every table in a multi-region database has a "table locality setting" that configures one or more *home regions* at the table or row level. A table or row's home region is where the [leaseholder]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) of its ranges is placed, along with a number of voting replicas determined by the [survival goal]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals) of the database.

By default, all tables in a multi-region database are _regional_ tables—that is, CockroachDB optimizes access to the table's data from a single home region (by default, the database's primary region).

For information about the table localities CockroachDB supports, see the sections:

- [Regional tables](#regional-tables) provide low-latency reads and writes for an entire table from **a single region**.
- [Regional by row tables](#regional-by-row-tables) provide low-latency reads and writes for one or more rows of a table from **a single region**. Different rows in the table can be optimized for access from **different regions**.
- [Global tables](#global-tables) are optimized for low-latency reads from **all regions**.

{{site.data.alerts.callout_info}}
Table locality settings are used for optimizing latency under different read and write patterns. If you are optimizing for read and write access to all of your tables from a single region (the primary region), there is nothing else you need to do once you set your [database's primary region]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions).
{{site.data.alerts.end}}

## Regional tables

{% include {{page.version.version}}/sql/regional-table-description.md %}

## Regional by row tables

{% include {{page.version.version}}/sql/regional-by-row-table-description.md %}

To change the column or expression used to determine row locality for a regional by row table defined with `REGIONAL BY ROW AS {column}`, refer to [Modify the region column or its expression]({% link {{ page.version.version }}/alter-table.md %}#modify-rbr-region-column).

### Indexes on `REGIONAL BY ROW` tables

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

This behavior also applies to [GIN indexes]({% link {{ page.version.version }}/inverted-indexes.md %}).

For an example that uses unique indexes but applies to all indexes on `REGIONAL BY ROW` tables, see [Add a unique index to a `REGIONAL BY ROW` table]({% link {{ page.version.version }}/alter-table.md %}#add-a-unique-index-to-a-regional-by-row-table).

Regional by row tables can take advantage of [hash-sharded indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %}) provided the `crdb_region` column is not part of the columns in the hash-sharded index.

## Global tables

{% include {{page.version.version}}/sql/global-table-description.md %}

## When to use regional vs. global tables

Use a [`REGIONAL` table locality]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) if:

- Your application requires low-latency reads and writes from a single region (either at the [row level]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) or the [table level]({% link {{ page.version.version }}/table-localities.md %}#regional-tables)).
- Access to the table's data can be slower (higher latency) from other regions.

Use a [`GLOBAL` table locality]({% link {{ page.version.version }}/table-localities.md %}#global-tables) if:

- Your application has a "read-mostly" table of reference data that is rarely updated, and that needs to be available to all regions.
- You can accept that writes to the table will incur higher latencies from any given region, since writes use a novel [non-blocking transaction protocol]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#non-blocking-transactions) that uses a timestamp "in the future". Note that the observed write latency is dependent on the [`--max-offset`]({% link {{ page.version.version }}/cockroach-start.md %}#flags-max-offset) setting.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

## See also

- [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %})
- [How to Choose a Multi-Region Configuration]({% link {{ page.version.version }}/choosing-a-multi-region-configuration.md %})
- [When to Use `ZONE` vs. `REGION` Survival Goals]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#when-to-use-zone-vs-region-survival-goals)
- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
- [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %})
- [Disaster Recovery]({% link {{ page.version.version }}/disaster-recovery-planning.md %})
- [Migrate to Multi-Region SQL]({% link {{ page.version.version }}/migrate-to-multiregion-sql.md %})
- [Secondary regions]({% link {{ page.version.version }}/multiregion-overview.md %}#secondary-regions)
- [`SET SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-secondary-region)
- [`DROP SECONDARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#drop-secondary-region)


For an in-depth data placement support comparison and a demonstration of how the [Federal Wire Act (1961)](https://en.wikipedia.org/wiki/Federal_Wire_Act) can only be satisfied with CockroachDB, watch the following video:

{% include_cached youtube.html video_id="3p9VcZOf1Y4" %}
