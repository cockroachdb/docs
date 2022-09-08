---
title: SHOW DATABASES
summary: The SHOW DATABASES statement lists all database in the CockroachDB cluster.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW DATABASES` [statement](sql-statements.html) lists all databases in the CockroachDB cluster.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_databases.html %}
</div>

## Required privileges

The user must be granted the `CONNECT` [privilege](security-reference/authorization.html#managing-privileges) to specific databases in order to list those databases in the CockroachDB cluster.

## Example

### Show databases

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
+---------------+
  defaultdb
  movr
  postgres
  startrek
  system
(5 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\l` [shell command](cockroach-sql.html#commands) to list all databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> \l
~~~

~~~
  database_name
+---------------+
  defaultdb
  movr
  postgres
  startrek
  system
(5 rows)
~~~

### Show databases with comments

You can use [`COMMENT ON`](comment-on.html) to add comments on a database.

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON DATABASE movr IS 'This database holds information about users, vehicles, and rides.';
~~~

To view a database's comments:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES WITH COMMENT;
~~~

~~~
  database_name |                              comment
+---------------+-------------------------------------------------------------------+
  defaultdb     | NULL
  movr          | This database holds information about users, vehicles, and rides.
  postgres      | NULL
  startrek      | NULL
  system        | NULL
(5 rows)
~~~

For more information, see [`COMMENT ON`](comment-on.html).

## Preloaded databases

{% include {{ page.version.version }}/sql/preloaded-databases.md %}

## See also

- [`COMMENT ON`](comment-on.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [Information Schema](information-schema.html)
- [SQL Statements](sql-statements.html)
