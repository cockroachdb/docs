---
title: DROP INDEX
summary: The DROP INDEX statement removes indexes from tables.
toc: true
---

The `DROP INDEX` [statement](sql-statements.html) removes indexes from tables.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_index.html %}</section>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on each specified table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS`	| Drop the named indexes if they exist; if they do not exist, do not return an error.
 `table_name`	| The name of the table with the index you want to drop. Find table names with [`SHOW TABLES`](show-tables.html).
 `index_name`	| The name of the index you want to drop. Find index names with [`SHOW INDEX`](show-index.html).<br/><br/>You cannot drop a table's `primary` index.
 `CASCADE`	| Drop all objects (such as [constraints](constraints.html)) that depend on the indexes. `CASCADE` does not list objects it drops, so should be used cautiously.<br><br> To drop an index created with [`CREATE UNIQUE INDEX`](create-index.html#unique-indexes), you do not need to use `CASCADE`.
 `RESTRICT`	| _(Default)_ Do not drop the indexes if any objects (such as [constraints](constraints.html)) depend on them.
 `CONCURRENTLY` |  Optional, no-op syntax for PostgreSQL compatibility. All indexes are dropped concurrently in CockroachDB.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Remove an index with no dependencies

Suppose you create an index on the `name` and `city` columns of the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name, city);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name |     index_name      | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+---------------------+------------+--------------+-------------+-----------+---------+-----------
  users      | primary             |   false    |            1 | city        | ASC       |  false  |  false
  users      | primary             |   false    |            2 | id          | ASC       |  false  |  false
  users      | users_name_city_idx |    true    |            1 | name        | ASC       |  false  |  false
  users      | users_name_city_idx |    true    |            2 | city        | ASC       |  false  |  false
  users      | users_name_city_idx |    true    |            3 | id          | ASC       |  false  |   true
(5 rows)
~~~

You can drop this index with the `DROP INDEX` statement:

{% include copy-clipboard.html %}
~~~ sql
> DROP INDEX users@users_name_city_idx;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+------------+------------+--------------+-------------+-----------+---------+-----------
  users      | primary    |   false    |            1 | city        | ASC       |  false  |  false
  users      | primary    |   false    |            2 | id          | ASC       |  false  |  false
(2 rows)
~~~

### Remove an index and dependent objects with `CASCADE`

{{site.data.alerts.callout_danger}}
<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.
{{site.data.alerts.end}}

Suppose you create a [`UNIQUE`](unique.html) constraint on the `id` and `name` columns of the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD CONSTRAINT id_name_unique UNIQUE (id, name);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS from users;
~~~

~~~
  table_name | constraint_name | constraint_type |            details             | validated
-------------+-----------------+-----------------+--------------------------------+------------
  users      | id_name_unique  | UNIQUE          | UNIQUE (id ASC, name ASC)      |   true
  users      | primary         | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC) |   true
(2 rows)
~~~

If no index exists on `id` and `name`, CockroachDB automatically creates an index:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES from users;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+----------------+------------+--------------+-------------+-----------+---------+-----------
  users      | primary        |   false    |            1 | city        | ASC       |  false  |  false
  users      | primary        |   false    |            2 | id          | ASC       |  false  |  false
  users      | id_name_unique |   false    |            1 | id          | ASC       |  false  |  false
  users      | id_name_unique |   false    |            2 | name        | ASC       |  false  |  false
  users      | id_name_unique |   false    |            3 | city        | ASC       |  false  |   true
(5 rows)
~~~

The `UNIQUE` constraint is dependent on the `id_name_unique` index, so you cannot drop the index with a simple `DROP INDEX` statement:

{% include copy-clipboard.html %}
~~~ sql
> DROP INDEX id_name_unique;
~~~

~~~
ERROR: index "id_name_unique" is in use as unique constraint
SQLSTATE: 2BP01
HINT: use CASCADE if you really want to drop it.
~~~

To drop an index and its dependent objects, you can use `CASCADE`:

{% include copy-clipboard.html %}
~~~ sql
> DROP INDEX id_name_unique CASCADE;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES from users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+------------+------------+--------------+-------------+-----------+---------+-----------
  users      | primary    |   false    |            1 | city        | ASC       |  false  |  false
  users      | primary    |   false    |            2 | id          | ASC       |  false  |  false
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS from users;
~~~

~~~
  table_name | constraint_name | constraint_type |            details             | validated
-------------+-----------------+-----------------+--------------------------------+------------
  users      | primary         | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC) |   true
(1 row)
~~~

## See Also

- [Indexes](indexes.html)
- [Online Schema Changes](online-schema-changes.html)
- [`SHOW JOBS`](show-jobs.html)
