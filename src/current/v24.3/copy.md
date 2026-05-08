---
title: COPY
summary: Copy data from a third-party client to a CockroachDB table, or export data in a PostgreSQL wire-compatible format.
toc: true
docs_area: reference.sql
---

The `COPY ... FROM` statement copies data from [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) or other [third party clients]({% link {{ page.version.version }}/install-client-drivers.md %}) to tables in your cluster. The `COPY ... TO` statement allows you to export a table or arbitrary query in a text or CSV format.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/copy.html %}
</div>

### Parameters

Parameter | Description
-----------|-------------
`table_name` | The name of the table to which to copy data.
`opt_column_list` | The column name, or list of column names, to which to copy data.
`WITH copy_options` | Optionally specify one or more [copy options](#options).
`query` | A [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}), [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`UPDATE`]({% link {{ page.version.version }}/update.md %}), [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}), or [`DELETE`]({% link {{ page.version.version }}/delete.md %}) statement for which to copy results.

### Options

Option | Description
-----------|-------------
`DELIMITER 'value'` |  The value that delimits the rows of input data, passed as a string.
`NULL 'value'` |  The string that represents a `NULL` value in the input data.
`BINARY` | Copy data `FROM` binary format. If `BINARY` is specified, no other format can be specified.<br>If no format is specified, CockroachDB copies in plaintext format.
`CSV` |  Copy data `FROM` CSV format, or copy data `TO` CSV format. If `CSV` is specified, no other format can be specified.<br>If no format is specified, CockroachDB copies in plaintext format.
`ESCAPE` | Specify an escape character for quoting the fields in CSV data.
`HEADER` | Specify that CockroachDB should skip the header in CSV data (first line of input).

## Required privileges

Only members of the `admin` role can run `COPY` statements. By default, the `root` user belongs to the `admin` role.

## Unsupported syntax

{% include {{ page.version.version }}/known-limitations/copy-syntax.md %}

## Examples

To run the examples, use [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with the [`movr` database]({% link {{ page.version.version }}/movr.md %}) preloaded.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo
~~~

### Copy tab-delimited data to CockroachDB

1. Start copying data to the `users` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    COPY users FROM STDIN;
    ~~~

1. You will see the following prompt:

    ~~~
    Enter data to be copied followed by a newline.
    End with a backslash and a period on a line by itself, or an EOF signal.
    ~~~

1. Enter some tab-delimited data to copy to the table:

    {{site.data.alerts.callout_danger}}
    Before you input the following rows, ensure the delimiters are tab characters. They may have been converted to spaces by the browser.
    {{site.data.alerts.end}}

    ~~~
    8a3d70a3-d70a-4000-8000-00000000001d  seattle Hannah  '400 Broad St'  0987654321
    ~~~

    ~~~
    9eb851eb-851e-4800-8000-00000000001e  new york  Carl  '53 W 23rd St'  5678901234
    ~~~

1. Mark the end of data with `\.` on its own line:

    ~~~
    \.
    ~~~

    ~~~
    COPY 2
    ~~~

1. Query the `users` table for the rows that you just inserted:

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

### Copy CSV-delimited data to CockroachDB

You can copy CSV data into CockroachDB using the following methods:

- [Copy CSV-delimited data from `stdin`](#copy-csv-delimited-data-from-stdin)
- [Copy CSV-delimited data from `stdin` with an escape character](#copy-csv-delimited-data-from-stdin-with-an-escape-character)
- [Copy CSV-delimited data from `stdin` with a header](#copy-csv-delimited-data-from-stdin-with-a-header)
- [Copy CSV-delimited data from `stdin` with hex-encoded byte array data](#copy-csv-delimited-data-from-stdin-with-hex-encoded-byte-array-data)

#### Copy CSV-delimited data from `stdin`

1. Create a new table that you will load with CSV-formatted data:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE IF NOT EXISTS setecastronomy (name STRING, phrase STRING);
    ~~~

1. Start copying data to the `setecastronomy` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    COPY setecastronomy FROM STDIN WITH CSV;
    ~~~

    You will see the following prompt:

    ~~~
    Enter data to be copied followed by a newline.
    End with a backslash and a period on a line by itself, or an EOF signal.
    ~~~

1. Enter some CSV-delimited data to copy to the table:

    {% include_cached copy-clipboard.html %}
    ~~~
    "My name is Werner Brandes","My voice is my passport"
    ~~~

1. Mark the end of data with `\.` on its own line:

    {% include_cached copy-clipboard.html %}
    ~~~
    \.
    ~~~

    ~~~
    COPY 1
    ~~~

1. View the data in the `setecastronomy` table:

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

#### Copy CSV-delimited data from `stdin` with an escape character

1. Create a new table that you will load with CSV-formatted data:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE IF NOT EXISTS setecastronomy (name STRING, phrase STRING);
    ~~~

1. Start copying data to the `setecastronomy` table, specifying an escape character for quoting the fields:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    COPY setecastronomy FROM STDIN WITH CSV DELIMITER ',' ESCAPE '\';
    ~~~

    You will see the following prompt:

    ~~~
    Enter data to be copied followed by a newline.
    End with a backslash and a period on a line by itself, or an EOF signal.
    ~~~

1. Enter some CSV-delimited data to copy to the table:

    {% include_cached copy-clipboard.html %}
    ~~~
    "My name is Werner Brandes","\"My\" \"voice\" \"is\" \"my\" \"passport\""
    ~~~

1. Mark the end of data with `\.` on its own line:

    {% include_cached copy-clipboard.html %}
    ~~~
    \.
    ~~~

    ~~~
    COPY 1
    ~~~

1. View the data in the `setecastronomy` table:

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

#### Copy CSV-delimited data from `stdin` with a header

1. Create a new table that you will load with CSV-formatted data:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE IF NOT EXISTS setecastronomy (name STRING, phrase STRING);
    ~~~

1. Start copying data to the `setecastronomy` table, specifying that CockroachDB should skip the header (first line of CSV input):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    COPY setecastronomy FROM STDIN WITH CSV HEADER;
    ~~~

1. Enter the data, including the header line:

    {% include_cached copy-clipboard.html %}
    ~~~
    "name","phrase"
    "Hi, my name is Werner Brandes","My voice is my passport; verify me"
    ~~~

1. Mark the end of data with `\.` on its own line:

    {% include_cached copy-clipboard.html %}
    ~~~
    \.
    ~~~

    ~~~
    COPY 1
    ~~~

1. View the data in the `setecastronomy` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM setecastronomy;
    ~~~

    ~~~
                  name              |               phrase
    --------------------------------+-------------------------------------
      My name is Werner Brandes     | My voice is my passport
      My name is Werner Brandes     | "My" "voice" "is" "my" "passport"
      Hi, my name is Werner Brandes | My voice is my passport; verify me
    (3 rows)
    ~~~

#### Copy CSV-delimited data from `stdin` with hex-encoded byte array data

1. Create a new table that you will load with CSV-formatted data:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE IF NOT EXISTS mybytes(a INT PRIMARY KEY, b BYTEA);
    ~~~

1. Set the `bytea_output` [session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) to specify that CockroachDB should ingest hex-encoded byte array data:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET bytea_output = 'escape';
    ~~~

1. Start copying data to the `mybytes` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    COPY mybytes FROM STDIN WITH CSV;
    ~~~

1. Enter some CSV-delimited data to copy to the table:

    {% include_cached copy-clipboard.html %}
    ~~~
    1,X'6869
    2,x'6869
    3,"\x6869"
    4,\x6869
    ~~~

1. Mark the end of data with `\.` on its own line:

    {% include_cached copy-clipboard.html %}
    ~~~
    \.
    ~~~

    ~~~
    COPY 4
    ~~~

1. View the data in the `mybytes` table:

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

### Copy data to `stdout` in CSV format

1. Start a temporary, in-memory cluster with the [`movr`]({% link {{ page.version.version }}/movr.md %}) sample dataset preloaded:

1. Copy five rows from the `users` table to `stdout`, specifying the `CSV` [option](#options):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    COPY (SELECT * FROM users LIMIT 5) TO STDOUT WITH CSV;
    ~~~

    ~~~
    ae147ae1-47ae-4800-8000-000000000022,amsterdam,Christine Crosby,10563 Mcfarland Burg Apt. 34,1007823073
    b3333333-3333-4000-8000-000000000023,amsterdam,Natalie Barnes,58875 Monique Port,4777504042
    b851eb85-1eb8-4000-8000-000000000024,amsterdam,Brenda Meyer,82208 Jamie Track Suite 57,3209048436
    bd70a3d7-0a3d-4000-8000-000000000025,amsterdam,Jose Nelson,31068 Mark Mall,2715842506
    c28f5c28-f5c2-4000-8000-000000000026,amsterdam,Anna Bennett,80284 Jeffery Courts,1695553015
    ~~~

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [`EXPORT`]({% link {{ page.version.version }}/export.md %})
- [Install a Driver or ORM Framework]({% link {{ page.version.version }}/install-client-drivers.md %})
{% comment %}
- [Migrate from PostgreSQL]({% link molt/migrate-to-cockroachdb.md %})
{% endcomment %}