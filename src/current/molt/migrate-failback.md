---
title: Migration Failback
summary: Learn how to fail back from a CockroachDB cluster to a PostgreSQL or MySQL database.
toc: true
docs_area: migrate
---

If issues arise during migration, run MOLT Fetch in `failback` mode after stopping replication and before writing to CockroachDB. This ensures that data remains consistent on the source in case you need to roll back the migration.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

## Prepare the CockroachDB cluster

[Enable rangefeeds]({% link {{ site.current_cloud_version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) on the CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING kv.rangefeed.enabled = true;
~~~

<section class="filter-content" markdown="1" data-scope="oracle">
## Grant Oracle user permissions

You should have already created a migration user on the source database with the necessary privileges. Refer to [Create migration user on source database]({% link molt/migrate-data-load-replicate-only.md %}?filters=oracle#create-migration-user-on-source-database).

Grant the Oracle user additional `INSERT` and `UPDATE` privileges on the tables to fail back:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.employees TO MIGRATION_USER;
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.payments TO MIGRATION_USER;
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.orders TO MIGRATION_USER;
~~~
</section>

## Configure failback

Configure the MOLT Fetch connection strings and filters for `failback` mode, ensuring that the CockroachDB changefeed is correctly targeting your original source.

### Connection strings

In `failback` mode, the `--source` and `--target` connection strings are reversed from other migration modes: 

`--source` is the CockroachDB connection string. For example:

~~~
--target 'postgres://crdb_user@localhost:26257/defaultdb?sslmode=verify-full'
~~~

`--target` is the connection string of the database you migrated from.

<section class="filter-content" markdown="1" data-scope="postgres">
For example:

~~~
--source 'postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
For example:

~~~
--source 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
For example:

~~~
--source 'oracle://C%23%23MIGRATION_USER:password@host:1521/ORCLPDB1'
~~~

{{site.data.alerts.callout_info}}
With Oracle Multitenant deployments, `--source-cdb` is **not** necessary for `failback`.
{{site.data.alerts.end}}
</section>

### Secure changefeed for failback

`failback` mode creates a [CockroachDB changefeed]({% link {{ site.current_cloud_version }}/change-data-capture-overview.md %}) and sets up a [webhook sink]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-sink) to pass change events from CockroachDB to the failback target. In production, you should override the [default insecure changefeed]({% link molt/molt-fetch.md %}#default-insecure-changefeed) with secure settings. 

Provide these overrides in a JSON file. At minimum, the JSON should include the base64-encoded client certificate ([`client_cert`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#client-cert)), key ([`client_key`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#client-key)), and CA ([`ca_cert`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#ca-cert)) for the webhook sink.

{% include_cached copy-clipboard.html %}
~~~ json
{
  "sink_query_parameters": "client_cert={base64 cert}&client_key={base64 key}&ca_cert={base64 CA cert}"
}
~~~

{{site.data.alerts.callout_success}}
In the `molt fetch` command, use `--replicator-flags` to specify the paths to the server certificate and key for the webhook sink. Refer to [Replication flags](#replication-flags).
{{site.data.alerts.end}}

Pass the JSON file path to `molt` via `--changefeeds-path`. For example:

{% include_cached copy-clipboard.html %}
~~~ 
--changefeeds-path 'changefeed-secure.json'
~~~

Because the changefeed runs inside the CockroachDB cluster, the `--changefeeds-path` file must reference a webhook endpoint address reachable by the cluster, not necessarily your local workstation.

For details, refer to [Changefeed override settings]({% link molt/molt-fetch.md %}#changefeed-override-settings).

### Replication flags

{% include molt/fetch-replicator-flags.md %}

## Fail back from CockroachDB

Start failback to the source database.

1. Cancel replication to CockroachDB by entering `ctrl-c` to issue a `SIGTERM` signal to the `fetch` process. This returns an exit code `0`.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to fail back to the source database, specifying `--mode failback`. In this example, we filter the `migration_schema` schema and the `employees`, `payments`, and `orders` tables, configure the staging schema with `--replicator-flags`, and use `--changefeeds-path` to provide the secure changefeed override.

    <section class="filter-content" markdown="1" data-scope="postgres">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --target $TARGET \
    --schema-filter 'migration_schema' \
    --table-filter 'employees|payments|orders' \
    --replicator-flags '--stagingSchema _replicator_1739996035106984000 --tlsCertificate ./certs/server.crt --tlsPrivateKey ./certs/server.key' \
    --mode failback \
    --changefeeds-path 'changefeed-secure.json'
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
    --replicator-flags '--stagingSchema _replicator_1739996035106984000 --tlsCertificate ./certs/server.crt --tlsPrivateKey ./certs/server.key' \
    --mode failback \
    --changefeeds-path 'changefeed-secure.json'
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="oracle">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --target $TARGET \
    --schema-filter 'migration_schema' \
    --table-filter 'employees|payments|orders' \
    --replicator-flags '--stagingSchema _replicator_1739996035106984000 --tlsCertificate ./certs/server.crt --tlsPrivateKey ./certs/server.key --userscript table_filter.ts' \
    --mode failback \
    --changefeeds-path 'changefeed-secure.json'
    ~~~
    </section>

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
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})