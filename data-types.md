---
title: Data Types
toc: false
---

CockroachDB supports the following data types. Click a type for more details.

Type | Description | Example
-----|-------------|--------
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