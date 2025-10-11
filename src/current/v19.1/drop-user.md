---
title: DROP USER
summary: The DROP USER statement removes one or more SQL users.
toc: true
---

The `DROP USER` [statement](sql-statements.html) removes one or more SQL users.

{{site.data.alerts.callout_success}}You can also use the <a href="create-and-manage-users.html"><code>cockroach user rm</code></a> command to remove users.{{site.data.alerts.end}}


## Required privileges

The user must have the `DELETE` [privilege](authorization.html#assign-privileges) on the `system.users` table.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_user.html %}</section>

## Parameters

 Parameter | Description
-----------|-------------
`user_name` | The username of the user to remove. To remove multiple users, use a comma-separate list of usernames.<br><br>You can use [`SHOW USERS`](show-users.html) to find usernames.

## Example

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

## See also

- [`cockroach user` command](create-and-manage-users.html)
- [`CREATE USER`](create-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](create-security-certificates.html)
- [Other SQL Statements](sql-statements.html)
