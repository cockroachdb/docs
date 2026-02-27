---
title: MOLT Fetch Metrics
summary: Learn how to monitor MOLT Fetch during data migration using Prometheus metrics.
toc: true
docs_area: migrate
---

This page lists the [MOLT Fetch]({% link molt/molt-fetch.md %}) metrics that you can use to observe the progress of a MOLT Fetch command execution.

## Metrics

By default, MOLT Fetch exports [Prometheus](https://prometheus.io/) metrics at `127.0.0.1:3030/metrics`. You can configure this endpoint with the [`--metrics-listen-addr`]({% link molt/molt-fetch-commands-and-flags.md %}#metrics-listen-addr) flag.

Cockroach Labs recommends monitoring the following metrics:

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

## See also

- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Fetch Best Practices]({% link molt/molt-fetch-best-practices.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
