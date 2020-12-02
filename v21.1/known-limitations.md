---
title: Known Limitations in CockroachDB v21.1
summary: Known limitations in CockroachDB v21.1.
toc: true
---

This page describes newly identified limitations in the CockroachDB {{page.release_info.version}} release as well as unresolved limitations identified in earlier releases.

## Unresolved limitations

### Upgrading to v20.2 with 100 or more non-terminal jobs

Clusters with 100 or more jobs in a non-terminal state (i.e., any state other than `succeeded`, `failed`, or `canceled`) are unable to upgrade to v20.2. The v20.2 node will hang and never successfully start, and the [logs](debug-and-error-logs.html) will show `checked 100 jobs for existence of deprecated schema change jobs` in a tight loop.

To avoid this limitation:

1. Before starting the upgrade to v20.2, check the [Jobs page](ui-jobs-page.html#jobs-list) in the DB Console or run `SELECT count(*) FROM crdb_internal.jobs WHERE status NOT IN ('succeeded', 'canceled', 'failed')` to ensure that fewer than 100 jobs are in a non-terminal state.

1. You can then [start the rolling upgrade](upgrade-cockroach-version.html#step-4-perform-the-rolling-upgrade) and wait for the log message `done ensuring all necessary migrations have run` to appear on the first upgraded node, at which point there are no further restrictions on jobs.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56859)

### Partitioning on `ENUM` values

[Partitions](partitioning.html) cannot be created on columns of type [`ENUM`](enum.html).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/55342)

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

- CockroachDB does not yet support `DECLARE CURSOR`, which prevents the `ogr2ogr` conversion tool from exporting from CockroachDB to certain formats and prevents [QGIS](https://qgis.org/en/site/) from working with CockroachDB. To work around this limitation, [export data first to CSV](export-spatial-data.html) or GeoJSON format.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/41412)

- CockroachDB does not yet support storing spatial objects of more than two dimensions.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/53091)

- CockroachDB does not yet support Triangle or [`TIN`](https://en.wikipedia.org/wiki/Triangulated_irregular_network) spatial shapes.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56196)

- CockroachDB does not yet support Curve, MultiCurve, or CircularString spatial shapes.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56199)

- CockroachDB does not yet support [k-nearest neighbors](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm).

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/55227)

### KMS encryption not supported for scheduled backups

You cannot [schedule a backup](create-schedule-for-backup.html) with [KMS encryption](take-and-restore-encrypted-backups.html#use-aws-key-management-service).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/56082)

### Collation names that include upper-case or hyphens may cause errors

Using a [collation](collate.html) name with upper-case letters or hyphens may result in errors.

For example, the following SQL will result in an error:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE nocase_strings (s STRING COLLATE "en-US-u-ks-level2");
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO nocase_strings VALUES ('Aaa' COLLATE "en-US-u-ks-level2"), ('Bbb' COLLATE "en-US-u-ks-level2");
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT s FROM nocase_strings WHERE s = ('bbb' COLLATE "en-US-u-ks-level2");
~~~

~~~
ERROR: internal error: "$0" = 'bbb' COLLATE en_us_u_ks_level2: unsupported comparison operator: <collatedstring{en-US-u-ks-level2}> = <collatedstring{en_us_u_ks_level2}>
~~~

As a workaround, only use collation names that have lower-case letters and underscores.

[Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/56335)

### Subqueries in `SET` statements

It is not currently possible to use a subquery in a [`SET`](set-vars.html) or [`SET CLUSTER SETTING`](set-cluster-setting.html) statement. For example:

{% include copy-clipboard.html %}
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

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/35370)

### Cold starts of large clusters may require manual intervention

If a cluster contains a large amount of data (>500GiB / node), and all nodes are stopped and then started at the same time, clusters can enter a state where they're unable to startup without manual intervention. In this state, logs fill up rapidly with messages like `refusing gossip from node x; forwarding to node y`, and data and metrics may become inaccessible.

To exit this state, you should:

1. Stop all nodes.
2. Set the following environment variables: `COCKROACH_SCAN_INTERVAL=60m`, and `COCKROACH_SCAN_MIN_IDLE_TIME=1s`.
3. Restart the cluster.

Once restarted, monitor the Replica Quiescence graph on the [**Replication Dashboard**](ui-replication-dashboard.html). When >90% of the replicas have become quiescent, conduct a rolling restart and remove the environment variables. Make sure that under-replicated ranges do not increase between restarts.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/39117)

### Requests to restarted node in need of snapshots may hang

When a node is offline, the [Raft logs](architecture/replication-layer.html#raft-logs) for the ranges on the node get truncated. When the node comes back online, it therefore often needs [Raft snapshots](architecture/replication-layer.html#snapshots) to get many of its ranges back up-to-date. While in this state, requests to a range will hang until its snapshot has been applied, which can take a long time.  

To work around this limitation, you can adjust the `kv.snapshot_recovery.max_rate` [cluster setting](cluster-settings.html) to temporarily relax the throughput rate limiting applied to snapshots. For example, changing the rate limiting from the default 8 MB/s, at which 1 GB of snapshots takes at least 2 minutes, to 64 MB/s can result in an 8x speedup in snapshot transfers and, therefore, a much shorter interruption of requests to an impacted node:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.snapshot_recovery.max_rate = '64mb';
~~~

Before increasing this value, however, verify that you will not end up saturating your network interfaces, and once the problem has resolved, be sure to reset to the original value.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/37906)

### Location-based time zone names

Certain features of CockroachDB require time zone data, for example, to support using location-based names as time zone identifiers. When starting a CockroachDB node on a machine missing time zone data, the node will not start.

To resolve this issue on Linux, install the [`tzdata`](https://www.iana.org/time-zones) library (sometimes called `tz` or `zoneinfo`).

To resolve this issue on Windows, download Go's official [zoneinfo.zip](https://github.com/golang/go/raw/master/lib/time/zoneinfo.zip) and set the `ZONEINFO` environment variable to point to the zip file. For step-by-step guidance on setting environment variables on Windows, see this [external article](https://www.techjunkie.com/environment-variables-windows-10/).

Make sure to do this across all nodes in the cluster and to keep this time zone data up-to-date.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/36864)

### Change data capture

Change data capture (CDC) provides efficient, distributed, row-level change feeds into Apache Kafka for downstream processing such as reporting, caching, or full-text indexing.

{% include {{ page.version.version }}/known-limitations/cdc.md %}

### DB Console may become inaccessible for secure clusters

Accessing the DB Console for a secure cluster now requires login information (i.e., username and password). This login information is stored in a system table that is replicated like other data in the cluster. If a majority of the nodes with the replicas of the system table data go down, users will be locked out of the DB Console.

### `AS OF SYSTEM TIME` in `SELECT` statements

`AS OF SYSTEM TIME` can only be used in a top-level `SELECT` statement. That is, we do not support statements like `INSERT INTO t SELECT * FROM t2 AS OF SYSTEM TIME <time>` or two subselects in the same statement with differing `AS OF SYSTEM TIME` arguments.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30534)

### Large index keys can impair performance

The use of tables with very large primary or secondary index keys (>32KB) can result in excessive memory usage. Specifically, if the primary or secondary index key is larger than 32KB the default indexing scheme for [storage engine](cockroach-start.html#storage-engine) SSTables breaks down and causes the index to be excessively large. The index is pinned in memory by default for performance.

To work around this issue, we recommend limiting the size of primary and secondary keys to 4KB, which you must account for manually. Note that most columns are 8B (exceptions being `STRING` and `JSON`), which still allows for very complex key structures.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30515)

### DB Console: Statements page latency reports

The Statements page does not correctly report "mean latency" or "latency by phase" for statements that result in schema changes or other background jobs.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30381)

### Using `LIKE...ESCAPE` in `WHERE` and `HAVING` constraints

CockroachDB tries to optimize most comparisons operators in `WHERE` and `HAVING` clauses into constraints on SQL indexes by only accessing selected rows. This is done for `LIKE` clauses when a common prefix for all selected rows can be determined in the search pattern (e.g., `... LIKE 'Joe%'`). However, this optimization is not yet available if the `ESCAPE` keyword is also used.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/30192)

### Using SQLAlchemy with CockroachDB

Users of the SQLAlchemy adapter provided by Cockroach Labs must [upgrade the adapter to the latest release](https://github.com/cockroachdb/sqlalchemy-cockroachdb) before upgrading to CockroachDB {{ page.version.version }}.

### DB Console: CPU percentage calculation

For multi-core systems, the user CPU percent can be greater than 100%. Full utilization of one core is considered as 100% CPU usage. If you have _n_ cores, then the user CPU percent can range from 0% (indicating an idle system) to (_n_*100)% (indicating full utilization).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/28724)

### DB Console: CPU count in containerized environments

When CockroachDB is run in a containerized environment (e.g., Kubernetes), the DB Console does not detect CPU limits applied to a container. Instead, the UI displays the actual number of CPUs provisioned on a VM.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/34988)

### `TRUNCATE` does not behave like `DELETE`

`TRUNCATE` is not a DML statement, but instead works as a DDL statement. Its limitations are the same as other DDL statements, which are outlined in [Online Schema Changes: Limitations](online-schema-changes.html#limitations)

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/27953)

### Ordering tables by `JSONB`/`JSON`-typed columns

CockroachDB does not currently key-encode JSON values. As a result, tables cannot be [ordered by](query-order.html) [`JSONB`/`JSON`](jsonb.html)-typed columns.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/35706)

### Current sequence value not checked when updating min/max value

Altering the minimum or maximum value of a series does not check the current value of a series. This means that it is possible to silently set the maximum to a value less than, or a minimum value greater than, the current value.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/23719)

### Using `default_int_size` session variable in batch of statements

When setting the `default_int_size` [session variable](set-vars.html) in a batch of statements such as `SET default_int_size='int4'; SELECT 1::IN`, the `default_int_size` variable will not take affect until the next statement. This happens because statement parsing takes place asynchronously from statement execution.

As a workaround, set `default_int_size` via your database driver, or ensure that `SET default_int_size` is in its own statement.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/32846)

### Importing data using the PostgreSQL COPY protocol

Currently, the built-in SQL shell provided with CockroachDB (`cockroach sql` / `cockroach demo`) does not support importing data using the `COPY` statement. Users can use the `psql` client command provided with PostgreSQL to load this data into CockroachDB instead. For details, see [Import from generic SQL dump](https://www.cockroachlabs.com/docs/stable/import-data.html#import-from-generic-sql-dump).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/16392)

### Import with a high amount of disk contention

{% include {{ page.version.version }}/known-limitations/import-high-disk-contention.md %}

### Placeholders in `PARTITION BY`

{% include {{ page.version.version }}/known-limitations/partitioning-with-placeholders.md %}

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/19464)

### Adding a column with sequence-based `DEFAULT` values

It is currently not possible to [add a column](add-column.html) to a table when the column uses a [sequence](create-sequence.html) as the [`DEFAULT`](default-value.html) value, for example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE t (x INT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO t(x) VALUES (1), (2), (3);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE s;
~~~

{% include copy-clipboard.html %}
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

### `INSERT ON CONFLICT` vs. `UPSERT`

When inserting/updating all columns of a table, and the table has no secondary indexes, we recommend using an [`UPSERT`](upsert.html) statement instead of the equivalent [`INSERT ON CONFLICT`](insert.html) statement. Whereas `INSERT ON CONFLICT` always performs a read to determine the necessary writes, the `UPSERT` statement writes without reading, making it faster.

This issue is particularly relevant when using a simple SQL table of two columns to [simulate direct KV access](sql-faqs.html#can-i-use-cockroachdb-as-a-key-value-store). In this case, be sure to use the `UPSERT` statement.

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

{% include copy-clipboard.html %}
~~~ sql
> SELECT 'string1' || 'string2';
~~~

~~~
     ?column?
------------------
  string1string2
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

When creating or updating a row, if the combined size of all values in a single [column family](column-families.html) exceeds the max range size (512 MiB by default) for the table, the operation may fail, or cluster performance may suffer.

As a workaround, you can either [manually split a table's columns into multiple column families](column-families.html#manual-override), or you can [create a table-specific zone configuration](configure-replication-zones.html#create-a-replication-zone-for-a-table) with an increased max range size.

### Simultaneous client connections and running queries on a single node

When a node has both a high number of client connections and running queries, the node may crash due to memory exhaustion. This is due to CockroachDB not accurately limiting the number of clients and queries based on the amount of available RAM on the node.

To prevent memory exhaustion, monitor each node's memory usage and ensure there is some margin between maximum CockroachDB memory usage and available system RAM. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

### Query planning for `OR` expressions

Given a query like `SELECT * FROM foo WHERE a > 1 OR b > 2`, even if there are appropriate indexes to satisfy both `a > 1` and `b > 2`, the query planner performs a full table or index scan because it cannot use both conditions at once.

### Privileges for `DELETE` and `UPDATE`

Every [`DELETE`](delete.html) or [`UPDATE`](update.html) statement constructs a `SELECT` statement, even when no `WHERE` clause is involved. As a result, the user executing `DELETE` or `UPDATE` requires both the `DELETE` and `SELECT` or `UPDATE` and `SELECT` [privileges](authorization.html#assign-privileges) on the table.

### Correlated common table expressions

{% include {{ page.version.version }}/known-limitations/correlated-ctes.md %}

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/42540)

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

### Column name from an outer column inside a subquery differs from PostgreSQL

CockroachDB returns the column name from an outer column inside a subquery as `?column?`, unlike PostgreSQL. For example:

~~~ sql
> SELECT (SELECT t.*) FROM (VALUES (1)) t(x);
~~~

CockroachDB:

~~~
  ?column?
------------
         1
~~~

PostgreSQL:

~~~
 x
---
 1
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/46563)

### Concurrent SQL shells overwrite each other's history

The [built-in SQL shell](cockroach-sql.html) stores its command history in a single file by default (`.cockroachsql_history`). When running multiple instances of the SQL shell on the same machine. Therefore, each shell's command history can get overwritten in unexpected ways.

As a workaround, set the `COCKROACH_SQL_CLI_HISTORY` environment variable to different values for the two different shells, for example:

{% include copy-clipboard.html %}
~~~ shell
$ export COCKROACH_SQL_CLI_HISTORY=.cockroachsql_history_shell_1
~~~

{% include copy-clipboard.html %}
~~~ shell
$ export COCKROACH_SQL_CLI_HISTORY=.cockroachsql_history_shell_2
~~~

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/42027)

### Passwords with special characters cannot be passed in connection parameter

CockroachDB does not allow passwords with special characters to be passed as a [connection parameter](connection-parameters.html) to [`cockroach` commands](cockroach-commands.html).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/35998)

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

- Perform column drops in transactions separate from other schema changes. This ensures that other schema change failures won't cause the column drop to be rolled back.

- Drop all [constraints](constraints.html) (including [unique indexes](unique.html)) on the column in a separate transaction, before dropping the column.

- Drop any [default values](default-value.html) or [computed expressions](computed-columns.html) on a column before attempting to drop the column. This prevents conflicts between constraints and default/computed values during a column drop rollback.

If you think a rollback of a column-dropping schema change has occurred, check the [jobs table](show-jobs.html). Schema changes with an error prefaced by `cannot be reverted, manual cleanup may be required` might require manual intervention.

### Disk-spilling on joins with `JSON` columns

If the execution of a [join](joins.html) query exceeds the limit set for memory-buffering operations (i.e., the value set for the `sql.distsql.temp_storage.workmem` [cluster setting](cluster-settings.html)), CockroachDB will spill the intermediate results of computation to disk. If the join operation spills to disk, and at least one of the equality columns is of type [`JSON`](jsonb.html), CockroachDB returns the error `unable to encode table key: *tree.DJSON`. If the memory limit is not reached, then the query will be processed without error.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/35706)

### Inverted indexes cannot be partitioned

CockroachDB does not support partitioning inverted indexes, including [spatial indexes](spatial-indexes.html).

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/43643)
