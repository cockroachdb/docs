A [*Phased Delta Migration with Failback Replication*]({% link molt/migration-approach-phased-delta-failback.md %}) involves [migrating data to CockroachDB]({% link molt/migration-overview.md %}) in several phases. Data can be sliced per tenant, per service, per region, or per table to suit the needs of the migration. **For each given migration phase**, you use [MOLT Fetch]({% link molt/molt-fetch.md %}) to perform an initial bulk load of the data, you use [MOLT Replicator]({% link molt/molt-replicator.md %}) to update the target database via forward replication and to activate failback replication, and then you cut over application traffic to CockroachDB after schema finalization and data verification. This process is repeated for each phase of data.

- Data is migrated to the target [in phases]({% link molt/migration-considerations-phases.md %}).

- This approach utilizes [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Rollback]({% link molt/migration-considerations-rollback.md %}) is achieved via failback replication.

This approach is comparable to the [Delta Migration]({% link molt/migration-approach-delta.md %}), but dividing the data into multiple phases allows each downtime window to be shorter, and it allows each phase of the migration to be less complex. Depending on how you divide the data, it also may allow your downtime windows to affect only a subset of users. For example, dividing the data per region could mean that, when migrating the data from Region A, application usage in Region B may remain unaffected. This approach may increase overall migration complexity: its duration is longer, you will need to do the work of partitioning the data, and you will have a longer period when you run both the source and the target database concurrently.

[Failback replication]({% link molt/migration-considerations-rollback.md %}) keeps the source database up to date with changes that occur in the target database once the target database begins receiving write traffic. Failback replication ensures that, if something goes wrong during the migration process, traffic can easily be returned to the source database without data loss. Like forward replication, in this approach, failback replication is run on a per-phase basis. It can persist indefinitely, until you're comfortable maintaining the target database as your sole data store.

This approach is best for databases that are too large to migrate all at once, and in business cases where downtime must be minimal. It's also suitable for risk-averse situations in which a safe rollback path must be ensured. It can only be performed if your team can handle the complexity of this approach, and if your source database can easily be divided into the phases you need.

{% include molt/crdb-to-crdb-migration.md %}

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_phased_delta_flow.svg' | relative_url }}" alt="Phased Delta Migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a moderately-sized (500GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. You will divide this migration into four geographic regions (A, B, C, and D).

The application runs on a Kubernetes cluster with an NGINX Ingress Controller.

**Estimated system downtime:** Less than 60 seconds per region.

## Before the migration

- Install the [MOLT (Migrate Off Legacy Technology)]({% link molt/molt-fetch-installation.md %}#installation) tools.
- Review the [MOLT Fetch]({% link molt/molt-fetch-best-practices.md %}) and [MOLT Replicator]({% link molt/molt-replicator.md %}) documentation.
- **Recommended:** Perform a dry run of this full set of instructions in a development environment that closely resembles your production environment. This can help you get a realistic sense of the time and complexity it requires.
- Understand the prequisites and limitations of the MOLT tools:

<section class="filter-content" markdown="1" data-scope="oracle">
{% include molt/oracle-migration-prerequisites.md %}
</section>

{% include molt/molt-limitations.md %}

## Step 1: Prepare the source database

In this step, you will:

- [Create a dedicated migration user on your source database](#create-migration-user-on-source-database).
- [Configure the source database for replication](#configure-source-database-for-replication).

{% include molt/migration-prepare-database.md %}

## Step 2: Prepare the target database

### Define the target tables

{% include molt/migration-prepare-schema.md %}

### Create the SQL user

{% include molt/migration-create-sql-user.md %}

{% if page.name != "migrate-bulk-load.md" %}
### Configure GC TTL

Before starting the [initial data load](#run-molt-fetch), configure the [garbage collection (GC) TTL]({% link {{ site.current_cloud_version }}/configure-replication-zones.md %}#gc-ttlseconds) on the source CockroachDB cluster to ensure that historical data remains available when replication begins. The GC TTL must be long enough to cover the full duration of the data load.

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

## Migrating each phase

Steps 3-12 are run for each phase of the data migration. When migrating the first phase, you will run through these steps for Region A. You will repeat these steps for the other regions during each subsequent migration phase.

## Step 3: Load data into CockroachDB

In this step, you will:

- [Configure MOLT Fetch with the flags needed for your migration](#configure-molt-fetch).
- [Run MOLT Fetch](#run-molt-fetch).
- [Understand how to continue a load after an interruption](#continue-molt-fetch-after-an-interruption).

### Configure MOLT Fetch

When you run `molt fetch`, you can configure the following options for data load:

- [Connection strings](#connection-strings): Specify URL‑encoded source and target connections.
- [Intermediate file storage](#intermediate-file-storage): Export data to cloud storage or a local file server.
- [Table handling mode](#table-handling-mode): Determine how existing target tables are initialized before load.
- [Schema and table filtering](#schema-and-table-filtering): Specify schema and table names to migrate.
- [Data load mode](#data-load-mode): Choose between `IMPORT INTO` and `COPY FROM`.
- [Fetch metrics](#fetch-metrics): Configure metrics collection during initial data load.

#### Connection strings

{% include molt/molt-connection-strings.md %}

#### Intermediate file storage

{% include molt/fetch-intermediate-file-storage.md %}

#### Table handling mode

{% include molt/fetch-table-handling.md %}

#### Schema and table filtering

{% include molt/fetch-schema-table-filtering.md %}

#### Data load mode

{% include molt/fetch-data-load-modes.md %}

#### Fetch metrics

{% include molt/fetch-metrics.md %}

### Run MOLT Fetch

<a id="start-fetch"></a>

Perform the initial load of the source data.

1. Issue the [MOLT Fetch]({% link molt/molt-fetch.md %}) command to move the source data to CockroachDB. This example command passes the source and target connection strings [as environment variables](#secure-connections), writes [intermediate files](#intermediate-file-storage) to S3 storage, and uses the `truncate-if-exists` [table handling mode](#table-handling-mode) to truncate the target tables before loading data. It also limits the migration to a single schema and filters three specific tables to migrate. The [data load mode]({% link molt/molt-fetch.md %}#import-into-vs-copy-from) defaults to `IMPORT INTO`.

    <section class="filter-content" markdown="1" data-scope="postgres">
    You **must** include `--pglogical-replication-slot-name` and `--pglogical-publication-and-slot-drop-and-recreate` to automatically create the publication and replication slot during the data load.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --target $TARGET \
    --schema-filter 'migration_schema' \
    --table-filter 'employees|payments|orders' \
    --bucket-path 's3://migration/data/cockroach' \
    --table-handling truncate-if-exists \
    --pglogical-replication-slot-name molt_slot \
    --pglogical-publication-and-slot-drop-and-recreate
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="mysql">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --target $TARGET \
    --table-filter 'employees|payments|orders' \
    --bucket-path 's3://migration/data/cockroach' \
    --table-handling truncate-if-exists
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="oracle">
    The command assumes an Oracle Multitenant (CDB/PDB) source. [`--source-cdb`]({% link molt/molt-fetch-commands-and-flags.md %}#source-cdb) specifies the container database (CDB) connection string.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    molt fetch \
    --source $SOURCE \
    --source-cdb $SOURCE_CDB \
    --target $TARGET \
    --schema-filter 'migration_schema' \
    --table-filter 'employees|payments|orders' \
    --bucket-path 's3://migration/data/cockroach' \
    --table-handling truncate-if-exists
    ~~~
    </section>

{% include molt/fetch-data-load-output.md %}

### Continue MOLT Fetch after an interruption

{% include molt/fetch-continue-after-interruption.md %}

## Step 4: Verify the initial data load

In this step, you will use [MOLT Verify]({% link molt/molt-verify.md %}) to confirm that the source and target data is consistent. This ensures that the data load was successful. Use MOLT Verify's [`--schema-filter`]({% link molt/molt-verify.md %}#flags) or [`--table-filter`]({% link molt/molt-verify.md %}#flags) to select only the tables that are relevant for the given phase.

### Run MOLT Verify

{% include molt/verify-output.md %}

## Step 5: Finalize the target schema

### Add constraints and indexes

{% include molt/migration-modify-target-schema.md %}

## Step 6: Begin forward replication

In this step, you will:

- [Configure MOLT Replicator with the flags needed for your migration](#configure-molt-replicator-forward-replication).
- [Start MOLT Replicator](#start-molt-replicator-forward-replication).
- [Understand how to continue replication after an interruption](#continue-molt-replicator-after-an-interruption-forward-replication).

### Configure MOLT Replicator (forward replication)

When you run `replicator`, you can configure the following options for replication:

- [Replication connection strings](#replication-connection-strings): Specify URL-encoded source and target database connections.
- [Replicator flags](#replicator-flags): Specify required and optional flags to configure replicator behavior.
<section class="filter-content" markdown="1" data-scope="postgres oracle">
- [Tuning parameters](#tuning-parameters): Optimize replication performance and resource usage.
</section>
- [Replicator metrics](#replicator-metrics): Monitor replication progress and performance.

#### Replication connection strings

MOLT Replicator uses `--sourceConn` and `--targetConn` to specify the source and target database connections.

`--sourceConn` specifies the connection string of the source database:

<section class="filter-content" markdown="1" data-scope="postgres">
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
~~~
--sourceConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

For Oracle Multitenant databases, also specify `--sourcePDBConn` with the PDB connection string:

~~~
--sourcePDBConn 'oracle://{username}:{password}@{host}:{port}/{pdb_service_name}'
~~~
</section>

`--targetConn` specifies the target CockroachDB connection string:

~~~
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

{{site.data.alerts.callout_success}}
Follow best practices for securing connection strings. Refer to [Secure connections](#secure-connections).
{{site.data.alerts.end}}

#### Replicator flags

{% include molt/replicator-flags-usage.md %}

<section class="filter-content" markdown="1" data-scope="postgres oracle">

#### Tuning parameters

{% include molt/optimize-replicator-performance.md %}
</section>

#### Replicator metrics

MOLT Replicator metrics are not enabled by default. Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following flag exposes metrics on port `30005`:

~~~ 
--metricsAddr :30005
~~~

<section class="filter-content" markdown="1" data-scope="postgres">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=postgres).
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=mysql).
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=oracle).
</section>

### Start MOLT Replicator (forward replication)

<a id="start-replicator"></a>

With initial load complete, start replication of ongoing changes on the source to CockroachDB using [MOLT Replicator]({% link molt/molt-replicator.md %}).

{{site.data.alerts.callout_info}}
MOLT Fetch captures a consistent point-in-time checkpoint at the start of the data load (shown as `cdc_cursor` in the fetch output). Starting replication from this checkpoint ensures that all changes made during and after the data load are replicated to CockroachDB, preventing data loss or duplication. The following steps use the checkpoint values from the fetch output to start replication at the correct position.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="postgres">
Run the `replicator` command, using the same slot name that you specified with `--pglogical-replication-slot-name` and the publication name created by `--pglogical-publication-and-slot-drop-and-recreate` in the [Fetch command](#run-molt-fetch). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    replicator pglogical \
    --sourceConn $SOURCE \
    --targetConn $TARGET \
    --targetSchema defaultdb.migration_schema \
    --slotName molt_slot \
    --publicationName molt_fetch \
    --stagingSchema defaultdb._replicator \
    --stagingCreateSchema \
    --metricsAddr :30005 \
    -v
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Run the `replicator` command, specifying the GTID from the [checkpoint recorded during data load](#run-molt-fetch). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database. If you [filtered tables during the initial load](#schema-and-table-filtering), [write a userscript to filter tables on replication]({% link molt/userscript-cookbook.md %}#filter-multiple-tables) and specify the path with `--userscript`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    replicator mylogical \
    --sourceConn $SOURCE \
    --targetConn $TARGET \
    --targetSchema defaultdb.public \
    --defaultGTIDSet 4c658ae6-e8ad-11ef-8449-0242ac140006:1-29 \
    --stagingSchema defaultdb._replicator \
    --stagingCreateSchema \
    --metricsAddr :30005 \
    --userscript table_filter.ts \
    -v
    ~~~

    {{site.data.alerts.callout_success}}
    For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON migration_db.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
    {{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Run the `replicator` command, specifying the backfill and starting SCN from the [checkpoint recorded during data load](#run-molt-fetch). Use `--stagingSchema` to specify a unique name for the staging database, and include `--stagingCreateSchema` to have MOLT Replicator automatically create the staging database. If you [filtered tables during the initial load](#schema-and-table-filtering), [write a userscript to filter tables on replication]({% link molt/userscript-cookbook.md %}#filter-multiple-tables) and specify the path with `--userscript`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    replicator oraclelogminer \
    --sourceConn $SOURCE \
    --sourcePDBConn $SOURCE_PDB \
    --targetConn $TARGET \
    --sourceSchema MIGRATION_USER \
    --targetSchema defaultdb.migration_schema \
    --backfillFromSCN 26685444 \
    --scn 26685786 \
    --stagingSchema defaultdb._replicator \
    --stagingCreateSchema \
    --metricsAddr :30005 \
    --userscript table_filter.ts \
    -v
    ~~~

    {{site.data.alerts.callout_info}}
    When [filtering out tables in a schema with a userscript]({% link molt/userscript-cookbook.md %}#filter-multiple-tables), replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
    {{site.data.alerts.end}}
</section>

#### Check that replication is working

Verify that Replicator is processing changes successfully. To do so, check the MOLT Replicator logs. Since you enabled debug logging with `-v`, you should see connection and row processing messages:

    <section class="filter-content" markdown="1" data-scope="postgres">
    You should see periodic primary keepalive messages:

    ~~~
    DEBUG  [Aug 25 14:38:10] primary keepalive received                    ReplyRequested=false ServerTime="2025-08-25 14:38:09.556773 -0500 CDT" ServerWALEnd=0/49913A58
    DEBUG  [Aug 25 14:38:15] primary keepalive received                    ReplyRequested=false ServerTime="2025-08-25 14:38:14.556836 -0500 CDT" ServerWALEnd=0/49913E60
    ~~~

    When rows are successfully replicated, you should see debug output like the following:

    ~~~
    DEBUG  [Aug 25 14:40:02] upserted rows                                 conflicts=0 duration=7.855333ms proposed=1 target="\"molt\".\"public\".\"tbl1\"" upserted=1
    DEBUG  [Aug 25 14:40:02] progressed to LSN: 0/49915DD0
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="mysql">
    You should see binlog syncer connection and row processing:

    ~~~
    [2025/08/25 15:29:09] [info] binlogsyncer.go:463 begin to sync binlog from GTID set 77263736-7899-11f0-81a5-0242ac120002:1-38
    [2025/08/25 15:29:09] [info] binlogsyncer.go:409 Connected to mysql 8.0.43 server
    INFO   [Aug 25 15:29:09] connected to MySQL version 8.0.43
    ~~~

    When rows are successfully replicated, you should see debug output like the following:

    ~~~
    DEBUG  [Aug 25 15:29:38] upserted rows                                 conflicts=0 duration=1.801ms proposed=1 target="\"molt\".\"public\".\"tbl1\"" upserted=1
    DEBUG  [Aug 25 15:29:38] progressed to consistent point: 77263736-7899-11f0-81a5-0242ac120002:1-39
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="oracle">
    When transactions are read from the Oracle source, you should see registered transaction IDs (XIDs):

    ~~~
    DEBUG  [Jul  3 15:55:12] registered xid 0f001f0040060000
    DEBUG  [Jul  3 15:55:12] registered xid 0b001f00bb090000
    ~~~

    When rows are successfully replicated, you should see debug output like the following:

    ~~~
    DEBUG  [Jul  3 15:55:12] upserted rows                                 conflicts=0 duration=2.620009ms proposed=13 target="\"molt_movies\".\"USERS\".\"CUSTOMER_CONTACT\"" upserted=13
    DEBUG  [Jul  3 15:55:12] upserted rows                                 conflicts=0 duration=2.212807ms proposed=16 target="\"molt_movies\".\"USERS\".\"CUSTOMER_DEVICE\"" upserted=16
    ~~~
    </section>

    These messages confirm successful replication. You can disable verbose logging after verifying the connection.

### Continue MOLT Replicator after an interruption (forward replication)

{% include molt/replicator-resume-replication.md %}

## Step 7: Stop application traffic

Once the inital data load has been verified and the target schema has been finalized, it's time to begin the cutover process. First, stop application traffic to the source for this particular region.

If the Kubernetes cluster that deploys the application has pre-region deployments (for example, `app-us`, `app-eu`, `app-apac`), you can scale down only the deployment for that region.

{% include_cached copy-clipboard.html %}
~~~shell
kubectl scale deploy/app-eu --replicas=0
~~~

Or this can be handled by the NGINX Ingress Controller, by including the following to your NGINX configuration, ensuring that the conditional statement is suitable for your deployment:

{% include_cached copy-clipboard.html %}
~~~yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
  annotations:
    nginx.ingress.kubernetes.io/server-snippet: |
      if ($http_x_region = "eu") {
        return 503;
      }
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app
            port:
              number: 80
~~~

{{ site.data.alerts.callout_danger }}
Application downtime begins now, for users in the given region.
{{ site.data.alerts.end }}

## Step 8: Stop forward replication

Before you can cut over traffic to the target, the changes to the source database need to finish being written to the target. Once the source is no longer receiving write traffic, MOLT Replicator will take some seconds to finish replicating the final changes. This is known as _drainage_.

{% include molt/migration-stop-replication.md %}

## Step 9: Verify the replicated data

Repeat [Step 4](#step-4-verify-the-initial-data-load) to verify the updated data.

## Step 10: Begin failback replication

In this step, you will:

- [Configure MOLT Replicator with the flags needed for your migration](#configure-molt-replicator-failback-replication).
- [Start MOLT Replicator](#start-molt-replicator-failback-replication).
- [Create a CockroachDB changefeed](#create-a-cockroachdb-changefeed).
- [Understand how to continue replication after an interruption](#continue-molt-replicator-after-an-interruption-failback-replication).

### Configure MOLT Replicator (failback replication)

When you run `replicator`, you can configure the following options for replication:

- [Replication connection strings](#replication-connection-strings): Specify URL-encoded source and target database connections.
- [Replicator flags](#replicator-flags): Specify required and optional flags to configure replicator behavior.
<section class="filter-content" markdown="1" data-scope="postgres oracle">
- [Tuning parameters](#tuning-parameters): Optimize replication performance and resource usage.
</section>
- [Replicator metrics](#replicator-metrics): Monitor replication progress and performance.

#### Replication connection strings

MOLT Replicator uses `--sourceConn` and `--targetConn` to specify the source and target database connections.

{{site.data.alerts.callout_info}}
For MOLT Replicator, the source is always the **replication** source, while the target is always the **replication** target. This is distinct from the **migration** source and target. In the case of this example migration, the new CockroachDB cluster is the migration target, but because failback replication moves data from the migration target back to the migration source, the **replication** target is the original source database. In essence, the `--sourceConn` and `--targetConn` strings should be reversed for failback replication.
{{site.data.alerts.end}}

`--sourceConn` specifies the connection string of the CockroachDB cluster:

~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

`--targetConn` specifies the original source database:

<section class="filter-content" markdown="1" data-scope="postgres">
~~~
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
~~~
--targetConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
~~~
--targetConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~
</section>

{{site.data.alerts.callout_success}}
Follow best practices for securing connection strings. Refer to [Secure connections](#secure-connections).
{{site.data.alerts.end}}

#### Replicator flags

{% include molt/replicator-flags-usage.md %}

<section class="filter-content" markdown="1" data-scope="postgres oracle">

#### Tuning parameters

{% include molt/optimize-replicator-performance.md %}
</section>

#### Replicator metrics

MOLT Replicator metrics are not enabled by default. Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following flag exposes metrics on port `30005`:

~~~ 
--metricsAddr :30005
~~~

<section class="filter-content" markdown="1" data-scope="postgres">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=postgres).
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=mysql).
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=oracle).
</section>

### Start MOLT Replicator (failback replication)

With initial load complete, start replication of ongoing changes on the source to CockroachDB using [MOLT Replicator]({% link molt/molt-replicator.md %}).

{{site.data.alerts.callout_info}}
MOLT Fetch captures a consistent point-in-time checkpoint at the start of the data load (shown as `cdc_cursor` in the fetch output). Starting replication from this checkpoint ensures that all changes made during and after the data load are replicated to CockroachDB, preventing data loss or duplication. The following steps use the checkpoint values from the fetch output to start replication at the correct position.
{{site.data.alerts.end}}

Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `start` command to begin failback replication from CockroachDB to your source database. In this example, `--metricsAddr :30005` enables a Prometheus endpoint for monitoring replication metrics, and `--bindAddr :30004` sets up the webhook endpoint for the changefeed.

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

### Create a CockroachDB changefeed

Create a CockroachDB changefeed to send changes to MOLT Replicator.

1. Get the current logical timestamp from CockroachDB, after [ensuring that forward replication has fully drained](#step-8-stop-forward-replication):

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

### Continue MOLT Replicator after an interruption (failback replication)

{% include molt/replicator-resume-replication.md %}

## Step 11: Cut over application traffic

With the target cluster verified and finalized, it's time to resume application traffic for the current migration phase.

### Modify application code

In the application back end, update the application to route traffic for this migration phase to the CockroachDB cluster. A simple example:

~~~yml
env:
  - name: DATABASE_URL_US_EAST
    value: postgres://root@cockroachdb.us-east:26257/defaultdb?sslmode=verify-full
  - name: DATABASE_URL_US_WEST
    value: postgres://legacy-db.us-west:5432/defaultdb  # Still on source
~~~

In your application code, route database connections based on the user's region:

~~~python
def get_db_connection(user_region):
    if user_region == "us-east":
        return os.getenv("DATABASE_URL_US_EAST")  # CockroachDB
    else:
        return os.getenv("DATABASE_URL_US_WEST")  # Source database
~~~

### Resume application traffic 

If you halted traffic by scaling down a regional Kubernetes deployment, scale it back up.

{% include_cached copy-clipboard.html %}
~~~shell
kubectl scale deploy/app-eu --replicas=3
~~~

Or if this was handled by the NGINX Controller, remove the 503 block that was written in step 3:

{% include_cached copy-clipboard.html %}
~~~yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
#   annotations:
#     nginx.ingress.kubernetes.io/server-snippet: |
#       if ($http_x_region = "eu") {
#         return 503;
#       }
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app
            port:
              number: 80
~~~

This ends downtime for the current migration phase.

## Step 12: Stop failback replication

After traffic has been cut over to the target, you can maintain failback replication indefinitely. Once you decide that you want to use the CockroachDB cluster as your sole data store going forward, you can end failback replication with the following steps.

{% include molt/migration-stop-replication.md %}

## Repeat for each phase

During the next scheduled migration phase, [return to step 3](#step-3-load-data-into-cockroachdb) to migrate the next phase of data. Repeat steps 3-12 for each phase of data, until every region's data has been migrated and all application traffic has been cut over to the target.

## Troubleshooting

{% include molt/molt-troubleshooting-fetch.md %}
{% include molt/molt-troubleshooting-replication.md %}
{% include molt/molt-troubleshooting-failback.md %}

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Phased Bulk Load Migration]({% link molt/migration-approach-phased-bulk-load.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})