---
title: Data Types
summary: Learn about the data types supported by CockroachDB.
toc: true
docs_area: reference.sql
---

## Supported types

CockroachDB supports the following data types.

Type | Description | Example
-----|-------------|---------
[`ARRAY`]({% link {{ page.version.version }}/array.md %}) | A 1-dimensional, 1-indexed, homogeneous array of any non-array data type. | `{"sky","road","car"}`
[`BIT`]({% link {{ page.version.version }}/bit.md %}) | A string of binary digits (bits).  | `B'10010101'`
[`BOOL`]({% link {{ page.version.version }}/bool.md %}) | A Boolean value. | `true`
[`BYTES`]({% link {{ page.version.version }}/bytes.md %}) | A string of binary characters. | `b'\141\061\142\062\143\063'`
[`COLLATE`]({% link {{ page.version.version }}/collate.md %}) | The `COLLATE` feature lets you sort [`STRING`]({% link {{ page.version.version }}/string.md %}) values according to language- and country-specific rules, known as collations.  | `'a1b2c3' COLLATE en`
[`CITEXT`]({% link {{ page.version.version }}/citext.md %}) | Case-insensitive text. | `'Roach'`
[`DATE`]({% link {{ page.version.version }}/date.md %}) | A date.  | `DATE '2016-01-25'`
[`DECIMAL`]({% link {{ page.version.version }}/decimal.md %}) | An exact, fixed-point number.  | `1.2345`
[`ENUM`]({% link {{ page.version.version }}/enum.md %}) |  A user-defined data type comprised of a set of static values. | `ENUM ('club, 'diamond', 'heart', 'spade')`
[`FLOAT`]({% link {{ page.version.version }}/float.md %}) | A 64-bit, inexact, floating-point number.  | `1.2345`
[`INET`]({% link {{ page.version.version }}/inet.md %}) | An IPv4 or IPv6 address.  | `192.168.0.1`
[`INT`]({% link {{ page.version.version }}/int.md %}) | A signed integer, up to 64 bits. | `12345`
[`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) | A span of time.  | `INTERVAL '2h30m30s'`
[`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) | JSON (JavaScript Object Notation) data.  | `'{"first_name": "Lola", "last_name": "Dog", "location": "NYC", "online" : true, "friends" : 547}'`
[`LTREE`]({% link {{ page.version.version }}/ltree.md %}) | A label path representing a hierarchical tree-like structure. | `'Top.Countries.Europe.France'`
[`NULL`]({% link {{ page.version.version }}/null-handling.md %}) | The undefined value. | `NULL`
[`OID`]({% link {{ page.version.version }}/oid.md %}) | An unsigned 32-bit integer. | `4294967295`
[`SERIAL`]({% link {{ page.version.version }}/serial.md %}) | A pseudo-type that combines an [integer type]({% link {{ page.version.version }}/int.md %}) with a [`DEFAULT` expression]({% link {{ page.version.version }}/default-value.md %}).  | `148591304110702593`
[`STRING`]({% link {{ page.version.version }}/string.md %}) | A string of Unicode characters. | `'a1b2c3'`
[`TIME`<br>`TIMETZ`]({% link {{ page.version.version }}/time.md %}) | `TIME` stores a time of day in UTC.<br> `TIMETZ` converts `TIME` values with a specified time zone offset from UTC. | `TIME '01:23:45.123456'`<br> `TIMETZ '01:23:45.123456-5:00'`
[`TIMESTAMP`<br>`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) | `TIMESTAMP` stores a date and time pairing in UTC.<br>`TIMESTAMPTZ` converts `TIMESTAMP` values with a specified time zone offset from UTC. | `TIMESTAMP '2016-01-25 10:10:10'`<br>`TIMESTAMPTZ '2016-01-25 10:10:10-05:00'`
[`TSQUERY`]({% link {{ page.version.version }}/tsquery.md %}) | A list of lexemes and operators used in [full-text search]({% link {{ page.version.version }}/full-text-search.md %}). | `'list' & 'lexem' & 'oper' & 'use' & 'full' & 'text' & 'search'`
[`TSVECTOR`]({% link {{ page.version.version }}/tsvector.md %}) | A list of lexemes with optional integer positions and weights used in [full-text search]({% link {{ page.version.version }}/full-text-search.md %}). | `'full':13 'integ':7 'lexem':4 'list':2 'option':6 'posit':8 'search':15 'text':14 'use':11 'weight':10`
[`UUID`]({% link {{ page.version.version }}/uuid.md %}) | A 128-bit hexadecimal value. | `7f9c24e8-3b12-4fef-91e0-56a2d5a246ec`
[`VECTOR`]({% link {{ page.version.version }}/vector.md %}) | A fixed-length array of floating-point numbers. | `[1.0, 0.0, 0.0]`

## Data type conversions and casts

CockroachDB supports explicit type conversions using the following methods:

- `<type> 'string literal'`, to convert from the literal representation of a value to a value of that type. For example:
  `DATE '2008-12-21'`, `INT '123'`, or `BOOL 'true'`.

- `<value>::<data type>`, or its equivalent longer form `CAST(<value> AS <data type>)`, which converts an arbitrary expression of one built-in type to another (this is also known as type coercion or "casting"). For example:
  `NOW()::DECIMAL`, `VARIANCE(a+2)::INT`.

    {{site.data.alerts.callout_success}}
    To create constant values, consider using a
    <a href="scalar-expressions.html#explicitly-typed-expressions">type annotation</a>
    instead of a cast, as it provides more predictable results.
    {{site.data.alerts.end}}

- Other [built-in conversion functions]({% link {{ page.version.version }}/functions-and-operators.md %}) when the type is not a SQL type, for example `from_ip()`, `to_ip()` to convert IP addresses between `STRING` and `BYTES` values.

CockroachDB also supports implicit casting from string literals to arrays of all data types except the following:

  - [`BYTES`]({% link {{ page.version.version }}/bytes.md %})
  - [`ENUM`]({% link {{ page.version.version }}/enum.md %})
  - [`JSONB`]({% link {{ page.version.version }}/jsonb.md %})
  - [`SERIAL`]({% link {{ page.version.version }}/serial.md %})
  - `Box2D` [(spatial type)]({% link {{ page.version.version }}/architecture/glossary.md %}#data-types)
  - `GEOGRAPHY` [(spatial type)]({% link {{ page.version.version }}/architecture/glossary.md %}#data-types)
  - `GEOMETRY` [(spatial type)]({% link {{ page.version.version }}/architecture/glossary.md %}#data-types)

For an example, see [Implicit casting to `ARRAY`s]({% link {{ page.version.version }}/array.md %}#implicit-casting).

You can find each data type's supported conversion and casting on its
respective page in its section **Supported casting & conversion**.

## See also

- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
- [`SHOW TYPES`]({% link {{ page.version.version }}/show-types.md %})
