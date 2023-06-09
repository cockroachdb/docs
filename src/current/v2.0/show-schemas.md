---
title: SHOW SCHEMAS
summary: The SHOW SCHEMAS statement lists the schemas in a database.
toc: true
---

<span class="version-tag">New in v2.0:</span> The `SHOW SCHEMAS` [statement](sql-statements.html) lists all [schemas](sql-name-resolution.html#logical-schemas-and-namespaces) in a database.


## Required Privileges

No [privileges](privileges.html) are required to list the schemas in a database.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_schemas.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to show [schemas](sql-name-resolution.html#logical-schemas-and-namespaces). When omitted, the schemas in the [current database](sql-name-resolution.html#current-database) are listed.

## Example

~~~ sql
> SET DATABASE = bank;
~~~

~~~ sql
> SHOW SCHEMAS;
~~~

~~~
+--------------------+
|       Schema       |
+--------------------+
| crdb_internal      |
| information_schema |
| pg_catalog         |
| public             |
+--------------------+
(4 rows)
~~~

## See Also

- [Logical Schemas and Namespaces](sql-name-resolution.html)
- [`SHOW DATABASES`](show-databases.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
