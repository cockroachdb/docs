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
[`user`](create-and-manage-users.html) | Get, set, list, and remove users.
[`zone`](configure-replication-zones.html) | Configure the number and location of replicas for specific sets of data.
[`node`](view-node-details.html) | List node IDs and show their status.
[`dump`](back-up-and-restore-data.html) | Back up a table by outputting the SQL statements required to recreate the table and all its rows.
[`gen`](generate-cockroachdb-resources.html) | Generate manpages, a bash completion file, and example data.
[`version`](view-version-details.html) | Output CockroachDB version and dependency details.

## Logging Flags

By default, `cockroach start` logs all messages to files, and client commands log messages to `stderr` (see `--log-dir`).

Flag | Description
-----|------------
`--alsologtostderr` | Copy log messages at or above this severity level to `stderr` in addition to log files. Possible values: `info`, `warning`, `error`, `fatal`, and `none`. If this flag is set without a value, it uses the `info` level. <br><br>**Default:** `none`
`--log-dir` | Write log files in this directory. Log files are named as follows:<br><br>`cockroach.<host>.<user>.<start date/time + process ID>.<severity level>.log`<br><br> **Default:** For the `start` command, this defaults to `<first store dir>/logs`; for all client commands, if this flag is empty, CockroachDB logs to `stderr`.
`--logtostderr` |  Write log messages of all severities to `stderr` and not to log files. If this flag is set to `true`, `--log-dir` and `--alsologtostderr` are ignored. Possible values: `true` or `false`.<br><br>**Default:** `false`
`--no-color` | Do not colorize `stderr` based on severity. Possible values: `true` or `false`. <br><br>**Default:** `false`

The `--log-backtrace-at`, `--verbosity`, and `--vmodule` flags are intended for internal debugging.

## Environment Variables

For many common `cockroach` flags, such as `--port` and `--user`, you can set environment variables once instead of manually passing the flags each time you execute commands.

- To find out which flags support environment variables, see the documentation for each [command](#commands).
- To output the current configuration of CockroachDB and other environment variables, run `env`.
- When a node uses environment variables on [startup](start-a-node.html), the variable names are printed to the node's logs; however, the variable values are not.

CockroachDB prioritizes command flags, environment variables, and defaults as follows:

1. If a flag is set for a command, CockroachDB uses it.
2. If a flag is not set for a command, CockroachDB uses the corresponding environment variable.
3. If neither the flag nor environment variable is set, CockroachDB uses the default for the flag.
4. If there's no flag default, CockroachDB gives an error.
