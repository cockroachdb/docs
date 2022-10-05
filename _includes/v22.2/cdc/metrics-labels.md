To measure metrics per changefeed, define a "metrics label" to which one or multiple changefeed(s) will increment each [changefeed metric](monitor-and-debug-changefeeds.html#metrics). Metrics label information is sent with time-series metrics to `http://{host}:{http-port}/_status/vars`, viewable via the [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint). An aggregated metric of all changefeeds is also measured.

It is necessary to consider the following when applying metrics labels to changefeeds:

- Metrics labels are **not** available in {{ site.data.products.db }}.
- The `COCKROACH_EXPERIMENTAL_ENABLE_PER_CHANGEFEED_METRICS` [environment variable](cockroach-commands.html#environment-variables) must be specified to use this feature.
- The `server.child_metrics.enabled` [cluster setting](cluster-settings.html) must be set to `true` before using the `metrics_label` option.
- Metrics label information is sent to the `_status/vars` endpoint, but will **not** show up in [`debug.zip`](cockroach-debug-zip.html) or the [DB Console](ui-overview.html).
- Introducing labels to isolate a changefeed's metrics can increase cardinality significantly. There is a limit of 1024 unique labels in place to prevent cardinality explosion. That is, when labels are applied to high-cardinality data (data with a higher number of unique values), each changefeed with a label then results in more metrics data to multiply together, which will grow over time. This will have an impact on performance as the metric-series data per changefeed quickly populates against its label.
- The maximum length of a metrics label is 128 bytes.
