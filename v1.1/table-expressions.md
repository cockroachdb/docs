---
title: Table Expressions
summary: Table expressions define a data source in selection clauses.
toc: true
---

Table expressions define a data source in the `FROM` sub-clause of
[selection clauses](selection-clauses.html), allowed also in the [`CREATE
TABLE AS`](create-table-as.html), [`INSERT`](insert.html) and
[`UPSERT`](upsert.html) statements.


## Introduction

Table expressions are used in [selection clauses](selection-clauses.html):

~~~sql
> SELECT ... FROM <table expr>, <table expr>, ...
> INSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
> CREATE TABLE ... AS SELECT ... FROM <table expr>, <table expr>, ...
> UPSERT INTO ... SELECT ... FROM <table expr>, <table expr>, ...
~~~

CockroachDB recognizes the following table expressions:

- a [table or view name](#table-or-view-names);
- a [table generator function](#table-generator-functions);
- a [selection clause](selection-clauses.html) between parentheses (including
  `SELECT`, `VALUES` and `TABLE`), as [a
  sub-query](#subqueries-as-table-expressions);
- an [aliased table expression](#aliased-table-expressions), using an `AS` clause;
- an explicit [`JOIN` expression](#join-expressions);
- a CockroachDB statement that returns values, between square brackets '[...]';
- another table expression [annoted with `WITH ORDINALITY`](#ordinality-annotation); or
- another table expression between parentheses.

The following sections provide details on each of these options.

In addition to this, the `FROM` clause itself accepts more than one
consecutive table expressions at the top level, separated by
commas. This is a shorthand notation for `CROSS JOIN`, documented in
the `JOIN` syntax below.

## Table or View Names

Syntax:

~~~
identifier
identifier.identifier
~~~

A single SQL identifier in a table expression context designates
the contents of the table or [view](views.html) with that name
in the current database, as configured by [`SET DATABASE`](set-vars.html).

If the name is prefixed by another identifier and a period, the table
or view is searched in the database with that name. See the section on
[name resolution](sql-name-resolution.html) for more details.

For example:

~~~sql
> SELECT * FROM users -- uses table `users` in the current database;
> SELECT * FROM mydb.users -- uses table `users` in database `mydb`;
~~~

## Table Generator Functions

Syntax:

~~~
name ( arguments... )
~~~

The name of a table generator function, followed by an opening
parenthesis, followed by zero or more expression arguments, followed
by a closing parenthesis.

This designates a transient data source produced by the designated
function.

Currently CockroachDB only supports the generator function
`pg_catalog.generate_series()`, for compatibility with
[the PostgreSQL set-generating function of the same name](https://www.postgresql.org/docs/9.6/static/functions-srf.html).

For example:

~~~sql
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

## Subqueries as Table Expressions

Any [selection clause](selection-clauses.html) enclosed between parentheses
can be used as a table expression. This is called a "subquery".

Syntax:

~~~
( ... subquery ... )
~~~

For example:

~~~sql
> SELECT c+2                          FROM (SELECT COUNT(*) AS c FROM users);
> SELECT *                            FROM (VALUES(1), (2), (3));
> SELECT firstname || ' ' || lastname FROM (TABLE employees);
~~~

## Aliased Table Expressions

Syntax:

~~~
<table expr> AS <name>
<table expr> AS <name>(<colname>, <colname>, ...)
~~~

In the first form, the table expression is equivalent to its left operand
with a new name for the entire table, and where columns retain their original name.

In the second form, the columns are also renamed.

For example:

~~~sql
> SELECT c.x FROM (SELECT COUNT(*) AS x FROM users) AS c;
> SELECT c.x FROM (SELECT COUNT(*) FROM users) AS c(x);
~~~

## Join Expressions

Syntax:

~~~ shell
# Inner joins:
<table expr> [ INNER ] JOIN <table expr> ON <val expr>
<table expr> [ INNER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL [ INNER ] JOIN <table expr>
<table expr> CROSS JOIN <table expr>

# Left outer joins:
<table expr> LEFT [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> LEFT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL LEFT [ OUTER ] JOIN <table expr>

# Right outer joins:
<table expr> RIGHT [ OUTER ] JOIN <table expr> ON <val expr>
<table expr> RIGHT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
<table expr> NATURAL RIGHT [ OUTER ] JOIN <table expr>
~~~

These expressions designate the
[SQL join operation](https://en.wikipedia.org/wiki/Join_(SQL)) on the
two operand table expressions.

Currently works only with small data sets; find more info in our [blog post](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/).

## Using the Output of Other Statements

Syntax:

~~~
[ <statement> ]
~~~

A statement between square brackets in a table expression context
designates the output of executing said statement. The following
statements produce values that can be used in this way:

- All `SHOW` variants.
- [`INSERT`](insert.html), [`DELETE`](delete.html),
  [`UPDATE`](update.html) and [`DELETE`](delete.html) with
  `RETURNING`.
- [`EXPLAIN`](explain.html).
- All [selection clauses](selection-clauses.html). However the fact they can
  be used between square brackets is merely a convenience; it is more
  common to use them enclosed in parentheses, as outlined in the next
  section.

For example:

~~~sql
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
auto-generated employee ID, without requiring a round-trip with the SQL
client:

~~~sql
> INSERT INTO management(manager, reportee)
    VALUES ((SELECT id FROM employee WHERE name = 'Diana'),
            (SELECT id FROM [INSERT INTO employee(name) VALUES ('Albert') RETURNING id]));
~~~

## Ordinality Annotation

Syntax:

~~~
<table expr> WITH ORDINALITY
~~~

Designates a data source equivalent to the table expression operand with
an extra "Ordinality" column that enumerates every row in the data source.

For example:

~~~sql
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

~~~sql
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
<code>WITH ORDINALITY</code> necessarily prevents some optimizations of the
surrounding query. Use it sparingly if performance is a concern, and
always check the output of <a href="explain.html">EXPLAIN</a> in case of doubt.
{{site.data.alerts.end}}

## See Also

- [Constants](sql-constants.html)
- [Selection Clauses](selection-clauses.html)
- [Value Expressions](sql-expressions.html)
- [Data Types](data-types.html)
