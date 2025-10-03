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

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB. This example command passes the source and target connection strings [as environment variables](#secure-connections), writes [intermediate files](#intermediate-file-storage) to S3 storage, and uses the `truncate-if-exists` [table handling mode](#table-handling-mode) to truncate the target tables before loading data. It also limits the migration to a single schema and filters three specific tables to migrate. The [data load mode](#data-load-mode) defaults to `IMPORT INTO`.

	<section class="filter-content" markdown="1" data-scope="postgres">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists \
		~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	The command assumes an Oracle Multitenant (CDB/PDB) source. `--source-cdb` specifies the container database (CDB) connection string.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--source-cdb $SOURCE_CDB \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists \
		~~~
	</section>

{% include molt/fetch-data-load-output.md %}

## Verify the data load

Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the source and target data is consistent. This ensures that the data load was successful.

{% include molt/verify-output.md %}

## Configure Replicator

### Replication flags

{% include molt/replicator-flags-usage.md %}

<section class="filter-content" markdown="1" data-scope="postgres oracle">
### Tuning parameters

{% include molt/optimize-replicator-performance.md %}
</section>

{% include molt/replicator-metrics.md %}

## Start Replicator

With initial load complete, start replication of ongoing changes on the source to CockroachDB using [MOLT Replicator]({% link molt/molt-replicator.md %}).

<section class="filter-content" markdown="1" data-scope="postgres">
1. Run the `replicator` command, specifying the same `--slotName` value that you configured during [source database setup](#configure-source-database-for-replication). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator pglogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.public \
	--slotName molt_slot \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--verbose
	~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
1. Get the executed GTID set from the MySQL source, which shows what transactions have been applied on the source database. Use the `Executed_Gtid_Set` value as your `--defaultGTIDSet`:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	-- For MySQL < 8.0:
	SHOW MASTER STATUS;
	-- For MySQL 8.0+:
	SHOW BINARY LOG STATUS;
	~~~

	~~~
	+---------------+----------+--------------+------------------+-------------------------------------------+
	| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set                         |
	+---------------+----------+--------------+------------------+-------------------------------------------+
	| binlog.000005 |      197 |              |                  | 77263736-7899-11f0-81a5-0242ac120002:1-38 |
	+---------------+----------+--------------+------------------+-------------------------------------------+
	~~~

1. Run the `replicator` command, specifying the GTID set from the previous step. Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator mylogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--targetSchema defaultdb.public \
	--defaultGTIDSet 77263736-7899-11f0-81a5-0242ac120002:1-38 \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts \
	--verbose
	~~~

	{{site.data.alerts.callout_success}}
	For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON source_database.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
	{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
1. Run the `replicator` command, specifying the backfill and starting SCN from the [checkpoint recorded during data load](#start-fetch). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator oraclelogminer \
	--sourceConn $SOURCE \
	--sourcePDBConn $SOURCE_PDB \
	--targetConn $TARGET \
	--sourceSchema migration_schema \
	--targetSchema defaultdb.public \
	--backfillFromSCN 26685444 \
	--scn 26685786 \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts \
	--verbose
	~~~

	{{site.data.alerts.callout_info}}
	When filtering out tables in a schema with a userscript, replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
	{{site.data.alerts.end}}
</section>

## Verify replication

1. Verify that Replicator is processing changes successfully. To do so, check the MOLT Replicator logs. Since you enabled debug logging with `--verbose`, you should see connection and row processing messages:

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
	<!-- DEBUG  [Aug 25 15:29:38] progressed to consistent point: 77263736-7899-11f0-81a5-0242ac120002:1-39 -->
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	TODO: Oracle verification logs
	</section>

	These messages confirm successful replication. You can disable verbose logging after verifying the connection.

## Stop replication and verify data

{% include molt/migration-stop-replication.md %}

1. Repeat [Verify the data load](#verify-the-data-load) to verify the updated data.

## Modify the CockroachDB schema

{% include molt/migration-modify-target-schema.md %}

## Cutover

Perform a cutover by resuming application traffic, now to CockroachDB.

{% include molt/molt-troubleshooting.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})
