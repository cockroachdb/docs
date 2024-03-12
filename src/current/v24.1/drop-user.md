---
title: DROP USER
summary: The DROP USER statement removes one or more SQL users.
toc: true
docs_area: reference.sql
---

The `DROP USER` [statement]({% link {{ page.version.version }}/sql-statements.md %}) removes one or more SQL users. You can use the keywords `ROLE` and `USER` interchangeably. `DROP USER` is an alias for [`DROP ROLE`]({% link {{ page.version.version }}/drop-role.md %}).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Considerations

{% include {{ page.version.version }}/sql/drop-role-considerations.md %}

## Required privileges

Non-admin users cannot drop admin users. To drop non-admin users, the user must be a member of the `admin` role or have the [`CREATEROLE`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users) parameter set.

## Synopsis

See [`DROP ROLE`: Synopsis]({% link {{ page.version.version }}/drop-role.md %}#synopsis).

## Parameters

 Parameter | Description
-----------|-------------
`user_name` | The name of the user to remove. To remove multiple users, use a comma-separate list of usernames.<br><br>You can use [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %}) to find usernames.

## Example

### Remove privileges

All of a user's privileges must be revoked before the user can be dropped.

In this example, first check a user's privileges. Then, revoke the user's privileges before removing the user.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON test.customers FOR mroach;
~~~

~~~
+-----------+--------+------------+
|   Table   |  User  | Privileges |
+-----------+--------+------------+
| customers | mroach | CREATE     |
| customers | mroach | INSERT     |
| customers | mroach | UPDATE     |
+-----------+--------+------------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE CREATE,INSERT,UPDATE ON test.customers FROM mroach;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP USER mroach;
~~~

### Remove default privileges

In addition to removing a user's privileges, a user's [default privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges) must be removed prior to dropping the user. If you attempt to drop a user with modified default privileges, you will encounter an error like the following:

~~~
ERROR: role mroach cannot be dropped because some objects depend on it
privileges for default privileges on new relations belonging to role demo in database movr
SQLSTATE: 2BP01
HINT: USE test; ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM mroach;
~~~

Run the `HINT` SQL prior to dropping the user.

{% include_cached copy-clipboard.html %}
~~~ sql
USE test; ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM mroach;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP USER mroach;
~~~

## See also

- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [Create Security Certificates]({% link {{ page.version.version }}/cockroach-cert.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
