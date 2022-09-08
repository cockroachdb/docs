---
title: REASSIGN OWNED
summary: The REASSIGN OWNED statement changes the ownership of all objects in the current database that are owned by a specific role or user.
toc: true
docs_area: reference.sql
---

The `REASSIGN OWNED` statement changes the [ownership](security-reference/authorization.html#object-ownership) of all database objects (i.e., tables, types, or schemas) in the current database that are currently owned by a specific [role](security-reference/authorization.html#roles) or [user](security-reference/authorization.html#sql-users).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{{site.data.alerts.callout_success}}
To change the ownership of any single object (e.g., a table or a database), use the [`OWNER TO`](owner-to.html) subcommand of the object's [`ALTER` statement](sql-statements.html).
{{site.data.alerts.end}}

## Required privileges

- To reassign ownership with `REASSIGN OWNED`, the user must be a member of the current owner's role and a member of the target owner's role.
- Members of the [`admin` role](security-reference/authorization.html#admin-role) can always use `REASSIGN OWNED BY`.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/reassign_owned_by.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`role_spec_list` | The source role, or a comma-separated list of source roles.
`role_spec` | The target role.

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Change the owner of all tables in a database

Suppose that the current owner of the `users`, `vehicles`, and `rides` tables in the `movr` database is a role named `cockroachlabs`.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE cockroachlabs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE movr TO cockroachlabs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users OWNER TO cockroachlabs;
> ALTER TABLE vehicles OWNER TO cockroachlabs;
> ALTER TABLE rides OWNER TO cockroachlabs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  |     owner     | estimated_row_count | locality
--------------+----------------------------+-------+---------------+---------------------+-----------
  public      | promo_codes                | table | demo          |                1000 | NULL
  public      | rides                      | table | cockroachlabs |                 500 | NULL
  public      | user_promo_codes           | table | demo          |                   0 | NULL
  public      | users                      | table | cockroachlabs |                  50 | NULL
  public      | vehicle_location_histories | table | demo          |                1000 | NULL
  public      | vehicles                   | table | cockroachlabs |                  15 | NULL
(6 rows)
~~~

Now suppose you want to change the owner for all of the tables owned by `cockroachlabs` to a new role named `movrlabs`.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE ROLE movrlabs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE movr TO movrlabs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REASSIGN OWNED BY cockroachlabs TO movrlabs;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  |  owner   | estimated_row_count | locality
--------------+----------------------------+-------+----------+---------------------+-----------
  public      | promo_codes                | table | demo     |                1000 | NULL
  public      | rides                      | table | movrlabs |                 500 | NULL
  public      | user_promo_codes           | table | demo     |                   0 | NULL
  public      | users                      | table | movrlabs |                  50 | NULL
  public      | vehicle_location_histories | table | demo     |                1000 | NULL
  public      | vehicles                   | table | movrlabs |                  15 | NULL
(6 rows)
~~~

## See also

- [Authorization](authorization.html)
- [`OWNER TO`](owner-to.html)
- [`SHOW TABLES`](show-tables.html)
- [SQL Statements](sql-statements.html)
