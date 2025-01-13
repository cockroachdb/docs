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
CREATE DATABASE test;
CREATE TABLE customers (k int, v int);
CREATE USER max;
GRANT ALL ON TABLE customers TO max;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON customers FOR max;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  test          | public      | customers  | max     | ALL            |      f
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE CREATE,INSERT,UPDATE ON customers FROM max;
~~~

### Remove default privileges

In addition to removing a user's privileges, a user's [default privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges) must be removed prior to dropping the user. If you attempt to drop a user with modified default privileges, you will encounter an error like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP USER max;
~~~

~~~
ERROR: cannot drop role/user max: grants still exist on test.public.customers
SQLSTATE: 2BP01
~~~

To see what privileges the user still has remaining on the table, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON TABLE test.customers FOR max;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type | is_grantable
----------------+-------------+------------+---------+----------------+---------------
  test          | public      | customers  | max     | BACKUP         |      f
  test          | public      | customers  | max     | CHANGEFEED     |      f
  test          | public      | customers  | max     | DELETE         |      f
  test          | public      | customers  | max     | DROP           |      f
  test          | public      | customers  | max     | SELECT         |      f
  test          | public      | customers  | max     | ZONECONFIG     |      f
(6 rows)
~~~

To drop the user you must revoke all of the user's remaining privileges:

{% include_cached copy-clipboard.html %}
~~~ sql
REVOKE ALL ON TABLE public.customers FROM max;
~~~

Now dropping the user should succeed:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP USER max;
~~~

## See also

- [`CREATE USER`]({% link {{ page.version.version }}/create-user.md %})
- [`ALTER USER`]({% link {{ page.version.version }}/alter-user.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`GRANT`]({% link {{ page.version.version }}/grant.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [Create Security Certificates]({% link {{ page.version.version }}/cockroach-cert.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
