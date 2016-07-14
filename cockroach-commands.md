---
title: Cockroach Commands
summary: Learn the commands for configuring, starting, and managing a CockroachDB cluster.
toc: false
---

This page introduces the `cockroach` commands for configuring, starting, and managing a CockroachDB cluster, as well as logging flags that can be set on any command and environment variables that can be used in place of certain flags.

You can run `cockroach help` in your shell to get similar guidance.

<div id="toc"></div>

## Commands

Command | Usage
--------|----
[`start`](start-a-node.html) | Start a node.
[`cert`](create-security-certificates.html) | Create CA, node, and client certificates.
`freeze-cluster` | Freeze the cluster in preparation for an upgrade (docs coming soon).
[`quit`](stop-a-node.html) | Drain and shutdown a node.
[`sql`](use-the-built-in-sql-client.html) | Use the built-in SQL client.
[`zone`](configure-replication-zones.html) | Configure the number and location of replicas for specific sets of data.
[`node`](view-node-details.html) | List node IDs and show their status.
[`dump`] | Back up a table by outputting the SQL statements required recreate a table and all its rows.
`gen` | Generate manpages and bash completion file (docs coming soon).
[`version`](view-version-details.html) | Output CockroachDB version and dependency details.

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

## Environment Variables

For many common `cockroach` flags, such as `--port` and `--user`, you can set environment variables once instead of manually passing the flags each time you execute commands. 

- To find out which flags support environment variables, see the documentation for each [command](#commands). 
- To output the current configuration of CockroachDB and other environment variables, run `env`. 

CockroachDB prioritizes command flags, environment variables, and defaults as follows:

1. If a flag is set for a command, CockroachDB uses it.
2. If a flag is not set for a command, CockroachDB uses the corresponding environment variable.
3. If neither the flag nor environment variable is set, CockroachDB uses the default for the flag.
4. If there's no flag default, CockroachDB gives an error.
