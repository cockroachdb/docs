---
title: MOLT Replicator
summary: Learn how to use the MOLT Replicator tool to continuously replicate changes from source databases to CockroachDB.
toc: true
docs_area: migrate
---

MOLT Replicator continuously replicates changes from source databases to CockroachDB as part of a [database migration]({% link molt/migration-overview.md %}).

MOLT Replicator consumes change data from CockroachDB changefeeds, PostgreSQL logical replication streams, MySQL GTID-based replication, and Oracle LogMiner. It applies changes to target databases while maintaining configurable consistency and transaction boundaries, and features an embedded TypeScript/JavaScript environment for configuration and live data transforms. For details, refer to [Consistency modes](#consistency-modes).

## Supported databases

The following source and target databases are currently supported:

**Sources:** CockroachDB, PostgreSQL 11-16, MySQL 5.7+ and 8.0+, Oracle Database 19c+
**Targets:** CockroachDB, PostgreSQL, MySQL, Oracle

## Installation

{% include molt/molt-install.md %}

## Setup

Complete the following items before using MOLT Replicator:

- Follow the recommendations in [Best practices](#best-practices) and [Security recommendations](#security-recommendations).

- Configure the source database for replication based on your source type. Refer to the migration workflow tutorials for [PostgreSQL]({% link molt/migrate-replicate-only.md %}), [MySQL]({% link molt/migrate-replicate-only.md %}?filters=mysql), [Oracle]({% link molt/migrate-replicate-only.md %}?filters=oracle), and [CockroachDB]({% link molt/migrate-failback.md %}) sources.

- Ensure that the SQL user running MOLT Replicator has appropriate privileges on the source and target databases as described in the migration workflow tutorials.

- URL-encode the connection strings for the source and target databases. This ensures that the MOLT tools can parse special characters in your password.

	{% include molt/fetch-secure-connection-strings.md %}

## Replication modes

MOLT Replicator operates in different modes depending on the source database type and replication requirements. These modes are used for ongoing replication during minimal-downtime migrations or for failback scenarios.

### Consistency modes

MOLT Replicator offers three consistency modes for balancing throughput and transactional guarantees:

1. **Consistent (default)**: Preserves per-row order and source transaction atomicity. Concurrent transactions are controlled by `--parallelism`.

2. **BestEffort**: Relaxes atomicity across tables that do not have foreign key constraints between them (maintains coherence within FK-connected groups). Enable with `--bestEffortOnly` or allow auto-entry via `--bestEffortWindow` set to a positive duration (e.g., `1s`).

3. **Immediate**: Applies updates as they arrive to Replicator with no buffering or waiting for resolved timestamps. Provides highest throughput but requires no foreign keys on the target schema.

	{{site.data.alerts.callout_info}}
	**Immediate mode is the default for Oracle, MySQL, and PostgreSQL sources.**
	{{site.data.alerts.end}}

### Use cases

- **Ongoing replication from a source database to CockroachDB**: Continuously stream changes from a source database into CockroachDB to keep it in sync while you test workloads or validate cutover paths.

- **Backfill from CockroachDB to your source database (Failback)**: Keep a replica up to date in another cluster/database while you test the cutover path. This preserves a rollback option during a migration window.

- **Live ongoing migrations to CockroachDB from a source**: Use a source CDC mechanism → Replicator → CockroachDB target. Start in consistent mode to preserve transaction boundaries; tune with `--parallelism`, and switch to BestEffort/Immediate only when you consciously accept looser transactional guarantees.

## Best practices

{{site.data.alerts.callout_success}}
To verify that your connections and configuration work properly, run MOLT Replicator in a staging environment before replicating any data in production. Use a test or development environment that closely resembles production.
{{site.data.alerts.end}}

- Monitor lag metrics (`source_lag_seconds`, `target_lag_seconds`) and apply/stage duration/error counters to track replication performance. Use the published [Grafana dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) to visualize these metrics.

- Tune performance parameters based on your workload. Prefer `--flushSize` tuning over `--flushPeriod` tuning for more predictable performance.

- For Oracle sources, ensure table and column names do not exceed 30 characters, as LogMiner will not include longer names in redo logs.

- Clean out the `_replicator` database memo table for fresh replication runs to avoid conflicts with previous checkpoints.

- Ensure that the machine running MOLT Replicator has sufficient resources. Monitor the apply rate and lag metrics to identify possible resource constraints.

- Pay close attention to warning and error level logging, as it indicates when Replicator is misbehaving. Enable trace logging with `-vv` for additional visibility when troubleshooting.

- Handle JSONB carefully: SQL NULL vs JSON null aren't distinguishable in JSON payloads. Avoid nullable JSONB columns where this distinction matters.

- {% include molt/molt-drop-constraints-indexes.md %}

## Security recommendations

Cockroach Labs **strongly** recommends the following:

### Secure connections

- Use TLS-enabled connection strings for `--sourceConn`, `--targetConn`, and `--stagingConn` parameters. Remove `sslmode=disable` from production connection strings.
- Configure server certificates using [`--tlsCertificate`](#cockroachdb-source-flags) and [`--tlsPrivateKey`](#cockroachdb-source-flags) to specify the certificate and private key file paths for the webhook endpoint.
- Avoid [`--disableAuthentication`](#cockroachdb-source-flags) and [`--tlsSelfSigned`](#cockroachdb-source-flags) flags in production environments.
- Configure proper TLS certificates in CockroachDB changefeed webhook URLs instead of using `insecure_tls_skip_verify=true`.
- Enable JWT authentication when appropriate for additional security.

### Connection strings

{% include molt/fetch-secure-connection-strings.md %}

## Commands

| Command |                                Usage                                 |
|---------|----------------------------------------------------------------------|
| `start` | Start the replicator in CockroachDB-to-target (failback) mode.      |
| `pglogical` | Start replication from a PostgreSQL source using logical replication. |
| `mylogical` | Start replication from a MySQL source using GTID-based replication. |
| `oraclelogminer` | Start replication from an Oracle source using LogMiner. |

## Flags

{% include molt/replicator-flags.md %}

## Usage

The following sections describe how to use MOLT Replicator with different source database types.

### Source and target databases

{{site.data.alerts.callout_success}}
Follow the recommendations in [Connection strings](#connection-strings).
{{site.data.alerts.end}}

#### CockroachDB sources

Use MOLT Replicator with CockroachDB sources for failback scenarios where you need to replicate changes from a CockroachDB cluster back to another database.

CockroachDB:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

#### PostgreSQL sources

Use MOLT Replicator with PostgreSQL sources to replicate ongoing changes using logical replication.

PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

#### MySQL sources

Use MOLT Replicator with MySQL sources to replicate ongoing changes using GTID-based replication.

MySQL:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

#### Oracle sources

Use MOLT Replicator with Oracle sources to replicate ongoing changes using LogMiner.

Oracle:

{% include_cached copy-clipboard.html %}
~~~
--sourceConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

In Oracle migrations, the `--sourceConn` connection string specifies a CDB and the `--sourcePDBConn` connection string specifies a PDB (in [Oracle Multitenant databases](https://docs.oracle.com/en/database/oracle/oracle-database/21/cncpt/CDBs-and-PDBs.html)). The `{username}` corresponds to the owner of the tables you will migrate.

#### Target databases

`--targetConn` specifies the [target database connection string]({% link {{site.current_cloud_version}}/connection-parameters.md %}#connect-using-a-url):

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'postgresql://{username}:{password}@{host}:{port}/{database}'
~~~

For MySQL targets:

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'mysql://{username}:{password}@{protocol}({host}:{port})/{database}'
~~~

For Oracle targets:

{% include_cached copy-clipboard.html %}
~~~
--targetConn 'oracle://{username}:{password}@{host}:{port}/{service_name}'
~~~

### Performance tuning

The key performance tuning parameters for **all source types** are:

- `--parallelism`: Maximum number of concurrent target transactions. Controls how many transactions can be applied to the target simultaneously.
- `--flushSize`: Batch size for mutations. Higher values increase throughput but add latency. Lower values reduce latency but may decrease throughput. Tune this based on your latency vs throughput requirements.
- `--targetApplyQueueSize`: Buffer size for queued applies. Higher values improve throughput but increase memory usage. Lower values reduce memory usage but may create backpressure.

**Connection pool tuning:** Set `--targetMaxPoolSize` to be larger than `--parallelism` by a safety factor to avoid exhausting target pool connections. Cockroach Labs recommends setting parallelism to 80% of `targetMaxPoolSize`.

**CockroachDB source-specific tuning options:**

- `--collapseMutations`: Collapse multiple mutations on the same primary key into a single resulting mutation. Helps reduce the number of queries to the target. Set to `false` if exact mutation order matters more than end state.
- `--enableParallelApplies`: Enable parallel applies for independent table groups. Improves throughput when tables have no foreign key dependencies between them. Requires higher `--targetMaxPoolSize` to support additional connections.
- `--flushPeriod`: Flush buffered mutations after this duration. Set to the maximum allowable time between flushes (e.g., `10s` if data must be applied within 10 seconds).
- `--scanSize`: Number of rows to retrieve from staging at a time. Tune higher to increase throughput at the expense of memory. Tune lower to reduce memory usage but potentially reduce throughput.
- `--quiescentPeriod`: How often to retry deferred mutations. Tune lower if constraint violations resolve quickly to reduce latency.

### Data transformations

Use `--userscript` to specify the path to a TypeScript/JavaScript file for data transformations and filtering. The userscript provides an embedded environment for configuration and live data transforms during replication.

### Resume replication

MOLT Replicator can resume replication if it is interrupted. Specify the staging schema with the `--stagingSchema` flag. MOLT Replicator uses the schema as a replication marker for streaming changes.

{% include_cached copy-clipboard.html %}
~~~
--stagingSchema {schema_name}
~~~

You **must** include the `--stagingSchema` flag when resuming replication, as the schema provides checkpointing data that enables replication to resume from the correct point.

## Metrics

By default, MOLT Replicator exports [Prometheus](https://prometheus.io/) metrics at the address specified by `--metricsAddr` (default `:30005`) at the path `/_/varz`. For example: `http://localhost:30005/_/varz`.

Cockroach Labs recommends monitoring the following metrics to track how far behind your replication is:

|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `source_lag_seconds`                  | **CockroachDB sources only:** Time between when an incoming resolved MVCC timestamp originated on the source CockroachDB cluster and when it was received by Replicator. |
| `target_lag_seconds`                  | **CockroachDB sources only:** End-to-end lag from when an incoming resolved MVCC timestamp originated on the source CockroachDB to when all data changes up to that timestamp were written to the target database. |
| `source_lag_seconds_histogram`        | **CockroachDB sources:** Same as `source_lag_seconds` but stored as a histogram for analyzing distributions over time.<br>**Non-CockroachDB sources:** Time between when a source transaction is committed and when its COMMIT transaction log arrives at Replicator. |
| `target_lag_seconds_histogram`        | **CockroachDB sources:** Same as `target_lag_seconds` but stored as a histogram for analyzing distributions over time.<br>**Non-CockroachDB sources:** End-to-end lag from when a source transaction is committed to when its changes are fully written to the target CockroachDB. |

Use these lag metrics to monitor the delay between mutations during replication and determine how far behind your replication is from the source database.

{{site.data.alerts.callout_info}}
**Note:** Lag metrics (`source_lag_seconds` and `target_lag_seconds`) are primarily available for Oracle LogMiner and CockroachDB-to-target replication modes.
{{site.data.alerts.end}}

You can also use the published [Grafana dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) to view these metrics.

### Health checks

Check MOLT Replicator health at `http://localhost:30005/_/healthz`.

### Logs

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

## Troubleshooting

### Common error patterns

#### Schema drift errors

Indicates source and target schemas are mismatched:

~~~
WARNING: schema drift detected in "database"."table" at payload object offset 0: unexpected columns: column_name
~~~

**Resolution:** Align schemas or use userscripts to transform data.

#### Apply flow failures

Target database constraint violations or connection issues:

~~~
WARNING: warning during tryCommit: ERROR: duplicate key value violates unique constraint
ERROR: maximum number of retries (10) exceeded
~~~

**Resolution:** Check target database constraints and connection stability.


### Performance troubleshooting

If MOLT Replicator appears hung or performs poorly:

1. Enable trace logging with `-vv`
2. Collect performance profiles:

	{% include_cached copy-clipboard.html %}
	~~~shell
	curl 'localhost:30005/debug/pprof/trace?seconds=15' > trace.out
	curl 'localhost:30005/debug/pprof/profile?seconds=15' > profile.out
	curl 'localhost:30005/debug/pprof/goroutine?seconds=15' > gr.out
	curl 'localhost:30005/debug/pprof/heap?seconds=15' > heap.out
	~~~

3. Monitor lag metrics and adjust performance parameters as needed.

### Data type considerations

#### JSONB considerations

SQL NULL vs JSON null aren't distinguishable in JSON payloads; avoid nullable JSONB where that matters.

#### Oracle limitations

- Table and column names must not exceed 30 characters
- Unsupported data types: Long BLOB/CLOBs (4000+ characters), UDTs, Nested tables, Varrays
- UPDATE statements that update only LOB columns are not supported by Oracle LogMiner
- For Oracle 12c, LogMiner doesn't support LOB columns


## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [Replicate data only]({% link molt/migrate-replicate-only.md %})
- [Fail back to source database]({% link molt/migrate-failback.md %})