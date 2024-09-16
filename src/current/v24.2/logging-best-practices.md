---
title: Logging Best Practices
summary: Best practices for consuming CockroachDB logs for critical information.
toc: true
docs_area: manage
---

This page provides guidance and best practices for consuming CockroachDB logs for critical information. It outlines how to externalize logs, which critical logs to externalize, and how to interpret them. 

## Use network log sinks

Output different [logging channels]({% link {{ page.version.version }}/logging.md %}#logging-channels) over the network to third-party log aggregators:

 - [Output to Fluentd-compatible network collectors]({% link {{ page.version.version }}/configure-logs.md %}#output-to-fluentd-compatible-network-collectors), such as Elasticsearch, Splunk.
 - [Output to HTTP network collectors]({% link {{ page.version.version }}/configure-logs.md %}#output-to-http-network-collectors), such as Datadog. 

## Use `json` format

To read logs programmatically, use [`json`]({% link {{ page.version.version }}/log-formats.md %}#format-json) format rather than parse the [`crdb_v2`]({% link {{ page.version.version }}/log-formats.md %}#format-crdb-v2) format. The JSON object is guaranteed to not contain unescaped newlines or other special characters, and the entry as a whole is followed by a newline character. This makes the format suitable for processing over a stream unambiguously.

## Prioritize logs based on severity

The various [log formats]({% link {{ page.version.version }}/log-formats.md %}) are guaranteed to contain a [severity level]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) for each log event. With `json` format, if `tag-style: compact` is specified, use `sev` field, while if `tag-style: verbose`, use `severity` field.

## Use logs for performance tuning

Use the `SQL_EXEC` and `SQL_PERF` [log channels]({% link {{ page.version.version }}/logging.md %}#logging-channels) to examine SQL queries and filter slow queries in order to optimize or troubleshoot performance. Refer to [Performance tuning]({% link {{ page.version.version }}/logging-use-cases.md %}#performance-tuning). It is also possible to [log SQL statistics to Datadog]({% link {{ page.version.version }}/log-sql-statistics-to-datadog.md %}), which uses the `TELEMETRY` channel.

## Use logs for security and compliance

Use the `SESSIONS`, `USER_ADMIN`, `PRIVILEGES`, `SENSITIVE_ACCESS` [log channels]({% link {{ page.version.version }}/logging.md %}#logging-channels) to monitor connection and authentication events, changes to user/role administration and privileges, and any queries on audited tables. Refer to [Security and audit monitoring]({% link {{ page.version.version }}/logging-use-cases.md %}#security-and-audit-monitoring).

## Consider workload performance impact

Enabling logging of events in the following [log channels]({% link {{ page.version.version }}/logging.md %}#logging-channels) may have a performance impact:

- [`SQL_EXEC`]({% link {{ page.version.version }}/logging-use-cases.md %}#sql_exec): Logging cluster-wide executions by enabling the [`sql.trace.log_statement_execute` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-trace-log-statement-execute) will incur considerable overhead and may have a negative performance impact.
- [`SQL_PERF`]({% link {{ page.version.version }}/logging-use-cases.md %}#sql_perf): Setting [`sql.log.slow_query.latency_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-auth-log-sql-sessions-enabled) to a non-zero time enables tracing on all queries, which impacts performance. After debugging, set the value back to `0s` to disable the log.
- [`SESSIONS`]({% link {{ page.version.version }}/logging-use-cases.md %}#sessions): Logging client connection and session authentication events are enabled by the [`server.auth_log.sql_connections.enabled` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-auth-log-sql-connections-enabled) and the [`server.auth_log.sql_sessions.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-auth-log-sql-sessions-enabled) cluster setting respectively. These logs perform one disk I/O per event. Enabling each setting will impact performance.
- [`SENSITIVE_ACCESS`]({% link {{ page.version.version }}/logging-use-cases.md %}#sensitive_access): Enabling [Table-based SQL Audit Logging]({% link {{ page.version.version }}/sql-audit-logging.md %}) or [Role-based SQL Audit Logging]({% link {{ page.version.version }}/role-based-audit-logging.md %}) can negatively impact performance. Log only what you require to limit impact to your workload. Use this channel for [security purposes](#use-logs-for-security-and-compliance) only.

## Use structured logs
Use structured logs when you need to capture detailed, machine-readable information that can be easily parsed and analyzed. They are particularly useful for:

- [Notable Events]({% link {{ page.version.version }}/eventlog.md %}): Capturing significant events in a structured format allows for easier querying and analysis. For example, job state changes or specific events like backups.
- Audit and Compliance: Structured logs are ideal for audit trails and compliance monitoring because they provide a consistent format that can be easily searched and filtered.
- Performance Monitoring: When tracking performance metrics, structured logs can help in identifying patterns and anomalies due to their detailed and consistent format.

## Use unstructured logs

Use unstructured logs, which are more free-form, for:

- General Troubleshooting: They are useful for capturing a wide range of information that may not fit into a predefined structure, such as error messages or stack traces. Events not documented on [Notable Events]({% link {{ page.version.version }}/eventlog.md %}) will have an unstructured format in log messages.

## Customize buffering of log messages

Use the logging YAML file to configure buffering settings to optimize log performance, refer to [Log buffering for network sinks]({% link {{ page.version.version }}/configure-logs.md %}#log-buffering-for-network-sinks). For example, modify the following options:

  - `max-staleness`: The maximum time logs can stay in the buffer before being flushed. A typical setting is `20 seconds`.
  - `flush-trigger-size`: The size threshold that triggers a buffer flush, commonly set to `2MiB`.
  - `max-buffer-size`: The maximum buffer size, often set to `100MiB`. If this limit is exceeded, new log messages are dropped until the buffer size falls below this value.

Disable buffering for specific log channels if needed. For instance, setting `buffering: NONE` for the `OPS` channel on a Fluentd-compatible log sink.

Override default buffering settings for specific channels like `HEALTH` to ensure timely log flushing. For example, set `max-staleness` to `2 seconds` for the HEALTH channel.

For more detailed configurations and examples, refer to [Configure Logs]({% link {{ page.version.version }}/configure-logs.md %}).
