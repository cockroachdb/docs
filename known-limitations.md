---
title: Known Limitations
summary:
toc: false
---

This page describes limitations we've identified in the [CockroachDB 1.0](v1.0.html) release and plan to investigate and possibly resolve in future releases.

<div id="toc"></div>

## Removing all rows from large tables

When removing all rows from a table via a [`TRUNCATE`](truncate.html) statement or a [`DELETE`](delete.html#delete-all-rows) statement without a `WHERE` clause, the entire operation is currently batched as a single [transaction](transactions.html). For large tables, this can cause the nodes containing the table data to either crash or exhibit poor performance due to elevated memory and CPU usage.

As a workaround, when you need to remove all rows from a large table:

1. Use [`SHOW CREATE TABLE`](show-create-table.html) to get the table schema.
2. Use [`DROP TABLE`](drop-table.html) to remove the table.
3. Use [`CREATE TABLE`](create-table.html) with the output from step 1 to recreate the table.

## Schema changes within transactions

Within a single [transaction](transactions.html):

- DDL statements cannot follow DML statements. As a workaround, arrange DML statements before DDL statements, or split the statements into separate transactions.
- A [`CREATE TABLE`](create-table.html) statement containing [`FOREIGN KEY`](foreign-key.html) or [`INTERLEAVE`](interleave-in-parent.html) clauses cannot be followed by statements that reference the new table.
- A table cannot be dropped and then recreated with the same name. This is not possible within a single transaction because `DROP TABLE` does not immediately drop the name of the table. As a workaround, split the [`DROP TABLE`](drop-table.html) and [`CREATE TABLE`](create-table.html) statements into separate transactions.

## Join flags when restoring a backup onto new machines

In our [deployment tutorials](manual-deployment.html), when starting the first node of a cluster, the `--join` flag should be empty, but when starting all subsequent nodes, `--join` should be set to the address of node 1. This approach ensures that all nodes have access to a copy of the first key-value range, which is part of a meta-index identifying where all range replicas are stored, and which nodes require to initialize themselves and start accepting incoming connections.

Ensuring that all nodes have access to a copy of the first key-value range is a bit tougher when restoring from a whole-cluster backup onto machines with different IP addresses than the original cluster. In this case, the `--join` flags must form a fully-connected directed graph. The easiest way to do this is to put all of the new nodes' addresses into each node's `--join` flag, which ensures all nodes will be able to join a node with a copy of the first key-value range.

## `INSERT ON CONFLICT` vs. `UPSERT`

When inserting/updating all columns of a table, and the table has no secondary indexes, it's recommended to use an [`UPSERT`](upsert.html) statement instead of the equivalent [`INSERT ON CONFLICT`](insert.html) statement. Whereas the `INSERT ON CONFLICT` always has to read to determine the necessary writes, the `UPSERT` statement writes without first reading and so will be faster.

This limitations may be particularly relevant if you are using a simple SQL table of two columns to [simulate direct KV access](frequently-asked-questions.html#can-i-use-cockroachdb-as-a-key-value-store). In that case, be sure to use the `UPSERT` statement.

## `unique_rowid()` values in Javascript

The `unique_rowid()` [function](functions-and-operators.html) returns values that cannot be represented exactly by numbers in Javascript. For example, a `235191684988928001` value returned by `unique_rowid()` would get represented as `235191684988928000` in Javascript. Notice that the last digit is different. In such cases, if the Javascript application temporarily stores the value `235191684988928001` and queries using it, it won't match the value that actually got stored.

As a workaround when using JavaScript or another language that doesn't support 64-bit integer types, cast the integer to a string server-side before inspecting or using it, for example:

~~~ sql
> SELECT CAST (id AS string) FROM my_table;
~~~

## Repeated or combined commands in the SQL shell history

In the [built-in SQL shell](use-the-built-in-sql-client.html), each previously executed command is stored in the SQL shell history. In some cases, commands are unexpectedly duplicated in the history.

Also, in some terminals, such  as `st` or `xterm` without `tmux`, previously executed commands are combined into a single command in the SQL shell history.

## Using `\|` to perform a large input in the SQL shell

In the [built-in SQL shell](use-the-built-in-sql-client.html), using the [`\|`](use-the-built-in-sql-client.html#sql-shell-commands) operator to perform a large number of inputs from a file can cause the server to close the connection. This is because `\|` sends the entire file as a single query to the server, which can exceed the upper bound on the size of a packet the server can accept from any client (16MB).

As a workaround, [execute the file from the command line](use-the-built-in-sql-client.html#execute-sql-statements-from-a-file) with `cat data.sql | cockroach sql` instead of from within the interactive shell.

## New values generated by `DEFAULT` expressions during `ALTER TABLE ADD COLUMN`

When executing an [`ALTER TABLE ADD COLUMN`](add-column.html) statement with a [`DEFAULT`](default-value.html) expression, new values generated:

- use the default [search path](sql-name-resolution.html#search-path) regardless of the search path configured in the current session via `SET SEARCH_PATH`.
- use the UTC time zone regardless of the time zone configured in the current session via [`SET TIME ZONE`](set-time-zone.html).
- have no default database regardless of the default database configured in the current session via [`SET DATABASE`](set-database.html).
- use the transaction timestamp for the `statement_timestamp()` function regardless of the time at which the `ALTER` statement was issued.

## Load-based lease rebalancing in uneven latency deployments

When nodes are started with the [`--locality`](start-a-node.html) flag, CockroachDB attempts to place the replica lease holder (the replica that client requests are forwarded to) on the node that is closest to the source of the request. This means that as client requests move geographically, so does the replica lease holder.

However, you might see increased latency caused by a consistently high rate of lease transfers between datacenters in the following case:

- Your cluster is running in datacenters that are very different distances away from each other.
- Each node was started with a single tier of `--locality`, e.g., `--locality=datacenter=a`.
- Most client requests get sent to a single datacenter because that's where all your application traffic is.

To detect that this is happening, open the [Admin UI](explore-the-admin-ui.html), select the **Queues** dashboard, hover over the **Replication Queue** graph, and check the **Leases Transferred / second** data point. If that data point is consistently larger than 0, you should consider stopping and restarting each node with additional tiers of locality to improve request latency.

For example, let's say that latency is 10ms from nodes in datacenter A to nodes in datacenter B but is 100ms from nodes in datacenter A to nodes in datacenter C. To ensure that A and B's relative proximity is factored into lease holder rebalancing, you could restart the nodes in datacenter A and B with a common region, `--locality=region=foo,datacenter=a` and `--locality=region=foo,datacenter=b`, while restarting nodes in datacenter C with a different region, `--locality=region=bar,datacenter=c`.

## Roundtrip to `STRING` does not respect precendences of `:::` and `-`

Queries with constant expressions that evaluate to 2**-63 may be incorrectly rejected, for example:

~~~ sql
> CREATE TABLE t (i int PRIMARY KEY);

> INSERT INTO t VALUES (1), (2), (3);

> SELECT (-9223372036854775808) ::: INT;

> SELECT i FROM t WHERE (i, i) < (1, -9223372036854775808);
~~~

~~~
pq: ($0, $0) < (1, - 9223372036854775808:::INT): tuples ($0, $0), (1, - 9223372036854775808:::INT) are not comparable at index 2: numeric constant out of int64 range
~~~

## Overload resolution for collated strings

Many string operations are not properly overloaded for collated strings, for example:

~~~ sql
> SELECT 'string1' || 'string2';
~~~

~~~
+------------------------+
| 'string1' || 'string2' |
+------------------------+
| string1string2         |
+------------------------+
(1 row)
~~~

~~~ sql
> SELECT ('string1' collate en) || ('string2' collate en);
~~~

~~~
pq: unsupported binary operator: <collatedstring{en}> || <collatedstring{en}>
~~~

## Creating views with array types

It's not possible to [create a view](create-view.html) with an array type in the view's `SELECT` query. Attempting to do so causes the node that receives the request to crash.

## Write and update limits for a single transaction

A single transaction can contain at most 100,000 write operations (e.g., changes to individual columns) and at most 64MiB of combined updates. When a transaction exceeds these limits, it gets aborted. Running `INSERT INTO .... SELECT FROM ...` queries is a common way to hit these limits.

If you need to increase these limits, you can update the [cluster-wide settings](cluster-settings.html) `kv.transaction.max_intents` and `kv.raft.command.max_size`. For `INSERT INTO .. SELECT FROM` queries in particular, another workaround is to manually page through the data to be inserted using separate transactions.

## Max size of a single column family

When creating or updating a row, if the combined size of all the values in a single [column family](column-families.html) exceeds the max range size (64MiB by default) for the table, the operation may fail, or cluster performance may suffer.

As a workaround, you can either [manually split a table's columns into multiple column families](column-families.html#manual-override), or you can [create a table-specific zone configuration](configure-replication-zones.html#create-a-replication-zone-for-a-table) with an increased max range size.

## Simultaneous client connections and running queries on a single node

When a node has both a high number of client connections and running queries, the node may crash due to memory exhaustion. This is due to CockroachDB not accurately limiting the number of clients and queries based on how much free RAM is available on the node.

To prevent memory exhaustion, monitor each node's memory usage and ensure there is some margin between maximum CockroachDB memory usage and available system RAM. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

## SQL subexpressions and memory usage

Many SQL subexpressions (e.g., `ORDER BY`, `UNION`/`INTERSECT`/`EXCEPT`, `GROUP BY`, subqueries, window functions) accumulate intermediate results in RAM on the node processing the query. If the operator attempts to process more rows than can fit into RAM, either a memory capacity error will be reported to the client that issued the query, or the node may crash. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

## Counting distinct rows in a table

When using `count(DISTINCT a.*)` to count distinct rows in a table based on a subset of the columns, as opposed to `count(*)`, the results are almost always incorrect, for example:

~~~ sql
> CREATE TABLE t (a INT, b INT);

> INSERT INTO t VALUES (1, 2), (1, 3), (2, 1);

> SELECT count(DISTINCT t.*) FROM t;
~~~

~~~
+---------------------+
| count(DISTINCT t.*) |
+---------------------+
|                   1 |
+---------------------+
(1 row)
~~~

As a workaround, list the columns explicitly, for example:

~~~ sql
> SELECT count(DISTINCT (t.a, t.b)) FROM t;
~~~

~~~
+----------------------------+
| count(DISTINCT (t.a, t.b)) |
+----------------------------+
|                          3 |
+----------------------------+
(1 row)
~~~

## Running on Windows as a non-admin user

When a CockroachDB node is started, logs are written to a file by default, with a symlink referencing the log file. On Windows, symlink creation requires admin permissions. Therefore, when running CockroachDB on Windows as a non-admin user, you must pass the `--log-dir=` to the `cockroach start` command to have logs written to `stdout` instead of to a file:

~~~ shell
$ cockroach.exe start --insecure --log-dir=
~~~

## Query planning for `OR` expressions

Given a query like `SELECT * FROM foo WHERE a > 1 OR b > 2`, even if there are appropriate indexes to satisfy both `a > 1` and `b > 2`, the query planner will perform a full table or index scan because it can't use both conditions at once.

## Privileges for `DELETE` and `UPDATE`

Every [`DELETE`](delete.html) or [`UPDATE`](update.html) statement constructs a `SELECT` statement, even when no `WHERE` clause is involved. As a result, the user executing `DELETE` or `UPDATE` requires both the `DELETE` and `SELECT` or `DELETE` and `UPDATE` [privileges](privileges.html) on the table.
