---
title: Cockroach Commands
summary: Learn the commands for configuring, starting, and managing a CockroachDB cluster.
toc: true
docs_area: reference.cli
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
[`cockroach sql`](cockroach-sql.html) | Use the built-in SQL client.
[`cockroach sqlfmt`](cockroach-sqlfmt.html) | Reformat SQL queries for enhanced clarity.
[`cockroach node`](cockroach-node.html) | List node IDs, show their status, decommission nodes for removal, or recommission nodes.
[`cockroach demo`](cockroach-demo.html) | Start a temporary, in-memory CockroachDB cluster, and open an interactive SQL shell to it.
[`cockroach gen`](cockroach-gen.html) | Generate manpages, a bash completion file, example SQL data, or an HAProxy configuration file for a running cluster.
[`cockroach version`](cockroach-version.html) | Output CockroachDB version details.
[`cockroach debug ballast`](cockroach-debug-ballast.html) | Create a large, unused file in a node's storage directory that you can delete if the node runs out of disk space.
[`cockroach debug encryption-active-key`](cockroach-debug-encryption-active-key.html) | View the encryption algorithm and store key.
[`cockroach debug job-trace`](cockroach-debug-job-trace.html) | Generate trace payloads for an executing job from a particular node.
[`cockroach debug zip`](cockroach-debug-zip.html) | Generate a `.zip` file that can help Cockroach Labs troubleshoot issues with your cluster.
[`cockroach debug merge-logs`](cockroach-debug-merge-logs.html) | Merge multiple log files from different machines into a single stream.
[`cockroach convert-url`](connection-parameters.html#convert-a-url-for-different-drivers) | {% include_cached new-in.html version=v21.2 %} Convert a connection URL to a format recognized by a [supported client driver](third-party-database-tools.html#drivers).
[`cockroach workload`](cockroach-workload.html) | Run a built-in load generator against a cluster.
[`cockroach nodelocal upload`](cockroach-nodelocal-upload.html) |  Upload a file to the `externalIODir` on a node's local file system.
[`cockroach userfile upload`](cockroach-userfile-upload.html)   |  The cockroach userfile upload command uploads a file to user-scoped file storage.
[`cockroach userfile list`](cockroach-userfile-list.html)       |  List the files stored in the user-scoped file storage.
[`cockroach userfile delete`](cockroach-userfile-delete.html)   |  Deletes the files stored in the user-scoped file storage.
[`cockroach userfile get`](cockroach-userfile-get.html)         |  Fetch a file from the user-scoped file storage.
[`cockroach import`](cockroach-import.html)   |   Import a table or database from a local dump file into a running cluster. `PGDUMP` and `MYSQLDUMP` file formats are currently supported.

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
