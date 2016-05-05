---
title: GRANT
toc: false
toc_nested: true
---

The `GRANT` [statement](sql-statements.html) grants user [privileges](privileges.html) for interacting with specific databases and tables. 

For privileges required by specific statements, see the documentation for the respective [SQL statement](sql-statements.html).

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/grant.html %}

## Required Privileges

The user granting privileges must have the `GRANT` privilege on the target databases or tables.  

## Supported Privileges

Users can be granted the following privileges. Some privileges are applicable both for databases and tables, while other are applicable only for tables (see **Levels** in the table below). 

- When a user is granted privileges for a database, new tables created in the database will inherit the privileges, but the privileges can then be changed. 
- When a user is granted privileges for a table, the privileges are limited to the table.
- The `root` user is automatically assigned the `ALL` privilege for new databases and is the only user allowed to create databases. 
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

## Usage

### Grant Privileges on Databases

To grant privileges on one or more databases, use the following syntax:

~~~
GRANT <privileges> ON DATABASE <databases> TO <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<databases>` is a comma-separated list of database names; and `<users>` is a comma-separated list of user names.

The privileges will be inherited by any new tables created in the target databases.

### Grant Privileges on Specific Tables in a Database

To grant privileges on one or more tables in a database, use the following syntax:

~~~
GRANT <privileges> ON <tables> TO <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<tables>` is a comma-separated list of table names, each in `database.table` format; and `<users>` is a comma-separated list of user names.

Alternately, you can add the `TABLE` keyword:

~~~
GRANT <privileges> on TABLE <tables> TO <users>
~~~

### Grant Privileges on All Tables in a Database

To grant privileges on all current tables in one or more databases, use the following syntax:

~~~
GRANT <privileges> ON <databases>.* TO <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<databases>` is a comma-separated list of database names, each with the `.*` suffix; and `<users>` is a comma-separated list of user names. 

## Examples

Let's say you have an `animals` database containing two tables: 

~~~ 
SHOW tables FROM animals;
+-------------+
|    Table    |
+-------------+
| aardvarks   |
| baboons     |
+-------------+
~~~

You want the `maxroach` user to have the `SELECT` privilege on both tables, and you want the `betsyroach` user to have `ALL` privileges on both tables as well as any new tables created in the database. 

First, you grant the `maxroach` user the `SELECT` privilege on the two current tables:

~~~ 
GRANT SELECT ON animals.* TO maxroach;
GRANT

SHOW GRANTS ON animals.* FOR maxroach;
+-----------+----------+------------+
|   Table   |   User   | Privileges |
+-----------+----------+------------+
| aardvarks | maxroach | SELECT     |
| baboons   | maxroach | SELECT     |
+-----------+----------+------------+
~~~

Next, you grant the `betsyroach` user the `ALL` privilege on the two current tables:

~~~ 
GRANT ALL ON animals.* TO betsyroach;
GRANT

SHOW GRANTS ON animals.* FOR betsyroach;
+-----------+------------+------------+
|   Table   |    User    | Privileges |
+-----------+------------+------------+
| aardvarks | betsyroach | ALL        |
| baboons   | betsyroach | ALL        |
+-----------+------------+------------+
~~~

Finally, you grant the `betsyroach` user the `ALL` privilege on the `animals` database to ensure that the user retains the privilege for all new tables created in the database:

~~~ 
GRANT ALL ON DATABASE animals TO betsyroach;
GRANT

SHOW GRANTS ON DATABASE animals FOR betsyroach;
+----------+------------+------------+
| Database |    User    | Privileges |
+----------+------------+------------+
| animals  | betsyroach | ALL        |
+----------+------------+------------+
~~~

Whenever a new table is created in the `animals` database, the `betsyroach` user will inherit the `ALL` privilege on the table:

~~~ 
CREATE TABLE animals.cockroaches (name STRING, count INT);
CREATE TABLE

SHOW GRANTS ON animals.cockroaches FOR betsyroach;
+-------------+------------+------------+
|    Table    |    User    | Privileges |
+-------------+------------+------------+
| cockroaches | betsyroach | ALL        |
+-------------+------------+------------+
~~~

## See Also

- [Privileges](privileges.html)
- [`REVOKE`](revoke.html)
- [`SHOW GRANTS`](show-grants.html)
- [Other SQL Statements](sql-statements.html)