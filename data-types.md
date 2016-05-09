---
title: Data Types
toc: false
---

CockroachDB supports the following data types. Click a type for more details.

Type | Description | Storage Size | Example
-----|-------------|--------
[`INT`](int.html) | 64-bit signed integer. | 8 bytes | `12345`
[`DECIMAL`](decimal.html) | An exact, fixed-point number. | variable | `DECIMAL '1.2345'`
[`FLOAT`](float.html) | An inexact, floating-point number. | 8 bytes | `1.2345`
[`BOOL`](bool.html) | A Boolean value. | 1 byte | `true` 
[`DATE`](date.html) | Year, month, day. | 8 bytes | `DATE '2016-01-25'`
[`TIMESTAMP`](timestamp.html) | A date and time pairing. | 12 bytes | `TIMESTAMP '2016-01-25 10:10:10'`
[`INTERVAL`](interval.html) | A span of time. | 24 bytes | `INTERVAL '2h30m30s'`
[`STRING`](string.html) | A string of characters. | variable | `'a1b2c3'`
[`BYTES`](bytes.html) | A string of binary characters. | variable | `b'\141\061\142\062\143\063'`