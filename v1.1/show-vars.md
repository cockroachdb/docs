---
title: SHOW (session settings)
summary: The SHOW statement displays the current settings for the client session.
toc: true
---

The `SHOW` [statement](sql-statements.html) can display the value of either one or all of
the session setting variables. Some of these can also be configured via [`SET`](set-vars.html).


## Required Privileges

No [privileges](privileges.html) are required to display the session settings.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/show_var.html %}

{{site.data.alerts.callout_info}}The <code>SHOW</code> statement for session settings is unrelated to the other <code>SHOW</code> statements: <a href="cluster-settings.html#view-current-cluster-settings"><code>SHOW CLUSTER SETTING</code></a>, <a href="show-create-table.html"><code>SHOW CREATE TABLE</code></a>, <a href="show-create-view.html"><code>SHOW CREATE VIEW</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.{{site.data.alerts.end}}

## Parameters

The `SHOW <session variable>` statement accepts a single parameter: the variable name.

The variable name is case insensitive. It may be enclosed in double quotes; this is useful if the variable name itself contains spaces.

### Supported variables

| Variable name | Description | Initial value |  Can be modified with [`SET`](set-vars.html)? |
|---------------|-------------|---------------|-----------------------------------------------|
| `application_name` | The current application name for statistics collection. | Empty string, or `cockroach` for sessions from the [built-in SQL client](use-the-built-in-sql-client.html)  | Yes |
| `database` | The default database for the current session. | Database in connection string, or empty if not specified | Yes |
| `default_transaction_isolation` | The default transaction isolation level for the current session. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | Settings in connection string, or `SERIALIZABLE` if not specified | Yes |
| `distsql` | | `auto` | |
| `node_id` | <span class="version-tag">New in v1.1:</span> The ID of the node currently connected to.<br><br>This variable is particularly useful for verifying load balanced connections. | Node-dependent | No |
| `search_path` | A list of databases or namespaces that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | `{pg_catalog}` (for ORM compatibility) | Yes |
| `server_version` | The version of PostgreSQL that CockroachDB emulates. | Version-dependent | No |
| `session_user` | The user connected for the current session. | User in connection string | No |
| `sql_safe_updates` | If `false`, potentially unsafe SQL statements are allowed, including `DROP` of a non-empty database and all dependent objects, `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE .. DROP COLUMN`. See [Allow Potentially Unsafe SQL Statements](use-the-built-in-sql-client.html#allow-potentially-unsafe-sql-statements) for more details. | `true` for interactive sessions from the [built-in SQL client](use-the-built-in-sql-client.html),<br>`false` for sessions from other clients | Yes |
| `time zone` | The default time zone for the current session   | `UTC` | Yes |
| `tracing` | | `off` | |
| `transaction isolation level` | The isolation level of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | `SERIALIZABLE` | Yes |
| `transaction priority` | The priority of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | `NORMAL` | Yes |
| `transaction status` | The state of the current transaction. See [Transactions](transactions.html) for more details. | `NoTxn` | No |
| `client_encoding` | (Reserved; exposed only for ORM compatibility.) | `UTF8` | No |
| `client_min_messages` | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No |
| `datestyle` | (Reserved; exposed only for ORM compatibility.) | `ISO` | No |
| `extra_float_digits` | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No |
| `max_index_keys` | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No |
| `standard_conforming_strings` | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No |

Special syntax cases supported for compatibility:

| Syntax | Equivalent to |
|--------|---------------|
| `SHOW TRANSACTION PRIORITY` | `SHOW "transaction priority"` |
| `SHOW TRANSACTION ISOLATION LEVEL` | `SHOW "transaction isolation level"` |
| `SHOW TIME ZONE` | `SHOW "time zone"` |
| `SHOW TRANSACTION STATUS` | `SHOW "transaction status"` |

## Examples

### Showing the Value of a Single Session Variable

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

### Showing the Value of all Session Variables

~~~ sql
> SHOW ALL;
~~~

~~~
+-------------------------------+--------------+
|           Variable            |    Value     |
+-------------------------------+--------------+
| application_name              |              |
| client_encoding               | UTF8         |
| client_min_messages           |              |
| database                      |              |
| default_transaction_isolation | SERIALIZABLE |
| distsql                       | off          |
| extra_float_digits            |              |
| max_index_keys                |           32 |
| node_id                       |            1 |
| search_path                   | pg_catalog   |
| server_version                | 9.5.0        |
| session_user                  | root         |
| standard_conforming_strings   | on           |
| time zone                     | UTC          |
| transaction isolation level   | SERIALIZABLE |
| transaction priority          | NORMAL       |
| transaction status            | NoTxn        |
+-------------------------------+--------------+
(16 rows)
~~~

## See Also

- [`SET` (session variable)](set-vars.html)
- [Transactions](transactions.html) and [Transaction parameters](transactions.html#transaction-parameters)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE TABLE`](show-create-table.html)
- [`SHOW CREATE VIEW`](show-create-view.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
