---
title: COMMENT ON
summary: The COMMENT ON statement associates comments to databases, tables, columns, indexes, or types.
toc: true
docs_area: reference.sql
---

The `COMMENT ON` [statement]({% link {{ page.version.version }}/sql-statements.md %}) associates comments to [databases]({% link {{ page.version.version }}/create-database.md %}), [tables]({% link {{ page.version.version }}/create-table.md %}), [columns]({% link {{ page.version.version }}/alter-table.md %}#add-column), [indexes]({% link {{ page.version.version }}/indexes.md %}), or [types]({% link {{page.version.version}}/show-types.md %}).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the object they are commenting on.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/comment.html %}
</div>

## Parameters

 Parameter | Description
------------|--------------
`database_name` | The name of the [database]({% link {{ page.version.version }}/create-database.md %}) on which you are commenting.
`schema_name` |  The name of the [schema]({% link {{ page.version.version }}/create-schema.md %}) on which you are commenting.
`type_name` | The name of the [type]({% link {{ page.version.version }}/show-types.md %}) on which you are commenting.
`table_name` | The name of the [table]({% link {{ page.version.version }}/create-table.md %}) on which you are commenting.
`column_name` | The name of the [column]({% link {{ page.version.version }}/alter-table.md %}#add-column) on which you are commenting.
`table_index_name` | The name of the [index]({% link {{ page.version.version }}/indexes.md %}) on which you are commenting.
`comment_text` | The comment ([`STRING`]({% link {{ page.version.version }}/string.md %})) you are associating to the object.  You can remove a comment by replacing the string with `NULL`.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Add a comment to a database

To add a comment to a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON DATABASE movr IS 'This database contains information about users, vehicles, and rides.';
~~~

To view database comments, use [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES WITH COMMENT;
~~~

~~~
  database_name | owner | primary_region | regions | survival_goal |                               comment
----------------+-------+----------------+---------+---------------+-----------------------------------------------------------------------
  defaultdb     | root  | NULL           | {}      | NULL          | NULL
  movr          | demo  | NULL           | {}      | NULL          | This database contains information about users, vehicles, and rides.
  postgres      | root  | NULL           | {}      | NULL          | NULL
  system        | node  | NULL           | {}      | NULL          | NULL
(4 rows)
~~~

### Add a comment to a table

To add a comment to a table:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE vehicles IS 'This table contains information about vehicles registered with MovR.';
~~~

To view table comments, use [`SHOW TABLES`]({% link {{ page.version.version }}/show-tables.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr WITH COMMENT;
~~~

~~~
          table_name         |                               comment
+----------------------------+----------------------------------------------------------------------+
  users                      |
  vehicles                   | This table contains information about vehicles registered with MovR.
  rides                      |
  vehicle_location_histories |
  promo_codes                |
  user_promo_codes           |
(6 rows)
~~~

 You can also view comments on a table with [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
  table_name |                                          create_statement
-------------+------------------------------------------------------------------------------------------------------
  vehicles   | CREATE TABLE vehicles (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     type VARCHAR NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status VARCHAR NULL,
             |     current_location VARCHAR NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users(city, id),
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | );
             | COMMENT ON TABLE vehicles IS 'This table contains information about vehicles registered with MovR.'
(1 row)
~~~

### Add a comment to a column

To add a comment to a column:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON COLUMN users.credit_card IS 'This column contains user payment information.';
~~~

To view column comments, use [`SHOW COLUMNS`]({% link {{ page.version.version }}/show-columns.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users WITH COMMENT;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |   indices    | is_hidden |                    comment
--------------+-----------+-------------+----------------+-----------------------+--------------+-----------+-------------------------------------------------
  id          | UUID      |      f      | NULL           |                       | {users_pkey} |     f     | NULL
  city        | VARCHAR   |      f      | NULL           |                       | {users_pkey} |     f     | NULL
  name        | VARCHAR   |      t      | NULL           |                       | {users_pkey} |     f     | NULL
  address     | VARCHAR   |      t      | NULL           |                       | {users_pkey} |     f     | NULL
  credit_card | VARCHAR   |      t      | NULL           |                       | {users_pkey} |     f     | This column contains user payment information.
(5 rows)
~~~

### Add a comment to an index

Suppose we [create an index]({% link {{ page.version.version }}/create-index.md %}) on the `name` column of the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users(name);
~~~

To add a comment to the index:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON INDEX users_name_idx IS 'This index improves performance on queries that filter by name.';
~~~

To view column comments, use [`SHOW INDEXES ... WITH COMMENT`]({% link {{ page.version.version }}/show-index.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users WITH COMMENT;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible |                             comment
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+---------+------------------------------------------------------------------
  users      | users_name_idx |     t      |            1 | name        | ASC       |    f    |    f     |    t    | This index improves performance on queries that filter by name.
  users      | users_name_idx |     t      |            2 | city        | ASC       |    f    |    t     |    t    | This index improves performance on queries that filter by name.
  users      | users_name_idx |     t      |            3 | id          | ASC       |    f    |    t     |    t    | This index improves performance on queries that filter by name.
  users      | users_pkey     |     f      |            1 | city        | ASC       |    f    |    f     |    t    | NULL
  users      | users_pkey     |     f      |            2 | id          | ASC       |    f    |    f     |    t    | NULL
  users      | users_pkey     |     f      |            3 | name        | N/A       |    t    |    f     |    t    | NULL
  users      | users_pkey     |     f      |            4 | address     | N/A       |    t    |    f     |    t    | NULL
  users      | users_pkey     |     f      |            5 | credit_card | N/A       |    t    |    f     |    t    | NULL
(8 rows)
~~~

### Add a comment to a type

Issue a SQL statement to [create a type]({% link {{ page.version.version }}/create-type.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TYPE IF NOT EXISTS my_point AS (x FLOAT, y FLOAT, z FLOAT);
~~~

To view the type you just created, use [`SHOW TYPES`]({% link {{page.version.version}}/show-types.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TYPES;
~~~

~~~
  schema |   name   | owner
---------+----------+--------
  public | my_point | root
(1 row)
~~~

To add a comment on the type, use a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMENT ON TYPE my_point IS '3D point';
~~~

To view all comments on types, make a [selection query]({% link {{page.version.version}}/select-clause.md %}) against the `system.comments` table:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM system.comments;
~~~

~~~
  type | object_id | sub_id | comment
-------+-----------+--------+-----------
     7 |       112 |      0 | 3D POINT
(1 row)
~~~

### Remove a comment from a database

To remove a comment from a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON DATABASE movr IS NULL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES WITH COMMENT;
~~~

~~~
  database_name | owner | primary_region | regions | survival_goal | comment
----------------+-------+----------------+---------+---------------+----------
  defaultdb     | root  | NULL           | {}      | NULL          | NULL
  movr          | demo  | NULL           | {}      | NULL          | NULL
  postgres      | root  | NULL           | {}      | NULL          | NULL
  system        | node  | NULL           | {}      | NULL          | NULL
(4 rows)
~~~

### Remove a comment from a type

To remove the comment from the type you created in the [preceding example](#add-a-comment-to-a-type), add a `NULL` comment:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMENT ON TYPE my_point IS NULL;
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/comment-on-limitations.md %}

## See also

- [`CREATE DATABASE`]({% link {{ page.version.version }}/create-database.md %})
- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`ADD COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#add-column)
- [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %})
- [`SHOW TABLES`]({% link {{ page.version.version }}/show-tables.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [dBeaver]({% link {{ page.version.version }}/dbeaver.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
