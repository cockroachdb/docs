---
title: SHOW GRANTS
summary: The SHOW GRANTS statement lists the privileges granted to users.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW GRANTS` [statement]({{ page.version.version }}/sql-statements.md) lists one of the following:

- The [roles]({{ page.version.version }}/security-reference/authorization.md#sql-users) granted to [users]({{ page.version.version }}/security-reference/authorization.md#sql-users) in a cluster.
- The [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) [granted]({{ page.version.version }}/grant.md) to [users]({{ page.version.version }}/security-reference/authorization.md#sql-users) on [databases]({{ page.version.version }}/create-database.md), [user-defined functions]({{ page.version.version }}/create-function.md), [schemas]({{ page.version.version }}/create-schema.md), [tables](create-table.html), [user-defined types](enum.html), or [external connections]({{ page.version.version }}/create-external-connection.md).

## Syntax

### Show privilege grants

Use the following syntax to show the privileges granted to users on database objects:

~~~
SHOW GRANTS [ON [DATABASE | FUNCTION | SCHEMA | TABLE | TYPE | EXTERNAL CONNECTION] <targets...>] [FOR <users...>]
~~~

When `DATABASE` is omitted, the schema, tables, and types in the [current database]({{ page.version.version }}/sql-name-resolution.md#current-database) are listed.

### Show role grants

Use the following syntax to the show the role grants for users in a cluster.

~~~
SHOW GRANTS ON ROLE [<roles...>] [FOR <users...>]
~~~

## Parameters

Parameter    | Description
-------------|-----------------------------------------------------------------------------------------------------
`targets`    | A comma-separated list of database, function, schema, table, or user-defined type names.<br><br>If the function name is not unique, you must provide the full function signature.<br><br>To list the privilege grants for all tables in the current database, you can use `SHOW GRANTS ON TABLE *`.
`users`      | A comma-separated list of the [users]({{ page.version.version }}/security-reference/authorization.md#sql-users) whose privileges or roles you want to show.
`roles`      | A comma-separated list of the roles whose grants you want to show.

## Response

### Privilege grants

The `SHOW GRANTS ON [DATABASE | FUNCTION | SCHEMA | TABLE | TYPE | EXTERNAL CONNECTION]` statement can return the following fields, depending on the target object specified:

Field            | Description
-----------------|-----------------------------------------------------------------------------------------------------
`database_name`  | The name of the database.
`function_name`  | The name of the user-defined function.
`schema_name`    | The name of the schema.
`table_name`     | The name of the table.
`type_name`      | The name of the user-defined type.
`connection_name`| The name of the external connection.
`grantee`        | The name of the user or role that was granted the [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges).
`privilege_type` | The name of the privilege.
`is_grantable`   | `TRUE` if the grantee has the grant option on the object; `FALSE` if not.

### Role grants

The `SHOW GRANTS ON ROLE` statement returns the following fields:

Field        |  Description
-------------|-----------------------------------------------------------------------------------------------------
`role_name`  | The name of the role.
`member`     | The users in the role.
`is_admin`   | If `true`, the role is an [admin]({{ page.version.version }}/security-reference/authorization.md#role-admin) role.

## Required privileges

- No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to view privileges granted to users.

- For `SHOW GRANTS ON ROLES`, the user must have the [`SELECT`]({{ page.version.version }}/select-clause.md) [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the system table.

## Examples

### Show all grants

To list all grants for all users and roles on the current database and its tables:

~~~ sql
> SHOW GRANTS;
~~~

~~~
  database_name |    schema_name     |                 object_name                 | object_type | grantee | privilege_type | is_grantable
----------------+--------------------+---------------------------------------------+-------------+---------+----------------+---------------
...
  movr          | public             | promo_codes                                 | table       | admin   | ALL            |      t
  movr          | public             | promo_codes                                 | table       | root    | ALL            |      t
  movr          | public             | rides                                       | table       | admin   | ALL            |      t
  movr          | public             | rides                                       | table       | root    | ALL            |      t
  movr          | public             | user_promo_codes                            | table       | admin   | ALL            |      t
  movr          | public             | user_promo_codes                            | table       | root    | ALL            |      t
  movr          | public             | users                                       | table       | admin   | ALL            |      t
  movr          | public             | users                                       | table       | root    | ALL            |      t
  movr          | public             | vehicle_location_histories                  | table       | admin   | ALL            |      t
  movr          | public             | vehicle_location_histories                  | table       | root    | ALL            |      t
  movr          | public             | vehicles                                    | table       | admin   | ALL            |      t
  movr          | public             | vehicles                                    | table       | root    | ALL            |      t
(609 rows)
~~~

### Show a specific user or role's grants

~~~ sql
> CREATE USER max WITH PASSWORD roach;
~~~

~~~ sql
> GRANT ALL ON DATABASE movr TO max WITH GRANT OPTION;
~~~

~~~ sql
> SHOW GRANTS FOR max;
~~~

~~~
  database_name | schema_name | object_name | object_type | grantee | privilege_type | is_grantable
----------------+-------------+-------------+-------------+---------+----------------+---------------
  movr          | NULL        | NULL        | database    | max     | ALL            |      t
  movr          | public      | NULL        | schema      | public  | CREATE         |      f
  movr          | public      | NULL        | schema      | public  | USAGE          |      f
(3 rows)
~~~

### Show grants on databases

**Specific database, all users and roles:**

~~~ sql
> SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type | is_grantable
----------------+---------+----------------+---------------
  movr          | admin   | ALL            |      t
  movr          | max     | ALL            |      t
  movr          | public  | CONNECT        |      f
  movr          | root    | ALL            |      t
(4 rows)
~~~

**Specific database, specific user or role:**

~~~ sql
> SHOW GRANTS ON DATABASE movr FOR max;
~~~

~~~
  database_name | grantee | privilege_type | is_grantable
----------------+---------+----------------+---------------
  movr          | max     | ALL            |      t
  movr          | public  | CONNECT        |      f
(2 rows)
~~~

### Show grants on tables

~~~ sql
> GRANT ALL ON TABLE users TO max WITH GRANT OPTION;
~~~

**Specific table, all users and roles:**

~~~ sql
> SHOW GRANTS ON TABLE users;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | users      | admin   | ALL            |      t
  movr          | public      | users      | max     | ALL            |      t
  movr          | public      | users      | root    | ALL            |      t
(3 rows)
~~~

**Specific table, specific role or user:**

~~~ sql
> SHOW GRANTS ON TABLE users FOR max;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | users      | max     | ALL            |      t
(1 row)
~~~

**All tables, all users and roles:**

~~~ sql
> SHOW GRANTS ON TABLE *;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type | is_grantable
----------------+-------------+----------------------------+---------+----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL            |      t
  movr          | public      | promo_codes                | root    | ALL            |      t
  movr          | public      | rides                      | admin   | ALL            |      t
  movr          | public      | rides                      | root    | ALL            |      t
  movr          | public      | user_promo_codes           | admin   | ALL            |      t
  movr          | public      | user_promo_codes           | root    | ALL            |      t
  movr          | public      | users                      | admin   | ALL            |      t
  movr          | public      | users                      | max     | ALL            |      t
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | root    | ALL            |      t
(13 rows)
~~~

**All tables, specific users or roles:**

~~~ sql
> SHOW GRANTS ON TABLE * FOR max;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | users      | max     | ALL            |      t
(1 row)
~~~

### Show grants on schemas

~~~ sql
> CREATE SCHEMA cockroach_labs;
~~~

~~~ sql
> GRANT ALL ON SCHEMA cockroach_labs TO max WITH GRANT OPTION;
~~~

**Specific schema, all users or roles:**

~~~ sql
> SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type | is_grantable
----------------+----------------+---------+----------------+---------------
  movr          | cockroach_labs | admin   | ALL            |      t
  movr          | cockroach_labs | max     | ALL            |      t
  movr          | cockroach_labs | root    | ALL            |      t
(3 rows)
~~~

**Specific schema, specific users or roles:**

~~~ sql
> SHOW GRANTS ON SCHEMA cockroach_labs FOR max;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type | is_grantable
----------------+----------------+---------+----------------+---------------
  movr          | cockroach_labs | max     | ALL            |      t
(1 row)
~~~

### Show grants on user-defined types

To show privileges on [user-defined types]({{ page.version.version }}/create-type.md), use the following statements.

~~~ sql
> CREATE TYPE status AS ENUM ('available', 'unavailable');
~~~

~~~ sql
> GRANT ALL ON TYPE status TO max WITH GRANT OPTION;
~~~

**Specific type, all users or roles:**

~~~ sql
> SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type | is_grantable
----------------+-------------+-----------+---------+----------------+---------------
  movr          | public      | status    | admin   | ALL            |      t
  movr          | public      | status    | max     | ALL            |      t
  movr          | public      | status    | public  | USAGE          |      f
  movr          | public      | status    | root    | ALL            |      t
(4 rows)
~~~

**Specific type, specific users or roles:**

~~~ sql
> SHOW GRANTS ON TYPE status FOR max;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type | is_grantable
----------------+-------------+-----------+---------+----------------+---------------
  movr          | public      | status    | max     | ALL            |      t
  movr          | public      | status    | public  | USAGE          |      f
(2 rows)
~~~

### Show grants on user-defined functions

To show the grants defined on the `num_users` function created in [Create a function that references a table]({{ page.version.version }}/create-function.md#create-a-function-that-references-a-table), run:

~~~ sql
SHOW GRANTS ON FUNCTION num_users;
~~~

~~~
  database_name | schema_name | routine_id | routine_signature | grantee | privilege_type | is_grantable
----------------+-------------+------------+-------------------+---------+----------------+---------------
  movr          | public      |     100118 | num_users()       | admin   | ALL            |      t
  movr          | public      |     100118 | num_users()       | public  | EXECUTE        |      f
  movr          | public      |     100118 | num_users()       | root    | ALL            |      t
(3 rows)
~~~

### Show all grants on external connections

To show all grants defined on an [external connection]({{ page.version.version }}/create-external-connection.md), run:

~~~ sql
SHOW GRANTS ON EXTERNAL CONNECTION my_backup_bucket;
~~~

~~~
  connection_name   |  grantee  | privilege_type | is_grantable
--------------------+-----------+----------------+-------------
  my_backup_bucket  | alice     | DROP           |     t
  my_backup_bucket  | alice     | USAGE          |     t
  my_backup_bucket  | max       | DROP           |     f
  my_backup_bucket  | max       | USAGE          |     f
  my_backup_bucket  | root      | ALL            |     f
(5 rows)
~~~

### Show grants on external connections by user

To show the grants defined on an [external connection]({{ page.version.version }}/create-external-connection.md) for a specific user, run:

~~~ sql
SHOW GRANTS ON EXTERNAL CONNECTION my_backup_bucket FOR alice;
~~~

~~~
  connection_name   |  grantee  | privilege_type | is_grantable
--------------------+-----------+----------------+-------------
  my_backup_bucket  | alice     | DROP           |     t
  my_backup_bucket  | alice     | USAGE          |     t
(2 rows)
~~~

### Show role memberships

~~~ sql
> CREATE ROLE moderator;
~~~

~~~ sql
> GRANT moderator TO max;
~~~

**All members of all roles:**

~~~ sql
> SHOW GRANTS ON ROLE;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  admin     | root   |    t
  moderator | max    |    f
(2 rows)
~~~

**Members of a specific role:**

~~~ sql
> SHOW GRANTS ON ROLE moderator;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  moderator | max    |    f
(1 row)
~~~

**Roles of a specific user or role:**

~~~ sql
> SHOW GRANTS ON ROLE FOR max;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  moderator | max    |    f
(1 row)
~~~

## See also

- [Authorization]({{ page.version.version }}/authorization.md)
- [`CREATE ROLE`]({{ page.version.version }}/create-role.md)
- [`DROP ROLE`]({{ page.version.version }}/drop-role.md)
- [`SHOW ROLES`]({{ page.version.version }}/show-roles.md)
- [`GRANT`]({{ page.version.version }}/grant.md)
- [`REVOKE`]({{ page.version.version }}/revoke.md)
- [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md)
- [Manage Users]({{ page.version.version }}/security-reference/authorization.md#create-and-manage-users)
- [`cockroach` Commands Overview]({{ page.version.version }}/cockroach-commands.md)
- [Information Schema]({{ page.version.version }}/information-schema.md)