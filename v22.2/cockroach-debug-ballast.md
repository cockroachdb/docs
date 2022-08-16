---
title: cockroach debug ballast
summary: Create a large, unused file in a node's storage directory that you can delete if the node runs out of disk space.
toc: true
docs_area: reference.cli
---

 CockroachDB automatically creates an emergency ballast file at startup time.  The `cockroach debug ballast` command is still available but deprecated.  For more information about how automatic ballast file creation works, see [automatic ballast files](cluster-setup-troubleshooting.html#automatic-ballast-files).

The `cockroach debug ballast` [command](cockroach-commands.html) creates a large, unused file that you can place in a node's storage directory. In the case that a node runs out of disk space and shuts down, you can delete the ballast file to free up enough space to be able to restart the node.

- Do not run `cockroach debug ballast` with a unix `root` user. Doing so brings the risk of mistakenly affecting system directories or files.
-  `cockroach debug ballast` now refuses to overwrite the target ballast file if it already exists. This change is intended to prevent mistaken uses of the `ballast` command. Consider adding an `rm` command to scripts that integrate `cockroach debug ballast`, or provide a new file name every time and then remove the old file.
- In addition to placing a ballast file in each node's storage directory, it is important to actively [monitor remaining disk space](monitoring-and-alerting.html#events-to-alert-on).
- Ballast files may be created in many ways, including the standard `dd` command. `cockroach debug ballast` uses the `fallocate` system call when available, so it will be faster than `dd`.

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Synopsis

Create a ballast file:

~~~ shell
$ cockroach debug ballast [path to ballast file] [flags]
~~~

View help:

~~~ shell
$ cockroach debug ballast --help
~~~

## Flags

Flag | Description
-----|-----------
`--size`<br>`-z` | The amount of space to fill, or to leave available, in a node's storage directory via a ballast file. Positive values equal the size of the ballast file. Negative values equal the amount of space to leave after creating the ballast file. This can be a percentage (notated as a decimal or with %) or any bytes-based unit, for example:<br><br>`--size=1000000000 ----> 1000000000 bytes`<br>`--size=1GiB ----> 1073741824 bytes`<br>`--size=5% ----> 5% of available space`<br>`--size=0.05 ----> 5% of available space`<br>`--size=.05 ----> 5% of available space`<br><br>**Default:** `1GB`

## Examples

### Create a 1GB ballast file (default)

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug ballast cockroach-data/ballast.txt
~~~

### Create a ballast file of a different size

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug ballast cockroach-data/ballast.txt --size=2GB
~~~

## See also

- [`cockroach` Commands Overview](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Production Checklist](recommended-production-settings.html)
