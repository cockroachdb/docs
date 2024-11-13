---
title: Logging Best Practices
summary: Best practices for consuming CockroachDB logs for critical information.
toc: true
---

This page provides guidance and best practices for consuming CockroachDB logs for critical information. It outlines how to externalize logs. For details on which log messages to externalize and how to interpret them, refer to [Critical Log Messages]({% link {{ page.version.version }}/critical-log-messages.md %}).

## Types of logs

CockroachDB has two different types of logs, [structured](#structured-logs) and [unstructured](#unstructured-logs).

### Structured logs

Structured logs contain detailed, machine-readable information that can be easily parsed and analyzed. They are particularly useful for:

- [Notable Events]({% link {{ page.version.version }}/eventlog.md %}): Capturing significant events in a structured format allows for easier querying and analysis. For example, job state changes or specific events like backups.
- [Audit and Compliance]({% link {{ page.version.version }}/logging-use-cases.md %}#security-and-audit-monitoring): Structured logs are ideal for audit trails and compliance monitoring because they provide a consistent format that can be easily searched and filtered.
- [Performance Monitoring]({% link {{ page.version.version }}/logging-use-cases.md %}#performance-tuning): When tracking performance metrics, structured logs can help in identifying patterns and anomalies due to their detailed and consistent format.

### Unstructured logs

Unstructured logs are more free-form and human-readable compared to machine-processed structured logs. They are particularly useful for:

General Troubleshooting: They are useful for capturing a wide range of information that may not fit into a predefined structure, such as error messages or stack traces. Events not documented on [Notable Events]({% link {{ page.version.version }}/eventlog.md %}) will have an unstructured format in log messages.

## Use `json` format with third-party tools

With third-party tool consumption that read logs programmatically, use [`json`]({% link {{ page.version.version }}/log-formats.md %}#format-json) format rather than parse the [`crdb_v2`]({% link {{ page.version.version }}/log-formats.md %}#format-crdb-v2) format. The JSON object is guaranteed to not contain unescaped newlines or other special characters, and the entry as a whole is followed by a newline character. This makes the format suitable for processing over a stream unambiguously.

## Prioritize logs based on severity

The various [log formats]({% link {{ page.version.version }}/log-formats.md %}) are guaranteed to contain a [severity level]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) for each log event.

- With [`json`]({% link {{ page.version.version }}/log-formats.md %}#format-json) format, if `tag-style: compact` is specified, use `sev` field, while if `tag-style: verbose`, use `severity` field. 
- With [`crdb_v2`]({% link {{ page.version.version }}/log-formats.md %}#format-crdb-v2) format, use the first character of the prefix of each log entry. Possible values are I for INFO, W for WARNING, E for ERROR, and F for FATAL.

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

## Customize buffering of log messages

Depending on the use case, a log sink can be configured to be auditable or buffered. However, there is a tradeoff between auditing requirements and performance.

### Auditable

In the case of [security-related logs]({% link {{ page.version.version }}/logging-use-cases.md %}#security-and-audit-monitoring), use the logging YAML file to [configure the log sink]({% link {{ page.version.version }}/configure-logs.md %}#configure-log-sinks) to be auditable, by setting `auditable` to `true`. This guarantees [non-repudiability](https://wikipedia.org/wiki/Non-repudiation) for any logs in the sink, but can incur a performance overhead and higher disk IOPS consumption. When `auditable` is enabled:

- `exit-on-error` is enabled which stops the CockroachDB node if an error is encountered while writing to the sink. This prevents the loss of any log entries.
- `buffered-writes` is disabled if the sink is under `file-groups`.

File-based audit logging cannot coexist with the buffering configuration, so disable either `buffering` or `auditable`.

### Buffered

Use the logging YAML file to configure buffering settings to optimize log performance, refer to [Log buffering for network sinks]({% link {{ page.version.version }}/configure-logs.md %}#log-buffering-for-network-sinks). For example, modify the following `buffering` options:

  - `max-staleness`: The maximum time logs can stay in the buffer before being flushed.
  - `flush-trigger-size`: The size threshold that triggers a buffer flush.
  - `max-buffer-size`: The maximum buffer size. If this limit is exceeded, new log messages are dropped until the buffer size falls below this value.

Disable buffering for specific log channels if needed, by setting `buffering: NONE` for a given channel.

Override default buffering settings for specific channels to ensure timely log flushing.

File-based audit logging cannot coexist with the buffering configuration, so disable either `buffering` or `auditable`.

For detailed configurations and examples, refer to [Configure Logs]({% link {{ page.version.version }}/configure-logs.md %}).

## Use epoch timestamp

By default, the log output format [`json`]({% link {{ page.version.version }}/log-formats.md %}#format-json) has a `timestamp` field that contains epoch values for backward-compatibility. When sending log output to a third-party log collector, the log collector can be configured to transform the epoch values in the `timestamp` field into a human-readable format.
When inspecting a `json` formatted log file produced by CockroachDB, you can use the command [`cockroach debug merge-logs`]({% link {{ page.version.version }}/cockroach-debug-merge-logs.md %}) to convert the log into [`crdb-v1`]({% link {{ page.version.version }}/log-formats.md %}#format-crdb-v1) format which includes timestamps in the `rfc3339` format, for example "2006-01-02T15:04:05.999999999Z".

There is an optional [`datetime` field for `json` format]({% link {{ page.version.version }}/configure-logs.md %}#datetime-field-for-json-format), which contains values in human-readable format. However, enabling the `datetime` field introduces CPU overhead.

## See also

- [Critical Log Messages]({% link {{ page.version.version }}/critical-log-messages.md %})
