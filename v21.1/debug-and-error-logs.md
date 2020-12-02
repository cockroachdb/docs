---
title: Understand Debug & Error Logs
summary: Learn how to find and read CockroachDB error logs
toc: true
---

If you need to [troubleshoot](troubleshooting-overview.html) issues with your cluster, you can check a node's logs, which include details about certain node-level and range-level events, such as errors. For example, if CockroachDB crashes, it normally logs a stack trace to what caused the problem.

{{site.data.alerts.callout_success}}
CockroachDB also generates secondary logs for queries being executed against your system. See [SQL logging](query-behavior-troubleshooting.html#sql-logging) for details on obtaining these logs.
{{site.data.alerts.end}}


## Details

When a node processes a [`cockroach` command](cockroach-commands.html), it produces a stream of messages about the command's activities. Each message's body describes the activity, and its envelope contains metadata such as the message's severity level.

As a command generates messages, CockroachDB uses the [command](#commands)'s [logging flags](#flags) and the message's [severity level](#severity-levels) to determine the appropriate [location](#output-locations) for it.

Each node's logs detail only the internal activity of that node without visibility into the behavior of other nodes in the cluster. When troubleshooting, this means that you must identify the node where the problem occurred or [collect the logs from all active nodes in your cluster](cockroach-debug-zip.html).

### Commands

All [`cockroach` commands](cockroach-commands.html) support logging. However, it's important to note:

- `cockroach start` generates most messages related to the operation of your cluster.
- Other commands do generate messages, but they're typically only interesting in troubleshooting scenarios.

### Severity levels

CockroachDB identifies each message with a severity level, letting operators know if they need to intercede:

1. `INFO` *(lowest severity; no action necessary)*
2. `WARNING`
3. `ERROR`
4. `FATAL` *(highest severity; requires operator attention)*

**Default behavior by severity level**

Command | `INFO` messages | `WARNING` and above messages
--------|--------|--------------------
[`cockroach start`](cockroach-start.html) | Write to file | Write to file
[All other commands](cockroach-commands.html) | Discard | Print to `stderr`

### Output locations

Based on the command's flags and the message's [severity level](#severity-levels), CockroachDB does one of the following:

- [Writes the message to a file](#write-to-file)
- [Prints it to `stderr`](#print-to-stderr)
- [Discards the message entirely](#discard-message)

#### Write to file

CockroachDB can write messages to log files. The files are named using the following format:

~~~
cockroach.[host].[user].[start timestamp in UTC].[process ID].log
~~~

For example:

~~~
cockroach.richards-mbp.rloveland.2018-03-15T15_24_10Z.024338.log
~~~

To make it easier to watch a log without knowing the full filename, a [symlink](https://en.wikipedia.org/wiki/Symbolic_link) with the short filename `cockroach.log` is also created. This symlink points to the most recent log.

{{site.data.alerts.callout_info}}
All log file timestamps are in UTC because CockroachDB is designed to be deployed in a distributed cluster.  Nodes may be located in different time zones, and using UTC makes it easy to correlate log messages from those nodes no matter where they are located.
{{site.data.alerts.end}}

Property | `cockroach start` | All other commands
---------|-------------------|-------------------
Enabled by | Default<sup>1</sup> | Explicit `--log-dir` flag
Default File Destination | `[first `[`store`](cockroach-start.html#store)` dir]/logs` | *N/A*
Change File Destination | `--log-dir=[destination]` | `--log-dir=[destination]`
Default Severity Level Threshold | `INFO` | *N/A*
Change Severity Threshold | `--log-file-verbosity=[severity level]` | `--log-file-verbosity=[severity level]`
Disabled by | `--log-dir=""`<sup>1</sup> | Default

{{site.data.alerts.callout_info}}
<sup>1</sup> If the `cockroach` process does not have access to on-disk storage, `cockroach start` does not write messages to log files; instead it prints all messages to `stderr`.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/ui/ui-log-files.md %}
{{site.data.alerts.end}}

#### Print to `stderr`

CockroachDB can print messages to `stderr`, which normally prints them to the machine's terminal but does not store them.

Property | `cockroach start` | All other commands
---------|-------------------|-------------------
Enabled by | Explicit `--logtostderr` flag<sup>2</sup> | Default
Default Severity Level Threshold | *N/A* | `WARNING`
Change Severity Threshold | `--logtostderr=[severity level]` | `--logtostderr=[severity level]`
Disabled by | Default<sup>2</sup> | `--logtostderr=NONE`

{{site.data.alerts.callout_info}}<sup>2</sup> <code>cockroach start</code> does not print any messages to <code>stderr</code> unless the <code>cockroach</code> process does not have access to on-disk storage, in which case it defaults to <code>--logtostderr=INFO</code> and prints all messages to <code>stderr</code>.{{site.data.alerts.end}}

#### Discard message

Messages with severity levels below the `--logtostderr` and `--log-file-verbosity` flag's values are neither written to files nor printed to `stderr`, so they are discarded.

By default, commands besides `cockroach start` discard messages with the `INFO` [severity level](#severity-levels).

## Flags

These logging flags are used with [`cockroach` commands](cockroach-commands.html).

{% include {{ page.version.version }}/misc/logging-flags.md %}

## Redacted logs

If you contact CockroachDB Support for troubleshooting help, you might be asked to run [`cockroach debug zip`](cockroach-debug-zip.html) and share the resulting file with the CockroachDB team. The log files created by `cockroach debug zip` may contain highly sensitive, identifiable information, such as usernames, hashed passwords, and possibly your table's data.

 You can run `cockroach debug zip` with the [`redact-logs` flag](cockroach-debug-zip.html#redact-sensitive-information-from-the-logs) to redact the sensitive data out of log files and crash reports before sharing them with Cockroach Labs. Redactable sensitive data includes but is not limited to:

- Stored values
- Text of SQL statements, especially the values embedded therein
- Result rows
- The dynamic part of error messages that includes application-provided parameters.
- IP addresses or hostnames
- Database, schema, table, or column names
- Cluster IDs
- File names of stored data or log files
- User/role names
- Hashed passwords

## See also

- [SQL logging](query-behavior-troubleshooting.html#sql-logging)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
