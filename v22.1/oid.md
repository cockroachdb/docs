---
title: OID
summary: The OID data type stores an unsigned 32-bit integer value.
toc: true
docs_area: reference.sql
---

The object identifier (`OID`) [data type](data-types.html) stores an unsigned 32-bit integer value.

OIDs are used internally as primary keys for tables in [system catalogs](system-catalogs.html), notably `information_schema` and `pg_catalog`.

CockroachDB supports many [functions](functions-and-operators.html#built-in-functions) that accept OIDs as argument types and return OIDs, and [operators](functions-and-operators.html#operators) that operate on OIDs and other data types. These functions are used by drivers and ORMs and you can use these functions to introspect your schema.

## Size

A `OID` value is 32 bits in width.

## Limitations

You **should not**:

- Use OIDs in user-created tables. Values of this type are not guaranteed to be stable across major releases.
- Rely on OIDs to be globally unique. Each OID subtype is unique only within a certain namespace.

## See also

- [Data Types](data-types.html)
- [Functions and Operators](functions-and-operators.html)
- [System Catalogs](system-catalogs.html)
