---
title: RENAME COLUMN
summary: The RENAME COLUMN statement changes the name of a column in a table.
toc: true
---

The `RENAME COLUMN` [statement](sql-statements.html) changes the name of a column in a table.

{{site.data.alerts.callout_info}}
It is not possible to rename a column referenced by a view. For more details, see [View Dependencies](views.html#view-dependencies).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rename_column.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS` | Rename the column only if a table of `table_name` exists; if one does not exist, do not return an error.
 `table_name` | The name of the table with the column you want to use.
 `current_name` | The current name of the column.
 `name` | The [`name`](sql-grammar.html#name) you want to use for the column, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Rename a column

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    id INT PRIMARY KEY,
    first_name STRING,
    family_name STRING
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users RENAME COLUMN family_name TO last_name;
~~~

~~~
  table_name |                 create_statement
+------------+--------------------------------------------------+
  users      | CREATE TABLE users (
             |     id INT8 NOT NULL,
             |     first_name STRING NULL,
             |     last_name STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, first_name, last_name)
             | )
(1 row)
~~~

### Add and rename columns atomically

Some subcommands can be used in combination in a single [`ALTER TABLE`](alter-table.html) statement. For example, let's say you create a `users` table with 2 columns, an `id` column for the primary key and a `name` column for each user's last name:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
    id INT PRIMARY KEY,
    name STRING
  );
~~~

Then you decide you want distinct columns for each user's first name, last name, and full name, so you execute a single `ALTER TABLE` statement renaming `name` to `last_name`, adding `first_name`, and adding a [computed column](computed-columns.html) called `name` that concatenates `first_name` and `last_name`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users
    RENAME COLUMN name TO last_name,
    ADD COLUMN first_name STRING,
    ADD COLUMN name STRING
      AS (CONCAT(first_name, ' ', last_name)) STORED;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                           create_statement
+------------+----------------------------------------------------------------------+
  users      | CREATE TABLE users (
             |     id INT8 NOT NULL,
             |     last_name STRING NULL,
             |     first_name STRING NULL,
             |     name STRING NULL AS (concat(first_name, ' ', last_name)) STORED,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, last_name, first_name, name)
             | )
(1 row)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
- [`RENAME CONSTRAINT`](rename-constraint.html)
- [`SHOW JOBS`](show-jobs.html)
