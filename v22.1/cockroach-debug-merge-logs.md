---
title: cockroach debug merge-logs
summary: Learn the command for merging the collected debug logs from all nodes in your cluster.
toc: true
key: debug-merge-logs.html
docs_area: reference.cli
---

The `cockroach debug merge-logs` [command](cockroach-commands.html) merges log files from multiple nodes into a single time-ordered stream of messages with an added per-message prefix to indicate the corresponding node. You can use it in conjunction with logs collected using the [`debug zip`](cockroach-debug-zip.html) command to aid in debugging.

{{site.data.alerts.callout_danger}}
The file produced by `cockroach debug zip` can contain highly [sensitive, identifiable information](configure-logs.html#redact-logs), such as usernames, hashed passwords, and possibly your table's data. You can use the [`--redact`](#example) flag to redact the sensitive data out of log files and crash reports before sharing them with Cockroach Labs.
{{site.data.alerts.end}}

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Synopsis

~~~ shell
$ cockroach debug merge-logs [log file directory] [flags]
~~~

## Flags

Use the following flags to filter the `debug merge-logs` results for a specified regular expression or time range.

Flag | Description
-----|-----------
`--filter` | Limit the results to the specified regular expression
`--from` | Start time for the time range filter.
`--to` | End time for the time range filter.
`--redact` | Redact [sensitive data](configure-logs.html#redact-logs) from the log files.

## Example

Generate a debug zip file:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --insecure
~~~

Unzip the file:

{% include_cached copy-clipboard.html %}
~~~ shell
$ unzip ./cockroach-data/logs/debug.zip
~~~

Merge the logs in the debug folder:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug merge-logs debug/nodes/*/logs/*
~~~

Alternatively, filter the merged logs for a specified time range:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug merge-logs debug/nodes/*/logs/* --from="220713 18:36:28.208553" --to="220713 18:36:29.232864"
~~~

You can also filter the merged logs for a regular expression:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach debug merge-logs debug/nodes/*/logs/* --filter="RUNNING IN INSECURE MODE"
~~~

You can redact sensitive information from the merged logs:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach debug merge-logs --redact debug/nodes/*/logs/*
~~~

## See also

- [File an Issue](file-an-issue.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
