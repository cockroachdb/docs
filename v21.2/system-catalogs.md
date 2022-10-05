---
title: System Catalogs
summary: CockroachDB includes several virtual schemas that enable you to interface with CockroachDB.
toc: true
docs_area: reference.sql
---

CockroachDB includes a set of system catalogs that provide non-stored data to client applications.

The following system catalogs are available as schemas preloaded to every database:

- [`information_schema`](information-schema.html), a schema provided for compatibility with the SQL standard.
- [`crdb_internal`](crdb-internal.html), a schema with information about CockroachDB internals.
- [`pg_catalog`](pg-catalog.html),  a schema provided for compatibility with PostgreSQL.
- [`pg_extension`](pg-extension.html), a schema catalog with information about CockroachDB extensions.

{{site.data.alerts.callout_danger}}
Tables in the system catalogs have varying levels of stability. Not all system catalog tables are meant for programmatic purposes.
{{site.data.alerts.end}}

To see all of the system catalogs for the [current database](sql-name-resolution.html#current-database), you can use a [`SHOW SCHEMAS`](show-schemas.html) statement:

{% include_cached copy-clipboard.html %}
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
