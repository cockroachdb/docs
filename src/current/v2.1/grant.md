---
title: GRANT &lt;privileges&gt;
summary: The GRANT statement grants user privileges for interacting with specific databases and tables.
toc: true
---

The `GRANT <privileges>` [statement](sql-statements.html) lets you control each [role](authorization.html#create-and-manage-roles) or [user's](create-and-manage-users.html) SQL [privileges](authorization.html#assign-privileges) for interacting with specific databases and tables.

For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).


## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/grant_privileges.html %}</section>

## Required privileges

The user granting privileges must have the `GRANT` privilege on the target databases or tables.

## Supported privileges

Roles and users can be granted the following privileges. Some privileges are applicable both for databases and tables, while other are applicable only for tables (see **Levels** in the table below).

- When a role or user is granted privileges for a database, new tables created in the database will inherit the privileges, but the privileges can then be changed.
- When a role or user is granted privileges for a table, the privileges are limited to the table.
- The `root` user automatically belongs to the `admin` role and has the `ALL` privilege for new databases.
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
`table_name` | A comma-separated list of table names. Alternately, to grant privileges to all tables, use `*`. `ON TABLE table.*` grants apply to all existing tables in a database but will not affect tables created after the grant.
`database_name` | A comma-separated list of database names.<br><br>Privileges granted on databases will be inherited by any new tables created in the databases, but do not affect existing tables in the database.
`user_name` | A comma-separated list of [users](create-and-manage-users.html) and/or [roles](authorization.html#create-and-manage-roles) to whom you want to grant privileges.

## Examples

### Grant privileges on databases

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE db1, db2 TO maxroach, betsyroach;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE db1, db2;
~~~

~~~
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

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT DELETE ON TABLE db1.t1, db1.t2 TO betsyroach;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE db1.t1, db1.t2;
~~~

~~~
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

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT SELECT ON TABLE db2.* TO henryroach;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE db2.*;
~~~

~~~
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

### Make a table readable to every user in the system

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT SELECT ON TABLE myTable TO public;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE myTable;
~~~

~~~
  database_name | schema_name | table_name | grantee | privilege_type
+---------------+-------------+------------+---------+----------------+
  defaultdb     | public      | mytable    | admin   | ALL
  defaultdb     | public      | mytable    | public  | SELECT
  defaultdb     | public      | mytable    | root    | ALL
(3 rows)
~~~


## See also

- [Authorization](authorization.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <privileges>`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [Manage Users](create-and-manage-users.html)
- [Manage Roles](authorization.html#create-and-manage-roles)
