---
title: MOLT Replicator
summary: Learn how to use the MOLT Replicator tool to continuously replicate changes from source databases to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Replicator continuously replicates changes from a source database to CockroachDB as part of a [database migration]({% link molt/migration-overview.md %}). It supports migrations from a source database to CockroachDB with minimal downtime, and enables backfill from CockroachDB to your source database for failback scenarios to preserve a rollback option during a migration window.

MOLT Replicator consumes change data from PostgreSQL [logical replication](https://www.postgresql.org/docs/current/logical-replication.html) streams, MySQL [GTID-based replication](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html), Oracle [LogMiner](https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-logminer-utility.html), and [CockroachDB changefeeds]({% link {{ site.current_cloud_version }}/change-data-capture-overview.md %}) (for failback). Read more about [MOLT Replicator prerequisites]({% link molt/molt-replicator-installation.md %}#prerequisites).

## Terminology

- *Checkpoint*: The position in the source database's transaction log from which replication begins or resumes: LSN (PostgreSQL), GTID (MySQL), or SCN (Oracle).
- *Staging database*: A CockroachDB database used by Replicator to store replication metadata, checkpoints, and buffered mutations. Specified with [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) and automatically created with [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema). For details, refer to [Staging database](#staging-database).
- *Forward replication*: Replicate changes from a source database (PostgreSQL, MySQL, or Oracle) to CockroachDB during a migration. For usage details, refer to [Forward replication (after initial load)](#forward-replication-after-initial-load).
- *Failback*: Replicate changes from CockroachDB back to the source database. Used for migration rollback or to maintain data consistency on the source during migration. For usage details, refer to [Failback replication](#failback-replication).

## How it works

MOLT Replicator supports forward replication from PostgreSQL, MySQL, and Oracle, and failback from CockroachDB:

- PostgreSQL source ([`pglogical`]({% link molt/replicator-flags.md %}#commands)): MOLT Replicator uses [PostgreSQL logical replication](https://www.postgresql.org/docs/current/logical-replication.html), which is based on publications and replication slots. You create a publication for the target tables, and a slot marks consistent replication points. MOLT Replicator consumes this logical feed directly and applies the data in sorted batches to the target.

- MySQL source ([`mylogical`]({% link molt/replicator-flags.md %}#commands)): MOLT Replicator relies on [MySQL GTID-based replication](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) to read change data from MySQL binlogs. It works with MySQL versions that support GTID-based replication and applies transactionally consistent feeds to the target. Binlog features that do not use GTIDs are not supported.

- Oracle source ([`oraclelogminer`]({% link molt/replicator-flags.md %}#commands)): MOLT Replicator uses [Oracle LogMiner](https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-logminer-utility.html) to capture change data from Oracle redo logs. Both Oracle Multitenant (CDB/PDB) and single-tenant Oracle architectures are supported. Replicator periodically queries LogMiner-populated views and processes transactional data in ascending SCN windows for reliable throughput while maintaining consistency.

- Failback from CockroachDB ([`start`]({% link molt/replicator-flags.md %}#commands)): MOLT Replicator acts as an HTTP webhook sink for a single CockroachDB changefeed. Replicator receives mutations from source cluster nodes, can optionally buffer them in a CockroachDB staging cluster, and then applies time-ordered transactional batches to the target database. Mutations are applied as [`UPSERT`]({% link {{ site.current_cloud_version }}/upsert.md %}) or [`DELETE`]({% link {{ site.current_cloud_version }}/delete.md %}) statements while respecting [foreign-key]({% link {{ site.current_cloud_version }}/foreign-key.md %}) and table dependencies.

### Replicator commands

MOLT Replicator provides four commands for different replication scenarios. For example commands, refer to [Common uses](#common-uses).

Use `pglogical` to replicate from PostgreSQL to CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical
~~~

Use `mylogical` to replicate from MySQL to CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical
~~~

Use `oraclelogminer` to replicate from Oracle to CockroachDB:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer
~~~

Use `start` to replicate from CockroachDB to PostgreSQL, MySQL, or Oracle (failback):

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start
~~~

### Source connection strings

{{site.data.alerts.callout_success}}
Follow the security recommendations in [Connection security and credentials]({% link molt/molt-replicator-best-practices.md %}#connection-security-and-credentials).
{{site.data.alerts.end}}

[`--sourceConn`]({% link molt/replicator-flags.md %}#source-conn) specifies the connection string of the source database for forward replication.

{{site.data.alerts.callout_info}}
The source connection string **must** point to the primary instance of the source database. Replicas cannot provide the necessary replication checkpoints and transaction metadata required for ongoing replication.
{{site.data.alerts.end}}

PostgreSQL connection string:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

MySQL connection string:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

Oracle connection string:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

For Oracle Multitenant databases, [`--sourcePDBConn`]({% link molt/replicator-flags.md %}#source-pdb-conn) specifies the pluggable database (PDB) connection. [`--sourceConn`]({% link molt/replicator-flags.md %}#source-conn) specifies the container database (CDB):

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{cdb_service_name}'
--sourcePDBConn 'oracle://{username}:{password}@{host}:{port}/{pdb_service_name}'
~~~

For failback, [`--stagingConn`]({% link molt/replicator-flags.md %}#staging-conn) specifies the CockroachDB connection string:

{% include_cached copy-clipboard.html %}
~~~
--stagingConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

### Target connection strings

[`--targetConn`]({% link molt/replicator-flags.md %}#target-conn) specifies the connection string of the target CockroachDB database for forward replication:

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

{{site.data.alerts.callout_info}}
For failback, [`--targetConn`]({% link molt/replicator-flags.md %}#target-conn) specifies the original source database (PostgreSQL, MySQL, or Oracle). For details, refer to [Failback replication](#failback-replication).
{{site.data.alerts.end}}

### Replication checkpoints

MOLT Replicator requires a checkpoint value to start replication from the correct position in the source database's transaction log.

For PostgreSQL, use [`--slotName`]({% link molt/replicator-flags.md %}#slot-name) to specify the [replication slot created during the data load]({% link molt/molt-fetch.md %}#initial-bulk-load-before-replication). The slot automatically tracks the LSN (Log Sequence Number):

{% include_cached copy-clipboard.html %}
~~~
--slotName molt_slot
~~~

For MySQL, set [`--defaultGTIDSet`]({% link molt/replicator-flags.md %}#default-gtid-set) to the [`cdc_cursor` value]({% link molt/molt-fetch.md %}#enable-replication) from the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29'
~~~

For Oracle, set [`--scn`]({% link molt/replicator-flags.md %}#scn) and [`--backfillFromSCN`]({% link molt/replicator-flags.md %}#backfill-from-scn) to the [`cdc_cursor` values]({% link molt/molt-fetch.md %}#enable-replication) from the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--scn 26685786
--backfillFromSCN 26685444
~~~

### Staging database

The staging database stores replication metadata, checkpoints, and buffered mutations. Specify the staging database with [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) in fully-qualified `database.schema` format and create it automatically with [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema):

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema defaultdb._replicator
--stagingCreateSchema
~~~

The staging database is used to:

- Store checkpoints that enable resuming from the correct point after interruptions.
- Buffer mutations before applying them to the target in transaction order.
- Maintain consistency for time-ordered transactional batches while respecting table dependencies.
- Provide restart capabilities after failures.

### Consistency modes

MOLT Replicator supports three consistency modes for balancing throughput and transactional guarantees:

1. *Consistent* (failback mode only, default for CockroachDB sources): Preserves per-row order and source transaction atomicity. Concurrent transactions are controlled by [`--parallelism`]({% link molt/replicator-flags.md %}#parallelism).

1. *BestEffort* (failback mode only): Relaxes atomicity across tables that do not have foreign key constraints between them (maintains coherence within FK-connected groups). Enable with [`--bestEffortOnly`]({% link molt/replicator-flags.md %}#best-effort-only) or allow auto-entry via [`--bestEffortWindow`]({% link molt/replicator-flags.md %}#best-effort-window) set to a positive duration (such as `1s`).

	{{site.data.alerts.callout_info}}
	For independent tables (with no foreign key constraints), BestEffort mode applies changes immediately as they arrive, without waiting for the resolved timestamp. This provides higher throughput for tables that have no relationships with other tables.
	{{site.data.alerts.end}}

1. *Immediate* (default for PostgreSQL, MySQL, and Oracle sources): Applies updates as they arrive to Replicator with no buffering or waiting for resolved timestamps. For CockroachDB sources, provides highest throughput but requires no foreign keys on the target schema.

### Userscripts

MOLT Replicator can apply *userscripts*, specified with the [`--userscript` flag]({% link molt/replicator-flags.md %}#userscript), to customize how data is processed and transformed as it moves through the live replication pipeline. Userscripts are customized TypeScript files that apply transformation logic to rows of data on a per-schema and per-table basis.

Userscripts are intended to address unique business or data transformation needs. They perform operations that cannot be handled by the source change data capture (CDC) stream, such as filtering out specific tables, rows, or columns; routing data from a single source table to multiple target tables; transforming column values or adding computed columns; and implementing custom error handling. These tranformations occur in-flight, between the source and target databases.

To have MOLT Replicator apply a userscript, include the [`--userscript`]({% link molt/replicator-flags.md %}#userscript) flag with any [Replicator command]({% link molt/replicator-flags.md %}). The flag accepts a path to a TypeScript filename.

{% include_cached copy-clipboard.html %}
~~~ 
--userscript 'path/to/script.ts'
~~~

For more information, read the [userscript documentation]({% link molt/userscript-overview.md %}). Learn how to use the [userscript API]({% link molt/userscript-api.md %}) and refer to the [userscript cookbook examples]({% link molt/userscript-cookbook.md %}).

### Monitoring

#### Metrics

MOLT Replicator metrics are not enabled by default. Enable Replicator metrics by specifying the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag with a port (or `host:port`) when you start Replicator. This exposes Replicator metrics at `http://{host}:{port}/_/varz`. For example, the following flag exposes metrics on port `30005`:

~~~ 
--metricsAddr :30005
~~~

For guidelines on using and interpreting replication metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}).

#### Logging

By default, MOLT Replicator writes two streams of logs: operational logs to `stdout` (including `warning`, `info`, `trace`, and some errors) and final errors to `stderr`.

Redirect both streams to ensure all logs are captured for troubleshooting:

{% include_cached copy-clipboard.html %}
~~~shell
# Merge both streams to console
./replicator ... 2>&1

# Redirect both streams to a file
./replicator ... > output.log 2>&1

# Merge streams to console while saving to file
./replicator > >(tee replicator.log) 2>&1

# Use logDestination flag to write all logs to a file
./replicator --logDestination replicator.log ...
~~~

Enable debug logging with [`-v`]({% link molt/replicator-flags.md %}#verbose). For more granularity and system insights, enable trace logging with [`-vv`]({% link molt/replicator-flags.md %}#verbose). Pay close attention to warning- and error-level logs, as these indicate when Replicator is misbehaving.

## Common uses

### Forward replication (after initial load)

In a migration that utilizes [continuous replication]({% link  molt/migration-considerations-replication.md %}), run the `replicator` command after [using MOLT Fetch to perform the initial data load]({% link molt/molt-fetch.md %}#initial-bulk-load-before-replication). Run the `replicator` command with the required flags, as shown below:

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

<section class="filter-content" markdown="1" data-scope="postgres">
To start replication after an initial data load with MOLT Fetch, use the `pglogical` command:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
To start replication after an initial data load with MOLT Fetch, use the `mylogical` command:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
To start replication after an initial data load with MOLT Fetch, use the `oraclelogminer` command:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer
~~~
</section>

Specify the source and target database connections. For connection string formats, refer to [Source connection strings](#source-connection-strings) and [Target connection strings](#target-connection-strings):

{% include_cached copy-clipboard.html %}
~~~
--sourceConn $SOURCE
--targetConn $TARGET
~~~

<section class="filter-content" markdown="1" data-scope="oracle">
For Oracle Multitenant databases, also specify the PDB connection:

{% include_cached copy-clipboard.html %}
~~~
--sourcePDBConn $SOURCE_PDB
~~~

Specify the Oracle user that owns the tables to replicate. Oracle capitalizes identifiers by default, so use uppercase:

{% include_cached copy-clipboard.html %}
~~~
--sourceSchema MIGRATION_USER
~~~
</section>

Specify the target schema on CockroachDB with [`--targetSchema`]({% link molt/replicator-flags.md %}#target-schema) in fully-qualified `database.schema` format:

{% include_cached copy-clipboard.html %}
~~~
--targetSchema defaultdb.migration_schema
~~~

To replicate from the correct position, specify the appropriate checkpoint value. 

<section class="filter-content" markdown="1" data-scope="postgres">
Use [`--slotName`]({% link molt/replicator-flags.md %}#slot-name) to specify the slot [created during the data load]({% link molt/molt-fetch.md %}#initial-bulk-load-before-replication), which automatically tracks the LSN (Log Sequence Number) checkpoint:

{% include_cached copy-clipboard.html %}
~~~
--slotName molt_slot
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Use [`--defaultGTIDSet`]({% link molt/replicator-flags.md %}#default-gtid-set) from the `cdc_cursor` field in the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Use the [`--scn`]({% link molt/replicator-flags.md %}#scn) and [`--backfillFromSCN`]({% link molt/replicator-flags.md %}#backfill-from-scn) values from the `cdc_cursor` field in the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--scn 26685786
--backfillFromSCN 26685444
~~~
</section>

Use [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) to specify the staging database in fully-qualified `database.schema` format. Use [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema) to create it automatically on first run:

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema defaultdb._replicator
--stagingCreateSchema
~~~

At minimum, the `replicator` command should include the following flags:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.migration_schema \
--slotName molt_slot \
--stagingSchema defaultdb._replicator \
--stagingCreateSchema
~~~

</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--targetSchema defaultdb.public \
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29' \
--stagingSchema defaultdb._replicator \
--stagingCreateSchema
~~~

</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--targetConn $TARGET \
--sourceSchema MIGRATION_USER \
--targetSchema defaultdb.migration_schema \
--scn 26685786 \
--backfillFromSCN 26685444 \
--stagingSchema defaultdb._replicator \
--stagingCreateSchema
~~~

</section>

For detailed walkthroughs of migrations that use `replicator` in this way, refer to these common migration approaches:

- [Delta Migration]({% link molt/migration-approach-delta.md %})
- [Phased Delta Migration with Failback Replication]({% link molt/migration-approach-phased-delta-failback.md %})

### Failback replication

A migration that utilizes [failback replication]({% link molt/migration-considerations-rollback.md %}) replicates data from the CockroachDB cluster back to the source database. In this case, MOLT Replicator acts as a webhook sink for a CockroachDB changefeed.

Use the `start` command for failback:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start
~~~

Specify the target database connection (the database you originally migrated from) with [`--targetConn`]({% link molt/replicator-flags.md %}#target-conn). For connection string formats, refer to [Target connection strings](#target-connection-strings):

{% include_cached copy-clipboard.html %}
~~~
--targetConn $TARGET
~~~

Specify the CockroachDB connection string with [`--stagingConn`]({% link molt/replicator-flags.md %}#staging-conn). For details, refer to [Connect using a URL]({% link {{ site.current_cloud_version }}/connection-parameters.md %}#connect-using-a-url).

{% include_cached copy-clipboard.html %}
~~~
--stagingConn $STAGING
~~~

Specify the staging database name with [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) in fully-qualified `database.schema` format. This should be the same staging database created during [Forward replication with initial load](#forward-replication-after-initial-load):

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema defaultdb._replicator
~~~

Specify a webhook endpoint address for the changefeed to send changes to with [`--bindAddr`]({% link molt/replicator-flags.md %}#bind-addr). For example:

{% include_cached copy-clipboard.html %}
~~~
--bindAddr :30004
~~~

Specify TLS certificate and private key file paths for secure webhook connections with [`--tlsCertificate`]({% link molt/replicator-flags.md %}#tls-certificate) and [`--tlsPrivateKey`]({% link molt/replicator-flags.md %}#tls-private-key):

{% include_cached copy-clipboard.html %}
~~~
--tlsCertificate ./certs/server.crt
--tlsPrivateKey ./certs/server.key
~~~

At minimum, the `replicator` command should include the following flags:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start \
--targetConn $TARGET \
--stagingConn $STAGING \
--stagingSchema defaultdb._replicator \
--bindAddr :30004 \
--tlsCertificate ./certs/server.crt \
--tlsPrivateKey ./certs/server.key
~~~

<section class="filter-content" markdown="1" data-scope="postgres">

After starting `replicator`, create a CockroachDB changefeed to send changes to MOLT Replicator. For a detailed example, refer to [Phased Delta Migration with Failback Replication]({% link molt/phased-delta-failback-postgres.md %}#create-a-cockroachdb-changefeed).

{{site.data.alerts.callout_info}}
When [creating the CockroachDB changefeed]({% link molt/phased-delta-failback-postgres.md %}#create-a-cockroachdb-changefeed), you specify the target database and schema in the webhook URL path. For PostgreSQL targets, use the fully-qualified format `/database/schema` (`/migration_db/migration_schema`). For MySQL targets, use the database name (`/migration_db`). For Oracle targets, use the uppercase schema name (`/MIGRATION_SCHEMA`).

Explicitly set a default `10s` [`webhook_client_timeout`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options) value in the `CREATE CHANGEFEED` statement. This value ensures that the webhook can report failures in inconsistent networking situations and make crash loops more visible.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="mysql">

After starting `replicator`, create a CockroachDB changefeed to send changes to MOLT Replicator. For a detailed example, refer to [Phased Delta Migration with Failback Replication]({% link molt/phased-delta-failback-mysql.md %}#create-a-cockroachdb-changefeed).

{{site.data.alerts.callout_info}}
When [creating the CockroachDB changefeed]({% link molt/phased-delta-failback-mysql.md %}#create-a-cockroachdb-changefeed), you specify the target database and schema in the webhook URL path. For PostgreSQL targets, use the fully-qualified format `/database/schema` (`/migration_db/migration_schema`). For MySQL targets, use the database name (`/migration_db`). For Oracle targets, use the uppercase schema name (`/MIGRATION_SCHEMA`).

Explicitly set a default `10s` [`webhook_client_timeout`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options) value in the `CREATE CHANGEFEED` statement. This value ensures that the webhook can report failures in inconsistent networking situations and make crash loops more visible.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">

After starting `replicator`, create a CockroachDB changefeed to send changes to MOLT Replicator. For a detailed example, refer to [Phased Delta Migration with Failback Replication]({% link molt/phased-delta-failback-oracle.md %}#create-a-cockroachdb-changefeed).

{{site.data.alerts.callout_info}}
When [creating the CockroachDB changefeed]({% link molt/phased-delta-failback-oracle.md %}#create-a-cockroachdb-changefeed), you specify the target database and schema in the webhook URL path. For PostgreSQL targets, use the fully-qualified format `/database/schema` (`/migration_db/migration_schema`). For MySQL targets, use the database name (`/migration_db`). For Oracle targets, use the uppercase schema name (`/MIGRATION_SCHEMA`).

Explicitly set a default `10s` [`webhook_client_timeout`]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options) value in the `CREATE CHANGEFEED` statement. This value ensures that the webhook can report failures in inconsistent networking situations and make crash loops more visible.
{{site.data.alerts.end}}
</section>

### Resuming after an interruption

Whether you're using Replicator to perform [forward replication](#forward-replication-after-initial-load) or [failback replication](#failback-replication), an unexpected issue may cause replication to stop. Rerun the `replicator` command as shown below:

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

When resuming replication after an interruption, MOLT Replicator automatically uses the stored checkpoint to resume from the correct position. 

Rerun the same `replicator` command used during forward replication, specifying the same fully-qualified [`--stagingSchema`]({% link molt/replicator-flags.md %}#staging-schema) value as before. Omit [`--stagingCreateSchema`]({% link molt/replicator-flags.md %}#staging-create-schema) and any checkpoint flags. For example:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--slotName molt_slot \
--stagingSchema defaultdb._replicator
~~~

</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--stagingSchema defaultdb._replicator
~~~

</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--sourceSchema MIGRATION_USER \
--targetConn $TARGET \
--stagingSchema defaultdb._replicator
~~~

</section>

## See also

- [MOLT Replicator Installation]({% link molt/molt-replicator-installation.md %})
- [MOLT Replicator Flags]({% link molt/replicator-flags.md %})
- [MOLT Replicator Best Practices]({% link molt/molt-replicator-best-practices.md %})
- [MOLT Replicator Troubleshooting]({% link molt/molt-replicator-troubleshooting.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})