---
title: Table Expressions
summary: Table expressions define a data source in selection clauses.
toc: true
---

Table expressions define a data source in the `FROM` sub-clause of
[simple `SELECT` clauses](select-clause.html), or as parameter to
[`TABLE`](selection-queries.html#table-clause).

[SQL Joins](joins.html) are a particular kind of table
expression.


## Synopsis

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/table_ref.html %}</div>
<div markdown="1"></div>

## Parameters

Parameter | Description
----------|------------
`table_name` | A [table or view name](#table-or-view-names).
`table_alias_name` | A name to use in an [aliased table expression](#aliased-table-expressions).
`name` | One or more aliases for the column names, to use in an [aliased table expression](#aliased-table-expressions).
`scan_parameters` | Optional syntax to [force index selection](#force-index-selection).
`func_application` | [Results from a function](#results-from-a-function).
`explainable_stmt` | [Use the result rows](#using-the-output-of-other-statements) of an [explainable statement](explain.html#explainable-statements).
`select_stmt` | A [selection query](selection-queries.html) to use as [subquery](#subqueries-as-table-expressions).
`joined_table` | A [join expression](joins.html).

## Table Expressions Language

The synopsis above really defines a mini-language to construct
complex table expressions from simpler parts.

Construct | Description | Examples
----------|-------------|------------
`table_name [@ scan_parameters]` | [Access a table or view](#access-a-table-or-view). | `accounts`, `accounts@name_idx`
`function_name ( exprs ... )` | Generate tabular data using a [scalar function](#scalar-function-as-data-source) or [table generator function](#table-generator-functions). | `sin(1.2)`, `generate_series(1,10)`
`<table expr> [AS] name [( name [, ...] )]` | [Rename a table and optionally columns](#aliased-table-expressions). | `accounts a`, `accounts AS a`, `accounts AS a(id, b)`
`<table expr> WITH ORDINALITY` | [Enumerate the result rows](#ordinality-annotation). | `accounts WITH ORDINALITY`
`<table expr> JOIN <table expr> ON ...` | [Join expression](joins.html). | `orders o JOIN customers c ON o.customer_id = c.id`
`(... subquery ...)` | A [selection query](selection-queries.html) used as [subquery](#subqueries-as-table-expressions). | `(SELECT * FROM customers c)`
`[... statement ...]` | [Use the result rows](#using-the-output-of-other-statements) of an [explainable statement](explain.html#explainable-statements).<br><br>This is a CockroachDB extension. | `[SHOW COLUMNS FROM accounts]`

The following sections provide details on each of these options.

## Table Expressions That Generate Data

The following sections describe primary table expressions that produce
data.

### Access a Table or View

#### Table or View Names

Syntax:

~~~
identifier
identifier.identifier
identifier.identifier.identifier
~~~

A single SQL identifier in a table expression context designates
the contents of the table, [view](views.html), or sequence with that name
in the current database, as configured by [`SET DATABASE`](set-vars.html).

<span class="version-tag">Changed in v2.0:</span> If the name is composed of two or more identifiers, [name resolution](sql-name-resolution.html) rules apply.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users; -- uses table `users` in the current database
> SELECT * FROM mydb.users; -- uses table `users` in database `mydb`
~~~

#### Force Index Selection

By using the explicit index annotation, you can override [CockroachDB's index selection](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/) and use a specific [index](indexes.html) when reading from a named table.

{{site.data.alerts.callout_info}}Index selection can impact performance, but does not change the result of a query.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM accounts;
~~~
~~~
+----------+-------------------+--------+-----+--------+-----------+---------+----------+
|  Table   |       Name        | Unique | Seq | Column | Direction | Storing | Implicit |
+----------+-------------------+--------+-----+--------+-----------+---------+----------+
| accounts | primary           | true   |   1 | id     | ASC       | false   | false    |
| accounts | accounts_name_idx | false  |   1 | name   | ASC       | false   | false    |
| accounts | accounts_name_idx | false  |   2 | id     | ASC       | false   | true     |
+----------+-------------------+--------+-----+--------+-----------+---------+----------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name, balance
FROM accounts@accounts_name_idx
WHERE name = 'Edna Barath';
~~~
~~~
+-------------+---------+
|    name     | balance |
+-------------+---------+
| Edna Barath |     750 |
| Edna Barath |    2200 |
+-------------+---------+
~~~

### Access a Common Table Expression

A single identifier in a table expression context can refer to a
[common table expression](common-table-expressions.html) defined
earlier.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH a AS (SELECT * FROM users)
  SELECT * FROM a; -- "a" refers to "WITH a AS .."
~~~

### Results From a Function

A table expression can use the results from a function application as
a data source.

Syntax:

~~~
name ( arguments... )
~~~

The name of a function, followed by an opening parenthesis, followed
by zero or more [scalar expressions](scalar-expressions.html), followed by
a closing parenthesis.

The resolution of the function name follows the same rules as the
resolution of table names. See [Name
Resolution](sql-name-resolution.html) for more details.

#### Scalar Function as Data Source

<span class="version-tag">New in v2.0</span>

When a [function returning a single
value](scalar-expressions.html#function-calls-and-sql-special-forms) is
used as a table expression, it is interpreted as tabular data with a
single column and single row containing the function results.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM sin(3.2)
~~~
~~~
+-----------------------+
|          sin          |
+-----------------------+
| -0.058374143427580086 |
+-----------------------+
~~~

{{site.data.alerts.callout_info}}CockroachDB only supports this syntax for compatibility with PostgreSQL. The canonical syntax to evaluate <a href="scalar-expressions.html">scalar functions</a> is as a direct target of <code>SELECT</code>, for example <code>SELECT sin(3.2)</code>.{{site.data.alerts.end}}


#### Table Generator Functions

Some functions directly generate tabular data with multiple rows from
a single function application. This is also called a "set-returning
function".

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM generate_series(1, 3)
~~~
~~~
+-----------------+
| generate_series |
+-----------------+
|               1 |
|               2 |
|               3 |
+-----------------+
~~~

{{site.data.alerts.callout_info}}Currently CockroachDB only supports a small set of generator function compatible with <a href="https://www.postgresql.org/docs/9.6/static/functions-srf.html">the PostgreSQL set-generating functions of the same name</a>.{{site.data.alerts.end}}

## Operators That Extend a Table Expression

The following sections describe table expressions that change the
metadata around tabular data, or add more data, without modifying the
data of the underlying operand.

### Aliased Table Expressions

Aliased table expressions rename tables and columns temporarily in
the context of the current query.

Syntax:

~~~
<table expr> AS <name>
<table expr> AS <name>(<colname>, <colname>, ...)
~~~

In the first form, the table expression is equivalent to its left operand
with a new name for the entire table, and where columns retain their original name.

In the second form, the columns are also renamed.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT c.x FROM (SELECT COUNT(*) AS x FROM users) AS c;
> SELECT c.x FROM (SELECT COUNT(*) FROM users) AS c(x);
~~~

### Ordinality Annotation

Syntax:

~~~
<table expr> WITH ORDINALITY
~~~

Designates a data source equivalent to the table expression operand with
an extra "Ordinality" column that enumerates every row in the data source.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM (VALUES('a'),('b'),('c'));
~~~
~~~
+---------+
| column1 |
+---------+
| a       |
| b       |
| c       |
+---------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM (VALUES ('a'), ('b'), ('c')) WITH ORDINALITY;
~~~
~~~
+---------+------------+
| column1 | ordinality |
+---------+------------+
| a       |          1 |
| b       |          2 |
| c       |          3 |
+---------+------------+
~~~

{{site.data.alerts.callout_info}}<code>WITH ORDINALITY</code> necessarily prevents some optimizations of the surrounding query. Use it sparingly if performance is a concern, and always check the output of <a href="explain.html"><code>EXPLAIN</code></a> in case of doubt. {{site.data.alerts.end}}

## Join Expressions

Join expressions combine the results of two or more table expressions
based on conditions on the values of particular columns.

See [Join Expressions](joins.html) for more details.

## Using Other Queries as Table Expressions

The following sections describe how to use the results produced by
another SQL query or statement as a table expression.

### Subqueries as Table Expressions

Any [selection
query](selection-queries.html) enclosed
between parentheses can be used as a table expression, including
[simple `SELECT` clauses](select-clause.html). This is called a
"[subquery](subqueries.html)".

Syntax:

~~~
( ... subquery ... )
~~~

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT c+2                          FROM (SELECT COUNT(*) AS c FROM users);
> SELECT *                            FROM (VALUES(1), (2), (3));
> SELECT firstname || ' ' || lastname FROM (TABLE employees);
~~~

{{site.data.alerts.callout_info}}
<ul>
<li>See also <a href="subqueries.html">Subqueries</a> for more details and performance best practices.</li>
<li>To use other statements that produce data in a table expression, for example <code>SHOW</code>, use the <a href="#using-the-output-of-other-statements">square bracket notation</a>.</li>
</ul>
{{site.data.alerts.end}}

<div markdown="1"></div>

### Using the Output of Other Statements

Syntax:

~~~
[ <statement> ]
~~~

An [explainable statement](explain.html#explainable-statements)
between square brackets in a table expression context designates the
output of executing said statement.

{{site.data.alerts.callout_info}}This is a CockroachDB extension. This
syntax complements the <a
href="#subqueries-as-table-expressions">subquery syntax using
parentheses</a>, which is restricted to <a href="selection-queries.html">selection queries</a>. It was introduced to enable use of any <a href="explain.html#explainable-statements">explainable statement</a> as subquery, including <code>SHOW</code> and other non-query statements.{{site.data.alerts.end}}

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT "Field" FROM [SHOW COLUMNS FROM customer];
~~~
~~~
+---------+
| Field   |
+---------+
| id      |
| name    |
| address |
+---------+
~~~

The following statement inserts Albert in the `employee` table and
immediately creates a matching entry in the `management` table with the
auto-generated employee ID, without requiring a round trip with the SQL
client:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO management(manager, reportee)
    VALUES ((SELECT id FROM employee WHERE name = 'Diana'),
            (SELECT id FROM [INSERT INTO employee(name) VALUES ('Albert') RETURNING id]));
~~~

## Composability

Table expressions are used in the [`SELECT`](select-clause.html) and
[`TABLE`](selection-queries.html#table-clause) variants of [selection
clauses](selection-queries.html#selection-clauses), and thus can appear everywhere where
a selection clause is possible. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT ... FROM <table expr>, <table expr>, ...
> TABLE <table expr>
> INSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
> INSERT INTO ... TABLE <table expr>
> CREATE TABLE ... AS SELECT ... FROM <table expr>, <table expr>, ...
> UPSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
~~~

For more options to compose query results, see [Selection Queries](selection-queries.html).

## See Also

- [Constants](sql-constants.html)
- [Selection Queries](selection-queries.html)
  - [Selection Clauses](selection-queries.html#selection-clauses)
- [Explainable Statements](explain.html#explainable-statements)
- [Scalar Expressions](scalar-expressions.html)
- [Data Types](data-types.html)
- [Subqueries](subqueries.html)
