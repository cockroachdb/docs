---
title: Table Expressions
summary: Table expressions define a data source in selection clauses.
toc: true
docs_area: reference.sql
---

A _table expression_ defines a data source in the `FROM` sub-clause of a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) or as parameter to a [`TABLE` clause]({% link {{ page.version.version }}/selection-queries.md %}#table-clause).

A [join]({% link {{ page.version.version }}/joins.md %}) is a particular kind of table expression.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/table_ref.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | A [table or view name](#table-and-view-names).
`table_alias_name` | A name to use in an [aliased table expression](#aliased-table-expressions).
`name` | One or more aliases for the column names, to use in an [aliased table expression](#aliased-table-expressions).
`index_name` | Optional syntax to [force index selection](#force-index-selection).
`func_application` | [Result from a function](#result-from-a-function).
`row_source_extension_stmt` | [Result rows](#use-the-output-of-another-statement) from a [supported statement]({% link {{ page.version.version }}/sql-grammar.md %}#row_source_extension_stmt).
`select_stmt` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) to use as [subquery](#use-a-subquery).
`joined_table` | A [join expression]({% link {{ page.version.version }}/joins.md %}).

## Table expressions language

The synopsis defines a mini-language to construct complex table expressions from simpler parts.

Construct | Description | Examples
----------|-------------|------------
`table_name [@ scan_parameters]` | [Access a table or view](#table-and-view-names). | `accounts`, `accounts@name_idx`
`function_name ( exprs ... )` | Generate tabular data using a [scalar function](#scalar-function-as-data-source) or [table generator function](#table-generator-functions). | `sin(1.2)`, `generate_series(1,10)`
`<table expr> [AS] name [( name [, ...] )]` | [Rename a table and optionally columns](#aliased-table-expressions). | `accounts a`, `accounts AS a`, `accounts AS a(id, b)`
`<table expr> WITH ORDINALITY` | [Enumerate the result rows](#ordinality-annotation). | `accounts WITH ORDINALITY`
`<table expr> JOIN <table expr> ON ...` | [Join expression]({% link {{ page.version.version }}/joins.md %}). | `orders o JOIN customers c ON o.customer_id = c.id`
`(... subquery ...)` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) used as [subquery](#use-a-subquery). | `(SELECT * FROM customers c)`
`[... statement ...]` | Use the result rows of an [explainable statement]({% link {{ page.version.version }}/sql-grammar.md %}#preparable_stmt).<br><br>This is a CockroachDB extension. However, Cockroach Labs recommends that you use the standard SQL [CTE syntax]({% link {{ page.version.version }}/common-table-expressions.md %}) instead. See [Use the output of another statement](#use-the-output-of-another-statement) for an example. | `[SHOW COLUMNS FROM accounts]`

The following sections provide details on each of these options.

## Table expressions that generate data

The following sections describe primary table expressions that produce
data.

### Table and view names

#### Syntax

~~~
identifier
identifier.identifier
identifier.identifier.identifier
~~~

A single SQL identifier in a table expression designates
the contents of the table, [view]({% link {{ page.version.version }}/views.md %}), or sequence with that name
in the current database, as configured by [`SET DATABASE`]({% link {{ page.version.version }}/set-vars.md %}).

If the name is composed of two or more identifiers, [name resolution]({% link {{ page.version.version }}/sql-name-resolution.md %}) rules apply.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users; -- uses table `users` in the current database
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM mydb.users; -- uses table `users` in database `mydb`
~~~

### Force index selection

{% include {{page.version.version}}/misc/force-index-selection.md %}

{{site.data.alerts.callout_info}}
You can also force index selection for [`DELETE`]({% link {{ page.version.version }}/delete.md %}#force-index-selection-for-deletes) and [`UPDATE`]({% link {{ page.version.version }}/update.md %}#force-index-selection-for-updates) statements.
{{site.data.alerts.end}}

### Access a common table expression

A single identifier in a table expression can refer to a
[common table expression]({% link {{ page.version.version }}/common-table-expressions.md %}) defined
earlier.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH a AS (SELECT * FROM users)
  SELECT * FROM a; -- "a" refers to "WITH a AS .."
~~~

### Result from a function

A table expression can use the result from a function application as a data source.

#### Syntax

~~~
name ( arguments... )
~~~

The name of a function, followed by an opening parenthesis, followed
by zero or more [scalar expressions]({% link {{ page.version.version }}/scalar-expressions.md %}), followed by
a closing parenthesis.

The resolution of the function name follows the same rules as the
resolution of table names. See [Name Resolution]({% link {{ page.version.version }}/sql-name-resolution.md %}) for more details.

#### Scalar function as data source

When a [function returning a single value]({% link {{ page.version.version }}/scalar-expressions.md %}#function-calls-and-sql-special-forms) is
used as a table expression, it is interpreted as tabular data with a
single column and single row containing the function result.

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

{{site.data.alerts.callout_info}}CockroachDB supports this syntax for compatibility with PostgreSQL. The canonical syntax to evaluate <a href="scalar-expressions.html">scalar functions</a> is as a direct target of <code>SELECT</code>, for example <code>SELECT sin(3.2)</code>.{{site.data.alerts.end}}

#### Table generator functions

Some functions directly generate tabular data with multiple rows from
a single function application. This is also called a _set-returning function_ (SRF).

For example:

{% include_cached copy-clipboard.html %}
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

You access SRFs using `(SRF).x` where `x` is one of the following:

- The name of a column returned from the function.
- `*`, to denote all columns.

For example (the output of queries against [`information_schema`]({% link {{ page.version.version }}/information-schema.md %}) will vary per database):

{% include_cached copy-clipboard.html %}
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
CockroachDB supports the generator functions compatible with
[the PostgreSQL set-generating functions with the same names](https://www.postgresql.org/docs/9.6/static/functions-srf.html).
{{site.data.alerts.end}}

## Operators that extend a table expression

The following sections describe table expressions that change the
metadata around tabular data, or add more data, without modifying the
data of the underlying operand.

### Aliased table expressions

Aliased table expressions rename tables and columns temporarily in
the context of the current query.

#### Syntax

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
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT c.x FROM (SELECT COUNT(*) FROM users) AS c(x);
~~~

### Ordinality annotation

Appends a column named `ordinality`, whose values describe the ordinality of each row, to the data source specified in the
table expression operand.

#### Syntax

~~~
<table expr> WITH ORDINALITY
~~~

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

{{site.data.alerts.callout_info}}
`WITH ORDINALITY` necessarily prevents some optimizations of the surrounding query. Use it sparingly if performance is a concern, and always check the output of [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) in case of doubt.
{{site.data.alerts.end}}

## `JOIN` expressions

`JOIN` expressions combine the results of two or more table expressions
based on conditions on the values of particular columns.

See [`JOIN` expressions]({% link {{ page.version.version }}/joins.md %}) for more details.

## Use another query as a table expression

The following sections describe how to use the result produced by
another SQL query or statement as a table expression.

### Use a subquery

You can use a [selection query]({% link {{ page.version.version }}/selection-queries.md %}) enclosed between parentheses `()`
as a table expression. This is called a _[subquery]({% link {{ page.version.version }}/subqueries.md %})_.

#### Syntax

~~~
( ... subquery ... )
~~~

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT c+2 FROM (SELECT COUNT(*) AS c FROM users);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM (VALUES(1), (2), (3));
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT firstname || ' ' || lastname FROM (TABLE employees);
~~~

{{site.data.alerts.callout_info}}
- See [Subqueries]({% link {{ page.version.version }}/subqueries.md %}) for more details and performance best practices.
- To use other statements that produce data in a table expression, for example `SHOW`, see [Use the output of another statement](#use-the-output-of-another-statement).
{{site.data.alerts.end}}

### Use the output of another statement

#### Syntax

~~~
WITH table_expr AS ( <stmt> ) SELECT .. FROM table_expr
~~~

A [`WITH` query]({% link {{ page.version.version }}/common-table-expressions.md %}) designates the output of executing a statement as a row source. The following statements are supported as row sources for table expressions:

- [`DELETE`]({% link {{ page.version.version }}/delete.md %})
- [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %})
- [`INSERT`]({% link {{ page.version.version }}/insert.md %})
- [`SELECT`]({% link {{ page.version.version }}/select-clause.md %})
- [`SHOW`]({% link {{ page.version.version }}/sql-statements.md %}#data-definition-statements)
- [`UPDATE`]({% link {{ page.version.version }}/update.md %})
- [`UPSERT`]({% link {{ page.version.version }}/upsert.md %})

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW COLUMNS from customer) SELECT "column_name" FROM x;
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

The following statement inserts `Albert` in the `employee` table and
immediately creates a matching entry in the `management` table with the
auto-generated employee ID, without requiring a round trip with the SQL
client:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO management(manager, reportee)
    VALUES ((SELECT id FROM employee WHERE name = 'Diana'),
            (WITH x AS (INSERT INTO employee(name) VALUES ('Albert') RETURNING id) SELECT id FROM x));
~~~

## Composability

You can use table expressions in the [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) and
[`TABLE` clause]({% link {{ page.version.version }}/selection-queries.md %}#table-clause) variants of [selection clauses]({% link {{ page.version.version }}/selection-queries.md %}#selection-clauses).
Thus they can appear everywhere where a selection clause is possible. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT ... FROM <table expr>, <table expr>, ...
> TABLE <table expr>
> INSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
> INSERT INTO ... TABLE <table expr>
> CREATE TABLE ... AS SELECT ... FROM <table expr>, <table expr>, ...
> UPSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
~~~

For more options to compose query results, see [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %}).

## See also

- [Constants]({% link {{ page.version.version }}/sql-constants.md %})
- [Explainable statements]({% link {{ page.version.version }}/sql-grammar.md %}#preparable_stmt)
- [Scalar Expressions]({% link {{ page.version.version }}/scalar-expressions.md %})
- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [Subqueries]({% link {{ page.version.version }}/subqueries.md %})
