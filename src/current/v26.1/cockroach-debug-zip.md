---
title: cockroach debug zip
summary: Learn the commands for collecting debug information from all nodes in your cluster.
toc: true
key: debug-zip.html
docs_area: reference.cli
---

The `cockroach debug zip` [command]({% link {{ page.version.version }}/cockroach-commands.md %}) connects to your cluster and gathers information from each active node into a single `.zip` file (inactive nodes are not included). For details on the `.zip` contents, see [Files](#files).

You can use the [`cockroach debug merge-logs`]({% link {{ page.version.version }}/cockroach-debug-merge-logs.md %}) command in conjunction with `cockroach debug zip` to merge the collected logs into one file, making them easier to parse.

{{site.data.alerts.callout_danger}}
The files produced by `cockroach debug zip` can contain highly [sensitive, personally-identifiable information (PII)]({% link {{ page.version.version }}/configure-logs.md %}#redact-logs), such as usernames, hashed passwords, and possibly table data. Use the [`--redact`](#redact) flag to configure CockroachDB to redact sensitive data when generating the `.zip` file (excluding range keys) if intending to share it with Cockroach Labs.
{{site.data.alerts.end}}

## Details

### Use cases

{{site.data.alerts.callout_danger}}
 `cockroach debug zip` is an expensive operation and impacts cluster performance.

Only use this command as an emergency measure under the guidance of Cockroach Labs.

Particularly fetching stack traces for all goroutines is a "stop-the-world" operation, which can momentarily but significantly increase SQL service latency. Exclude these goroutine stacks by using the [`--include-goroutine-stacks=false` flag](#include-goroutine-stacks).
{{site.data.alerts.end}}

There are two scenarios in which `debug zip` is useful:

- If you experience severe or difficult-to-reproduce issues with your cluster, Cockroach Labs might ask you to send us your cluster's debugging information using `cockroach debug zip`. We recommend reducing the `*.zip` file size by only [retrieving debugging information for the relevant time range](#generate-a-debug-zip-file-for-a-time-range) of the issue by using the `--files-from`, and/or `--files-until` [flags](#flags).

- To collect all of your nodes' logs, which you can then parse to locate issues. You can optionally use the [flags](#flags) to [retrieve only the log files](#generate-a-debug-zip-file-with-logs-only). For more information about logs, see [Logging]({% link {{ page.version.version }}/logging-overview.md %}). Also note:

    - Nodes that are currently [down]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues) cannot deliver their logs over the network. For these nodes, you must log on to the machine where the `cockroach` process would otherwise be running, and gather the files manually.

    - Nodes that are currently up but disconnected from other nodes (e.g., because of a [network partition]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition)) may not be able to respond to `debug zip` requests forwarded by other nodes, but can still respond to requests for data when asked directly. In such situations, we recommend using the [`--host` flag](#client-connection) to point `debug zip` at each of the disconnected nodes until data has been gathered for the entire cluster.

### Files

`cockroach debug zip` collects log files, heap profiles, CPU profiles, and goroutine dumps from the last 48 hours, by default.

{{site.data.alerts.callout_success}}
These files can greatly increase the size of the `cockroach debug zip` output. To limit the `.zip` file size for a large cluster, we recommend first experimenting with [`cockroach debug list-files`]({% link {{ page.version.version }}/cockroach-debug-list-files.md %}) and then using [flags](#flags) to filter the files.
{{site.data.alerts.end}}

The following files collected by `cockroach debug zip`, which are found in the individual node directories, can be filtered using the `--exclude-files`, `--include-files`, `--files-from`, and/or `--files-until` [flags](#flags):

| Information                                                                                          | Filename                                                                             |
|------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [Log files]({% link {{ page.version.version }}/configure-logs.md %}#log-file-naming)                                                     | `cockroach-{log-file-group}.{host}.{user}.{start timestamp in UTC}.{process ID}.log` |
| Goroutine dumps                                                                                      | `goroutine_dump.{date-and-time}.{metadata}.double_since_last_dump.{metadata}.txt.gz` |
| Heap profiles                                                                                        | `memprof.{date-and-time}.{heapsize}.pprof`                                           |
| Memory statistics                                                                                    | `memstats.{date-and-time}.{heapsize}.txt`                                            |
| CPU profiles                                                                                         | `cpuprof.{date-and-time}`                                                            |
| [Active query dumps]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash)                     | `activequeryprof.{date-and-time}.csv`                                                |

The following information is also contained in the `.zip` file, and cannot be filtered:

- System tables. The following system tables are not included:
  - `system.users`
  - `system.web_sessions`
  - `system.join_tokens`
  - `system.comments`
  - `system.ui`
  - `system.zones`
  - `system.statement_bundle_chunks`
  - `system.statement_statistics`
  - `system.transaction_statistics`
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
- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})
- [Metrics]({% link {{ page.version.version }}/metrics.md %})
- CPU profiles
- A script (`hot-ranges.sh`) that summarizes the hottest ranges (ranges receiving a high number of reads or writes)

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Synopsis

~~~ shell
$ cockroach debug zip {ZIP file destination} {flags}
~~~

{{site.data.alerts.callout_info}}
The following [flags](#flags) must apply to an active CockroachDB node. If no nodes are live, you must [start at least one node]({% link {{ page.version.version }}/cockroach-start.md %}).
{{site.data.alerts.end}}

## Flags

The `debug zip` subcommand supports the following [general-use](#general), [client connection](#client-connection), and [logging](#logging) flags.

### General

Flag | Description
-----|-----------
`--cpu-profile-duration` | Fetch CPU profiles from the cluster with the specified sample duration in seconds. The `debug zip` command will block for the duration specified. A value of `0` disables this feature.<br /><br />**Default:** `5s`
`--concurrency` | The maximum number of nodes to concurrently poll for data. This can be any value between `1` and `15`.
`--exclude-files` | [Files](#files) to exclude from the generated `.zip`. This can be used to limit the size of the generated `.zip`, and affects logs, heap profiles, goroutine dumps, and/or CPU profiles. The files are specified as a comma-separated list of double-quoted [glob patterns](https://wikipedia.org/wiki/Glob_(programming)). For example:<br /><br /><ul><li>`--exclude-files="*.log"`</li><li>`--exclude-files="cockroach-storage*","cockroach-sessions*","memprof*","memstats*"`</li></ul>Note that this flag is applied _after_ `--include_files`. Use [`cockroach debug list-files`]({% link {{ page.version.version }}/cockroach-debug-list-files.md %}) with this flag to see a list of files that will be contained in the `.zip`.
`--exclude-nodes` | Specify nodes to exclude from inspection as a comma-separated list or range of node IDs. For example:<br /><br />`--exclude-nodes=1,10,13-15`
`--files-from` | Start timestamp for log file, goroutine dump, and heap profile collection. This can be used to limit the size of the generated `.zip`, which is increased by these files. The timestamp uses the format `YYYY-MM-DD`, followed optionally by `HH:MM:SS` or `HH:MM`. For example:<br /><br />`--files-from='2021-07-01 15:00'`<br /><br />When specifying a narrow time window, we recommend adding extra seconds/minutes to account for uncertainties such as clock drift.<br /><br />**Default:** 48 hours before now
`--files-until` | End timestamp for log file, goroutine dump, and heap profile collection. This can be used to limit the size of the generated `.zip`, which is increased by these files. The timestamp uses the format `YYYY-MM-DD`, followed optionally by `HH:MM:SS` or `HH:MM`. For example:<br /><br />`--files-until='2021-07-01 16:00'`<br /><br />When specifying a narrow time window, we recommend adding extra seconds/minutes to account for uncertainties such as clock drift.<br /><br />**Default:** 24 hours beyond now (to include files created during `.zip` creation)
`--include-files` | [Files](#files) to include in the generated `.zip`. This can be used to limit the size of the generated `.zip`, and affects logs, heap profiles, goroutine dumps, and/or CPU profiles. The files are specified as a comma-separated list of double-quoted [glob patterns](https://wikipedia.org/wiki/Glob_(programming)). For example:<br /><br /><ul><li>`--include-files="*.pprof"`</li><li>`--include-files="cockroach-storage*","cockroach-sessions*","memprof*","memstats*"`</li></ul>Note that this flag is applied _before_ `--exclude-files`. Use [`cockroach debug list-files`]({% link {{ page.version.version }}/cockroach-debug-list-files.md %}) with this flag to see a list of files that will be contained in the `.zip`.
<a name="include-goroutine-stacks"></a>`--include-goroutine-stacks` | Fetch stack traces for all goroutines running on each targeted node in `nodes/*/stacks.txt` and `nodes/*/stacks_with_labels.txt` files. Note that fetching stack traces for all goroutines is a "stop-the-world" operation, which can momentarily have negative impacts on SQL service latency. Exclude these goroutine stacks by using the `--include-goroutine-stacks=false` flag. Note that any periodic goroutine dumps previously taken on the node will still be included in `nodes/*/goroutines/*.txt.gz`, as these would have already been generated and don't require any additional stop-the-world operations to be collected.<br /><br />**Default:** true
`--include-range-info` | Include one file per node with information about the KV ranges stored on that node, in `nodes/{node ID}/ranges.json`.<br /><br />This information can be vital when debugging issues that involve the [KV layer]({% link {{ page.version.version }}/architecture/overview.md %}#layers) (which includes everything below the SQL layer), such as data placement, load balancing, performance or other behaviors. In certain situations, on large clusters with large numbers of ranges, these files can be omitted if and only if the issue being investigated is already known to be in another layer of the system (for example, an error message about an unsupported feature or incompatible value in a SQL schema change or statement). However, many higher-level issues are ultimately related to the underlying KV layer described by these files. Only set this to `false` if directed to do so by Cockroach Labs support.<br /><br />In addition, include problem ranges information in `reports/problemranges.json`.<br /><br />**Default:** true
`--include-running-job-traces` | Include information about each traceable job that is running or reverting (such as [backup]({% link {{ page.version.version }}/backup.md %}), [restore]({% link {{ page.version.version }}/restore.md %}), [import]({% link {{ page.version.version }}/import-into.md %}), [physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})) in `jobs/*/*/trace.zip` files. This involves collecting cluster-wide traces for each running job in the cluster.<br /><br />**Default:** true
`--nodes` | Specify nodes to inspect as a comma-separated list or range of node IDs. For example:<br /><br />`--nodes=1,10,13-15`
<a id="redact"></a>`--redact` | Redact sensitive data in the generated `.zip` file. This flag replaces the deprecated [`--redact-logs`](#redact-logs) flag.<br><br>This flag redacts the following data:<ul><li>Sensitive data in log messages. Refer to [Log redaction](#log-redaction) for an example.</li><li>Non-default values of cluster settings marked as **not** `reportable` in `crdb_internal.cluster_settings.txt` and `cluster_settings_history.txt`. Refer to [Cluster settings redaction](#cluster-settings-redaction) for an example.</li><li>Hostnames and IP addresses in `.json` files (such as `status.json`, `details.json`, and `ranges.json`) when the cluster setting [`debug.zip.redact_addresses.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-debug-zip-redact-addresses-enabled) is enabled. Refer to [Hostname and IP address redaction](#hostname-and-ip-address-redaction) for an example.</li></ul>This flag does **not** affect the following data:<ul><li>Range keys are **never** redacted because they are essential for CockroachDB support.</li><li>Cluster settings marked as `sensitive` are **always** redacted in `crdb_internal.cluster_settings.txt` and `cluster_settings_history.txt`. For an example, refer to [Cluster settings redaction](#cluster-settings-redaction).</li><li>Some hostnames and IP addresses in the `nodes.json` and `gossip.json` files are **never** redacted, even when `debug.zip.redact_addresses.enabled` is enabled.</li></ul>For examples, refer to [Redact sensitive information](#redact-sensitive-information).
<a id="redact-logs"></a>`--redact-logs` | **Deprecated** Redact sensitive data from collected log files only. Use the `--redact` flag instead, which redacts sensitive data across the entire generated `.zip` as well as the collected log files. Passing the `--redact-logs` flag will be interpreted as the `--redact` flag.
`--timeout` | In the process of generating a debug zip, many internal requests are made. Each request is allowed the maximum duration specified by the timeout. If an internal request does not complete within the timeout duration, an error is displayed for that request and its artifact is not included in the zip file.<br /><br />The timeout is suffixed with `s` (seconds), `m` (minutes), or `h` (hours).<br /><br />**Default:** `60s`
`--validate-zip-file` | Validate debug zip file after generation. This is a quick check to validate whether the generated zip file is valid and not corrupted.<br /><br />**Default:** `true`

### Client connection

Flag | Description
-----|------------
`--cert-principal-map` | A comma-separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir` | The path to the [certificate directory]({% link {{ page.version.version }}/cockroach-cert.md %}) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#general).
`--host` | The server host and port number to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost:26257`
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--user` | The SQL user that will be used to connect to the cluster. This user must have appropriate permissions to access debug information.<br><br><span class="version-tag">New in v26.1:</span> Previously, `cockroach debug zip` always used the `root` user regardless of this flag's value. Now, you can specify a different user such as `debug_user` when `root` login is disabled.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
<a name="sql-flag-url"></a> `--url` | A [connection URL]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url) to use instead of the other arguments. To convert a connection URL to the syntax that works with your client driver, run [`cockroach convert-url`]({% link {{ page.version.version }}/connection-parameters.md %}#convert-a-url-for-different-drivers).<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL

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

### Generate a debug zip file for a time range

Generate a debug zip file containing only debugging information for a specified time range:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --files-from='2023-10-03 13:30' --files-until='2023-10-03 14:30'
~~~

### Generate a debug zip file with logs only

Generate a debug zip file containing only log files:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --include-files=*.log
~~~

### Redact sensitive information

#### Log redaction

Example of a log string without [`--redact`](#redact) enabled:

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

#### Cluster settings redaction

Example cluster settings in `crdb_internal.cluster_settings.txt` without [`--redact`](#redact) enabled:

~~~
variable                          value                  type public sensitive reportable description                                   default_value origin
...
cluster.organization              Cockroach Labs Testing s    t      f         f          organization name                                           override
...
server.identity_map.configuration <redacted>             s    t      t         f          system-identity to database-username mappings               default
~~~

`server.identity_map.configuration` is always redacted, since `sensitive` equals `true`.

Enable log redaction:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --redact --insecure --host=200.100.50.25
~~~

Cluster settings in `crdb_internal.cluster_settings.txt` with [`--redact`](#redact) enabled:

~~~
variable                          value      type public sensitive reportable description                                    default_value origin
...
cluster.organization              <redacted> s    t      f         f          organization name                                            override
...
server.identity_map.configuration <redacted> s    t      t         f          system-identity to database-username mappings                default
~~~

`server.identity_map.configuration` is still redacted. `cluster.organization` is now redacted since `reportable` equals `false` and the `Cockroach Labs Testing` value is not the default value (in this case, the empty string).

#### Hostname and IP address redaction

Example of `status.json` without hostname and IP address redaction enabled:

~~~
{
  "node_id": 1,
  "address": {
    "network_field": "tcp",
    "address_field": "200.100.50.25:26257"
  },
  "sql_address": {
    "network_field": "tcp",
    "address_field": "200.100.50.25:26257"
  }
}
~~~

Enable hostname and IP address redaction with the [`debug.zip.redact_addresses.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-debug-zip-redact-addresses-enabled) cluster setting:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING debug.zip.redact_addresses.enabled = true;
~~~

{{site.data.alerts.callout_info}}
Some hostnames and IP addresses in the `nodes.json` and `gossip.json` files are **never** redacted, even when `debug.zip.redact_addresses.enabled` is enabled.
{{site.data.alerts.end}}

Generate `.zip` with [`--redact`](#redact) enabled:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach debug zip ./cockroach-data/logs/debug.zip --redact --insecure --host=200.100.50.25
~~~

`status.json` with hostname and IP address redaction:

~~~
{
  "node_id": 1,
  "address": {
    "network_field": "tcp",
    "address_field": "‹×›"
  },
  "sql_address": {
    "network_field": "tcp",
    "address_field": "‹×›"
  }
}
~~~

### Generate a debug zip with debug_user (Preview)

<span class="version-tag">New in v26.1:</span> When root login is disabled using the [`--disallow-root-login`]({% link {{ page.version.version }}/cockroach-start.md %}#security) flag, you can collect debug information using `debug_user`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip debug.zip \
--certs-dir=certs \
--host=<node-address> \
--user=debug_user
~~~

For setup instructions, see [Disable root login and use debug_user]({% link {{ page.version.version }}/security-reference/authentication.md %}#disable-root-login-and-use-debug-user).

{{site.data.alerts.callout_info}}
Secure examples assume you have the appropriate certificates in the certificate directory. The `debug_user` must have a certificate with "debug_user" in the CommonName or SubjectAlternativeName. See [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %}) for more information.
{{site.data.alerts.end}}

## See also

- [File an Issue]({% link {{ page.version.version }}/file-an-issue.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
