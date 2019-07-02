---
title: Create a Ballast File
summary: Create a large, unused file in a node's storage directory that you can delete if the node runs out of disk space.
toc: true
---

The `debug ballast` [command](cockroach-commands.html) creates a large, unused file that you can place in a node's storage directory. In the unlikely case that a node runs out of disk space and shuts down, you can delete the ballast file to free up enough space to be able to restart the node.

{{site.data.alerts.callout_info}}
In addition to placing a ballast file in each node's storage directory, it is important to actively [monitor remaining disk space](monitoring-and-alerting.html#events-to-alert-on).
{{site.data.alerts.end}}

## Subcommands

While the `cockroach debug` command has a few subcommands, users are expected to use only the [`zip`](debug-zip.html), [`encryption-active-key`](debug-encryption-active-key.html),  [`merge-logs`](debug-merge-logs.html), and [`ballast`](debug-ballast.html) subcommands.

The other `debug` subcommands are useful only to CockroachDB's developers and contributors.

## Synopsis

~~~ shell
# Create a ballast file:
$ cockroach debug ballast [path to ballast file] [flags]

# View help:
$ cockroach debug ballast --help
~~~

## Flags

Flag | Description
-----|-----------
`--size`<br>`-z` | The amount of space to fill, or to leave available, in a node's storage directory via a ballast file. Positive values equal the size of the ballast file. Negative values equal the amount of space to leave after creating the ballast file. This can be a percentage (notated as a decimal or with %) or any bytes-based unit, for example:<br><br>`--size=10000000000 ----> 10000000000 bytes`<br>`--size=20GB ----> 20000000000 bytes`<br>`--size=20GiB ---> 21474836480 bytes`<br>`--size=0.02TiB ----> 21474836480 bytes`<br>`--size=20% ----> 20% of available space`<br>`--size=0.2 ----> 20% of available space`<br>`--size=.2 ----> 20% of available space`

## Example

{% include copy-clipboard.html %}
~~~ shell
$ cockroach debug ballast cockroach-data/ballast.txt --size=20GiB
~~~

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Production Checklist](recommended-production-settings.html)
