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

To visualize the preceding metrics, use the Grafana dashboard [bundled with your binary (`grafana_dashboard.json`)]({% link molt/molt-fetch-installation.md %}). The bundled dashboard matches your binary version. Alternatively, you can download the [latest dashboard](https://molt.cockroachdb.com/molt/cli/grafana_dashboard.json).

{% if page.name != "migrate-bulk-load.md" %}
{{site.data.alerts.callout_success}}
For details on Replicator metrics, refer to [Replicator Metrics]({% link molt/replicator-metrics.md %}).
{{site.data.alerts.end}}
{% endif %}