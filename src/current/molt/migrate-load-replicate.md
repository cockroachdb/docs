---
title: Load and Replicate
summary: Learn how to migrate data from a source database (such as PostgreSQL, MySQL, or Oracle) into a CockroachDB cluster.
toc: true
docs_area: migrate
---

Perform an initial bulk load of the source data using [MOLT Fetch]({% link molt/molt-fetch.md %}), then use [MOLT Replicator]({% link molt/molt-replicator.md %}) to replicate ongoing changes to the target.

{% include molt/crdb-to-crdb-migration.md %}

{% include molt/molt-setup.md %}

## Start Fetch

Perform the initial load of the source data.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB. This example command passes the source and target connection strings [as environment variables](#secure-connections), writes [intermediate files](#intermediate-file-storage) to S3 storage, and uses the `truncate-if-exists` [table handling mode](#table-handling-mode) to truncate the target tables before loading data. It also limits the migration to a single schema and filters three specific tables to migrate. The [data load mode]({% link molt/molt-fetch.md %}#import-into-vs-copy-from) defaults to `IMPORT INTO`.

	<section class="filter-content" markdown="1" data-scope="postgres">
	You **must** include `--pglogical-replication-slot-name` and `--pglogical-publication-and-slot-drop-and-recreate` to automatically create the publication and replication slot during the data load.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists \
	--pglogical-replication-slot-name molt_slot \
	--pglogical-publication-and-slot-drop-and-recreate
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--target $TARGET \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	The command assumes an Oracle Multitenant (CDB/PDB) source. [`--source-cdb`]({% link molt/molt-fetch-commands-and-flags.md %}#source-cdb) specifies the container database (CDB) connection string.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--source-cdb $SOURCE_CDB \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists
	~~~
	</section>

{% include molt/fetch-data-load-output.md %}

## Verify the data load

Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the source and target data is consistent. This ensures that the data load was successful.

{% include molt/verify-output.md %}

## Configure Replicator

When you run `replicator`, you can configure the following options for replication:

- [Replication connection strings](#replication-connection-strings): Specify URL-encoded source and target database connections.
- [Replicator flags](#replicator-flags): Specify required and optional flags to configure replicator behavior.
<section class="filter-content" markdown="1" data-scope="postgres oracle">
- [Tuning parameters](#tuning-parameters): Optimize replication performance and resource usage.
</section>
- [Replicator metrics](#replicator-metrics): Monitor replication progress and performance.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

### Replication connection strings

MOLT Replicator uses `--sourceConn` and `--targetConn` to specify the source and target database connections.

`--sourceConn` specifies the connection string of the source database:

<section class="filter-content" markdown="1" data-scope="postgres">
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
~~~
--sourceConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

For Oracle Multitenant databases, also specify `--sourcePDBConn` with the PDB connection string:

~~~
--sourcePDBConn 'oracle://{username}:{password}@{host}:{port}/{pdb_service_name}'
~~~
</section>

`--targetConn` specifies the target CockroachDB connection string:

~~~
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

{{site.data.alerts.callout_success}}
Follow best practices for securing connection strings. Refer to [Secure connections](#secure-connections).
{{site.data.alerts.end}}

### Replicator flags

{% include molt/replicator-flags-usage.md %}

<section class="filter-content" markdown="1" data-scope="postgres oracle">
### Tuning parameters

{% include molt/optimize-replicator-performance.md %}
</section>

### Replicator metrics

MOLT Replicator metrics are not enabled by default. Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following flag exposes metrics on port `30005`:

~~~ 
--metricsAddr :30005
~~~

<section class="filter-content" markdown="1" data-scope="postgres">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=postgres).
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=mysql).
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=oracle).
</section>

## Start Replicator

With initial load complete, start replication of ongoing changes on the source to CockroachDB using [MOLT Replicator]({% link molt/molt-replicator.md %}).

{{site.data.alerts.callout_info}}
MOLT Fetch captures a consistent point-in-time checkpoint at the start of the data load (shown as `cdc_cursor` in the fetch output). Starting replication from this checkpoint ensures that all changes made during and after the data load are replicated to CockroachDB, preventing data loss or duplication. The following steps use the checkpoint values from the fetch output to start replication at the correct position.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="postgres">
1. Run the `replicator` command, using the same slot name that you specified with `--pglogical-replication-slot-name` and the publication name created by `--pglogical-publication-and-slot-drop-and-recreate` in the [Fetch command](#start-fetch). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator pglogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.migration_schema \
	--slotName molt_slot \
	--publicationName molt_fetch \
	--stagingSchema defaultdb._replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	-v
	~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
1. Run the `replicator` command, specifying the GTID from the [checkpoint recorded during data load](#start-fetch). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database. If you [filtered tables during the initial load](#schema-and-table-filtering), [write a userscript to filter tables on replication]({% link molt/userscript-cookbook.md %}#filter-multiple-tables) and specify the path with `--userscript`.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator mylogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.public \
	--defaultGTIDSet 4c658ae6-e8ad-11ef-8449-0242ac140006:1-29 \
	--stagingSchema defaultdb._replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts \
	-v
	~~~

	{{site.data.alerts.callout_success}}
	For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON migration_db.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
	{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
1. Run the `replicator` command, specifying the backfill and starting SCN from the [checkpoint recorded during data load](#start-fetch). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database. If you [filtered tables during the initial load](#schema-and-table-filtering), [write a userscript to filter tables on replication]({% link molt/userscript-cookbook.md %}#filter-multiple-tables) and specify the path with `--userscript`.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator oraclelogminer \
	--sourceConn $SOURCE \
	--sourcePDBConn $SOURCE_PDB \
	--targetConn $TARGET \
	--sourceSchema MIGRATION_USER \
	--targetSchema defaultdb.migration_schema \
	--backfillFromSCN 26685444 \
	--scn 26685786 \
	--stagingSchema defaultdb._replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts \
	-v
	~~~

	{{site.data.alerts.callout_info}}
	When [filtering out tables in a schema with a userscript]({% link molt/userscript-cookbook.md %}#filter-multiple-tables), replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
	{{site.data.alerts.end}}
</section>

## Verify replication

1. Verify that Replicator is processing changes successfully. To do so, check the MOLT Replicator logs. Since you enabled debug logging with `-v`, you should see connection and row processing messages:

	<section class="filter-content" markdown="1" data-scope="postgres">
	You should see periodic primary keepalive messages:

	~~~
	DEBUG  [Aug 25 14:38:10] primary keepalive received                    ReplyRequested=false ServerTime="2025-08-25 14:38:09.556773 -0500 CDT" ServerWALEnd=0/49913A58
	DEBUG  [Aug 25 14:38:15] primary keepalive received                    ReplyRequested=false ServerTime="2025-08-25 14:38:14.556836 -0500 CDT" ServerWALEnd=0/49913E60
	~~~

	When rows are successfully replicated, you should see debug output like the following:

	~~~
	DEBUG  [Aug 25 14:40:02] upserted rows                                 conflicts=0 duration=7.855333ms proposed=1 target="\"molt\".\"public\".\"tbl1\"" upserted=1
	DEBUG  [Aug 25 14:40:02] progressed to LSN: 0/49915DD0
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	You should see binlog syncer connection and row processing:

	~~~
	[2025/08/25 15:29:09] [info] binlogsyncer.go:463 begin to sync binlog from GTID set 77263736-7899-11f0-81a5-0242ac120002:1-38
	[2025/08/25 15:29:09] [info] binlogsyncer.go:409 Connected to mysql 8.0.43 server
	INFO   [Aug 25 15:29:09] connected to MySQL version 8.0.43
	~~~

	When rows are successfully replicated, you should see debug output like the following:

	~~~
	DEBUG  [Aug 25 15:29:38] upserted rows                                 conflicts=0 duration=1.801ms proposed=1 target="\"molt\".\"public\".\"tbl1\"" upserted=1
	DEBUG  [Aug 25 15:29:38] progressed to consistent point: 77263736-7899-11f0-81a5-0242ac120002:1-39
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	When transactions are read from the Oracle source, you should see registered transaction IDs (XIDs):

	~~~
	DEBUG  [Jul  3 15:55:12] registered xid 0f001f0040060000
	DEBUG  [Jul  3 15:55:12] registered xid 0b001f00bb090000
	~~~

	When rows are successfully replicated, you should see debug output like the following:

	~~~
	DEBUG  [Jul  3 15:55:12] upserted rows                                 conflicts=0 duration=2.620009ms proposed=13 target="\"molt_movies\".\"USERS\".\"CUSTOMER_CONTACT\"" upserted=13
	DEBUG  [Jul  3 15:55:12] upserted rows                                 conflicts=0 duration=2.212807ms proposed=16 target="\"molt_movies\".\"USERS\".\"CUSTOMER_DEVICE\"" upserted=16
	~~~
	</section>

	These messages confirm successful replication. You can disable verbose logging after verifying the connection.

## Stop replication and verify data

{% include molt/migration-stop-replication.md %}

1. Repeat [Verify the data load](#verify-the-data-load) to verify the updated data.

## Add constraints and indexes

{% include molt/migration-modify-target-schema.md %}

## Cutover

Perform a cutover by resuming application traffic, now to CockroachDB.

## Troubleshooting

{% include molt/molt-troubleshooting-fetch.md %}
{% include molt/molt-troubleshooting-replication.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})
