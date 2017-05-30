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
[`quit`](stop-a-node.html) | Drain and shutdown a node.
[`sql`](use-the-built-in-sql-client.html) | Use the built-in SQL client.
[`user`](create-and-manage-users.html) | Get, set, list, and remove users.
[`zone`](configure-replication-zones.html) | Configure the number and location of replicas for specific sets of data.
[`node`](view-node-details.html) | List node IDs and show their status.
[`dump`](sql-dump.html) | Back up a table by outputting the SQL statements required to recreate the table and all its rows.
[`debug zip`](debug-zip.html) | Generate a `.zip` file that can help Cockroach Labs troubleshoot issues with your cluster.
[`gen`](generate-cockroachdb-resources.html) | Generate manpages, a bash completion file, and example data.
[`version`](view-version-details.html) | Output CockroachDB version and dependency details.

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
