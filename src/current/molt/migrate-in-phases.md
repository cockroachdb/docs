---
title: Migrate to CockroachDB in Phases
summary: Learn how to migrate data in phases from a PostgreSQL or MySQL database into a CockroachDB cluster.
toc: true
docs_area: migrate
---

A phased migration to CockroachDB uses the [MOLT tools]({% link molt/migration-overview.md %}) to [convert your source schema](#step-2-prepare-the-source-schema), incrementally [load source data](#step-3-load-data-into-cockroachdb) and [verify the results](#step-4-verify-the-data-load), and finally [replicate ongoing changes](#step-6-replicate-changes-to-cockroachdb) before performing cutover.

{% assign tab_names_html = "Load and replicate;Phased migration;Failback" %}
{% assign html_page_filenames = "migrate-to-cockroachdb.html;migrate-in-phases.html;migrate-failback.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder="molt" %}

## Before you begin

- Review the [Migration Overview]({% link molt/migration-overview.md %}).
- Install the [MOLT (Migrate Off Legacy Technology)]({% link releases/molt.md %}#installation) tools.
- Review the MOLT Fetch [setup]({% link molt/molt-fetch.md %}#setup) and [best practices]({% link molt/molt-fetch.md %}#best-practices).
{% include molt/fetch-secure-cloud-storage.md %}

Select the source dialect you will migrate to CockroachDB:

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
</div>

## Step 1. Prepare the source database

{% include molt/migration-prepare-database.md %}

## Step 2. Prepare the source schema

{% include molt/migration-prepare-schema.md %}

## Step 3. Load data into CockroachDB

{{site.data.alerts.callout_success}}
To optimize performance of [data load](#step-3-load-data-into-cockroachdb), Cockroach Labs recommends dropping any [constraints]({% link {{ site.current_cloud_version }}/alter-table.md %}#drop-constraint) and [indexes]({% link {{site.current_cloud_version}}/drop-index.md %}) on the target CockroachDB database. You can [recreate them after the data is loaded](#step-5-modify-the-cockroachdb-schema).
{{site.data.alerts.end}}

Perform an initial load of data into the target database. This can be a subset of the source data that you wish to verify, or it can be the entire dataset.

{% include molt/fetch-data-load-modes.md %}

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB, specifying `--mode data-load` to perform a one-time data load. For details on this mode, refer to the [MOLT Fetch]({% link molt/molt-fetch.md %}#load-data) page.

	{{site.data.alerts.callout_info}}
	Ensure that the `--source` and `--target` [connection strings]({% link molt/molt-fetch.md %}#connection-strings) are URL-encoded.
	{{site.data.alerts.end}}

	<section class="filter-content" markdown="1" data-scope="postgres">
	{% include_cached copy-clipboard.html %}
	Be sure to specify `--pglogical-replication-slot-name`, which is required for replication in [Step 6](#step-6-replicate-changes-to-cockroachdb).

	~~~ shell
	molt fetch \
	--source 'postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full' \
	--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
	--table-filter 'employees' \
	--bucket-path 's3://molt-test' \
	--table-handling truncate-if-exists \
	--non-interactive \
	--pglogical-replication-slot-name cdc_slot \
	--mode data-load
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt' \
	--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
	--table-filter 'employees' \
	--bucket-path 's3://molt-test' \
	--table-handling truncate-if-exists \
	--non-interactive \
	--mode data-load
	~~~
	</section>

{% include molt/fetch-data-load-output.md %}

## Step 4. Verify the data load

{% include molt/verify-output.md %}

Repeat [Step 3](#step-3-load-data-into-cockroachdb) and [Step 4](#step-4-verify-the-data-load) to migrate any remaining tables.

## Step 5. Modify the CockroachDB schema

{% include molt/migration-modify-target-schema.md %}

## Step 6. Replicate changes to CockroachDB

With initial load complete, start replication of ongoing changes on the source to CockroachDB.

The following example specifies that the `employees` table should be watched for change events.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to start replication on CockroachDB, specifying `--mode replication-only` to replicate ongoing changes on the source to CockroachDB. For details on this mode, refer to the [MOLT Fetch]({% link molt/molt-fetch.md %}#replicate-changes) page.

	<section class="filter-content" markdown="1" data-scope="postgres">
	Be sure to specify the same `--pglogical-replication-slot-name` value that you provided in [Step 3](#step-3-load-data-into-cockroachdb).

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source 'postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full' \
	--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
	--table-filter 'employees' \
	--non-interactive \
	--mode replication-only \
	--pglogical-replication-slot-name cdc_slot
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	Use the `--defaultGTIDSet` replication flag to specify the GTID set. To find your GTID record, run `SELECT source_uuid, min(interval_start), max(interval_end) FROM mysql.gtid_executed GROUP BY source_uuid;` on MySQL.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt' \
	--target 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
	--table-filter 'employees' \
	--non-interactive \
	--mode replication-only \
	--replicator-flags '--defaultGTIDSet 4c658ae6-e8ad-11ef-8449-0242ac140006:1-29'
	~~~
	</section>

{% include molt/fetch-replication-output.md %}

## Step 7. Stop replication and verify data

{% include molt/migration-stop-replication.md %}

1. Repeat [Step 4](#step-4-verify-the-data-load) to verify the updated data.

{{site.data.alerts.callout_success}}
If you encountered issues with replication, you can now use [`failback`]({% link molt/migrate-failback.md %}) mode to replicate changes on CockroachDB back to the initial source database. In case you need to roll back the migration, this ensures that data is consistent on the initial source database.
{{site.data.alerts.end}}

## Step 8. Cutover

Perform a cutover by resuming application traffic, now to CockroachDB.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate to CockroachDB]({% link molt/migrate-to-cockroachdb.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})