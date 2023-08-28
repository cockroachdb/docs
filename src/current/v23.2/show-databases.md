---
title: SHOW DATABASES
summary: The SHOW DATABASES statement lists all database in the CockroachDB cluster.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW DATABASES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists all databases in the CockroachDB cluster.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_databases.html %}
</div>

## Required privileges

The user must be granted the `CONNECT` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) to specific databases in order to list those databases in the CockroachDB cluster.

## Example

### Show databases

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name | owner | primary_region | secondary_region | regions | survival_goal
----------------+-------+----------------+------------------+---------+----------------
  defaultdb     | root  | NULL           | NULL             | {}      | NULL
  movr          | demo  | NULL           | NULL             | {}      | NULL
  postgres      | root  | NULL           | NULL             | {}      | NULL
  system        | node  | NULL           | NULL             | {}      | NULL
(4 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\l` [shell command]({% link {{ page.version.version }}/cockroach-sql.md %}#commands) to list all databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> \l
~~~

~~~
  database_name | owner | primary_region | secondary_region | regions | survival_goal
----------------+-------+----------------+------------------+---------+----------------
  defaultdb     | root  | NULL           | NULL             | {}      | NULL
  movr          | demo  | NULL           | NULL             | {}      | NULL
  postgres      | root  | NULL           | NULL             | {}      | NULL
  system        | node  | NULL           | NULL             | {}      | NULL
(4 rows)
~~~

### Show databases with comments

You can use [`COMMENT ON`]({% link {{ page.version.version }}/comment-on.md %}) to add comments on a database.

{% include_cached copy-clipboard.html %}
~~~ sql
COMMENT ON DATABASE movr IS 'This database holds information about users, vehicles, and rides.';
~~~

To view a database's comments:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES WITH COMMENT;
~~~

~~~
   database_name | owner | primary_region | secondary_region | regions | survival_goal |                              comment
----------------+-------+----------------+------------------+---------+---------------+--------------------------------------------------------------------
  defaultdb     | root  | NULL           | NULL             | {}      | NULL          | NULL
  movr          | demo  | NULL           | NULL             | {}      | NULL          | This database holds information about users, vehicles, and rides.
  postgres      | root  | NULL           | NULL             | {}      | NULL          | NULL
  system        | node  | NULL           | NULL             | {}      | NULL          | NULL
(4 rows)
~~~

For more information, see [`COMMENT ON`]({% link {{ page.version.version }}/comment-on.md %}).

## Preloaded databases

{% include {{ page.version.version }}/sql/preloaded-databases.md %}

## See also

- [`COMMENT ON`]({% link {{ page.version.version }}/comment-on.md %})
- [`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %})
- [Information Schema]({% link {{ page.version.version }}/information-schema.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
