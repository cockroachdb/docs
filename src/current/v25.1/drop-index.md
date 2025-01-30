---
title: DROP INDEX
summary: The DROP INDEX statement removes indexes from tables.
toc: true
docs_area: reference.sql
---

The `DROP INDEX` [statement]({{ page.version.version }}/sql-statements.md) removes indexes from tables.


## Synopsis


## Required privileges

The user must have the `CREATE` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on each specified table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS`	| Drop the named indexes if they exist; if they do not exist, do not return an error.
 `table_name`	| The name of the table with the index you want to drop. Find table names with [`SHOW TABLES`]({{ page.version.version }}/show-tables.md).
 `index_name`	| The name of the index you want to drop. Find index names with [`SHOW INDEX`]({{ page.version.version }}/show-index.md).<br/><br/>You cannot drop a table's primary index.
 `CASCADE`	| Drop all objects (such as [constraints]({{ page.version.version }}/constraints.md)) that depend on the indexes. `CASCADE` does not list objects it drops, so should be used cautiously.<br><br> To drop an index created with [`CREATE UNIQUE INDEX`]({{ page.version.version }}/create-index.md#unique-indexes), you do not need to use `CASCADE`.
 `RESTRICT`	| _(Default)_ Do not drop the indexes if any objects (such as [constraints]({{ page.version.version }}/constraints.md)) depend on them.
 `CONCURRENTLY` |  Optional, no-op syntax for PostgreSQL compatibility. All indexes are dropped concurrently in CockroachDB.

## Viewing schema changes


## Examples


### Remove an index with no dependencies

{{site.data.alerts.callout_danger}}
{{site.data.alerts.end}}

Suppose you create an index on the `name` and `city` columns of the `users` table:

~~~ sql
> CREATE INDEX ON users (name, city);
~~~

~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name |     index_name      | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+---------------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_name_city_idx |     t      |            1 | name        | ASC       |    f    |    f     |    t
  users      | users_name_city_idx |     t      |            2 | city        | ASC       |    f    |    f     |    t
  users      | users_name_city_idx |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey          |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey          |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey          |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey          |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey          |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

You can drop this index with the `DROP INDEX` statement:

~~~ sql
> DROP INDEX users@users_name_city_idx;
~~~

~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_pkey |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(5 rows)
~~~

### Remove an index and dependent objects with `CASCADE`

{{site.data.alerts.callout_danger}}
<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.
{{site.data.alerts.end}}

Suppose you create a [`UNIQUE`]({{ page.version.version }}/unique.md) constraint on the `id` and `name` columns of the `users` table:

~~~ sql
> ALTER TABLE users ADD CONSTRAINT id_name_unique UNIQUE (id, name);
~~~

~~~ sql
> SHOW CONSTRAINTS from users;
~~~

~~~
  table_name | constraint_name | constraint_type |            details             | validated
-------------+-----------------+-----------------+--------------------------------+------------
  users      | id_name_unique  | UNIQUE          | UNIQUE (id ASC, name ASC)      |     t
  users      | users_pkey      | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC) |     t
(2 rows)
~~~

If no index exists on `id` and `name`, CockroachDB automatically creates an index:

~~~ sql
> SHOW INDEXES from users;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | id_name_unique |     f      |            1 | id          | ASC       |    f    |    f     |    t
  users      | id_name_unique |     f      |            2 | name        | ASC       |    f    |    f     |    t
  users      | id_name_unique |     f      |            3 | city        | ASC       |    t    |    t     |    t
  users      | users_pkey     |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

The `UNIQUE` constraint is dependent on the `id_name_unique` index, so you cannot drop the index with a simple `DROP INDEX` statement:

~~~ sql
> DROP INDEX id_name_unique;
~~~

~~~
ERROR: index "id_name_unique" is in use as unique constraint
SQLSTATE: 2BP01
HINT: use CASCADE if you really want to drop it.
~~~

To drop an index and its dependent objects, you can use `CASCADE`:

~~~ sql
> DROP INDEX id_name_unique CASCADE;
~~~

~~~ sql
> SHOW INDEXES from users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_pkey |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(5 rows)
~~~

~~~ sql
> SHOW CONSTRAINTS from users;
~~~

~~~
  table_name | constraint_name | constraint_type |            details             | validated
-------------+-----------------+-----------------+--------------------------------+------------
  users      | users_pkey      | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC) |   true
(1 row)
~~~

## See also

- [Indexes]({{ page.version.version }}/indexes.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)
- [`SHOW JOBS`]({{ page.version.version }}/show-jobs.md)