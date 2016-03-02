---
title: Cockroach Commands
toc: false
---

This page lists the `cockroach` commands for configuring, starting, and managing a CockroachDB cluster. Click a command for supported flags and examples. See [global flags](#global-flags) for flags that can be set on any command. 

You can run `./cockroach --help` in your shell to get similar guidance.

Command | Usage
--------|----
[`start`](start-a-node.html) | Start a node.
[`cert`](create-security-certificates.html) | Create CA, node, and client certificates.
`exterminate` | Destroy all data held by a node.
[`quit`](stop-a-node.html) | Drain and shutdown a node.
`log` | Make log files human-readable.
`sql` | Open the built-in SQL shell.
`zone` | Get, set, list, and remove zones.
`node` | List nodes and show their status.
`gen` | Generate manpages and bash completion file.
`version` | Output CockroachDB version information.
`debug` | Extract data from files of a failed process.

## Global Flags

Flag | Value | Description
-----|-------| -----------
`--alsologtostderr` | | Log to standard error as well as files.
`--color` | | Colorize standard error output according to severity (default "auto").
`--log-backtrace-at` | |When logging hits line file:N, emit a stack trace (default :0).
`--log-dir` | | If non-empty, write log files in this directory (default "/var/folders/5t/1rt6nzr17sjg87mz5n0fw15c0000gn/T/").
`--log-threshold` | | Logs at or above this threshold go to stderr (default ERROR).
`--logtostderr` | value[=true] | Log to standard error instead of files.
`--verbosity` | value | log level for V logs.
`--vmodule` | value | Comma-separated list of pattern=N settings for file-filtered logging.