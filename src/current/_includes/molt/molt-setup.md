<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

<section class="filter-content" markdown="1" data-scope="oracle">
{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}
</section>

## Before you begin

- Create a CockroachDB [{{ site.data.products.cloud }}]({% link cockroachcloud/create-your-cluster.md %}) or [{{ site.data.products.core }}]({% link {{ site.current_cloud_version }}/install-cockroachdb-mac.md %}) cluster.
- Install the [MOLT (Migrate Off Legacy Technology)]({% link releases/molt.md %}#installation) tools.
- Review the MOLT Fetch [best practices]({% link molt/molt-fetch.md %}#best-practices).
- Review [Migration Strategy]({% link molt/migration-strategy.md %}).

<section class="filter-content" markdown="1" data-scope="oracle">
{% include molt/oracle-migration-prerequisites.md %}
</section>

{% include molt/molt-limitations.md %}

## Prepare the source database

{% include molt/migration-prepare-database.md %}

## Prepare the target database

### Create the target schema

{% include molt/migration-prepare-schema.md %}

### Create the SQL user

{% include molt/migration-create-sql-user.md %}

## Configure data load

When you run `molt fetch`, you can configure the following options for data load:

- [Connection strings](#connection-strings): Specify URL‑encoded source and target connections.
- [Intermediate file storage](#intermediate-file-storage): Export data to cloud storage or a local file server.
- [Table handling mode](#table-handling-mode): Determine how existing target tables are initialized before load.
- [Schema and table filtering](#schema-and-table-filtering): Specify schema and table names to migrate.
- [Data load mode](#data-load-mode): Choose between `IMPORT INTO` and `COPY FROM`.
- [Metrics](#metrics): Configure metrics collection during the load.
{% if page.name != "migrate-bulk-load.md" %}
- [Replication flags](#replication-flags): Configure the `replicator` process.
{% endif %}

### Connection strings

{% include molt/molt-connection-strings.md %}

### Intermediate file storage

{% include molt/fetch-intermediate-file-storage.md %}

### Table handling mode

{% include molt/fetch-table-handling.md %}

### Schema and table filtering

{% include molt/fetch-schema-table-filtering.md %}

### Data load mode

{% include molt/fetch-data-load-modes.md %}

### Metrics

{% include molt/fetch-metrics.md %}

{% if page.name == "migrate-data-load-and-replication.md" %}
### Replication flags

{% include molt/fetch-replicator-flags.md %}
{% endif %}