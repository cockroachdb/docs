---
title: SET SCHEMA
summary: The SET SCHEMA statement changes the schema of a table or function.
toc: true
docs_area: reference.sql
---

The `SET SCHEMA` [statement](sql-statements.html) changes the [schema](sql-name-resolution.html) of a [table](create-table.html) or a [function](create-function.html).

{{site.data.alerts.callout_info}}
`SET SCHEMA` is a subcommand of [`ALTER TABLE`](alter-table.html) and [`ALTER FUNCTION`](alter-function.html).

CockroachDB also supports `SET SCHEMA` as an [alias for setting the `search_path` session variable](set-vars.html#supported-variables).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the table or function, and the `CREATE` privilege on the schema.

## Syntax

### Tables

~~~
ALTER TABLE [IF EXISTS] <name> SET SCHEMA <newschemaname>
~~~

### Functions

~~~
ALTER FUNCTION <name> SET SCHEMA <newschemaname>
~~~

## Parameters

 Parameter | Description
-----------|-------------
 `name` | The name of the table or function to alter.
 `newschemaname` | The name of the new schema.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Change the schema of a table

Suppose you want to add the `promo_codes` table to a new schema called `cockroach_labs`.

By default, [unqualified tables](sql-name-resolution.html#lookup-with-unqualified-names) created in the database belong to the `public` schema:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the table's schema:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE promo_codes SET SCHEMA cockroach_labs;
~~~

{% include_cached copy-clipboard.html %}
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

## See also

- [`ALTER TABLE`](alter-table.html)
- [`CREATE SCHEMA`](drop-table.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
