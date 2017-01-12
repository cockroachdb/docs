---
title: Data Types
summary: Learn about the data types supported by CockroachDB.
toc: true
---

## Supported Types

CockroachDB supports the following data types. Click a type for more details.

Type | Description | Example
---------|--------
[`INT`](int.html) | A 64-bit signed integer. | `12345`
[`SERIAL`](serial.html) | A unique 64-bit signed integer. | `148591304110702593 `
[`DECIMAL`](decimal.html) | An exact, fixed-point number. | `1.2345`
[`FLOAT`](float.html) | A 64-bit, inexact, floating-point number. | `1.2345`
[`BOOL`](bool.html) | A Boolean value. | `true` 
[`DATE`](date.html) | A date. | `DATE '2016-01-25'`
[`TIMESTAMP`](timestamp.html) | A date and time pairing. | `TIMESTAMP '2016-01-25 10:10:10'`
[`INTERVAL`](interval.html) | A span of time. | `INTERVAL '2h30m30s'`
[`STRING`](string.html) | A string of Unicode characters. | `'a1b2c3'`
[`BYTES`](bytes.html) | A string of binary characters. | `b'\141\061\142\062\143\063'`

## Data Type Conversions & Casts

CockroachDB supports explicit type conversions using the following methods:

- `<value>::<data type>`, or its equivalent longer form `CAST(<value> AS <data type>)`, which converts an arbitrary expression of one built-in type to another (this is also known as "casting"). For example:
`NOW()::DECIMAL`, `VARIANCE(a+2)::INT`.

- `<type> 'string literal'`, to convert from the literal representation of a value to a value of that type. For example:
`DATE '2008-12-21'`, `INT '123'`, or `BOOL 'true'`.

- Other [built-in conversion functions](functions-and-operators.html) when the type is not a SQL type, for example `from_ip()`, `to_ip()` to convert IP addresses between `STRING` and `BYTES` values.

You can find each data type's supported converstion and casting on its respective page in the **Supported Casting & Conversion** section.
