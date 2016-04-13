---
title: Privileges
toc: false
---

In CockroachDB, privileges are granted to users at the database and table levels. They are not supported for other granularities such as columns or rows.

When a user connects to a database, either via the [built-in SQL client](use-the-built-in-sql-client.html) or a [client driver](install-client-drivers.html), CockroachDB checks the user's privileges for each statement executed. If the user does not have sufficient privileges for a statement, CockroachDB gives an error.

For the privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

<div id="toc"></div>

## Grant Privileges

To grant privileges to a user, use the `GRANT` statement, for example: 

~~~
GRANT <privileges> ON <database.table> TO <user>;
~~~

For full details, including a list of supported privileges, see the [`GRANT`](grant.html) documentation.

## Show Privileges

To show privileges granted to users, use the `SHOW GRANTS` statement, for example:

~~~
SHOW GRANTS ON <database.table> FOR <user>;
~~~

For full details, see the [`SHOW GRANTS`](show-grants.html) documentation.

## Revoke Privileges

To revoke privileges from users, use the `SHOW GRANTS` statement, for example:

~~~
REVOKE <privileges> ON <database.table> FROM <user>;
~~~

For full details, see the [`REVOKE`](revoke.html) documentation.

## See Also

- [`GRANT`](grant.hmtl)
- [`REVOKE`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)