---
title: SHOW SYSTEM GRANTS
summary: The SHOW SYSTEM GRANTS statement lists the system privileges granted to users.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW SYSTEM GRANTS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists the [system privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) [granted]({% link {{ page.version.version }}/grant.md %}) to [users]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users).

## Syntax

Use the following syntax to show the [system privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) granted to users:

~~~
SHOW SYSTEM GRANTS [FOR <users...>]
~~~

## Parameters

Parameter    | Description
-------------|-----------------------------------------------------------------------------------------------------
`users`      | The [user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users), or comma-separated list of users, whose system privileges you want to show.

## Response

### Privilege grants

The `SHOW SYSTEM GRANTS` statement returns the following fields:

Field            | Description
-----------------|-----------------------------------------------------------------------------------------------------
`grantee`  | The name of the user.
`privilege_type`  | The name of the [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) granted to the user.
`is_grantable`   | `t` (true) if the user has the grant option on the object; `f` (false) if not.

## Required privileges

- No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) are required to use `SHOW SYSTEM GRANTS`.

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

- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [System Privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges)
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})
- [Manage Users]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users)
- [Information Schema]({% link {{ page.version.version }}/information-schema.md %})
