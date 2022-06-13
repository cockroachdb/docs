---
title: DROP COLUMN
summary: Use the ALTER COLUMN statement to remove columns from tables.
toc: true
docs_area: reference.sql
---

The `DROP COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and removes columns from a table.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{{site.data.alerts.callout_danger}}
When used in an explicit transaction combined with other schema changes to the same table, `DROP COLUMN` can result in data loss if one of the other schema changes fails or is canceled. To work around this, move the `DROP COLUMN` statement to its own explicit transaction or run it in a single statement outside the existing transaction.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
 By default, `DROP COLUMN` drops any [indexes](indexes.html) on the column being dropped, and any indexes that reference the column, including [partial indexes](partial-indexes.html) with predicates that reference the column and indexes with [`STORING` clauses](create-index.html#store-columns) that reference the column.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/drop_column.html %}</div>

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table with the column you want to drop.
 `name` | The name of the column you want to drop.<br><br>When a column with a `CHECK` constraint is dropped, the `CHECK` constraint is also dropped.
 `CASCADE` | Drop the column even if objects (such as [views](views.html)) depend on it; drop the dependent objects, as well. `CASCADE` will drop a column with a foreign key constraint if it is the only column in the reference.<br><br>`CASCADE` does not list the objects it drops, so should be used cautiously.<br><br> `CASCADE` is not required to drop an indexed column, or a column that is referenced by an index. By default, `DROP COLUMN` drops any [indexes](indexes.html) on the column being dropped, and any indexes that reference the column, including [partial indexes](partial-indexes.html) with predicates that reference the column and indexes with [`STORING` clauses](create-index.html#store-columns) that reference the column.
 `RESTRICT` | *(Default)* Do not drop the column if any objects (such as [views](views.html)) depend on it.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Drop a column

If you no longer want a column in a table, you can drop it.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {primary} |   false
(5 rows)
~~~

If there is data in the table, the `sql_safe_updates` [session variable](set-vars.html) must be set to `false`.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users DROP COLUMN credit_card;
~~~

~~~
ERROR: rejected (sql_safe_updates = true): ALTER TABLE DROP COLUMN will remove all data in that column
SQLSTATE: 01000
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET sql_safe_updates = false;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users DROP COLUMN credit_card;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {primary} |   false
(4 rows)
~~~

### Prevent dropping columns with dependent objects (`RESTRICT`)

If the column has dependent objects, such as [views](views.html), CockroachDB will not drop the column by default. However, if you want to be sure of the behavior you can include the `RESTRICT` clause.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE VIEW expensive_rides AS SELECT id, city FROM rides WHERE revenue > 90;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides DROP COLUMN revenue RESTRICT;
~~~

~~~
ERROR: cannot drop column "revenue" because view "expensive_rides" depends on it
SQLSTATE: 2BP01
HINT: you can drop expensive_rides instead.
~~~

### Drop a column and its dependent objects (`CASCADE`)

If you want to drop the column and all of its dependent options, include the `CASCADE` clause.

{{site.data.alerts.callout_danger}}
<code>CASCADE</code> does not list objects it drops, so should be used cautiously.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE expensive_rides;
~~~

~~~
    table_name    |                                              create_statement
------------------+-------------------------------------------------------------------------------------------------------------
  expensive_rides | CREATE VIEW public.expensive_rides (id, city) AS SELECT id, city FROM movr.public.rides WHERE revenue > 90
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides DROP COLUMN revenue CASCADE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE expensive_rides;
~~~

~~~
ERROR: relation "expensive_rides" does not exist
SQLSTATE: 42P01
~~~

### Drop an indexed column

 `DROP COLUMN` drops a column and any indexes on the column being dropped.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX start_end_idx ON rides(start_time, end_time);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW INDEXES FROM rides] WHERE index_name='start_end_idx';
~~~

~~~
  table_name |  index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+---------------+------------+--------------+-------------+-----------+---------+-----------
  rides      | start_end_idx |    true    |            1 | start_time  | ASC       |  false  |  false
  rides      | start_end_idx |    true    |            2 | end_time    | ASC       |  false  |  false
  rides      | start_end_idx |    true    |            3 | city        | ASC       |  false  |   true
  rides      | start_end_idx |    true    |            4 | id          | ASC       |  false  |   true
(4 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides DROP COLUMN start_time;
~~~

~~~
NOTICE: the data for dropped indexes is reclaimed asynchronously
HINT: The reclamation delay can be customized in the zone configuration for the table.
ALTER TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW INDEXES FROM rides] WHERE index_name='start_end_idx';
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+------------+------------+--------------+-------------+-----------+---------+-----------
(0 rows)
~~~

## See also

- [`DROP CONSTRAINT`](drop-constraint.html)
- [`DROP INDEX`](drop-index.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
- [Online Schema Changes](online-schema-changes.html)
