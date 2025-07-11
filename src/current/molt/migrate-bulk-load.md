---
title: Bulk Load Migration
summary: Learn how to migrate data from a PostgreSQL or MySQL database into a CockroachDB cluster.
toc: true
docs_area: migrate
---

Use `data-load` mode to perform a one-time bulk load of source data into CockroachDB.

{% include molt/molt-setup.md %}

## Load data into CockroachDB

Perform the bulk load of the source data.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB, specifying [`--mode data-load`]({% link molt/molt-fetch.md %}#fetch-mode) to perform a one-time data load. This example command passes the source and target connection strings [as environment variables](#secure-connections), writes [intermediate files](#intermediate-file-storage) to S3 storage, and uses the `truncate-if-exists` [table handling mode](#table-handling-mode) to truncate the target tables before loading data. It also limits the migration to a single schema and filters three specific tables to migrate. The [data load mode](#data-load-mode) defaults to `IMPORT INTO`.

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
	--mode data-load
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
	--mode data-load
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
	--mode 'data-load'
	~~~
	</section>

{% include molt/fetch-data-load-output.md %}

<section class="filter-content" markdown="1" data-scope="postgres mysql">
## Verify the data load

{% include molt/verify-output.md %}
</section>

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