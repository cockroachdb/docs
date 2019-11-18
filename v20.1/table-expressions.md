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

<div>
  {% include {{ page.version.version }}/sql/diagrams/table_ref.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | A [table or view name](#table-or-view-names).
`table_alias_name` | A name to use in an [aliased table expression](#aliased-table-expressions).
`name` | One or more aliases for the column names, to use in an [aliased table expression](#aliased-table-expressions).
`index_name` | Optional syntax to [force index selection](#force-index-selection).
`func_application` | [Results from a function](#results-from-a-function).
`row_source_extension_stmt` | [Result rows](#using-the-output-of-other-statements) from a [supported statement](sql-grammar.html#row_source_extension_stmt).
`select_stmt` | A [selection query](selection-queries.html) to use as [subquery](#subqueries-as-table-expressions).
`joined_table` | A [join expression](joins.html).

## Table expressions language

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
`[... statement ...]` | [Use the result rows](#using-the-output-of-other-statements) of an [explainable statement](sql-grammar.html#preparable_stmt).<br><br>This is a CockroachDB extension. | `[SHOW COLUMNS FROM accounts]`

The following sections provide details on each of these options.

## Table expressions that generate data

The following sections describe primary table expressions that produce
data.

### Access a table or view

#### Table or view names

Syntax:

~~~
identifier
identifier.identifier
identifier.identifier.identifier
~~~

A single SQL identifier in a table expression context designates
the contents of the table, [view](views.html), or sequence with that name
in the current database, as configured by [`SET DATABASE`](set-vars.html).

If the name is composed of two or more identifiers, [name resolution](sql-name-resolution.html) rules apply.

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users; -- uses table `users` in the current database
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM mydb.users; -- uses table `users` in database `mydb`
~~~

#### Force index selection

{% include {{page.version.version}}/misc/force-index-selection.md %}

{{site.data.alerts.callout_info}}
You can also force index selection for [`DELETE`](delete.html#force-index-selection-for-deletes) and [`UPDATE`](update.html#force-index-selection-for-updates) statements.
{{site.data.alerts.end}}

### Access a common table expression

A single identifier in a table expression context can refer to a
[common table expression](common-table-expressions.html) defined
earlier.

For example:

{% include copy-clipboard.html %}
~~~ sql
> WITH a AS (SELECT * FROM users)
  SELECT * FROM a; -- "a" refers to "WITH a AS .."
~~~

### Results from a function

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

#### Scalar function as data source

When a [function returning a single
value](scalar-expressions.html#function-calls-and-sql-special-forms) is
used as a table expression, it is interpreted as tabular data with a
single column and single row containing the function results.

For example:

{% include copy-clipboard.html %}
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


#### Table generator functions

Some functions directly generate tabular data with multiple rows from
a single function application. This is also called a "set-returning
function".

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM generate_series(1, 3);
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

Set-returning functions (SRFs) can now be accessed using `(SRF).x` where `x` is one of the following:

- The name of a column returned from the function
- `*` to denote all columns.

For example (note that the output of queries against [`information_schema`](information-schema.html) will vary per database):

{% include copy-clipboard.html %}
~~~ sql
> SELECT (i.keys).* FROM (SELECT information_schema._pg_expandarray(indkey) AS keys FROM pg_index) AS i;
~~~

~~~
 x | n
---+---
 1 | 1
 2 | 1
(2 rows)
~~~

{{site.data.alerts.callout_info}}
Currently CockroachDB only supports a small set of generator functions compatible with [the PostgreSQL set-generating functions with the same
names](https://www.postgresql.org/docs/9.6/static/functions-srf.html).
{{site.data.alerts.end}}

## Operators that extend a table expression

The following sections describe table expressions that change the
metadata around tabular data, or add more data, without modifying the
data of the underlying operand.

### Aliased table expressions

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

{% include copy-clipboard.html %}
~~~ sql
> SELECT c.x FROM (SELECT COUNT(*) AS x FROM users) AS c;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT c.x FROM (SELECT COUNT(*) FROM users) AS c(x);
~~~

### Ordinality annotation

Syntax:

~~~
<table expr> WITH ORDINALITY
~~~

Designates a data source equivalent to the table expression operand with
an extra "Ordinality" column that enumerates every row in the data source.

For example:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{{site.data.alerts.callout_info}}
`WITH ORDINALITY` necessarily prevents some optimizations of the surrounding query. Use it sparingly if performance is a concern, and always check the output of [`EXPLAIN`](explain.html) in case of doubt.
{{site.data.alerts.end}}

## Join expressions

Join expressions combine the results of two or more table expressions
based on conditions on the values of particular columns.

See [Join Expressions](joins.html) for more details.

## Using other queries as table expressions

The following sections describe how to use the results produced by
another SQL query or statement as a table expression.

### Subqueries as table expressions

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

{% include copy-clipboard.html %}
~~~ sql
> SELECT c+2                          FROM (SELECT COUNT(*) AS c FROM users);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT *                            FROM (VALUES(1), (2), (3));
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT firstname || ' ' || lastname FROM (TABLE employees);
~~~

{{site.data.alerts.callout_info}}
- See also [Subqueries](subqueries.html) for more details and performance best practices.
- To use other statements that produce data in a table expression, for example `SHOW`, use the [square bracket notation](#using-the-output-of-other-statements).
{{site.data.alerts.end}}

<div markdown="1"></div>

### Using the output of other statements

Syntax:

~~~
SELECT .. FROM [ <stmt> ]
~~~

A [statement](sql-grammar.html#row_source_extension_stmt) between square brackets in a table expression context designates the output of executing the statement as a row source. The following statements are supported as row sources for table expressions:

- [`DELETE`](delete.html)
- [`EXPLAIN`](explain.html)
- [`INSERT`](insert.html)
- [`SELECT`](select.html)
- [`SHOW`](sql-statements.html#data-definition-statements)
- [`UPDATE`](update.html)
- [`UPSERT`](upsert.html)

 `SELECT .. FROM [ <stmt> ]` is equivalent to `WITH table_expr AS ( <stmt> ) SELECT .. FROM table_expr`

{{site.data.alerts.callout_info}}
This CockroachDB extension syntax complements the [subquery syntax using parentheses](#subqueries-as-table-expressions), which is restricted to [selection queries](selection-queries.html). It was introduced to enable the use of [statements](sql-grammar.html#row_source_extension_stmt) as [subqueries](subqueries.html).
{{site.data.alerts.end}}

For example:

{% include copy-clipboard.html %}
~~~ sql
> SELECT "column_name" FROM [SHOW COLUMNS FROM customer];
~~~

~~~
+-------------+
| column_name |
+-------------+
| id          |
| name        |
| address     |
+-------------+
(3 rows)
~~~

The following statement inserts Albert in the `employee` table and
immediately creates a matching entry in the `management` table with the
auto-generated employee ID, without requiring a round trip with the SQL
client:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SELECT ... FROM <table expr>, <table expr>, ...
> TABLE <table expr>
> INSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
> INSERT INTO ... TABLE <table expr>
> CREATE TABLE ... AS SELECT ... FROM <table expr>, <table expr>, ...
> UPSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
~~~

For more options to compose query results, see [Selection Queries](selection-queries.html).

## See also

- [Constants](sql-constants.html)
- [Selection Queries](selection-queries.html)
  - [Selection Clauses](selection-queries.html#selection-clauses)
- [Explainable Statements](sql-grammar.html#preparable_stmt)
- [Scalar Expressions](scalar-expressions.html)
- [Data Types](data-types.html)
- [Subqueries](subqueries.html)
