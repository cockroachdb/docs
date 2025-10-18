---
title: MOLT Replicator
summary: Learn how to use the MOLT Replicator tool to continuously replicate changes from source databases to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Replicator continuously replicates changes from source databases to CockroachDB as part of a [database migration]({% link molt/migration-overview.md %}). It supports live ongoing migrations to CockroachDB from a source database, and enables backfill from CockroachDB to your source database for failback scenarios to preserve a rollback option during a migration window.

MOLT Replicator consumes change data from CockroachDB changefeeds, PostgreSQL logical replication streams, MySQL GTID-based replication, and Oracle LogMiner. It applies changes to target databases while maintaining configurable consistency {% comment %}and transaction boundaries{% endcomment %}, and features an embedded TypeScript/JavaScript environment for configuration and live data transforms.

## Supported databases

The following source databases are supported:

- CockroachDB
- PostgreSQL 11-16
- MySQL 5.7, 8.0 and later
- Oracle Database 19c (Enterprise Edition) and 21c (Express Edition)

The following target databases are supported:

- CockroachDB
- PostgreSQL
- MySQL
- Oracle

## Installation

{% include molt/molt-install.md %}

## Setup

Complete the following items before using MOLT Replicator:

- Follow the recommendations in [Best practices](#best-practices).

- Configure the source database for replication based on your source type. Refer to the migration workflow tutorials for [PostgreSQL]({% link molt/migrate-load-replicate.md %}#prepare-the-source-database), [MySQL]({% link molt/migrate-load-replicate.md %}?filters=mysql#prepare-the-source-database), [Oracle]({% link molt/migrate-load-replicate.md %}?filters=oracle#prepare-the-source-database), and [CockroachDB]({% link molt/migrate-failback.md %}) sources.

- Ensure that the SQL user running MOLT Replicator has appropriate privileges on the source and target databases, as described in the migration workflow tutorials.

## Docker usage

{% include molt/molt-docker.md %}

## How it works

Failback from CockroachDB (`start`): MOLT Replicator acts as an HTTP webhook sink for a CockroachDB changefeed. To avoid mixing streams of incoming data, only **one** changefeed should point to Replicator at a time. Replicator receives mutations from source cluster nodes, can optionally buffer them in a CockroachDB staging cluster, and then applies time-ordered transactional batches to the target database. Mutations are applied as `UPSERT` or `DELETE` statements while respecting foreign-key and table dependencies.

PostgreSQL source (`pglogical`): MOLT Replicator uses [PostgreSQL logical replication](https://www.postgresql.org/docs/current/logical-replication.html), which is based on publications and replication slots. You create a publication for the target tables, and a slot marks consistent replication points. MOLT Replicator consumes this logical feed directly and applies the data in sorted batches to the target.

MySQL source (`mylogical`): MOLT Replicator relies on [MySQL GTID-based replication](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) to read change data from MySQL binlogs. It works with MySQL versions that support GTID-based replication and applies transactionally consistent feeds to the target. Binlog features that do not use GTIDs are not supported.

Oracle source (`oraclelogminer`): MOLT Replicator uses Oracle LogMiner to capture change data from Oracle redo logs, supporting replication for a single database user/schema. Both multitenant (CDB) and non-CDB Oracle architectures are supported. Replicator periodically queries LogMiner-populated views and processes transactional data in ascending SCN windows for reliable throughput while maintaining consistency.

### Consistency modes

MOLT Replicator offers three consistency modes for balancing throughput and transactional guarantees:

1. Consistent (default for CockroachDB sources, failback mode only): Preserves per-row order and source transaction atomicity. Concurrent transactions are controlled by `--parallelism`.

1. BestEffort (failback mode only): Relaxes atomicity across tables that do not have foreign key constraints between them (maintains coherence within FK-connected groups). Enable with `--bestEffortOnly` or allow auto-entry via `--bestEffortWindow` set to a positive duration (e.g., `1s`).

	{{site.data.alerts.callout_info}}
	For independent tables (with no foreign key constraints), BestEffort mode applies changes immediately as they arrive, without waiting for the resolved timestamp. This provides higher throughput for tables that have no relationships with other tables.
	{{site.data.alerts.end}}

1. Immediate (default for PostgreSQL, MySQL, and Oracle sources): Applies updates as they arrive to Replicator with no buffering or waiting for resolved timestamps. Provides highest throughput but requires no foreign keys on the target schema.

## Commands

|     Command      |                                 Usage                                 |
|------------------|-----------------------------------------------------------------------|
| `start`          | Start the replicator in CockroachDB-to-target (failback) mode.        |
| `pglogical`      | Start replication from a PostgreSQL source using logical replication. |
| `mylogical`      | Start replication from a MySQL source using GTID-based replication.   |
| `oraclelogminer` | Start replication from an Oracle source using LogMiner.               |

## Flags

{% include molt/replicator-flags.md %}

## Usage

The following sections describe how to use MOLT Replicator with different source database types.

### Source and target databases

{{site.data.alerts.callout_success}}
Follow the recommendations in [Connection strings](#connection-strings).
{{site.data.alerts.end}}

#### `--sourceConn`

`--sourceConn` specifies the connection string of the source database.

CockroachDB:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

MySQL:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

Oracle:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

In Oracle migrations, the `--sourceConn` connection string specifies a CDB and the `--sourcePDBConn` connection string specifies a PDB (in [Oracle Multitenant databases](https://docs.oracle.com/en/database/oracle/oracle-database/21/cncpt/CDBs-and-PDBs.html)). The `{username}` corresponds to the owner of the tables you will migrate.

#### `--targetConn`

`--targetConn` specifies the target database connection string:

CockroachDB and PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

MySQL:

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

Oracle:

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

### Data transformations

Use `--userscript` to specify the path to a TypeScript/JavaScript file for data transformations and filtering. The userscript provides an embedded environment for configuration and live data transforms during replication.

{{site.data.alerts.callout_info}}
When filtering out tables in a schema with a userscript, Oracle replication performance may decrease because filtered tables are still included in LogMiner queries and processed before being discarded.
{{site.data.alerts.end}}

### Resume replication

MOLT Replicator can resume replication if it is interrupted. Specify the staging schema with the `--stagingSchema` flag. MOLT Replicator uses the schema as a replication marker for streaming changes.

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema {schema_name}
~~~

You **must** include the `--stagingSchema` flag when resuming replication, as the schema provides checkpointing data that enables replication to resume from the correct point.

For detailed steps, refer to [Resume replication]({% link molt/migrate-resume-replication.md %}).

### Staging schema

The staging schema stores replication metadata, checkpoint information, and buffered mutations during replication. MOLT Replicator uses this schema to:

- Track replication progress: Store checkpoints that enable resuming from the correct point after interruptions
- Buffer mutations: Temporarily store data changes before applying them to the target in transaction order
- Maintain consistency: Ensure MVCC time-ordered transactional batches while respecting table dependencies
- Enable recovery: Provide restart capabilities with robust failure handling

For fresh replication runs, clean out the staging database memo table to avoid conflicts with previous checkpoints. Use `--stagingCreateSchema` to automatically create the staging schema if it doesn't exist.

## Best practices

### Test and validate

To verify that your connections and configuration work properly, run MOLT Replicator in a staging environment before replicating any data in production. Use a test or development environment that closely resembles production.

### Connection strings

URL-encode the connection strings for the source and target databases. This ensures that the MOLT tools can parse special characters in your password.

{% include molt/fetch-secure-connection-strings.md %}

### Optimize performance

{% include molt/optimize-replicator-performance.md %}

### Monitoring and observability

- Monitor lag metrics (`source_lag_seconds`, `target_lag_seconds`) and apply/stage duration/error counters to track replication performance. Set up Prometheus and Grafana to poll the metrics and view them in a dashboard. Use the published [Grafana dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) to visualize these metrics.

- Pay close attention to warning and error level logging, as it indicates when Replicator is misbehaving. Enable trace logging with `-vv` for additional visibility when troubleshooting.

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

### Security

Cockroach Labs **strongly** recommends the following:

#### Connection security and credentials

- Use TLS-enabled connection strings for `--sourceConn`, `--targetConn`, and `--stagingConn` parameters. Remove `sslmode=disable` from production connection strings.
- For webhook endpoints (failback scenarios), configure server certificates using `--tlsCertificate` and `--tlsPrivateKey` to specify the certificate and private key file paths.
- Configure proper TLS certificates in CockroachDB changefeed webhook URLs instead of using `insecure_tls_skip_verify=true`.
- If relevant, enable JWT authentication for additional security.

#### CockroachDB changefeeds

For failback scenarios, generate TLS certificates using self-signed certificates, certificate authorities like Let's Encrypt, or your organization's certificate management system.

Encode certificates for changefeed webhook URLs:

- **Webhook URLs**: Use both URL encoding and base64 encoding: `base64 -i ./client.crt | jq -R -r '@uri'`
- **Non-webhook contexts**: Use base64 encoding only: `base64 -w 0 ca.cert`

Client certificates in changefeed webhook URLs must correspond to server certificates in MOLT Replicator configuration to ensure proper TLS handshake.

#### Production considerations

- Avoid `--disableAuthentication` and `--tlsSelfSigned` flags in production environments. These flags should only be used for testing or development purposes.

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