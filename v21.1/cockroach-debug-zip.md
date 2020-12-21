---
title: cockroach debug zip
summary: Learn the commands for collecting debug information from all nodes in your cluster.
toc: true
redirect_from: debug-zip.html
key: debug-zip.html
---

The `cockroach debug zip` [command](cockroach-commands.html) connects to your cluster and gathers information from each active node into a single file (inactive nodes are not included):

- [Log files](debug-and-error-logs.html)
- Secondary log files (e.g., storage engine logs, [execution logs](query-behavior-troubleshooting.html#cluster-wide-execution-logs), [slow query logs](query-behavior-troubleshooting.html#using-the-slow-query-log))
- Cluster events
- Schema change events
- Node liveness
- Gossip data
- Stack traces
- Range lists
- A list of databases and tables
- Jobs
- [Cluster Settings](cluster-settings.html)
- [Metrics](ui-custom-chart-debug-page.html#available-metrics)
- Alerts
- Heap profiles
- Problem ranges
- Sessions
- Queries
- Thread stack traces (Linux only)
- CPU profiles

Additionally, you can run the [`debug merge-logs`](cockroach-debug-merge-logs.html) command to merge the collected logs in one file, making it easier to parse them to locate an issue with your cluster.

{{site.data.alerts.callout_danger}}
The file produced by `cockroach debug zip` can contain highly [sensitive, identifiable information](debug-and-error-logs.html#redacted-logs), such as usernames, hashed passwords, and possibly your table's data. You can use the [`--redact-logs`](#redact-sensitive-information-from-the-logs) flag to redact the sensitive data out of log files and crash reports before sharing them with Cockroach Labs.
{{site.data.alerts.end}}

## Details

### Use cases

There are two scenarios in which `debug zip` is useful:

- To collect all of your nodes' logs, which you can then parse to locate issues. It's important to note, though, that `debug zip` can only access logs from active nodes. For more information, see [Collecting log files](#collecting-log-files) below.

- If you experience severe or difficult-to-reproduce issues with your cluster, Cockroach Labs might ask you to send us your cluster's debugging information using `cockroach debug zip`.

### Collecting log files

When you issue the `debug zip` command, the node that receives the request connects to each other node in the cluster. Once it's connected, the node requests the content of all log files stored on the node, the location of which is determined by the `--log-dir` value when you [started the node](cockroach-start.html).

Because `debug zip` relies on CockroachDB's distributed architecture, this means that nodes not currently connected to the cluster cannot respond to the request, so their log files *are not* included. In such situations, we recommend using the [`--host` flag](#general) to point `debug zip` at individual nodes until data has been gathered for the entire cluster.

After receiving the log files from all of the active nodes, the requesting node aggregates the files and writes them to an archive file you specify.

You can locate logs in the unarchived file's `debug/nodes/[node dir]/logs` directories.

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Synopsis

~~~ shell
$ cockroach debug zip [ZIP file destination] [flags]
~~~

It's important to understand that the `[flags]` here are used to connect to CockroachDB nodes. This means the values you use in those flags must connect to an active node. If no nodes are live, you must [start at least one node](cockroach-start.html).

## Flags

The `debug zip` subcommand supports the following [general-use](#general), [client connection](#client-connection), and [logging](#logging) flags.

### General

Flag | Description
-----|-----------
`--certs-dir` | The path to the [certificate directory](cockroach-cert.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`](cockroach-start.html#general).
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--nodes` |  Specify nodes to inspect as a comma-separated list or range of node IDs. For example:<br><br>`--nodes=1,10,13-15`
`--exclude-nodes` |  Specify nodes to exclude from inspection as a comma-separated list or range of node IDs. For example:<br><br>`--nodes=1,10,13-15`
`--redact-logs` | Redact [sensitive data](debug-and-error-logs.html#redacted-logs) from the log files. Note that this flag removes sensitive information only from the log files. The other items (listed above) collected by the `debug zip` command may still contain sensitive information.

### Client connection

Flag | Description
-----|-----------
`--url` | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL

### Logging

By default, the `debug zip` command logs errors it experiences to `stderr`. Note that these are errors executing `debug zip`; these are not errors that the logs collected by `debug zip` contain.

If you need to troubleshoot this command's behavior, you can also change its [logging behavior](debug-and-error-logs.html).

## Examples

### Generate a debug zip file

Generate the debug zip file for an insecure cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --insecure --host=200.100.50.25
~~~

Generate the debug zip file for a secure cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --host=200.100.50.25
~~~

{{site.data.alerts.callout_info}}Secure examples assume you have the appropriate certificates in the default certificate directory, <code>${HOME}/.cockroach-certs/</code>.{{site.data.alerts.end}}

### Redact sensitive information from the logs

Example of a log string without redaction enabled:

~~~
server/server.go:1423 ⋮ password of user ‹admin› was set to ‹"s3cr34?!@x_"›
~~~

Enable log redaction:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip -- redact-logs --insecure --host=200.100.50.25
~~~

~~~
server/server.go:1423 ⋮ password of user ‹×› was set to ‹×›
~~~

## See also

- [File an Issue](file-an-issue.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
