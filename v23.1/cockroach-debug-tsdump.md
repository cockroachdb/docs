---
title: cockroach debug tsdump
summary: Learn the commands for collecting timeseries debug information from all nodes in your cluster.
toc: true
key: debug-tsdump.html
docs_area: reference.cli
---

The `cockroach debug tsdump` [command](cockroach-commands.html) connects to your cluster and collects timeseries diagnostic data from each active node (inactive nodes are not included). This includes both current and historical runtime metrics for your cluster, including those exposed in the [DB Console Metrics](ui-overview-dashboard.html) pages as well as internal metrics.

`cockroach debug tsdump` is mostly used in tandem with the [`cockroach debug zip`](cockroach-debug-zip.html) command to gather diagnostic data during escalations to Cockroach Labs support. Follow the steps in this procedure to gather and prepare the timeseries diagnostic data and prepare it for transit to Cockroach Labs.

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Synopsis

~~~ shell
$ cockroach debug tsdump {flags} > {dump file destination} 
~~~

{{site.data.alerts.callout_info}}
The following [flags](#flags) must apply to an active CockroachDB node. If no nodes are live, you must [start at least one node](cockroach-start.html).
{{site.data.alerts.end}}

## Flags

The `debug tsdump` subcommand supports the following [general-use](#general), [client connection](#client-connection), and [logging](#logging) flags.

### General

Flag | Description
-----|-----------
`--format` | The output format to write the collected diagnostic data. Valid options are `text`, `csv`, `tsv`, `raw`.<br><br>**Default:** `text`
`--from` | The oldest timestamp to include (inclusive), in the format `YYYY-MM-DD [HH:MM[:SS]]`.<br><br>**Default:** `0001-01-01 00:00:00`
`--to` | The newest timestamp to include (inclusive), in the format `YYYY-MM-DD [HH:MM[:SS]]`.<br><br>**Default:** Current timestamp plus 29 hours

### Client connection

Flag | Description
-----|------------
`--cert-principal-map` | A comma-separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a cert to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A cert is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir` | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`](cockroach-start.html#general).
`--host` | The server host and port number to connect to. This can be the address of any node in the cluster.<br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost:26257`
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
<a name="sql-flag-url"></a> `--url` | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments. To convert a connection URL to the syntax that works with your client driver, run [`cockroach convert-url`](connection-parameters.html#convert-a-url-for-different-drivers).<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL

### Logging

By default, this command logs messages to `stdout`. If you need to troubleshoot this command's behavior, you can [customize its logging behavior](configure-logs.html).

## Examples

### Generate a tsdump `gob` file

Generate the tsdump `gob` file for an insecure CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug tsdump --format=raw --insecure > tsdump.gob
~~~

Generate the tsdump `gob` file for a secure CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug tsdump --format=raw --certs-dir=${HOME}/.cockroach-certs/ > tsdump.gob
~~~

{{site.data.alerts.callout_info}}
Secure examples assume you have the appropriate certificates in the default certificate directory, `${HOME}/.cockroach-certs/`. See the [`cockroach cert`](cockroach-cert.html) documentation for more information.
{{site.data.alerts.end}}

### Generate a tsdump `gob` file and compress using `gzip`

Generate a tsdump `gob` file for an insecure CockroachDB cluster, and compress using `gzip` in preparation to send to Cockroach Labs for troubleshooting. Your server must have `gzip` installed:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug tsdump --format=raw --insecure > tsdump.gob
gzip tsdump.gob
~~~

Generate a tsdump `gob` file for a secure CockroachDB cluster, and compress using `gzip` in preparation to send to Cockroach Labs for troubleshooting. Your server must have `gzip` installed:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug tsdump --format=raw --certs-dir=${HOME}/.cockroach-certs/ > tsdump.gob
gzip tsdump.gob
~~~

{{site.data.alerts.callout_info}}
Secure examples assume you have the appropriate certificates in the default certificate directory, `${HOME}/.cockroach-certs/`. See the [`cockroach cert`](cockroach-cert.html) documentation for more information.
{{site.data.alerts.end}}

### Generate a tsdump `gob` file with a custom timestamp range

Generate a tsdump `gob` file specifying a custom timestamp range to limit the data collection to a specific interval. This is useful for reducing the size of the resulting `gob` file if the data needed to troubleshoot falls within a known timestamp range:

~~~ shell
$ cockroach debug tsdump --format=raw --from='2023-01-10 01:00:00' --to='2023-01-20 23:59:59' > tsdump.gob
~~~

## See also

- [File an Issue](file-an-issue.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
