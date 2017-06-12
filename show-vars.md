---
title: SHOW (session settings)
summary: The SHOW statement displays the current settings for the client session.
toc: false
---

The `SHOW` [statement](sql-statements.html) can display the value of either one or all of
the session setting variables. Some of these can also be configured via [`SET`](set-vars.html).

<div id="toc"></div>

## Required Privileges

No [privileges](privileges.html) are required to display the session settings.

## Synopsis

{% include sql/diagrams/show_var.html %}
{% include sql/diagrams/show_all.html %}

The variable name is case insensitive.
It may be enclosed in double quotes; this is useful if the variable name itself contains spaces.

Special syntax cases supported for compatibility:

| Syntax | Equivalent to |
|--------|---------------|
| `SHOW TRANSACTION PRIORITY` | `SHOW "transaction priority" |
| `SHOW TRANSACTION ISOLATION LEVEL` | `SHOW "transaction isolation level" |
| `SHOW TIME ZONE` | `SHOW "time zone" |
| `SHOW TRANSACTION STATUS` | `SHOW "transaction status" |

{{site.data.alerts.callout_info}}
The `SHOW` statement for session settings in unrelated to the other `SHOW` statements:
[`SHOW CREATE TABLE`](show-create-table.html),
[`SHOW CREATE VIEW`](show-create-view.html),
[`SHOW USERS`](show-users.html),
[`SHOW DATABASES`](show-databases.html),
[`SHOW COLUMNS`](show-columns.html),
[`SHOW GRANTS`](show-grants.html), [`SHOW INDEX`](show-index.html) and
[`SHOW CONSTRAINTS`](show-constraints.html).
{{site.data.alerts.end}}

## Supported variables

| Variable                        | Description                                     | Initial value |  Can be modified with [`SET`](set-vars.html)? |
|---------------------------------|-------------------------------------------------|---------------|-----------------------------------------------|
| `database`                      | The default database for the current session.   | Database in connection string, or empty if not specified.                                                                                                                       | Yes
| `search_path`                   | A list of databases or namespaces that will be searched to resolve unqualified table or function names. For more details, see [Name Resolution](sql-name-resolution.html). | "`{pg_catalog}`" (for ORM compatibility).            | Yes
| `session_user`                  | The user connected for the current session.     | User in connection string.                                                                                                                                                      | No 
| `time zone`                     | The default time zone for the current session   | "`UTC`"                                                                                                                                                                         | Yes
| `default_transaction_isolation` | The default transaction isolation level for the current session. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | Settings in connection string, or "`SERIALIZABLE`" if not specified.  | Yes
| `transaction isolation level`   | The isolation level of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | "`SERIALIZABLE`"                                                                       | Yes
| `transaction priority`          | The priority of the current transaction. See [Transaction parameters](transactions.html#transaction-parameters) for more details. | "`NORMAL`"                                                                                    | Yes
| `transaction status`            | The state of the current transaction. See [Transactions](transactions.html) for more details. | "`NoTxn`"                                                                                                                         | No
| `server_version`                | The version of PostgreSQL that CockroachDB emulates. | Version-dependent.                                                                                                                                                         | No 
| `client_min_messages`           | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No
| `client_encoding`               | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No
| `extra_float_digits`            | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No
| `max_index_keys`                | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No 
| `standard_conforming_strings`   | (Reserved; exposed only for ORM compatibility.) | (Reserved) | No

## Examples

### Showing the value of a single session variable

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
