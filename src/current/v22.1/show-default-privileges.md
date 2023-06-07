---
title: SHOW DEFAULT PRIVILEGES
summary: The SHOW DEFAULT PRIVILEGES statement lists the default privileges for users/roles in the current database.
keywords: reflection
toc: true
docs_area: reference.sql
---

 The `SHOW DEFAULT PRIVILEGES` [statement](sql-statements.html) lists the [default privileges](security-reference/authorization.html#default-privileges) for the objects created by [users/roles](security-reference/authorization.html#roles) in the current database.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_default_privileges.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`FOR ROLE name`/`FOR USER name` | List the default privileges on objects created by a specific user/role, or a list of users/roles.
`FOR ALL ROLES` | List the default privileges on objects created by any user/role.

{{site.data.alerts.callout_info}}
If you do not specify a `FOR ...` clause, CockroachDB returns the default privileges on objects created by the current user.
{{site.data.alerts.end}}

## Required privileges

To show default privileges, the user/role must have any [privilege](security-reference/authorization.html#managing-privileges) on the current database.

## Examples

### Show default privileges for objects created by the current user

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER max;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEMA test;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DEFAULT PRIVILEGES IN SCHEMA test GRANT SELECT ON TABLES TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DEFAULT PRIVILEGES IN SCHEMA test;
~~~

~~~
  role | for_all_roles | object_type | grantee | privilege_type
-------+---------------+-------------+---------+-----------------
  demo |     false     | tables      | max     | SELECT
(1 row)
~~~

## See also

- [`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html)
- [SQL Statements](sql-statements.html)
- [Default Privileges](security-reference/authorization.html#default-privileges)
