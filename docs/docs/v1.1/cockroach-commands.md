---
title: Cockroach Commands
summary: Learn the commands for configuring, starting, and managing a CockroachDB cluster.
toc: true
---

This page introduces the `cockroach` commands for configuring, starting, and managing a CockroachDB cluster, as well as logging flags that can be set on any command and environment variables that can be used in place of certain flags.

You can run `cockroach help` in your shell to get similar guidance.


## Commands

Command | Usage
--------|----
[`start`](start-a-node.html) | Start a node.
[`init`](initialize-a-cluster.html) | <span class="version-tag">New in v1.1:</span> Initialize a cluster.
[`cert`](create-security-certificates.html) | Create CA, node, and client certificates.
[`quit`](stop-a-node.html) | Temporarily stop a node or permanently remove a node.
[`sql`](use-the-built-in-sql-client.html) | Use the built-in SQL client.
[`user`](create-and-manage-users.html) | Get, set, list, and remove users.
[`zone`](configure-replication-zones.html) | Configure the number and location of replicas for specific sets of data.
[`node`](view-node-details.html) | List node IDs, show their status, decommission nodes for removal, or recommission nodes.
[`dump`](sql-dump.html) | Back up a table by outputting the SQL statements required to recreate the table and all its rows.
[`debug zip`](debug-zip.html) | Generate a `.zip` file that can help Cockroach Labs troubleshoot issues with your cluster.
[`gen`](generate-cockroachdb-resources.html) | Generate manpages, a bash completion file, example SQL data, or an HAProxy configuration file for a running cluster.
[`version`](view-version-details.html) | Output CockroachDB version details.

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

For more details, see [Client Connection Parameters](connection-parameters.html).
