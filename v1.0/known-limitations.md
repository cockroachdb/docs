---
title: Known Limitations in CockroachDB v1.0
summary: Known limitations is CockroachDB v1.0.
toc: true
---

This page describes limitations we identified in the [CockroachDB v1.0](../releases/v1.0.html) release. For limitations that have been subsequently resolved, this page also calls out the release incuding the change.


## Removing all rows from large tables

{{site.data.alerts.callout_info}}Resolved as of v1.1. See <a href="https://github.com/cockroachdb/cockroach/pull/17016">#17016</a>.{{site.data.alerts.end}}

When removing all rows from a table via a [`TRUNCATE`](truncate.html) statement or a [`DELETE`](delete.html#delete-all-rows) statement without a `WHERE` clause, CockroachDB batches the entire operation as a single [transaction](transactions.html). For large tables, this can cause the nodes containing the table data to either crash or exhibit poor performance due to elevated memory and CPU usage.

As a workaround, when you need to remove all rows from a large table:

1. Use [`SHOW CREATE TABLE`](show-create-table.html) to get the table schema.
2. Use [`DROP TABLE`](drop-table.html) to remove the table.
3. Use [`CREATE TABLE`](create-table.html) with the output from step 1 to recreate the table.

## Schema changes within transactions

Within a single [transaction](transactions.html):

- DDL statements cannot be mixed with DML statements. As a workaround, you can split the statements into separate transactions.
- A [`CREATE TABLE`](create-table.html) statement containing [`FOREIGN KEY`](foreign-key.html) or [`INTERLEAVE`](interleave-in-parent.html) clauses cannot be followed by statements that reference the new table. This also applies to running [`TRUNCATE`](truncate.html) on such a table because `TRUNCATE` implicitly drops and recreates the table.
- A table cannot be dropped and then recreated with the same name. This is not possible within a single transaction because `DROP TABLE` does not immediately drop the name of the table. As a workaround, split the [`DROP TABLE`](drop-table.html) and [`CREATE TABLE`](create-table.html) statements into separate transactions.

## Schema changes between executions of prepared statements

When the schema of a table targeted by a prepared statement changes before the prepared statement is executed, CockroachDB allows the prepared statement to return results based on the changed table schema, for example:

~~~ sql
> CREATE TABLE users (id INT PRIMARY KEY);

> PREPARE prep1 AS SELECT * FROM users;

> ALTER TABLE users ADD COLUMN name STRING;

> INSERT INTO users VALUES (1, 'Max Roach');

> EXECUTE prep1;
~~~

~~~
+----+-----------+
| id |   name    |
+----+-----------+
|  1 | Max Roach |
+----+-----------+
(1 row)
~~~

It's therefore recommended to **not** use `SELECT *` for queries that will be repeated, via prepared statements or otherwise.

Also, a prepared [`INSERT`](insert.html), [`UPSERT`](upsert.html), or [`DELETE`](delete.html) statement acts inconsistently when the schema of the table being written to is changed before the prepared statement is executed:

- If the number of columns has increased, the prepared statement returns an error but nonetheless writes the data.
- If the number of columns remains the same but the types have changed, the prepared statement writes the data and does not return an error.

## Join flags when restoring a backup onto new machines

In our [deployment tutorials](manual-deployment.html), when starting the first node of a cluster, the `--join` flag should be empty, but when starting all subsequent nodes, the `--join` flag should be set to the address of node 1. This approach ensures that all nodes have access to a copy of the first key-value range, which is part of a meta-index identifying where all range replicas are stored, and which nodes require to initialize themselves and start accepting incoming connections.

Ensuring that all nodes have access to a copy of the first key-value range is more difficult when restoring from a whole-cluster backup onto machines with different IP addresses than the original cluster. In this case, the `--join` flags must form a fully-connected directed graph. The easiest way to do this is to put all of the new nodes' addresses into each node's `--join` flag, which ensures all nodes can join a node with a copy of the first key-value range.

## `INSERT ON CONFLICT` vs. `UPSERT`

When inserting/updating all columns of a table, and the table has no secondary indexes, we recommend using an [`UPSERT`](upsert.html) statement instead of the equivalent [`INSERT ON CONFLICT`](insert.html) statement. Whereas `INSERT ON CONFLICT` always performs a read to determine the necessary writes, the `UPSERT` statement writes without reading, making it faster.

This issue is particularly relevant when using a simple SQL table of two columns to [simulate direct KV access](frequently-asked-questions.html#can-i-use-cockroachdb-as-a-key-value-store). In this case, be sure to use the `UPSERT` statement.

## Repeated or combined commands in the SQL shell history

{{site.data.alerts.callout_info}}Resolved as of v2.0.{{site.data.alerts.end}}

Our [built-in SQL shell](use-the-built-in-sql-client.html) stores previously executed commands in the shell's history. In some cases, these commands are unexpectedly duplicated.

Also, in some terminals, such  as `st` or `xterm` without `tmux`, previously executed commands are combined into a single command in the SQL shell history.

## Using `\|` to perform a large input in the SQL shell

In the [built-in SQL shell](use-the-built-in-sql-client.html), using the [`\|`](use-the-built-in-sql-client.html#sql-shell-commands) operator to perform a large number of inputs from a file can cause the server to close the connection. This is because `\|` sends the entire file as a single query to the server, which can exceed the upper bound on the size of a packet the server can accept from any client (16MB).

As a workaround, [execute the file from the command line](use-the-built-in-sql-client.html#execute-sql-statements-from-a-file) with `cat data.sql | cockroach sql` instead of from within the interactive shell.

## New values generated by `DEFAULT` expressions during `ALTER TABLE ADD COLUMN`

When executing an [`ALTER TABLE ADD COLUMN`](add-column.html) statement with a [`DEFAULT`](default-value.html) expression, new values generated:

- use the default [search path](sql-name-resolution.html#search-path) regardless of the search path configured in the current session via `SET SEARCH_PATH`.
- use the UTC time zone regardless of the time zone configured in the current session via [`SET TIME ZONE`](set-vars.html).
- have no default database regardless of the default database configured in the current session via [`SET DATABASE`](set-vars.html), so you must specify the database of any tables they reference.
- use the transaction timestamp for the `statement_timestamp()` function regardless of the time at which the `ALTER` statement was issued.

## Load-based lease rebalancing in uneven latency deployments

When nodes are started with the [`--locality`](start-a-node.html#flags) flag, CockroachDB attempts to place the replica lease holder (the replica that client requests are forwarded to) on the node closest to the source of the request. This means as client requests move geographically, so too does the replica lease holder.

However, you might see increased latency caused by a consistently high rate of lease transfers between datacenters in the following case:

- Your cluster runs in datacenters which are very different distances away from each other.
- Each node was started with a single tier of `--locality`, e.g., `--locality=datacenter=a`.
- Most client requests get sent to a single datacenter because that's where all your application traffic is.

To detect if this is happening, open the [Admin UI](explore-the-admin-ui.html), select the **Queues** dashboard, hover over the **Replication Queue** graph, and check the **Leases Transferred / second** data point. If the value is consistently larger than 0, you should consider stopping and restarting each node with additional tiers of locality to improve request latency.

For example, let's say that latency is 10ms from nodes in datacenter A to nodes in datacenter B but is 100ms from nodes in datacenter A to nodes in datacenter C. To ensure A's and B's relative proximity is factored into lease holder rebalancing, you could restart the nodes in datacenter A and B with a common region, `--locality=region=foo,datacenter=a` and `--locality=region=foo,datacenter=b`, while restarting nodes in datacenter C with a different region, `--locality=region=bar,datacenter=c`.

## Roundtrip to `STRING` does not respect precedences of `:::` and `-`

{{site.data.alerts.callout_info}}Resolved as of v1.1. See <a href="https://github.com/cockroachdb/cockroach/issues/15617">#15617</a>.{{site.data.alerts.end}}

Queries with constant expressions that evaluate to 2**-63 might get incorrectly rejected, for example:

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

Many string operations are not properly overloaded for [collated strings](collate.html), for example:

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

## Quoting collation locales containing uppercase letters

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v1.0.html#v1-0-1">v1.0.1</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/15917">#15917</a>.{{site.data.alerts.end}}

Quoting a [collation](collate.html) locale containing uppercase letters results in an error, for example:

~~~ sql
> CREATE TABLE a (b STRING COLLATE "DE");
~~~

~~~
invalid syntax: statement ignored: invalid locale "DE": language: tag is not well-formed at or near ")"
CREATE TABLE a (b STRING COLLATE "DE");
                                     ^
~~~

As a workaround, make the locale lowercase or remove the quotes, for example:

~~~ sql
> CREATE TABLE a (b STRING COLLATE "de");

> CREATE TABLE b (c STRING COLLATE DE);
~~~

## Creating views with array types

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v1.0.html#v1-0-1">v1.0.1</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/15913">#15913</a>.{{site.data.alerts.end}}

Because arrays are not supported, attempting to [create a view](create-view.html) with an array in the `SELECT` query crashes the node that receives the request.

## Dropping a database containing views

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v1.0.html#v1-0-1">v1.0.1</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/15983">#15983</a>.{{site.data.alerts.end}}

When a [view](views.html) queries multiple tables or a single table multiple times (e.g., via [`UNION`](select.html#combine-multiple-selects-union-intersect-except)), dropping the
database containing the tables fails silently.

## Qualifying a column that comes from a view

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v1.0.html#v1-0-1">v1.0.1</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/15984">#15984</a>.{{site.data.alerts.end}}

It is not possible to fully qualify a column that comes from a view because the view gets replaced by an anonymous subquery, for example:

~~~ sql
> CREATE TABLE test (a INT, b INT);

> CREATE VIEW Caps AS SELECT a, b FROM test;

> SELECT sum(Caps.a) FROM Caps GROUP BY b;
~~~

~~~
pq: source name "caps" not found in FROM clause
~~~

## Write and update limits for a single transaction

A single transaction can contain at most 100,000 write operations (e.g., changes to individual columns) and at most 64MiB of combined updates. When a transaction exceeds these limits, it gets aborted. `INSERT INTO .... SELECT FROM ...` queries commonly encounter these limits.

If you need to increase these limits, you can update the [cluster-wide settings](cluster-settings.html) `kv.transaction.max_intents` and `kv.raft.command.max_size`. For `INSERT INTO .. SELECT FROM` queries in particular, another workaround is to manually page through the data you want to insert using separate transactions.

## Max size of a single column family

When creating or updating a row, if the combined size of all values in a single [column family](column-families.html) exceeds the max range size (64MiB by default) for the table, the operation may fail, or cluster performance may suffer.

As a workaround, you can either [manually split a table's columns into multiple column families](column-families.html#manual-override), or you can [create a table-specific zone configuration](configure-replication-zones.html#create-a-replication-zone-for-a-table) with an increased max range size.

## Simultaneous client connections and running queries on a single node

When a node has both a high number of client connections and running queries, the node may crash due to memory exhaustion. This is due to CockroachDB not accurately limiting the number of clients and queries based on the amount of available RAM on the node.

To prevent memory exhaustion, monitor each node's memory usage and ensure there is some margin between maximum CockroachDB memory usage and available system RAM. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

## SQL subexpressions and memory usage

Many SQL subexpressions (e.g., `ORDER BY`, `UNION`/`INTERSECT`/`EXCEPT`, `GROUP BY`, subqueries) accumulate intermediate results in RAM on the node processing the query. If the operator attempts to process more rows than can fit into RAM, the node will either crash or report a memory capacity error. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

## Counting distinct rows in a table

{{site.data.alerts.callout_info}}Resolved as of v1.1. See <a href="https://github.com/cockroachdb/cockroach/pull/17833">#17833</a>.{{site.data.alerts.end}}

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

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v1.0.html#v1-0-1">v1.0.1</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/15916">#15916</a>.{{site.data.alerts.end}}

By default, CockroachDB periodically rotates the file it writes logs to, as well as a symlink pointing to the file it's currently using. However, on Windows, non-admin users cannot create symlinks, which prevents CockroachDB from starting because it cannot create logs.

To resolve this issue, non-admin users must log to `stdout` (instead of files) by passing `--log-dir=` (with the empty value) to the `cockroach start` command, for example:

~~~ shell
$ cockroach.exe start --log-dir= --insecure
~~~

## Query planning for `OR` expressions

Given a query like `SELECT * FROM foo WHERE a > 1 OR b > 2`, even if there are appropriate indexes to satisfy both `a > 1` and `b > 2`, the query planner performs a full table or index scan because it cannot use both conditions at once.

## Privileges for `DELETE` and `UPDATE`

Every [`DELETE`](delete.html) or [`UPDATE`](update.html) statement constructs a `SELECT` statement, even when no `WHERE` clause is involved. As a result, the user executing `DELETE` or `UPDATE` requires both the `DELETE` and `SELECT` or `UPDATE` and `SELECT` [privileges](privileges.html) on the table.

## Dropping an index interleaved into another index on the same table

{{site.data.alerts.callout_info}}Resolved as of [v1.1-alpha.20170831](../releases/v1.1-alpha.20170831.html). See <a href="https://github.com/cockroachdb/cockroach/pull/17860">#17860</a>.{{site.data.alerts.end}}

In the unlikely case that you [interleave](interleave-in-parent.html) an index into another index on the same table and then [drop](drop-index.html) the interleaved index, future DDL operations on the table will fail.

For example:

~~~ sql
> CREATE TABLE t1 (id1 INT PRIMARY KEY, id2 INT, id3 INT);
~~~

~~~ sql
> CREATE INDEX c ON t1 (id2)
      STORING (id1, id3)
      INTERLEAVE IN PARENT t1 (id2);
~~~

~~~ sql
> SHOW INDEXES FROM t1;
~~~

~~~
+-------+---------+--------+-----+--------+-----------+---------+----------+
| Table |  Name   | Unique | Seq | Column | Direction | Storing | Implicit |
+-------+---------+--------+-----+--------+-----------+---------+----------+
| t1    | primary | true   |   1 | id1    | ASC       | false   | false    |
| t1    | c       | false  |   1 | id2    | ASC       | false   | false    |
| t1    | c       | false  |   2 | id1    | N/A       | true    | false    |
| t1    | c       | false  |   3 | id3    | N/A       | true    | false    |
+-------+---------+--------+-----+--------+-----------+---------+----------+
(4 rows)
~~~

~~~ sql
> DROP INDEX t1@c;
~~~

~~~ sql
> DROP TABLE t1;
~~~

~~~
pq: invalid interleave backreference table=t1 index=3: index-id "3" does not exist
~~~

~~~ sql
> TRUNCATE TABLE t1;
~~~

~~~
pq: invalid interleave backreference table=t1 index=3: index-id "3" does not exist
~~~

~~~ sql
> ALTER TABLE t1 RENAME COLUMN id3 TO id4;
~~~

~~~
pq: invalid interleave backreference table=t1 index=3: index-id "3" does not exist
~~~

## Order of dumped schemas and incorrect schemas of dumped views

{{site.data.alerts.callout_info}}Resolved as of v1.1. See <a href="https://github.com/cockroachdb/cockroach/pull/17581">#17581</a>.{{site.data.alerts.end}}

When using the [`cockroach dump`](sql-dump.html) command to export the schemas of all tables and views in a database, the schemas are ordered alphabetically by name. This is not always an ordering in which the tables and views can be successfully recreated. Also, the schemas of views are dumped incorrectly as `CREATE TABLE` statements.

For example, consider a database `test` with 2 tables and 1 view. Table `a` has a foreign key reference to table `c`, and view `b` references table `c`:

~~~ sql
> CREATE DATABASE test;

> CREATE TABLE test.c (a INT PRIMARY KEY, b STRING);

> CREATE TABLE test.a (a INT PRIMARY KEY, b INT NOT NULL REFERENCES test.c (a))

> CREATE VIEW test.b AS SELECT b FROM test.c;
~~~

When you dump the schemas of the tables and views in database `test`, they are ordered alphabetically by name, and the schema for view `b` is incorrectly listed as a `CREATE TABLE` statement:

~~~ shell
$ cockroach dump --insecure --dump-mode=schema > dump.txt
~~~

~~~ shell
$ cat dump.txt
~~~

~~~
CREATE TABLE a (
	a INT NOT NULL,
	b INT NOT NULL,
	CONSTRAINT "primary" PRIMARY KEY (a ASC),
	CONSTRAINT fk_b_ref_c FOREIGN KEY (b) REFERENCES c (a),
	FAMILY "primary" (a, b)
);

CREATE TABLE b (
	b STRING NOT NULL
);

CREATE TABLE c (
	a INT NOT NULL,
	b STRING NULL,
	CONSTRAINT "primary" PRIMARY KEY (a ASC),
	FAMILY "primary" (a, b)
);
~~~

If you tried to import these incorrectly ordered schemas to restore the `test` database or create a new database, the import would fail.

As a workaround, before using exported schemas to recreate tables and views, you must reorder the schemas so that tables with foreign keys and views are listed after the tables they reference, and you must fix `CREATE` statements for views:

~~~
CREATE TABLE c (
	a INT NOT NULL,
	b STRING NULL,
	CONSTRAINT "primary" PRIMARY KEY (a ASC),
	FAMILY "primary" (a, b)
);

CREATE TABLE a (
	a INT NOT NULL,
	b INT NOT NULL,
	CONSTRAINT "primary" PRIMARY KEY (a ASC),
	CONSTRAINT fk_b_ref_c FOREIGN KEY (b) REFERENCES c (a),
	FAMILY "primary" (a, b)
);

CREATE VIEW b AS SELECT b FROM c;
~~~

## Dumping data for a view

{{site.data.alerts.callout_info}}Resolved as of v1.1. See <a href="https://github.com/cockroachdb/cockroach/pull/17581">#17581</a>.{{site.data.alerts.end}}

When using the [`cockroach dump`](sql-dump.html) command to export the data of a [view](views.html), the dump fails. This is because, unlike standard tables, a view does not contain any physical data; instead, it is a stored `SELECT` query that, when requested, dynamically forms a virtual table.

For example, consider a database `test` with a standard table `t1` and a view `v1` that references `t1`:

~~~ sql
> CREATE DATABASE test;

> CREATE TABLE test.t1 (a INT PRIMARY KEY, b STRING);

> INSERT INTO test.t1 VALUES (1, 'a'), (2, 'b');

> CREATE VIEW test.v1 AS SELECT b FROM test.t1;
~~~

Trying to dump the data of the view results in an error:

~~~ shell
$ cockroach dump test v1 --insecure --dump-mode=data
~~~

~~~
Error: pq: column name "rowid" not found
Failed running "dump"
~~~

This error occurs when trying to dump all the data in database `test` as well:

~~~ shell
$ cockroach dump test --insecure --dump-mode=data
~~~

~~~
INSERT INTO t1 (a, b) VALUES
	(1, 'a'),
	(2, 'b');
Error: pq: column name "rowid" not found
Failed running "dump"
~~~

As a workound, when dumping all the data in a database, explicitly list the tables that should be dumped, excluding any views:

~~~ shell
$ cockroach dump test t1 --insecure --dump-mode=data
~~~

~~~
INSERT INTO t1 (a, b) VALUES
	(1, 'a'),
	(2, 'b');
~~~
