---
title: Known Limitations in CockroachDB v22.1
summary: Learn about newly identified limitations in CockroachDB as well as unresolved limitations identified in earlier releases.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: releases
---

This page describes newly identified limitations in the CockroachDB {{page.release_info.version}} release as well as unresolved limitations identified in earlier releases. 

## New limitations

### A multi-region table cannot be restored into a non-multi-region table

You cannot [restore](restore.html) a multi-region table into a non-multi-region table.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/71502)

### Statements containing multiple modification subqueries of the same table are disallowed

Statements containing multiple modification subqueries mutating the same row could cause corruption. These statements are disallowed by default, but you can enable multiple modification subqueries with one the following:

- Set the `sql.multiple_modifications_of_table.enabled` [cluster setting](cluster-settings.html) to `true`.
- Use the `enable_multiple_modifications_of_table` [session variable](set-vars.html).

Note that if multiple mutations inside the same statement affect different tables with [`FOREIGN KEY`](foreign-key.html) relations and `ON CASCADE` clauses between them, the results will be different from what is expected in PostgreSQL.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/70731)

### `transaction_rows_read_err` and `transaction_rows_written_err` do not halt query execution

The `transaction_rows_read_err` and `transaction_rows_written_err` [session settings](set-vars.html) limit the number of rows read or written by a single [transaction](transactions.html#limit-the-number-of-rows-written-or-read-in-a-transaction). These session settings will fail the transaction with an error, but not until the current query finishes executing and the results have been returned to the client.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/70473)

### `sql.guardrails.max_row_size_err` misses indexed virtual computed columns

The `sql.guardrails.max_row_size_err` [cluster setting](cluster-settings.html) misses large rows caused by indexed virtual computed columns. This is because the guardrail only checks the size of primary key rows, not secondary index rows.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/69540)

### SQL-only command-line client executable limitations

- The [SQL-only command-line client executable](../releases/v22.1.html#v22-1-0-downloads) does not support [environment variables](cockroach-commands.html#environment-variables), and therefore cannot be used to override the default connection parameters. [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/82024)
- The [SQL-only command-line client executable](../releases/v22.1.html#v22-1-0-downloads) does not support the `--certs-dir` flag. To pass a PostgreSQL connection URL to the client, use the [`--url` flag](connection-parameters.html#connect-using-a-url). [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/81882)

### Row-Level TTL limitations

{% include {{page.version.version}}/known-limitations/row-level-ttl-limitations.md %}

### Change data capture limitations

Change data capture (CDC) provides efficient, distributed, row-level changefeeds into Apache Kafka for downstream processing such as reporting, caching, or full-text indexing. It has the following known limitations:

{% include {{ page.version.version }}/known-limitations/cdc.md %}

## Unresolved limitations

### CockroachDB does not properly optimize some left and anti joins with GIN indexes

[Left joins](joins.html#left-outer-joins) and anti joins involving [`JSONB`](jsonb.html), [`ARRAY`](array.html), or [spatial-typed](spatial-data.html) columns with a multi-column or [partitioned](partition-by.html) [GIN index](inverted-indexes.html) will not take advantage of the index if the prefix columns of the index are unconstrained, or if they are constrained to multiple, constant values.

To work around this limitation, make sure that the prefix columns of the index are either constrained to single constant values, or are part of an equality condition with an input column (e.g., `col1 = col2`, where `col1` is a prefix column and `col2` is an input column).

For example, suppose you have the following [multi-region database](multiregion-overview.html) and tables:

``` sql
CREATE DATABASE multi_region_test_db PRIMARY REGION "europe-west1" REGIONS "us-west1", "us-east1" SURVIVE REGION FAILURE;
USE multi_region_test_db;

CREATE TABLE t1 (
  k INT PRIMARY KEY,
  geom GEOMETRY
);

CREATE TABLE t2 (
  k INT PRIMARY KEY,
  geom GEOMETRY,
  INVERTED INDEX geom_idx (geom)
) LOCALITY REGIONAL BY ROW;
```

And you [insert](insert.html) some data into the tables:

``` sql
INSERT INTO t1 SELECT generate_series(1, 1000), 'POINT(1.0 1.0)';
INSERT INTO t2 (crdb_region, k, geom) SELECT 'us-east1', generate_series(1, 1000), 'POINT(1.0 1.0)';
INSERT INTO t2 (crdb_region, k, geom) SELECT 'us-west1', generate_series(1001, 2000), 'POINT(2.0 2.0)';
INSERT INTO t2 (crdb_region, k, geom) SELECT 'europe-west1', generate_series(2001, 3000), 'POINT(3.0 3.0)';
```

If you attempt a left join between `t1` and `t2` on only the geometry columns, CockroachDB will not be able to plan an [inverted join](joins.html#inverted-joins):

```
> EXPLAIN SELECT * FROM t1 LEFT JOIN t2 ON st_contains(t1.geom, t2.geom);
                info
------------------------------------
  distribution: full
  vectorized: true

  • cross join (right outer)
  │ pred: st_contains(geom, geom)
  │
  ├── • scan
  │     estimated row count: 3,000
  │     table: t2@primary
  │     spans: FULL SCAN
  │
  └── • scan
        estimated row count: 1,000
        table: t1@primary
        spans: FULL SCAN
(15 rows)
```

However, if you constrain the `crdb_region` column to a single value, CockroachDB can plan an inverted join:

```
> EXPLAIN SELECT * FROM t1 LEFT JOIN t2 ON st_contains(t1.geom, t2.geom) AND t2.crdb_region = 'us-east1';
                       info
--------------------------------------------------
  distribution: full
  vectorized: true

  • lookup join (left outer)
  │ table: t2@primary
  │ equality: (crdb_region, k) = (crdb_region,k)
  │ equality cols are key
  │ pred: st_contains(geom, geom)
  │
  └── • inverted join (left outer)
      │ table: t2@geom_idx
      │
      └── • render
          │
          └── • scan
                estimated row count: 1,000
                table: t1@primary
                spans: FULL SCAN
(18 rows)
```

If you do not know which region to use, you can combine queries with [`UNION ALL`](selection-queries.html#union-combine-two-queries):

```
> EXPLAIN SELECT * FROM t1 LEFT JOIN t2 ON st_contains(t1.geom, t2.geom) AND t2.crdb_region = 'us-east1'
UNION ALL SELECT * FROM t1 LEFT JOIN t2 ON st_contains(t1.geom, t2.geom) AND t2.crdb_region = 'us-west1'
UNION ALL SELECT * FROM t1 LEFT JOIN t2 ON st_contains(t1.geom, t2.geom) AND t2.crdb_region = 'europe-west1';
                           info
----------------------------------------------------------
  distribution: full
  vectorized: true

  • union all
  │
  ├── • union all
  │   │
  │   ├── • lookup join (left outer)
  │   │   │ table: t2@primary
  │   │   │ equality: (crdb_region, k) = (crdb_region,k)
  │   │   │ equality cols are key
  │   │   │ pred: st_contains(geom, geom)
  │   │   │
  │   │   └── • inverted join (left outer)
  │   │       │ table: t2@geom_idx
  │   │       │
  │   │       └── • render
  │   │           │
  │   │           └── • scan
  │   │                 estimated row count: 1,000
  │   │                 table: t1@primary
  │   │                 spans: FULL SCAN
  │   │
  │   └── • lookup join (left outer)
  │       │ table: t2@primary
  │       │ equality: (crdb_region, k) = (crdb_region,k)
  │       │ equality cols are key
  │       │ pred: st_contains(geom, geom)
  │       │
  │       └── • inverted join (left outer)
  │           │ table: t2@geom_idx
  │           │
  │           └── • render
  │               │
  │               └── • scan
  │                     estimated row count: 1,000
  │                     table: t1@primary
  │                     spans: FULL SCAN
  │
  └── • lookup join (left outer)
      │ table: t2@primary
      │ equality: (crdb_region, k) = (crdb_region,k)
      │ equality cols are key
      │ pred: st_contains(geom, geom)
      │
      └── • inverted join (left outer)
          │ table: t2@geom_idx
          │
          └── • render
              │
              └── • scan
                    estimated row count: 1,000
                    table: t1@primary
                    spans: FULL SCAN
(54 rows)
```

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/59649)

### Using `RESTORE` with multi-region table localities

- {% include {{ page.version.version }}/known-limitations/restore-tables-non-multi-reg.md %}

- {% include {{ page.version.version }}/known-limitations/restore-multiregion-match.md %}

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/71071)

### `SET` does not `ROLLBACK` in a transaction

{% include {{page.version.version}}/known-limitations/set-transaction-no-rollback.md %}

### `JSONB`/`JSON` comparison operators are not implemented

{% include {{page.version.version}}/sql/jsonb-comparison.md %}

### Locality-optimized search works only for queries selecting a limited number of records

{% include {{ page.version.version }}/sql/locality-optimized-search-limited-records.md %}

### Expression indexes cannot reference computed columns

{% include {{page.version.version}}/sql/expression-indexes-cannot-reference-computed-columns.md %}

### Materialized view limitations

{% include {{page.version.version}}/sql/materialized-views-no-stats.md %}

{% include {{page.version.version}}/sql/cannot-refresh-materialized-views-inside-transactions.md %}

### CockroachDB cannot plan locality optimized searches that use partitioned unique indexes on virtual computed columns

{% include {{page.version.version}}/sql/locality-optimized-search-virtual-computed-columns.md %}

### Expressions as `ON CONFLICT` targets are not supported

{% include {{page.version.version}}/sql/expressions-as-on-conflict-targets.md %}

### Optimizer stale statistics deletion when columns are dropped

- {% include {{page.version.version}}/known-limitations/old-multi-col-stats.md %}

- {% include {{page.version.version}}/known-limitations/single-col-stats-deletion.md %}

### Automatic statistics refresher may not refresh after upgrade

{% include {{page.version.version}}/known-limitations/stats-refresh-upgrade.md %}

### Differences in syntax and behavior between CockroachDB and PostgreSQL

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and the majority of its syntax. However, CockroachDB does not support some of the PostgreSQL features or behaves differently from PostgreSQL because not all features can be easily implemented in a distributed system.

For a list of known differences in syntax and behavior between CockroachDB and PostgreSQL, see [Features that differ from PostgreSQL](postgresql-compatibility.html#features-that-differ-from-postgresql).

### Multiple arbiter indexes for `INSERT ON CONFLICT DO UPDATE`

CockroachDB does not currently support multiple arbiter indexes for [`INSERT ON CONFLICT DO UPDATE`](insert.html#on-conflict-clause), and will return an error if there are multiple unique or exclusion constraints matching the `ON CONFLICT DO UPDATE` specification.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/53170)

### `IMPORT` into a table with partial indexes

CockroachDB does not currently support [`IMPORT`s](import.html) into tables with partial indexes.

To work around this limitation:

1. Drop any partial indexes defined on the table.
2. Perform the `IMPORT`.
3. Recreate the partial indexes.

If you are [performing an `IMPORT` of a `PGDUMP`](migrate-from-postgres.html) with partial indexes:

1. Drop the partial indexes on the PostgreSQL server.
2. Recreate the `PGDUMP`.
3. `IMPORT` the `PGDUMP`.
4. Add partial indexes on the CockroachDB server.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/50225)

### Spatial support limitations

CockroachDB supports efficiently storing and querying [spatial data](spatial-data.html), with the following limitations:

- Not all [PostGIS spatial functions](https://postgis.net/docs/reference.html) are supported.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/49203)

- The `AddGeometryColumn` [spatial function](functions-and-operators.html#spatial-functions) only allows constant arguments.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/49402)

- The `AddGeometryColumn` spatial function only allows the `true` value for its `use_typmod` parameter.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/49448)

- CockroachDB does not support the `@` operator. Instead of using `@` in spatial expressions, we recommend using the inverse, with `~`. For example, instead of `a @ b`, use `b ~ a`.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56124)

- CockroachDB does not yet support [`INSERT`](insert.html)s into the [`spatial_ref_sys` table](spatial-glossary.html#spatial-system-tables). This limitation also blocks the [`ogr2ogr -f PostgreSQL` file conversion command](https://gdal.org/programs/ogr2ogr.html#cmdoption-ogr2ogr-f).

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/55903)

- CockroachDB does not yet support Triangle or [`TIN`](https://en.wikipedia.org/wiki/Triangulated_irregular_network) spatial shapes.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56196)

- CockroachDB does not yet support Curve, MultiCurve, or CircularString spatial shapes.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56199)

- CockroachDB does not yet support [k-nearest neighbors](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm).

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/55227)

- CockroachDB does not support using [schema name prefixes](sql-name-resolution.html#how-name-resolution-works) to refer to [data types](data-types.html) with type modifiers (e.g., `public.geometry(linestring, 4326)`). Instead, use fully-unqualified names to refer to data types with type modifiers (e.g., `geometry(linestring,4326)`).

    Note that, in [`IMPORT PGDUMP`](migrate-from-postgres.html) output, [`GEOMETRY` and `GEOGRAPHY`](spatial-data.html) data type names are prefixed by `public.`. If the type has a type modifier, you must remove the `public.` from the type name in order for the statements to work in CockroachDB.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56492)

### Subqueries in `SET` statements

It is not currently possible to use a subquery in a [`SET`](set-vars.html) or [`SET CLUSTER SETTING`](set-cluster-setting.html) statement. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET application_name = (SELECT 'a' || 'b');
~~~

~~~
ERROR: invalid value for parameter "application_name": "(SELECT 'a' || 'b')"
SQLSTATE: 22023
DETAIL: subqueries are not allowed in SET
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/42896)

### Enterprise `BACKUP` does not capture database/table/column comments

The [`COMMENT ON`](comment-on.html) statement associates comments to databases, tables, or columns. However, the internal table (`system.comments`) in which these comments are stored is not captured by a [`BACKUP`](backup.html) of a table or database.

As a workaround, take a cluster backup instead, as the `system.comments` table is included in cluster backups.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/44396)

### DB Console may become inaccessible for secure clusters

Accessing the DB Console for a secure cluster now requires login information (i.e., username and password). This login information is stored in a system table that is replicated like other data in the cluster. If a majority of the nodes with the replicas of the system table data go down, users will be locked out of the DB Console.

### `AS OF SYSTEM TIME` in `SELECT` statements

`AS OF SYSTEM TIME` can only be used in a top-level `SELECT` statement. That is, we do not support statements like `INSERT INTO t SELECT * FROM t2 AS OF SYSTEM TIME <time>` or two subselects in the same statement with differing `AS OF SYSTEM TIME` arguments.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30534)

### Large index keys can impair performance

The use of tables with very large primary or secondary index keys (>32KB) can result in excessive memory usage. Specifically, if the primary or secondary index key is larger than 32KB the default indexing scheme for [storage engine](cockroach-start.html#storage-engine) SSTables breaks down and causes the index to be excessively large. The index is pinned in memory by default for performance.

To work around this issue, we recommend limiting the size of primary and secondary keys to 4KB, which you must account for manually. Note that most columns are 8B (exceptions being `STRING` and `JSON`), which still allows for very complex key structures.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30515)

### Using `LIKE...ESCAPE` in `WHERE` and `HAVING` constraints

CockroachDB tries to optimize most comparisons operators in `WHERE` and `HAVING` clauses into constraints on SQL indexes by only accessing selected rows. This is done for `LIKE` clauses when a common prefix for all selected rows can be determined in the search pattern (e.g., `... LIKE 'Joe%'`). However, this optimization is not yet available if the `ESCAPE` keyword is also used.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30192)

### Ordering tables by `JSONB`/`JSON`-typed columns

CockroachDB does not currently key-encode JSON values. As a result, tables cannot be [ordered by](order-by.html) [`JSONB`/`JSON`](jsonb.html)-typed columns.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/35706)

### Current sequence value not checked when updating min/max value

Altering the minimum or maximum value of a series does not check the current value of a series. This means that it is possible to silently set the maximum to a value less than, or a minimum value greater than, the current value.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/23719)

### Using `default_int_size` session variable in batch of statements

When setting the `default_int_size` [session variable](set-vars.html) in a batch of statements such as `SET default_int_size='int4'; SELECT 1::IN`, the `default_int_size` variable will not take affect until the next statement. This happens because statement parsing takes place asynchronously from statement execution.

As a workaround, set `default_int_size` via your database driver, or ensure that `SET default_int_size` is in its own statement.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/32846)

### `COPY` syntax not supported by CockroachDB

{% include {{ page.version.version }}/known-limitations/copy-syntax.md %}

### Import with a high amount of disk contention

{% include {{ page.version.version }}/known-limitations/import-high-disk-contention.md %}

### Placeholders in `PARTITION BY`

{% include {{ page.version.version }}/known-limitations/partitioning-with-placeholders.md %}

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/19464)

### Adding a column with sequence-based `DEFAULT` values

It is currently not possible to [add a column](add-column.html) to a table when the column uses a [sequence](create-sequence.html) as the [`DEFAULT`](default-value.html) value, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE t (x INT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO t(x) VALUES (1), (2), (3);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE s;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE t ADD COLUMN y INT DEFAULT nextval('s');
~~~

~~~
ERROR: nextval(): unimplemented: cannot evaluate scalar expressions containing sequence operations in this context
SQLSTATE: 0A000
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/42508)

### Available capacity metric in the DB Console

{% include {{ page.version.version }}/misc/available-capacity-metric.md %}

### Schema changes within transactions

{% include {{ page.version.version }}/known-limitations/schema-changes-within-transactions.md %}

### Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed

{% include {{ page.version.version }}/known-limitations/schema-change-ddl-inside-multi-statement-transactions.md %}

### Schema changes between executions of prepared statements

{% include {{ page.version.version }}/known-limitations/schema-changes-between-prepared-statements.md %}

### Size limits on statement input from SQL clients

CockroachDB imposes a hard limit of 16MiB on the data input for a single statement passed to CockroachDB from a client (including the SQL shell). We do not recommend attempting to execute statements from clients with large input.

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

To detect if this is happening, open the [DB Console](ui-overview.html), select the **Queues** dashboard, hover over the **Replication Queue** graph, and check the **Leases Transferred / second** data point. If the value is consistently larger than 0, you should consider stopping and restarting each node with additional tiers of locality to improve request latency.

For example, let's say that latency is 10ms from nodes in datacenter A to nodes in datacenter B but is 100ms from nodes in datacenter A to nodes in datacenter C. To ensure A's and B's relative proximity is factored into lease holder rebalancing, you could restart the nodes in datacenter A and B with a common region, `--locality=region=foo,datacenter=a` and `--locality=region=foo,datacenter=b`, while restarting nodes in datacenter C with a different region, `--locality=region=bar,datacenter=c`.

### Overload resolution for collated strings

Many string operations are not properly overloaded for [collated strings](collate.html), for example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT 'string1' || 'string2';
~~~

~~~
     ?column?
------------------
  string1string2
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT ('string1' collate en) || ('string2' collate en);
~~~

~~~
pq: unsupported binary operator: <collatedstring{en}> || <collatedstring{en}>
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/10679)

### Max size of a single column family

When creating or updating a row, if the combined size of all values in a single [column family](column-families.html) exceeds the max range size (512 MiB by default) for the table, the operation may fail, or cluster performance may suffer.

As a workaround, you can either [manually split a table's columns into multiple column families](column-families.html#manual-override), or you can [create a table-specific zone configuration](configure-replication-zones.html#create-a-replication-zone-for-a-table) with an increased max range size.

### Simultaneous client connections and running queries on a single node

When a node has both a high number of client connections and running queries, the node may crash due to memory exhaustion. This is due to CockroachDB not accurately limiting the number of clients and queries based on the amount of available RAM on the node.

To prevent memory exhaustion, monitor each node's memory usage and ensure there is some margin between maximum CockroachDB memory usage and available system RAM. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

{% include {{page.version.version}}/sql/server-side-connection-limit.md %} This may be useful in addition to your memory monitoring.

### Privileges for `DELETE` and `UPDATE`

Every [`DELETE`](delete.html) or [`UPDATE`](update.html) statement constructs a `SELECT` statement, even when no `WHERE` clause is involved. As a result, the user executing `DELETE` or `UPDATE` requires both the `DELETE` and `SELECT` or `UPDATE` and `SELECT` [privileges](security-reference/authorization.html#managing-privileges) on the table.

### `ROLLBACK TO SAVEPOINT` in high-priority transactions containing DDL

Transactions with [priority `HIGH`](transactions.html#transaction-priorities) that contain DDL and `ROLLBACK TO SAVEPOINT` are not supported, as they could result in a deadlock. For example:

~~~ sql
> BEGIN PRIORITY HIGH; SAVEPOINT s; CREATE TABLE t(x INT); ROLLBACK TO SAVEPOINT s;
~~~

~~~
ERROR: unimplemented: cannot use ROLLBACK TO SAVEPOINT in a HIGH PRIORITY transaction containing DDL
SQLSTATE: 0A000
HINT: You have attempted to use a feature that is not yet implemented.
See: https://github.com/cockroachdb/cockroach/issues/46414
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/46414)

### CockroachDB does not test for all connection failure scenarios

CockroachDB servers rely on the network to report when a TCP connection fails. In most scenarios when a connection fails, the network immediately reports a connection failure, resulting in a `Connection refused` error.

However, if there is no host at the target IP address, or if a firewall rule blocks traffic to the target address and port, a TCP handshake can linger while the client network stack waits for a TCP packet in response to network requests. To work around this kind of scenario, we recommend the following:

- When migrating a node to a new machine, keep the server listening at the previous IP address until the cluster has completed the migration.
- Configure any active network firewalls to allow node-to-node traffic.
- Verify that orchestration tools (e.g., Kubernetes) are configured to use the correct network connection information.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/53410)

### Some column-dropping schema changes do not roll back properly

Some [schema changes](online-schema-changes.html) that [drop columns](drop-column.html) cannot be [rolled back](rollback-transaction.html) properly.

In some cases, the rollback will succeed, but the column data might be partially or totally missing, or stale due to the asynchronous nature of the schema change.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/46541)

In other cases, the rollback will fail in such a way that will never be cleaned up properly, leaving the table descriptor in a state where no other schema changes can be run successfully.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/47712)

To reduce the chance that a column drop will roll back incorrectly:

- Perform column drops in transactions separate from other schema changes. This ensures that other schema change failures will not cause the column drop to be rolled back.

- Drop all [constraints](constraints.html) (including [unique indexes](unique.html)) on the column in a separate transaction, before dropping the column.

- Drop any [default values](default-value.html) or [computed expressions](computed-columns.html) on a column before attempting to drop the column. This prevents conflicts between constraints and default/computed values during a column drop rollback.

If you think a rollback of a column-dropping schema change has occurred, check the [jobs table](show-jobs.html). Schema changes with an error prefaced by `cannot be reverted, manual cleanup may be required` might require manual intervention.

### Disk-spilling on joins with `JSON` columns

If the execution of a [join](joins.html) query exceeds the limit set for memory-buffering operations (i.e., the value set for the `sql.distsql.temp_storage.workmem` [cluster setting](cluster-settings.html)), CockroachDB will spill the intermediate results of computation to disk. If the join operation spills to disk, and at least one of the equality columns is of type [`JSON`](jsonb.html), CockroachDB returns the error `unable to encode table key: *tree.DJSON`. If the memory limit is not reached, then the query will be processed without error.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/35706)

### Remove a `UNIQUE` index created as part of `CREATE TABLE`

{% include {{ page.version.version }}/known-limitations/drop-unique-index-from-create-table.md %}
