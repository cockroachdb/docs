---
title: SHOW GRANTS
summary: The SHOW GRANTS statement lists the privileges granted to users.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW GRANTS` [statement](sql-statements.html) lists one of the following:

- The [roles](security-reference/authorization.html#sql-users) granted to [users](security-reference/authorization.html#sql-users) in a cluster.
- The [privileges](security-reference/authorization.html#managing-privileges) [granted](grant.html) to [users](security-reference/authorization.html#sql-users) on [databases](create-database.html), [schemas](create-schema.html), [tables](create-table.html), or [user-defined types](enum.html).

## Syntax

### Show privilege grants

Use the following syntax to show the privileges granted to users on database objects:

~~~
SHOW GRANTS [ON [DATABASE | SCHEMA | TABLE | TYPE] <targets...>] [FOR <users...>]
~~~

When `DATABASE` is omitted, the schema, tables, and types in the [current database](sql-name-resolution.html#current-database) are listed.

### Show role grants

Use the following syntax to the show the role grants for users in a cluster.

~~~
SHOW GRANTS ON ROLE [<roles...>] [FOR <users...>]
~~~

## Parameters

Parameter    | Description
-------------|-----------------------------------------------------------------------------------------------------
`targets`    | A comma-separated list of database, schema, table, or user-defined type names.<br><br>{{site.data.alerts.callout_info}}To list the privilege grants for all tables in the current database, you can use `SHOW GRANTS ON TABLE *`.{{site.data.alerts.end}}
`users`      | A comma-separated list of the [users](security-reference/authorization.html#sql-users) whose privileges or roles you want to show.
`roles`      | A comma-separated list of the roles whose grants you want to show.

## Response

### Privilege grants

The `SHOW GRANTS ON [DATABASE | SCHEMA | TABLE | TYPE]` statement can return the following fields, depending on the target object specified:

Field            | Description
-----------------|-----------------------------------------------------------------------------------------------------
`database_name`  | The name of the database.
`schema_name`    | The name of the schema.
`table_name`     | The name of the table.
`type_name`      | The name of the user-defined type.
`grantee`        | The name of the user or role that was granted the [privilege](security-reference/authorization.html#managing-privileges).
`privilege_type` | The name of the privilege.
`is_grantable`   | {% include_cached new-in.html version="v22.1" %} `TRUE` if the grantee has the grant option on the object; `FALSE` if not.

### Role grants

The `SHOW GRANTS ON ROLE` statement returns the following fields:

Field        |  Description
-------------|-----------------------------------------------------------------------------------------------------
`role_name`  | The name of the role.
`member`     | The users in the role.
`is_admin`   | If `true`, the role is an [admin](security-reference/authorization.html#role-admin) role.

## Required privileges

- No [privileges](security-reference/authorization.html#managing-privileges) are required to view privileges granted to users.

- For `SHOW GRANTS ON ROLES`, the user must have the [`SELECT`](select-clause.html) [privilege](security-reference/authorization.html#managing-privileges) on the system table.

## Examples

### Show all grants

To list all grants for all users and roles on the current database and its tables:

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS;
~~~

~~~
  database_name |    schema_name     |           relation_name           | grantee | privilege_type  | is_grantable
----------------+--------------------+-----------------------------------+---------+-----------------+--------------
  movr          | crdb_internal      | NULL                              | admin   | ALL             | true
  movr          | crdb_internal      | NULL                              | root    | ALL             | true
  movr          | crdb_internal      | backward_dependencies             | public  | SELECT          | false
  movr          | crdb_internal      | builtin_functions                 | public  | SELECT          | false
...
(365 rows)
~~~

### Show a specific user or role's grants

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
> SHOW GRANTS FOR max;
~~~

~~~
  database_name |    schema_name     | relation_name | grantee | privilege_type  | is_grantable
----------------+--------------------+---------------+---------+-----------------+--------------
  movr          | crdb_internal      | NULL          | max     | ALL             | true
  movr          | information_schema | NULL          | max     | ALL             | true
  movr          | pg_catalog         | NULL          | max     | ALL             | true
  movr          | pg_extension       | NULL          | max     | ALL             | true
  movr          | public             | NULL          | max     | ALL             | true
(5 rows)
~~~

### Show grants on databases

**Specific database, all users and roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name |    schema_name     | grantee | privilege_type  | is_grantable
----------------+--------------------+---------+-----------------+--------------
  movr          | crdb_internal      | admin   | ALL             | true
  movr          | crdb_internal      | max     | ALL             | false
  movr          | crdb_internal      | root    | ALL             | true
  movr          | information_schema | admin   | ALL             | true
  movr          | information_schema | max     | ALL             | false
  movr          | information_schema | root    | ALL             | true
  movr          | pg_catalog         | admin   | ALL             | true
  movr          | pg_catalog         | max     | ALL             | false
  movr          | pg_catalog         | root    | ALL             | true
  movr          | pg_extension       | admin   | ALL             | true
  movr          | pg_extension       | max     | ALL             | false
  movr          | pg_extension       | root    | ALL             | true
  movr          | public             | admin   | ALL             | true
  movr          | public             | max     | ALL             | false
  movr          | public             | root    | ALL             | true
(15 rows)
~~~

**Specific database, specific user or role:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE movr FOR max;
~~~

~~~
  database_name |    schema_name     | grantee | privilege_type  | is_grantable
----------------+--------------------+---------+-----------------+--------------
  movr          | crdb_internal      | max     | ALL             | false
  movr          | information_schema | max     | ALL             | false
  movr          | pg_catalog         | max     | ALL             | false
  movr          | pg_extension       | max     | ALL             | false
  movr          | public             | max     | ALL             | false
(5 rows)
~~~

### Show grants on tables

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON TABLE users TO max WITH GRANT OPTION;
~~~

**Specific table, all users and roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE users;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type  | is_grantable
----------------+-------------+------------+---------+-----------------+---------------
  movr          | public      | users      | admin   | ALL             | true
  movr          | public      | users      | max     | ALL             | true
  movr          | public      | users      | root    | ALL             | true
(3 rows)
~~~

**Specific table, specific role or user:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE users FOR max;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type  | is_grantable
----------------+-------------+------------+---------+-----------------+---------------
  movr          | public      | users      | max     | ALL             | true
(1 row)
~~~

**All tables, all users and roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE *;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type  | is_grantable
----------------+-------------+----------------------------+---------+-----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL             | true
  movr          | public      | promo_codes                | root    | ALL             | true
  movr          | public      | rides                      | admin   | ALL             | true
  movr          | public      | rides                      | root    | ALL             | true
  movr          | public      | user_promo_codes           | admin   | ALL             | true
  movr          | public      | user_promo_codes           | root    | ALL             | true
  movr          | public      | users                      | admin   | ALL             | true
  movr          | public      | users                      | max     | ALL             | true
  movr          | public      | users                      | root    | ALL             | true
  movr          | public      | vehicle_location_histories | admin   | ALL             | true
  movr          | public      | vehicle_location_histories | root    | ALL             | true
  movr          | public      | vehicles                   | admin   | ALL             | true
  movr          | public      | vehicles                   | root    | ALL             | true
(13 rows)
~~~

**All tables, specific users or roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE * FOR max;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type  | is_grantable
----------------+-------------+------------+---------+-----------------+---------------
  movr          | public      | users      | max     | ALL             | true
(1 row)
~~~

### Show grants on schemas

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA cockroach_labs;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON SCHEMA cockroach_labs TO max WITH GRANT OPTION;
~~~

**Specific schema, all users or roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type  | is_grantable
----------------+----------------+---------+-----------------+---------------
  movr          | cockroach_labs | admin   | ALL             | true
  movr          | cockroach_labs | max     | ALL             | true
  movr          | cockroach_labs | root    | ALL             | true
(3 rows)
~~~

**Specific schema, specific users or roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON SCHEMA cockroach_labs FOR max;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type  | is_grantable
----------------+----------------+---------+-----------------+---------------
  movr          | cockroach_labs | max     | ALL             | true
(1 row)
~~~

### Show grants on user-defined types

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('available', 'unavailable');
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON TYPE status TO max WITH GRANT OPTION;
~~~

**Specific type, all users or roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type  | is_grantable
----------------+-------------+-----------+---------+-----------------+---------------
  movr          | public      | status    | admin   | ALL             | true
  movr          | public      | status    | max     | ALL             | true
  movr          | public      | status    | public  | USAGE           | true
  movr          | public      | status    | root    | ALL             | true
(4 rows)
~~~

**Specific type, specific users or roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TYPE status FOR max;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type  | is_grantable
----------------+-------------+-----------+---------+-----------------+---------------
  movr          | public      | status    | max     | ALL             | true
(1 row)
~~~

### Show role memberships

{% include copy-clipboard.html %}
~~~ sql
> CREATE ROLE moderator;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT moderator TO max;
~~~

**All members of all roles:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  admin     | root   |   true
  moderator | max    |  false
(2 rows)
~~~

**Members of a specific role:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE moderator;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  moderator | max    |  false
(1 row)
~~~

**Roles of a specific user or role:**

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE FOR max;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  moderator | max    |  false
(1 row)
~~~

## See also

- [Authorization](authorization.html)
- [`CREATE ROLE`](create-role.html)
- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT`](grant.html)
- [`REVOKE`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [Manage Users](security-reference/authorization.html#create-and-manage-users)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Information Schema](information-schema.html)
