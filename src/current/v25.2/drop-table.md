---
title: DROP TABLE
summary: The DROP TABLE statement removes a table and all its indexes from a database.
toc: true
docs_area: reference.sql
---

The `DROP TABLE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) removes a table and all its indexes from a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the specified table(s). If `CASCADE` is used, the user must have the privileges required to drop each dependent object as well.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/drop_table.html %}</div>

## Parameters

Parameter | Description
----------|------------
`IF EXISTS`   | Drop the table if it exists; if it does not exist, do not return an error.
`table_name_list`  | A comma-separated list of table names. To find table names, use [`SHOW TABLES`]({% link {{ page.version.version }}/show-tables.md %}).
`CASCADE` | Drop all objects (such as [constraints]({% link {{ page.version.version }}/constraints.md %}) and [views]({% link {{ page.version.version }}/views.md %})) that depend on the table.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT`    | _(Default)_ Do not drop the table if any objects (such as [constraints]({% link {{ page.version.version }}/constraints.md %}) and [views]({% link {{ page.version.version }}/views.md %})) depend on it.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Remove a table (no dependencies)

In this example, other objects do not depend on the table being dropped.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr;
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

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE promo_codes;
~~~

~~~
DROP TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(5 rows)
~~~

### Remove a table and dependent objects with `CASCADE`

In this example, a [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) from a different table references the table being dropped. Therefore, it's only possible to drop the table while simultaneously dropping the dependent foreign key constraint using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE users;
~~~

~~~
pq: "users" is referenced by foreign key from table "vehicles"
~~~

To see how `users` is referenced from `vehicles`, you can use the [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %}) statement. `SHOW CREATE` shows how the columns in a table are created, including data types, default values, indexes, and constraints.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
  table_name |                                         create_statement
-------------+---------------------------------------------------------------------------------------------------
  vehicles   | CREATE TABLE public.vehicles (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     type VARCHAR NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status VARCHAR NULL,
             |     current_location VARCHAR NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT vehicles_pkey PRIMARY KEY (city ASC, id ASC),
             |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES public.users(city, id),
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | )
(1 row)
~~~


{% include_cached copy-clipboard.html %}
~~~sql
> DROP TABLE users CASCADE;
~~~

~~~
DROP TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(4 rows)
~~~

Use a `SHOW CREATE TABLE` statement to verify that the foreign key constraint has been removed from `vehicles`.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
  table_name |                                       create_statement
-------------+------------------------------------------------------------------------------------------------
  vehicles   | CREATE TABLE public.vehicles (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     type VARCHAR NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status VARCHAR NULL,
             |     current_location VARCHAR NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | )
(1 row)
~~~

## See also

- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`INSERT`]({% link {{ page.version.version }}/insert.md %})
- [`ALTER TABLE ... RENAME TO`]({% link {{ page.version.version }}/alter-table.md %}#rename-to)
- [`SHOW COLUMNS`]({% link {{ page.version.version }}/show-columns.md %})
- [`SHOW TABLES`]({% link {{ page.version.version }}/show-tables.md %})
- [`UPDATE`]({% link {{ page.version.version }}/update.md %})
- [`DELETE`]({% link {{ page.version.version }}/delete.md %})
- [`DROP INDEX`]({% link {{ page.version.version }}/drop-index.md %})
- [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
