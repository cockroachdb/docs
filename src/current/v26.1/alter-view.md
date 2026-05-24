---
title: ALTER VIEW
summary: The ALTER VIEW statement applies a schema change to a view.
toc: true
docs_area: reference.sql
---

The `ALTER VIEW` [statement]({% link {{ page.version.version }}/sql-statements.md %}) applies a schema change to a [view]({% link {{ page.version.version }}/views.md %}).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

- To alter a view, the user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the parent database.
- To change the schema of a view with `ALTER VIEW ... SET SCHEMA`, or to change the name of a view with `ALTER VIEW ... RENAME TO`, the user must also have the `DROP` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the view.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_view.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`MATERIALIZED` |  Rename a [materialized view]({% link {{ page.version.version }}/views.md %}#materialized-views).
`IF EXISTS` | Rename the view only if a view of `view_name` exists; if one does not exist, do not return an error.
`view_name` | The name of the view to rename. To find existing view names, use:<br><br>`SELECT * FROM information_schema.tables WHERE table_type = 'VIEW';`
`view_new_name` | The new name of the view. The name of the view must be unique to its database and follow these [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers). Name changes do not propagate to the table(s) using the view.
`schema_name` | The name of the new schema.
`role_spec` |  The role to set as the owner of the view.

## Known limitations

{% include {{ page.version.version }}/known-limitations/alter-view-limitations.md %}

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

By default, [unqualified views]({% link {{ page.version.version }}/sql-name-resolution.md %}#lookup-with-unqualified-names) created in the database belong to the `public` schema:

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

If the new schema does not already exist, [create it]({% link {{ page.version.version }}/create-schema.md %}):

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

- [Views]({% link {{ page.version.version }}/views.md %})
- [`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})

<!-- REF DOC DRAFT: The following content was auto-generated. Please integrate into the sections above and remove this comment block. -->

## ALTER VIEW SET OPTIONS

```yaml
---
title: ALTER VIEW SET OPTIONS
summary: Set options on an existing view to control privilege behavior.
toc: true
docs_area: reference.sql
---
```

Use the `ALTER VIEW SET OPTIONS` statement to configure options on an existing view. Currently, this statement supports setting the `SECURITY_INVOKER` option, which controls whether the view executes with the privileges of the view creator or the user invoking the view.

## Required privileges

The user must be the owner of the view.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~
ALTER VIEW [IF EXISTS] view_name SET (option_name = option_value)
~~~

## Parameters

| Parameter | Description |
|-----------|-------------|
| `IF EXISTS` | Do not return an error if the view does not exist |
| `view_name` | The name of the view to modify |
| `option_name` | The name of the option to set. Currently supports `SECURITY_INVOKER` |
| `option_value` | The value for the option. For `SECURITY_INVOKER`, accepts `TRUE`, `FALSE`, or an integer constant |

## Supported options

| Option | Description | Default |
|--------|-------------|---------|
| `SECURITY_INVOKER` | When `TRUE`, the view executes with the privileges of the user invoking the view. When `FALSE`, the view executes with the privileges of the view creator | `FALSE` |

## Examples

### Set security invoker to true

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIEW my_view SET (SECURITY_INVOKER = TRUE);
~~~

### Set security invoker to false

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIEW my_view SET (SECURITY_INVOKER = FALSE);
~~~

### Set security invoker with IF EXISTS

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIEW IF EXISTS my_view SET (SECURITY_INVOKER = TRUE);
~~~

## See also

- [`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %})
- [`ALTER VIEW RESET OPTIONS`]({% link {{ page.version.version }}/alter-view-reset-options.md %})
- [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})

---

## ALTER VIEW RESET OPTIONS

```yaml
---
title: ALTER VIEW RESET OPTIONS
summary: Reset view options to their default values.
toc: true
docs_area: reference.sql
---
```

Use the `ALTER VIEW RESET OPTIONS` statement to reset view options to their default values. This statement currently supports resetting the `SECURITY_INVOKER` option.

## Required privileges

The user must be the owner of the view.

## Synopsis

{% include_cached copy-clipboard.html %}
~~~
ALTER VIEW [IF EXISTS] view_name RESET (option_name)
~~~

## Parameters

| Parameter | Description |
|-----------|-------------|
| `IF EXISTS` | Do not return an error if the view does not exist |
| `view_name` | The name of the view to modify |
| `option_name` | The name of the option to reset. Currently supports `SECURITY_INVOKER` |

## Examples

### Reset security invoker option

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIEW my_view RESET (SECURITY_INVOKER);
~~~

### Reset with IF EXISTS

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIEW IF EXISTS my_view RESET (SECURITY_INVOKER);
~~~

## See also

- [`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %})
- [`ALTER VIEW SET OPTIONS`]({% link {{ page.version.version }}/alter-view-set-options.md %})
- [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})

---

## CREATE VIEW (enhanced)

{{site.data.alerts.callout_info}}
The `CREATE VIEW` statement has been enhanced to support the `WITH` clause for setting view options.
{{site.data.alerts.end}}

### Enhanced synopsis

{% include_cached copy-clipboard.html %}
~~~
CREATE [OR REPLACE] [TEMP | TEMPORARY] VIEW [IF NOT EXISTS] view_name [(column_list)]
  [WITH (option_name = option_value)]
  AS select_stmt
~~~

### Additional parameters for WITH clause

| Parameter | Description |
|-----------|-------------|
| `WITH (option_name = option_value)` | Set view options during creation |

### Examples with view options

#### Create a view with security invoker enabled

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIEW secure_view WITH (SECURITY_INVOKER = TRUE) AS 
  SELECT * FROM sensitive_table WHERE user_id = current_user();
~~~

#### Create or replace a view with security invoker disabled

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE VIEW public_view WITH (SECURITY_INVOKER = FALSE) AS
  SELECT id, name FROM users;
~~~

## Version compatibility

{{site.data.alerts.callout_info}}
View options including `SECURITY_INVOKER` are supported in CockroachDB v26.2 and later.
{{site.data.alerts.end}}

## Behavior notes

- The `SECURITY_INVOKER` option controls privilege context for view execution:
  - When `TRUE` (security invoker), the view executes with the privileges of the current user
  - When `FALSE` (security definer, default), the view executes with the privileges of the view creator
- This setting affects both privilege checks and Row-Level Security (RLS) policy application
- Previously, CockroachDB views used creator privileges for access control but invoker context for RLS, leading to inconsistent behavior [HUMAN REVIEW: Verify this behavior description is accurate]

<!-- END REF DOC DRAFT -->
