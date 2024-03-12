---
title: System Catalogs
summary: CockroachDB includes several virtual schemas that enable you to interface with CockroachDB.
toc: true
docs_area: reference.sql
---

CockroachDB includes a set of system catalogs that provide non-stored data to client applications.

The following system catalogs are available as schemas preloaded to every database:

- [`information_schema`]({% link {{ page.version.version }}/information-schema.md %}), a schema provided for compatibility with the SQL standard.
- [`crdb_internal`]({% link {{ page.version.version }}/crdb-internal.md %}), a schema with information about CockroachDB internals.
- [`pg_catalog`]({% link {{ page.version.version }}/pg-catalog.md %}),  a schema provided for compatibility with PostgreSQL.
- [`pg_extension`]({% link {{ page.version.version }}/pg-extension.md %}), a schema catalog with information about CockroachDB extensions.

{{site.data.alerts.callout_danger}}
Tables in the system catalogs have varying levels of stability. Not all system catalog tables are meant for programmatic purposes. For more information, see [API Support Policy]({% link {{ page.version.version }}/api-support-policy.md %}).
{{site.data.alerts.end}}

To see all of the system catalogs for the [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database), you can use a [`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %}) statement:

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

- [`SHOW`]({% link {{ page.version.version }}/show-vars.md %})
- [`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %})
- [SQL Name Resolution]({% link {{ page.version.version }}/sql-name-resolution.md %})
