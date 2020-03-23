---
title: cockroach nodelocal upload
summary: Upload a file to a node's local file system.
toc: true
---

<span class="version-tag">New in v20.1:</span> The `cockroach nodelocal upload` [command](cockroach-commands.html) uploads a file to a node's (by default, node 1) local file system. This is done through a SQL connection.

Probably some explanation of how it works is helpful, so that if they SSH they aren’t totally freaked if they don’t see the file there

When a file is upload, it is only uploaded to one node, not all of the nodes.


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

To upload a file to the default node (i.e., node 1):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload ./grants.txt test/grants.txt --certs-dir=certs
~~~

~~~
successfully uploaded to nodelocal://1/test/grants.txt
~~~

### Upload a file to a different node

To upload a file to a specific node (e.g., node 2), use the `--host` flag:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload ./grants.txt grants.txt --host=localhost:26259 --insecure
~~~

~~~
successfully uploaded to nodelocal://2/grants.txt
~~~

Or, use the `--url` flag:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach nodelocal upload ./grants.txt grants.txt --url=postgresql://root@localhost:26258?sslmode=disable --insecure
~~~

~~~
successfully uploaded to nodelocal://3/grants.txt
~~~

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Import Data](import-data.html)
- [`IMPORT`](import.html)
