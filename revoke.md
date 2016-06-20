---
title: REVOKE
summary: The REVOKE statement revokes privileges from users.
toc: false
---

The `REVOKE` [statement](sql-statements.html) revokes [privileges](privileges.html) from users.

For the list of privileges that can be granted to and revoked from users, see [`GRANT`](grant.html).

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/revoke.html %}

## Required Privileges

The user revoking privileges must have the `GRANT` privilege on the target databases or tables.  

## Usage

### Revoke Privileges on Databases

To revoke privileges on one or more databases, use the following syntax:

~~~
REVOKE <privileges> ON DATABASE <databases> FROM <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<databases>` is a comma-separated list of database names; and `<users>` is a comma-separated list of user names.

Note that any tables that previously inherited the database-level privileges retain the privileges. 

### Revoke Privileges on Specific Tables in a Database

To revoke privileges on one or more tables in a database, use the following syntax:

~~~
REVOKE <privileges> ON <tables> FROM <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<tables>` is a comma-separated list of table names, each in `database.table` format; and `<users>` is a comma-separated list of user names.

Alternately, you can add the `TABLE` keyword:

~~~
REVOKE <privileges> on TABLE <tables> FROM <users>
~~~

### Revoke Privileges on All Tables in a Database

To revoke privileges on all current tables in one or more databases, use the following syntax:

~~~
REVOKE <privileges> ON <databases>.* FROM <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<databases>` is a comma-separated list of database names, each with the `.*` suffix; and `<users>` is a comma-separated list of user names. 

## See Also

- [Privileges](privileges.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)