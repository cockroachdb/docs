---
title: Known Limitations in CockroachDB v20.1
summary: Known limitations in CockroachDB v20.1.
toc: true
---

This page describes newly identified limitations in the CockroachDB {{page.release_info.version}} release as well as unresolved limitations identified in earlier releases.

## Unresolved limitations

### Adding stores to a node

{% include {{ page.version.version }}/known-limitations/adding-stores-to-node.md %}

### `CHECK` constraint validation for `INSERT ON CONFLICT` differs from PostgreSQL

CockroachDB validates [`CHECK`](check.html) constraints on the results of [`INSERT ON CONFLICT`](insert.html#on-conflict-clause) statements, preventing new or changed rows from violating the constraint. Unlike PostgreSQL, CockroachDB does not also validate `CHECK` constraints on the input rows of `INSERT ON CONFLICT` statements.

If this difference matters to your client, you can `INSERT ON CONFLICT` from a `SELECT` statement and check the inserted value as part of the `SELECT`. For example, instead of defining `CHECK (x > 0)` on `t.x` and using `INSERT INTO t(x) VALUES (3) ON CONFLICT (x) DO UPDATE SET x = excluded.x`, you could do the following:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t (x)
    SELECT if (x <= 0, crdb_internal.force_error('23514', 'check constraint violated'), x)
      FROM (values (3)) AS v(x)
    ON CONFLICT (x)
      DO UPDATE SET x = excluded.x;
~~~

An `x` value less than `1` would result in the following error:

~~~
pq: check constraint violated
~~~

[Tracking Github Issue](https://github.com/cockroachdb/cockroach/issues/35370)

### Cold starts of large clusters may require manual intervention

If a cluster contains a large amount of data (>500GiB / node), and all nodes are stopped and then started at the same time, clusters can enter a state where they're unable to startup without manual intervention. In this state, logs fill up rapidly with messages like `refusing gossip from node x; forwarding to node y`, and data and metrics may become inaccessible.

To exit this state, you should:

1. Stop all nodes.
2. Set the following environment variables: `COCKROACH_SCAN_INTERVAL=60m`, and `COCKROACH_SCAN_MIN_IDLE_TIME=1s`.
3. Restart the cluster.

Once restarted, monitor the Replica Quiescence graph on the [**Replication Dashboard**](admin-ui-replication-dashboard.html). When >90% of the replicas have become quiescent, conduct a rolling restart and remove the environment variables. Make sure that under-replicated ranges do not increase between restarts.

Once in a stable state, the risk of this issue recurring can be mitigated by increasing your [`range_max_bytes`](configure-zone.html#variables) to 134217728 (128MiB). We always recommend testing changes to `range_max_bytes` in a development environment before making changes on production.

[Tracking Github Issue](https://github.com/cockroachdb/cockroach/issues/39117)

### Requests to restarted node in need of snapshots may hang

When a node is offline, the [Raft logs](architecture/replication-layer.html#raft-logs) for the ranges on the node get truncated. When the node comes back online, it therefore often needs [Raft snapshots](architecture/replication-layer.html#snapshots) to get many of its ranges back up-to-date. While in this state, requests to a range will hang until its snapshot has been applied, which can take a long time.  

To work around this limitation, you can adjust the `kv.snapshot_recovery.max_rate` [cluster setting](cluster-settings.html) to temporarily relax the throughput rate limiting applied to snapshots. For example, changing the rate limiting from the default 8 MB/s, at which 1 GB of snapshots takes at least 2 minutes, to 64 MB/s can result in an 8x speedup in snapshot transfers and, therefore, a much shorter interruption of requests to an impacted node:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.snapshot_recovery.max_rate = '64mb';
~~~

Before increasing this value, however, verify that you will not end up saturating your network interfaces, and once the problem has resolved, be sure to reset to the original value.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/37906)

### Location-based time zone names on Windows

Certain features of CockroachDB require time zone data, for example, to support using location-based names as time zone identifiers. On most distributions, it is therefore required to [install and keep up-to-date the `tzdata` library](recommended-production-settings.html#dependencies). However, on Windows, even with this library installed, location-based time zone names may not resolve.

To work around this limitation, install the Go toolchain on the Windows machines running CockroachDB nodes. In this case, the CockroachDB nodes will use the timezone data from that toolchain.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/32415)

### Database and table renames are not transactional

Database and table renames using [`RENAME DATABASE`](rename-database.html) and [`RENAME TABLE`](rename-table.html) are not transactional.

Specifically, when run inside a [`BEGIN`](begin-transaction.html) ... [`COMMIT`](commit-transaction.html) block, it’s possible for a rename to be half-done - not persisted in storage, but visible to other nodes or other transactions. For more information, see [Table renaming considerations](rename-table.html#table-renaming-considerations). For an issue tracking this limitation, see [cockroach#12123](https://github.com/cockroachdb/cockroach/issues/12123).

### Change data capture

Change data capture (CDC) provides efficient, distributed, row-level change feeds into Apache Kafka for downstream processing such as reporting, caching, or full-text indexing.

{% include {{ page.version.version }}/known-limitations/cdc.md %}

### Admin UI may become inaccessible for secure clusters

Accessing the Admin UI for a secure cluster now requires login information (i.e., username and password). This login information is stored in a system table that is replicated like other data in the cluster. If a majority of the nodes with the replicas of the system table data go down, users will be locked out of the Admin UI.

### `AS OF SYSTEM TIME` in `SELECT` statements

`AS OF SYSTEM TIME` can only be used in a top-level `SELECT` statement. That is, we do not support statements like `INSERT INTO t SELECT * FROM t2 AS OF SYSTEM TIME <time>` or two subselects in the same statement with differing `AS OF SYSTEM TIME` arguments.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30534)

### Large index keys can impair performance

The use of tables with very large primary or secondary index keys (>32KB) can result in excessive memory usage. Specifically, if the primary or secondary index key is larger than 32KB the default indexing scheme for RocksDB SSTables breaks down and causes the index to be excessively large. The index is pinned in memory by default for performance.

To work around this issue, we recommend limiting the size of primary and secondary keys to 4KB, which you must account for manually. Note that most columns are 8B (exceptions being `STRING` and `JSON`), which still allows for very complex key structures.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30515)

### Admin UI: Statements page latency reports

The Statements page does not correctly report "mean latency" or "latency by phase" for statements that result in schema changes or other background jobs.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30381)

### Using `LIKE...ESCAPE` in `WHERE` and `HAVING` constraints

CockroachDB tries to optimize most comparisons operators in `WHERE` and `HAVING` clauses into constraints on SQL indexes by only accessing selected rows. This is done for `LIKE` clauses when a common prefix for all selected rows can be determined in the search pattern (e.g., `... LIKE 'Joe%'`). However, this optimization is not yet available if the `ESCAPE` keyword is also used.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30192)

### Using SQLAlchemy with CockroachDB

Users of the SQLAlchemy adapter provided by Cockroach Labs must [upgrade the adapter to the latest release](https://github.com/cockroachdb/cockroachdb-python) before upgrading to CockroachDB {{ page.version.version }}.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/28772)

### Admin UI: CPU percentage calculation

For multi-core systems, the user CPU percent can be greater than 100%. Full utilization of one core is considered as 100% CPU usage. If you have _n_ cores, then the user CPU percent can range from 0% (indicating an idle system) to (_n_*100)% (indicating full utilization).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/28724)

### `GROUP BY` referring to `SELECT` aliases

Applications developed for PostgreSQL that use `GROUP BY` to refer to column aliases _produced_ in the same `SELECT` clause must be changed to use the full underlying expression instead. For example, `SELECT x+y AS z ... GROUP BY z` must be changed to `SELECT x+y AS z ... GROUP BY x+y`. Otherwise, CockroachDB will produce either a planning error or, in some cases, invalid results.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/28059)

### `TRUNCATE` does not behave like `DELETE`

`TRUNCATE` is not a DML statement, but instead works as a DDL statement. Its limitations are the same as other DDL statements, which are outlined in [Online Schema Changes: Limitations](online-schema-changes.html#limitations)

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/27953)

### Using columns in `SELECT` not listed in `GROUP BY`

Applications developed for PostgreSQL can exploit the fact that PostgreSQL allows a `SELECT` clause to name a column that is not also listed in `GROUP BY` in some cases, for example `SELECT a GROUP BY b`. This is not yet supported by CockroachDB.

To work around this limitation, and depending on expected results, the rendered columns should be either added at the end of the `GROUP BY` list (e.g., `SELECT a GROUP BY b, a`), or `DISTINCT` should also be used (e.g., `SELECT DISTINCT a GROUP BY b`).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/26709)

### Cannot `DELETE` multiple rows with self-referencing FKs

Because CockroachDB checks foreign keys eagerly (i.e., per row), it cannot trivially delete multiple rows from a table with a self-referencing foreign key.

To successfully delete multiple rows with self-referencing foreign keys, you need to ensure they're deleted in an order that doesn't violate the foreign key constraint.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/25809)

### `DISTINCT` operations cannot operate over JSON values

CockroachDB does not currently key-encode JSON values, which prevents `DISTINCT` filters from working on them.

As a workaround, you can return the JSON field's values to a `string` using the `->>` operator, e.g., `SELECT DISTINCT col->>'field'...`.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/24436)

### Current sequence value not checked when updating min/max value

Altering the minimum or maximum value of a series does not check the current value of a series. This means that it is possible to silently set the maximum to a value less than, or a minimum value greater than, the current value.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/23719)

### Using common table expressions in `VALUES` and `UNION` clauses

When the [cost-based optimizer](cost-based-optimizer.html) is disabled, or when it does not support a query, a common table expression defined outside of a `VALUES` or `UNION `clause will not be available inside it. For example `...WITH a AS (...) SELECT ... FROM (VALUES(SELECT * FROM a))`.

This limitation will be lifted when the cost-based optimizer covers all queries. Until then, applications can work around this limitation by including the entire CTE query in the place where it is used.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/22418)

### Using `default_int_size` session variable in batch of statements

When setting the `default_int_size` [session variable](set-vars.html) in a batch of statements such as `SET default_int_size='int4'; SELECT 1::IN`, the `default_int_size` variable will not take affect until the next statement. This happens because statement parsing takes place asynchronously from statement execution.

As a workaround, set `default_int_size` via your database driver, or ensure that `SET default_int_size` is in its own statement.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/32846)

### Cannot decommission nodes

The [`cockroach node decommission`](https://www.cockroachlabs.com/docs/stable/cockroach-node.html#subcommands) command will hang when used to target a set of nodes that cannot be removed without breaking the configured replication rules.

Example: decommissioning a node in a three node cluster will not work because ranges would become under-replicated.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/18029)

### Importing data using the PostgreSQL COPY protocol

Currently, the built-in SQL shell provided with CockroachDB (`cockroach sql` / `cockroach demo`) does not support importing data using the `COPY` statement. Users can use the `psql` client command provided with PostgreSQL to load this data into CockroachDB instead. For details, see [Import from generic SQL dump](https://www.cockroachlabs.com/docs/stable/import-data.html#import-from-generic-sql-dump).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/16392)

### Dumping a table with no user-visible columns

{% include {{page.version.version}}/known-limitations/dump-table-with-no-columns.md %}

### Silent validation error with `DECIMAL` values

Under the following conditions, the value received by CockroachDB will be different than that sent by the client and may cause incorrect data to be inserted or read from the database, without a visible error message:

1. A query uses placeholders (e.g., `$1`) to pass values to the server.
2. A value of type [`DECIMAL`](decimal.html) is passed.
3. The decimal value is encoded using the binary format.

Most client drivers and frameworks use the text format to pass placeholder values and are thus unaffected by this limitation. However, we know that the [Ecto framework](https://github.com/elixir-ecto/ecto) for Elixir is affected, and others may be as well. If in doubt, use [SQL statement logging](query-behavior-troubleshooting.html#cluster-wide-execution-logs) to control how CockroachDB receives decimal values from your client.

### Import with a high amount of disk contention

{% include {{ page.version.version }}/known-limitations/import-high-disk-contention.md %}

### Assigning latitude/longitude for the Node Map

{% include {{ page.version.version }}/known-limitations/node-map.md %}

### Placeholders in `PARTITION BY`

{% include {{ page.version.version }}/known-limitations/partitioning-with-placeholders.md %}

### Adding a column with certain `DEFAULT` values

It is currently not possible to [add a column](add-column.html) to a table when the column uses a [sequence](create-sequence.html), [computed column](computed-columns.html), or certain evaluated expressions as the [`DEFAULT`](default-value.html) value, for example:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE add_default ADD g INT DEFAULT nextval('initial_seq')
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE add_default ADD g OID DEFAULT 'foo'::regclass::oid
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE add_default ADD g INT DEFAULT 'foo'::regtype::INT
~~~

### Available capacity metric in the Admin UI

{% include {{ page.version.version }}/misc/available-capacity-metric.md %}

### Schema changes within transactions

{% include {{ page.version.version }}/known-limitations/schema-changes-within-transactions.md %}

### Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed

{% include {{ page.version.version }}/known-limitations/schema-change-ddl-inside-multi-statement-transactions.md %}

### Schema changes between executions of prepared statements

{% include {{ page.version.version }}/known-limitations/schema-changes-between-prepared-statements.md %}

### `INSERT ON CONFLICT` vs. `UPSERT`

When inserting/updating all columns of a table, and the table has no secondary indexes, we recommend using an [`UPSERT`](upsert.html) statement instead of the equivalent [`INSERT ON CONFLICT`](insert.html) statement. Whereas `INSERT ON CONFLICT` always performs a read to determine the necessary writes, the `UPSERT` statement writes without reading, making it faster.

This issue is particularly relevant when using a simple SQL table of two columns to [simulate direct KV access](sql-faqs.html#can-i-use-cockroachdb-as-a-key-value-store). In this case, be sure to use the `UPSERT` statement.

### Write and update limits for a single statement

A single statement can perform at most 64MiB of combined updates. When a statement exceeds these limits, its transaction gets aborted. Currently, `INSERT INTO ... SELECT FROM` and `CREATE TABLE AS SELECT` queries may encounter these limits.

To increase these limits, you can update the [cluster-wide setting](cluster-settings.html) `kv.raft.command.max_size`, but note that increasing this setting can affect the memory utilization of nodes in the cluster. For `INSERT INTO .. SELECT FROM` queries in particular, another workaround is to manually page through the data you want to insert using separate transactions.

In the v1.1 release, the limit referred to a whole transaction (i.e., the sum of changes done by all statements) and capped both the number and the size of update. In this release, there's only a size limit, and it applies independently to each statement. Note that even though not directly restricted any more, large transactions can have performance implications on the cluster.

### Using `\|` to perform a large input in the SQL shell

In the [built-in SQL shell](cockroach-sql.html), using the [`\|`](cockroach-sql.html#commands) operator to perform a large number of inputs from a file can cause the server to close the connection. This is because `\|` sends the entire file as a single query to the server, which can exceed the upper bound on the size of a packet the server can accept from any client (16MB).

As a workaround, [execute the file from the command line](cockroach-sql.html#execute-sql-statements-from-a-file) with `cat data.sql | cockroach sql` instead of from within the interactive shell.

### New values generated by `DEFAULT` expressions during `ALTER TABLE ADD COLUMN`

When executing an [`ALTER TABLE ADD COLUMN`](add-column.html) statement with a [`DEFAULT`](default-value.html) expression, new values generated:

- use the default [search path](sql-name-resolution.html#search-path) regardless of the search path configured in the current session via `SET SEARCH_PATH`.
- use the UTC time zone regardless of the time zone configured in the current session via [`SET TIME ZONE`](set-vars.html).
- have no default database regardless of the default database configured in the current session via [`SET DATABASE`](set-vars.html), so you must specify the database of any tables they reference.
- use the transaction timestamp for the `statement_timestamp()` function regardless of the time at which the `ALTER` statement was issued.

### Load-based lease rebalancing in uneven latency deployments

When nodes are started with the [`--locality`](cockroach-start.html#flags) flag, CockroachDB attempts to place the replica lease holder (the replica that client requests are forwarded to) on the node closest to the source of the request. This means as client requests move geographically, so too does the replica lease holder.

However, you might see increased latency caused by a consistently high rate of lease transfers between datacenters in the following case:

- Your cluster runs in datacenters which are very different distances away from each other.
- Each node was started with a single tier of `--locality`, e.g., `--locality=datacenter=a`.
- Most client requests get sent to a single datacenter because that's where all your application traffic is.

To detect if this is happening, open the [Admin UI](admin-ui-access-and-navigate.html), select the **Queues** dashboard, hover over the **Replication Queue** graph, and check the **Leases Transferred / second** data point. If the value is consistently larger than 0, you should consider stopping and restarting each node with additional tiers of locality to improve request latency.

For example, let's say that latency is 10ms from nodes in datacenter A to nodes in datacenter B but is 100ms from nodes in datacenter A to nodes in datacenter C. To ensure A's and B's relative proximity is factored into lease holder rebalancing, you could restart the nodes in datacenter A and B with a common region, `--locality=region=foo,datacenter=a` and `--locality=region=foo,datacenter=b`, while restarting nodes in datacenter C with a different region, `--locality=region=bar,datacenter=c`.

### Overload resolution for collated strings

Many string operations are not properly overloaded for [collated strings](collate.html), for example:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SELECT ('string1' collate en) || ('string2' collate en);
~~~

~~~
pq: unsupported binary operator: <collatedstring{en}> || <collatedstring{en}>
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/10679)

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

Every [`DELETE`](delete.html) or [`UPDATE`](update.html) statement constructs a `SELECT` statement, even when no `WHERE` clause is involved. As a result, the user executing `DELETE` or `UPDATE` requires both the `DELETE` and `SELECT` or `UPDATE` and `SELECT` [privileges](authorization.html#assign-privileges) on the table.
