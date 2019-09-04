---
title: Virtual Schemas
summary: CockroachDB includes several virtual schemas that enable you to interface with CockroachDB.
toc: true
---

In addition to the `public` [schema](sql-name-resolution.html#logical-schemas-and-namespaces), CockroachDB supports a fixed set of virtual schemas, available in every database, that provide ancillary, non-stored data to client applications.

The following virtual schemas are included with CockroachDB:

- [`information_schema`](information-schema.html), provided for compatibility with the SQL standard.
- [`crdb_internal`](crdb-internal.html), provided for introspection into CockroachDB internals.

{{site.data.alerts.callout_danger}}
Tables in virtual schemas have varying levels of stability. Not all virtual schema tables are meant for programmatic purposes. See [`information_schema`](information-schema.html) and [`crdb_internal`](crdb-internal.html) for more details.
{{site.data.alerts.end}}

## See also

- [`SHOW`](show-vars.html)
- [Logical Schemas and Namespaces](sql-name-resolution.html#logical-schemas-and-namespaces)
