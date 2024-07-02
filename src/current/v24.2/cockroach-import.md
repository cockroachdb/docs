---
title: cockroach import
summary: The cockroach import command imports a database or table from a local dump file into a running cluster.
toc: true
docs_area: reference.cli
---

{{site.data.alerts.callout_danger}}
The statements on this page are **deprecated** as of v23.1 and will be removed in a future release. To move data into CockroachDB, use [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %}) or [`COPY FROM`]({% link {{ page.version.version }}/copy-from.md %}).
{{site.data.alerts.end}}

The `cockroach import` [command]({% link {{ page.version.version }}/cockroach-commands.md %}) imports a database or table from a local dump file into a running cluster. This command [uploads a userfile]({% link {{ page.version.version }}/cockroach-userfile-upload.md %}), imports its data, then [deletes the userfile]({% link {{ page.version.version }}/cockroach-userfile-delete.md %}). `PGDUMP` and `MYSQLDUMP` file formats are currently supported.

## Required privileges

The user must have `CREATE` [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on `defaultdb`.

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

- [`pgdump`]({% link {{ page.version.version }}/migrate-from-postgres.md %})
- [`mysqldump`]({% link {{ page.version.version }}/migrate-from-mysql.md %})

## Flags

 Flag            | Description
-----------------+-----------------------------------------------------
`--certs-dir`    | The path to the [certificate directory]({% link {{ page.version.version }}/cockroach-cert.md %}) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--insecure`     | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--user`<br>`-u` | The [SQL user]({% link {{ page.version.version }}/create-user.md %}) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
`--ignore-unsupported-statements` |  Ignore statements that are unsupported during an import from a PGDUMP file. <br/>**Default:** `false`
`--log-ignored-statements` |  Log statements that are ignored during an import from a PGDUMP file to the specified destination (i.e., [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) or [userfile storage]({% link {{ page.version.version }}/use-userfile-storage.md %}).
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

 To import a database from a `PGDUMP` file that contains unsupported SQL syntax and log the ignored statements to a [userfile]({% link {{ page.version.version }}/use-userfile-storage.md %}):

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

- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [`IMPORT`]({% link {{ page.version.version }}/import.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [Migrate from PostgreSQL]({% link {{ page.version.version }}/migrate-from-postgres.md %})
- [Migrate from MySQL]({% link {{ page.version.version }}/migrate-from-mysql.md %})
