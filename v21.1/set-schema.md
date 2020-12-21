---
title: SET SCHEMA
summary: The SET SCHEMA statement changes the schema of a table, sequence, or view.
toc: true
---

 The `SET SCHEMA` [statement](sql-statements.html) changes the [schema](sql-name-resolution.html) of a [table](create-table.html), [sequence](create-sequence.html), or [view](create-view.html).

{{site.data.alerts.callout_info}}
`SET SCHEMA` is a subcommand of [`ALTER TABLE`](alter-table.html), [`ALTER SEQUENCE`](alter-sequence.html), and [`ALTER VIEW`](alter-view.html).

CockroachDB also supports `SET SCHEMA` as an [alias for setting the `search_path` session variable](set-vars.html#supported-variables).
{{site.data.alerts.end}}

## Required privileges

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the table, sequence, or view, and the `CREATE` privilege on the schema.

## Syntax

### Tables

~~~
ALTER TABLE [IF EXISTS] <name> SET SCHEMA <newschemaname>
~~~

### Sequences

~~~
ALTER SEQUENCE [IF EXISTS] <name> SET SCHEMA <newschemaname>
~~~

### Views

~~~
ALTER [MATERIALIZED] VIEW [IF EXISTS] <name> SET SCHEMA <newschemaname>
~~~

## Parameters

 Parameter | Description
-----------|-------------
 `name` | The name of the table, sequence, or view to alter.
 `newschemaname` | The name of the table's new schema.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Change the schema of a table

Suppose you want to add the `promo_codes` table to a new schema called `cockroach_labs`.

By default, [unqualified tables](sql-name-resolution.html#lookup-with-unqualified-names) created in the database belong to the `public` schema:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |                1000
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(6 rows)
~~~

If the new schema does not already exist, [create it](create-schema.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the table's schema:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE promo_codes SET SCHEMA cockroach_labs;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
   schema_name   |         table_name         | type  | estimated_row_count
-----------------+----------------------------+-------+----------------------
  cockroach_labs | promo_codes                | table |                1000
  public         | rides                      | table |                 500
  public         | user_promo_codes           | table |                   0
  public         | users                      | table |                  50
  public         | vehicle_location_histories | table |                1000
  public         | vehicles                   | table |                  15
(6 rows)
~~~

### Change the schema of a sequence

Suppose you [create a sequence](create-sequence.html) that you would like to add to a new schema called `cockroach_labs`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE even_numbers INCREMENT 2 START 2;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  public          | even_numbers
(1 row)
~~~

By default, [unqualified sequences](sql-name-resolution.html#lookup-with-unqualified-names) created in the database belong to the `public` schema:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE public.even_numbers;
~~~

~~~
      table_name      |                                        create_statement
----------------------+--------------------------------------------------------------------------------------------------
  public.even_numbers | CREATE SEQUENCE public.even_numbers MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 2 START 2
(1 row)
~~~

If the new schema does not already exist, [create it](create-schema.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the sequence's schema:

{% include copy-clipboard.html %}
~~~ sql
> ALTER SEQUENCE even_numbers SET SCHEMA cockroach_labs;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE public.even_numbers;
~~~

~~~
ERROR: relation "public.even_numbers" does not exist
SQLSTATE: 42P01
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema | sequence_name
------------------+----------------
  cockroach_labs  | even_numbers
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE cockroach_labs.even_numbers;
~~~

~~~
          table_name          |                                            create_statement
------------------------------+----------------------------------------------------------------------------------------------------------
  cockroach_labs.even_numbers | CREATE SEQUENCE cockroach_labs.even_numbers MINVALUE 1 MAXVALUE 9223372036854775807 INCREMENT 2 START 2
(1 row)
~~~

### Change the schema of a view

Suppose you create a new view that you want to add to a schema called `cockroach_labs`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE VIEW expensive_rides (id, revenue) AS SELECT id, revenue FROM rides WHERE revenue > 50;
~~~

By default, [unqualified views](sql-name-resolution.html#lookup-with-unqualified-names) created in the database belong to the `public` schema:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE public.expensive_rides;
~~~

~~~
        table_name       |                                                 create_statement
-------------------------+-------------------------------------------------------------------------------------------------------------------
  public.expensive_rides | CREATE VIEW public.expensive_rides (id, revenue) AS SELECT id, revenue FROM movr.public.rides WHERE revenue > 50
(1 row)
~~~

If the new schema does not already exist, [create it](create-schema.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the view's schema:

{% include copy-clipboard.html %}
~~~ sql
> ALTER VIEW expensive_rides SET SCHEMA cockroach_labs;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE public.expensive_rides;
~~~

~~~
ERROR: relation "public.expensive_rides" does not exist
SQLSTATE: 42P01
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE cockroach_labs.expensive_rides;
~~~

~~~
            table_name           |                                                     create_statement
---------------------------------+---------------------------------------------------------------------------------------------------------------------------
  cockroach_labs.expensive_rides | CREATE VIEW cockroach_labs.expensive_rides (id, revenue) AS SELECT id, revenue FROM movr.public.rides WHERE revenue > 50
(1 row)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`ALTER VIEW`](alter-view.html)
- [`CREATE SCHEMA`](drop-table.html)
- [`SHOW SCHEMAS`](show-jobs.html)
- [Other SQL Statements](sql-statements.html)
