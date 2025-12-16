---
title: MOLT Fetch Best Practices
summary: Learn the best ways to run MOLT Fetch, considering individual business and technical constraints.
toc: true
docs_area: migrate
---

## Security

Cockroach Labs strongly recommends the following security practices.

### Connection security

{% include molt/molt-secure-connection-strings.md %}

{{site.data.alerts.callout_info}}
By default, insecure connections (i.e., `sslmode=disable` on PostgreSQL; `sslmode` not set on MySQL) are disallowed. When using an insecure connection, `molt fetch` returns an error. To override this check, you can enable the `--allow-tls-mode-disable` flag. Do this **only** when testing, or if a secure SSL/TLS connection to the source or target database is not possible.
{{site.data.alerts.end}}

### Cloud storage security

{% include molt/fetch-secure-cloud-storage.md %}

## Best practices

### Test and validate

To verify that your connections and configuration work properly, run MOLT Fetch in a staging environment before migrating any data in production. Use a test or development environment that closely resembles production.

### Configure the source database and connection

- To prevent connections from terminating prematurely during the [data export phase](#data-export-phase), set the following to high values on the source database:

    - **Maximum allowed number of connections.** MOLT Fetch can export data across multiple connections. The number of connections it will create is the number of shards ([`--export-concurrency`](#global-flags)) multiplied by the number of tables ([`--table-concurrency`](#global-flags)) being exported concurrently.

        {{site.data.alerts.callout_info}}
        With the default numerical range sharding, only tables with [primary key]({% link {{ site.current_cloud_version }}/primary-key.md %}) types of [`INT`]({% link {{ site.current_cloud_version }}/int.md %}), [`FLOAT`]({% link {{ site.current_cloud_version }}/float.md %}), or [`UUID`]({% link {{ site.current_cloud_version }}/uuid.md %}) can be sharded. PostgreSQL users can enable [`--use-stats-based-sharding`](#global-flags) to use statistics-based sharding for tables with primary keys of any data type. For details, refer to [Table sharding](#table-sharding).
        {{site.data.alerts.end}}

    - **Maximum lifetime of a connection.**

- If a PostgreSQL database is set as a [source](#source-and-target-databases), ensure that [`idle_in_transaction_session_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT) on PostgreSQL is either disabled or set to a value longer than the duration of the [data export phase](#data-export-phase). Otherwise, the connection will be prematurely terminated. To estimate the time needed to export the PostgreSQL tables, you can perform a dry run and sum the value of [`molt_fetch_table_export_duration_ms`](#monitoring) for all exported tables.

### Optimize performance

- {% include molt/molt-drop-constraints-indexes.md %}

- For PostgreSQL sources using [`--use-stats-based-sharding`](#global-flags), run [`ANALYZE`]({% link {{ site.current_cloud_version }}/create-statistics.md %}) on source tables before migration to ensure optimal shard distribution. This is especially important for large tables where even distribution can significantly improve export performance.

- To prevent memory outages during `READ COMMITTED` [data export](#data-export-phase) of tables with large rows, estimate the amount of memory used to export a table:

    ~~~
    --row-batch-size * --export-concurrency * average size of the table rows
    ~~~

    If you are exporting more than one table at a time (i.e., [`--table-concurrency`](#global-flags) is set higher than `1`), add the estimated memory usage for the tables with the largest row sizes. Ensure that you have sufficient memory to run `molt fetch`, and adjust `--row-batch-size` accordingly. For details on how concurrency and sharding interact, refer to [Table sharding](#table-sharding).

- If a table in the source database is much larger than the other tables, [filter and export the largest table](#schema-and-table-selection) in its own `molt fetch` task. Repeat this for each of the largest tables. Then export the remaining tables in another task.

- Ensure that the machine running MOLT Fetch is large enough to handle the amount of data being migrated. Fetch performance can sometimes be limited by available resources, but should always be making progress. To identify possible resource constraints, observe the `molt_fetch_rows_exported` [metric](#monitoring) for decreases in the number of rows being processed. You can use the [sample Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) to view metrics. For details on optimizing export performance through sharding, refer to [Table sharding](#table-sharding).

### Import and continuation handling

- When using [`IMPORT INTO`](#data-load-mode) during the [data import phase](#data-import-phase) to load tables into CockroachDB, if the fetch task terminates before the import job completes, the hanging import job on the target database will keep the table offline. To make this table accessible again, [manually resume or cancel the job]({% link {{site.current_cloud_version}}/import-into.md %}#view-and-control-import-jobs). Then resume `molt fetch` using [continuation](#fetch-continuation), or restart the task from the beginning.

## See also

- X
