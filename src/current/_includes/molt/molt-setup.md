<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>


## Before you begin

- Create a CockroachDB [{{ site.data.products.cloud }}]({% link cockroachcloud/create-your-cluster.md %}) or [{{ site.data.products.core }}]({% link {{ site.current_cloud_version }}/install-cockroachdb-mac.md %}) cluster.
- Install the [MOLT (Migrate Off Legacy Technology)]({% link releases/molt.md %}#installation) tools.
- Review the [Fetch]({% link molt/molt-fetch-best-practices.md %}) {% if page.name != "migrate-bulk-load.md" %} and [Replicator]({% link molt/molt-replicator-best-practices.md %}){% endif %} best practices.
- Review [Migration Strategy]({% link molt/migration-strategy.md %}).

<section class="filter-content" markdown="1" data-scope="oracle">
{% include molt/oracle-migration-prerequisites.md %}
</section>

{% include molt/molt-limitations.md %}

## Prepare the source database

{% include molt/migration-prepare-database.md %}

## Prepare the target database

### Define the target tables

{% include molt/migration-prepare-schema.md %}

### Create the SQL user

{% include molt/migration-create-sql-user.md %}

{% if page.name != "migrate-bulk-load.md" %}
### Configure GC TTL

Before starting the [initial data load](#start-fetch), configure the [garbage collection (GC) TTL]({% link {{ site.current_cloud_version }}/configure-replication-zones.md %}#gc-ttlseconds) on the source CockroachDB cluster to ensure that historical data remains available when replication begins. The GC TTL must be long enough to cover the full duration of the data load.

Increase the GC TTL before starting the data load. For example, to set the GC TTL to 24 hours:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE defaultdb CONFIGURE ZONE USING gc.ttlseconds = 86400;
~~~

{{site.data.alerts.callout_info}}
The GC TTL duration must be higher than your expected time for the initial data load.
{{site.data.alerts.end}}

Once replication has started successfully (which automatically protects its own data range), you can restore the GC TTL to its original value. For example, to restore to 5 minutes:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE defaultdb CONFIGURE ZONE USING gc.ttlseconds = 300;
~~~

For details, refer to [Protect Changefeed Data from Garbage Collection]({% link {{ site.current_cloud_version }}/protect-changefeed-data.md %}).
{% endif %}

## Configure Fetch

When you run `molt fetch`, you can configure the following options for data load:

- [Connection strings](#connection-strings): Specify URL‑encoded source and target connections.
- [Intermediate file storage](#intermediate-file-storage): Export data to cloud storage or a local file server.
- [Table handling mode](#table-handling-mode): Determine how existing target tables are initialized before load.
- [Schema and table filtering](#schema-and-table-filtering): Specify schema and table names to migrate.
- [Data load mode](#data-load-mode): Choose between `IMPORT INTO` and `COPY FROM`.
- [Fetch metrics](#fetch-metrics): Configure metrics collection during initial data load.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

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

### Fetch metrics

{% include molt/fetch-metrics.md %}