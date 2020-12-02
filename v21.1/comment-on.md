---
title: COMMENT ON
summary: The COMMENT ON statement associates comments to databases, tables, columns, or indexes.
toc: true
---

The `COMMENT ON` [statement](sql-statements.html) associates comments to [databases](create-database.html), [tables](create-table.html), [columns](add-column.html), or [indexes](indexes.html).

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the object they are commenting on.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/comment.html %}</section>

## Parameters

 Parameter | Description
------------|--------------
`database_name` | The name of the database you are commenting on.
`table_name` | The name of the  table you are commenting on.
`column_name` | The name of the column you are commenting on.
`table_index_name` | The name of the index you are commenting on.
`comment_text` | The comment ([`STRING`](string.html)) you are associating to the object.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Add a comment to a database

To add a comment to a database:

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON DATABASE movr IS 'This database contains information about users, vehicles, and rides.';
~~~

To view database comments, use [`SHOW DATABASES`](show-databases.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES WITH COMMENT;
~~~

~~~
  database_name |                              comment
+---------------+-------------------------------------------------------------------+
  defaultdb     | NULL
  movr          | This database contains information about users, vehicles, and rides.
  postgres      | NULL
  system        | NULL
(4 rows)
~~~

### Add a comment to a table

To add a comment to a table:

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE vehicles IS 'This table contains information about vehicles registered with MovR.';
~~~

To view table comments, use [`SHOW TABLES`](show-tables.html):

{% include copy-clipboard.html %}
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

 You can also view comments on a table with [`SHOW CREATE`](show-create.html):

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON COLUMN users.credit_card IS 'This column contains user payment information.';
~~~

To view column comments, use [`SHOW COLUMNS`](show-columns.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users WITH COMMENT;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden |                    comment
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+------------------------------------------------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false   | NULL
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false   | NULL
  name        | VARCHAR   |    true     | NULL           |                       | {}        |   false   | NULL
  address     | VARCHAR   |    true     | NULL           |                       | {}        |   false   | NULL
  credit_card | VARCHAR   |    true     | NULL           |                       | {}        |   false   | This column contains user payment information.
(5 rows)
~~~

### Add a comment to an index

Suppose we [create an index](create-index.html) on the `name` column of the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users(name);
~~~

To add a comment to the index:

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON INDEX users_name_idx IS 'This index improves performance on queries that filter by name.';
~~~

To view column comments, use [`SHOW INDEXES ... WITH COMMENT`](show-index.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users WITH COMMENT;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit |                             comment
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+------------------------------------------------------------------
  users      | primary        |   false    |            1 | city        | ASC       |  false  |  false   | NULL
  users      | primary        |   false    |            2 | id          | ASC       |  false  |  false   | NULL
  users      | users_name_idx |    true    |            1 | name        | ASC       |  false  |  false   | This index improves performance on queries that filter by name.
  users      | users_name_idx |    true    |            2 | city        | ASC       |  false  |   true   | This index improves performance on queries that filter by name.
  users      | users_name_idx |    true    |            3 | id          | ASC       |  false  |   true   | This index improves performance on queries that filter by name.
  users      | primary        |   false    |            1 | city        | ASC       |  false  |  false   | NULL
  users      | primary        |   false    |            2 | id          | ASC       |  false  |  false   | NULL
...
(15 rows)
~~~

## See also

- [`CREATE DATABASE`](create-database.html)
- [`CREATE TABLE`](create-table.html)
- [`ADD COLUMN`](add-column.html)
- [`CREATE INDEX`](create-index.html)
- [`SHOW TABLES`](show-tables.html)
- [Other SQL Statements](sql-statements.html)
- [dBeaver](dbeaver.html)
