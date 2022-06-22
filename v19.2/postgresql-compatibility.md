---
title: PostgreSQL Compatibility
summary: A summary of CockroachDB's compatibility with PostgreSQL
toc: true
---
CockroachDB supports the PostgreSQL wire protocol and the majority of its syntax. This means that your existing applications can often be migrated to CockroachDB without changing application code.

CockroachDB is compatible with PostgreSQL 9.5 and works with majority of PostgreSQL database tools such as [Dbeaver](dbeaver.html), [Intellij](intellij-idea.html), pgdump and so on. Consult this link for a full list of supported [third-party database tools](third-party-database-tools.html). CockroachDB also works with most [PostgreSQL drivers and ORMs](hello-world-example-apps.html).

However, CockroachDB does not support some of the PostgreSQL features or behaves differently from PostgreSQL because these features cannot be easily implemented in a distributed system. This page documents the known list of differences between PostgreSQL and CockroachDB for identical input. That is, a SQL statement of the type listed here will behave differently than in PostgreSQL. Porting an existing application to CockroachDB will require changing these expressions.

{{site.data.alerts.callout_info}}This document currently only covers unsupported SQL and how to rewrite SQL expressions. It does not discuss strategies for porting applications that use <a href="sql-feature-support.html">SQL features CockroachDB does not currently support</a>, such as the <code>ENUM</code> type.{{site.data.alerts.end}}

## Unsupported Features

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

## Features that differ from PostgreSQL

Note, some of these differences below only apply to rare inputs, and so no change will be needed, even if the listed feature is being used. In these cases, it is safe to ignore the porting instructions.

### Overflow of `float`

In PostgreSQL, the `float` type returns an error when it overflows or an expression would return Infinity:

~~~
postgres=# select 1e300::float * 1e10::float;
ERROR:  value out of range: overflow
postgres=#  select pow(0::float, -1::float);
ERROR:  zero raised to a negative power is undefined
~~~

In CockroachDB, these expressions instead return Infinity:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 1e300::float * 1e10::float;
~~~

~~~
+----------------------------+
| 1e300::FLOAT * 1e10::FLOAT |
+----------------------------+
| +Inf                       |
+----------------------------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT pow(0::float, -1::float);
~~~

~~~
+---------------------------+
| pow(0::FLOAT, - 1::FLOAT) |
+---------------------------+
| +Inf                      |
+---------------------------+
~~~

### Precedence of unary `~`

In PostgreSQL, the unary `~` (bitwise not) operator has a low precedence. For example, the following query is parsed as `~ (1 + 2)` because `~` has a lower precedence than `+`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT ~1 + 2
~~~

In CockroachDB, unary `~` has the same (high) precedence as unary `-`, so the above expression will be parsed as `(~1) + 2`.

**Porting instructions:** Manually add parentheses around expressions that depend on the PostgreSQL behavior.

### Precedence of bitwise operators

In PostgreSQL, the operators `|` (bitwise OR), `#` (bitwise XOR), and `&` (bitwise AND) all have the same precedence.

In CockroachDB, the precedence from highest to lowest is: `&`, `#`, `|`.

**Porting instructions:** Manually add parentheses around expressions that depend on the PostgreSQL behavior.

### Integer division

In PostgreSQL, division of integers results in an integer. For example, the following query returns `1`, since the `1 / 2` is truncated to `0`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 1 + 1 / 2
~~~

In CockroachDB, integer division results in a `decimal`. CockroachDB instead provides the `//` operator to perform floor division.

**Porting instructions:** Change `/` to `//` in integer division where the result must be an integer.

### Shift argument modulo

In PostgreSQL, the shift operators (`<<`, `>>`) sometimes modulo their second argument to the bit size of the underlying type. For example, the following query results in a `1` because the int type is 32 bits, and `32 % 32` is `0`, so this is the equivalent of `1 << 0`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 1::int << 32
~~~

In CockroachDB, no such modulo is performed.

**Porting instructions:** Manually add a modulo to the second argument. Also note that CockroachDB's [`INT`](int.html) type is always 64 bits. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 1::int << (x % 64)
~~~

### Locking and `FOR UPDATE`

<span class="version-tag">New in v19.2:</span> Because CockroachDB only supports [`SERIALIZABLE` isolation](architecture/transaction-layer.html#isolation-levels), locking is not required to order concurrent transactions relative to each other. The `FOR UPDATE` [locking clause](sql-grammar.html#locking_clause) is supported in [selection queries](selection-queries.html#parameters) for database migration compatibility only. As a no-op clause, `FOR UPDATE` does not provide stronger, PostgreSQL-compatible locking guarantees for uses unrelated to performance, such as applications that require locks to protect data from concurrent access altogether.

CockroachDB uses a [lightweight latch](architecture/transaction-layer.html#latch-manager) to serialize access to common keys across concurrent transactions. As CockroachDB does not allow serializable anomalies, [transactions](begin-transaction.html) may experience deadlocks or [read/write contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). This is expected during concurrency on the same keys. These can be addressed with either [automatic retries](transactions.html#automatic-retries) or [client-side intervention techniques](transactions.html#client-side-intervention).

### Schema namespaces

For compatibility with PostgreSQL, CockroachDB supports a [three-level structure for names](sql-name-resolution.html#naming-hierarchy): databases, schemas, and objects.

However, in CockroachDB versions < v20.2, user-defined schemas are not supported, and the only schema available for stored objects is the preloaded `public` schema. As a result, CockroachDB effectively supports a two-level storage structure: databases and objects. To provide a multi-level structure for stored objects, we recommend using database namespaces in the same way as [schema namespaces are used in PostgreSQL](https://www.postgresql.org/docs/current/ddl-schemas.html).

For more details, see [Name Resolution](sql-name-resolution.html).

### SQL Compatibility

Click the following link to find a full list of [CockroachDB supported SQL Features](sql-feature-support.html).
