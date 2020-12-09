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
[`cockroach start`](cockroach-start.html) | Start a node as part of a multi-node cluster.
[`cockroach init`](cockroach-init.html) | Initialize a multi-node cluster.
[`cockroach start-single-node`](cockroach-start-single-node.html) | Start a single-node cluster.
[`cockroach cert`](cockroach-cert.html) | Create CA, node, and client certificates.
[`cockroach quit`](cockroach-quit.html) | Temporarily stop a node or permanently remove a node.
[`cockroach sql`](cockroach-sql.html) | Use the built-in SQL client.
[`cockroach sqlfmt`](cockroach-sqlfmt.html) | Reformat SQL queries for enhanced clarity.
[`cockroach node`](cockroach-node.html) | List node IDs, show their status, decommission nodes for removal, or recommission nodes.
[`cockroach dump`](cockroach-dump.html) | **Deprecated.** Use one of the following instead:<ul><li>To back up your data, take a [full backup](take-full-and-incremental-backups.html).</li><li>To export your data in plaintext format, use [`EXPORT`](export.html).</li><li>To view table schema in plaintext, use [`SHOW CREATE TABLE`](show-create.html).</li></ul>
[`cockroach demo`](cockroach-demo.html) | Start a temporary, in-memory CockroachDB cluster, and open an interactive SQL shell to it.
[`cockroach gen`](cockroach-gen.html) | Generate manpages, a bash completion file, example SQL data, or an HAProxy configuration file for a running cluster.
[`cockroach version`](cockroach-version.html) | Output CockroachDB version details.
[`cockroach debug ballast`](cockroach-debug-ballast.html) | Create a large, unused file in a node's storage directory that you can delete if the node runs out of disk space.
[`cockroach debug encryption-active-key`](cockroach-debug-encryption-active-key.html) | View the encryption algorithm and store key.
[`cockroach debug zip`](cockroach-debug-zip.html) | Generate a `.zip` file that can help Cockroach Labs troubleshoot issues with your cluster.
[`cockroach debug merge-logs`](cockroach-debug-merge-logs.html) | Merge multiple log files from different machines into a single stream.
[`cockroach workload`](cockroach-workload.html) | Run a built-in load generator against a cluster.
[`cockroach nodelocal upload`](cockroach-nodelocal-upload.html) |  Upload a file to the `externalIODir` on a node's local file system.
[`cockroach userfile upload`](cockroach-userfile-upload.html)   |  Upload a file to the user-scoped file storage.
[`cockroach userfile list`](cockroach-userfile-list.html)       |  List the files stored in the user-scoped file storage.
[`cockroach userfile delete`](cockroach-userfile-delete.html)   |  Deletes the files stored in the user-scoped file storage.

## Environment variables

For many common `cockroach` flags, such as `--port` and `--user`, you can set environment variables once instead of manually passing the flags each time you execute commands.

- To find out which flags support environment variables, see the documentation for each [command](#commands).
- To output the current configuration of CockroachDB and other environment variables, run `env`.
- When a node uses environment variables on [startup](cockroach-start.html), the variable names are printed to the node's logs; however, the variable values are not.

CockroachDB prioritizes command flags, environment variables, and defaults as follows:

1. If a flag is set for a command, CockroachDB uses it.
2. If a flag is not set for a command, CockroachDB uses the corresponding environment variable.
3. If neither the flag nor environment variable is set, CockroachDB uses the default for the flag.
4. If there's no flag default, CockroachDB gives an error.

For more details, see [Client Connection Parameters](connection-parameters.html).
