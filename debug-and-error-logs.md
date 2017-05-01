---
title: Debug & Error Logs
summary: Learn how to find and read CockroachDB error logs
toc: false
---

If you need to [troubleshoot](troubleshooting-overview.html) issues with your cluster, you can check your node's logs, which includes details about certain node-level and range-level events, such as errors. For example, if CockroachDB crashes, it normally logs a stack trace to what caused the problem.

Logs are generated only on a per-node basis, which means each node's logs detail only the internal activity of that node without visibility into the behavior of other nodes in the cluster. When troubleshooting, this means that you must identify the node where the problem occurred or check the logs from all of the nodes in your cluster.

<div id="toc"></div>

## Details

Each [`cockroach` command](cockroach-commands.html) a node processes produces a stream of messages about its activities. Each message's body describes the activity, and its envelope contains metadata such as the message's severity level.

As commands generate messages, CockroachDB uses the [command](#commands)'s [logging flags](#flags) and the message's [severity level](#severity-levels) to determine the appropriate [location](#output-locations) for it.

{{site.data.alerts.callout_info}}You can also <a href="#log-queries">log queries</a> your cluster receives.{{site.data.alerts.end}}

### Commands

All [`cockroach` commands](cockroach-commands.html) support logging. However, most messages originate from the `cockroach start` process. Other commands do generate messages, but are typically only interesting in troubleshooting scenarios.

### Severity Levels

CockroachDB uses a sequence of severity levels for each message to help operators understand the likelihood they need to intercede:

1. `INFO` *(lowest severity; no action necessary)*
2. `WARNING`
3. `ERROR`
4. `FATAL` *(highest severity; requires operator attention)*

**Default Behavior by Severity Level**

Command | `INFO` messages | `WARNING` and above messages
--------|--------|--------------------
[`cockroach start`](start-a-node.html) | Write to file | Write to file
[All other commands](cockroach-commands.html) | Discard | Print to `stderr`

### Output Locations

Based on the command's flags and the message's [severity level](#severity-levels), CockroachDB does one of the following: 

- [Writes the message to a file](#write-to-file)
- [Prints it to `stderr`](#print-to-stderr)
- [Discards the message entirely](#discard-message)

#### Write to File

CockroachDB can writes messages to log files, which makes them easy to examine at any point in time.

Property | `cockroach start` | All other commands
---------|-------------------|-------------------
Enabled by | Default<sup>1</sup> | Explicit `--log-dir` flag
Default File Destination | `[first `[`store`](start-a-node.html#store)` dir]/logs` | *N/A*
Change File Destination | `--log-dir=[destination]` | `--log-dir=[destination]`
Default Severity Level Threshold | `INFO` | *N/A*
Change Severity Threshold | `--log-file-verbosity=[severity]` | `--log-file-verbosity=[severity]`
Disabled by | `--log-dir=""`<sup>1</sup> | Default

{{site.data.alerts.callout_info}}<sup>1</sup> If the <code>cockroach</code> process does not have access to on-disk storage, it does not write messages to log files; instead it prints all messages to <code>stderr</code>.{{site.data.alerts.end}}


The log's filenames use the following format:

~~~
cockroach.[host].[user].[start date/time].[process ID].log
~~~

#### Print to `stderr`

CockroachDB can print messages to `stderr`, which normally prints them to the machine's terminal but does not store them.

Property | `cockroach start` | All other commands
---------|-------------------|-------------------
Enabled by | Explicit `--logtostderr` flag<sup>2</sup> | Default
Default Severity Level Threshold | *N/A* | `WARNING`
Change Severity Threshold | `--logtostderr=[severity]` | `--logtostderr=[severity]`
Disabled by | Default<sup>2</sup> | `--logtostderr=NONE`

{{site.data.alerts.callout_info}}<sup>2</sup> <code>cockroach start</code> does not print any messages to <code>stderr</code> unless the <code>cockroach</code> process does not have access to on-disk storage, in which case it defaults to <code>--logtostderr=INFO</code> and prints all messages to <code>stderr</code>.{{site.data.alerts.end}}

#### Discard Message

Messages with severity levels below the `--logtostderr` and `--log-file-verbosity` flag's values are neither written to files nor printed to `stderr`, so they are discarded.

By default, commands besides `cockroach start` have their messages with the `INFO` [severity level](#severity-levels) discarded.

## Flags

{% include custom/logging-flags.md %}

The `--log-backtrace-at`, `--verbosity`, and `--v` flags are intended for internal debugging by CockroachDB contributors.

## Log Queries

To help troubleshoot [query performance issues](query-behavior-troubleshooting.html#performance-issues), you can enable cluster-wide error logging for long-running SQL queries or all queries, regardless of time.

- **Long-running queries**:
  
  ~~~ sql
  > SET CLUSTER SETTING sql.trace.txn.threshold = '[time]';
  ~~~

  The `[time]` parameter accepts common time specifiers, such as `100ms` or `2s`.

  {{site.data.alerts.callout_danger}}This setting makes <em>all</em> queries slower and causes nodes to consume more memory. You should disable it as soon as you're done troubleshooting the query's issues.{{site.data.alerts.end}}

  Disable this logging by setting `[time]` to `0s`.

- **All queries**:

  ~~~ sql
  > SET CLUSTER SETTING sql.trace.log_statement_execute = true;
  ~~~

  Disable this logging by changing the setting it to `false`.

After finding which queries are slow, use [`EXPLAIN`](explain.html) to examine them. It's possible that the query is slow because it performs a full-table scan. In these cases, you can likely improve the query's performance by [adding an index](create-index.html).

Once you're done troubleshooting, you should disable query logging to prevent it from unnecessarily consuming resources.

## See Also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
