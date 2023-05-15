---
title: ALTER TABLE ... RENAME TO
summary: The ALTER TABLE ... RENAME TO statement changes the name of a table.
toc: true
---

The `RENAME TO` [statement](sql-statements.html) is part of [`ALTER TABLE`](alter-table.html), and changes the name of a table. It can also be used to move a table from one database to another.

{{site.data.alerts.callout_info}}
It is not possible to rename a table referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.
{{site.data.alerts.end}}

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the table and the `CREATE` on the parent database. When moving a table from one database to another, the user must have the `CREATE` privilege on both the source and target databases.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rename_table.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS` | Rename the table only if a table with the current name exists; if one does not exist, do not return an error.
 `current_name` | The current name of the table.
 `new_name` | The new name of the table, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Rename a table

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db1;
~~~

~~~
+------------+
| table_name |
+------------+
| t1         |
| t2         |
+------------+
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE db1.t1 RENAME TO db1.t3
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db1;
~~~

~~~
+------------+
| table_name |
+------------+
| t2         |
| t3         |
+------------+
(2 rows)
~~~

To avoid an error in case the table does not exist, you can include `IF EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE IF EXISTS db1.table1 RENAME TO db1.table2;
~~~

### Move a table

To move a table from one database to another, use the above syntax but specify the source database after `ALTER TABLE` and the target database after `RENAME TO`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db1;
~~~

~~~
+------------+
| table_name |
+------------+
| t2         |
| t3         |
+------------+
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db2;
~~~

~~~
+------------+
| table_name |
+------------+
+------------+
(0 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE db1.t3 RENAME TO db2.t3;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db1;
~~~

~~~
+--------+
| Table  |
+--------+
| table2 |
+--------+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db2;
~~~

~~~
+------------+
| table_name |
+------------+
| t3         |
+------------+
(1 row)
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW TABLES`](show-tables.html)
- [`DROP TABLE`](drop-table.html)
- [`SHOW JOBS`](show-jobs.html)
- [Other SQL Statements](sql-statements.html)
