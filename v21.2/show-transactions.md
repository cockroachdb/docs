---
title: SHOW TRANSACTIONS
summary: The SHOW TRANSACTIONS statement lists all currently active transactions across the cluster or on the gateway node.
toc: true
---

 The `SHOW TRANSACTIONS` [statement](sql-statements.html) lists details about currently active transactions, including:

- The node running the transaction
- The application that initiated the transaction
- The number of statements that have been executed on the transaction
- The number of times the transaction was retried (both manually and by the SQL executor)

These details let you monitor the overall state of transactions and identify those that may need further investigation or adjustment.

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to execute this statement. However, note that non-`admin` users see only their own currently active transactions, whereas the `admin` users see all users' currently active transactions.

## Syntax

~~~
SHOW [ALL] [CLUSTER | LOCAL] TRANSACTIONS
~~~

- To list the active transactions across all nodes of the cluster, use `SHOW TRANSACTIONS` or `SHOW CLUSTER TRANSACTIONS`.
- To list the active transactions just on the gateway node, use `SHOW LOCAL TRANSACTIONS`.
- To list internal transactions (that are issued by the database itself), use `SHOW ALL .. TRANSACTIONS`.

## Response

The following fields are returned for each transaction:

 Field             | Description
-------------------+---------------------------------------
`node_id`          | The ID of the node running the transaction.
`txn_id`           | The ID of the transaction.
`application_name` | The [application name](set-vars.html#supported-variables) specified by the client, if any. For transactions from the [built-in SQL client](cockroach-sql.html), this will be `$ cockroach sql`.
`num_stmts`        | The number of statements that have been executed on the transaction.
`num_retries`      | The number of times that the transaction was retried.
`num_auto_retries` | The number of times that the transaction was automatically retried by the SQL executor.

## Examples

### List active transactions across the cluster

{% include copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER TRANSACTIONS;
~~~

~~~
  node_id |                txn_id                | application_name | num_stmts | num_retries | num_auto_retries
----------+--------------------------------------+------------------+-----------+-------------+-------------------
        1 | 1f02ca1c-46c8-491b-8048-daa6b38fc587 | $ cockroach sql  |         1 |           0 |                0
        2 | 3af3f2e3-d0ed-4fd4-886b-1f5fc67b397d | movr             |         1 |           0 |                0
(2 rows)
~~~

Alternatively, you can use `SHOW TRANSACTIONS` to receive the same response.

### List active transactions on the gateway node

{% include copy-clipboard.html %}
~~~ sql
> SHOW LOCAL TRANSACTIONS;
~~~

~~~
  node_id |                txn_id                | application_name | num_stmts | num_retries | num_auto_retries
----------+--------------------------------------+------------------+-----------+-------------+-------------------
        1 | 1f02ca1c-46c8-491b-8048-daa6b38fc587 | $ cockroach sql  |         1 |           0 |                0
(1 row)
~~~

### Filter for specific transactions

You can use a [`SELECT`](select-clause.html) statement to filter the list of currently active transactions by one or more of the [response fields](#response).

#### Show transactions associated with a specific application

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER TRANSACTIONS] WHERE application_name = 'movr';

~~~

~~~
  node_id |                txn_id                | application_name | num_stmts | num_retries | num_auto_retries
----------+--------------------------------------+------------------+-----------+-------------+-------------------
        1 | 59891000-260a-44f6-abf9-59c94fefc081 | movr             |         1 |           0 |                0
(1 row)
~~~

#### Exclude transactions from the built-in SQL client

To exclude transactions from the [built-in SQL client](cockroach-sql.html), filter for transactions that do not show `$ cockroach sql` as the `application_name`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW CLUSTER TRANSACTIONS]
      WHERE application_name != '$ cockroach sql';
~~~

~~~
  node_id |                txn_id                | application_name | num_stmts | num_retries | num_auto_retries
----------+--------------------------------------+------------------+-----------+-------------+-------------------
        1 | 8851060b-5e7c-4402-a8cd-487baa63e02e | movr             |         1 |           0 |                0
(1 row)
~~~

## See also

- [Transactions](transactions.html)
- [Other SQL Statements](sql-statements.html)
