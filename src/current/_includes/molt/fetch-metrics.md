### Fetch metrics

By default, MOLT Fetch exports [Prometheus](https://prometheus.io/) metrics at `http://127.0.0.1:3030/metrics`. You can override the address with `--metrics-listen-addr '{host}:{port}'`, where the endpoint will be `http://{host}:{port}/metrics`.

Cockroach Labs recommends monitoring the following metrics during data load:

|              Metric Name              |                                                         Description                                                         |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `molt_fetch_num_tables`               | Number of tables that will be moved from the source.                                                                        |
| `molt_fetch_num_task_errors`          | Number of errors encountered by the fetch task.                                                                             |
| `molt_fetch_overall_duration`         | Duration (in seconds) of the fetch task.                                                                                    |
| `molt_fetch_rows_exported`            | Number of rows that have been exported from a table. For example:<br>`molt_fetch_rows_exported{table="public.users"}`       |
| `molt_fetch_rows_imported`            | Number of rows that have been imported from a table. For example:<br>`molt_fetch_rows_imported{table="public.users"}`       |
| `molt_fetch_table_export_duration_ms` | Duration (in milliseconds) of a table's export. For example:<br>`molt_fetch_table_export_duration_ms{table="public.users"}` |
| `molt_fetch_table_import_duration_ms` | Duration (in milliseconds) of a table's import. For example:<br>`molt_fetch_table_import_duration_ms{table="public.users"}` |

You can also use the [sample Grafana dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json) to view the preceding metrics.

{% if page.name != "migrate-bulk-load.md" %}
{{site.data.alerts.callout_info}}
Metrics from the `replicator` process are enabled by setting the `--metricsAddr` [replication flag](#replication-flags), and are served at `http://{host}:{port}/_/varz`. <section class="filter-content" markdown="1" data-scope="oracle">To view Oracle-specific metrics from `replicator`, import [this Grafana dashboard](https://replicator.cockroachdb.com/replicator_oracle_grafana_dashboard.json).</section>
{{site.data.alerts.end}}
{% endif %}