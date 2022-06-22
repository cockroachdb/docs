---
title: SHOW (session settings)
summary: The SHOW statement displays the current settings for the client session.
toc: true
---

The `SHOW` [statement](sql-statements.html) can display the value of either one or all of
the session setting variables. Some of these can also be configured via [`SET`](set-vars.html).

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to display the session settings.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_var.html %}
</div>

{{site.data.alerts.callout_info}}The <code>SHOW</code> statement for session settings is unrelated to the other <code>SHOW</code> statements: <a href="cluster-settings.html#view-current-cluster-settings"><code>SHOW CLUSTER SETTING</code></a>, <a href="show-create.html"><code>SHOW CREATE</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.{{site.data.alerts.end}}

## Parameters

The `SHOW <session variable>` statement accepts a single parameter: the variable name.

The variable name is case insensitive. It may be enclosed in double quotes; this is useful if the variable name itself contains spaces.

### Supported variables

 Variable name | Description | Initial value |  Can be modified with [`SET`](set-vars.html)?
---------------|-------------|---------------|-----------------------------------------------
 `application_name` | The current application name for statistics collection. | Empty string, or `cockroach` for sessions from the [built-in SQL client](use-the-built-in-sql-client.html)  | Yes
 `bytea_output` | The [mode for conversions from `STRING` to `BYTES`](bytes.html#supported-conversions). | `hex` | Yes |
 `database` | The [current database](sql-name-resolution.html#current-database). Database in connection string, or empty if not specified | Yes |
 `default_transaction_isolation` | All transactions execute with `SERIALIZABLE` isolation. See [Transactions: Isolation levels](transactions.html#isolation-levels). | `SERIALIZABLE`  | No
 `default_transaction_read_only` | The default transaction access mode for the current session. If set to `on`, only read operations are allowed in transactions in the current session; if set to `off`, both read and write operations are allowed. See [`SET TRANSACTION`](set-transaction.html) for more details. | `off` | Yes
 `distsql` | <span class="version-tag">New in v2.1:</span> The query distribution mode for the session. By default, CockroachDB determines which queries are faster to execute if distributed across multiple nodes, and all other queries are run through the gateway node. | `auto` | Yes
 `extra_float_digits` | <span class="version-tag">New in v2.1:</span> The number of digits displayed for floating-point values. Only values between `-15` and `3` are supported. | `0` | Yes
 `node_id` | The ID of the node currently connected to.<br><br>This variable is particularly useful for verifying load balanced connections. | Node-dependent | No
 `optimizer` | <span class="version-tag">New in v2.1:</span> The mode in which a query execution plan is generated. If set to `on`, the [cost-based optimizer](cost-based-optimizer.html) is enabled by default and the heuristic planner will only be used if the query is not supported by the cost-based optimizer; if set to `off`, all queries are run through the legacy heuristic planner. | `on` | Yes
 `search_path` | A list of schemas that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | `{public}` | Yes
 `server_version` | The version of PostgreSQL that CockroachDB emulates. | Version-dependent | No |
 `server_version_num` | The version of PostgreSQL that CockroachDB emulates. | Version-dependent | Yes
 `session_user` | The user connected for the current session. | User in connection string | No
 `sql_safe_updates` | If `false`, potentially unsafe SQL statements are allowed, including `DROP` of a non-empty database and all dependent objects, `DELETE` without a `WHERE` clause, `UPDATE` without a `WHERE` clause, and `ALTER TABLE .. DROP COLUMN`. See [Allow Potentially Unsafe SQL Statements](use-the-built-in-sql-client.html#allow-potentially-unsafe-sql-statements) for more details. | `true` for interactive sessions from the [built-in SQL client](use-the-built-in-sql-client.html),<br>`false` for sessions from other clients | Yes
 `statement_timeout` | <span class="version-tag">New in v2.1:</span> The amount of time a statement can run before being stopped.<br><br>This value can be an `int` (e.g., `10`) and will be interpreted as milliseconds. It can also be an interval or string argument, where the string can be parsed as a valid interval (e.g., `'4s'`). A value of `0` turns it off. | `0s` | Yes
 `timezone` | The default time zone for the current session. <br><br>This session variable was named `"time zone"` (with a space) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `UTC` | Yes
 `tracing` | | `off` |
 `transaction_isolation` | All transactions execute with `SERIALIZABLE` isolation. See [Transactions: Isolation levels](transactions.html#isolation-levels). <br><br>This session variable was called `transaction isolation level` (with spaces) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `SERIALIZABLE` | No
 `transaction_priority` | The priority of the current transaction. See [Transactions: Isolation levels](transactions.html#isolation-levels) for more details.<br><br>This session variable was called `transaction priority` (with a space) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `NORMAL` | Yes
 `transaction_read_only` | The access mode of the current transaction. See [Set Transaction](set-transaction.html) for more details. | `off` | Yes
 `transaction_status` | The state of the current transaction. See [Transactions](transactions.html) for more details.<br><br>This session variable was called `transaction status` (with a space) in CockroachDB 1.x. It has been renamed for compatibility with PostgreSQL. | `NoTxn` | No
 `client_encoding` | (Reserved; exposed only for ORM compatibility.) | `UTF8` | No
 `client_min_messages` | (Reserved; exposed only for ORM compatibility.) | `notice` | No
 `datestyle` | (Reserved; exposed only for ORM compatibility.) | `ISO` | No
 `integer_datetimes` | (Reserved; exposed only for ORM compatibility.) | `on` | No
 `intervalstyle` | (Reserved; exposed only for ORM compatibility.) | `postgres` | No
 `max_index_keys` | (Reserved; exposed only for ORM compatibility.) | `32` | No
 `standard_conforming_strings` | (Reserved; exposed only for ORM compatibility.)  
 `on` | No
 `server_encoding` | (Reserved; exposed only for ORM compatibility.) | `UTF8` | Yes

Special syntax cases supported for compatibility:

 Syntax | Equivalent to
--------|---------------
 `SHOW TRANSACTION PRIORITY` | `SHOW "transaction priority"`
 `SHOW TRANSACTION ISOLATION LEVEL` | `SHOW "transaction isolation level"`
 `SHOW TIME ZONE` | `SHOW "timezone"`
 `SHOW TRANSACTION STATUS` | `SHOW "transaction status"`

## Examples

### Showing the value of a single session variable

{% include_cached copy-clipboard.html %}
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

### Showing the value of all session variables

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ALL;
~~~

~~~
+--------------------------------+----------------+
|            variable            |     value      |
+--------------------------------+----------------+
| application_name               | cockroach demo |
| bytea_output                   | hex            |
| client_encoding                | UTF8           |
| client_min_messages            | notice         |
| database                       | defaultdb      |
| datestyle                      | ISO            |
| default_transaction_isolation  | serializable   |
| default_transaction_read_only  | off            |
| distsql                        | auto           |
| experimental_force_lookup_join | off            |
| experimental_force_zigzag_join | off            |
| experimental_opt               | on             |
| extra_float_digits             | 0              |
| integer_datetimes              | on             |
| intervalstyle                  | postgres       |
| max_index_keys                 | 32             |
| node_id                        | 1              |
| search_path                    | public         |
| server_encoding                | UTF8           |
| server_version                 | 9.5.0          |
| server_version_num             | 90500          |
| session_user                   | root           |
| sql_safe_updates               | true           |
| standard_conforming_strings    | on             |
| statement_timeout              | 0s             |
| timezone                       | UTC            |
| tracing                        | off            |
| transaction_isolation          | serializable   |
| transaction_priority           | normal         |
| transaction_read_only          | off            |
| transaction_status             | NoTxn          |
+--------------------------------+----------------+
(31 rows)
~~~

## See also

- [`SET` (session variable)](set-vars.html)
- [Transactions](transactions.html), including [Priority levels](transactions.html#transaction-priorities)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
