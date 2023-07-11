---
title: Table Localities
summary: Learn how to use table localities in a CockroachDB multi-region cluster.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: deploy
---

_Table locality_ determines how CockroachDB optimizes access to the table's data. Every table in a multi-region database has a "table locality setting" that configures one or more *home regions* at the table or row level. A table or row's home region is where the [leaseholder](architecture/replication-layer.html#leases) of its ranges is placed, along with a number of voting replicas determined by the [survival goal](multiregion-survival-goals.html#when-to-use-zone-vs-region-survival-goals) of the database.

By default, all tables in a multi-region database are _regional_ tables—that is, CockroachDB optimizes access to the table's data from a single home region (by default, the database's primary region).

For information about the table localities CockroachDB supports, see the sections:

- [Regional tables](#regional-tables) provide low-latency reads and writes for an entire table from _a single region_.
- [Regional by row tables](#regional-by-row-tables) provide low-latency reads and writes for one or more rows of a table from _a single region_. Different rows in the table can be optimized for access from _different regions_.
- [Global tables](#global-tables) are optimized for low-latency reads from _all regions_.

{{site.data.alerts.callout_info}}
Table locality settings are used for optimizing latency under different read and write patterns. If you are optimizing for read and write access to all of your tables from a single region (the primary region), there is nothing else you need to do once you set your [database's primary region](multiregion-overview.html#database-regions).
{{site.data.alerts.end}}

## Regional tables

{% include {{page.version.version}}/sql/regional-table-description.md %}

## Regional by row tables

{% include {{page.version.version}}/sql/regional-by-row-table-description.md %}

### Indexes on `REGIONAL BY ROW` tables

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

This behavior also applies to [GIN indexes](inverted-indexes.html).

For an example that uses unique indexes but applies to all indexes on `REGIONAL BY ROW` tables, see [Add a unique index to a `REGIONAL BY ROW` table](alter-table.html#add-a-unique-index-to-a-regional-by-row-table).

Regional by row tables can take advantage of [hash-sharded indexes](hash-sharded-indexes.html) provided the `crdb_region` column is not part of the columns in the hash-sharded index.

## Global tables

{% include {{page.version.version}}/sql/global-table-description.md %}

## When to use regional vs. global tables

Use a [`REGIONAL` table locality](table-localities.html#regional-by-row-tables) if:

- Your application requires low-latency reads and writes from a single region (either at the [row level](table-localities.html#regional-by-row-tables) or the [table level](table-localities.html#regional-tables)).
- Access to the table's data can be slower (higher latency) from other regions.

Use a [`GLOBAL` table locality](table-localities.html#global-tables) if:

- Your application has a "read-mostly" table of reference data that is rarely updated, and that needs to be available to all regions.
- You can accept that writes to the table will incur higher latencies from any given region, since writes use a novel [non-blocking transaction protocol](architecture/transaction-layer.html#non-blocking-transactions) that uses a timestamp "in the future". Note that the observed write latency is dependent on the [`--max-offset`](cockroach-start.html#flags-max-offset) setting.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/misc/multiregion-max-offset.md %}
{{site.data.alerts.end}}

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [How to Choose a Multi-Region Configuration](choosing-a-multi-region-configuration.html)
- [When to Use `ZONE` vs. `REGION` Survival Goals](multiregion-survival-goals.html#when-to-use-zone-vs-region-survival-goals)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
- [Topology Patterns](topology-patterns.html)
- [Disaster Recovery](disaster-recovery.html)
- [Migrate to Multi-Region SQL](migrate-to-multiregion-sql.html)
- [Secondary regions](multiregion-overview.html#secondary-regions)
- [`SET SECONDARY REGION`](alter-database.html#set-secondary-region)
- [`DROP SECONDARY REGION`](alter-database.html#drop-secondary-region)


