---
title: MOLT Replicator
summary: Learn how to use the MOLT Replicator tool to continuously replicate changes from source databases to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Replicator continuously replicates changes from source databases to CockroachDB as part of a [database migration]({% link molt/migration-overview.md %}). It supports live ongoing migrations to CockroachDB from a source database, and enables backfill from CockroachDB to your source database for failback scenarios to preserve a rollback option during a migration window.

MOLT Replicator consumes change data from CockroachDB changefeeds, PostgreSQL logical replication streams, MySQL GTID-based replication, and Oracle LogMiner. It applies changes to target databases while maintaining configurable consistency {% comment %}and transaction boundaries{% endcomment %}, and features an embedded TypeScript/JavaScript environment for configuration and live data transforms.

## Terminology

- [*Checkpoint*](#forward-replication-with-initial-load): The position in the source database's transaction log from which replication begins or resumes. Varies by database type (LSN for PostgreSQL, GTID for MySQL, SCN for Oracle).

- [*Staging database*](#staging-database): A CockroachDB database used by MOLT Replicator to store replication metadata, checkpoints, and buffered mutations. Created with `--stagingCreateSchema` and specified with `--stagingSchema`.

- [*Forward replication*](#forward-replication-with-initial-load): Replicating changes from a source database (PostgreSQL, MySQL, or Oracle) to CockroachDB during a migration.

- [*Failback*](#failback-to-source-database): Replicating changes from CockroachDB back to the original source database, used for rollback scenarios or to maintain data consistency on the source during migration.

## Requirements

### Supported databases

MOLT Replicator supports the following source and target databases:

- PostgreSQL 11-16
- MySQL 5.7, 8.0 and later
- Oracle Database 19c (Enterprise Edition) and 21c (Express Edition)
- CockroachDB (all currently [supported versions]({% link releases/release-support-policy.md %})#supported-versions)

### Database configuration

- PostgreSQL sources
	- Enable logical replication (`wal_level = logical`).
	- Connect to primary instance (replicas cannot create or manage logical replication slots or publications).

- MySQL sources
	- Enable GTID-based replication.
	- Configure binary logging with `binlog-row-metadata` or `binlog-row-image` set to `full`.
	- Configure sufficient binlog retention for migration duration.

- Oracle sources
	- Enable LogMiner with `ARCHIVELOG` mode.
	- Enable supplemental logging for primary keys.
	- Enable `FORCE LOGGING`.
	- Configure sufficient redo log retention.
	- Create sentinel table (`_replicator_sentinel`) in source schema.

- CockroachDB sources (failback only)
	- Enable rangefeeds (`kv.rangefeed.enabled = true`).

For detailed configuration steps, refer to [Setup](#setup).

### User permissions

The SQL user running MOLT Replicator requires specific privileges on both source and target databases. Required permissions vary by database type. For detailed permission requirements, refer to the migration workflow tutorials for [PostgreSQL]({% link molt/migrate-load-replicate.md %}#create-migration-user-on-source-database), [MySQL]({% link molt/migrate-load-replicate.md %}?filters=mysql#create-migration-user-on-source-database), [Oracle]({% link molt/migrate-load-replicate.md %}?filters=oracle#create-migration-user-on-source-database), and [CockroachDB]({% link molt/migrate-failback.md %}#prepare-the-cockroachdb-cluster) sources.

## Installation

{% include molt/molt-install.md %}

## Setup

Complete the following items before using MOLT Replicator:

- Follow the recommendations in [Best practices](#best-practices).

- Configure the source database for replication based on your source type. Refer to the migration workflow tutorials for [PostgreSQL]({% link molt/migrate-load-replicate.md %}#prepare-the-source-database), [MySQL]({% link molt/migrate-load-replicate.md %}?filters=mysql#prepare-the-source-database), [Oracle]({% link molt/migrate-load-replicate.md %}?filters=oracle#prepare-the-source-database), and [CockroachDB]({% link molt/migrate-failback.md %}) sources.

- Ensure that the SQL user running MOLT Replicator has appropriate privileges on the source and target databases, as described in the corresponding tutorial.

## Docker usage

{% include molt/molt-docker.md %}

## How it works

Failback from CockroachDB (`start`): MOLT Replicator acts as an HTTP webhook sink for a single CockroachDB changefeed. Replicator receives mutations from source cluster nodes, can optionally buffer them in a CockroachDB staging cluster, and then applies time-ordered transactional batches to the target database. Mutations are applied as [`UPSERT`]({% link {{ site.current_cloud_version }}/upsert.md %}) or [`DELETE`]({% link {{ site.current_cloud_version }}/delete.md %}) statements while respecting [foreign-key]({% link {{ site.current_cloud_version }}/foreign-key.md %}) and table dependencies.

PostgreSQL source (`pglogical`): MOLT Replicator uses [PostgreSQL logical replication](https://www.postgresql.org/docs/current/logical-replication.html), which is based on publications and replication slots. You create a publication for the target tables, and a slot marks consistent replication points. MOLT Replicator consumes this logical feed directly and applies the data in sorted batches to the target.

MySQL source (`mylogical`): MOLT Replicator relies on [MySQL GTID-based replication](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) to read change data from MySQL binlogs. It works with MySQL versions that support GTID-based replication and applies transactionally consistent feeds to the target. Binlog features that do not use GTIDs are not supported.

Oracle source (`oraclelogminer`): MOLT Replicator uses [Oracle LogMiner](https://docs.oracle.com/en/database/oracle/oracle-database/21/sutil/oracle-logminer-utility.html) to capture change data from Oracle redo logs. Both Oracle Multitenant (CDB/PDB) and single-tenant Oracle architectures are supported. Replicator periodically queries LogMiner-populated views and processes transactional data in ascending SCN windows for reliable throughput while maintaining consistency.

### Consistency modes

MOLT Replicator offers three consistency modes for balancing throughput and transactional guarantees:

1. Consistent (default for CockroachDB sources, failback mode only): Preserves per-row order and source transaction atomicity. Concurrent transactions are controlled by `--parallelism`.

1. BestEffort (failback mode only): Relaxes atomicity across tables that do not have foreign key constraints between them (maintains coherence within FK-connected groups). Enable with `--bestEffortOnly` or allow auto-entry via `--bestEffortWindow` set to a positive duration (e.g., `1s`).

	{{site.data.alerts.callout_info}}
	For independent tables (with no foreign key constraints), BestEffort mode applies changes immediately as they arrive, without waiting for the resolved timestamp. This provides higher throughput for tables that have no relationships with other tables.
	{{site.data.alerts.end}}

1. Immediate (default for PostgreSQL, MySQL, and Oracle sources): Applies updates as they arrive to Replicator with no buffering or waiting for resolved timestamps. Provides highest throughput but requires no foreign keys on the target schema.

## Commands

MOLT Replicator provides the following commands:

|     Command      |                                 Description                                 |
|------------------|-----------------------------------------------------------------------------|
| `pglogical`      | Replicate from PostgreSQL source to CockroachDB target using logical replication. Requires PostgreSQL publications and replication slots. |
| `mylogical`      | Replicate from MySQL source to CockroachDB target using GTID-based replication. Requires GTID-enabled binlog. |
| `oraclelogminer` | Replicate from Oracle source to CockroachDB target using LogMiner. Requires `ARCHIVELOG` mode and supplemental logging. |
| `start`          | Replicate from CockroachDB source to PostgreSQL, MySQL, or Oracle target (failback mode). Requires a CockroachDB changefeed with rangefeeds enabled. |

For command-specific flags and examples, refer to [Usage](#usage) and [Common Workflows](#common-workflows).

### Subcommands

| Subcommand |                                                                                                                   Description                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `make-jwt` | Generate JWT tokens for authorizing changefeed connections in failback scenarios. Supports signing tokens with RSA or EC keys, or generating claims for external JWT providers. For details, refer to [JWT authentication](#jwt-authentication). |
| `version`  | Display version information and Go module dependencies with checksums. For details, refer to [Supply chain security](#supply-chain-security).                                                                                                    |

## Flags

{% include molt/replicator-flags.md %}

### `make-jwt` flags

The following flags are used with the [`make-jwt` subcommand](#token-quickstart) to generate JWT tokens for changefeed authentication.

|       Flag      |   Type   |                                   Description                                    |
|-----------------|----------|----------------------------------------------------------------------------------|
| `-a`, `--allow` | `STRING` | One or more `database.schema` identifiers. Can be repeated for multiple schemas. |
| `--claim`       |          | If `true`, print a minimal JWT claim instead of signing.                         |
| `-k`, `--key`   | `STRING` | The path to a PEM-encoded private key to sign the token with.                    |
| `-o`, `--out`   | `STRING` | A file to write the token to.                                                    |

## Usage

### Connection strings

MOLT Replicator uses `--sourceConn` and `--targetConn` flags to specify database connections. Connection string formats vary by database type.

{{site.data.alerts.callout_success}}
Follow the security recommendations in [Connection security and credentials](#connection-security-and-credentials).
{{site.data.alerts.end}}

PostgreSQL and CockroachDB:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

MySQL:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
--targetConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

Oracle:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
--targetConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

For Oracle Multitenant databases, use `--sourcePDBConn` to specify the PDB connection:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{cdb_service_name}'
--sourcePDBConn 'oracle://{username}:{password}@{host}:{port}/{pdb_service_name}'
~~~

### Staging database

The staging database stores replication metadata, checkpoints, and buffered mutations. Specify the staging database with `--stagingSchema` and create it automatically with `--stagingCreateSchema`:

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema _replicator --stagingCreateSchema
~~~

The staging database is used to:

- Store checkpoints that enable resuming from the correct point after interruptions.
- Buffer mutations before applying them to the target in transaction order.
- Maintain consistency for time-ordered transactional batches while respecting table dependencies.
- Provide restart capabilities after failures.

## Common workflows

### Forward replication with initial load

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

To start replication after an [initial data load with MOLT Fetch]({% link molt/migrate-load-replicate.md %}#start-fetch), use the appropriate `replicator` command for your source database:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer
~~~
</section>

Specify the source and target database connections. For connection string formats, refer to [Connection strings](#connection-strings):

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

Specify the source Oracle schema to replicate from:

{% include_cached copy-clipboard.html %}
~~~
--sourceSchema migration_schema
~~~
</section>

To replicate from the correct position, specify the appropriate checkpoint value. 

<section class="filter-content" markdown="1" data-scope="postgres">
Use `--slotName` to specify the slot created during the data load, which automatically tracks the LSN (Log Sequence Number) checkpoint:

{% include_cached copy-clipboard.html %}
~~~
--slotName molt_slot
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
Use `--defaultGTIDSet` from the `cdc_cursor` field in the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29'
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
Use the `--scn` and `--backfillFromSCN` values from the MOLT Fetch output:

{% include_cached copy-clipboard.html %}
~~~
--scn 26685786
--backfillFromSCN 26685444
~~~
</section>

Specify the staging database. Use `--stagingCreateSchema` to create it automatically on first run:

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema _replicator
--stagingCreateSchema
~~~

At minimum, the `replicator` command should include the following flags:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--slotName molt_slot \
--stagingSchema _replicator \
--stagingCreateSchema
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--defaultGTIDSet '4c658ae6-e8ad-11ef-8449-0242ac140006:1-29' \
--stagingSchema _replicator \
--stagingCreateSchema
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--sourceSchema migration_schema \
--targetConn $TARGET \
--scn 26685786 \
--backfillFromSCN 26685444 \
--stagingSchema _replicator \
--stagingCreateSchema
~~~
</section>

For detailed steps, refer to [Load and replicate]({% link molt/migrate-load-replicate.md %}#start-replicator).

### Resume after interruption

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="postgres">PostgreSQL</button>
    <button class="filter-button" data-scope="mysql">MySQL</button>
    <button class="filter-button" data-scope="oracle">Oracle</button>
</div>

When resuming replication after an interruption, MOLT Replicator automatically uses the stored checkpoint to resume from the correct position. 

Rerun the same `replicator` command used during [Forward replication with initial load](#forward-replication-with-initial-load), but omit `--stagingCreateSchema` and any checkpoint flags. For example:

<section class="filter-content" markdown="1" data-scope="postgres">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator pglogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--slotName molt_slot \
--stagingSchema _replicator
~~~
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator mylogical \
--sourceConn $SOURCE \
--targetConn $TARGET \
--stagingSchema _replicator
~~~
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{% include_cached copy-clipboard.html %}
~~~ shell
replicator oraclelogminer \
--sourceConn $SOURCE \
--sourcePDBConn $SOURCE_PDB \
--sourceSchema migration_schema \
--targetConn $TARGET \
--stagingSchema _replicator
~~~
</section>

For detailed steps, refer to [Resume replication]({% link molt/migrate-resume-replication.md %}).

### Failback to source database

When replicating from CockroachDB back to the source database, MOLT Replicator acts as a webhook sink for a CockroachDB changefeed.

Use the `start` command for failback:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start
~~~

Specify the target database connection (the database you originally migrated from). For connection string formats, refer to [Connection strings](#connection-strings):

{% include_cached copy-clipboard.html %}
~~~
--targetConn $TARGET
~~~

Specify the CockroachDB staging database connection:

{% include_cached copy-clipboard.html %}
~~~
--stagingConn $STAGING
~~~

Specify the staging database name. This should be the same staging database created during [Forward replication with initial load](#forward-replication-with-initial-load):

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema _replicator
~~~

Specify a webhook endpoint address for the changefeed to send changes to. For example:

{% include_cached copy-clipboard.html %}
~~~
--bindAddr :30004
~~~

Specify TLS certificate and private key file paths for secure webhook connections:

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
--stagingSchema _replicator \
--bindAddr :30004 \
--tlsCertificate ./certs/server.crt \
--tlsPrivateKey ./certs/server.key
~~~

For detailed steps, refer to [Migration failback]({% link molt/migrate-failback.md %}).

## Monitoring

Monitor lag metrics (`source_lag_seconds`, `target_lag_seconds`) and apply/stage duration/error counters to track replication performance. Set up Prometheus and Grafana to poll the metrics and view them in a dashboard. Use the published [Grafana dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) to visualize these metrics.

Pay close attention to warning and error level logging, as it indicates when Replicator is misbehaving. Enable trace logging with `-vv` for additional visibility when troubleshooting.

### Metrics

MOLT Replicator can export [Prometheus](https://prometheus.io/) metrics by setting the `--metricsAddr` flag to a port (for example, `--metricsAddr :30005`). Metrics are not enabled by default. When enabled, metrics are available at the path `/_/varz`. For example: `http://localhost:30005/_/varz`.

Cockroach Labs recommends monitoring the following metrics during replication:

|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `source_lag_seconds`                  | **CockroachDB sources only:** Time between when an incoming resolved MVCC timestamp originated on the source CockroachDB cluster and when it was received by Replicator. |
| `target_lag_seconds`                  | **CockroachDB sources only:** End-to-end lag from when an incoming resolved MVCC timestamp originated on the source CockroachDB to when all data changes up to that timestamp were written to the target database. |
| `source_lag_seconds_histogram`        | **CockroachDB sources:** Same as `source_lag_seconds` but stored as a histogram for analyzing distributions over time.<br>**Non-CockroachDB sources:** Time between when a source transaction is committed and when its COMMIT transaction log arrives at Replicator. |
| `target_lag_seconds_histogram`        | **CockroachDB sources:** Same as `target_lag_seconds` but stored as a histogram for analyzing distributions over time.<br>**Non-CockroachDB sources:** End-to-end lag from when a source transaction is committed to when its changes are fully written to the target CockroachDB. |
| `replicator_applier_mutations_staged` | Number of mutations that have been staged for application to the target database.                                          |
| `replicator_applier_mutations_applied` | Number of mutations that have been successfully applied to the target database.                                           |

You can use the [Replicator Grafana dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) to visualize these metrics. For Oracle-specific metrics, import [this Oracle Grafana dashboard](https://replicator.cockroachdb.com/replicator_oracle_grafana_dashboard.json).

To check MOLT Replicator health when metrics are enabled, run `curl http://localhost:30005/_/healthz` (replacing the port with your `--metricsAddr` value). This returns a status code of `200` if Replicator is running.

### Logging

By default, MOLT Replicator writes two streams of logs: operational logs to `stdout` (including warning, info, trace, and some errors) and final errors to `stderr`.

Redirect both streams properly to ensure all logs are captured for troubleshooting:

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

## Security

Cockroach Labs **strongly** recommends the following:

### Connection security and credentials

{% include molt/molt-secure-connection-strings.md %}

### CockroachDB changefeeds

For failback scenarios, secure the connection from CockroachDB to MOLT Replicator using TLS certificates. Generate TLS certificates using self-signed certificates, certificate authorities like Let's Encrypt, or your organization's certificate management system.

#### TLS from CockroachDB to Replicator

Configure MOLT Replicator with server certificates using the `--tlsCertificate` and `--tlsPrivateKey` flags to specify the certificate and private key file paths. For example:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start \
--tlsCertificate ./certs/server.crt \
--tlsPrivateKey ./certs/server.key \
...
~~~

These server certificates must correspond to the client certificates specified in the changefeed webhook URL to ensure proper TLS handshake.

Encode client certificates for changefeed webhook URLs:

- **Webhook URLs**: Use both URL encoding and base64 encoding: `base64 -i ./client.crt | jq -R -r '@uri'`
- **Non-webhook contexts**: Use base64 encoding only: `base64 -w 0 ca.cert`

#### JWT authentication

You can use JSON Web Tokens (JWT) to authorize incoming changefeed connections and restrict writes to a subset of SQL databases or user-defined schemas in the target cluster.

Replicator supports JWT claims that allow writes to specific databases, schemas, or all of them. JWT tokens must be signed using RSA or EC keys. HMAC and `None` signatures are automatically rejected.

To configure JWT authentication:

1. Add PEM-formatted public signing keys to the `_replicator.jwt_public_keys` table in the staging database.

1. To revoke a specific token, add its `jti` value to the `_replicator.jwt_revoked_ids` table in the staging database.

The Replicator process re-reads these tables every minute to pick up changes.

To pass the JWT token from the changefeed to the Replicator webhook sink, use the [`webhook_auth_header` option]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED ... WITH webhook_auth_header='Bearer <encoded_token>';
~~~

##### Token quickstart

The following example uses `OpenSSL` to generate keys, but any PEM-encoded RSA or EC keys will work.

{% include_cached copy-clipboard.html %}
~~~ shell
# Generate an EC private key using OpenSSL.
openssl ecparam -out ec.key -genkey -name prime256v1

# Write the public key components to a separate file.
openssl ec -in ec.key -pubout -out ec.pub

# Upload the public key for all instances of Replicator to find it.
cockroach sql -e "INSERT INTO _replicator.jwt_public_keys (public_key) VALUES ('$(cat ec.pub)')"

# Reload configuration, or wait one minute.
killall -HUP replicator

# Generate a token which can write to the ycsb.public schema.
# The key can be decoded using the debugger at https://jwt.io.
# Add the contents of out.jwt to the CREATE CHANGEFEED command:
# WITH webhook_auth_header='Bearer {out.jwt}'
replicator make-jwt -k ec.key -a ycsb.public -o out.jwt
~~~

##### External JWT providers

The `make-jwt` subcommand also supports a `--claim` [flag](#make-jwt-flags), which prints a JWT claim that can be signed by your existing JWT provider. The PEM-formatted public key or keys for that provider must be inserted into the `_replicator.jwt_public_keys` table. The `iss` (issuers) and `jti` (token id) fields will likely be specific to your auth provider, but the custom claim must be retained in its entirety.

You can repeat the `-a` [flag](#make-jwt-flags) to create a claim for multiple schemas:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator make-jwt -a 'database.schema' --claim
~~~

~~~json
{
  "iss": "replicator",
  "jti": "d5ffa211-8d54-424b-819a-bc19af9202a5",
  "https://github.com/cockroachdb/replicator": {
    "schemas": [
      [
        "database",
        "schema"
      ]
    ]
  }
}
~~~

{{site.data.alerts.callout_info}}
For details on the `make-jwt` command flags, refer to [`make-jwt` flags](#make-jwt-flags).
{{site.data.alerts.end}}

### Production considerations

- Avoid `--disableAuthentication` and `--tlsSelfSigned` flags in production environments. These flags should only be used for testing or development purposes.

### Supply chain security

Use the `version` subcommand to verify the integrity of your MOLT Replicator build and identify potential upstream vulnerabilities. The output includes all Go modules, their checksums, and versions:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator version
~~~

The output includes:

- Module name
- go.mod checksum
- Version

Use this information to determine if your build may be subject to vulnerabilities from upstream packages. Cockroach Labs uses Dependabot to automatically upgrade Go modules, and the team regularly merges Dependabot updates to address security issues.

## Best practices

### Test and validate

To verify that your connections and configuration work properly, run MOLT Replicator in a staging environment before replicating any data in production. Use a test or development environment that closely resembles production.

### Optimize performance

{% include molt/optimize-replicator-performance.md %}

## Troubleshooting

{% include molt/molt-troubleshooting-replication.md %}

{% include molt/molt-troubleshooting-failback.md %}

## Examples

For detailed examples of using MOLT Replicator usage, refer to the migration workflow tutorials:

- [Load and replicate]({% link molt/migrate-load-replicate.md %}): Load data with MOLT Fetch and set up ongoing replication with MOLT Replicator.
- [Start or Resume Replication]({% link molt/migrate-resume-replication.md %}): Start replication without MOLT Fetch or resume replication after an interruption.
- [Migration failback]({% link molt/migrate-failback.md %}): Replicate changes from CockroachDB back to the source database.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [Load and replicate]({% link molt/migrate-load-replicate.md %})
- [Start or Resume Replication]({% link molt/migrate-resume-replication.md %})
- [Migration Failback]({% link molt/migrate-failback.md %})