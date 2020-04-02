---
title: ALTER ROLE
summary: The ALTER ROLE statement can be used to add or change a role's password.
toc: true
---

The `ALTER ROLE` [statement](sql-statements.html) can be used to add or change a [role's](create-role.html) password.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v20.1</span>: Since the keywords `ROLE` and `USER` can now be used interchangeably in SQL statements for enhanced Postgres compatibility, `ALTER ROLE` is now an alias for [`ALTER USER`](alter-user.html).
{{site.data.alerts.end}}

## Considerations

- Password creation and alteration is supported only in secure clusters.

## Required privileges

The user must have the `INSERT` and `UPDATE` [privileges](authorization.html#assign-privileges) on the `system.users` table.

## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/alter_role.html %}</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`name` | The name of the role whose password you want to create or add.
`password` | Let the role [authenticate their access to a secure cluster](authentication.html#client-authentication) using this new password. Passwords should be entered as [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#change-password-using-an-identifier), although this is discouraged.

## Examples

### Change password using a string literal

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD 'ilov3beefjerky';
~~~
~~~
ALTER ROLE 1
~~~

### Change password using an identifier

The following statement changes the password to `ilov3beefjerky`, as above:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement changes the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include copy-clipboard.html %}
~~~ sql
> ALTER ROLE carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

## See also

- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
