---
title: ALTER VIEW
summary: The ALTER VIEW statement applies a schema change to a view.
toc: true
docs_area: reference.sql
---

The `ALTER VIEW` [statement](sql-statements.html) applies a schema change to a [view](views.html).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

- To alter a view, the user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the parent database.
- To change the schema of a view with `ALTER VIEW ... SET SCHEMA`, or to change the database of a view with `ALTER VIEW ... RENAME TO`, the user must also have the `DROP` [privilege](security-reference/authorization.html#managing-privileges) on the view.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_view.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`MATERIALIZED` |  Rename a [materialized view](views.html#materialized-views).
`IF EXISTS` | Rename the view only if a view of `view_name` exists; if one does not exist, do not return an error.
`view_name` | The name of the view to rename. To find existing view names, use:<br><br>`SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';`
`view_new_name` | The new name of the view. The name of the view must be unique to its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). Name changes do not propagate to the table(s) using the view.
`schema_name` | The name of the new schema.
`role_spec` |  The role to set as the owner of the view.

## Limitations

CockroachDB does not currently support:

- Changing the [`SELECT`](select-clause.html) statement executed by a view. Instead, you must drop the existing view and create a new view.
- Renaming a view that other views depend on. This feature may be added in the future (see [tracking issue](https://github.com/cockroachdb/cockroach/issues/10083)).

## Examples

### Rename a view

Suppose you create a new view that you want to rename:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIEW money_rides (id, revenue) AS SELECT id, revenue FROM rides WHERE revenue > 50;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW TABLES) SELECT * FROM x WHERE type = 'view';
~~~

~~~
  schema_name | table_name  | type | owner | estimated_row_count | locality
--------------+-------------+------+-------+---------------------+-----------
  public      | money_rides | view | demo  |                   0 | NULL
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIEW money_rides RENAME TO expensive_rides;
~~~
~~~
RENAME VIEW
~~~

{% include_cached copy-clipboard.html %}
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

By default, [unqualified views](sql-name-resolution.html#lookup-with-unqualified-names) created in the database belong to the `public` schema:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE public.expensive_rides;
~~~

~~~
        table_name       |                                                 create_statement
-------------------------+-------------------------------------------------------------------------------------------------------------------
  public.expensive_rides | CREATE VIEW public.expensive_rides (id, revenue) AS SELECT id, revenue FROM movr.public.rides WHERE revenue > 50
(1 row)
~~~

If the new schema does not already exist, [create it](create-schema.html):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEMA IF NOT EXISTS cockroach_labs;
~~~

Then, change the view's schema:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIEW expensive_rides SET SCHEMA cockroach_labs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE public.expensive_rides;
~~~

~~~
ERROR: relation "public.expensive_rides" does not exist
SQLSTATE: 42P01
~~~

{% include_cached copy-clipboard.html %}
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

- [Views](views.html)
- [`CREATE VIEW`](create-view.html)
- [`SHOW CREATE`](show-create.html)
- [`DROP VIEW`](drop-view.html)
- [Online Schema Changes](online-schema-changes.html)
