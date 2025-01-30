---
title: SHOW DEFAULT PRIVILEGES
summary: The SHOW DEFAULT PRIVILEGES statement lists the default privileges for users/roles in the current database.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW DEFAULT PRIVILEGES` [statement]({{ page.version.version }}/sql-statements.md) lists the [default privileges]({{ page.version.version }}/security-reference/authorization.md#default-privileges) for the objects created by [users/roles]({{ page.version.version }}/security-reference/authorization.md#roles) in the current database.

## Synopsis

<div>
</div>

## Parameters

Parameter | Description
----------|------------
`FOR ROLE name`/`FOR USER name` | List the default privileges on objects created by a specific user/role, or a list of users/roles.
`FOR GRANTEE name` | Show the default privileges that user `name` received as a grantee. For more information, see [Show default privileges for a grantee](#show-default-privileges-for-a-grantee).
`FOR ALL ROLES` | List the default privileges on objects created by any user/role.

{{site.data.alerts.callout_info}}
If you do not specify a `FOR ...` clause, CockroachDB returns the default privileges on objects created by the current user.
{{site.data.alerts.end}}

## Required privileges

To show default privileges, the user/role must have any [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the current database.

## Examples

### Show default privileges for objects created by the current user

~~~ sql
> SHOW DEFAULT PRIVILEGES;
~~~

~~~
  role | for_all_roles | object_type | grantee | privilege_type
-------+---------------+-------------+---------+-----------------
  root |     false     | schemas     | root    | ALL
  root |     false     | sequences   | root    | ALL
  root |     false     | tables      | root    | ALL
  root |     false     | types       | public  | USAGE
  root |     false     | types       | root    | ALL
(5 rows)
~~~

### Show default privileges for objects created by any user/role

~~~ sql
> SHOW DEFAULT PRIVILEGES FOR ALL ROLES;
~~~

~~~
  role | for_all_roles | object_type | grantee | privilege_type
-------+---------------+-------------+---------+-----------------
  NULL |     true      | types       | public  | USAGE
(1 row)
~~~

### Show default privileges for objects created by a specific user/role

~~~ sql
> CREATE USER max;
~~~

~~~ sql
> SHOW DEFAULT PRIVILEGES FOR ROLE max;
~~~

~~~
  role | for_all_roles | object_type | grantee | privilege_type
-------+---------------+-------------+---------+-----------------
  max  |     false     | schemas     | max     | ALL
  max  |     false     | sequences   | max     | ALL
  max  |     false     | tables      | max     | ALL
  max  |     false     | types       | max     | ALL
  max  |     false     | types       | public  | USAGE
(5 rows)
~~~

### Show default privileges for objects in a specific schema

~~~ sql
> CREATE SCHEMA test;
~~~

~~~ sql
> ALTER DEFAULT PRIVILEGES IN SCHEMA test GRANT SELECT ON TABLES TO max;
~~~

~~~ sql
> SHOW DEFAULT PRIVILEGES IN SCHEMA test;
~~~

~~~
  role | for_all_roles | object_type | grantee | privilege_type
-------+---------------+-------------+---------+-----------------
  demo |     false     | tables      | max     | SELECT
(1 row)
~~~

### Show default privileges for a grantee

To show the default [privileges]({{ page.version.version }}/security-reference/authorization.md#privileges) that a user received as a grantee, issue the following statement:

~~~ sql
SHOW DEFAULT PRIVILEGES FOR GRANTEE root;
~~~

~~~
  role | for_all_roles | object_type | grantee | privilege_type | is_grantable
-------+---------------+-------------+---------+----------------+---------------
  root |       f       | routines    | root    | ALL            |      t
  root |       f       | schemas     | root    | ALL            |      t
  root |       f       | sequences   | root    | ALL            |      t
  root |       f       | tables      | root    | ALL            |      t
  root |       f       | types       | root    | ALL            |      t
(5 rows)
~~~

## See also

- [`ALTER DEFAULT PRIVILEGES`]({{ page.version.version }}/alter-default-privileges.md)
- [`SHOW ROLES`]({{ page.version.version }}/show-roles.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [Default Privileges]({{ page.version.version }}/security-reference/authorization.md#default-privileges)