---
title: Cockroach Commands
toc: false
---

This page lists the `cockroach` commands for configuring, starting, and managing a CockroachDB cluster. Click a command for supported flags and examples. See [logging flags](#logging-flags) for flags that can be set on any command. 

You can run `./cockroach help` in your shell to get similar guidance.

<div id="toc"></div>

## Commands

Command | Usage
--------|----
[`start`](start-a-node.html) | Start a node.
[`cert`](create-security-certificates.html) | Create CA, node, and client certificates.
[`sql`](use-the-built-in-sql-client.html) | Use the built-in SQL client.
[`quit`](stop-a-node.html) | Drain and shutdown a node.
[`zone`](configure-replication-zones.html) | Configure the number and location of replicas for specific sets of data.
`exterminate` | Destroy all data held by a node.
`node` | List nodes and show their status.
`gen` | Generate manpages and bash completion file.
`version` | Output CockroachDB version information.
`debug` | Extract data from files of a failed process.

## Logging Flags

By default, CockroachDB logs all messages to files (see `--log-dir`) and messages are not copied to the standard error stream. 

- To copy messages at or above a severity level to `stderr`, set `--alsologtostderr` to the severity level.
- To write messages of all severities to `stderr` and not to files, set `--logtostderr` to `true`. 

Flag | Description
-----|------------
`--alsologtostderr` | Copy log messages at or above this severity level to the standard error stream in addition to log files. Possible values: `info`, `warning`, `error`, `fatal`, and `none`. If this flag is set without a value, it uses the `info` level. <br><br>**Default:** `none`
`--log-dir` | Write log files in this directory. <br><br> **Default:** `<first-store-dir>/logs` for the `start` command; `$TMPDIR` for all other commands  
`--logtostderr` |  Write log messages of all severities to the standard error stream and not to log files. If this flag is set to `true`, `--log-dir` and `--alsologtostderr` are ignored. Possible values: `true` or `false`.<br><br>**Default:** `false`
`--no-color` | Do not colorize the standard error stream based on severity. Possible values: `true` or `false`. <br><br>**Default:** `false`   

The `--log-backtrace-at`, `--verbosity`, and `--vmodule` flags are intended for internal debugging. 