---
title: Known Limitations in CockroachDB v2.1
summary: Known limitations in CockroachDB v2.1.
toc: true
---

This page describes newly identified limitations in the CockroachDB v2.1 release as well as unresolved limitations identified in earlier releases.

## New limitations

None identified yet.

## Unresolved limitations

### Silent validation error with `DECIMAL` values

Under the following conditions, the value received by CockroachDB will be different than that sent by the client and may cause incorrect data to be inserted or read from the database, without a visible error message:

1. A query uses placeholders (e.g., `$1`) to pass values to the server.
2. A value of type [`DECIMAL`](decimal.html) is passed.
3. The decimal value is encoded using the binary format.

Most client drivers and frameworks use the text format to pass placeholder values and are thus unaffected by this limitation. However, we know that the [Ecto framework](https://github.com/elixir-ecto/ecto) for Elixir is affected, and others may be as well. If in doubt, use [SQL statement logging](query-behavior-troubleshooting.html#cluster-wide-execution-logs) to control how CockroachDB receives decimal values from your client.

### Enterprise backup/restore during rolling upgrades

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v2.1.0-alpha.20180416.html">v2.1.0-alpha.20180416</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/24493">#24493</a>.{{site.data.alerts.end}}

In the upgrade process, after upgrading all binaries to v2.1, it's recommended to monitor the cluster's stability and performance for at least one day and only then finalize the upgrade by increasing the `version` cluster setting. However, in the window during which binaries are running v2.1 but the cluster version is still not increased, it is not possible to run enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs.

### Memory flags with non-integer values and a unit suffix

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v2.1.0-alpha.20180416.html">v2.1.0-alpha.20180416</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/24381">#24381</a>.{{site.data.alerts.end}}

The `--cache` and `--max-sql-memory` flags of the [`cockroach start`](start-a-node.html) command do not support non-integer values with a unit suffix, for example, `--cache=1.5GiB`.

As a workaround, use integer values or a percentage, for example, `--cache=1536MiB`.

### Import with a high amount of disk contention

[`IMPORT`](import.html) can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
~~~

### `CHECK` constraints with `INSERT ... ON CONFLICT`

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v2.1.0-alpha.20180702.html">v2.1.0-alpha.20180702</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/26642">#26642</a>.{{site.data.alerts.end}}

[`CHECK`](check.html) constraints are not properly enforced on updated values resulting from [`INSERT ... ON CONFLICT`](insert.html) statements. Consider the following example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE ab (a INT PRIMARY KEY, b INT, CHECK (b < 1));
~~~

A simple `INSERT` statement that fails the `CHECK` constraint fails as it should:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO ab (a, b) VALUES (1, 12312);
~~~

~~~
pq: failed to satisfy CHECK constraint (b < 1)
~~~

However, the same statement with `INSERT ... ON CONFLICT` incorrectly succeeds and results in a row that fails the constraint:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> INSERT INTO ab (a, b) VALUES (1,0); -- create some initial valid value
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO ab (a, b) VALUES (1, 0) ON CONFLICT (a) DO UPDATE SET b = 123132;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM ab;
~~~

~~~
+---+--------+
| a |   b    |
+---+--------+
| 1 | 123132 |
+---+--------+
(1 row)
~~~

### Referring to a CTE by name more than once

{% include {{ page.version.version }}/known-limitations/cte-by-name.md %}

### Using CTEs with data-modifying statements

{% include {{ page.version.version }}/known-limitations/cte-with-dml.md %}

### Using CTEs with views

{% include {{ page.version.version }}/known-limitations/cte-with-view.md %}

### Using CTEs with `VALUES` clauses

{% include {{ page.version.version }}/known-limitations/cte-in-values-clause.md %}

### Using CTEs with set operations

{% include {{ page.version.version }}/known-limitations/cte-in-set-expression.md %}

### Assigning latitude/longitude for the Node Map

{% include {{ page.version.version }}/known-limitations/node-map.md %}

### Placeholders in `PARTITION BY`

{% include {{ page.version.version }}/known-limitations/partitioning-with-placeholders.md %}

### Adding a column with certain `DEFAULT` values

It is currently not possible to [add a column](add-column.html) to a table when the column uses a [sequence](create-sequence.html), [computed column](computed-columns.html), or certain evaluated expressions as the [`DEFAULT`](default-value.html) value, for example:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE add_default ADD COLUMN g INT DEFAULT nextval('initial_seq');
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE add_default ADD COLUMN g OID DEFAULT 'foo'::REGCLASS::OID;
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE add_default ADD COLUMN g INT DEFAULT 'foo'::REGTYPE::INT;
~~~

### Available capacity metric in the Admin UI

{% include v2.1/misc/available-capacity-metric.md %}

### Schema changes within transactions

{% include v2.1/misc/schema-changes-within-transactions.md %}

### Schema changes between executions of prepared statements

{% include v2.1/misc/schema-changes-between-prepared-statements.md %}

### `INSERT ON CONFLICT` vs. `UPSERT`

When inserting/updating all columns of a table, and the table has no secondary indexes, we recommend using an [`UPSERT`](upsert.html) statement instead of the equivalent [`INSERT ON CONFLICT`](insert.html) statement. Whereas `INSERT ON CONFLICT` always performs a read to determine the necessary writes, the `UPSERT` statement writes without reading, making it faster.

This issue is particularly relevant when using a simple SQL table of two columns to [simulate direct KV access](frequently-asked-questions.html#can-i-use-cockroachdb-as-a-key-value-store). In this case, be sure to use the `UPSERT` statement.

### Write and update limits for a single statement

A single statement can perform at most 64MiB of combined updates. When a statement exceeds these limits, its transaction gets aborted. Currently, `INSERT INTO ... SELECT FROM` and `CREATE TABLE AS SELECT` queries may encounter these limits.

To increase these limits, you can update the [cluster-wide setting](cluster-settings.html) `kv.raft.command.max_size`, but note that increasing this setting can affect the memory utilization of nodes in the cluster. For `INSERT INTO .. SELECT FROM` queries in particular, another workaround is to manually page through the data you want to insert using separate transactions.

In the v1.1 release, the limit referred to a whole transaction (i.e., the sum of changes done by all statements) and capped both the number and the size of update. In this release, there's only a size limit, and it applies independently to each statement. Note that even though not directly restricted any more, large transactions can have performance implications on the cluster.

### Using `\|` to perform a large input in the SQL shell

In the [built-in SQL shell](use-the-built-in-sql-client.html), using the [`\|`](use-the-built-in-sql-client.html#commands) operator to perform a large number of inputs from a file can cause the server to close the connection. This is because `\|` sends the entire file as a single query to the server, which can exceed the upper bound on the size of a packet the server can accept from any client (16MB).

As a workaround, [execute the file from the command line](use-the-built-in-sql-client.html#execute-sql-statements-from-a-file) with `cat data.sql | cockroach sql` instead of from within the interactive shell.

### New values generated by `DEFAULT` expressions during `ALTER TABLE ADD COLUMN`

When executing an [`ALTER TABLE ADD COLUMN`](add-column.html) statement with a [`DEFAULT`](default-value.html) expression, new values generated:

- use the default [search path](sql-name-resolution.html#search-path) regardless of the search path configured in the current session via `SET SEARCH_PATH`.
- use the UTC time zone regardless of the time zone configured in the current session via [`SET TIME ZONE`](set-vars.html).
- have no default database regardless of the default database configured in the current session via [`SET DATABASE`](set-vars.html), so you must specify the database of any tables they reference.
- use the transaction timestamp for the `statement_timestamp()` function regardless of the time at which the `ALTER` statement was issued.

### Load-based lease rebalancing in uneven latency deployments

When nodes are started with the [`--locality`](start-a-node.html#flags) flag, CockroachDB attempts to place the replica lease holder (the replica that client requests are forwarded to) on the node closest to the source of the request. This means as client requests move geographically, so too does the replica lease holder.

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
> SELECT ('string1' COLLATE en) || ('string2' COLLATE en);
~~~

~~~
pq: unsupported binary operator: <collatedstring{en}> || <collatedstring{en}>
~~~

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

{{site.data.alerts.callout_info}}Resolved as of <a href="../releases/v2.1.0-alpha.20180507.html">v2.1.0-alpha.20180507</a>. See <a href="https://github.com/cockroachdb/cockroach/pull/24716">#24716</a>.{{site.data.alerts.end}}

{% include {{ page.version.version }}/known-limitations/dump-cyclic-foreign-keys.md %}
