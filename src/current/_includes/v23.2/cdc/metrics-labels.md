To measure metrics per changefeed, you can define a "metrics label" for one or multiple changefeed(s). The changefeed(s) will increment each [changefeed metric]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#metrics). Metrics label information is sent with time-series metrics to `http://{host}:{http-port}/_status/vars`, viewable via the [Prometheus endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint). An aggregated metric of all changefeeds is also measured.

It is necessary to consider the following when applying metrics labels to changefeeds:

- Metrics labels are **not** available in CockroachDB {{ site.data.products.serverless }}.
- Metrics labels are not supported as tags in [Datadog]({% link {{ page.version.version }}/datadog.md %}).
- The `server.child_metrics.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) must be set to `true` before using the `metrics_label` option.
- Metrics label information is sent to the `_status/vars` endpoint, but will **not** show up in [`debug.zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) or the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}).
- Introducing labels to isolate a changefeed's metrics can increase cardinality significantly. There is a limit of 1024 unique labels in place to prevent cardinality explosion. That is, when labels are applied to high-cardinality data (data with a higher number of unique values), each changefeed with a label then results in more metrics data to multiply together, which will grow over time. This will have an impact on performance as the metric-series data per changefeed quickly populates against its label.
- The maximum length of a metrics label is 128 bytes.
