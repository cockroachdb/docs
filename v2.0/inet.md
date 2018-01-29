---
title: INET
summary:
toc: false
---
<span class="version-tag">New in v2.0:</span> The `inet` [data type](data-types.html) stores an IPv4 or IPv6 host address, and optionally its subnet, all in one field.

<div id="toc"></div>

## Syntax
An `inet` value

## Size
An `inet` value is 7 or 19 bytes.

## Examples

### Create a table with `inet`

## Supported Casting & Conversion

`inet` values can be [cast](data-types.html#data-type-conversions-casts) to the following data type:

Type | Details
-----|--------
`BYTES` | Requires supported [`BYTES`](bytes.html) string format, e.g., `b'\141\061\142\062\143\063'`.

## See Also

[Data Types](data-types.html)
