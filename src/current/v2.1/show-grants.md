---
title: SHOW GRANTS
summary: The SHOW GRANTS statement lists the privileges granted to users.
keywords: reflection
toc: true
---

The `SHOW GRANTS` [statement](sql-statements.html) lists the [privileges](authorization.html#assign-privileges) granted to users.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_grants.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to view privileges granted to users. For `SHOW GRANTS ON ROLES`, the user must have the [`SELECT`](select-clause.html) [privilege](authorization.html#assign-privileges) on the system table.

## Parameters

Parameter | Description
----------|------------
`role_name` | A comma-separated list of role names.
`table_name` | A comma-separated list of table names. Alternately, to list privileges for all tables, use `*`.
`database_name` | A comma-separated list of database names.
`user_name` | An optional, comma-separated list of grantees.

## Examples

### Show all grants

To list all grants for all users and roles on all databases and tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS;
~~~

~~~
+---------------+--------------------+-----------------------------------+---------+----------------+
| database_name |    schema_name     |            table_name             | grantee | privilege_type |
+---------------+--------------------+-----------------------------------+---------+----------------+
| defaultdb     | crdb_internal      | NULL                              | admin   | ALL            |
| defaultdb     | crdb_internal      | NULL                              | root    | ALL            |
| defaultdb     | crdb_internal      | backward_dependencies             | public  | SELECT         |
| defaultdb     | crdb_internal      | builtin_functions                 | public  | SELECT         |
| defaultdb     | crdb_internal      | cluster_queries                   | public  | SELECT         |
...
+---------------+--------------------+-----------------------------------+---------+----------------+
(167 rows)
~~~

### Show a specific user or role's grants

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS FOR maxroach;
~~~

~~~
+---------------+--------------------+-----------------------------------+----------+----------------+
| database_name |    schema_name     |            table_name             | grantee  | privilege_type |
+---------------+--------------------+-----------------------------------+----------+----------------+
| test_roles    | crdb_internal      | NULL                              | maxroach | DELETE         |
| test_roles    | information_schema | NULL                              | maxroach | DELETE         |
| test_roles    | pg_catalog         | NULL                              | maxroach | DELETE         |
| test_roles    | public             | NULL                              | maxroach | DELETE         |
+---------------+--------------------+-----------------------------------+----------+----------------+
~~~

### Show grants on databases

**Specific database, all users and roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE test;
~~~

~~~
+---------------+--------------------+----------+----------------+
| database_name |    schema_name     | grantee  | privilege_type |
+---------------+--------------------+----------+----------------+
| test          | crdb_internal      | admin    | ALL            |
| test          | crdb_internal      | maxroach | CREATE         |
| test          | crdb_internal      | root     | ALL            |
| test          | information_schema | admin    | ALL            |
| test          | information_schema | maxroach | CREATE         |
| test          | information_schema | root     | ALL            |
| test          | pg_catalog         | admin    | ALL            |
| test          | pg_catalog         | maxroach | CREATE         |
| test          | pg_catalog         | root     | ALL            |
| test          | public             | admin    | ALL            |
| test          | public             | maxroach | CREATE         |
| test          | public             | root     | ALL            |
+---------------+--------------------+----------+----------------+
(12 rows)
~~~

**Specific database, specific user or role:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON DATABASE test FOR maxroach;
~~~

~~~
+---------------+--------------------+----------+----------------+
| database_name |    schema_name     | grantee  | privilege_type |
+---------------+--------------------+----------+----------------+
| test          | crdb_internal      | maxroach | CREATE         |
| test          | information_schema | maxroach | CREATE         |
| test          | pg_catalog         | maxroach | CREATE         |
| test          | public             | maxroach | CREATE         |
+---------------+--------------------+----------+----------------+
(4 rows)
~~~

### Show grants on tables

**Specific tables, all users and roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test.t1;
~~~

~~~
+---------------+-------------+------------+----------+----------------+
| database_name | schema_name | table_name | grantee  | privilege_type |
+---------------+-------------+------------+----------+----------------+
| test          | public      | t1         | admin    | ALL            |
| test          | public      | t1         | maxroach | CREATE         |
| test          | public      | t1         | root     | ALL            |
+---------------+-------------+------------+----------+----------------+
(3 rows)
~~~

**Specific tables, specific role or user:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test.t1 FOR maxroach;
~~~

~~~
+---------------+-------------+------------+----------+----------------+
| database_name | schema_name | table_name | grantee  | privilege_type |
+---------------+-------------+------------+----------+----------------+
| test          | public      | t1         | maxroach | CREATE         |
+---------------+-------------+------------+----------+----------------+
(1 row)
~~~

**All tables, all users and roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test.*;
~~~

~~~
+---------------+-------------+------------+----------+----------------+
| database_name | schema_name | table_name | grantee  | privilege_type |
+---------------+-------------+------------+----------+----------------+
| test          | public      | t1         | admin    | ALL            |
| test          | public      | t1         | maxroach | CREATE         |
| test          | public      | t1         | root     | ALL            |
+---------------+-------------+------------+----------+----------------+
(3 rows)
~~~

**All tables, specific users or roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW GRANTS ON TABLE test.* FOR maxroach;
~~~

~~~
+---------------+-------------+------------+----------+----------------+
| database_name | schema_name | table_name | grantee  | privilege_type |
+---------------+-------------+------------+----------+----------------+
| test          | public      | t1         | maxroach | CREATE         |
+---------------+-------------+------------+----------+----------------+
(1 row)
~~~

### Show role memberships

**All members of all roles:**

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE;
~~~

~~~
+------------+---------+----------+
| role_name  | member  | is_admin |
+------------+---------+----------+
| admin      | root    | true     |
| design     | ernie   | false    |
| design     | lola    | false    |
| dev        | barkley | false    |
| dev        | carl    | false    |
| docs       | carl    | false    |
| hr         | finance | false    |
| hr         | lucky   | false    |
+------------+---------+----------+
~~~

**Members of a specific role:**

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE design;
~~~

~~~
+------------+---------+----------+
| role_name  | member  | is_admin |
+------------+---------+----------+
| design     | ernie   | false    |
| design     | lola    | false    |
+------------+---------+----------+
~~~

**Roles of a specific user or role:**

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW GRANTS ON ROLE FOR carl;
~~~

~~~
+------------+---------+----------+
| role_name  | member  | is_admin |
+------------+---------+----------+
| dev        | carl    | false    |
| docs       | carl    | false    |
+------------+---------+----------+
~~~

## See also

- [`CREATE ROLE`](create-role.html)
- [`DROP ROLE`](drop-role.html)
- [`SHOW ROLES`](show-roles.html)
- [`GRANT <privileges>`](grant.html)
- [`GRANT <roles>` (Enterprise)](grant-roles.html)
- [`REVOKE <privileges>`](revoke.html)
- [`REVOKE <roles>` (Enterprise)](revoke-roles.html)
- [`SHOW GRANTS`](show-grants.html)
- [Manage Users](create-and-manage-users.html)
- [Manage Roles](authorization.html#create-and-manage-roles)
- [Authorization](authorization.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Information Schema](information-schema.html)
