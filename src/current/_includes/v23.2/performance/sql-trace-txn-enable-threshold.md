{%- if include.version_prefix != nil -%}
    {%- assign url = include.version_prefix | append: "cluster-settings.html#setting-sql-trace-txn-enable-threshold" | absolute_url -%}
{%- else -%}
    {%- assign url = "cluster-settings.html#setting-sql-trace-txn-enable-threshold" -%}
{%- endif -%}
The default tracing behavior captures a small percent of transactions, so not all contention events will be recorded. When investigating transaction contention, you can set the [`sql.trace.txn.enable_threshold` cluster setting]({{ url }}) to always capture contention events.
