---
title: GRANT
summary: The GRANT statement grants user privileges for interacting with specific databases and tables.
toc: false
---

The `GRANT` [statement](sql-statements.html) lets you control each [role](role.html) or [user's](create-and-manage-users.html) SQL [privileges](privileges.html) for interacting with specific databases and tables.

For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

<div id="toc"></div>

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/grant.html %}</section>

## Required Privileges

The user granting privileges must have the `GRANT` privilege on the target databases or tables.

{{site.data.alerts.callout_info}}You must have an <a href="enterprise-licensing.html">enterprise license</a> to add a user to a role (i.e., <code>GRANT [my_role] TO ...</code>).{{site.data.alerts.end}}

## Supported Privileges

Roles and users can be granted the following privileges. Some privileges are applicable both for databases and tables, while other are applicable only for tables (see **Levels** in the table below).

- When a role or user is granted privileges for a database, new tables created in the database will inherit the privileges, but the privileges can then be changed.
- When a role or user is granted privileges for a table, the privileges are limited to the table.
- The `root` user is automatically created as an `admin` role and assigned the `ALL` privilege for new databases.
- For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

Privilege | Levels
----------|------------
`ALL` | Database, Table
`CREATE` | Database, Table
`DROP` | Database, Table
`GRANT` | Database, Table
`SELECT` | Table
`INSERT` | Table
`DELETE` | Table
`UPDATE` | Table

## Parameters

Parameter | Description
----------|------------
`table_name` | A comma-separated list of table names. Alternately, to grant privileges to all tables, use `*`. `ON TABLE table.*` grants apply to all existing tables in a database but won't affect tables created after the grant.
`database_name` | A comma-separated list of database names.<br><br>Privileges granted on databases will be inherited by any new tables created in the databases, but don't affect existing tables in the database.
`name` | A comma-separated list of [users](create-and-manage-users.html) and/or [roles](roles.html) to whom you want to grant privileges.

## Examples

### Grant privileges on databases

~~~ sql
> GRANT CREATE ON DATABASE db1, db2 TO maxroach, betsyroach;

> SHOW GRANTS ON DATABASE db1, db2;
~~~

~~~ shell
+----------+------------+------------+
| Database |    User    | Privileges |
+----------+------------+------------+
| db1      | betsyroach | CREATE     |
| db1      | maxroach   | CREATE     |
| db1      | root       | ALL        |
| db2      | betsyroach | CREATE     |
| db2      | maxroach   | CREATE     |
| db2      | root       | ALL        |
+----------+------------+------------+
(6 rows)
~~~

### Grant privileges on specific tables in a database

~~~ sql
> GRANT DELETE ON TABLE db1.t1, db1.t2 TO betsyroach;

> SHOW GRANTS ON TABLE db1.t1, db1.t2;
~~~

~~~ shell
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | betsyroach | DELETE     |
| t1    | root       | ALL        |
| t2    | betsyroach | DELETE     |
| t2    | root       | ALL        |
+-------+------------+------------+
(4 rows)
~~~

### Grant privileges on all tables in a database

~~~ sql
> GRANT SELECT ON TABLE db2.* TO henryroach;

> SHOW GRANTS ON TABLE db2.*;
~~~

~~~ shell
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | henryroach | SELECT     |
| t1    | root       | ALL        |
| t2    | henryroach | SELECT     |
| t2    | root       | ALL        |
+-------+------------+------------+
(4 rows)
~~~

## Add a member to a role (Enterprise) <span class="version-tag">New in v2.0</span>

{% include copy-clipboard.html %}
~~~ sql
> GRANT system_ops TO mary;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON ROLE system_ops;
~~~
~~~
+------------+----------+---------+
|    role    |  member  | isAdmin |
+------------+----------+---------+
| system_ops | mary     | false   |
+------------+----------+---------+
~~~

## See Also

- [Privileges](privileges.html)
- [`REVOKE`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [Manage Users](create-and-manage-users.html)
- [Manage Roles](roles.html)
