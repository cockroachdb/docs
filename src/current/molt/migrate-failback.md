---
title: Migration Failback
summary: Learn how to fail back from a CockroachDB cluster to a PostgreSQL, MySQL, or Oracle database.
toc: true
docs_area: migrate
---

If issues arise during migration, use [MOLT Replicator]({% link molt/molt-replicator.md %}) to fail back from CockroachDB to your source database. This ensures that data remains consistent on the source in case you need to roll back the migration.

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

For improved changefeed performance, configure these optional settings. Note that these settings can impact source cluster performance, especially SQL foreground latency during writes:

{% include_cached copy-clipboard.html %}
~~~sql
-- Reduce changefeed emission latency (affects SQL foreground latency)
SET CLUSTER SETTING kv.rangefeed.closed_timestamp_refresh_interval = '250ms';

-- Control closed timestamp lag duration
SET CLUSTER SETTING kv.closed_timestamp.target_duration = '1s';

-- Increase concurrent catchup iterators (increases cluster CPU usage)
SET CLUSTER SETTING kv.rangefeed.concurrent_catchup_iterators = 64;
~~~

<section class="filter-content" markdown="1" data-scope="oracle">
## Grant Oracle user permissions

You should have already created a migration user on the source database with the necessary privileges. Refer to [Create migration user on source database]({% link molt/migrate-load-replicate.md %}?filters=oracle#create-migration-user-on-source-database).

Grant the Oracle user additional `INSERT` and `UPDATE` privileges on the tables to fail back:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.employees TO MIGRATION_USER;
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.payments TO MIGRATION_USER;
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.orders TO MIGRATION_USER;
~~~
</section>

## Configure failback

Configure [MOLT Replicator]({% link molt/molt-replicator.md %}) for CockroachDB-to-target failback replication.

### Connection strings

For failback, MOLT Replicator uses `--targetConn` to specify the original source database and `--stagingConn` for the CockroachDB staging database.

`--targetConn` is the connection string of the database you migrated from.

<section class="filter-content" markdown="1" data-scope="postgres">
For example:

~~~
--targetConn 'postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
For example:

~~~
--targetConn 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
For example:

~~~
--targetConn 'oracle://C%23%23MIGRATION_USER:password@host:1521/ORCLPDB1'
~~~
</section>

`--stagingConn` is the CockroachDB connection string for staging operations:

~~~
--stagingConn 'postgres://crdb_user@localhost:26257/defaultdb?sslmode=verify-full'
~~~

## Fail back from CockroachDB

Start failback to the source database using [MOLT Replicator]({% link molt/molt-replicator.md %}).

1. Cancel replication to CockroachDB by entering `ctrl-c` to stop the replication process.

1. Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `start` command to begin failback replication from CockroachDB to your source database. In this example, `--metricsAddr :30005` enables a Prometheus endpoint for monitoring replication metrics.

    {{site.data.alerts.callout_info}}
    Ensure that only one changefeed points to MOLT Replicator at a time to avoid "mixing streams" of incoming data.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    replicator start \
    --bindAddr :30004 \
    --targetConn $TARGET_CONN \
    --stagingConn $STAGING_CONN \
    --stagingSchema _replicator \
    --metricsAddr :30005 \
    --tlsCertificate ./certs/server.crt \
    --tlsPrivateKey ./certs/server.key
    ~~~

1. Create a CockroachDB changefeed to send changes to MOLT Replicator. First, get the current logical timestamp from CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT cluster_logical_timestamp();
    ~~~

1. Create the changefeed pointing to the MOLT Replicator webhook endpoint:

    <section class="filter-content" markdown="1" data-scope="postgres">
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE employees, payments, orders
    INTO 'webhook-https://localhost:30004/migration_schema/public?insecure_tls_skip_verify=true'
    WITH updated, resolved = '250ms', min_checkpoint_frequency = '250ms',
    initial_scan = 'no', webhook_sink_config = '{"Flush":{"Bytes":1048576,"Frequency":"1s"}}';
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="mysql">
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE employees, payments, orders
    INTO 'webhook-https://localhost:30004/migration_schema?insecure_tls_skip_verify=true'
    WITH updated, resolved = '250ms', min_checkpoint_frequency = '250ms',
    initial_scan = 'no', webhook_sink_config = '{"Flush":{"Bytes":1048576,"Frequency":"1s"}}';
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="oracle">
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE employees, payments, orders
    INTO 'webhook-https://localhost:30004/MIGRATION_SCHEMA?insecure_tls_skip_verify=true'
    WITH updated, resolved = '250ms', min_checkpoint_frequency = '250ms',
    initial_scan = 'no', webhook_sink_config = '{"Flush":{"Bytes":1048576,"Frequency":"1s"}}';
    ~~~
    </section>

1. Monitor the changefeed status:

    ~~~ sql
    SHOW CHANGEFEED JOB <job_id>;
    ~~~

    Look for `running: resolved=<timestamp>` status to confirm the changefeed is active and replicating changes to the target database.

## Troubleshoot failback issues

### Changefeed connection errors

If the changefeed shows connection errors in `SHOW CHANGEFEED JOB`:

#### Connection refused

~~~
transient error: Post "https://localhost:30004/molt/public": dial tcp [::1]:30004: connect: connection refused
~~~

**Resolution:** Verify that MOLT Replicator is running on the exact port specified in the changefeed URL. Check that the host and port are specified correctly.

#### Unknown schema error

~~~
transient error: 400 Bad Request: unknown schema:
~~~

**Resolution:** Check the webhook URL path mapping:
- **CockroachDB/PostgreSQL targets:** Use `/database/schema` format (e.g., `/molt/public`)
- **MySQL/Oracle targets:** Use `/SCHEMA` format (e.g., `/MIGRATION_SCHEMA`)

Verify that the target database and schema names match the webhook URL.

#### GC threshold error

~~~
batch timestamp * must be after replica GC threshold
~~~

**Resolution:** This indicates starting from an invalid cursor that has been garbage collected. Extend the GC TTL on the source CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~sql
ALTER DATABASE <your_database> CONFIGURE ZONE USING gc.ttlseconds = <gc_ttl_in_seconds>;
~~~

### Clear staging database

To prevent data duplication when resuming changefeeds from a cursor, clear the staging database:

{{site.data.alerts.callout_danger}}
This deletes all checkpoints and buffered data. Use with caution.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~sql
DROP DATABASE _replicator;
~~~

For more targeted cleanup, delete mutations from specific staging tables:

{% include_cached copy-clipboard.html %}
~~~sql
DELETE FROM staging_table_name;
~~~

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})