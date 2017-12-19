---
title: Collect Debug Information from Your Cluster
summary: Learn the commands for collecting debug information from all nodes in your cluster.
toc: false
---

The `debug zip` [command](cockroach-commands.html) connects to your cluster and gathers the following information from each active node into a single file (inactive nodes are not included):

- [Log files](debug-and-error-logs.html) 
- Schema change events
- Node liveness
- Gossip data
- Stack traces
- Range lists
- A list of databases and tables

{{site.data.alerts.callout_danger}}The file produced by <code>cockroach debug zip</code> can contain highly sensitive, unanonymized information, such as usernames, passwords, and possibly your table's data. You should share this data only with Cockroach Labs developers and only after determining the most secure method of delivery.{{site.data.alerts.end}}

<div id="toc"></div>

## Details

### Use Cases

There are two scenarios in which `debug zip` is useful:

- To collect all of your nodes' logs, which you can then parse to locate issues. It's important to note, though, that `debug zip` can only access logs from active nodes. See more information [on this page](#collecting-log-files).

- If you experience severe or difficult-to-reproduce issues with your cluster, Cockroach Labs might ask you to send us your cluster's debugging information using `cockroach debug zip`.

{{site.data.alerts.callout_danger}}The file produced by <code>cockroach debug zip</code> can contain highly sensitive, unanonymized information, such as usernames, passwords, and your table's data. You should share this data only with Cockroach Labs developers and only after determining the most secure method of delivery.{{site.data.alerts.end}}

### Collecting Log Files

When you issue the `debug zip` command, the node that receives the request connects to each other node in the cluster. Once it's connected, the node requests the content of all log files stored on the node, the location of which is determined by the `--log-dir` value when you [started the node](start-a-node.html).

Because `debug zip` relies on CockroachDB's distributed architecture, this means that nodes not currently connected to the cluster cannot respond to the request, so their log files *are not* included.

After receiving the log files from all of the active nodes, the requesting node aggregates the files and writes them to an archive file you specify.

You can locate logs in the unarchived file's `debug/nodes/[node dir]/logs` directories.

## Subcommands

While the `cockroach debug` command has a few subcommands, the only subcommand users are expected to use is `zip` which collects all of your cluster's debug information in a single file.

`debug`'s other subcommands are useful only to CockroachDB's developers and contributors.

## Synopsis

~~~ shell
# Generate a debug zip:
$ cockroach debug zip [ZIP file destination] [flags]
~~~

It's important to understand that the `[flags]` here are used to connect to CockroachDB nodes. This means the values you use in those flags must connect to an active node. If no nodes are live, you must [start at least one node](start-a-node.html).

## Flags

The `debug zip` subcommand supports the following [general-use](#general) and [logging](#logging) flags.

### General

Flag | Description
-----|-----------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

### Logging

By default, the `debug zip` command logs errors it experiences to `stderr`. Note that these are errors executing `debug zip`; these are not errors that the logs collected by `debug zip` contain.

If you need to troubleshoot this command's behavior, you can also change its [logging behavior](debug-and-error-logs.html).

## Examples

### Generate a debug zip file

~~~ shell
# Generate the debug zip file for an insecure cluster:
$ cockroach debug zip ./cockroach-data/logs/debug.zip --insecure

# Generate the debug zip file for a secure cluster:
$ cockroach debug zip ./cockroach-data/logs/debug.zip

# Generate the debug zip file from a remote machine:
$ cockroach debug zip ./crdb-debug.zip --host=200.100.50.25
~~~

{{site.data.alerts.callout_info}}Secure examples assume you have the appropriate certificates in the default certificate directory, <code>${HOME}/.cockroach-certs/</code>.{{site.data.alerts.end}}

## See Also

- [File an Issue](file-an-issue.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
