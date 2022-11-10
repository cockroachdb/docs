---
title: cockroach debug zip
summary: Learn the commands for collecting debug information from all nodes in your cluster.
toc: true
key: debug-zip.html
docs_area: reference.cli
---

The `cockroach debug zip` [command](cockroach-commands.html) connects to your cluster and gathers information from each active node into a single `.zip` file (inactive nodes are not included). For details on the `.zip` contents, see [Files](#files).

You can use the [`cockroach debug merge-logs`](cockroach-debug-merge-logs.html) command in conjunction with `cockroach debug zip` to merge the collected logs into one file, making them easier to parse.

{{site.data.alerts.callout_danger}}
The files produced by `cockroach debug zip` can contain [highly sensitive, personally-identifiable information (PII)](configure-logs.html#redact-logs), such as usernames, hashed passwords, and possibly table data. Use the [`--redact`](#redact-sensitive-information) flag to configure CockroachDB to redact sensitive data when generating the `.zip` file (excluding range keys) if intending to share it with Cockroach Labs.
{{site.data.alerts.end}}

## Details

### Use cases

There are two scenarios in which `debug zip` is useful:

- To collect all of your nodes' logs, which you can then parse to locate issues. You can optionally use the [flags](#flags) to [retrieve only the log files](#generate-a-debug-zip-file-with-logs-only). For more information about logs, see [Logging](logging-overview.html). Also note:

    - Nodes that are currently [down](cluster-setup-troubleshooting.html#node-liveness-issues) cannot deliver their logs over the network. For these nodes, you must log on to the machine where the `cockroach` process would otherwise be running, and gather the files manually.

    - Nodes that are currently up but disconnected from other nodes (e.g., because of a [network partition](cluster-setup-troubleshooting.html#network-partition)) may not be able to respond to `debug zip` requests forwarded by other nodes, but can still respond to requests for data when asked directly. In such situations, we recommend using the [`--host` flag](#client-connection) to point `debug zip` at each of the disconnected nodes until data has been gathered for the entire cluster.

- If you experience severe or difficult-to-reproduce issues with your cluster, Cockroach Labs might ask you to send us your cluster's debugging information using `cockroach debug zip`.

### Files

`cockroach debug zip` collects log files, heap profiles, CPU profiles, and goroutine dumps from the last 48 hours, by default.

{{site.data.alerts.callout_success}}
These files can greatly increase the size of the `cockroach debug zip` output. To limit the `.zip` file size for a large cluster, we recommend first experimenting with [`cockroach debug list-files`](cockroach-debug-list-files.html) and then using [flags](#flags) to filter the files.
{{site.data.alerts.end}}

The following files collected by `cockroach debug zip`, which are found in the individual node directories, can be filtered using the `--exclude-files`, `--include-files`, `--files-from`, and/or `--files-until` [flags](#flags):

| Information                                                                                          | Filename                                                                             |
|------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [Log files](configure-logs.html#log-file-naming)                                                     | `cockroach-{log-file-group}.{host}.{user}.{start timestamp in UTC}.{process ID}.log` |
| Goroutine dumps                                                                                      | `goroutine_dump.{date-and-time}.{metadata}.double_since_last_dump.{metadata}.txt.gz` |
| Heap profiles                                                                                        | `memprof.{date-and-time}.{heapsize}.pprof`                                           |
| Memory statistics                                                                                    | `memstats.{date-and-time}.{heapsize}.txt`                                            |
| CPU profiles                                                                                         | `cpuprof.{date-and-time}`                                                            |
| [Active query dumps](cluster-setup-troubleshooting.html#out-of-memory-oom-crash) | `activequeryprof.{date-and-time}.csv`                                                |

The following information is also contained in the `.zip` file, and cannot be filtered:

- Cluster events
- Database details
- Schema change events
- Database, table, node, and range lists
- Node details
- Node liveness
- Gossip data
- Stack traces
- Range details
- Jobs
- [Cluster Settings](cluster-settings.html)
- [Metrics](ui-custom-chart-debug-page.html#available-metrics)
- [Replication Reports](query-replication-reports.html)
- Problem ranges
- CPU profiles
- A script (`hot-ranges.sh`) that summarizes the hottest ranges (ranges receiving a high number of reads or writes)

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Synopsis

~~~ shell
$ cockroach debug zip {ZIP file destination} {flags}
~~~

{{site.data.alerts.callout_info}}
The following [flags](#flags) must apply to an active CockroachDB node. If no nodes are live, you must [start at least one node](cockroach-start.html).
{{site.data.alerts.end}}

## Flags

The `debug zip` subcommand supports the following [general-use](#general), [client connection](#client-connection), and [logging](#logging) flags.

### General

Flag | Description
-----|-----------
`--cpu-profile-duration` | Fetch CPU profiles from the cluster with the specified sample duration in seconds. The `debug zip` command will block for the duration specified. A value of `0` disables this feature.<br /><br />**Default:** `5`
`--concurrency` | The maximum number of nodes to concurrently poll for data. This can be any value between `1` and `15`.
`--exclude-files` | [Files](#files) to exclude from the generated `.zip`. This can be used to limit the size of the generated `.zip`, and affects logs, heap profiles, goroutine dumps, and/or CPU profiles. The files are specified as a comma-separated list of [glob patterns](https://en.wikipedia.org/wiki/Glob_(programming)). For example:<br /><br />`--exclude-files=*.log`<br /><br />Note that this flag is applied _after_ `--include_files`. Use [`cockroach debug list-files`](cockroach-debug-list-files.html) with this flag to see a list of files that will be contained in the `.zip`.
`--exclude-nodes` | Specify nodes to exclude from inspection as a comma-separated list or range of node IDs. For example:<br /><br />`--exclude-nodes=1,10,13-15`
`--files-from` | Start timestamp for log file, goroutine dump, and heap profile collection. This can be used to limit the size of the generated `.zip`, which is increased by these files. The timestamp uses the format `YYYY-MM-DD`, followed optionally by `HH:MM:SS` or `HH:MM`. For example:<br /><br />`--files-from='2021-07-01 15:00'`<br /><br />When specifying a narrow time window, we recommend adding extra seconds/minutes to account for uncertainties such as clock drift.<br /><br />**Default:** 48 hours before now
`--files-until` | End timestamp for log file, goroutine dump, and heap profile collection. This can be used to limit the size of the generated `.zip`, which is increased by these files. The timestamp uses the format `YYYY-MM-DD`, followed optionally by `HH:MM:SS` or `HH:MM`. For example:<br /><br />`--files-until='2021-07-01 16:00'`<br /><br />When specifying a narrow time window, we recommend adding extra seconds/minutes to account for uncertainties such as clock drift.<br /><br />**Default:** 24 hours beyond now (to include files created during `.zip` creation)
`--include-files` | [Files](#files) to include in the generated `.zip`. This can be used to limit the size of the generated `.zip`, and affects logs, heap profiles, goroutine dumps, and/or CPU profiles. The files are specified as a comma-separated list of [glob patterns](https://en.wikipedia.org/wiki/Glob_(programming)). For example:<br /><br />`--include-files=*.pprof`<br /><br />Note that this flag is applied _before_ `--exclude-files`. Use [`cockroach debug list-files`](cockroach-debug-list-files.html) with this flag to see a list of files that will be contained in the `.zip`.
`--nodes` | Specify nodes to inspect as a comma-separated list or range of node IDs. For example:<br /><br />`--nodes=1,10,13-15`
`--redact` | **New in v22.1.9** Redact sensitive data from the generated `.zip`, with the exception of range keys, which must remain unredacted because they are essential to support CockroachDB. This flag replaces the deprecated `--redact-logs` flag, which only applied to log messages contained within `.zip`. See [Redact sensitive information](#redact-sensitive-information) for an example.
`--redact-logs` | **Deprecated** Redact [sensitive data](configure-logs.html#redact-logs) from the log files. Note that this flag removes sensitive information only from the log files. The other items (listed above) collected by the `debug zip` command may still contain sensitive information. To redact sensitive data across the entire generated `.zip`, use the `--redact` flag instead.
`--timeout` | Return an error if the command does not conclude within a specified nonzero value. The timeout is suffixed with `s` (seconds), `m` (minutes), or `h` (hours). For example:<br /><br />`--timeout=2m`

### Client connection

Flag | Description
-----|------------
`--cert-principal-map` | A comma-separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir` | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`](cockroach-start.html#general).
`--host` | The server host and port number to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost:26257`
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
<a name="sql-flag-url"></a> `--url` | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments. To convert a connection URL to the syntax that works with your client driver, run [`cockroach convert-url`](connection-parameters.html#convert-a-url-for-different-drivers).<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL

### Logging

{% include {{ page.version.version }}/misc/logging-defaults.md %}

## Examples

### Generate a debug zip file

Generate the debug zip file for an insecure cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --insecure --host=200.100.50.25
~~~

Generate the debug zip file for a secure cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --host=200.100.50.25
~~~

{{site.data.alerts.callout_info}}
Secure examples assume you have the appropriate certificates in the default certificate directory, `${HOME}/.cockroach-certs/`.
{{site.data.alerts.end}}

### Generate a debug zip file with logs only

Generate a debug zip file containing only log files:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --include-files=*.log
~~~

### Redact sensitive information

Example of a log string without redaction enabled:

~~~
server/server.go:1423 ⋮ password of user ‹admin› was set to ‹"s3cr34?!@x_"›
~~~

Enable log redaction:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --redact --insecure --host=200.100.50.25
~~~

~~~
server/server.go:1423 ⋮ password of user ‹×› was set to ‹×›
~~~

## See also

- [File an Issue](file-an-issue.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
