---
title: REVOKE
summary: The REVOKE statement revokes privileges from users and/or roles, or revokes privileges from users and/or roles.
toc: true
docs_area: reference.sql
---

The `REVOKE` [statement]({{ page.version.version }}/sql-statements.md) revokes [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) from [users and/or roles]({{ page.version.version }}/security-reference/authorization.md#users-and-roles). For the list of privileges that can be granted to and revoked from users and roles, see [`GRANT`]({{ page.version.version }}/grant.md).

You can use `REVOKE` to directly revoke privileges from a role or user, or you can revoke membership to an existing role, which effectively revokes that role's privileges.


## Syntax

<div>
</div>

### Parameters

Parameter                   | Description
----------------------------|------------
`ALL`<br>`ALL PRIVILEGES`   | Revoke all [privileges](#supported-privileges).
`privilege_list`            | A comma-separated list of [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) to revoke.
`grant_targets`             | A comma-separated list of database, table, sequence, or function names. The list should be preceded by the object type (e.g., `DATABASE mydatabase`). If the object type is not specified, all names are interpreted as table or sequence names.
`target_types`              | A comma-separated list of [user-defined types]({{ page.version.version }}/create-type.md).
`ALL SEQUENCES IN SCHEMA`   | Revoke [privileges](#supported-privileges) on all sequences in a schema or list of schemas.
`ALL TABLES IN SCHEMA`      | Revoke [privileges](#supported-privileges) on all tables and sequences in a schema or list of schemas.
`ALL FUNCTIONS IN SCHEMA`.  | Revoke [privileges](#supported-privileges) on all [user-defined functions]({{ page.version.version }}/user-defined-functions.md) in a schema or list of schemas.
`schema_name_list`          | A comma-separated list of [schemas]({{ page.version.version }}/create-schema.md).
`role_spec_list`            | A comma-separated list of [roles]({{ page.version.version }}/security-reference/authorization.md#users-and-roles).

## Supported privileges

The following privileges can be revoked:


## Required privileges

- To revoke privileges, user revoking privileges must have the `GRANT` privilege on the target [database]({{ page.version.version }}/create-database.md), [schema]({{ page.version.version }}/create-schema.md), [table]({{ page.version.version }}/create-table.md), or [user-defined type]({{ page.version.version }}/enum.md). In addition to the `GRANT` privilege, the user revoking privileges must have the privilege being revoked on the target object. For example, a user revoking the `SELECT` privilege on a table to another user must have the `GRANT` and `SELECT` privileges on that table.

- To revoke role membership, the user revoking role membership must be a role admin (i.e., members with the `WITH ADMIN OPTION`) or a member of the `admin` role. To remove membership to the `admin` role, the user must have `WITH ADMIN OPTION` on the `admin` role.

## Considerations

- The `root` user cannot be revoked from the `admin` role.

## Known limitations


## Examples


### Revoke privileges on databases

~~~ sql
CREATE USER max WITH PASSWORD 'roach';
~~~

~~~ sql
GRANT CREATE ON DATABASE movr TO max;
~~~

~~~ sql
SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type | is_grantable
----------------+---------+----------------+---------------
  movr          | admin   | ALL            |      t
  movr          | max     | CREATE         |      f
  movr          | root    | ALL            |      t
(3 rows)
~~~

~~~ sql
REVOKE CREATE ON DATABASE movr FROM max;
~~~

~~~ sql
SHOW GRANTS ON DATABASE movr;
~~~

~~~
  database_name | grantee | privilege_type | is_grantable
----------------+---------+----------------+---------------
  movr          | admin   | ALL            |      t
  movr          | root    | ALL            |      t
(2 rows)
~~~

{{site.data.alerts.callout_info}}
Any tables that previously inherited the database-level privileges retain the privileges.
{{site.data.alerts.end}}

### Revoke privileges on specific tables in a database

~~~ sql
GRANT ALL ON TABLE rides TO max;
~~~

~~~ sql
SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | rides      | admin   | ALL            |      t
  movr          | public      | rides      | max     | ALL            |      f
  movr          | public      | rides      | root    | ALL            |      t
(3 rows)
~~~

~~~ sql
REVOKE ALL ON TABLE rides FROM max;
~~~

~~~ sql
SHOW GRANTS ON TABLE rides;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  movr          | public      | rides      | admin   | ALL            |      t
  movr          | public      | rides      | root    | ALL            |      t
(2 rows)
~~~

### Revoke privileges on all tables in a database or schema

~~~ sql
GRANT ALL ON TABLE rides, users TO max;
~~~

~~~ sql
SHOW GRANTS ON TABLE movr.*;
~~~

~~~
  database_name | schema_name |         table_name         | grantee | privilege_type | is_grantable
----------------+-------------+----------------------------+---------+----------------+---------------
  movr          | public      | promo_codes                | admin   | ALL            |      t
  movr          | public      | promo_codes                | root    | ALL            |      t
  movr          | public      | rides                      | admin   | ALL            |      t
  movr          | public      | rides                      | max     | ALL            |      f
  movr          | public      | rides                      | root    | ALL            |      t
  movr          | public      | user_promo_codes           | admin   | ALL            |      t
  movr          | public      | user_promo_codes           | root    | ALL            |      t
  movr          | public      | users                      | admin   | ALL            |      t
  movr          | public      | users                      | max     | ALL            |      f
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | usertable                  | admin   | ALL            |      t
  movr          | public      | usertable                  | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | public  | SELECT         |      f
  movr          | public      | vehicles                   | root    | ALL            |      t
(17 rows)
~~~

~~~ sql
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM max;
~~~

This is equivalent to the following syntax:

~~~ sql
REVOKE ALL ON movr.public.* FROM max;
~~~

~~~ sql
SHOW GRANTS ON TABLE movr.*;
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
  movr          | public      | users                      | root    | ALL            |      t
  movr          | public      | usertable                  | admin   | ALL            |      t
  movr          | public      | usertable                  | root    | ALL            |      t
  movr          | public      | vehicle_location_histories | admin   | ALL            |      t
  movr          | public      | vehicle_location_histories | root    | ALL            |      t
  movr          | public      | vehicles                   | admin   | ALL            |      t
  movr          | public      | vehicles                   | public  | SELECT         |      f
  movr          | public      | vehicles                   | root    | ALL            |      t
(15 rows)
~~~

### Revoke system-level privileges on the entire cluster

[System-level privileges]({{ page.version.version }}/security-reference/authorization.md#supported-privileges) live above the database level and apply to the entire cluster.

`root` and [`admin`]({{ page.version.version }}/security-reference/authorization.md#admin-role) users have system-level privileges by default, and are capable of revoking it from other users and roles using the `REVOKE` statement.

For example, the following statement removes the ability to use the [`SET CLUSTER SETTING`]({{ page.version.version }}/set-cluster-setting.md) statement from the user `maxroach` by revoking the `MODIFYCLUSTERSETTING` system privilege:

~~~ sql
REVOKE SYSTEM MODIFYCLUSTERSETTING FROM max;
~~~

### Revoke privileges on schemas

~~~ sql
CREATE SCHEMA cockroach_labs;
~~~

~~~ sql
GRANT ALL ON SCHEMA cockroach_labs TO max;
~~~

~~~ sql
SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type | is_grantable
----------------+----------------+---------+----------------+---------------
  movr          | cockroach_labs | admin   | ALL            |      t
  movr          | cockroach_labs | max     | ALL            |      t
  movr          | cockroach_labs | root    | ALL            |      t
(3 rows)
~~~

~~~ sql
REVOKE CREATE ON SCHEMA cockroach_labs FROM max;
~~~

~~~ sql
SHOW GRANTS ON SCHEMA cockroach_labs;
~~~

~~~
  database_name |  schema_name   | grantee | privilege_type | is_grantable
----------------+----------------+---------+----------------+---------------
  movr          | cockroach_labs | admin   | ALL            |      t
  movr          | cockroach_labs | max     | USAGE          |      t
  movr          | cockroach_labs | root    | ALL            |      t
(3 rows)
~~~

### Revoke privileges on user-defined types

To revoke privileges on [user-defined types]({{ page.version.version }}/create-type.md), use the following statements.

~~~ sql
CREATE TYPE status AS ENUM ('available', 'unavailable');
~~~

~~~ sql
GRANT ALL ON TYPE status TO max;
~~~

~~~ sql
SHOW GRANTS ON TYPE status;
~~~

~~~
  database_name | schema_name | type_name | grantee | privilege_type | is_grantable
----------------+-------------+-----------+---------+----------------+---------------
  movr          | public      | status    | admin   | ALL            |      t
  movr          | public      | status    | max     | ALL            |      f
  movr          | public      | status    | public  | USAGE          |      f
  movr          | public      | status    | root    | ALL            |      t
(4 rows)
~~~

### Revoke role membership

~~~ sql
CREATE ROLE developer WITH CREATEDB;
~~~

~~~ sql
CREATE USER abbey WITH PASSWORD 'lincoln';
~~~

~~~ sql
GRANT developer TO abbey;
~~~

~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |    f
(1 row)
~~~

~~~ sql
REVOKE developer FROM abbey;
~~~

~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
SHOW GRANTS ON ROLE 0
~~~

### Revoke the admin option

~~~ sql
GRANT developer TO abbey WITH ADMIN OPTION;
~~~

~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |    t
(1 row)
~~~

~~~ sql
REVOKE ADMIN OPTION FOR developer FROM abbey;
~~~

~~~ sql
SHOW GRANTS ON ROLE developer;
~~~

~~~
  role_name | member | is_admin
------------+--------+-----------
  developer | abbey  |    f
(1 row)
~~~

## See also

- [Authorization]({{ page.version.version }}/authorization.md)
- [`GRANT`]({{ page.version.version }}/grant.md)
- [`SHOW GRANTS`]({{ page.version.version }}/show-grants.md)
- [`SHOW ROLES`]({{ page.version.version }}/show-roles.md)
- [`CREATE USER`]({{ page.version.version }}/create-user.md)
- [`DROP USER`]({{ page.version.version }}/drop-user.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)