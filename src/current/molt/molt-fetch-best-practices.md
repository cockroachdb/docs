---
title: MOLT Fetch Best Practices
summary: Learn best practices for using MOLT Fetch to migrate data to CockroachDB.
toc: true
docs_area: migrate
---

This page describes best practices for using [MOLT Fetch]({% link molt/molt-fetch.md %}) to ensure reliable, secure, and performant data migration to CockroachDB.

## Test and validate

To verify that your connections and configuration work properly, run MOLT Fetch in a staging environment before migrating any data in production. Use a test or development environment that closely resembles production.

## Configure the source database and connection

- To prevent connections from terminating prematurely during the [data export phase]({% link molt/molt-fetch.md %}#data-export-phase), set the following to high values on the source database:

	- **Maximum allowed number of connections.** MOLT Fetch can export data across multiple connections. The number of connections it will create is the number of shards ([`--export-concurrency`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags)) multiplied by the number of tables ([`--table-concurrency`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags)) being exported concurrently.

		{{site.data.alerts.callout_info}}
		With the default numerical range sharding, only tables with [primary key]({% link {{ site.current_cloud_version }}/primary-key.md %}) types of [`INT`]({% link {{ site.current_cloud_version }}/int.md %}), [`FLOAT`]({% link {{ site.current_cloud_version }}/float.md %}), or [`UUID`]({% link {{ site.current_cloud_version }}/uuid.md %}) can be sharded. PostgreSQL users can enable [`--use-stats-based-sharding`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) to use statistics-based sharding for tables with primary keys of any data type. For details, refer to [Table sharding]({% link molt/molt-fetch.md %}#shard-tables-for-concurrent-export).
		{{site.data.alerts.end}}

	- **Maximum lifetime of a connection.**

- If a PostgreSQL database is set as a [source]({% link molt/molt-fetch.md %}#specify-source-and-target-databases), ensure that [`idle_in_transaction_session_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT) on PostgreSQL is either disabled or set to a value longer than the duration of the [data export phase]({% link molt/molt-fetch.md %}#data-export-phase). Otherwise, the connection will be prematurely terminated. To estimate the time needed to export the PostgreSQL tables, you can perform a dry run and sum the value of [`molt_fetch_table_export_duration_ms`]({% link molt/molt-fetch-monitoring.md %}#metrics) for all exported tables.

## Optimize performance

- {% include molt/molt-drop-constraints-indexes.md %}

- For PostgreSQL sources using [`--use-stats-based-sharding`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags), run [`ANALYZE`]({% link {{ site.current_cloud_version }}/create-statistics.md %}) on source tables before migration to ensure optimal shard distribution. This is especially important for large tables where even distribution can significantly improve export performance.

- To prevent memory outages during `READ COMMITTED` [data export]({% link molt/molt-fetch.md %}#data-export-phase) of tables with large rows, estimate the amount of memory used to export a table:

	~~~
	--row-batch-size * --export-concurrency * average size of the table rows
	~~~

	If you are exporting more than one table at a time (i.e., [`--table-concurrency`]({% link molt/molt-fetch-commands-and-flags.md %}#global-flags) is set higher than `1`), add the estimated memory usage for the tables with the largest row sizes. Ensure that you have sufficient memory to run `molt fetch`, and adjust [`--row-batch-size`]({% link molt/molt-fetch-commands-and-flags.md %}#row-batch-size) accordingly. For details on how concurrency and sharding interact, refer to [Table sharding]({% link molt/molt-fetch.md %}#shard-tables-for-concurrent-export).

- If a table in the source database is much larger than the other tables, [filter and export the largest table]({% link molt/molt-fetch.md %}#schema-and-table-selection) in its own `molt fetch` task. Repeat this for each of the largest tables. Then export the remaining tables in another task.

- Ensure that the machine running MOLT Fetch is large enough to handle the amount of data being migrated. Fetch performance can sometimes be limited by available resources, but should always be making progress. To identify possible resource constraints, observe the `molt_fetch_rows_exported` [metric]({% link molt/molt-fetch-monitoring.md %}#metrics) for decreases in the number of rows being processed. You can use the [sample Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) to view metrics. For details on optimizing export performance through sharding, refer to [Table sharding]({% link molt/molt-fetch.md %}#shard-tables-for-concurrent-export).

## Import and continuation handling

- When using [`IMPORT INTO`]({% link molt/molt-fetch.md %}#import-into-vs-copy-from) during the [data import phase]({% link molt/molt-fetch.md %}#data-import-phase) to load tables into CockroachDB, if the fetch task terminates before the import job completes, the hanging import job on the target database will keep the table offline. To make this table accessible again, [manually resume or cancel the job]({% link {{site.current_cloud_version}}/import-into.md %}#view-and-control-import-jobs). Then resume `molt fetch` using [continuation]({% link molt/molt-fetch.md %}#continue-molt-fetch-after-interruption), or restart the task from the beginning.

## Security

Cockroach Labs strongly recommends the following security practices.

### Connection security

{% include molt/molt-secure-connection-strings.md %}

{{site.data.alerts.callout_info}}
By default, insecure connections (i.e., `sslmode=disable` on PostgreSQL; `sslmode` not set on MySQL) are disallowed. When using an insecure connection, `molt fetch` returns an error. To override this check, you can enable the [`--allow-tls-mode-disable`]({% link molt/molt-fetch-commands-and-flags.md %}#allow-tls-mode-disable) flag. Do this **only** when testing, or if a secure SSL/TLS connection to the source or target database is not possible.
{{site.data.alerts.end}}

### Cloud storage security

{% include molt/fetch-secure-cloud-storage.md %}

## See also

- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
