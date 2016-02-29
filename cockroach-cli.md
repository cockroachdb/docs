---
title: Cockroach CLI
toc: false
---

The `cockroach` Command Line Interface is a single, unified tool for configuring, deploying, and managing a CockroachDB node. This page explains the available commands with their flags and the [global flags](#global-flags) that can be set on any command. You can run `./cockroach --help` in your shell to get similar guidance.

Command | Usage
--------|----
[`start`](#start) | Start a node.
[`cert`](#cert) | Create CA, node, and client certificates.
[`exterminate`](#exterminate) | Destroy all data held by the node.
[`quit`](#quit) | Drain and shutdown the node.
[`log`](#log) | Make log files human-readable.
[`sql`](#sql) | Open the built-in SQL shell.
[`user`](#user) | Get, set, list, and remove users.
[`zone`](#zone) | Get, set, list, and remove zones.
[`node`](#node) | List nodes and show their status.
[`gen`](#gen) | Generate manpages and bash completion file.
[`version`](#version) | Output CockroachDB version information.
[`debug`](#debug) | Extract data from files of a failed process.

Undocumented commands (likely not to be supported in beta): `kv` and `range`. 

## `start`

## `cert`

## `exterminate`

## `quit`

## `log`

## `sql`

## `user`

## `range`

## `zone`

## `node`

## `gen`

## `version`

## `debug`

## Global Flags

Flag | Value |
-----|-------|
`--alsologtostderr` | Log to standard error as well as files.
`--color` | Colorize standard error output according to severity (default "auto").
--log-backtrace-at value | When logging hits line file:N, emit a stack trace (default :0).
--log-dir value | If non-empty, write log files in this directory (default "/var/folders/5t/1rt6nzr17sjg87mz5n0fw15c0000gn/T/").
--log-threshold value | Logs at or above this threshold go to stderr (default ERROR).
--logtostderr value[=true] | Log to standard error instead of files.
--verbosity value | log level for V logs.
--vmodule value | Comma-separated list of pattern=N settings for file-filtered logging.