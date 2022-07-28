---
title: OID
summary: The OID data type stores an unsigned 32 bit integer value.
toc: true
docs_area: reference.sql
---

The `OID` (Object Identifier) [data type](data-types.html) stores an unsigned 32 bit integer value. OIDs are used internally as primary keys for tables in [system schema](system-catalogs.html). OIDs are not used in user-created tables.

CockroachDB supports many [functions](functions-and-operators.html#built-in-functions) that accept OIDs as argument types and return OIDs, and [operators](functions-and-operators.html#operators) that operate on OIDs and other data types.

## Size

A `OID` value is 32 bits in width.

## See also

- [Data Types](data-types.html)
- [Functions and Operators](functions-and-operators.html)
