---
title: SHOW GRANTS
summary: The SHOW GRANTS statement lists the privileges granted to users.
keywords: reflection
toc: true
---

The `SHOW GRANTS` [statement](sql-statements.html) lists the [privileges](privileges.html) granted to users.


## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/show_grants.html %}</section>

## Required Privileges

No [privileges](privileges.html) are required to view privileges granted to users. For `SHOW GRANTS ON ROLES`, the user must have the [`SELECT`](select-clause.html) [privilege](privileges.html) on the system table.

## Parameters

Parameter | Description
----------|------------
`role_name` | A comma-separated list of role names.
`table_name` | A comma-separated list of table names. Alternately, to list privileges for all tables, use `*`.
`database_name` | A comma-separated list of database names.
`user_name` | An optional, comma-separated list of grantees.

## Examples

### Show All Grants <span class="version-tag">New in v2.0</span>

To list all grants for all users and roles on all databases and tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS;
~~~
~~~
+------------+--------------------+------------------+------------+------------+
|  Database  |       Schema       |      Table       |    User    | Privileges |
+------------+--------------------+------------------+------------+------------+
| system     | crdb_internal      | NULL             | admin      | GRANT      |
| system     | crdb_internal      | NULL             | admin      | SELECT     |
| system     | crdb_internal      | NULL             | root       | GRANT      |
...
| test_roles | public             | employees        | system_ops | CREATE     |
+------------+--------------------+------------------+------------+------------+
(167 rows)
~~~

### Show a Specific User or Role's Grants <span class="version-tag">New in v2.0</span>

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS FOR maxroach;
~~~
~~~
+------------+--------------------+-------+----------+------------+
|  Database  |       Schema       | Table |   User   | Privileges |
+------------+--------------------+-------+----------+------------+
| test_roles | crdb_internal      | NULL  | maxroach | DELETE     |
| test_roles | information_schema | NULL  | maxroach | DELETE     |
| test_roles | pg_catalog         | NULL  | maxroach | DELETE     |
| test_roles | public             | NULL  | maxroach | DELETE     |
+------------+--------------------+-------+----------+------------+
~~~

### Show Grants on Databases

**Specific database, all users and roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE db2:
~~~
~~~ shell
+----------+--------------------+------------+------------+
| Database |       Schema       |    User    | Privileges |
+----------+--------------------+------------+------------+
| db2      | crdb_internal      | admin      | ALL        |
| db2      | crdb_internal      | betsyroach | CREATE     |
| db2      | crdb_internal      | root       | ALL        |
| db2      | information_schema | admin      | ALL        |
| db2      | information_schema | betsyroach | CREATE     |
| db2      | information_schema | root       | ALL        |
| db2      | pg_catalog         | admin      | ALL        |
| db2      | pg_catalog         | betsyroach | CREATE     |
| db2      | pg_catalog         | root       | ALL        |
| db2      | public             | admin      | ALL        |
| db2      | public             | betsyroach | CREATE     |
| db2      | public             | root       | ALL        |
+----------+--------------------+------------+------------+
~~~

**Specific database, specific user or role:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE db2 FOR betsyroach;
~~~
~~~ shell
+----------+--------------------+------------+------------+
| Database |       Schema       |    User    | Privileges |
+----------+--------------------+------------+------------+
| db2      | crdb_internal      | betsyroach | CREATE     |
| db2      | information_schema | betsyroach | CREATE     |
| db2      | pg_catalog         | betsyroach | CREATE     |
| db2      | public             | betsyroach | CREATE     |
+----------+--------------------+------------+------------+
~~~

### Show Grants on Tables

**Specific tables, all users and roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test_roles.employees;
~~~

~~~ shell
+------------+--------+-----------+------------+------------+
|  Database  | Schema |   Table   |    User    | Privileges |
+------------+--------+-----------+------------+------------+
| test_roles | public | employees | admin      | ALL        |
| test_roles | public | employees | root       | ALL        |
| test_roles | public | employees | system_ops | CREATE     |
+------------+--------+-----------+------------+------------+
~~~

**Specific tables, specific role or user:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test_roles.employees FOR system_ops;
~~~
~~~ shell
+------------+--------+-----------+------------+------------+
|  Database  | Schema |   Table   |    User    | Privileges |
+------------+--------+-----------+------------+------------+
| test_roles | public | employees | system_ops | CREATE     |
+------------+--------+-----------+------------+------------+
~~~

**All tables, all users and roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test_roles.*;
~~~

~~~ shell
+------------+--------+-----------+------------+------------+
|  Database  | Schema |   Table   |    User    | Privileges |
+------------+--------+-----------+------------+------------+
| test_roles | public | employees | admin      | ALL        |
| test_roles | public | employees | root       | ALL        |
| test_roles | public | employees | system_ops | CREATE     |
+------------+--------+-----------+------------+------------+
~~~

**All tables, specific users or roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test_roles.* FOR system_ops;
~~~

~~~ shell
+------------+--------+-----------+------------+------------+
|  Database  | Schema |   Table   |    User    | Privileges |
+------------+--------+-----------+------------+------------+
| test_roles | public | employees | system_ops | CREATE     |
+------------+--------+-----------+------------+------------+
~~~

### Show Role Memberships <span class="version-tag">New in v2.0</span>

**All members of all roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE;
~~~
~~~
+--------+---------+---------+
|  role  | member  | isAdmin |
+--------+---------+---------+
| admin  | root    | true    |
| design | ernie   | false   |
| design | lola    | false   |
| dev    | barkley | false   |
| dev    | carl    | false   |
| docs   | carl    | false   |
| hr     | finance | false   |
| hr     | lucky   | false   |
+--------+---------+---------+
~~~

**Members of a specific role:**

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE design;
~~~
~~~
+--------+--------+---------+
|  role  | member | isAdmin |
+--------+--------+---------+
| design | ernie  | false   |
| design | lola   | false   |
+--------+--------+---------+
~~~

**Roles of a specific user or role:**

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE FOR carl;
~~~
~~~
+------+--------+---------+
| role | member | isAdmin |
+------+--------+---------+
| dev  | carl   | false   |
| docs | carl   | false   |
+------+--------+---------+
~~~

## See Also

- [`CREATE ROLE`](create-role.html)
- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <privileges>`](revoke.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`SHOW GRANTS`](show-grants.html)
- [Manage Users](create-and-manage-users.html)
- [Manage Roles](roles.html)
- [Privileges](privileges.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Information Schema](information-schema.html)
