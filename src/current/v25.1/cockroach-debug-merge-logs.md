---
title: cockroach debug merge-logs
summary: Learn the command for merging the collected debug logs from all nodes in your cluster.
toc: true
key: debug-merge-logs.html
docs_area: reference.cli
---

The `cockroach debug merge-logs` [command]({{ page.version.version }}/cockroach-commands.md) merges log files from multiple nodes into a single time-ordered stream of messages with an added per-message prefix to indicate the corresponding node. You can use it in conjunction with logs collected using the [`debug zip`]({{ page.version.version }}/cockroach-debug-zip.md) command to aid in debugging.

{{site.data.alerts.callout_danger}}
The file produced by `cockroach debug zip` can contain highly [sensitive, identifiable information]({{ page.version.version }}/configure-logs.md#redact-logs), such as usernames, hashed passwords, and possibly your table's data. You can use the [`--redact`](#example) flag to redact the sensitive data out of log files and crash reports before sharing them with Cockroach Labs.
{{site.data.alerts.end}}

## Subcommands


## Synopsis

~~~ shell
$ cockroach debug merge-logs [log file directory] [flags]
~~~

## Flags

The `debug merge-logs` subcommand supports the following flags:

Flag | Description
-----|-----------
`--format` | **Required** The [format of the logs]({{ page.version.version }}/log-formats.md) in the log file directory. The logs in a `.zip` generated using [`cockroach debug zip`]({{ page.version.version }}/cockroach-debug-zip.md) are of type [`crdb-v1`]({{ page.version.version }}/log-formats.md#format-crdb-v1).
`--filter` | Limit the results to the specified regular expression
`--from` | Start time for the time range filter.
`--to` | End time for the time range filter.
`--redact` | Redact [sensitive data]({{ page.version.version }}/configure-logs.md#redact-logs) from the log files.

## Example

Generate a debug zip file:

~~~ shell
cockroach debug zip ./cockroach-data/logs/debug.zip --insecure
~~~

Unzip the file:

~~~ shell
unzip ./cockroach-data/logs/debug.zip
~~~

Merge the logs in the debug folder:

~~~ shell
cockroach debug merge-logs debug/nodes/*/logs/* --format=crdb-v1
~~~

Alternatively, filter the merged logs for a specified time range:

~~~ shell
cockroach debug merge-logs debug/nodes/*/logs/* --format=crdb-v1 --from="231031 19:19:50.917185" --to="231031 19:19:57.189263"
~~~

You can also filter the merged logs for a regular expression:

~~~ shell
cockroach debug merge-logs debug/nodes/*/logs/* --format=crdb-v1 --filter="ALL SECURITY CONTROLS HAVE BEEN DISABLED"
~~~

You can redact sensitive information from the merged logs:

~~~ shell
cockroach debug merge-logs debug/nodes/*/logs/* --format=crdb-v1 --redact
~~~

## Considerations

As of v23.2, logs can be configured to use a [timezone with formats `crdb-v1` or `crdb-v2`]({{ page.version.version }}/configure-logs.md#set-timezone). This is a [backward-incompatible change](releases/v23.2.md#v23-2-0-alpha-1-backward-incompatible-changes). `cockroach debug merge-logs` requires v23.2 or later if run against logs with the timezone configured. With versions prior to v23.2, `cockroach debug merge-logs` will return an error if run against logs with the timezone configured.

## See also

- [File an Issue]({{ page.version.version }}/file-an-issue.md)
- [`cockroach` Commands Overview]({{ page.version.version }}/cockroach-commands.md)
- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)