---
title: DROP USER
summary: The DROP USER statement removes one or more SQL users.
toc: true
docs_area: reference.sql
---

The `DROP USER` [statement](sql-statements.html) removes one or more SQL users.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{{site.data.alerts.callout_info}}
 Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced PostgreSQL compatibility, `DROP USER` is now an alias for [`DROP ROLE`](drop-role.html).
{{site.data.alerts.end}}

## Consideration

Users that [own objects](security-reference/authorization.html#object-ownership) (such as databases, tables, schemas, and types) cannot be dropped until the [ownership is transferred to another user](owner-to.html#change-a-databases-owner).

## Required privileges

Non-admin users cannot drop admin users. To drop non-admin users, the user must be a member of the `admin` role or have the [`CREATEROLE`](create-user.html#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users) parameter set.

## Synopsis

<div>{% include {{ page.version.version }}/sql/generated/diagrams/drop_user.html %}</div>

## Parameters

 Parameter | Description
-----------|-------------
`user_name` | The username of the user to remove. To remove multiple users, use a comma-separate list of usernames.<br><br>You can use [`SHOW USERS`](show-users.html) to find usernames.

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

In addition to removing a user's privileges, a user's [default privileges](security-reference/authorization.html#default-privileges) must be removed prior to dropping the user. If you attempt to drop a user with modified default privileges, you will encounter an error like the following:

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

- [`CREATE USER`](create-user.html)
- [`ALTER USER`](alter-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [SQL Statements](sql-statements.html)
