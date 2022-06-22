---
title: ALTER USER
summary: The ALTER USER statement can be used to add or change a user's password.
toc: true
---

The `ALTER USER` [statement](sql-statements.html) can be used to add or change a [user's](create-user.html) password.

## Considerations

- Password creation and alteration is supported only in secure clusters for non-`root` users.

## Required privileges

The user must have the `INSERT` and `UPDATE` [privileges](authorization.html#assign-privileges) on the `system.users` table.

## Synopsis

<div>{% include {{ page.version.version }}/sql/diagrams/alter_user_password.html %}</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

Parameter | Description
----------|-------------
`name` | The name of the user whose password you want to create or add.
`password` | Let the user [authenticate their access to a secure cluster](authentication.html#client-authentication) using this new password. Passwords should be entered as [string literal](sql-constants.html#string-literals). For compatibility with PostgreSQL, a password can also be entered as an [identifier](#change-password-using-an-identifier), although this is discouraged.

## Examples

### Change password using a string literal

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD 'ilov3beefjerky';
~~~
~~~
ALTER USER 1
~~~

### Change password using an identifier

The following statement changes the password to `ilov3beefjerky`, as above:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD ilov3beefjerky;
~~~

This is equivalent to the example in the previous section because the password contains only lowercase characters.

In contrast, the following statement changes the password to `thereisnotomorrow`, even though the password in the syntax contains capitals, because identifiers are normalized automatically:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD ThereIsNoTomorrow;
~~~

To preserve case in a password specified using identifier syntax, use double quotes:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER USER carl WITH PASSWORD "ThereIsNoTomorrow";
~~~

## See also

- [`DROP USER`](drop-user.html)
- [`SHOW USERS`](show-users.html)
- [`GRANT <privileges>`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Create Security Certificates](cockroach-cert.html)
- [Other SQL Statements](sql-statements.html)
