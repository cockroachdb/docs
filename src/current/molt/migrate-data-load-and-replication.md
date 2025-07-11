---
title: Load and Replicate
summary: Learn how to migrate data from a PostgreSQL or MySQL database into a CockroachDB cluster.
toc: true
docs_area: migrate
---

Use `data-load-and-replication` mode to perform a one-time bulk load of source data and start continuous replication in a single command.

{{site.data.alerts.callout_success}}
You can also [load and replicate separately]({% link molt/migrate-data-load-replicate-only.md %}) using `data-load` and `replicate-only`.
{{site.data.alerts.end}}

{% assign tab_names_html = "Load and replicate;Replicate separately" %}
{% assign html_page_filenames = "migrate-data-load-and-replication.html;migrate-data-load-replicate-only.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder="molt" %}

{% include molt/molt-setup.md %}

## Load data into CockroachDB

Start the initial load of data into the target database. Continuous replication of changes will start once the data load is complete.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB, specifying `--mode data-load-and-replication` to perform an initial load followed by continuous replication. In this example, the `--metricsAddr :30005` [replication flag](#replication-flags) enables a Prometheus endpoint at `http://localhost:30005/_/varz` where replication metrics will be served. You can use these metrics to [verify that replication has drained](#stop-replication-and-verify-data) in a later step.

    <section class="filter-content" markdown="1" data-scope="postgres">
    Specify a replication slot name with `--pglogical-replication-slot-name`. This is required for [replication after data load](#replicate-changes-to-cockroachdb).

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
    --replicator-flags '--metricsAddr :30005' \
    --mode data-load-and-replication
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
    --replicator-flags '--metricsAddr :30005' \
    --mode data-load-and-replication
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
    --replicator-flags '--metricsAddr :30005 --userscript table_filter.ts' \
    --mode data-load-and-replication
    ~~~
    </section>

{% include molt/fetch-data-load-output.md %}

## Replicate changes to CockroachDB

1. Continuous replication begins immediately after `fetch complete`.

{% include molt/fetch-replication-output.md %}

## Stop replication and verify data

Use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the source and target data is consistent. This ensures that the data load was successful.

{% include molt/migration-stop-replication.md %}

{% include molt/verify-output.md %}

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