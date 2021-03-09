---
title: Virtual Schemas
summary: CockroachDB includes several virtual schemas that enable you to interface with CockroachDB.
toc: true
---

In addition to the `public` schema, CockroachDB includes a set of virtual schemas that provide non-stored data to client applications.

The following virtual schemas are available in every database:

- [`information_schema`](information-schema.html), a virtual schema provided for compatibility with the SQL standard.
- [`crdb_internal`](crdb-internal.html), a virtual schema with information about CockroachDB internals.
- [`pg_catalog`](pg-catalog.html),  a virtual schema provided for compatibility with PostgreSQL.
- <span class="version-tag">New in v20.2</span>: [`pg_extension`](pg-extension.html), a virtual schema with information about CockroachDB extensions.

{{site.data.alerts.callout_danger}}
Tables in virtual schemas have varying levels of stability. Not all virtual schema tables are meant for programmatic purposes.
{{site.data.alerts.end}}

To see all of the virtual schemas in the [current database](sql-name-resolution.html#current-database), you can use a [`SHOW SCHEMAS`](show-schemas.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name     | owner
---------------------+--------
  crdb_internal      | NULL
  information_schema | NULL
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | admin
(5 rows)
~~~

## See also

- [`SHOW`](show-vars.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [SQL Name Resolution](sql-name-resolution.html)
