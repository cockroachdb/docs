---
title: Porting from PostgreSQL
summary: Porting an application from PostgreSQL
toc: true
---

Although CockroachDB supports PostgreSQL syntax and drivers, it does not offer exact compatibility. This page documents the known list of differences between PostgreSQL and CockroachDB for identical input. That is, a SQL statement of the type listed here will behave differently than in PostgreSQL. Porting an existing application to CockroachDB will require changing these expressions.

Note that some of these differences only apply to rare inputs, and so no change will be needed, even if the listed feature is being used. In these cases, it is safe to ignore the porting instructions.

{{site.data.alerts.callout_info}}This document currently only covers how to rewrite SQL expressions. It does not discuss strategies for porting applications that use <a href="sql-feature-support.html">SQL features CockroachDB does not currently support</a>, such as the <code>ENUM</code> type.{{site.data.alerts.end}}


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
