---
title: Reformat SQL Queries for Enhanced Clarity
summary: Use cockroach sqlfmt to enhance the text layout of a SQL query.
toc: true
---

<span class="version-tag">New in v2.1:</span> The `cockroach sqlfmt`
[command](cockroach-commands.html) changes the textual formatting of
one or more SQL queries. It recognizes all SQL extensions supported by
CockroachDB.

A [web interface to this feature]((https://sqlfum.pt/) is also available.

{{site.data.alerts.callout_info}}
This is an experimental feature. The interface of
this command may change in a later release without prior notice.
{{site.data.alerts.end}}

## Synopsis

~~~ shell
# Start the query formatter interactively:
$ cockroach sqlfmt <flags>

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
`--use-spaces` | Always use space characters for formatting; avoid tab characters. | Use tabs
`--align` | Use vertical alignment during formatting. | Do not align vertically.
`--no-simplify` | Avoid removing optional grouping parentheses during formatting. | Remove unnecessary grouping parentheses.

## Examples

### Reformat a query with constrained column width

Using the interactive query formatter:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE animals (id INT PRIMARY KEY DEFAULT unique_rowid(), name STRING);
~~~

Example output with the default column width (80 columns):

~~~ sql
CREATE TABLE animals (
        id INT PRIMARY KEY DEFAULT unique_rowid(),
        name STRING
)
~~~

Using the command line with `--print-width 40`, the example output is:

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

Using the interactive query formatter:

{% include copy-clipboard.html %}
~~~ sql
> SELECT winner,
round(length / (60 * 5)) AS counter FROM
players WHERE build = $1 AND (hero = $2 OR region = $3);
~~~

The example default output:

~~~ sql
SELECT
	winner, round(length / (60 * 5)) AS counter
FROM
	players
WHERE
	build = $1 AND (hero = $2 OR region = $3);
~~~

Using the command line with `--align`, the example output is:

~~~ sql
SELECT winner, round(length / (60 * 5)) AS counter
  FROM players
 WHERE build = $1 AND (hero = $2 OR region = $3);
~~~

### Reformat a query with simplification of parentheses

Using the interactive query formatter:

{% include copy-clipboard.html %}
~~~ sql
> SELECT (1 * 2) + 3, (1 + 2) * 3;
~~~

Example default output:

~~~ sql
SELECT 1 * 2 + 3, (1 + 2) * 3
~~~

Using the command line with `--no-simplify`, the example output is:

~~~ sql
SELECT (1 * 2) + 3, (1 + 2) * 3
~~~

## See also

- [Sequel Fumpt](https://sqlfum.pt/)
- [`cockroach demo`](cockroach-demo.html)
- [`cockroach sql`](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)
