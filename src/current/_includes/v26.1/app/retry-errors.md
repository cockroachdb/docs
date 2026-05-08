{{site.data.alerts.callout_info}}
When running under the default [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation level, your application should [use a retry loop to handle transaction retry errors]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#transaction-retry-errors) that can occur under [contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
{{site.data.alerts.end}}
