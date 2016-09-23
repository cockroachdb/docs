---
title: EXPLAIN
summary: The EXPLAIN statement provides debugging and analysis for a DELETE, INSERT, SELECT, or UPDATE statement.
toc: false
---

The `EXPLAIN` [statement](sql-statements.html) provides debugging and analysis details for `DELETE`, `INSERT`, `SELECT` or `UPDATE` statements. 

For example, you might want to explain the a `SELECT` statement's plan to ensure it has [an efficient index to use](indexes.html#selection).

{{site.data.alerts.callout_info}}Explained statements are not executed.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/explain.html %}

## Required Privileges

The user requires the appropriate [privileges](privileges.html) for the statement being explained.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `PLAN` | *(Default)* Explain the indexes or number of columns the statement uses in the **Description** column.<br/><br/>Also includes **Level** and **Type** columns |
| `TYPES` | Explain the columns and values the statement uses in the **Description** column<br/><br/>Also includes the **Level**, **Type**, and **Element** columns. |
| `VERBOSE` | Explain each operation in detail in the **Description** column<br/><br/>Also includes **Level**, **Type**, **Columns**, and **Ordering** columns |
| `target_statement` | The [`DELETE`](delete.html), [`INSERT`](insert.html), [`SELECT`](select.html) or [`UPDATE`](update.html) statement you want to explain |

## Success Responses

Successful `EXPLAIN` statements return a table with some of the following columns:

| Column | Description |
|--------|-------------|
| **Level** | The order in which the operations are performed, starting at the highest number and decrementing to 0 |
| **Type** | The operation's type, for example `scan` for finding values in tables | 
| **Element** | ¯\\\_(ツ)\_/¯ |
| **Description** | See the [parameters table above](#parameters) for explanation of the **Description** column |
| **Columns** | A comma-separated list of columns or values the operation uses |
| **Ordering** | ¯\\\_(ツ)\_/¯ |

## Examples

### Explain the Plan of an `INSERT`

`PLAN` (which is the default parameter of `EXPLAIN`) shows the index the statement uses.

~~~ sql
> EXPLAIN INSERT INTO bank.accounts (name, balance) VALUES ('Tommy', 1000);
~~~
~~~
+-------+--------+-------------+
| Level |  Type  | Description |
+-------+--------+-------------+
|     0 | insert |             |
|     1 | values | 2 columns   |
+-------+--------+-------------+
~~~

### Explain the Types of an `UPDATE`

Types explain the columns used in the statement, as well as

~~~ sql
> EXPLAIN (TYPES) UPDATE bank.accounts SET balance = 2500 WHERE name = 'Marciela';
~~~
~~~
+-------+---------------+----------+---------------------------------------------------------+
| Level |     Type      | Element  |                       Description                       |
+-------+---------------+----------+---------------------------------------------------------+
|     0 | update        | result   | ()                                                      |
|     1 | select        | result   | (id int, balance decimal, "2500" decimal)               |
|     2 | render/filter | result   | (id int, balance decimal, "2500" decimal)               |
|     2 | render/filter | render 0 | (id)[int]                                               |
|     2 | render/filter | render 1 | (balance)[decimal]                                      |
|     2 | render/filter | render 2 | (2500)[decimal]                                         |
|     3 | scan          | result   | (id int, name string, balance decimal, adddress string) |
|     3 | scan          | filter   | ((name)[string] = ('Marciela')[string])[bool]           |
+-------+---------------+----------+---------------------------------------------------------+
~~~

### Verbosely Explain a `SELECT`

~~~ sql
> EXPLAIN (VERBOSE) SELECT name, balance FROM bank.accounts;
~~~
~~~
+-------+---------------+--------------------------------------------------------------------+---------------------+------------+
| Level |     Type      |                            Description                             |       Columns       |  Ordering  |
+-------+---------------+--------------------------------------------------------------------+---------------------+------------+
|     0 | select        |                                                                    | (name, balance)     |            |
|     1 | render/filter | from (bank.accounts.id, bank.accounts.name, bank.accounts.balance) | (name, balance)     |            |
|     2 | scan          | accounts@primary                                                   | (id, name, balance) | +id,unique |
+-------+---------------+--------------------------------------------------------------------+---------------------+------------+
~~~

## See Also

- [Troubleshooting](troubleshoot.html)
- [Indexes](indexes.html)
- [`DELETE`](delete.html)
- [`INSERT`](insert.html)
- [`SELECT`](select.html)
- [`UPDATE`](update.html)
