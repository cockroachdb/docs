---
title: COPY FROM
summary: Copy data from a third-party client to CockroachDB.
toc: true
docs_area: reference.sql
---

The `COPY FROM` statement copies data from [`cockroach sql`](cockroach-sql.html) or other [third party clients](install-client-drivers.html) to tables in your cluster.

{{site.data.alerts.callout_info}}
To copy data from a file to your cluster, we recommend using an [`IMPORT`](import.html) statement instead.
{{site.data.alerts.end}}

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/copy_from.html %}
</div>

### Parameters

Parameter | Description
-----------|-------------
`table_name` | The name of the table to which to copy data.
`opt_column_list` | The column name, or list of column names, to which to copy data.
`WITH copy_options` | Optionally specify one or more [copy options](#options).

### Options

Option | Description
-----------|-------------
`DELIMITER 'value'` |  The value that delimits the rows of input data, passed as a string.
`NULL 'value'` |  The string that represents a `NULL` value in the input data.
`BINARY` | Copy data from binary format. If `BINARY` is specified, no other format can be specified.<br>If no format is specified, CockroachDB copies in plaintext format.
`CSV` |  Copy data from CSV format. If `CSV` is specified, no other format can be specified.<br>If no format is specified, CockroachDB copies in plaintext format.
`ESCAPE` | Specify an escape character for quoting the fields in CSV data.

## Required privileges

Only members of the `admin` role can run `COPY` statements. By default, the `root` user belongs to the `admin` role.

## Known limitations

### `COPY` syntax not supported by CockroachDB

{% include {{page.version.version}}/known-limitations/copy-syntax.md %}

## Examples

To run the examples, use [`cockroach demo`](cockroach-demo.html) to start a temporary, in-memory cluster with the [`movr` database](movr.html) preloaded.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo
~~~

### Copy tab delimited data

In the SQL shell, run the following command to start copying data to the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
COPY users FROM STDIN;
~~~

The following prompt should appear:

~~~
Enter data to be copied followed by a newline.
End with a backslash and a period on a line by itself, or an EOF signal.
~~~

Enter some tab-delimited data that you want copied to the `users` table.

{{site.data.alerts.callout_info}}
You may need to edit the following rows after copying them to make sure the delimiters are tab characters.
{{site.data.alerts.end}}

~~~
8a3d70a3-d70a-4000-8000-00000000001d	seattle	Hannah	'400 Broad St'	0987654321
~~~

~~~
9eb851eb-851e-4800-8000-00000000001e	new york	Carl	'53 W 23rd St'	5678901234
~~~

~~~
\.
~~~

~~~
COPY 2
~~~

In the SQL shell, query the `users` table for the rows that you just inserted:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM users WHERE id IN ('8a3d70a3-d70a-4000-8000-00000000001d', '9eb851eb-851e-4800-8000-00000000001e');
~~~

~~~
                  id                  |   city   |  name  |    address     | credit_card
--------------------------------------+----------+--------+----------------+-------------
 9eb851eb-851e-4800-8000-00000000001e | new york | Carl   | '53 W 23rd St' | 5678901234
 8a3d70a3-d70a-4000-8000-00000000001d | seattle  | Hannah | '400 Broad St' | 0987654321
(2 rows)
~~~

### Copy CSV delimited data

You can copy CSV data into CockroachDB using the following methods:

- [Copy CSV delimited data from stdin](#copy-csv-delimited-data-from-stdin)
- [Copy CSV delimited data from stdin with an escape character](#copy-csv-delimited-data-from-stdin-with-an-escape-character)
- [Copy CSV delimited data from stdin with hex encoded byte array data](#copy-csv-delimited-data-from-stdin-with-hex-encoded-byte-array-data)

#### Copy CSV delimited data from stdin

Run the following SQL statement to create a new table that you will load with CSV formatted data:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS setecastronomy (name STRING, phrase STRING);
~~~

Run the following command to start copying data to the table:

{% include_cached copy-clipboard.html %}
~~~ sql
COPY setecastronomy FROM STDIN WITH CSV;
~~~

You will see the following prompt:

~~~
Enter data to be copied followed by a newline.
End with a backslash and a period on a line by itself, or an EOF signal.
~~~

Enter the data, followed by a backslash and period on a line by itself:

{% include_cached copy-clipboard.html %}
~~~
"My name is Werner Brandes","My voice is my passport"
~~~

{% include_cached copy-clipboard.html %}
~~~
\.
~~~

~~~
COPY 1
~~~

To view the data, enter the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM setecastronomy;
~~~

~~~
            name            |              phrase
----------------------------+------------------------------------
  My name is Werner Brandes | My voice is my passport
(1 row)
~~~

#### Copy CSV delimited data from stdin with an escape character

Run the following SQL statement to create a new table that you will load with CSV formatted data:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS setecastronomy (name STRING, phrase STRING);
~~~

To copy CSV data into CockroachDB and specify an escape character for quoting the fields, enter the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
COPY setecastronomy FROM STDIN WITH CSV DELIMITER ',' ESCAPE '\';
~~~

You will see the following prompt:

~~~
Enter data to be copied followed by a newline.
End with a backslash and a period on a line by itself, or an EOF signal.
~~~

Enter the data, followed by a backslash and period on a line by itself:

{% include_cached copy-clipboard.html %}
~~~
"My name is Werner Brandes","\"My\" \"voice\" \"is\" \"my\" \"passport\""
~~~

{% include_cached copy-clipboard.html %}
~~~
\.
~~~

~~~
COPY 1
~~~

To view the data, enter the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM setecastronomy;
~~~

~~~
            name            |              phrase
----------------------------+------------------------------------
  My name is Werner Brandes | My voice is my passport
  My name is Werner Brandes | "My" "voice" "is" "my" "passport"
(2 rows)
~~~

#### Copy CSV delimited data from stdin with hex encoded byte array data

To copy CSV data into CockroachDB and specify that CockroachDB should ingest hex encoded byte array data, enter the following statements:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS mybytes(a INT PRIMARY KEY, b BYTEA);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
set bytea_output = 'escape';
~~~

To import the data, enter the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
COPY mybytes FROM STDIN WITH CSV;
~~~

Enter the data, followed by a backslash and period on a line by itself:

{% include_cached copy-clipboard.html %}
~~~
1,X'6869
2,x'6869
3,"\x6869"
4,\x6869
~~~

{% include_cached copy-clipboard.html %}
~~~
\.
~~~

~~~
COPY 4
~~~

To view the data, enter the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM mybytes;
~~~

~~~
  a |   b
----+---------
  1 | X'6869
  2 | x'6869
  3 | hi
  4 | hi
(4 rows)
~~~

## See also

- [`IMPORT`](import.html)
- [`IMPORT INTO`](import-into.html)
- [`EXPORT`](export.html)
- [Install a Driver or ORM Framework](install-client-drivers.html)
- [Migrate from PostgreSQL](migrate-from-postgres.html)
- [Migration Overview](migration-overview.html)
