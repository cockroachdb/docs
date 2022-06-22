---
title: SHOW CREATE
summary: The SHOW CREATE statement shows the CREATE statement for an existing table, view, or sequence.
toc: true
---

The `SHOW CREATE` [statement](sql-statements.html) shows the `CREATE` statement for an existing [table](create-table.html), [view](create-view.html), or [sequence](create-sequence.html).

## Required privileges

The user must have any [privilege](authorization.html#assign-privileges) on the target table, view, or sequence.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_create.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`object_name` | The name of the table, view, or sequence for which to show the `CREATE` statement.

## Response

Field | Description
------|------------
`table_name` | The name of the table, view, or sequence.
`create_statement` | The `CREATE` statement for the table, view, or sequence.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show the `CREATE TABLE` statement for a table

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID NOT NULL,
    city STRING NOT NULL,
    name STRING,
    dl STRING UNIQUE,
    address STRING,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE drivers;
~~~

~~~
  table_name |                     create_statement
+------------+----------------------------------------------------------+
  drivers    | CREATE TABLE drivers (
             |     id UUID NOT NULL,
             |     city STRING NOT NULL,
             |     name STRING NULL,
             |     dl STRING NULL,
             |     address STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     UNIQUE INDEX drivers_dl_key (dl ASC),
             |     FAMILY "primary" (id, city, name, dl, address)
             | )
(1 row)
~~~

{{site.data.alerts.callout_info}}
`SHOW CREATE TABLE` also lists any partitions and zone configurations defined on primary and secondary indexes of a table. If partitions are defined, but no zones are configured, the `SHOW CREATE TABLE` output includes a warning.
{{site.data.alerts.end}}

### Show the `CREATE VIEW` statement for a view

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE VIEW user_view (city, name) AS SELECT city, name FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE user_view;
~~~

~~~
  table_name |                                create_statement
+------------+--------------------------------------------------------------------------------+
  user_view  | CREATE VIEW user_view (city, name) AS SELECT city, name FROM movr.public.users
(1 row)
~~~

### Show just a view's `SELECT` statement

To get just a view's `SELECT` statement, you can query the `views` table in the built-in `information_schema` database and filter on the view name:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT view_definition
  FROM information_schema.views
  WHERE table_name = 'user_view';
~~~

~~~
              view_definition
+------------------------------------------+
  SELECT city, name FROM movr.public.users
(1 row)
~~~

### Show the `CREATE SEQUENCE` statement for a sequence

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE desc_customer_list;
~~~

~~~
      table_name     |                                          create_statement
+--------------------+----------------------------------------------------------------------------------------------------+
  desc_customer_list | CREATE SEQUENCE desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1
(1 row)
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`CREATE TABLE`](create-sequence.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
