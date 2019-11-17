---
title: Cockroach Commands
summary: Learn the commands for configuring, starting, and managing a CockroachDB cluster.
toc: true
---

This page introduces the `cockroach` commands for configuring, starting, and managing a CockroachDB cluster, as well as environment variables that can be used in place of certain flags.

You can run `cockroach help` in your shell to get similar guidance.


## Commands

Command | Usage
--------|----
[`cockroach start`](start-a-node.html) | Start a node as part of a multi-node cluster.
[`cockroach init`](initialize-a-cluster.html) | Initialize a multi-node cluster.
[`cockroach start-single-node`](cockroach-start-single-node.html) | Start a single-node cluster. 
[`cockroach cert`](create-security-certificates.html) | Create CA, node, and client certificates.
[`cockroach quit`](stop-a-node.html) | Temporarily stop a node or permanently remove a node.
[`cockroach sql`](use-the-built-in-sql-client.html) | Use the built-in SQL client.
[`cockroach sqlfmt`](use-the-query-formatter.html) | Reformat SQL queries for enhanced clarity.
`cockroach user` | **Deprecated.** To create and manage users and roles, use [`CREATE USER`](create-user.html), [`ALTER USER`](alter-user.html), [`DROP USER`](drop-user.html), [`SHOW USERS`](show-users.html), [`CREATE ROLE`](create-role.html), [`DROP ROLE`](drop-role.html), and [`SHOW ROLES`](show-roles.html).
[`cockroach node`](view-node-details.html) | List node IDs, show their status, decommission nodes for removal, or recommission nodes.
[`cockroach dump`](sql-dump.html) | Back up a table by outputting the SQL statements required to recreate the table and all its rows.
[`cockroach demo`](cockroach-demo.html) | Start a temporary, in-memory, single-node CockroachDB cluster, and open an interactive SQL shell to it.
[`cockroach gen`](generate-cockroachdb-resources.html) | Generate manpages, a bash completion file, example SQL data, or an HAProxy configuration file for a running cluster.
[`cockroach version`](view-version-details.html) | Output CockroachDB version details.
[`cockroach debug ballast`](debug-ballast.html) | Create a large, unused file in a node's storage directory that you can delete if the node runs out of disk space.
[`cockroach debug encryption-active-key`](debug-encryption-active-key.html) | View the encryption algorithm and store key.
[`cockroach debug zip`](debug-zip.html) | Generate a `.zip` file that can help Cockroach Labs troubleshoot issues with your cluster.
[`cockroach debug merge-logs`](debug-merge-logs.html) | Merge multiple log files from different machines into a single stream.
[`cockroach workload`](cockroach-workload.html) | Run a built-in load generator against a cluster.

## Environment variables

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
