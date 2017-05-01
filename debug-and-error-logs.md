---
title: Debug & Error Logs
summary: Learn how to find and read CockroachDB error logs
toc: false
---

If you need to [troubleshoot](troubleshooting-overview.html) issues with your cluster, you can check your node's logs, which includes details about certain node-level and range-level events, such as errors. For example, if CockroachDB crashes, it normally logs a stack trace to what caused the problem.

Logs are generated only on a per-node basis, which means each node's logs detail only the commands it processes without visibility into the behavior of other nodes in the cluster. When troubleshooting, this means that you must identify the node where the problem occurred or get the logs from all nodes in your cluster.

<div id="toc"></div>

## Details

Each [`cockroach` command](cockroach-commands.html) a node processes produces a stream of messages about its activities. Each of these messages contains the content of the message itself, as well as metadata such as its severity level.

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
[`cockroach start`](start-a-node.html) | Logged to file | Logged to file &amp; `stderr`
[All other commands](cockroach-commands.html) | Discarded | Logged to `stderr`

### Output Locations

Based on the command's flags and the message's severity level, CockroachDB does one of the following: 

- [Writes the message to a file](#write-to-file)
- [Prints it to `stderr`](#print-to-stderr)
- [Discards it entirely](#discard-message)

#### Write to File

When file logging is enabled (by default for `cockroach start` or by including the `--log-dir` [flag](#flags) for other commands), CockroachDB writes messages to files in the directory specified by `--log-dir`. 

The log's filenames use the following format:

~~~
cockroach.[host].[user].[start date/time + process ID].log
~~~

You can control the severity level of which messages are written to files with the `--log-file-verbosity` [flag](#flags).

**Defaults per Command**

Command | Log file location (`--log-dir`)
--------|-------------|
[`cockroach start`](start-a-node.html) | `--log-dir=<first `[`store`](start-a-node.html#store)` dir>/logs`<br/><br/>This location is also printed in the **Logs** field of the [standard output](start-a-node.html#standard-output) of `cockroach start`.
[All other commands](cockroach-commands.html) | *N/A (Messages are not written to files. To log messages from commands besides `start`, set the `--log-dir` [flag](#flags) to a directory.)* |

#### Print to `stderr`

`stderr` is a standard Unix interface, which normally prints messages to a machine's console.

By default, all commands print messages with a [severity level](#severity-levels) `WARNING` or greater to `stderr`. However, you can control the severity level of messages printed to `stderr` with the `--logtostderr` [flag](#flags).

#### Discard Message

Messages with severity levels below the `--logtostderr` and `--log-file-verbosity` values are neither written to files nor printed to `stderr`, so they are discarded.

By default, commands besides `cockroach start` have their messages with the `INFO` [severity level](#severity-levels) totally discarded.

## Flags

{% include custom/logging-flags.md %}

The `--log-backtrace-at` and `--verbosity` flags are intended for internal debugging by CockroachDB contributors.

## Log Queries

To help troubleshoot [query performance issues](query-behavior-troubleshooting.html#performance-issues), you can enable cluster-wide error logging for long-running SQL queries or all queries, regardless of time.

- **Long-running queries**:
  
  ~~~ sql
  > SET CLUSTER SETTING sql.trace.txn.threshold = '[time]';
  ~~~

  The `[time]` parameter accepts common time specifiers, such as `100ms` or `2s`.

  Disable this logging by setting `[time]` to `0s`.

- **All queries**:

  ~~~ sql
  > SET CLUSTER SETTING sql.trace.log_statement_execute = true;
  ~~~

  Disable this logging by changing the setting it to `false`.

After finding which queries are slow, use [`EXPLAIN`](explain.html) to examine them. It's possible that it's performing a full-table scan and you could improve its performance by [adding an index](create-index.html).

Once you're done troubleshooting, you should disable query logging to prevent it from unnecessarily consuming resources.

## See Also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
