---
title: ALTER VIEW
summary: The ALTER VIEW statement applies a schema change to a view.
toc: true
docs_area: reference.sql
---

The `ALTER VIEW` [statement]({{ page.version.version }}/sql-statements.md) applies a schema change to a [view]({{ page.version.version }}/views.md).


## Required privileges

- To alter a view, the user must have the `CREATE` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the parent database.
- To change the schema of a view with `ALTER VIEW ... SET SCHEMA`, or to change the name of a view with `ALTER VIEW ... RENAME TO`, the user must also have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the view.

## Syntax

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`MATERIALIZED` |  Rename a [materialized view]({{ page.version.version }}/views.md#materialized-views).
`IF EXISTS` | Rename the view only if a view of `view_name` exists; if one does not exist, do not return an error.
`view_name` | The name of the view to rename. To find existing view names, use:<br><br>`SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';`
`view_new_name` | The new name of the view. The name of the view must be unique to its database and follow these [identifier rules]({{ page.version.version }}/keywords-and-identifiers.md#identifiers). Name changes do not propagate to the table(s) using the view.
`schema_name` | The name of the new schema.
`role_spec` |  The role to set as the owner of the view.

## Known limitations


## Examples

### Rename a view

Suppose you create a new view that you want to rename:

~~~ sql
CREATE VIEW money_rides (id, revenue) AS SELECT id, revenue FROM rides WHERE revenue > 50;
~~~

~~~ sql
WITH x AS (SHOW TABLES) SELECT * FROM x WHERE type = 'view';
~~~

~~~
  schema_name | table_name  | type | owner | estimated_row_count | locality
--------------+-------------+------+-------+---------------------+-----------
  public      | money_rides | view | demo  |                   0 | NULL
(1 row)
~~~

~~~ sql
ALTER VIEW money_rides RENAME TO expensive_rides;
~~~
~~~
RENAME VIEW
~~~

~~~ sql
WITH x AS (SHOW TABLES) SELECT * FROM x WHERE type = 'view';
~~~

~~~
  schema_name |   table_name    | type | owner | estimated_row_count | locality
--------------+-----------------+------+-------+---------------------+-----------
  public      | expensive_rides | view | demo  |                   0 | NULL
(1 row)
~~~

Note that `RENAME TO` can be used to move a view from one database to another, but it cannot be used to move a view from one schema to another. To change a view's schema, [use the `SET SCHEMA` clause](#change-the-schema-of-a-view). In a future release, `RENAME TO` will be limited to changing the name of a view, and will not have the ability to change a view's database.

### Change the schema of a view

Suppose you want to add the `expensive_rides` view to a schema called `cockroach_labs`:

By default, [unqualified views]({{ page.version.version }}/sql-name-resolution.md#lookup-with-unqualified-names) created in the database belong to the `public` schema:

~~~ sql
SHOW CREATE public.expensive_rides;
~~~

~~~
        table_name       |                                                 create_statement
-------------------------+-------------------------------------------------------------------------------------------------------------------
  public.expensive_rides | CREATE VIEW public.expensive_rides (id, revenue) AS SELECT id, revenue FROM movr.public.rides WHERE revenue > 50
(1 row)
~~~

If the new schema does not already exist, [create it]({{ page.version.version }}/create-schema.md):

~~~ sql
CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the view's schema:

~~~ sql
ALTER VIEW expensive_rides SET SCHEMA cockroach_labs;
~~~

~~~ sql
SHOW CREATE public.expensive_rides;
~~~

~~~
ERROR: relation "public.expensive_rides" does not exist
SQLSTATE: 42P01
~~~

~~~ sql
SHOW CREATE cockroach_labs.expensive_rides;
~~~

~~~
            table_name           |                                                     create_statement
---------------------------------+---------------------------------------------------------------------------------------------------------------------------
  cockroach_labs.expensive_rides | CREATE VIEW cockroach_labs.expensive_rides (id, revenue) AS SELECT id, revenue FROM movr.public.rides WHERE revenue > 50
(1 row)
~~~

## See also

- [Views]({{ page.version.version }}/views.md)
- [`CREATE VIEW`]({{ page.version.version }}/create-view.md)
- [`SHOW CREATE`]({{ page.version.version }}/show-create.md)
- [`DROP VIEW`]({{ page.version.version }}/drop-view.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)