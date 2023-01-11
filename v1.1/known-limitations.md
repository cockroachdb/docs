---
title: Known Limitations in CockroachDB v1.1
summary: Learn about newly identified limitations in CockroachDB as well as unresolved limitations identified in earlier releases.
toc: true
---

This page describes newly identified limitations in the CockroachDB v1.1 release as well as unresolved limitations identified in earlier releases.


## New Limitations

### Enterprise restores after creating, dropping, or truncating tables

{{site.data.alerts.callout_info}}As of <a href="../releases/v1.1.html#v1-1-1">v1.1.1</a>, it is no longer possible to create an incremental backup if a table has been created, dropped, or truncated after the full backup. This prevents attempts to restore from a broken backup. See <a href="https://github.com/cockroachdb/cockroach/pull/19286">#19286</a>.{{site.data.alerts.end}}

It is not possible to perform an [enterprise `RESTORE`](restore.html) from a full [`BACKUP`](backup.html) with incremental backups if you [created](create-table.html), [dropped](drop-table.html), or [truncated](truncate.html) any tables after the full backup. Attempting to restore in this case will fail with an error.

As a workaround, any time you create, drop, or truncate a table, perform another full `BACKUP` of your cluster.

### Maximum cluster size

{{site.data.alerts.callout_info}}
Resolved as of <a href="../releases/v2.0.html#v1-2-alpha-20171026">v1.2-alpha.20171026</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/18970">#17016</a>.
{{site.data.alerts.end}}

The locations of all ranges in a cluster are stored in a two-level index at the beginning of the key-space, known as [meta ranges](architecture/distribution-layer.html#meta-ranges), where the first level (`meta1`) addresses the second, and the second level (`meta2`) addresses data in the cluster. A limitation in v1.1 prevents `meta2` from being split; thus, the max size of a single range, 64MiB by default, limits the overall size of a cluster to 64TB. Clusters beyond this size will experience problems.

### Available capacity metric in the Admin UI

{% include v1.1/misc/available-capacity-metric.md %}

### Downgrading to v1.1.0 from a later v1.1.x patch release

If you have started or [upgraded](upgrade-cockroach-version.html#finalize-the-upgrade) a cluster using v1.1.1 or a later release, then you will not be able to downgrade the cluster to the v1.1.0 binary. This is due to an issue with the `version` setting in the v1.1.0 release that was fixed in v1.1.1. Changing between different `x.y.z` versions of the same `x.y` release is typically safe.

## Unresolved Limitations

### Schema changes within transactions

Within a single [transaction](transactions.html):

- DDL statements cannot be mixed with DML statements. As a workaround, you can split the statements into separate transactions.
- A [`CREATE TABLE`](create-table.html) statement containing [`FOREIGN KEY`](foreign-key.html) or [`INTERLEAVE`](interleave-in-parent.html) clauses cannot be followed by statements that reference the new table. This also applies to running [`TRUNCATE`](truncate.html) on such a table because `TRUNCATE` implicitly drops and recreates the table.
- A table cannot be dropped and then recreated with the same name. This is not possible within a single transaction because `DROP TABLE` does not immediately drop the name of the table. As a workaround, split the [`DROP TABLE`](drop-table.html) and [`CREATE TABLE`](create-table.html) statements into separate transactions.

### Schema changes between executions of prepared statements

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

It's therefore recommended to **not** use `SELECT *` in queries that will be repeated, via prepared statements or otherwise.

Also, a prepared [`INSERT`](insert.html), [`UPSERT`](upsert.html), or [`DELETE`](delete.html) statement acts inconsistently when the schema of the table being written to is changed before the prepared statement is executed:

- If the number of columns has increased, the prepared statement returns an error but nonetheless writes the data.
- If the number of columns remains the same but the types have changed, the prepared statement writes the data and does not return an error.

## Join flags when restarting a cluster with different addresses

In all our deployment tutorials, we provide the addresses of the first few nodes in the cluster to the `--join` flag when starting each node. In a new cluster, this ensures that all nodes are able to learn the location of the first key-value range, which is part of a meta-index identifying where all range replicas are stored, and which nodes require to initialize themselves and start accepting incoming connections. Each node also persists the addresses of all other nodes in the cluster on disk such that it can reconnect to them if the nodes in the `--join` flag ever happen to be unavailable when restarting. This ensures that a restarting node will always be able to connect to a node with a copy of the first range even if they're no longer located on the nodes in the `--join` flag.

However, if the nodes in a cluster are restarted with different addresses for some reason, then it's not guaranteed that a copy of the first range will be on the nodes in the join flags. In such cases, the `--join` flags must form a fully-connected directed graph. The easiest way to do this is to put all of the new nodes' addresses into each node's `--join` flag, which ensures all nodes can join a node with a copy of the first key-value range.

### `INSERT ON CONFLICT` vs. `UPSERT`

When inserting/updating all columns of a table, and the table has no secondary indexes, we recommend using an [`UPSERT`](upsert.html) statement instead of the equivalent [`INSERT ON CONFLICT`](insert.html) statement. Whereas `INSERT ON CONFLICT` always performs a read to determine the necessary writes, the `UPSERT` statement writes without reading, making it faster.

This issue is particularly relevant when using a simple SQL table of two columns to [simulate direct KV access](frequently-asked-questions.html#can-i-use-cockroachdb-as-a-key-value-store). In this case, be sure to use the `UPSERT` statement.

### Repeated or combined commands in the SQL shell history

{{site.data.alerts.callout_info}}Resolved as of v2.0.{{site.data.alerts.end}}

Our [built-in SQL shell](use-the-built-in-sql-client.html) stores previously executed commands in the shell's history. In some cases, these commands are unexpectedly duplicated.

Also, in some terminals, such  as `st` or `xterm` without `tmux`, previously executed commands are combined into a single command in the SQL shell history.

### Using `\|` to perform a large input in the SQL shell

In the [built-in SQL shell](use-the-built-in-sql-client.html), using the [`\|`](use-the-built-in-sql-client.html#sql-shell-commands) operator to perform a large number of inputs from a file can cause the server to close the connection. This is because `\|` sends the entire file as a single query to the server, which can exceed the upper bound on the size of a packet the server can accept from any client (16MB).

As a workaround, [execute the file from the command line](use-the-built-in-sql-client.html#execute-sql-statements-from-a-file) with `cat data.sql | cockroach sql` instead of from within the interactive shell.

### New values generated by `DEFAULT` expressions during `ALTER TABLE ADD COLUMN`

When executing an [`ALTER TABLE ADD COLUMN`](add-column.html) statement with a [`DEFAULT`](default-value.html) expression, new values generated:

- use the default [search path](sql-name-resolution.html#search-path) regardless of the search path configured in the current session via `SET SEARCH_PATH`.
- use the UTC time zone regardless of the time zone configured in the current session via [`SET TIME ZONE`](set-vars.html).
- have no default database regardless of the default database configured in the current session via [`SET DATABASE`](set-vars.html), so you must specify the database of any tables they reference.
- use the transaction timestamp for the `statement_timestamp()` function regardless of the time at which the `ALTER` statement was issued.

### Load-based lease rebalancing in uneven latency deployments

When nodes are started with the [`--locality`](start-a-node.html#flags-changed-in-v1-1) flag, CockroachDB attempts to place the replica lease holder (the replica that client requests are forwarded to) on the node closest to the source of the request. This means as client requests move geographically, so too does the replica lease holder.

However, you might see increased latency caused by a consistently high rate of lease transfers between datacenters in the following case:

- Your cluster runs in datacenters which are very different distances away from each other.
- Each node was started with a single tier of `--locality`, e.g., `--locality=datacenter=a`.
- Most client requests get sent to a single datacenter because that's where all your application traffic is.

To detect if this is happening, open the [Admin UI](admin-ui-access-and-navigate.html), select the **Queues** dashboard, hover over the **Replication Queue** graph, and check the **Leases Transferred / second** data point. If the value is consistently larger than 0, you should consider stopping and restarting each node with additional tiers of locality to improve request latency.

For example, let's say that latency is 10ms from nodes in datacenter A to nodes in datacenter B but is 100ms from nodes in datacenter A to nodes in datacenter C. To ensure A's and B's relative proximity is factored into lease holder rebalancing, you could restart the nodes in datacenter A and B with a common region, `--locality=region=foo,datacenter=a` and `--locality=region=foo,datacenter=b`, while restarting nodes in datacenter C with a different region, `--locality=region=bar,datacenter=c`.

### Overload resolution for collated strings

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

### Write and update limits for a single transaction

A single transaction can contain at most 100,000 write operations (e.g.,
deletions or changes to individual columns) and at most 64MiB of combined
updates. When a transaction exceeds these limits, it gets aborted. `INSERT INTO
.... SELECT FROM ...` and `DELETE FROM ... WHERE <non-selective filter>`
queries commonly encounter these limits.

If you need to increase these limits, you can update the [cluster-wide settings](cluster-settings.html) `kv.transaction.max_intents` and `kv.raft.command.max_size`. For `INSERT INTO .. SELECT FROM` queries in particular, another workaround is to manually page through the data you want to insert using separate transactions.

### Max size of a single column family

When creating or updating a row, if the combined size of all values in a single [column family](column-families.html) exceeds the max range size (64MiB by default) for the table, the operation may fail, or cluster performance may suffer.

As a workaround, you can either [manually split a table's columns into multiple column families](column-families.html#manual-override), or you can [create a table-specific zone configuration](configure-replication-zones.html#create-a-replication-zone-for-a-table) with an increased max range size.

### Simultaneous client connections and running queries on a single node

When a node has both a high number of client connections and running queries, the node may crash due to memory exhaustion. This is due to CockroachDB not accurately limiting the number of clients and queries based on the amount of available RAM on the node.

To prevent memory exhaustion, monitor each node's memory usage and ensure there is some margin between maximum CockroachDB memory usage and available system RAM. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

### SQL subexpressions and memory usage

Many SQL subexpressions (e.g., `ORDER BY`, `UNION`/`INTERSECT`/`EXCEPT`, `GROUP BY`, subqueries) accumulate intermediate results in RAM on the node processing the query. If the operator attempts to process more rows than can fit into RAM, the node will either crash or report a memory capacity error. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

### Query planning for `OR` expressions

Given a query like `SELECT * FROM foo WHERE a > 1 OR b > 2`, even if there are appropriate indexes to satisfy both `a > 1` and `b > 2`, the query planner performs a full table or index scan because it cannot use both conditions at once.

### Privileges for `DELETE` and `UPDATE`

Every [`DELETE`](delete.html) or [`UPDATE`](update.html) statement constructs a `SELECT` statement, even when no `WHERE` clause is involved. As a result, the user executing `DELETE` or `UPDATE` requires both the `DELETE` and `SELECT` or `UPDATE` and `SELECT` [privileges](privileges.html) on the table.

### `cockroach dump` does not support cyclic foreign key references

{% include {{ page.version.version }}/known-limitations/dump-cyclic-foreign-keys.md %}
