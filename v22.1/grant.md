---
title: GRANT
summary: The GRANT statement grants user privileges for interacting with specific database objects and adds roles or users as a member of a role.
toc: true
docs_area: reference.sql
---

The `GRANT` [statement](sql-statements.html) controls each [role or user's](security-reference/authorization.html#users-and-roles) SQL privileges for interacting with specific [databases](create-database.html), [schemas](create-schema.html), [tables](create-table.html), or [user-defined types](enum.html). For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

You can use `GRANT` to directly grant privileges to a role or user, or you can grant membership to an existing role, which grants that role's privileges to the grantee. Users granted a privilege with `WITH GRANT OPTION` can in turn grant that privilege to others. The owner of an object implicitly has the `GRANT OPTION` for all privileges, and the `GRANT OPTION` is inherited through role memberships.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/grant.html %}
</div>

### Parameters

Parameter                 | Description
--------------------------|------------
`ALL`<br>`ALL PRIVILEGES` | Grant all [privileges](#supported-privileges).
`targets`                 | A comma-separated list of database or table names, preceded by the object type (e.g., `DATABASE mydatabase`).<br>{{site.data.alerts.callout_info}}To grant privileges on all tables in a database or schema, you can use `GRANT ... ON TABLE *`. For an example, see [Grant privileges on all tables in a database or schema](#grant-privileges-on-all-tables-in-a-database-or-schema).{{site.data.alerts.end}}
`name_list`               | A comma-separated list of [users](security-reference/authorization.html#create-and-manage-users) and/or [roles](security-reference/authorization.html#users-and-roles).
`target_types`            | A comma-separated list of [user-defined types](create-type.html).
`schema_name_list`        | A comma-separated list of [schemas](create-schema.html).
`ALL TABLES IN SCHEMA`    |  Grant privileges on all tables in a schema or list of schemas.
`privilege_list`          | A comma-separated list of [privileges](security-reference/authorization.html#managing-privileges) to grant.
`role_spec_list`          | A comma-separated list of source roles.
`WITH ADMIN OPTION`       | Designate the user as a role admin. Role admins can grant or [revoke](revoke.html) membership for the specified role.
`WITH GRANT OPTION`       | <span class="version-tag">New in v22.2:</span> Allow the user to grant the specified privilege to others.

## Supported privileges

Roles and users can be granted the following privileges:

{% include {{ page.version.version }}/sql/privileges.md %}

## Required privileges

- To grant privileges, the user granting the privileges must also have the privilege being granted on the target database or tables. For example, a user granting the `SELECT` privilege on a table to another user must have the `SELECT` privileges on that table and `WITH GRANT OPTION` on `SELECT`.

- To grant roles, the user granting role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role. To grant membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Details

### Granting privileges

- When a role or user is granted privileges for a database, new tables created in the database will inherit the privileges, but the privileges can then be changed.

    {{site.data.alerts.callout_info}}
    The user does not get privileges to existing tables in the database. To grant privileges to a user on all existing tables in a database, see [Grant privileges on all tables in a database](#grant-privileges-on-all-tables-in-a-database-or-schema)
    {{site.data.alerts.end}}

- When a role or user is granted privileges for a table, the privileges are limited to the table.
- The `root` user automatically belongs to the `admin` role and has the `ALL` privilege for new databases.
- For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

### Granting roles

- Users and roles can be members of roles.
- The `root` user is automatically created as an `admin` role and assigned the `ALL` privilege for new databases.
- All privileges of a role are inherited by all its members.
- Membership loops are not allowed (direct: `A is a member of B is a member of A` or indirect: `A is a member of B is a member of C ... is a member of A`).

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Grant privileges on databases

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER max WITH PASSWORD roach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE movr TO max WITH GRANT OPTION;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type  | is_grantable
----------------+---------+-----------------+--------------
  movr          | admin   | ALL             | true
  movr          | max     | ALL             | true
  movr          | root    | ALL             | true
(3 rows)
~~~

### Grant privileges on specific tables in a database

{% include copy-clipboard.html %}
~~~ sql
> GRANT DELETE ON TABLE rides TO max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type  | is_grantable
----------------+-------------+------------+---------+-----------------+--------------
  movr          | public      | rides      | admin   | ALL             | true
  movr          | public      | rides      | max     | DELETE          | false
  movr          | public      | rides      | root    | ALL             | true
(3 rows)
~~~

### Grant privileges on all tables in a database or schema

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT ON TABLE movr.public.* TO max;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE movr.public.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type  | is_grantable
----------------+-------------+----------------------------+---------+-----------------+--------------
  movr          | public      | promo_codes                | admin   | ALL             | true
  movr          | public      | promo_codes                | max     | SELECT          | false
  movr          | public      | promo_codes                | root    | ALL             | true
  movr          | public      | rides                      | admin   | ALL             | true
  movr          | public      | rides                      | max     | DELETE          | false
  movr          | public      | rides                      | max     | SELECT          | false
  movr          | public      | rides                      | root    | ALL             | true
  movr          | public      | user_promo_codes           | admin   | ALL             | true
  movr          | public      | user_promo_codes           | max     | SELECT          | false
  movr          | public      | user_promo_codes           | root    | ALL             | true
  movr          | public      | users                      | admin   | ALL             | true
  movr          | public      | users                      | max     | SELECT          | false
  movr          | public      | users                      | root    | ALL             | true
  movr          | public      | vehicle_location_histories | admin   | ALL             | true
  movr          | public      | vehicle_location_histories | max     | SELECT          | false
  movr          | public      | vehicle_location_histories | root    | ALL             | true
  movr          | public      | vehicles                   | admin   | ALL             | true
  movr          | public      | vehicles                   | max     | SELECT          | false
  movr          | public      | vehicles                   | root    | ALL             | true
(19 rows)
~~~

### Make a table readable to every user in the system

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT ON TABLE vehicles TO public;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE vehicles;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type  | is_grantable
----------------+-------------+------------+---------+-----------------+--------------
  movr          | public      | vehicles   | admin   | ALL             | true
  movr          | public      | vehicles   | max     | SELECT          | false
  movr          | public      | vehicles   | public  | SELECT          | false
  movr          | public      | vehicles   | root    | ALL             | true
(4 rows)
~~~

### Grant privileges on schemas

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA cockroach_labs;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON SCHEMA cockroach_labs TO max WITH GRANT OPTION;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type  | is_grantable
----------------+----------------+---------+-----------------+--------------
  movr          | cockroach_labs | admin   | ALL             | true
  movr          | cockroach_labs | max     | ALL             | true
  movr          | cockroach_labs | root    | ALL             | true
(3 rows)
~~~

### Grant privileges on user-defined types

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('available', 'unavailable');
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON TYPE status TO max WITH GRANT OPTION;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type  | is_grantable
----------------+-------------+-----------+---------+-----------------+--------------
  movr          | public      | status    | admin   | ALL             | true
  movr          | public      | status    | demo    | ALL             | false
  movr          | public      | status    | max     | ALL             | true
  movr          | public      | status    | public  | USAGE           | false
  movr          | public      | status    | root    | ALL             | true
(5 rows)
~~~

### Grant the privilege to manage the replication zones for a database or table

{% include copy-clipboard.html %}
~~~ sql
> GRANT ZONECONFIG ON TABLE rides TO max;
~~~

The user `max` can then use the [`CONFIGURE ZONE`](configure-zone.html) statement to add, modify, reset, or remove replication zones for the table `rides`.

### Grant role membership

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE developer WITH CREATEDB;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER abbey WITH PASSWORD lincoln;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT developer TO abbey;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin  | is_grantable
------------+--------+-----------+-----------
  developer | abbey  |  false    | false
(1 row)
~~~

### Grant the admin option

{% include copy-clipboard.html %}
~~~ sql
> GRANT developer TO abbey WITH ADMIN OPTION;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin  | is_grantable
------------+--------+-----------+-----------
  developer | abbey  |   true    | true
(1 row)
~~~

### Grant privileges with the option to grant to others

{% include copy-clipboard.html %}
~~~ sql
> GRANT UPDATE ON TABLE rides TO max WITH GRANT OPTION;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type  | is_grantable
----------------+-------------+------------+---------+-----------------+--------------
  movr          | public      | rides      | admin   | ALL             | true
  movr          | public      | rides      | max     | UPDATE          | true
  movr          | public      | rides      | root    | ALL             | true
(3 rows)
~~~

## See also

- [Authorization](authorization.html)
- [`REVOKE`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CONFIGURE ZONE`](configure-zone.html)
- [Manage Users](security-reference/authorization.html#create-and-manage-users)
