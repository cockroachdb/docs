Unordered aggregation operations do not support disk spilling, and are limited by the [`--max-sql-memory`](cockroach-start.html#general) setting. If unordered aggregation operations exceed the amount of memory available to the SQL layer, CockroachDB will throw an error, and in some circumstances could crash.

{{site.data.alerts.callout_info}}
Setting `--max-sql-memory` too high could result in performance problems due to increased memory consumption.
{{site.data.alerts.end}}

See the [GitHub tracking issue](https://github.com/cockroachdb/cockroach/issues/42485) for details.
