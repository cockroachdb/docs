---
title: Porting from PostgreSQL
summary: Porting an application from PostgreSQL
toc: false
---

Although CockroachDB supports Postgres syntax and drivers, it does not offer exact compatibility. This page documents the known list of differences between Postgres and CockroachDB for identical input. That is, a SQL statement of the type listed here will behave differently than in Postgres. Porting an existing application to CockroachDB will require changing these expressions.

Note that some of these differences only apply to rare inputs, and so no change will be needed, even if the listed feature is being used. In these cases, it is safe to ignore the porting instructions.

<div id="toc"></div>

### Overflow of `float`

The `float` type in Postgres will return an error if it overflows or an expression would return Infinity:

```
postgres=# select 1e300::float * 1e10::float;
ERROR:  value out of range: overflow
postgres=#  select pow(0::float, -1::float);
ERROR:  zero raised to a negative power is undefined
```

In CockroachDB these expressions will instead return Infinity:

```
root@:26257/> select 1e300::float * 1e10::float;
+----------------------------+
| 1e300::FLOAT * 1e10::FLOAT |
+----------------------------+
| +Inf                       |
+----------------------------+
root@:26257/> select pow(0::float, -1::float);
+---------------------------+
| pow(0::FLOAT, - 1::FLOAT) |
+---------------------------+
| +Inf                      |
+---------------------------+
```

### Precedence of unary `~`

The unary `~` (bitwise not) operator in Postgres has a low precedence. For example:

```
SELECT ~1 + 2
```

Is parsed as `~ (1 + 2)` because `~` has a lower precedence than `+`.

In CockroachDB, unary `~` has the same (high) precedence as unary `-`, so the above expression will be parsed as `(~1) + 2`.

**Porting instructions:** manually add parentheses around expressions that depend on the Postgres behavior.

### Precedence of bitwise operators

The operators `|` (bitwise OR), `#` (bitwise XOR), and `&` (bitwise AND) in Postgres all have the same precedence. In CockroachDB the precedence from highest to lowest is: `&`, `#`, `|`.

**Porting instructions:** manually add parentheses around expressions that depend on the Postgres behavior.

### Integer division

Division of integers in Postgres results in an integer. The query:

```
SELECT 1 + 1 / 2
```

Returns `1`, since the `1 / 2` is truncated to `0` since it is performing integer division. In CockroachDB integer division results in a `decimal`. CockroachDB instead provides the `//` operator to perform floor division.

**Porting instructions:** change `/` to `//` in integer division where the result must be an integer.

### Shift argument modulo

The shift operators in Postgres (`<<`, `>>`) sometimes modulo their second argument to the bit size of the underlying type. For example:

```
SELECT 1::int << 32
```

Results in a `1` because the `int` type is 32 bits, and `32 % 32` is `0`, so this is the equivalent of `1 << 0`. In CockroachDB, no such modulo is performed.

**Porting instructions:** manually add a modulo to the second argument. Also note that CockroachDB's int type is always 64 bits. For example:

```
SELECT 1::int << (x % 64)
```
