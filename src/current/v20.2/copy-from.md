---
title: COPY FROM
summary: Copy data from a third-party client to CockroachDB.
toc: true
---

The `COPY FROM` statement copies data from third-party clients to tables in your cluster.

{{site.data.alerts.callout_info}}
CockroachDB currently only supports `COPY FROM` statements issued from third-party clients, for compatibility with PostgreSQL drivers and ORMs. `COPY FROM` statements cannot be issued from the [`cockroach` SQL shell](cockroach-sql.html). To copy data from a file to your cluster, we recommend using an [`IMPORT`](import.html) statement instead.
{{site.data.alerts.end}}

## Syntax

~~~
COPY table_name [( <colnames...> )] FROM STDIN [WITH <option> = <value>]
~~~

### Parameters

Parameter | Description
-----------|-------------
`table_name` | The name of the table to which to copy data.
`<colnames>` | The name(s) of the column(s) to which to copy data.
`WITH <option> = value` | Specify one or more [copy options](#options).

### Options

Option | Description
-----------|-------------
`BINARY` | Copy data from binary format.<br>If not specified, CockroachDB copies in plaintext format. Note that CSV format is not yet supported.

## Required privileges

Only members of the `admin` role can run `COPY` statements. By default, the `root` user belongs to the `admin` role.

## Known limitations

### `COPY FROM` statements are not supported in the CockroachDB SQL shell

{% include {{ page.version.version }}/known-limitations/copy-from-clients.md %}

### `COPY` syntax not supported by CockroachDB

{% include {{ page.version.version }}/known-limitations/copy-syntax.md %}

## Example

The following example copies data from the PostgreSQL [`psql` client](https://www.postgresql.org/docs/current/app-psql.html) into a demo CockroachDB cluster. To follow along, make sure that you have [PostgreSQL](https://www.postgresql.org/download/) installed.

Run [`cockroach demo`](cockroach-demo.html) to start a temporary, in-memory cluster with the [`movr` database](movr.html) preloaded:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

Take note of the `(sql/tcp)` connection string listed under `Connection parameters` in the welcome message of the demo cluster's SQL shell:

~~~
# Connection parameters:
...
#   (sql/tcp) postgres://root:admin@127.0.0.1:65207?sslmode=require
~~~

Open a new terminal window, and connect to your demo cluster with `psql`, using the connection string provided for the demo cluster, with the `movr` database specified:

{% include copy-clipboard.html %}
~~~ shell
$ psql postgres://root:admin@127.0.0.1:65207/movr?sslmode=require
~~~

In the `psql` shell, run the following command to start copying data from `psql` to the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> movr=# COPY users FROM STDIN;
~~~

The following prompt should appear:

~~~
Enter data to be copied followed by a newline.
End with a backslash and a period on a line by itself, or an EOF signal.
~~~

Enter some tab-delimited data that you want copied to the `users` table:

{% include copy-clipboard.html %}
~~~
>> 8a3d70a3-d70a-4000-8000-00000000001d seattle	Hannah	400 Broad St	0987654321
>> 9eb851eb-851e-4800-8000-00000000001e	new york	Carl	53 W 23rd St	5678901234
>> \.
~~~

~~~
COPY 2
~~~

In the demo cluster's shell, query the `users` table for the rows that you just inserted:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE id IN ('8a3d70a3-d70a-4000-8000-00000000001d', '9eb851eb-851e-4800-8000-00000000001e');
~~~

~~~
                   id                  |   city   |  name  |   address    | credit_card
---------------------------------------+----------+--------+--------------+--------------
  8a3d70a3-d70a-4000-8000-00000000001d | seattle  | Hannah | 400 Broad St | 0987654321
  9eb851eb-851e-4800-8000-00000000001e | new york | Carl   | 53 W 23rd St | 5678901234
(2 rows)
~~~

## See also

- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
- [`EXPORT`](export.html)
- [Migrate from Postgres](migrate-from-postgres.html)
- [Migration Overview](migration-overview.html)

