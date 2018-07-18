---
title: Privileges
summary: Privileges are granted to roles and users at the database and table levels. They are not yet supported for other granularities such as columns or rows.
toc: true
---

In CockroachDB, privileges are granted to [roles](roles.html) and [users](create-and-manage-users.html) at the database and table levels. They are not yet supported for other granularities such as columns or rows.

When a user connects to a database, either via the [built-in SQL client](use-the-built-in-sql-client.html) or a [client driver](install-client-drivers.html), CockroachDB checks the user and role's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB gives an error.

For the privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).


## Supported privileges

For a full list of supported privileges, see the [`GRANT`](grant.html) documentation.

## Granting privileges

To grant privileges to a role or user, use the [`GRANT`](grant.html) statement, for example:

{% include copy-clipboard.html %}
~~~ sql
> GRANT SELECT, INSERT ON TABLE bank.accounts TO maxroach;
~~~

## Showing privileges

To show privileges granted to roles or users, use the [`SHOW GRANTS`](show-grants.html) statement, for example:

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE bank FOR maxroach;
~~~

## Revoking privileges

To revoke privileges from roles or users, use the [`REVOKE`](revoke.html) statement, for example:

{% include copy-clipboard.html %}
~~~ sql
> REVOKE INSERT ON TABLE bank.accounts FROM maxroach;
~~~

## See also

- [Manage Users](create-and-manage-users.html)
- [Manage Roles](roles.html)
- [SQL Statements](sql-statements.html)
