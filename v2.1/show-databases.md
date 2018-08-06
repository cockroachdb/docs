---
title: SHOW DATABASES
summary: The SHOW DATABASES statement lists all database in the CockroachDB cluster.
keywords: reflection
toc: true
---

The `SHOW DATABASES` [statement](sql-statements.html) lists all databases in the CockroachDB cluster.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_databases.html %}
</div>

## Required privileges

No [privileges](privileges.html) are required to list the databases in the CockroachDB cluster.

## Example

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| defaultdb     |
| postgres      |
| system        |
+---------------+
(3 rows)
~~~

{% include {{page.version.version}}/default-databases.md %}

## See also

- [`SHOW SCHEMAS`](show-schemas.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
