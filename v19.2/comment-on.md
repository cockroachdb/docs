---
title: COMMENT ON
summary: The COMMENT ON statement associates comments to databases, tables, or columns.
toc: true
---

The `COMMENT ON` [statement](sql-statements.html) associates comments to [databases](create-database.html), [tables](create-table.html), or [columns](add-column.html).

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
`comment_text` | The comment ([`STRING`](string.html)) you are associating to the object.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Add a comment to a database

To add a comment to a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON DATABASE movr IS 'This database contains information about users, vehicles, and rides.';
~~~

To view database comments, use [`SHOW DATABASES`](show-databases.html):

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE vehicles IS 'This table contains information about vehicles registered with MovR.';
~~~

To view table comments, use [`SHOW TABLES`](show-tables.html):

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

### Add a comment to a column

To add a comment to a column:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON COLUMN users.credit_card IS 'This column contains user payment information.';
~~~

To view column comments, use [`SHOW COLUMNS`](show-columns.html):

{% include_cached copy-clipboard.html %}
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


## See also

- [`CREATE DATABASE`](create-database.html)
- [`CREATE TABLE`](create-table.html)
- [`ADD COLUMN`](add-column.html)
- [`SHOW TABLES`](show-tables.html)
- [Other SQL Statements](sql-statements.html)
- [dBeaver](dbeaver.html)
