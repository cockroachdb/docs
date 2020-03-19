---
title: cockroach nodelocal uplpad
summary: Upload a file to the gateway node's local file system.
toc: true
---

<span class="version-tag">New in v20.1:</span> The `cockroach nodelocal upload` [command](cockroach-commands.html)

Probably some explanation of how it works is helpful, so that if they SSH they aren’t totally freaked if they don’t see the file there

Also that it’s on ONE node, not all


## Synopsis

Upload a file:

~~~ shell
$ cockroach nodelocal upload <location/of/file> <destination/of/file> [flags]
~~~

View help:

~~~ shell
$ cockroach nodelocal upload --help
~~~

## Flags

Flag | Description
-----|------------
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--echo-sql`     | Reveal the SQL statements sent implicitly by the command-line utility.
`--host`         | The server host and port number to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost:26257`
`--insecure`     | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--url` | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### Upload a file from local

default node 1

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload --url
~~~

### Upload a file from the cloud

default node 1, from aws

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload --url
~~~

### Upload a file to a different node

To do different node, change the connection string with the --url option or --host option

Seems like only reason to use --url is to select the DB or the user? Some of this is redundant

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload --url
~~~

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Import Data](import-data.html)
- [`IMPORT`](import.html)
