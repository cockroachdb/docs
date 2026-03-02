---
title: Migration Failback
summary: Learn how to fail back from a CockroachDB cluster to a PostgreSQL, MySQL, or Oracle database.
toc: true
docs_area: migrate
---

{{site.data.alerts.callout_info}}
These instructions assume you have already [installed MOLT and completed the prerequisites]({% link molt/migrate-load-replicate.md %}#before-you-begin) for your source dialect.
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

## Prepare the CockroachDB cluster

{{site.data.alerts.callout_success}}
For details on enabling CockroachDB changefeeds, refer to [Create and Configure Changefeeds]({% link {{ site.current_cloud_version }}/create-and-configure-changefeeds.md %}).
{{site.data.alerts.end}}

If you are migrating to a CockroachDB {{ site.data.products.core }} cluster, [enable rangefeeds]({% link {{ site.current_cloud_version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) on the cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING kv.rangefeed.enabled = true;
~~~

Use the following optional settings to increase changefeed throughput. 

{{site.data.alerts.callout_danger}}
The following settings can impact source cluster performance and stability, especially SQL foreground latency during writes. For details, refer to [Advanced Changefeed Configuration]({% link {{ site.current_cloud_version }}/advanced-changefeed-configuration.md %}).
{{site.data.alerts.end}}

To lower changefeed emission latency, but increase SQL foreground latency:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING kv.rangefeed.closed_timestamp_refresh_interval = '250ms';
~~~

To lower the [closed timestamp]({% link {{ site.current_cloud_version }}/architecture/transaction-layer.md %}#closed-timestamps) lag duration:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING kv.closed_timestamp.target_duration = '1s';
~~~

To improve catchup speeds but increase cluster CPU usage:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING kv.rangefeed.concurrent_catchup_iterators = 64;
~~~

## Grant target database user permissions

You should have already created a migration user on the target database (your **original source database**) with the necessary privileges. Refer to [Create migration user on source database]({% link molt/migrate-load-replicate.md %}#create-migration-user-on-source-database).

For failback replication, grant the user additional privileges to write data back to the target database:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ sql
-- Grant INSERT and UPDATE on tables to fail back to
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA migration_schema TO migration_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA migration_schema GRANT INSERT, UPDATE ON TABLES TO migration_user;
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ sql
-- Grant INSERT and UPDATE on tables to fail back to
GRANT SELECT, INSERT, UPDATE ON migration_db.* TO 'migration_user'@'%';
FLUSH PRIVILEGES;
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ sql
-- Grant INSERT, UPDATE, and FLASHBACK on tables to fail back to
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.employees TO MIGRATION_USER;
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.payments TO MIGRATION_USER;
GRANT SELECT, INSERT, UPDATE, FLASHBACK ON migration_schema.orders TO MIGRATION_USER;
~~~
</section>

## Configure Replicator

When you run `replicator`, you can configure the following options for replication:

- [Connection strings](#connection-strings): Specify URL‑encoded source and target connections.
- [TLS certificate and key](#tls-certificate-and-key): Configure secure TLS connections.
- [Replicator flags](#replicator-flags): Specify required and optional flags to configure replicator behavior.
<section class="filter-content" markdown="1" data-scope="postgres oracle">
- [Tuning parameters](#tuning-parameters): Optimize failback performance and resource usage.
</section>
- [Replicator metrics](#replicator-metrics): Monitor failback replication performance.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

### Connection strings

For failback, MOLT Replicator uses `--targetConn` to specify the destination database where you want to replicate CockroachDB changes, and `--stagingConn` for the CockroachDB staging database.

`--targetConn` is the connection string of the database you want to replicate changes to (the database you originally migrated from).

For example:

<section class="filter-content" markdown="1" data-scope="postgres">
~~~
--targetConn 'postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
~~~
--targetConn 'mysql://user:password@localhost/molt?sslcert=.%2fsource_certs%2fclient.root.crt&sslkey=.%2fsource_certs%2fclient.root.key&sslmode=verify-full&sslrootcert=.%2fsource_certs%2fca.crt'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
~~~
--targetConn 'oracle://C%23%23MIGRATION_USER:password@host:1521/ORCLPDB1'
~~~
</section>

`--stagingConn` is the CockroachDB connection string for staging operations:

~~~
--stagingConn 'postgres://crdb_user@localhost:26257/defaultdb?sslmode=verify-full'
~~~

#### Secure connections

{% include molt/molt-secure-connection-strings.md %}

### TLS certificate and key

Always use **secure TLS connections** for failback replication to protect data in transit. Do **not** use insecure configurations in production: avoid the `--disableAuthentication` and `--tlsSelfSigned` Replicator flags and `insecure_tls_skip_verify=true` query parameter in the changefeed webhook URI.

Generate self-signed TLS certificates or certificates from an external CA. Ensure the TLS server certificate and key are accessible on the MOLT Replicator host machine via a relative or absolute file path. When you [start failback with Replicator](#start-replicator), specify the paths with `--tlsCertificate` and `--tlsPrivateKey`. For example:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start \
... \
--tlsCertificate ./certs/server.crt \
--tlsPrivateKey ./certs/server.key
~~~

The client certificates defined in the changefeed webhook URI must correspond to the server certificates specified in the `replicator` command. This ensures proper TLS handshake between the changefeed and MOLT Replicator. To include client certificates in the changefeed webhook URL, encode them with `base64` and then URL-encode the output with `jq`:

{% include_cached copy-clipboard.html %}
~~~ shell
base64 -i ./client.crt | jq -R -r '@uri'
base64 -i ./client.key | jq -R -r '@uri'
base64 -i ./ca.crt | jq -R -r '@uri'
~~~

When you [create the changefeed](#create-the-cockroachdb-changefeed), pass the encoded certificates in the changefeed URL, where `client_cert`, `client_key`, and `ca_cert` are [webhook sink parameters]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-parameters):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE table1, table2
INTO 'webhook-https://host:port/database/schema?client_cert={base64_and_url_encoded_cert}&client_key={base64_and_url_encoded_key}&ca_cert={base64_and_url_encoded_ca}'
WITH ...;
~~~

For additional details on the webhook sink URI, refer to [Webhook sink]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-sink).

### Replicator flags

{% include molt/replicator-flags-usage.md %}

<section class="filter-content" markdown="1" data-scope="postgres oracle">
### Tuning parameters

{% include molt/optimize-replicator-performance.md %}
</section>

### Replicator metrics

MOLT Replicator metrics are not enabled by default. Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following flag exposes metrics on port `30005`:

~~~ 
--metricsAddr :30005
~~~

For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=cockroachdb).

## Stop forward replication

{% include molt/migration-stop-replication.md %}

## Start Replicator

1. Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `start` command to begin failback replication from CockroachDB to your source database. In this example, `--metricsAddr :30005` enables a Prometheus endpoint for monitoring replication metrics, and `--bindAddr :30004` sets up the webhook endpoint for the changefeed.

    `--stagingSchema` specifies the staging database name (`defaultdb._replicator` in this example) used for replication checkpoints and metadata. This staging database was created during [initial forward replication]({% link molt/migrate-load-replicate.md %}#start-replicator) when you first ran MOLT Replicator with `--stagingCreateSchema`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    replicator start \
    --targetConn $TARGET \
    --stagingConn $STAGING \
    --stagingSchema defaultdb._replicator \
    --metricsAddr :30005 \
    --bindAddr :30004 \
    --tlsCertificate ./certs/server.crt \
    --tlsPrivateKey ./certs/server.key \
    -v
    ~~~

## Create the CockroachDB changefeed

Create a CockroachDB changefeed to send changes to MOLT Replicator.

1. Get the current logical timestamp from CockroachDB, after [ensuring that forward replication has fully drained](#stop-forward-replication):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT cluster_logical_timestamp();
    ~~~

    ~~~
        cluster_logical_timestamp
    ----------------------------------
      1759246920563173000.0000000000
    ~~~

1. Create the CockroachDB changefeed pointing to the MOLT Replicator webhook endpoint. Use `cursor` to specify the logical timestamp from the preceding step. For details on the webhook sink URI, refer to [Webhook sink]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-sink).

    {{site.data.alerts.callout_info}}
    Explicitly set a default `10s` [`webhook_client_timeout`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options) value in the `CREATE CHANGEFEED` statement. This value ensures that the webhook can report failures in inconsistent networking situations and make crash loops more visible.
    {{site.data.alerts.end}}

    <section class="filter-content" markdown="1" data-scope="postgres">
    The target schema is specified in the webhook URL path in the fully-qualified format `/database/schema`. The path specifies the database and schema on the target PostgreSQL database. For example, `/migration_db/migration_schema` routes changes to the `migration_schema` schema in the `migration_db` database.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE employees, payments, orders \
    INTO 'webhook-https://replicator-host:30004/migration_db/migration_schema?client_cert={base64_encoded_cert}&client_key={base64_encoded_key}&ca_cert={base64_encoded_ca}' \
    WITH updated, resolved = '250ms', min_checkpoint_frequency = '250ms', initial_scan = 'no', cursor = '1759246920563173000.0000000000', webhook_sink_config = '{"Flush":{"Bytes":1048576,"Frequency":"1s"}}', webhook_client_timeout = '10s';
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="mysql">
    MySQL tables belong directly to the database, not to a separate schema. The webhook URL path specifies the database name on the target MySQL database. For example, `/migration_db` routes changes to the `migration_db` database.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE employees, payments, orders \
    INTO 'webhook-https://replicator-host:30004/migration_db?client_cert={base64_encoded_cert}&client_key={base64_encoded_key}&ca_cert={base64_encoded_ca}' \
    WITH updated, resolved = '250ms', min_checkpoint_frequency = '250ms', initial_scan = 'no', cursor = '1759246920563173000.0000000000', webhook_sink_config = '{"Flush":{"Bytes":1048576,"Frequency":"1s"}}', webhook_client_timeout = '10s';
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="oracle">
    The webhook URL path specifies the schema name on the target Oracle database. Oracle capitalizes identifiers by default. For example, `/MIGRATION_SCHEMA` routes changes to the `MIGRATION_SCHEMA` schema.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE employees, payments, orders \
    INTO 'webhook-https://replicator-host:30004/MIGRATION_SCHEMA?client_cert={base64_encoded_cert}&client_key={base64_encoded_key}&ca_cert={base64_encoded_ca}' \
    WITH updated, resolved = '250ms', min_checkpoint_frequency = '250ms', initial_scan = 'no', cursor = '1759246920563173000.0000000000', webhook_sink_config = '{"Flush":{"Bytes":1048576,"Frequency":"1s"}}', webhook_client_timeout = '10s';
    ~~~
    </section>

    The output shows the job ID:

    ~~~
            job_id
    -----------------------
      1101234051444375553
    ~~~

    {{site.data.alerts.callout_success}}
    Ensure that only **one** changefeed points to MOLT Replicator at a time to avoid mixing streams of incoming data.
    {{site.data.alerts.end}}

1. Monitor the changefeed status, specifying the job ID:

    ~~~ sql
    SHOW CHANGEFEED JOB 1101234051444375553;
    ~~~

    ~~~
            job_id        | ... | status  |              running_status               | ...
    ----------------------+-----+---------+-------------------------------------------+----
      1101234051444375553 | ... | running | running: resolved=1759246920563173000,0 | ...
    ~~~

    To confirm the changefeed is active and replicating changes to the target database, check that `status` is `running` and `running_status` shows `running: resolved={timestamp}`.

    {{site.data.alerts.callout_danger}}
    `running: resolved` may be reported even if data isn't being sent properly. This typically indicates incorrect host/port configuration or network connectivity issues.
    {{site.data.alerts.end}}

1. Verify that Replicator is reporting incoming HTTP requests from the changefeed. To do so, check the MOLT Replicator logs. Since you enabled debug logging with `-v`, you should see periodic HTTP request successes:

    ~~~
    DEBUG  [Aug 25 11:52:47]  httpRequest="&{0x14000b068c0 45 200 3 9.770958ms   false false}"
    DEBUG  [Aug 25 11:52:48]  httpRequest="&{0x14000d1a000 45 200 3 13.438125ms   false false}"
    ~~~

    These debug messages confirm successful changefeed connections to MOLT Replicator. You can disable verbose logging after verifying the connection.

## Troubleshooting

{% include molt/molt-troubleshooting-failback.md %}

## See also

- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
