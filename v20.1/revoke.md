---
title: REVOKE &lt;privileges&gt;
summary: The REVOKE statement revokes privileges from users and/or roles.
toc: true
---

The `REVOKE <privileges>` [statement](sql-statements.html) revokes [privileges](authorization.html#assign-privileges) from [users](authorization.html#create-and-manage-users) and/or [roles](authorization.html#create-and-manage-roles).

For the list of privileges that can be granted to and revoked from users and roles, see [`GRANT`](grant.html).

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/revoke_privileges.html %}
</div>

## Required privileges

The user revoking privileges must have the `GRANT` privilege on the target databases or tables.

<span class="version-tag">New in v20.1</span> In addition to the `GRANT` privilege, the user revoking privileges must have the privilege being revoked on the target database or tables. For example, a user revoking the `SELECT` privilege on a table to another user must have the `GRANT` and `SELECT` privileges on that table.

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which you want to revoke privileges. To revoke privileges for multiple tables, use a comma-separated list of table names. To revoke privileges for all tables, use `*`.
`database_name` | The name of the database for which you want to revoke privileges. To revoke privileges for multiple databases, use a comma-separated list of database names.<br><br>Privileges revoked for databases will be revoked for any new tables created in the databases.
`user_name` | A comma-separated list of [users](authorization.html#create-and-manage-users) and/or [roles](authorization.html#create-and-manage-roles) from whom you want to revoke privileges.


## Examples

### Revoke privileges on databases

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

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE CREATE ON DATABASE db1, db2 FROM maxroach, betsyroach;
~~~

{% include_cached copy-clipboard.html %}
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

{{site.data.alerts.callout_info}}Any tables that previously inherited the database-level privileges retain the privileges.{{site.data.alerts.end}}

### Revoke privileges on specific tables in a database

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> REVOKE CREATE ON TABLE db1.t1, db1,t2 FROM betsyroach;
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
| t1    | maxroach   | CREATE     |
| t1    | root       | ALL        |
| t2    | betsyroach | DELETE     |
| t2    | maxroach   | CREATE     |
| t2    | root       | ALL        |
+-------+------------+------------+
(6 rows)
~~~

### Revoke privileges on all tables in a database

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

## See also

- [Authorization](authorization.html)
- [`GRANT <privileges>`](grant.html)
- [`GRANT <roles>`](grant-roles.html)
- [`REVOKE <roles>`](revoke-roles.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW ROLES`](show-roles.html)
- [`CREATE USER`](create-user.html)
- [`DROP USER`](drop-user.html)
- [Other SQL Statements](sql-statements.html)
