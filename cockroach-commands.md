---
title: Cockroach Commands
toc: false
---

This page lists the `cockroach` commands for configuring, starting, and managing a CockroachDB cluster. Click a command for supported flags and examples. See [logging flags](#logging-flags) for flags that can be set on any command. 

You can run `./cockroach help` in your shell to get similar guidance.

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

## Logging Flags

Flag | Description
-----|------------
 | 
