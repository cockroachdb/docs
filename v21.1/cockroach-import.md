---
title: cockroach import
summary: Import a local file to a cluster
toc: true
---

<span class="version-tag">New in v21.1:</span> The `cockroach import` [command](cockroach-commands.html) imports a database or table from a local dump file into a running cluster. `PGDUMP` and `MYSQLDUMP` file formats are currently supported.

Behind the scenes, this command [uploads a userfile](cockroach-userfile-upload.html), imports its data, then [deletes the userfile](cockroach-userfile-delete.html).

{{site.data.alerts.callout_info}}
We recommend using `cockroach import` for quick imports from your client (about 15MB or smaller). For larger imports, you can use a SQL [IMPORT](import.html) statement.
{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `cockroach import`. By default, the `root` user belongs to the `admin` role.

## Synopsis

Import a database:

~~~ shell
$ cockroach import db <format> <location/of/file> [flags]
~~~

Import a table:

~~~ shell
$ cockroach import table <table_name> <format> <location/of/file> [flags]
~~~

View help:

~~~ shell
$ cockroach import --help
~~~

## Flags

 Flag            | Description
-----------------+-----------------------------------------------------
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--insecure`     | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`

## Examples

### Import a database

To import a database from a local file:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach import db mysqldump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs
~~~

~~~
successfully imported mysqldump file /Users/maxroach/Desktop/test-db.sql
~~~

### Import a table

To import a table from a local file:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach import table test_table pgdump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs
~~~

~~~
successfully imported table test_table from pgdump file /Users/maxroach/Desktop/test-db.sql
~~~

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
- [Migrate from Postgres](migrate-from-postgres.html)
- [Migrate from MySQL](migrate-from-mysql.html)
