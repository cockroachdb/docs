---
title: Bulk Load Migration
summary: Learn how to migrate data from a source database (such as PostgreSQL, MySQL, or Oracle) into a CockroachDB cluster.
toc: true
docs_area: migrate
---

Perform a one-time bulk load of source data into CockroachDB.

{% include molt/crdb-to-crdb-migration.md %}

{% include molt/molt-setup.md %}

## Start Fetch

Perform the bulk load of the source data.

1. Run the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data into CockroachDB. This example command passes the source and target connection strings [as environment variables](#secure-connections), writes [intermediate files](#intermediate-file-storage) to S3 storage, and uses the `truncate-if-exists` [table handling mode](#table-handling-mode) to truncate the target tables before loading data. It limits the migration to a single schema and filters for three specific tables. The [data load mode](#data-load-mode) defaults to `IMPORT INTO`. Include the `--ignore-replication-check` flag to skip replication checkpoint queries, which eliminates the need to configure the source database for logical replication.

	<section class="filter-content" markdown="1" data-scope="postgres">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists \
	--ignore-replication-check
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
	--table-handling truncate-if-exists \
	--ignore-replication-check
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
	--ignore-replication-check
	~~~
	</section>

{% include molt/fetch-data-load-output.md %}

## Verify the data load

{% include molt/verify-output.md %}

## Add constraints and indexes

{% include molt/migration-modify-target-schema.md %}

## Cutover

Perform a cutover by resuming application traffic, now to CockroachDB.

## Troubleshooting

{% include molt/molt-troubleshooting-fetch.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})