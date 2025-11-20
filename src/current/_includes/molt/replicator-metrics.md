### Replicator metrics

MOLT Replicator can export [Prometheus](https://prometheus.io/) metrics by setting the [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) flag to a port (for example, `--metricsAddr :30005`). Metrics are not enabled by default. When enabled, metrics are available at the path `/_/varz`. For example: `http://localhost:30005/_/varz`.

Cockroach Labs recommends monitoring the following metrics during replication:

{% if page.name == "migrate-failback.md" %}
|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `commit_to_stage_lag_seconds`         | Time between when a mutation is written to the source CockroachDB cluster and when it is written to the staging database. |
| `source_commit_to_apply_lag_seconds`  | End-to-end lag from when a mutation is written to the source CockroachDB cluster to when it is applied to the target database. |
| `stage_mutations_total`               | Number of mutations staged for application to the target database.                                                         |
| `apply_conflicts_total`               | Number of rows that experienced a compare-and-set (CAS) conflict.                                                           |
| `apply_deletes_total`                 | Number of rows deleted.                                                                                                     |
| `apply_duration_seconds`              | Length of time it took to successfully apply mutations.                                                                     |
| `apply_errors_total`                  | Number of times an error was encountered while applying mutations.                                                          |
| `apply_resolves_total`                | Number of rows that experienced a compare-and-set (CAS) conflict and which were resolved.                                   |
| `apply_upserts_total`                 | Number of rows upserted.                                                                                                    |
| `target_apply_queue_depth`            | Number of batches in the target apply queue. Indicates how backed up the applier flow is between receiving changefeed data and applying it to the target database. |
| `target_apply_queue_utilization_percent` | Utilization percentage (0.0-100.0) of the target apply queue capacity. Use this to understand how close the queue is to capacity and to set alerting thresholds for backpressure conditions. |
| `core_parallelism_utilization_percent` | Current utilization percentage of the applier flow parallelism capacity. Shows what percentage of the configured parallelism is actively being used. |
{% else %}
|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `commit_to_stage_lag_seconds`         | Time between when a mutation is written to the source database and when it is written to the staging database.             |
| `source_commit_to_apply_lag_seconds`  | End-to-end lag from when a mutation is written to the source database to when it is applied to the target CockroachDB.     |
| `apply_conflicts_total`               | Number of rows that experienced a compare-and-set (CAS) conflict.                                                           |
| `apply_deletes_total`                 | Number of rows deleted.                                                                                                     |
| `apply_duration_seconds`              | Length of time it took to successfully apply mutations.                                                                     |
| `apply_errors_total`                  | Number of times an error was encountered while applying mutations.                                                          |
| `apply_resolves_total`                | Number of rows that experienced a compare-and-set (CAS) conflict and which were resolved.                                   |
| `apply_upserts_total`                 | Number of rows upserted.                                                                                                    |
{% endif %}

You can use the [Replicator Grafana dashboard](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json) to visualize the metrics. <section class="filter-content" markdown="1" data-scope="oracle">For Oracle-specific metrics, import the [Oracle Grafana dashboard](https://replicator.cockroachdb.com/replicator_oracle_grafana_dashboard.json).</section>

To check MOLT Replicator health when metrics are enabled, run `curl http://localhost:30005/_/healthz` (replacing the port with your [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) value). This returns a status code of `200` if Replicator is running.