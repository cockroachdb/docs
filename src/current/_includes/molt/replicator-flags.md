### Replication flags

The following flags are set with [`--replicator-flags`](#global-flags) and can be used in any [Fetch mode](#fetch-mode) that involves replication.

|             Flag             |    Type    |                                                                    Description                                                                    |
|------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `--applyTimeout`             | `DURATION` | The maximum amount of time to wait for an update to be applied.<br><br>**Default:** `30s`                                                         |
| `--dlqTableName`             | `IDENT`    | The name of a table in the target schema for storing dead-letter entries.<br><br>**Default:** `replicator_dlq`                                    |
| `--flushPeriod`              | `DURATION` | Flush queued mutations after this duration.<br><br>**Default:** `1s`                                                                              |
| `--flushSize`                | `INT`      | Ideal batch size to determine when to flush mutations.<br><br>**Default:** `1000`                                                                 |
| `--gracePeriod`              | `DURATION` | Allow background processes to exit.<br><br>**Default:** `30s`                                                                                     |
| `--logDestination`           | `STRING`   | Write logs to a file. If not specified, write logs to `stdout`.                                                                                   |
| `--logFormat`                | `STRING`   | Choose log output format: `"fluent"`, `"text"`.<br><br>**Default:** `"text"`                                                                      |
| `--metricsAddr`              | `STRING`   | A `host:port` on which to serve metrics and diagnostics.                                                                                          |
| `--parallelism`              | `INT`      | The number of concurrent database transactions to use.<br><br>**Default:** `16`                                                                   |
| `--quiescentPeriod`          | `DURATION` | How often to retry deferred mutations.<br><br>**Default:** `10s`                                                                                  |
| `--retireOffset`             | `DURATION` | How long to delay removal of applied mutations.<br><br>**Default:** `24h0m0s`                                                                     |
| `--scanSize`                 | `INT`      | The number of rows to retrieve from the staging database used to store metadata for [replication modes](#fetch-mode).<br><br>**Default:** `10000` |
| `--schemaRefresh`            | `DURATION` | How often a watcher will refresh its schema. If this value is zero or negative, refresh behavior will be disabled.<br><br>**Default:** `1m0s`     |
| `--sourceConn`               | `STRING`   | The source database's connection string.                                                                                                          |
| `--stageMarkAppliedLimit`    | `INT`      | Limit the number of mutations to be marked applied in a single statement.<br><br>**Default:** `100000`                                            |
| `--stageSanityCheckPeriod`   | `DURATION` | How often to validate staging table apply order (`-1` to disable).<br><br>**Default:** `10m0s`                                                    |
| `--stageSanityCheckWindow`   | `DURATION` | How far back to look when validating staging table apply order.<br><br>**Default:** `1h0m0s`                                                      |
| `--stageUnappliedPeriod`     | `DURATION` | How often to report the number of unapplied mutations in staging tables (`-1` to disable).<br><br>**Default:** `1m0s`                             |
| `--stagingConn`              | `STRING`   | The staging database's connection string.                                                                                                         |
| `--stagingCreateSchema`      |            | Automatically create the staging schema if it does not exist.                                                                                     |
| `--stagingIdleTime`          | `DURATION` | Maximum lifetime of an idle connection.<br><br>**Default:** `1m0s`                                                                                |
| `--stagingJitterTime`        | `DURATION` | The time over which to jitter database pool disconnections.<br><br>**Default:** `15s`                                                             |
| `--stagingMaxLifetime`       | `DURATION` | The maximum lifetime of a database connection.<br><br>**Default:** `5m0s`                                                                         |
| `--stagingMaxPoolSize`       | `INT`      | The maximum number of staging database connections.<br><br>**Default:** `128`                                                                     |
| `--stagingSchema`            | `ATOM`     | A SQL database schema to store metadata in.<br><br>**Default:** `_replicator.public`                                                              |
| `--targetConn`               | `STRING`   | The target database's connection string.                                                                                                          |
| `--targetIdleTime`           | `DURATION` | Maximum lifetime of an idle connection.<br><br>**Default:** `1m0s`                                                                                |
| `--targetJitterTime`         | `DURATION` | The time over which to jitter database pool disconnections.<br><br>**Default:** `15s`                                                             |
| `--targetMaxLifetime`        | `DURATION` | The maximum lifetime of a database connection.<br><br>**Default:** `5m0s`                                                                         |
| `--targetMaxPoolSize`        | `INT`      | The maximum number of target database connections.<br><br>**Default:** `128`                                                                      |
| `--targetSchema`             | `ATOM`     | The SQL database schema in the target cluster to update.                                                                                          |
| `--targetStatementCacheSize` | `INT`      | The maximum number of prepared statements to retain.<br><br>**Default:** `128`                                                                    |
| `--taskGracePeriod`          | `DURATION` | How long to allow for task cleanup when recovering from errors.<br><br>**Default:** `1m0s`                                                        |
| `--timestampLimit`           | `INT`      | The maximum number of source timestamps to coalesce into a target transaction.<br><br>**Default:** `1000`                                         |
| `--userscript`               | `STRING`   | The path to a configuration script, see `userscript` subcommand.                                                                                  |
| `-v`, `--verbose`            | `COUNT`    | Increase logging verbosity to `debug`; repeat for `trace`.                                                                                        |

##### PostgreSQL replication flags

The following flags are set with [`--replicator-flags`](#global-flags) and can be used in any [Fetch mode](#fetch-mode) that involves replication from a [PostgreSQL source database](#source-and-target-databases).

|         Flag        |    Type    |                                   Description                                   |
|---------------------|------------|---------------------------------------------------------------------------------|
| `--publicationName` | `STRING`   | The publication within the source database to replicate.                        |
| `--slotName`        | `STRING`   | The replication slot in the source database.<br><br>**Default:** `"replicator"`   |
| `--standbyTimeout`  | `DURATION` | How often to report WAL progress to the source server.<br><br>**Default:** `5s` |

##### MySQL replication flags

The following flags are set with [`--replicator-flags`](#global-flags) and can be used in any [Fetch mode](#fetch-mode) that involves replication from a [MySQL source database](#source-and-target-databases).

|           Flag           |   Type   |                                                                                                              Description                                                                                                              |
|--------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--defaultGTIDSet`       | `STRING` | Default GTID set, in the format `source_uuid:min(interval_start)-max(interval_end)`. **Required** the first time [`--mode replication-only`](#replicate-changes) is run, as this provides a replication marker for streaming changes. |
| `--fetchMetadata`        |          | Fetch column metadata explicitly, for older versions of MySQL that don't support `binlog_row_metadata`.                                                                                                                               |
| `--replicationProcessID` | `UINT32` | The replication process ID to report to the source database.<br><br>**Default:** `10`                                                                                                                                                 |

##### Failback replication flags

The following flags are set with [`--replicator-flags`](#global-flags) and can be used in [`failback` mode](#fail-back-to-source-database).

|             Flag            |    Type    |                                                                                   Description                                                                                   |
|-----------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--assumeIdempotent`        |            | Disable the extra staging table queries that debounce non-idempotent redelivery in changefeeds.                                                                                 |
| `--bestEffortOnly`          |            | Eventually-consistent mode; useful for high-throughput, skew-tolerant schemas with [foreign keys]({% link {{ site.current_cloud_version }}/foreign-key.md %}).                  |
| `--bestEffortWindow`        | `DURATION` | Use an eventually-consistent mode for initial backfill or when replication is behind; `0` to disable.<br><br>**Default:** `1h0m0s`                                              |
| `--bindAddr`                | `STRING`   | The network address to bind to.<br><br>**Default:** `":26258"`                                                                                                                  |
| `--disableAuthentication`   |            | Disable authentication of incoming Replicator requests; not recommended for production.                                                                                         |
| `--disableCheckpointStream` |            | Disable cross-Replicator checkpoint notifications and rely only on polling.                                                                                                     |
| `--discard`                 |            | **Dangerous:** Discard all incoming HTTP requests; useful for changefeed throughput testing. Not intended for production.                                                       |
| `--discardDelay`            | `DURATION` | Adds additional delay in discard mode; useful for gauging the impact of changefeed round-trip time (RTT).                                                                       |
| `--healthCheckTimeout`      | `DURATION` | The timeout for the health check endpoint.<br><br>**Default:** `5s`                                                                                                             |
| `--httpResponseTimeout`     | `DURATION` | The maximum amount of time to allow an HTTP handler to execute.<br><br>**Default:** `2m0s`                                                                                      |
| `--immediate`               |            | Bypass staging tables and write directly to target; recommended only for KV-style workloads with no [foreign keys]({% link {{ site.current_cloud_version }}/foreign-key.md %}). |
| `--limitLookahead`          | `INT`      | Limit number of checkpoints to be considered when computing the resolving range; may cause replication to stall completely if older mutations cannot be applied.                |
| `--ndjsonBufferSize`        | `INT`      | The maximum amount of data to buffer while reading a single line of `ndjson` input; increase when source cluster has large blob values.<br><br>**Default:** `65536`             |
| `--tlsCertificate`          | `STRING`   | A path to a PEM-encoded TLS certificate chain.                                                                                                                                  |
| `--tlsPrivateKey`           | `STRING`   | A path to a PEM-encoded TLS private key.                                                                                                                                        |
| `--tlsSelfSigned`           |            | If true, generate a self-signed TLS certificate valid for `localhost`.                                                                                                          |