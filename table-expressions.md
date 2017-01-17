---
title: Table Expressions
summary: Table expressions define a data source in SELECT clauses and INSERT statements.
toc: false
---

Table expressions define a data source in SELECT clauses and INSERT statements.

<div id="toc"></div>

## Introduction

Table expressions are used prominently in the `SELECT` clause:

	SELECT ... FROM <table expr>, <table expr>, ...

CockroachDB recognizes the following table expressions:

- a table or view name
- a table generator function
- a `SELECT` or `VALUES` clause, as a sub-query
- an aliased table expression, using an `AS` clause
- an explicit `JOIN` expression
- another table expression annoted with `WITH ORDINALITY`
- another table expression between parentheses,

The following sections provide details on each of these options.

In addition to this, the `FROM` clause itself accepts more than one
consecutive table expressions at the top level, separated by
commas. This is a shorthand notation for `CROSS JOIN`, documented in
the `JOIN` syntax below.

## Table or view names

Syntax:

	 identifier
	 identifier.identifier

A single SQL identifier in a table expression context designates
the contents of the table or view with that name
in the current database, as configured by [`SET DATABASE`](set-database.html).

If the name is prefixed by another identifier and a period, the table or view
is searched in the database with that name.

For example:

	SELECT * FROM users -- uses table `users` in the current database
	SELECT * FROM mydb.users -- uses table `users` in database `mydb`

## Table generator functions

Syntax:

	 name ( arguments... )

(The name of a table generator function, followed by an opening
parenthesis, followed by zero or more expression arguments, followed
by a closing parenthesis)

This designates a transient data source produced by the designated
function.

Currently CockroachDB only supports the generator function
`pg_catalog.generate_series()`, for compatibility with
[the PostgreSQL set-generating function of the same name](https://www.postgresql.org/docs/9.6/static/functions-srf.html).

## Subqueries as table expressions

Syntax:

	( ... subquery ... )

The subquery can be expressed either as a `SELECT` or `VALUES` clause.
The parentheses around the subquery are mandatory.

For example:

	SELECT * FROM (VALUES(1), (2), (3))
	SELECT c+2 FROM (SELECT COUNT(*) AS c FROM users)

## Aliased table expressions

Syntax:

	 <table expr> AS <name>
	 <table expr> AS <name>(<colname>, <colname>, ...)

In the first form, the table expression is equivalent to its left operand
with a new name for the entire table, and where columns retain their original name.

In the second form, the columns are also renamed.

For example:

	SELECT c.x FROM (SELECT COUNT(*) AS x FROM users) AS c
	SELECT c.x FROM (SELECT COUNT(*) FROM users) AS c(x)

## Join expressions

Syntax:

    -- Inner joins:
    <table expr> [ INNER ] JOIN <table expr> ON <val expr>
    <table expr> [ INNER ] JOIN <table expr> USING(<colname>, <colname>, ...)
    <table expr> NATURAL [ INNER ] JOIN <table expr>
    <table expr> CROSS JOIN <table expr>
	
	-- Left outer joins:
    <table expr> LEFT [ OUTER ] JOIN <table expr> ON <val expr>
    <table expr> LEFT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
    <table expr> NATURAL LEFT [ OUTER ] JOIN <table expr>
	
	-- Right outer joins:
    <table expr> RIGHT [ OUTER ] JOIN <table expr> ON <val expr>
    <table expr> RIGHT [ OUTER ] JOIN <table expr> USING(<colname>, <colname>, ...)
    <table expr> NATURAL RIGHT [ OUTER ] JOIN <table expr>

These expressions designate the
[SQL join operation](https://en.wikipedia.org/wiki/Join_(SQL)) on the
two operand table expressions.

## Ordinality annotation

Syntax:

    <table expr> WITH ORDINALITY
	
Designates a data source equivalent to the table expression operand with
an extra "Ordinality" column that enumerates every row in the data source.

For example:

```sql
SELECT * FROM (VALUES('a'),('b'),('c'));
+---------+
| column1 |
+---------+
| a       |
| b       |
| c       |
+---------+

SELECT * FROM (VALUES ('a'), ('b'), ('c')) WITH ORDINALITY;
+---------+------------+
| column1 | ordinality |
+---------+------------+
| a       |          1 |
| b       |          2 |
| c       |          3 |
+---------+------------+
```

**Note that `WITH ORDINALITY` necessarily prevents some optimizations
of the surrounding query. Use it sparingly if performance is a concern, and
always check the output of `EXPLAIN` in case of doubt.**

