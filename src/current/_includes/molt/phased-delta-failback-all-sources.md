A [*Phased Delta Migration with Failback Replication*]({% link molt/migration-approach-phased-delta-failback.md %}) involves [migrating data to CockroachDB]({% link molt/migration-overview.md %}) in several phases. Data can be sliced per tenant, per service, per region, or per table to suit the needs of the migration. **For each given migration phase**, you use [MOLT Fetch]({% link molt/molt-fetch.md %}) to perform an initial bulk load of the data, you use [MOLT Replicator]({% link molt/molt-replicator.md %}) to update the target database via forward replication and to activate failback replication, and then you cut over application traffic to CockroachDB after schema finalization and data verification. This process is repeated for each phase of data.

- Data is migrated to the target [in phases]({% link molt/migration-considerations-granularity.md %}).

- This approach utilizes [continuous replication]({% link molt/migration-considerations-replication.md %}).

- [Rollback]({% link molt/migration-considerations-rollback.md %}) is achieved via failback replication.

This approach is comparable to the [Delta Migration]({% link molt/migration-approach-delta.md %}), but dividing the data into multiple phases allows each downtime window to be shorter, and it allows each phase of the migration to be less complex. Depending on how you divide the data, it also may allow your downtime windows to affect only a subset of users. For example, dividing the data per region could mean that, when migrating the data from Region A, application usage in Region B may remain unaffected. This approach may increase overall migration complexity: its duration is longer, you will need to do the work of partitioning the data, and you will have a longer period when you run both the source and the target database concurrently.

[Failback replication]({% link molt/migration-considerations-rollback.md %}) keeps the source database up to date with changes that occur in the target database once the target database begins receiving write traffic. Failback replication ensures that, if something goes wrong during the migration process, traffic can easily be returned to the source database without data loss. Like forward replication, in this approach, failback replication is run on a per-phase basis. It can persist indefinitely, until you're comfortable maintaining the target database as your sole data store.

This approach is best for databases that are too large to migrate all at once, and in business cases where downtime must be minimal. It's also suitable for risk-averse situations in which a safe rollback path must be ensured. It can only be performed if your team can handle the complexity of this approach, and if your source database can easily be divided into the phases you need.

This page describes an example scenario. While the commands provided can be copy-and-pasted, they may need to be altered or reconsidered to suit the needs of your specific environment.

<div style="text-align: center;">
<img src="{{ 'images/molt/molt_phased_delta_flow.svg' | relative_url }}" alt="Phased Delta Migration flow" style="max-width:100%" />
</div>

## Example scenario

You have a moderately-sized (500GB) database that provides the data store for a web application. You want to migrate the entirety of this database to a new CockroachDB cluster. You will divide this migration into four geographic regions (A, B, C, and D).

The application runs on a Kubernetes cluster with an NGINX Ingress Controller.

Your business could not accommodate major performance issues that could arise after the migration. Therefore, you want to enable failback replication so that you can easily return to using your original database with minimal interruption.

**Estimated system downtime:** 3-5 minutes per region.

## Before the migration

- Install the [MOLT (Migrate Off Legacy Technology)]({% link molt/molt-fetch-installation.md %}#installation) tools.
- Review the [MOLT Fetch]({% link molt/molt-fetch-best-practices.md %}) and [MOLT Replicator]({% link molt/molt-replicator.md %}) documentation.
- [Develop a migration plan]({% link molt/migration-strategy.md %}#develop-a-migration-plan) and [prepare for the migration]({% link molt/migration-strategy.md %}#prepare-for-migration).
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

## Migrating each phase

Steps 3-12 are run for each phase of the data migration. When migrating the first phase, you will run through these steps for Region A. You will repeat these steps for the other regions during each subsequent migration phase.

## Step 3: Load data into CockroachDB

In this step, you will:

- [Configure MOLT Fetch with the flags needed for your migration](#configure-molt-fetch).
- [Run MOLT Fetch](#run-molt-fetch).
- [Understand how to continue a load after an interruption](#continue-molt-fetch-after-an-interruption).

### Configure MOLT Fetch

The [MOLT Fetch documentation]({% link molt/molt-fetch.md %}) includes detailed information about how to [configure MOLT Fetch]({% link molt/molt-fetch.md %}#run-molt-fetch), and how to [monitor MOLT Fetch metrics]({% link molt/molt-fetch-monitoring.md %}).

When you run `molt fetch`, you can configure the following options for data load:

<a id="schema-and-table-filtering"></a>
<a id="source-connection-string"></a>
<a id="table-handling-mode"></a>
<a id="target-connection-string"></a>
<a id="cloud-storage-authentication"></a>
<a id="secure-connections"></a>
<a id="intermediate-file-storage"></a>
<a id="data-load-mode"></a>
<a id="connection-strings"></a>

- [Specify source and target databases]({% link molt/molt-fetch.md %}#specify-source-and-target-databases): Specify URL‑encoded source and target connections.
- [Select data to migrate]({% link molt/molt-fetch.md %}#select-data-to-migrate): Specify schema and table names to migrate. **Important for a phased migration.**
- [Define intermediate file storage]({% link molt/molt-fetch.md %}#define-intermediate-storage): Export data to cloud storage or a local file server.
- [Define fetch mode]({% link molt/molt-fetch.md %}#define-fetch-mode): Specifies whether data will only be loaded into/from intermediate storage.
- [Shard tables]({% link molt/molt-fetch.md %}#shard-tables-for-concurrent-export): Divide larger tables into multiple shards during data export.
- [Data load mode]({% link molt/molt-fetch.md %}#import-into-vs-copy-from): Choose between `IMPORT INTO` and `COPY FROM`.
- [Table handling mode]({% link molt/molt-fetch.md %}#handle-target-tables): Determine how existing target tables are initialized before load.
- [Define data transformations]({% link molt/molt-fetch.md %}#define-transformations): Define any row-level transformations to apply to the data before it reaches the target.
- [Monitor fetch metrics]({% link molt/molt-fetch-monitoring.md %}): Configure metrics collection during initial data load.

Read through the documentation to understand how to configure your `molt fetch` command and its flags. Follow [best practices]({% link molt/molt-fetch-best-practices.md %}), especially those related to security.

At minimum, the `molt fetch` command should include the source, target, data path, and [`--ignore-replication-check`]({% link molt/molt-fetch-commands-and-flags.md %}#ignore-replication-check) flags. For a phased migration, you may also choose to include [`--schema-filter`]({% link molt/molt-fetch-commands-and-flags.md %}#schema-filter) or [`--table-filter`]({% link molt/molt-fetch-commands-and-flags.md %}#table-filter) flags:

{% include_cached copy-clipboard.html %}
~~~ shell
molt fetch \
--source $SOURCE \
--target $TARGET \
--table-filter '.*user.*' \
--bucket-path 's3://bucket/path' \
--ignore-replication-check
~~~

However, depending on the needs of your migration, you may have many more flags set, and you may need to prepare some accompanying .json files.

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

<section class="filter-content" markdown="1" data-scope="postgres">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `pglogical` command using the same `--stagingSchema` value from your [initial replication command](#start-molt-replicator-forward-replication).

Be sure to specify the same `--slotName` value that you used during your [initial replication command](#start-molt-replicator-forward-replication). The replication slot on the source PostgreSQL database automatically tracks the LSN (Log Sequence Number) checkpoint, so replication will resume from where it left off.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.migration_schema \
--slotName molt_slot \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `mylogical` command using the same `--stagingSchema` value from your [initial replication command](#start-molt-replicator-forward-replication).

Replicator will automatically use the saved GTID (Global Transaction Identifier) from the `memo` table in the staging schema (in this example, `defaultdb._replicator.memo`) and track advancing GTID checkpoints there. To have Replicator start from a different GTID instead of resuming from the checkpoint, clear the `memo` table with `DELETE FROM defaultdb._replicator.memo;` and run the `replicator` command with a new `--defaultGTIDSet` value.

{{site.data.alerts.callout_success}}
For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON migration_db.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.public \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
--userscript table_filter.ts \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `oraclelogminer` command using the same `--stagingSchema` value from your [initial replication command](#start-molt-replicator-forward-replication).

Replicator will automatically find the correct restart SCN (System Change Number) from the `_oracle_checkpoint` table in the staging schema. The restart point is determined by the non-committed row with the smallest `startscn` column value.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--sourceSchema MIGRATION_USER \
--targetSchema defaultdb.migration_schema \
--targetConn $TARGET \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
--userscript table_filter.ts \
-v
~~~

{{site.data.alerts.callout_info}}
When [filtering out tables in a schema with a userscript]({% link molt/userscript-cookbook.md %}#filter-multiple-tables), replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
{{site.data.alerts.end}}
</section>

Replication resumes from the last checkpoint without performing a fresh load. Monitor the metrics endpoint at `http://localhost:30005/_/varz` to track replication progress.

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

It is strongly recommended that you perform a dry run of this migration in a test environment. This will allow you to practice using the MOLT tools in real time, and it will give you an accurate sense of how long application downtime might last.
{{ site.data.alerts.end }}

## Step 8: Stop forward replication

Before you can cut over traffic to the target, the changes to the source database need to finish being written to the target. Once the source is no longer receiving write traffic, MOLT Replicator will take some seconds to finish replicating the final changes. This is known as _drainage_.

{% include molt/migration-stop-replication.md %}

## Step 9: Verify the replicated data

Repeat [Step 4](#step-4-verify-the-initial-data-load) to verify the updated data.

## Step 10: Begin failback replication

In this step, you will:

- [Prepare both databases for failback replication](#prepare-your-source-and-target-databases-for-failback-replication)
- [Configure MOLT Replicator with the flags needed for your migration](#configure-molt-replicator-failback-replication).
- [Start MOLT Replicator](#start-molt-replicator-failback-replication).
- [Understand how to continue replication after an interruption](#continue-molt-replicator-after-an-interruption-failback-replication).

### Prepare your source and target databases for failback replication

#### Prepare the CockroachDB cluster

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

#### Grant target database user permissions

You should have already created a migration user on the target database (your **original source database**) with the necessary privileges. Refer to [Create migration user on source database](#create-migration-user-on-source-database).

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

#### Create a CockroachDB changefeed

On the target cluster, create a CockroachDB changefeed to send changes to MOLT Replicator.

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

### Configure MOLT Replicator (failback replication)

When you run `replicator`, you can configure the following options for replication:

- [Connection strings](#connection-strings): Specify URL‑encoded source and target connections.
- [TLS certificate and key](#tls-certificate-and-key): Configure secure TLS connections.
- [Replicator flags](#replicator-flags): Specify required and optional flags to configure replicator behavior.
<section class="filter-content" markdown="1" data-scope="postgres oracle">
- [Tuning parameters](#tuning-parameters): Optimize failback performance and resource usage.
</section>
- [Replicator metrics](#replicator-metrics): Monitor failback replication performance.

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

##### Secure connections

{% include molt/molt-secure-connection-strings.md %}

#### TLS certificate and key

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

When you [create the changefeed](#create-a-cockroachdb-changefeed), pass the encoded certificates in the changefeed URL, where `client_cert`, `client_key`, and `ca_cert` are [webhook sink parameters]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-parameters):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE table1, table2
INTO 'webhook-https://host:port/database/schema?client_cert={base64_and_url_encoded_cert}&client_key={base64_and_url_encoded_key}&ca_cert={base64_and_url_encoded_ca}'
WITH ...;
~~~

For additional details on the webhook sink URI, refer to [Webhook sink]({% link {{ site.current_cloud_version }}/changefeed-sinks.md %}#webhook-sink).

#### Replicator flags

|                                    Flag                                   |                                                                                                 Description                                                                                                 |
|---------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema)   | **Required.** Staging schema name on CockroachDB for the changefeed checkpoint table. Schema name must be fully qualified in the format `database.schema`.                                                  |
| [`--bindAddr`]({% link molt/replicator-flags.md %}#bind-addr)             | **Required.** Network address to bind the webhook sink for the changefeed. For example, `:30004`.                                                                                                           |
| [`--tlsCertificate`]({% link molt/replicator-flags.md %}#tls-certificate) | Path to the server TLS certificate for the webhook sink. Refer to [TLS certificate and key](#tls-certificate-and-key).                                                                                      |
| [`--tlsPrivateKey`]({% link molt/replicator-flags.md %}#tls-private-key)  | Path to the server TLS private key for the webhook sink. Refer to [TLS certificate and key](#tls-certificate-and-key).Q                                                                                      |
| [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr)       | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                                                                                              |
| [`--userscript`]({% link molt/replicator-flags.md %}#userscript)          | Path to a [userscript]({% link molt/userscript-overview.md %}) that enables data filtering, routing, or transformations. For examples, refer to [Userscript Cookbook]({% link molt/userscript-cookbook.md %}). |

- The staging schema is first created during [initial replication setup]({% link molt/molt-replicator.md %}#forward-replication-after-initial-load) with [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema).

- When configuring a [secure changefeed](#tls-certificate-and-key) for failback, you **must** include [`--tlsCertificate`]({% link molt/replicator-flags.md %}#tls-certificate) and [`--tlsPrivateKey`]({% link molt/replicator-flags.md %}#tls-private-key), which specify the paths to the server certificate and private key for the webhook sink connection.

<section class="filter-content" markdown="1" data-scope="postgres oracle">
### Tuning parameters

{% include molt/optimize-replicator-performance.md %}
</section>

#### Replicator metrics

MOLT Replicator metrics are not enabled by default. Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following flag exposes metrics on port `30005`:

~~~ 
--metricsAddr :30005
~~~

For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}?filters=cockroachdb).

### Start MOLT Replicator (failback replication)

With initial load complete, start replication of ongoing changes on the source to CockroachDB using [MOLT Replicator]({% link molt/molt-replicator.md %}).

{{site.data.alerts.callout_info}}
MOLT Fetch captures a consistent point-in-time checkpoint at the start of the data load (shown as `cdc_cursor` in the fetch output). Starting replication from this checkpoint ensures that all changes made during and after the data load are replicated to CockroachDB, preventing data loss or duplication. The following steps use the checkpoint values from the fetch output to start replication at the correct position.
{{site.data.alerts.end}}

Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `start` command to begin failback replication from CockroachDB to your source database. In this example, `--metricsAddr :30005` enables a Prometheus endpoint for monitoring replication metrics, and `--bindAddr :30004` sets up the webhook endpoint for the changefeed.

`--stagingSchema` specifies the staging database name (`defaultdb._replicator` in this example) used for replication checkpoints and metadata. This staging database was created during [initial forward replication](#step-6-begin-forward-replication) when you first ran MOLT Replicator with `--stagingCreateSchema`.

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

### Continue MOLT Replicator after an interruption (failback replication)

<section class="filter-content" markdown="1" data-scope="postgres">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `pglogical` command using the same `--stagingSchema` value from your [initial replication command](#start-molt-replicator-failback-replication).

Be sure to specify the same `--slotName` value that you used during your [initial replication command](#start-molt-replicator-failback-replication). The replication slot on the source PostgreSQL database automatically tracks the LSN (Log Sequence Number) checkpoint, so replication will resume from where it left off.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.migration_schema \
--slotName molt_slot \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `mylogical` command using the same `--stagingSchema` value from your [initial replication command](#start-molt-replicator-failback-replication).

Replicator will automatically use the saved GTID (Global Transaction Identifier) from the `memo` table in the staging schema (in this example, `defaultdb._replicator.memo`) and track advancing GTID checkpoints there. To have Replicator start from a different GTID instead of resuming from the checkpoint, clear the `memo` table with `DELETE FROM defaultdb._replicator.memo;` and run the `replicator` command with a new `--defaultGTIDSet` value.

{{site.data.alerts.callout_success}}
For MySQL versions that do not support `binlog_row_metadata`, include `--fetchMetadata` to explicitly fetch column metadata. This requires additional permissions on the source MySQL database. Grant `SELECT` permissions with `GRANT SELECT ON migration_db.* TO 'migration_user'@'localhost';`. If that is insufficient for your deployment, use `GRANT PROCESS ON *.* TO 'migration_user'@'localhost';`, though this is more permissive and allows seeing processes and server status.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.public \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
--userscript table_filter.ts \
-v
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Run the [MOLT Replicator]({% link molt/molt-replicator.md %}) `oraclelogminer` command using the same `--stagingSchema` value from your [initial replication command](#start-molt-replicator-failback-replication).

Replicator will automatically find the correct restart SCN (System Change Number) from the `_oracle_checkpoint` table in the staging schema. The restart point is determined by the non-committed row with the smallest `startscn` column value.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--sourceSchema MIGRATION_USER \
--targetSchema defaultdb.migration_schema \
--targetConn $TARGET \
--stagingSchema defaultdb._replicator \
--metricsAddr :30005 \
--userscript table_filter.ts \
-v
~~~

{{site.data.alerts.callout_info}}
When [filtering out tables in a schema with a userscript]({% link molt/userscript-cookbook.md %}#filter-multiple-tables), replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
{{site.data.alerts.end}}
</section>

Replication resumes from the last checkpoint without performing a fresh load. Monitor the metrics endpoint at `http://localhost:30005/_/varz` to track replication progress.

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