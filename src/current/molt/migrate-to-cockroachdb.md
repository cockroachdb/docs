---
title: Migrate to CockroachDB
summary: Learn how to migrate data from a PostgreSQL or MySQL database into a CockroachDB cluster.
toc: true
docs_area: migrate
---

A migration to CockroachDB uses the [MOLT tools]({% link molt/migration-overview.md %}) to [convert your source schema](#step-2-prepare-the-source-schema), [load source data](#step-3-load-data-into-cockroachdb) into CockroachDB and immediately [replicate ongoing changes](#step-4-replicate-changes-to-cockroachdb), and [verify consistency](#step-5-stop-replication-and-verify-data) on the CockroachDB cluster before performing cutover.

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
To optimize performance of [data load](#step-3-load-data-into-cockroachdb), Cockroach Labs recommends dropping any [constraints]({% link {{ site.current_cloud_version }}/alter-table.md %}#drop-constraint) and [indexes]({% link {{site.current_cloud_version}}/drop-index.md %}) on the target CockroachDB database. You can [recreate them after the data is loaded](#step-6-modify-the-cockroachdb-schema).
{{site.data.alerts.end}}

Start the initial load of data into the target database. Continuous replication of changes will start once the data load is complete.

{% include molt/fetch-data-load-modes.md %}

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB, specifying `--mode data-load-and-replication` to perform an initial load followed by continuous replication. For details on this mode, refer to the [MOLT Fetch]({% link molt/molt-fetch.md %}#load-data-and-replicate-changes) page.

	{{site.data.alerts.callout_info}}
	Ensure that the `--source` and `--target` [connection strings]({% link molt/molt-fetch.md %}#connection-strings) are URL-encoded.
	{{site.data.alerts.end}}

	<section class="filter-content" markdown="1" data-scope="postgres">
	Be sure to specify `--pglogical-replication-slot-name`, which is required for replication.

	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source "postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full" \
	--target "postgres://root@localhost:26257/defaultdb?sslmode=verify-full" \
	--table-filter 'employees' \
	--bucket-path 's3://molt-test' \
	--table-handling truncate-if-exists \
	--non-interactive \
	--mode data-load-and-replication \
	--pglogical-replication-slot-name cdc_slot
	~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="mysql">
	{% include_cached copy-clipboard.html %}
	~~~ shell
	molt fetch \
	--source 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt' \
	--target "postgres://root@localhost:26257/defaultdb?sslmode=verify-full" \
	--table-filter 'employees' \
	--bucket-path 's3://molt-test' \
	--table-handling truncate-if-exists \
	--non-interactive \
	--mode data-load-and-replication
	~~~
	</section>

{% include molt/fetch-data-load-output.md %}

## Step 4. Replicate changes to CockroachDB

1. Continuous replication begins immediately after `fetch complete`. 

{% include molt/fetch-replication-output.md %}

## Step 5. Stop replication and verify data

{% include molt/migration-stop-replication.md %}

{% include molt/verify-output.md %}

{{site.data.alerts.callout_success}}
If you encountered issues with replication, you can now use [`failback`]({% link molt/migrate-failback.md %}) mode to replicate changes on CockroachDB back to the initial source database. In case you need to roll back the migration, this ensures that data is consistent on the initial source database.
{{site.data.alerts.end}}

## Step 6. Modify the CockroachDB schema

{% include molt/migration-modify-target-schema.md %}

## Step 7. Cutover

Perform a cutover by resuming application traffic, now to CockroachDB.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate to CockroachDB in Phases]({% link molt/migrate-in-phases.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})