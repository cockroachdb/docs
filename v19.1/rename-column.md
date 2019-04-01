---
title: RENAME COLUMN
summary: The RENAME COLUMN statement changes the name of a column in a table.
toc: true
---

The `RENAME COLUMN` [statement](sql-statements.html) changes the name of a column in a table.

{{site.data.alerts.callout_info}}
It is not possible to rename a column referenced by a view. For more details, see [View Dependencies](views.html#view-dependencies).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
<span class="version-tag">New in v19.1</span>: `RENAME COLUMN` can be used alongside other commands in a single [`ALTER TABLE`](alter-table.html) statement. For more details, see the [Add and rename columns atomically](#add-and-rename-columns-atomically) example.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rename_column.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS` | Rename the column only if a column of `current_name` exists; if one does not exist, do not return an error.
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

<span class="version-tag">New in v19.1</span>: `RENAME COLUMN` can be used alongside other commands in a single [`ALTER TABLE`](alter-table.html) statement. For example, let's say you create a `names` table with 3 columns:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE names (
    id INT PRIMARY KEY,
    first_name STRING,
    family_name STRING
  );
~~~

Then you both want to rename the `family_name` column to `last_name` and add a [computed column](computed-columns.html) that concatenates the `first_name` and `last_name` columns:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE names
    RENAME COLUMN family_name TO last_name,
    ADD COLUMN full_name STRING
      AS (CONCAT(first_name, ' ', last_name)) STORED;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE names;
~~~

~~~
  table_name |                             create_statement
+------------+---------------------------------------------------------------------------+
  names      | CREATE TABLE names (
             |     id INT8 NOT NULL,
             |     first_name STRING NULL,
             |     last_name STRING NULL,
             |     full_name STRING NULL AS (concat(first_name, ' ', last_name)) STORED,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, first_name, last_name, full_name)
             | )
(1 row)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
- [`RENAME CONSTRAINT`](rename-constraint.html)
