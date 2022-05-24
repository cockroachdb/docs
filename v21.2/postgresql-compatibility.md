---
title: PostgreSQL Compatibility
summary: A summary of CockroachDB's compatibility with PostgreSQL
toc: true
docs_area: reference.sql
---

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and the majority of PostgreSQL syntax. This means that existing applications built on PostgreSQL can often be migrated to CockroachDB without changing application code.

CockroachDB is compatible with version 3.0 of the PostgreSQL wire protocol (pgwire) and works with the majority of PostgreSQL database tools such as [DBeaver](dbeaver.html), [Intellij](intellij-idea.html), and so on. Consult this link for a full list of supported [third-party database tools](third-party-database-tools.html). CockroachDB also works with most [PostgreSQL drivers and ORMs](example-apps.html).

However, CockroachDB does not support some of the PostgreSQL features or behaves differently from PostgreSQL because not all features can be easily implemented in a distributed system. This page documents the known list of differences between PostgreSQL and CockroachDB for identical input. That is, a SQL statement of the type listed here will behave differently than in PostgreSQL. Porting an existing application to CockroachDB will require changing these expressions.

{{site.data.alerts.callout_info}}
This document currently only covers unsupported SQL and how to rewrite SQL expressions. It does not discuss strategies for porting applications that use <a href="sql-feature-support.html">SQL features CockroachDB does not currently support</a>.
{{site.data.alerts.end}}

## Unsupported Features

### Unsupported PostgreSQL features

The following PostgreSQL features are not supported in CockroachDB {{ page.version.version }}:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

### Unsupported PostgreSQL wire protocol features

The following features of the PostgreSQL wire protocol are not supported in CockroachDB {{ page.version.version }}:

- [Multiple active portals](https://github.com/cockroachdb/cockroach/issues/40195)
- [Query cancellation](https://github.com/cockroachdb/cockroach/issues/41335)

## Features that differ from PostgreSQL

Note, some of the differences below only apply to rare inputs, and so no change will be needed, even if the listed feature is being used. In these cases, it is safe to ignore the porting instructions.

### Overflow of `float`

In PostgreSQL, the `float` type returns an error when it overflows or an expression would return Infinity:

~~~
postgres=# select 1e300::float * 1e10::float;
ERROR:  value out of range: overflow
postgres=#  select pow(0::float, -1::float);
ERROR:  zero raised to a negative power is undefined
~~~

In CockroachDB, these expressions instead return Infinity:

{% include copy-clipboard.html %}
~~~ sql
SELECT 1e300::float * 1e10::float;
~~~

~~~
  ?column?
------------
  +Inf
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
SELECT pow(0::float, -1::float);
~~~

~~~
  pow
--------
  +Inf
(1 row)
~~~

### Precedence of unary `~`

In PostgreSQL, the unary `~` (bitwise not) operator has a low precedence. For example, the following query is parsed as `~ (1 + 2)` because `~` has a lower precedence than `+`:

{% include copy-clipboard.html %}
~~~ sql
SELECT ~1 + 2;
~~~

~~~
  ?column?
------------
         0
(1 row)
~~~

In CockroachDB, unary `~` has the same (high) precedence as unary `-`, so the above expression will be parsed as `(~1) + 2`.

**Porting instructions:** Manually add parentheses around expressions that depend on the PostgreSQL behavior.

### Precedence of bitwise operators

In PostgreSQL, the operators `|` (bitwise OR), `#` (bitwise XOR), and `&` (bitwise AND) all have the same precedence.

In CockroachDB, the precedence from highest to lowest is: `&`, `#`, `|`.

**Porting instructions:** Manually add parentheses around expressions that depend on the PostgreSQL behavior.

### Integer division

In PostgreSQL, division of integers results in an integer. For example, the following query returns `1`, since the `1 / 2` is truncated to `0`:

{% include copy-clipboard.html %}
~~~ sql
SELECT 1 + 1 / 2;
~~~

~~~
  ?column?
------------
       1.5
(1 row)
~~~

In CockroachDB, integer division results in a `decimal`. CockroachDB instead provides the `//` operator to perform floor division.

**Porting instructions:** Change `/` to `//` in integer division where the result must be an integer.

### Shift argument modulo

In PostgreSQL, the shift operators (`<<`, `>>`) sometimes modulo their second argument to the bit size of the underlying type. For example, the following query results in a `1` because the int type is 32 bits, and `32 % 32` is `0`, so this is the equivalent of `1 << 0`:

{% include copy-clipboard.html %}
~~~ sql
SELECT 1::int << 32;
~~~

~~~
   ?column?
--------------
  4294967296
(1 row)
~~~

In CockroachDB, no such modulo is performed.

**Porting instructions:** Manually add a modulo to the second argument. Also note that CockroachDB's [`INT`](int.html) type is always 64 bits. For example:

{% include copy-clipboard.html %}
~~~ sql
SELECT 1::int << (x % 64);
~~~

### Locking and `FOR UPDATE`

CockroachDB supports the `SELECT FOR UPDATE` statement, which is used to order transactions by controlling concurrent access to one or more rows of a table.

For more information, see [`SELECT FOR UPDATE`](select-for-update.html).

### `CHECK` constraint validation for `INSERT ON CONFLICT`

CockroachDB validates [`CHECK`](check.html) constraints on the results of [`INSERT ON CONFLICT`](insert.html#on-conflict-clause) statements, preventing new or changed rows from violating the constraint. Unlike PostgreSQL, CockroachDB does not also validate `CHECK` constraints on the input rows of `INSERT ON CONFLICT` statements.

If this difference matters to your client, you can `INSERT ON CONFLICT` from a `SELECT` statement and check the inserted value as part of the `SELECT`. For example, instead of defining `CHECK (x > 0)` on `t.x` and using `INSERT INTO t(x) VALUES (3) ON CONFLICT (x) DO UPDATE SET x = excluded.x`, you could do the following:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t (x)
    SELECT if (x <= 0, crdb_internal.force_error('23514', 'check constraint violated'), x)
      FROM (values (3)) AS v(x)
    ON CONFLICT (x)
      DO UPDATE SET x = excluded.x;
~~~

An `x` value less than `1` would result in the following error:

~~~
pq: check constraint violated
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/35370)

### Column name from an outer column inside a subquery

CockroachDB returns the column name from an outer column inside a subquery as `?column?`, unlike PostgreSQL. For example:

~~~ sql
> SELECT (SELECT t.*) FROM (VALUES (1)) t(x);
~~~

CockroachDB:

~~~
  ?column?
------------
         1
~~~

PostgreSQL:

~~~
 x
---
 1
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/46563)

### SQL Compatibility

Click the following link to find a full list of [CockroachDB supported SQL Features](sql-feature-support.html).
