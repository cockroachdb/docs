---
title: SHOW SYSTEM GRANTS
summary: The SHOW SYSTEM GRANTS statement lists the system privileges granted to users.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW SYSTEM GRANTS` [statement](sql-statements.html) lists the [system privileges](security-reference/authorization.html#supported-privileges) [granted](grant.html) to [users](security-reference/authorization.html#sql-users).

## Syntax

Use the following syntax to show the [system privileges](security-reference/authorization.html#supported-privileges) granted to users:

~~~
SHOW SYSTEM GRANTS [FOR <users...>]
~~~

## Parameters

Parameter    | Description
-------------|-----------------------------------------------------------------------------------------------------
`users`      | The [user](security-reference/authorization.html#sql-users), or comma-separated list of users, whose system privileges you want to show.

## Response

### Privilege grants

The `SHOW SYSTEM GRANTS` statement returns the following fields:

Field            | Description
-----------------|-----------------------------------------------------------------------------------------------------
`grantee`  | The name of the user.
`privilege_type`  | The name of the [system privilege](security-reference/authorization.html#supported-privileges) granted to the user.
`is_grantable`   | `t` (true) if the user has the grant option on the object; `f` (false) if not.

## Required privileges

- No [privileges](security-reference/authorization.html#supported-privileges) are required to use `SHOW SYSTEM GRANTS`.

## Examples

### Show all system grants

To list all system grants for all users and roles:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SYSTEM GRANTS;
~~~

~~~
  grantee |    privilege_type    | is_grantable
----------+----------------------+---------------
  max     | VIEWACTIVITY         |      t
  max     | VIEWCLUSTERMETADATA  |      t
  max     | VIEWDEBUG            |      t
  alice   | VIEWACTIVITYREDACTED |      f
  alice   | NOSQLLOGIN           |      f
(5 rows)
~~~

### Show a specific user or role's grants

To list all system grants for a specific user or role:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT SYSTEM ALL TO max WITH GRANT OPTION;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SYSTEM GRANTS FOR max;
~~~

~~~
  grantee | privilege_type | is_grantable
----------+----------------+---------------
  max     | ALL            |      t
(1 row)
~~~

## See also

- [Authorization](authorization.html)
- [System Privileges](security-reference/authorization.html#supported-privileges)
- [`GRANT`](grant.html)
- [`REVOKE`](revoke.html)
- [Manage Users](security-reference/authorization.html#create-and-manage-users)
- [Information Schema](information-schema.html)
