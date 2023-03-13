---
title: cockroach import
summary: The cockroach import command imports a database or table from a local dump file into a running cluster.
toc: true
docs_area: reference.cli
---

 The `cockroach import` [command](cockroach-commands.html) imports a database or table from a local dump file into a running cluster. This command [uploads a userfile](cockroach-userfile-upload.html), imports its data, then [deletes the userfile](cockroach-userfile-delete.html). `PGDUMP` and `MYSQLDUMP` file formats are currently supported.

{{site.data.alerts.callout_info}}
We recommend using `cockroach import` for quick imports from your client (about 15MB or smaller). For larger imports, use the [IMPORT](import.html) statement.
{{site.data.alerts.end}}

## Required privileges

The user must have `CREATE` [privileges](security-reference/authorization.html#managing-privileges) on `defaultdb`.

## Synopsis

Import a database:

~~~ shell
$ cockroach import db <format> <location/of/file> <flags>
~~~

Import a table:

~~~ shell
$ cockroach import table <table_name> <format> <location/of/file> <flags>
~~~

View help:

~~~ shell
$ cockroach import --help
~~~

## Supported Formats

- [`pgdump`](migrate-from-postgres.html#step-1-dump-the-postgresql-database)
- [`mysqldump`](migrate-from-mysql.html#step-1-dump-the-mysql-database)

## Flags

 Flag            | Description
-----------------+-----------------------------------------------------
`--certs-dir`    | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--insecure`     | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--user`<br>`-u` | The [SQL user](create-user.html) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
`--ignore-unsupported-statements` |  Ignore statements that are unsupported during an import from a PGDUMP file. <br/>**Default:** `false`
`--log-ignored-statements` |  Log statements that are ignored during an import from a PGDUMP file to the specified destination (i.e., [cloud storage](use-cloud-storage.html) or [userfile storage](use-userfile-storage.html).
`--row-limit=` |  The number of rows to import for each table during a PGDUMP or MYSQLDUMP import. <br/> This can be used to check schema and data correctness without running the entire import. <br/>**Default:** `0`

## Examples

### Import a database

To import a database from a local file:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach import db mysqldump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs
~~~

~~~
successfully imported mysqldump file /Users/maxroach/Desktop/test-db.sql
~~~

### Import a table

To import a table from a local file:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach import table test_table pgdump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs
~~~

~~~
successfully imported table test_table from pgdump file /Users/maxroach/Desktop/test-db.sql
~~~

### Import a database with unsupported SQL syntax and log all unsupported statements

 To import a database from a `PGDUMP` file that contains unsupported SQL syntax and log the ignored statements to a [userfile](use-userfile-storage.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach import db pgdump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs --ignore-unsupported-statements=true --log-ignored-statements='userfile://defaultdb.public.userfiles_root/unsupported-statements.log'
~~~

~~~
successfully imported table test_table from pgdump file /Users/maxroach/Desktop/test-db.sql
~~~

### Import a limited number of rows from a dump file

 To limit the number of rows imported from a dump file:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach import table test_table pgdump /Users/maxroach/Desktop/test-db.sql --certs-dir=certs --row-limit='50'
~~~

~~~
successfully imported table test_table from pgdump file /Users/maxroach/Desktop/test-db.sql
~~~

## See also

- [`cockroach` Commands Overview](cockroach-commands.html)
- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
- [Migrate from PostgreSQL](migrate-from-postgres.html)
- [Migrate from MySQL](migrate-from-mysql.html)
