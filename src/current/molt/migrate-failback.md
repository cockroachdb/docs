---
title: Migration Failback
summary: Learn how to fail back from a CockroachDB cluster to a PostgreSQL or MySQL database.
toc: true
docs_area: migrate
---

Failback can be performed after you have loaded data into CockroachDB and are replicating ongoing changes. Failing back to the source database ensures that—in case you need to roll back the migration—data remains consistent on the source.

{% assign tab_names_html = "Load and replicate;Phased migration;Failback" %}
{% assign html_page_filenames = "migrate-to-cockroachdb.html;migrate-in-phases.html;migrate-failback.html" %}

{% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=site.current_cloud_version %}

## Before you begin

- [Enable rangefeeds]({% link {{ site.current_cloud_version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) in the CockroachDB SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = true;
    ~~~

- Ensure that your CockroachDB deployment has a valid [Enterprise license]({% link {{ site.current_cloud_version }}/licensing-faqs.md %}).

Select the source dialect you migrated to CockroachDB:

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
</div>

## Step 1. Stop replication to CockroachDB

Cancel replication to CockroachDB by entering `ctrl-c` to issue a `SIGTERM` signal to the `fetch` process. This returns an exit code `0`.

## Step 2. Fail back from CockroachDB

The following example watches the `employees` table for change events.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to fail back to the source database, specifying `--mode failback`. For details on this mode, refer to the [MOLT Fetch]({% link molt/molt-fetch.md %}#fail-back-to-source-database) page.

    {{site.data.alerts.callout_success}}
    Be mindful when specifying the connection strings: `--source` is the CockroachDB connection string and `--target` is the connection string of the database you migrated from.
    {{site.data.alerts.end}}

    Use the `--stagingSchema` replication flag to provide the name of the staging schema. This is found in the `staging database name` message that is written at the beginning of the [replication task]({% link {{ site.current_cloud_version }}/migrate-in-phases.md %}#step-6-replicate-changes-to-cockroachdb).

    <section class="filter-content" markdown="1" data-scope="postgres">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
    --target 'postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full' \
    --table-filter 'employees' \
    --non-interactive \
    --replicator-flags "--stagingSchema _replicator_1739996035106984000" \
    --mode failback \
    --changefeeds-path 'changefeed-secure.json'
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="mysql">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source 'postgres://root@localhost:26257/defaultdb?sslmode=verify-full' \
    --target 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt' \
    --table-filter 'employees' \
    --non-interactive \
    --replicator-flags "--stagingSchema _replicator_1739996035106984000" \
    --mode failback \
    --changefeeds-path 'changefeed-secure.json'
    ~~~
    </section>

    `--changefeeds-path` specifies a path to `changefeed-secure.json`, which should contain the following setting override:

    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
        "sink_query_parameters": "client_cert={base64 cert}&client_key={base64 key}&ca_cert={base64 CA cert}"
    }
    ~~~

    `client_cert`, `client_key`, and `ca_cert` are [webhook sink parameters]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-parameters) that must be base64- and URL-encoded (for example, use the command `base64 -i ./client.crt | jq -R -r '@uri'`).

    {{site.data.alerts.callout_success}}
    For details on the default changefeed settings and how to override them, refer to [Changefeed override settings]({% link molt/molt-fetch.md %}#changefeed-override-settings).
    {{site.data.alerts.end}}

1. Check the output to observe `fetch progress`.

    A `starting replicator` message indicates that the task has started:

    ~~~ json
    {"level":"info","time":"2025-02-20T15:55:44-05:00","message":"starting replicator"}
    ~~~

    The `staging database name` message contains the name of the staging schema:

    ~~~ json
     {"level":"info","time":"2025-02-11T14:56:20-05:00","message":"staging database name: _replicator_1739303283084207000"}
    ~~~

    A `creating changefeed` message indicates that a changefeed will be passing change events from CockroachDB to the failback target:

    ~~~ json
    {"level":"info","time":"2025-02-20T15:55:44-05:00","message":"creating changefeed on the source CRDB database"}
    ~~~

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migrate to CockroachDB]({% link {{ site.current_cloud_version }}/migrate-to-cockroachdb.md %})
- [Migrate to CockroachDB in Phases]({% link {{ site.current_cloud_version }}/migrate-in-phases.md %})