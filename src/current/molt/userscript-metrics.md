---
title: Userscript Metrics
summary: A list of the available userscript metrics, for improving observability and dubugging.
toc: true
docs_area: migrate
---

To improve observability and debugging in the field, [MOLT Replicator]({% link molt/molt-replicator.md %}) exposes Prometheus metrics that provide insight into userscript activity, performance, and stability. These metrics help identify issues such as slow script execution, overly aggressive filtering, handlers not being called when expected, and unhandled errors in user-defined logic.

All userscript metrics include a `script_` prefix and are automatically labeled with the relevant schema or table for each configured handler (for example, `schema="target.public"`). If a userscript defines both schema-level and table-level handlers, separate label values will be created for each.

These metrics are part of the default [Replicator Prometheus metrics]({% link molt/replicator-metrics.md %}) set and can be visualized immediately using the provided [`replicator.json` Grafana dashboard file](https://replicator.cockroachdb.com/replicator_grafana_dashboard.json). They are also included in [Replicator metrics snapshots]({% link molt/replicator-metrics.md %}#metrics-snapshots).

Consider using these metrics to:

- Correlate script performance and errors with replication throughput.
- Identify high-latency or error-prone scripts impacting replication health.
- Debug unexpected filtering or transformation logic in field environments.

## Metrics

{% include molt/userscript-metrics.md %}

### Example Metric Labels

Each metric may include the following standard labels:

- `schema`: The schema name associated with the userscript handler.
- `table`: The table name associated with the userscript handler. A wildcard value of "*" means it is a shared or global metric applying to all tables.
- `function`: The handler function being observed.

## See also

- [Userscript Overview]({% link molt/userscript-overview.md %})
- [Userscript Quickstart]({% link molt/userscript-quickstart.md %})
- [Userscript API]({% link molt/userscript-api.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [Replicator Metrics]({% link molt/replicator-metrics.md %})
