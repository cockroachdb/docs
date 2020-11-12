---
title: Virtual Schemas
summary: CockroachDB includes several virtual schemas that enable you to interface with CockroachDB.
toc: true
---

In addition to the `public` schema, CockroachDB includes set of virtual schemas, available in every database, that provide non-stored data to client applications.

The following virtual schemas are included with CockroachDB:

- `pg_catalog`, provided for compatibility with PostgreSQL.
- [`information_schema`](information-schema.html), provided for compatibility with the SQL standard.
- [`crdb_internal`](crdb-internal.html), provided for introspection into CockroachDB internals.
- <span class="version-tag">New in v20.2</span>: `pg_extension`, provided for compatibility with PostgreSQL.

{{site.data.alerts.callout_danger}}
Tables in virtual schemas have varying levels of stability. Not all virtual schema tables are meant for programmatic purposes.
{{site.data.alerts.end}}

## See also

- [`SHOW`](show-vars.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [SQL Name Resolution](sql-name-resolution.html)
- [information_schema](information-schema.html)
- [crdb_internal](crdb-internal.html)
