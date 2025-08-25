---
title: OID
summary: The OID data type stores an unsigned 32-bit integer value.
toc: true
docs_area: reference.sql
---

The object identifier (`OID`) [data type]({% link {{ page.version.version }}/data-types.md %}) stores an unsigned 32-bit integer value.

OIDs are used internally as primary keys for tables in [system catalogs]({% link {{ page.version.version }}/system-catalogs.md %}), notably `information_schema` and `pg_catalog`.

CockroachDB supports many [functions]({% link {{ page.version.version }}/functions-and-operators.md %}#built-in-functions) that accept OIDs as argument types and return OIDs, and [operators]({% link {{ page.version.version }}/functions-and-operators.md %}#operators) that operate on OIDs and other data types. These functions are used by drivers and ORMs and you can use these functions to introspect your schema.

## Size

A `OID` value is 32 bits in width.

## Best practices

You **should not**:

- Use OIDs in user-created tables. Values of this type are not guaranteed to be stable across major releases.
- Rely on OIDs to be globally unique. Each OID subtype is unique only within a certain namespace.

## See also

- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
- [System Catalogs]({% link {{ page.version.version }}/system-catalogs.md %})
