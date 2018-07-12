---
title: SHOW GRANTS
summary: The SHOW GRANTS statement lists the privileges granted to users.
keywords: reflection
toc: true
---

The `SHOW GRANTS` [statement](sql-statements.html) lists the [privileges](privileges.html) granted to users.


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/show_grants.html %}

## Required Privileges

No [privileges](privileges.html) are required to view privileges granted to users.

## Parameters

Parameter | Description
----------|------------
`table_name` | A comma-separated list of table names. Alternately, to list privileges for all tables, use `*`. 
`database_name` | A comma-separated list of database names.
`user_name` | An optional, comma-separated list of grantees. 

## Examples

### Show grants on databases

**Specific database, all users:**

~~~ sql
> SHOW GRANTS ON DATABASE db2:
~~~

~~~ shell
+----------+------------+------------+
| Database |    User    | Privileges |
+----------+------------+------------+
| db2      | betsyroach | CREATE     |
| db2      | root       | ALL        |
+----------+------------+------------+
(2 rows)
~~~

**Specific database, specific user:**

~~~ sql
> SHOW GRANTS ON DATABASE db2 FOR betsyroach;
~~~

~~~ shell
+----------+------------+------------+
| Database |    User    | Privileges |
+----------+------------+------------+
| db2      | betsyroach | CREATE     |
+----------+------------+------------+
(1 row)
~~~

### Show grants on tables

**Specific tables, all users:**

~~~ sql
> SHOW GRANTS ON TABLE db1.t1, db1.t2*;
~~~

~~~ shell
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | betsyroach | DELETE     |
| t1    | henryroach | DELETE     |
| t1    | maxroach   | DELETE     |
| t1    | root       | ALL        |
| t1    | sallyroach | DELETE     |
| t2    | betsyroach | DELETE     |
| t2    | henryroach | DELETE     |
| t2    | maxroach   | DELETE     |
| t2    | root       | ALL        |
| t2    | sallyroach | DELETE     |
+-------+------------+------------+
(10 rows)
~~~

**Specific tables, specific users:**

~~~ sql
> SHOW GRANTS ON TABLE db.t1, db.t2 FOR maxroach, betsyroach;
~~~
~~~ shell
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | betsyroach | DELETE     |
| t1    | maxroach   | DELETE     |
| t2    | betsyroach | DELETE     |
| t2    | maxroach   | DELETE     |
+-------+------------+------------+
(4 rows)
~~~

**All tables, all users:**

~~~ sql
> SHOW GRANTS ON TABLE db1.*;
~~~

~~~ shell
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | betsyroach | DELETE     |
| t1    | henryroach | DELETE     |
| t1    | maxroach   | DELETE     |
| t1    | root       | ALL        |
| t1    | sallyroach | DELETE     |
| t2    | betsyroach | DELETE     |
| t2    | henryroach | DELETE     |
| t2    | maxroach   | DELETE     |
| t2    | root       | ALL        |
| t2    | sallyroach | DELETE     |
| t3    | root       | ALL        |
| t4    | maxroach   | CREATE     |
| t4    | root       | ALL        |
| t5    | maxroach   | CREATE     |
| t5    | root       | ALL        |
+-------+------------+------------+
(15 rows)
~~~

**All tables, specific users:**

~~~ sql
> SHOW GRANTS ON TABLE db1.* FOR maxroach, betsyroach;
~~~

~~~ shell
+-------+------------+------------+
| Table |    User    | Privileges |
+-------+------------+------------+
| t1    | betsyroach | DELETE     |
| t1    | maxroach   | DELETE     |
| t2    | betsyroach | DELETE     |
| t2    | maxroach   | DELETE     |
| t4    | maxroach   | CREATE     |
| t5    | maxroach   | CREATE     |
+-------+------------+------------+
(6 rows)
~~~

## See Also

- [`GRANT`](grant.html)
- [`REVOKE`](revoke.html)
- [Privileges](privileges.html)
- [Information Schema](information-schema.html)

