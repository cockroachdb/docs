---
title: Load and Replicate Separately
summary: Learn how to migrate data from a PostgreSQL or MySQL database into a CockroachDB cluster.
toc: true
docs_area: migrate
---

{% assign tab_names_html = "Load and replicate;Replicate separately" %}
{% assign html_page_filenames = "migrate-data-load-and-replication.html;migrate-data-load-replicate-only.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder="molt" %}

Perform an initial bulk load of the source data using `data-load` mode, then use `replication-only` mode to replicate ongoing changes to the target.

{{site.data.alerts.callout_success}}
You can also [load and replicate in a single command]({% link molt/migrate-data-load-and-replication.md %}) using `data-load-and-replication`.
{{site.data.alerts.end}}

{% include molt/molt-setup.md %}

## Load data into CockroachDB

Perform the initial load of the source data.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB, specifying [`--mode data-load`]({% link molt/molt-fetch.md %}#fetch-mode) to perform a one-time data load. This example command passes the source and target connection strings [as environment variables](#secure-connections), writes [intermediate files](#intermediate-file-storage) to S3 storage, and uses the `truncate-if-exists` [table handling mode](#table-handling-mode) to truncate the target tables before loading data. It also limits the migration to a single schema and filters three specific tables to migrate. The [data load mode](#data-load-mode) defaults to `IMPORT INTO`.

	<section class="filter-content" markdown="1" data-scope="postgres">
	Specify a replication slot name with `--pglogical-replication-slot-name`. This is required for [replication in a subsequent step](#replicate-changes-to-cockroachdb).

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \ 
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--bucket-path 's3://migration/data/cockroach' \
	--table-handling truncate-if-exists \
	--pglogical-replication-slot-name cdc_slot \
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
	--mode data-load
	~~~
	</section>

{% include molt/fetch-data-load-output.md %}

## Verify the data load

Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the source and target data is consistent. This ensures that the data load was successful.

{% include molt/verify-output.md %}

## Replicate changes to CockroachDB

With initial load complete, start replication of ongoing changes on the source to CockroachDB.

<a id="replication-flags"></a>
{% include molt/fetch-replicator-flags.md %}

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to start replication on CockroachDB, specifying [`--mode replication-only`]({% link molt/molt-fetch.md %}#fetch-mode). For details on `--replicator-flags`, refer to [Replication flags](#replication-flags). In this example, the `--metricsAddr :30005` replication flag enables a Prometheus endpoint at `http://localhost:30005/_/varz` where replication metrics will be served. You can use these metrics to [verify that replication has drained](#stop-replication-and-verify-data) in a later step.

	<section class="filter-content" markdown="1" data-scope="postgres">
	Be sure to specify the same `--pglogical-replication-slot-name` value that you provided in [Load data into CockroachDB](#load-data-into-cockroachdb).

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \ 
	--target $TARGET \
	--table-filter 'employees|payments|orders' \
	--pglogical-replication-slot-name cdc_slot \
	--replicator-flags '--metricsAddr :30005' \
	--mode replication-only
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \ 
	--target $TARGET \
	--table-filter 'employees|payments|orders' \
	--non-interactive \
	--replicator-flags '--defaultGTIDSet 4c658ae6-e8ad-11ef-8449-0242ac140006:1-29 --metricsAddr :30005 --userscript table_filter.ts' \
	--mode replication-only
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="oracle">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source $SOURCE \
	--source-cdb $SOURCE_CDB \
	--target $TARGET \
	--schema-filter 'migration_schema' \
	--table-filter 'employees|payments|orders' \
	--replicator-flags '--backfillFromSCN 26685444 --scn 26685786 --metricsAddr :30005 --userscript table_filter.ts' \
	--mode 'replication-only'
	~~~
	</section>
	
{% include molt/fetch-replication-output.md %}

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