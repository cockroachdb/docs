---
title: RENAME DATABASE
toc: false
---

The `RENAME DATABASE` [statement](sql-statements.html) changes the name of a database.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/rename_database.html %}

## Required Privileges

Only the `root` user can rename databases.

## Usage

To rename a database, use the `ALTER TABLE` statement followed by the current database name, the `RENAME TO` statement, and the new database name:

~~~ sql
ALTER DATABASE db1 RENAME TO db2  
~~~
