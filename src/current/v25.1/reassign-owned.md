---
title: REASSIGN OWNED
summary: The REASSIGN OWNED statement changes the ownership of all objects in the current database that are owned by a specific role or user.
toc: true
docs_area: reference.sql
---

The `REASSIGN OWNED` statement changes the [ownership]({{ page.version.version }}/security-reference/authorization.md#object-ownership) of all database objects (i.e., tables, types, or schemas) in the current database that are currently owned by a specific [role]({{ page.version.version }}/security-reference/authorization.md#roles) or [user]({{ page.version.version }}/security-reference/authorization.md#sql-users).


{{site.data.alerts.callout_success}}
To change the ownership of any single object (e.g., a table or a database), use the `OWNER TO` subcommand of the object's [`ALTER` statement]({{ page.version.version }}/sql-statements.md).
{{site.data.alerts.end}}

## Required privileges

- To reassign ownership with `REASSIGN OWNED`, the user must be a member of the current owner's role and a member of the target owner's role.
- Members of the [`admin` role]({{ page.version.version }}/security-reference/authorization.md#admin-role) can always use `REASSIGN OWNED BY`.

## Syntax

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`role_spec_list` | The source role, or a comma-separated list of source roles.
`role_spec` | The target role.

## Example


### Change the owner of all tables in a database

Suppose that the current owner of the `users`, `vehicles`, and `rides` tables in the `movr` database is a role named `cockroachlabs`.

~~~ sql
> CREATE ROLE cockroachlabs;
~~~

~~~ sql
> GRANT CREATE ON DATABASE movr TO cockroachlabs;
~~~

~~~ sql
> ALTER TABLE users OWNER TO cockroachlabs;
> ALTER TABLE vehicles OWNER TO cockroachlabs;
> ALTER TABLE rides OWNER TO cockroachlabs;
~~~

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

~~~ sql
> CREATE ROLE movrlabs;
~~~

~~~ sql
> GRANT CREATE ON DATABASE movr TO movrlabs;
~~~

~~~ sql
> REASSIGN OWNED BY cockroachlabs TO movrlabs;
~~~

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

- [Authorization]({{ page.version.version }}/authorization.md)
- [`ALTER TABLE ... OWNER TO`]({{ page.version.version }}/alter-table.md#owner-to)
- [`SHOW TABLES`]({{ page.version.version }}/show-tables.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)