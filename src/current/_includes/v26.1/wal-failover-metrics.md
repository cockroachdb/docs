You can monitor WAL failover occurrences using the following metrics:

- `storage.wal.failover.secondary.duration`: Cumulative time spent (in nanoseconds) writing to the secondary WAL directory. Only populated when WAL failover is configured.
- `storage.wal.failover.primary.duration`: Cumulative time spent (in nanoseconds) writing to the primary WAL directory. Only populated when WAL failover is configured.
- `storage.wal.failover.switch.count`: Count of the number of times WAL writing has switched from primary to secondary store, and vice versa.
- `storage.wal.fsync.latency` monitors the latencies of WAL files. If you have WAL failover enabled and are failing over, `storage.wal.fsync.latency` will include the latency of the stalled primary. 
- `storage.wal.failover.write_and_sync.latency`: When WAL failover is configured in a cluster, the operator should monitor this metric which shows the effective latency observed by the higher layer writing to the WAL. This metric is expected to stay low in a healthy system, regardless of whether WAL files are being written to the primary or secondary.

The `storage.wal.failover.secondary.duration` is the primary metric to monitor. You should expect this metric to be `0` unless a WAL failover occurs. If a WAL failover occurs, the rate at which it increases provides an indication of the health of the primary store.

You can access these metrics via the following methods:

- The [**Custom Chart** debug page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) in [DB Console]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}).
- By [monitoring CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}).

For more information, refer to [Essential storage metrics]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %}#storage)
