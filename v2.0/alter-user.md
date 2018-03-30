---
title: ALTER USER
summary: The ALTER USER statement can be used to add or change a user's password.
toc: false
---

<span class="version-tag">New in v2.0:</span> The `ALTER USER` [statement](sql-statements.html) can be used to add or change a [user's](create-and-manage-users.html) password.

{{site.data.alerts.callout_success}}You can also use the <a href="create-and-manage-users.html#update-a-users-password"><code>cockroach user</code></a> command to add or change a user's password.{{site.data.alerts.end}}

<div id="toc"></div>

## Considerations

- Password creation and alteration is supported only in secure clusters for non-`root` users. The `root` user must authenticate with a client certificate and key.

## Required Privileges

The user must have the `INSERT` and `UPDATE` [privileges](privileges.html) on the `system.users` table.

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/alter_user.html %}</section>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`name` | The name of the user whose password you want to create or add.
`password` | Let the user [authenticate their access to a secure cluster](create-user.html#user-authentication) using this new password. Passwords must be entered as [string](string.html) values surrounded by single quotes (`'`).

## Example

{% include copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD ilov3beefjerky;
~~~
~~~
ALTER USER 1
~~~

## See Also

- [`cockroach user` command](create-and-manage-users.html)
- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](create-security-certificates.html)
- [Other SQL Statements](sql-statements.html)
