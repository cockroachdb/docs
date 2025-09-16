### Replicator metrics

By default, MOLT Replicator exports [Prometheus](https://prometheus.io/) metrics at the address specified by `--metricsAddr` (default `:30005`) at the path `/_/varz`. For example: `http://localhost:30005/_/varz`.

Cockroach Labs recommends monitoring the following metrics during replication:

{% if page.name == "migrate-failback.md" %}
|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `source_lag_seconds`                  | Time between when an incoming resolved MVCC timestamp originated on the source CockroachDB cluster and when it was received by Replicator. |
| `target_lag_seconds`                  | End-to-end lag from when an incoming resolved MVCC timestamp originated on the source CockroachDB to when all data changes up to that timestamp were written to the target database. |
| `source_lag_seconds_histogram`        | Same as `source_lag_seconds` but stored as a histogram for analyzing distributions over time. |
| `target_lag_seconds_histogram`        | Same as `target_lag_seconds` but stored as a histogram for analyzing distributions over time. |
| `replicator_applier_mutations_staged` | Number of mutations that have been staged for application to the target database.                                          |
| `replicator_applier_mutations_applied` | Number of mutations that have been successfully applied to the target database.                                           |
{% else %}
|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `source_lag_seconds_histogram`        | Time between when a source transaction is committed and when its COMMIT transaction log arrives at Replicator. |
| `target_lag_seconds_histogram`        | End-to-end lag from when a source transaction is committed to when its changes are fully written to the target CockroachDB. |
| `replicator_applier_mutations_staged` | Number of mutations that have been staged for application to the target database.                                          |
| `replicator_applier_mutations_applied` | Number of mutations that have been successfully applied to the target database.                                           |
{% endif %}

You can use the [Replicator Grafana dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) to visualize these metrics. <section class="filter-content" markdown="1" data-scope="oracle">For Oracle-specific metrics, import [this Oracle Grafana dashboard](https://replicator.cockroachdb.com/replicator_oracle_grafana_dashboard.json).</section>

To check MOLT Replicator health, run `curl http://localhost:30005/_/healthz`. This returns a status code of `200` if Replicator is running.