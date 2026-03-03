---
title: SHOW SCHEMAS
summary: The SHOW SCHEMAS statement lists the schemas in a database.
toc: true
docs_area: reference.sql
---

The `SHOW SCHEMAS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists all [schemas]({% link {{ page.version.version }}/sql-name-resolution.md %}#naming-hierarchy) in a database.

## Required privileges

The `CONNECT` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the database is required to list the schemas in a database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_schemas.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to show [schemas]({% link {{ page.version.version }}/sql-name-resolution.md %}#naming-hierarchy). When omitted, the schemas in the [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database) are listed.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show schemas in the current database

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA org_one;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  org_one
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

## See also

- [Logical Schemas and Namespaces]({% link {{ page.version.version }}/sql-name-resolution.md %})
- [`CREATE SCHEMA`]({% link {{ page.version.version }}/create-schema.md %})
- [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %})
- [Information Schema]({% link {{ page.version.version }}/information-schema.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
