---
title: GRANT
toc: false
---

The `GRANT` [statement](sql-statements.html) grants one or more users specific privileges on one or more databases or tables. 

The user granting privileges must have the `GRANT` privilege on the target databases or tables.  

<style>
div#toc ul {
    max-width: 50%;
}
</style>

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/grant.html %}

## Privileges

Users can be granted privileges at the database or table level. When privileges are granted on a database, any tables subsequently created in the database inherit the privileges, but their privileges can then be updated at any time. When privileges are granted on a table, the privileges are limited to the table.    

The `root` user is assigned the `ALL` privilege all on new databases; this privilege cannot be revoked. Also, the `root` user is the only user allowed to create and drop databases. 


The following table shows you the statements covered by each privilege, both at the database and table levels.

Privilege | On Database | On Table
----------|-------------|---------
`ALL` | |
`CREATE` | |
`DROP` | |
`GRANT` | |
`SELECT` | |
`INSERT` | |
`DELETE` | |
`UPDATE` | |

- [`ALL`](#all)
- [`CREATE`](#create)
- [`DROP`](#drop)
- [`GRANT`](#grant)
- [`SELECT`](#select)
- [`INSERT`](#insert)
- [`DELETE`](#delete)
- [`UPDATE`](#update)

### `ALL`

Level | Description
------|------------
Database | The user has all privileges on all tables in the database.
Table | The user has all privileges on the specified table.

### `CREATE`

Note that only the `root` user can [create databases](create-database.html).

Level | Description
------|------------
Database | The user can [create tables](create-table.html) and [indexes](create-index.html) in the database.
Table | The user can [create indexes](create-index.html) on the specified table.

### `DROP`

Note that only the `root` user can [drop databases](drop-database.html).

Level | Description
------|------------
Database | The user can [drop tables](drop-table.html) and [indexes](drop-index.html) in the database.
Table | The user can [drop indexes](drop-index.html) on the specified table.

### `GRANT`

Level | Description
------|------------
Database | The user can grant privileges on any table in the database.
Table | The user can grant privileges on the specified table.

### `SELECT`

Level | Description
------|------------
Database | The user can [select](select.html) data from any table in the database.
Table | The user can [select](select.html) data from the specified table.

### `INSERT`

Level | Description
------|------------
Database | The user can [insert rows](insert.html) into any table in the database. 
Table | The user can [insert rows](insert.html) into the specified database.

### `DELETE`

Currently, the `SELECT` privilege is required in conjunction with `DELETE`. If `SELECT` is not granted, the user will not be able to execute deletes.

Level | Description
------|------------
Database | The user can [delete rows](delete.html) from any table in the database.
Table | The user can [delete rows](delete.html) from the specified table.

### `UPDATE`

Currently, the `SELECT` privilege is required in conjunction with `UPDATE`. If `SELECT` is not granted, the user will not be able to execute updates.

Level | Description
------|------------
Database | The user can [update](update.html) any tables in the database. 
Table | The user can [update](update.html) the specified table.

## Grant Privileges on All Future Tables

To grant privileges on all **future** tables in one or more databases, but not on any existing tables, use the following syntax:

~~~
GRANT <privileges> on DATABASE <databases> TO <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<databases>` is a comma-separated list of database names; and `<users>` is a comma-separated list of user names.

### Example

Let's say you just created a new `drinks` database:

~~~ 
CREATE DATABASE drinks;
~~~

You want the user `lisaroach` to have `ALL` privileges on all future tables in the database, so you run the following statement:

~~~ 
GRANT ALL ON DATABASE drinks TO lisaroach;
~~~

Going forward, the `lisaroach` user will be granted the `ALL` privilege on all new tables in the `drinks` database:

~~~ 
CREATE TABLE drinks.coffee (a INT, b STRING);

CREATE TABLE drinks.tea (a INT, b STRING);

SHOW GRANTS ON drinks.coffee, drinks.tea FOR lisaroach;
+--------+-----------+------------+
| Table  |   User    | Privileges |
+--------+-----------+------------+
| coffee | lisaroach | ALL        |
| tea    | lisaroach | ALL        |
+--------+-----------+------------+
~~~

## Grant Privileges on All Existing Tables

To grant privileges on all **existing** tables in one or more databases, but not on any future tables, use the following syntax:

~~~
GRANT <privileges> on <databases>.* TO <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<databases>` is a comma-separated list of database names, each with the `.*` suffix; and `<users>` is a comma-separated list of user names. 

### Example

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

You want the user `maxroach` to have `SELECT` and `INSERT` privileges on both tables, so you run the following statement:

~~~ 
GRANT SELECT, INSERT ON animals.* TO maxroach;
~~~

This applies the `SELECT` and `INSERT` privileges to both tables in the `animals` database:

~~~ 
SHOW GRANTS ON animals.aardvarks, animals.baboons FOR maxroach;
+-------------+----------+---------------+
|    Table    |   User   |  Privileges   |
+-------------+----------+---------------+
| aardvarks   | maxroach | INSERT,SELECT |
| baboons     | maxroach | INSERT,SELECT |
+-------------+----------+---------------+
~~~

However, it does not apply the `SELECT` and `INSERT` privileges to the `animals` database itself, so new tables will not inherit the privileges:

~~~ 
CREATE TABLE animals.elephants (a INT, b STRING);

SHOW GRANTS ON animals.elephants;
+-----------+------+------------+
|   Table   | User | Privileges |
+-----------+------+------------+
| elephants | root | ALL        |
+-----------+------+------------+
~~~

## Grant Privileges on Specific Tables

To grant privileges on one or more specific tables in a database, use the following syntax:

~~~
GRANT <privileges> on <tables> TO <users>
~~~

where `<privileges>` is a comma-separated list of [privileges](#supported-privileges); `<tables>` is a comma-separated list of table names, each in `database.table` format; and `<users>` is a comma-separated list of user names.

You can also use this syntax:

~~~
GRANT <privileges> on TABLE <tables> TO <users>
~~~

### Example

Let's say you have a `music` database containing two tables: 

~~~ 
SHOW tables FROM music;
+-----------+
|   Table   |
+-----------+
| bluegrass |
| freejazz  |
+-----------+
~~~

You want the user `bobroach` to have the `INSERT` privilege on just the `freejazz` table, so you run the following statement:

~~~ 
GRANT INSERT ON music.freejazz TO bobroach;
~~~

This applies the `INSERT` privilege on the `freejazz` table but not on the `bluegrass` table:

~~~ 
SHOW GRANTS ON music.freejazz, music.bluegrass;
+-----------+----------+------------+
|   Table   |   User   | Privileges |
+-----------+----------+------------+
| freejazz  | bobroach | INSERT     |
| freejazz  | root     | ALL        |
| bluegrass | root     | ALL        |
+-----------+----------+------------+
~~~

## See Also

[SQL Statements](sql-statements.html)