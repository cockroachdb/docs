---
title: SHOW ALL
summary: The SHOW ALL statement lists all current run-time settings. 
toc: false
---

The `SHOW ALL` [statement](sql-statements.html) lists all current run-time settings.

<div id="toc"></div>

## Required Privileges

No [privileges](privileges.html) are required to list all current run-time settings.

## Synopsis

{% include sql/diagrams/show_all.html %}

## Response

The following run-time variables are returned by `SHOW ALL`:

Variable | Description
------|------------
`DATABASE` | The default database for the current session, as set by [`SET DATABASE`](set-database.html) or the client's connection string. This variable can be viewed with [`SHOW DATABASE`](show-database.html) as well. 
`DEFAULT_TRANSACTION_ISOLATION` | The default transaction isolation level for the current session, as set by `SET DEFAULT_TRANSACTION_ISOLATION` or the client's connection string. 
`MAX_INDEX_KEYS` | Not usable; exposed only for ORM compatibility.
`SEARCH_PATH` | A list of databases or namespaces that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html).
`SERVER_VERSION` | The version of PostgreSQL that CockroachDB emulates.
`SYNTAX` | The default SQL syntax for the current session, as set by `SET SYNTAX`. This variable can be viewed with `SHOW SYNTAX` as well.
`TIME ZONE` | The default time zone for the current session, as set by [`SET TIME ZONE`](set-time-zone.html). This variable can be viewed with [`SHOW TIME ZONE`](show-time-zone.html) as well.
`TRANSACTION ISOLATION LEVEL` | The isolation level of the current transaction, as set by [`SET TRANSACTION ISOLATION LEVEL`](set-transaction.html). When run in the context of a transaction, [`SHOW TRANSACTION ISOLATION LEVEL`](show-transaction.html) returns this variable as well.<br><br>This will differ from `DEFAULT_TRANSACTION_ISOLATION` only when `SHOW ALL` is run in the context of a transaction and `SET TRANSACTION ISOLATION LEVEL` has been used to set a non-default isolation level for the specific transaction.
`TRANSACTION PRIORITY` | The priority of the current transaction, as set by [`SET TRANSACTION PRIORITY`](set-transaction.html). When run in the context of a transaction, [`SHOW TRANSACTION PRIORITY`](show-transaction.html) returns this variable as well.

## Example

~~~ sql
> SHOW ALL;
~~~

~~~
+-------------------------------+--------------+
|           Variable            |    Value     |
+-------------------------------+--------------+
| DATABASE                      | test         |
| DEFAULT_TRANSACTION_ISOLATION | SERIALIZABLE |
| MAX_INDEX_KEYS                |           32 |
| SEARCH_PATH                   | pg_catalog   |
| SERVER_VERSION                | 9.5.0        |
| SYNTAX                        | Traditional  |
| TIME ZONE                     | UTC          |
| TRANSACTION ISOLATION LEVEL   | SERIALIZABLE |
| TRANSACTION PRIORITY          | NORMAL       |
+-------------------------------+--------------+
(9 rows)
~~~

## See Also

- [`SET DATABASE`](set-database.html)
- [`SHOW DATABASE`](show-database.html)
- [`SET TIME ZONE`](set-time-zone.html)
- [`SHOW TIME ZONE`](show-time-zone.html)
- [`SET TRANSACTION`](set-transaction.html)
- [`SHOW TRANSACTION`](show-transaction.html)
