---
title: REVOKE
summary: The REVOKE statement revokes privileges from users.
toc: true
---

The `REVOKE` [statement](sql-statements.html) revokes [privileges](privileges.html) from users.

For the list of privileges that can be granted to and revoked from users, see [`GRANT`](grant.html).


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/revoke.html %}

## Required Privileges

The user revoking privileges must have the `GRANT` privilege on the target databases or tables.

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which you want to revoke privileges. To revoke privileges for multiple tables, use a comma-separated list of table names. To revoke privileges for all tables, use `*`.
`database_name` | The name of the database for which you want to revoke privileges. To revoke privileges for multiple databases, use a comma-separated list of database names.<br><br>Privileges revoked for databases will be revoked for any new tables created in the databases.
`user_name` | The name of the users from whom you want to revoke privileges. To revoke privileges from multiple users, use a comma-separated list of [users](create-and-manage-users.html).


## Examples

### Revoke Privileges on Databases

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

~~~ sql
> REVOKE CREATE ON DATABASE db1, db2 FROM maxroach, betsyroach;
~~~

~~~ sql
> SHOW GRANTS ON DATABASE db1, db2;
~~~

~~~
+----------+------+------------+
| Database | User | Privileges |
+----------+------+------------+
| db1      | root | ALL        |
| db2      | root | ALL        |
+----------+------+------------+
(2 rows)
~~~

{{site.data.alerts.callout_info}} Note that any tables that previously inherited the database-level privileges retain the privileges.{{site.data.alerts.end}}

### Revoke Privileges on Specific Tables in a Database

~~~ sql
> SHOW GRANTS ON TABLE db1.t1, db1.t2;
~~~

~~~
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | betsyroach | CREATE     |
| t1    | betsyroach | DELETE     |
| t1    | maxroach   | CREATE     |
| t1    | root       | ALL        |
| t2    | betsyroach | CREATE     |
| t2    | betsyroach | DELETE     |
| t2    | maxroach   | CREATE     |
| t2    | root       | ALL        |
+-------+------------+------------+
(8 rows)
~~~

~~~ sql
> REVOKE CREATE ON TABLE db1.t1, db1,t2 FROM betsyroach;
~~~

~~~ sql
> SHOW GRANTS ON TABLE db1.t1, db1.t2;
~~~

~~~
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | betsyroach | DELETE     |
| t1    | maxroach   | CREATE     |
| t1    | root       | ALL        |
| t2    | betsyroach | DELETE     |
| t2    | maxroach   | CREATE     |
| t2    | root       | ALL        |
+-------+------------+------------+
(6 rows)
~~~

### Revoke Privileges on All Tables in a Database

~~~ sql
> SHOW GRANTS ON TABLE db2.t1, db2.t2;
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

~~~ sql
> REVOKE DELETE ON db2.* FROM betsyroach;
~~~

~~~
+-------+------+------------+
| Table | User | Privileges |
+-------+------+------------+
| t1    | root | ALL        |
| t2    | root | ALL        |
+-------+------+------------+
(2 rows)
~~~

## See Also

- [Privileges](privileges.html)
- [`GRANT`](grant.html)
- [`SHOW GRANTS`](show-grants.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [Other SQL Statements](sql-statements.html)
