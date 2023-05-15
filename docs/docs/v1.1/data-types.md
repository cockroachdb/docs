---
title: Data Types
summary: Learn about the data types supported by CockroachDB.
toc: true
---

## Supported Types

CockroachDB supports the following data types. Click a type for more details.

Type | Description | Example
-----|-------------|--------
[`INT`](int.html) | A signed integer, up to 64 bits. | `12345`
[`UUID`](uuid.html) | <span class="version-tag">New in v1.1:</span> A 128-bit hexadecimal value. | `7f9c24e8-3b12-4fef-91e0-56a2d5a246ec`
[`SERIAL`](serial.html) | A unique 64-bit signed integer. | `148591304110702593 `
[`DECIMAL`](decimal.html) | An exact, fixed-point number. | `1.2345`
[`FLOAT`](float.html) | A 64-bit, inexact, floating-point number. | `1.2345`
[`BOOL`](bool.html) | A Boolean value. | `true`
[`DATE`](date.html) | A date. | `DATE '2016-01-25'`
[`TIMESTAMP`<br>`TIMESTAMPTZ`](timestamp.html) | A date and time pairing in UTC. | `TIMESTAMP '2016-01-25 10:10:10'`<br>`TIMESTAMPTZ '2016-01-25 10:10:10-05:00'`
[`INTERVAL`](interval.html) | A span of time. | `INTERVAL '2h30m30s'`
[`STRING`](string.html) | A string of Unicode characters. | `'a1b2c3'`
[`COLLATE`](collate.html) | The `COLLATE` feature lets you sort [`STRING`](string.html) values according to language- and country-specific rules, known as collations. | `'a1b2c3' COLLATE en`
[`BYTES`](bytes.html) | A string of binary characters. | `b'\141\061\142\062\143\063'`
[`ARRAY`](array.html) | <span class="version-tag">New in v1.1:</span> A 1-dimensional, 1-indexed, homogeneous array of any non-array data type. | `{"sky","road","car"}`

## Data Type Conversions & Casts

CockroachDB supports explicit type conversions using the following methods:

- `<type> 'string literal'`, to convert from the literal representation of a value to a value of that type. For example:
  `DATE '2008-12-21'`, `INT '123'`, or `BOOL 'true'`.

- `<value>::<data type>`, or its equivalent longer form `CAST(<value> AS <data type>)`, which converts an arbitrary expression of one built-in type to another (this is also known as type coercion or "casting"). For example:
  `NOW()::DECIMAL`, `VARIANCE(a+2)::INT`.

    {{site.data.alerts.callout_success}}
    To create constant values, consider using a
    <a href="sql-expressions.html#explicitly-typed-expressions">type annotation</a>
    instead of a cast, as it provides more predictable results.
    {{site.data.alerts.end}}

- Other [built-in conversion functions](functions-and-operators.html) when the type is not a SQL type, for example `from_ip()`, `to_ip()` to convert IP addresses between `STRING` and `BYTES` values.


You can find each data type's supported converstion and casting on its
respective page in its section **Supported Casting & Conversion**.
