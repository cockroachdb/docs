---
title: Load and Replicate
summary: Learn how to migrate data from a source database (such as PostgreSQL, MySQL, or Oracle) into a CockroachDB cluster.
toc: true
docs_area: migrate
---


Perform an initial bulk load of the source data using MOLT Fetch, then use MOLT Replicator to replicate ongoing changes to the target.


{% include molt/molt-setup.md %}

## Load data into CockroachDB

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

## Replicate changes to CockroachDB

With initial load complete, start replication of ongoing changes on the source to CockroachDB using [MOLT Replicator]({% link molt/molt-replicator.md %}).

1. Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) command to start replication. In this example, `--metricsAddr :30005` enables a Prometheus endpoint at `http://localhost:30005/_/varz` where replication metrics will be served. You can use these metrics to [verify that replication has drained](#stop-replication-and-verify-data) in a later step.

	<section class="filter-content" markdown="1" data-scope="postgres">
	Use the `replicator pglogical` command to replicate from PostgreSQL using logical replication. Be sure to specify the same `--slotName` value that you configured during source database setup. Use `--stagingSchema` to specify a unique name for the staging database (can be any arbitrary name), and include `--stagingCreateSchema` so MOLT Replicator creates the staging database for you.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator pglogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--slotName cdc_slot \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	Use the `replicator mylogical` command to replicate from MySQL using GTID-based replication. Specify the starting GTID set from the checkpoint recorded during data load. Use `--stagingSchema` to specify a unique name for the staging database (can be any arbitrary name), and include `--stagingCreateSchema` so MOLT Replicator creates the staging database for you.

	To get the correct starting GTID set, run `SHOW MASTER STATUS` on the MySQL source before starting replication. Use the `Executed_Gtid_Set` value as your `--defaultGTIDSet`. Ensure the GTID is valid and not purged.

	For older MySQL versions that don't support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions to query schema information from the source.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator mylogical \
	--sourceConn $SOURCE \
	--targetConn $TARGET \
	--defaultGTIDSet 4c658ae6-e8ad-11ef-8449-0242ac140006:1-29 \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts
	~~~

	If you need to restart from a different `--defaultGTIDSet`, first clear the staging database memo table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	DELETE FROM _replicator.memo;
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	Use the `replicator oraclelogminer` command to replicate from Oracle using LogMiner. Specify the backfill and starting SCN from the checkpoint recorded during data load. Use `--stagingSchema` to specify a unique name for the staging database (can be any arbitrary name), and include `--stagingCreateSchema` so MOLT Replicator creates the staging database for you.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	replicator oraclelogminer \
	--sourceConn $SOURCE \
	--sourcePDBConn $SOURCE_PDB \
	--sourceSchema migration_schema \
	--targetConn $TARGET \
	--backfillFromSCN 26685444 \
	--scn 26685786 \
	--stagingSchema _replicator \
	--stagingCreateSchema \
	--metricsAddr :30005 \
	--userscript table_filter.ts
	~~~
	</section>

	MOLT Replicator will display replication status and metrics as it processes changes from the source database.

## Stop replication and verify data

{% include molt/migration-stop-replication.md %}

1. Repeat [Verify the data load](#verify-the-data-load) to verify the updated data.

## Modify the CockroachDB schema

{% include molt/migration-modify-target-schema.md %}

## Cutover

Perform a cutover by resuming application traffic, now to CockroachDB.

## Troubleshoot replication issues

<section class="filter-content" markdown="1" data-scope="postgres">
### PostgreSQL replication issues

#### Publication does not exist

~~~
run CREATE PUBLICATION molt_fetch FOR ALL TABLES;
~~~

**Resolution:** Create the publication on the source database:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE PUBLICATION molt_publication FOR ALL TABLES;
~~~

#### Could not connect to PostgreSQL

~~~
could not connect to source database: failed to connect to `user=postgres database=molt`
~~~

**Resolution:** Verify the connection details including user, host, port, and database name. Check if TLS certificates need to be included in the connection URI.

#### Wrong replication slot name

~~~
run SELECT pg_create_logical_replication_slot('slot_name', 'pgoutput'); in source database
~~~

**Resolution:** Create the replication slot or verify the correct slot name:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT pg_create_logical_replication_slot('molt_slot', 'pgoutput');
~~~

#### Resuming from stale location

**Resolution:** Clear the `_replicator.memo` table to remove stale LSN checkpoints:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM _replicator.memo;
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
### MySQL replication issues

#### Repeated binlog syncing restarts

**Symptoms:** Replicator repeatedly restarts binlog syncing, indicating an invalid or purged GTID.

**Resolution:** Verify the GTID set is valid and not purged:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Check if GTID is in executed set
SELECT GTID_SUBSET('your-gtid-set', @@GLOBAL.gtid_executed) AS in_executed;

-- Check if GTID is purged
SELECT GTID_SUBSET('your-gtid-set', @@GLOBAL.gtid_purged) AS in_purged;
~~~

If the GTID is purged, restart replication from a newer GTID and increase binlog retention:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Get current GTID set
SHOW MASTER STATUS;
~~~

#### Invalid GTID format

**Resolution:** Use a valid GTID from `SHOW MASTER STATUS` and ensure you're connecting to the master host.

#### Stale GTID from cache

**Resolution:** Clear the `_replicator` database memo table:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM _replicator.memo;
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
### Oracle replication issues

#### Table/column names exceed 30 characters

Oracle LogMiner excludes tables and columns with names longer than 30 characters from redo logs.

**Resolution:** Rename tables and columns to 30 characters or fewer before migration.

#### Unsupported data types

LogMiner and replication do not support:
- Long BLOB/CLOBs (4000+ characters)
- User-defined types (UDTs)
- Nested tables
- Varrays

**Resolution:** Convert unsupported data types or exclude affected tables from replication.

#### LOB column UPDATE statements

UPDATE statements that only modify LOB columns are not supported by Oracle LogMiner.

**Resolution:** Avoid LOB-only updates during replication, or use Binary Reader for Oracle 12c.
</section>

{% include molt/molt-troubleshooting.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})