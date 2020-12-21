---
title: cockroach nodelocal upload
summary: Upload a file to a node's local file system.
toc: true
---

 The `cockroach nodelocal upload` [command](cockroach-commands.html) uploads a file to the external IO directory on a node's (the gateway node, by default) local file system.

This command takes in a source file to upload and a destination filename. It will then use a SQL connection to upload the file to the node's local file system, at `externalIODir/destination/filename`.

{{site.data.alerts.callout_info}}
The source file is only uploaded to one node, not all of the nodes.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/userfile.md %}

## Required privileges

Only members of the `admin` role can run `cockroach nodelocal upload`. By default, the `root` user belongs to the `admin` role.

## Considerations

The [`--external-io`](cockroach-start.html#general) flag on the node you're uploading to **cannot** be set to `disabled`.

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

 Flag            | Description
-----------------+-----------------------------------------------------
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--echo-sql`     | Reveal the SQL statements sent implicitly by the command-line utility.
`--host`         | The server host and port number to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost:26257`
`--insecure`     | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--url`          | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### Upload a file

To upload a file to the default node (i.e., the gateway node):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload ./grants.csv test/grants.csv --certs-dir=certs
~~~

~~~
successfully uploaded to nodelocal://1/test/grants.csv
~~~

Then, you can use the file to [`IMPORT`](import.html) or [`IMPORT INTO`](import-into.html) data.

### Upload a file to a specific node

To upload a file to a specific node (e.g., node 2), use the `--host` flag:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload ./grants.csv grants.csv --host=localhost:26259 --insecure
~~~

~~~
successfully uploaded to nodelocal://2/grants.csv
~~~

Or, use the `--url` flag:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload ./grants.csv grants.csv --url=postgresql://root@localhost:26258?sslmode=disable --insecure
~~~

~~~
successfully uploaded to nodelocal://3/grants.csv
~~~

Then, you can use the file to [`IMPORT`](import.html) or [`IMPORT INTO`](import-into.html) data.

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Import Data](import-data.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
