---
title: Merge debug logs for all nodes
summary: Learn the command for merging the collected debug logs from all nodes in your cluster.
toc: true
---

The `debug merge-logs` [command](cockroach-commands.html) merges the logs for all nodes in the cluster collected using the [`debug zip`](https://www.cockroachlabs.com/docs/stable/debug-zip.html) command. This command helps in debugging cluster issues by making it easier to parse the logs for all nodes and locating an issue.

{{site.data.alerts.callout_danger}}
The file produced by `cockroach debug merge-log` can contain highly sensitive, unanonymized information, such as usernames, passwords, and possibly your table's data. You should share this data only with Cockroach Labs developers and only after determining the most secure method of delivery.
{{site.data.alerts.end}}

## Subcommands

While the `cockroach debug` command has a few subcommands, users are expected to use the `zip` and `debug-merge` subcommands.

`debug`'s other subcommands are useful only to CockroachDB's developers and contributors.

## Synopsis

~~~ shell
$ cockroach debug merge-logs [log file directory]
~~~

## Examples

Generate a debug zip file:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach debug zip ./cockroach-data/logs/debug.zip --insecure
~~~

Unzip the file:

{% include copy-clipboard.html %}
~~~ shell
$ unzip ./cockroach-data/logs/debug.zip
~~~

Merge the logs in the debug folder:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach debug merge-logs debug/nodes/*/logs/* > file
~~~

## See also

- [File an Issue](file-an-issue.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
