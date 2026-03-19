---
title: cockroach Commands Overview
summary: Learn the commands for configuring, starting, and managing a CockroachDB cluster.
toc: true
docs_area: reference.cli
---

This page introduces the `cockroach` commands for configuring, starting, and managing a CockroachDB cluster, as well as environment variables that can be used in place of certain flags.

You can run `cockroach help` in your shell to get similar guidance.

## Commands

Command | Usage
--------|----
[`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) | Start a node as part of a multi-node cluster.
[`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) | Initialize a multi-node cluster.
[`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) | Start a single-node cluster.
[`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %}) | Create CA, node, and client certificates.
[`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) | Use the built-in SQL client.
[`cockroach sqlfmt`]({% link {{ page.version.version }}/cockroach-sqlfmt.md %}) | Reformat SQL queries for enhanced clarity.
[`cockroach node`]({% link {{ page.version.version }}/cockroach-node.md %}) | List node IDs, show their status, decommission nodes for removal, or recommission nodes.
[`cockroach nodelocal upload`]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %}) | Upload a file to the `externalIODir` on a node's local file system.
[`cockroach auth-session`]({% link {{ page.version.version }}/cockroach-auth-session.md %}) | Create and manage web sessions and authentication tokens to the HTTP interface from the command line.
[`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) | Start a temporary, in-memory CockroachDB cluster, and open an interactive SQL shell to it.
[`cockroach debug ballast`]({% link {{ page.version.version }}/cockroach-debug-ballast.md %}) | Create a large, unused file in a node's storage directory that you can delete if the node runs out of disk space.
[`cockroach debug encryption-active-key`]({% link {{ page.version.version }}/cockroach-debug-encryption-active-key.md %}) | View the encryption algorithm and store key.
[`cockroach debug job-trace`]({% link {{ page.version.version }}/cockroach-debug-job-trace.md %}) | Generate trace payloads for an executing job from a particular node.
[`cockroach debug list-files`]({% link {{ page.version.version }}/cockroach-debug-list-files.md %}) | Show the files that will be collected by using `cockroach debug zip`.
[`cockroach debug merge-logs`]({% link {{ page.version.version }}/cockroach-debug-merge-logs.md %}) | Merge log files from multiple nodes into a single time-ordered stream of messages with an added per-message prefix to indicate the corresponding node.
[`cockroach debug pebble db analyze-data`]({% link {{ page.version.version }}/cockroach-debug-pebble-db-analyze-data.md %}) | Analyze Pebble data to compare compression algorithms and output results as a CSV file.
[`cockroach debug tsdump`]({% link {{ page.version.version }}/cockroach-debug-tsdump.md %}) | Generate a diagnostic dump of timeseries metrics that can help Cockroach Labs troubleshoot issues with your cluster.
[`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) | Generate a `.zip` file that can help Cockroach Labs troubleshoot issues with your cluster.
[`cockroach convert-url`]({% link {{ page.version.version }}/connection-parameters.md %}#convert-a-url-for-different-drivers) | Convert a connection URL to a format recognized by a [supported client driver]({% link {{ page.version.version }}/third-party-database-tools.md %}#drivers).
[`cockroach gen`]({% link {{ page.version.version }}/cockroach-gen.md %}) | Generate man pages, a bash completion file, example SQL data, or an HAProxy configuration file for a running cluster.
[`cockroach statement-diag`]({% link {{ page.version.version }}/cockroach-statement-diag.md %})  | Manage and download statement diagnostics bundles.
[`cockroach userfile upload`]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}) | Upload a file to user-scoped file storage.
[`cockroach userfile list`]({% link {{ page.version.version }}/cockroach-userfile-list.md %}) | List the files stored in the user-scoped file storage.
[`cockroach userfile get`]({% link {{ page.version.version }}/cockroach-userfile-get.md %}) | Fetch a file from the user-scoped file storage.
[`cockroach userfile delete`]({% link {{ page.version.version }}/cockroach-userfile-delete.md %}) | Delete the files stored in the user-scoped file storage.
[`cockroach version`]({% link {{ page.version.version }}/cockroach-version.md %}) | Output CockroachDB version details.
[`cockroach workload`]({% link {{ page.version.version }}/cockroach-workload.md %}) | Run a built-in load generator against a cluster.

## Environment variables

For many common `cockroach` flags, such as `--port` and `--user`, you can set environment variables once instead of manually passing the flags each time you execute commands.

- To find out which flags support environment variables, see the documentation for each [command](#commands).
- To output the current configuration of CockroachDB and other environment variables, run `env`.
- When a node uses environment variables on [startup]({% link {{ page.version.version }}/cockroach-start.md %}), the variable names are printed to the node's logs; however, the variable values are not.

CockroachDB prioritizes command flags, environment variables, and defaults as follows:

1. If a flag is set for a command, CockroachDB uses it.
1. If a flag is not set for a command, CockroachDB uses the corresponding environment variable.
1. If neither the flag nor environment variable is set, CockroachDB uses the default for the flag.
1. If there's no flag default, CockroachDB gives an error.

For more details, see [Client Connection Parameters]({% link {{ page.version.version }}/connection-parameters.md %}).
