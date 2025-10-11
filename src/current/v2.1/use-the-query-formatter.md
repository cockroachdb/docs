---
title: Reformat SQL Queries for Enhanced Clarity
summary: Use cockroach sqlfmt to enhance the text layout of a SQL query.
toc: true
---

<span class="version-tag">New in v2.1:</span> The `cockroach sqlfmt`
[command](cockroach-commands.html) changes the textual formatting of
one or more SQL queries. It recognizes all SQL extensions supported by
CockroachDB.

A [web interface to this feature](https://sqlfum.pt/) is also available.

{% include {{ page.version.version }}/misc/experimental-warning.md %}

## Synopsis

~~~ shell
# Use the query formatter interactively:
$ cockroach sqlfmt <flags>

<sql stmt>

CTRL+D

# Reformat a SQL query given on the command line:
$ cockroach sqlfmt <flags> -e "<sql stmt>"

# Reformat a SQL query already stored in a file:
$ cat query.sql | cockroach sqlfmt <flags>
~~~

## Flags

The `sqlfmt` command supports the following flags.

Flag | Description | Default value
-----|------|----
`--execute`<br>`-e` | Reformat the given SQL query, without reading from standard input. | N/A
`--print-width` | Desired column width of the output. | 80
`--tab-width` | Number of spaces occupied by a tab character on the final display device. | 4
`--use-spaces` | Always use space characters for formatting; avoid tab characters. | Use tabs.
`--align` | Use vertical alignment during formatting. | Do not align vertically.
`--no-simplify` | Avoid removing optional grouping parentheses during formatting. | Remove unnecessary grouping parentheses.

## Examples

### Reformat a query with constrained column width

Using the interactive query formatter, output with the default column width (80 columns):

1. Start the interactive query formatter:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sqlfmt
    ~~~

2. Press **Enter**.

3. Run the query:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE animals (id INT PRIMARY KEY DEFAULT unique_rowid(), name STRING);
    ~~~
4. Press **CTRL+D**.

    ~~~ sql
    CREATE TABLE animals (
            id INT PRIMARY KEY DEFAULT unique_rowid(),
            name STRING
    )
    ~~~

Using the command line, output with the column width set to `40`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sqlfmt --print-width 40 -e "CREATE TABLE animals (id INT PRIMARY KEY DEFAULT unique_rowid(), name STRING);"
~~~

~~~ sql
CREATE TABLE animals (
        id
                INT
                PRIMARY KEY
                DEFAULT unique_rowid(),
        name STRING
)
~~~

### Reformat a query with vertical alignment

Output with the default vertical alignment:

~~~ shell
$ cockroach sqlfmt -e "SELECT winner, round(length / (60 * 5)) AS counter FROM players WHERE build = $1 AND (hero = $2 OR region = $3);"
~~~

~~~ sql
SELECT
winner, round(length / (60 * 5)) AS counter
FROM
players
WHERE
build = $1 AND (hero = $2 OR region = $3)
~~~

Output with vertical alignment:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sqlfmt --align -e "SELECT winner, round(length / (60 * 5)) AS counter FROM players WHERE build = $1 AND (hero = $2 OR region = $3);"
~~~

~~~ sql
SELECT winner, round(length / (60 * 5)) AS counter
  FROM players
 WHERE build = $1 AND (hero = $2 OR region = $3);
~~~

### Reformat a query with simplification of parentheses

Output with the default simplification of parentheses:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sqlfmt -e "SELECT (1 * 2) + 3, (1 + 2) * 3;"
~~~

~~~ sql
SELECT 1 * 2 + 3, (1 + 2) * 3
~~~

Output with no simplification of parentheses:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sqlfmt --no-simplify -e "SELECT (1 * 2) + 3, (1 + 2) * 3;"
~~~

~~~ sql
SELECT (1 * 2) + 3, (1 + 2) * 3
~~~

## See also

- [Sequel Fumpt](https://sqlfum.pt/)
- [`cockroach demo`](cockroach-demo.html)
- [`cockroach sql`](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
