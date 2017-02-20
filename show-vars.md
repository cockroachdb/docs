---
title: SHOW (session settings)
summary: The SHOW statement displays the current settings for the client session.
toc: false
---

The `SHOW` [statement](sql-statements.html) can display the value of either one or all of
the session setting variables.

<div id="toc"></div>

## Required Privileges

No [privileges](privileges.html) are required to display the session settings.

## Synopsis

General syntax:

~~~
   SHOW <variable name>
   SHOW ALL
~~~

The variable name is case insensitive.
It may be enclosed in double quotes; this is useful if the variable name itself contains spaces.

Special syntax cases supported for compatibility:

| Syntax | Equivalent to |
|--------|---------------|
| `SHOW TRANSACTION PRIORITY` | `SHOW "transaction priority" |
| `SHOW TRANSACTION ISOLATION LEVEL` | `SHOW "transaction isolation level" |
| `SHOW TIME ZONE` | `SHOW "time zone" |
| `SHOW TRANSACTION STATUS` | `SHOW "transaction status" |

Note: the `SHOW` statement for session settings in unrelated to the
other `SHOW` statements:
[`SHOW CREATE TABLE`](show-create-table.html),
[`SHOW CREATE VIEW`](show-create-view.html),
[`SHOW USERS`](show-users.html),
[`SHOW DATABASES`](show-databases.html),
[`SHOW COLUMNS`](show-columns.html),
[`SHOW GRANTS`](show-grants.html), [`SHOW INDEX`](show-index.html) and
[`SHOW CONSTRAINTS`](show-constraints.html).

## Supported variables

|Variable | Can be modified with [`SET`](set-vars.html)? | Description | Initial value |
|---------|-----------------------------|-------------|---------------|
| `database` | Yes | The default database for the current session. | Database in connection string, or empty if not specified.
| `search_path` | Yes | A list of databases or namespaces that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | "`{pg_catalog}`" (for ORM compatibility).
| `session_user` | No | The user connected for the current session. | User in connection string.
| `time zone` | Yes | The default time zone for the current session | "`UTC`"
| `default_transaction_isolation` | Yes | The default transaction isolation level for the current session. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | Settings in connection string, or "`SERIALIZABLE`" if not specified.
| `transaction isolation level` | Yes | The isolation level of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | "`SERIALIZABLE`"
| `transaction priority` | Yes | The priority of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | "`NORMAL`"
| `transaction status` | No | The state of the current transaction. See [Transactions](transactions.html) for more details. | "`NoTxn`"
| `server_version` | No | The version of PostgreSQL that CockroachDB emulates. | Version-dependent.
| `syntax` | Yes | The default SQL syntax for the current session. | "`Traditional`"
| `max_index_keys` | No | (Reserved; exposed only for ORM compatibility.) | (Reserved)

## Example

~~~ sql
> SHOW DATABASE;
~~~

~~~
+----------+
| database |
+----------+
| test     |
+----------+
(1 row)
~~~

~~~ sql
> SHOW ALL;
~~~

~~~
+-------------------------------+--------------+
|           Variable            |    Value     |
+-------------------------------+--------------+
| database                      | test         |
| default_transaction_isolation | SERIALIZABLE |
| max_index_keys                |           32 |
| search_path                   | pg_catalog   |
| server_version                | 9.5.0        |
| session_user                  | root         |
| syntax                        | Traditional  |
| time zone                     | UTC          |
| transaction isolation level   | SERIALIZABLE |
| transaction priority          | NORMAL       |
+-------------------------------+--------------+
(10 rows)
~~~

## See Also

- [`SET`](set-vars.html)
- [Transactions](transactions.html) and [Transaction parameters](transactions.html#transaction-parameters)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE TABLE`](show-create-table.html)
- [`SHOW CREATE VIEW`](show-create-view.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
