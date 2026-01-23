---
title: Known Limitations in CockroachDB v25.4
summary: Learn about newly identified limitations in CockroachDB as well as unresolved limitations identified in earlier releases.
toc: true
keywords: limitations, known limitations, unsupported features, PostgreSQL compatibility
docs_area: releases
---

{% assign previous_version = site.data.versions | where_exp: "previous_version", "previous_version.major_version == page.version.version" | map: "previous_version" | first %}

## New limitations in {{ page.version.version }}

This section describes newly identified limitations in CockroachDB {{ page.version.version }}.

### View support

{% include {{ page.version.version }}/known-limitations/view-limitations.md %}

## Limitations from {{ previous_version }} and earlier

This section describes limitations from previous CockroachDB versions that still impact {{ page.version.version }}.

### SQL statements

#### Syntax and behavior differences from PostgreSQL

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and the majority of its syntax. For a list of known differences in syntax and behavior between CockroachDB and PostgreSQL, see [Features that differ from PostgreSQL]({% link {{ page.version.version }}/postgresql-compatibility.md %}#features-that-differ-from-postgresql).

#### JSONPath limitations

{% include {{ page.version.version }}/known-limitations/jsonpath-limitations.md %}

#### `AS OF SYSTEM TIME` limitations

- {% include {{ page.version.version }}/known-limitations/aost-limitations.md %}
- {% include {{ page.version.version }}/known-limitations/create-statistics-aost-limitation.md %}

#### `COPY` syntax not supported by CockroachDB

{% include {{ page.version.version }}/known-limitations/copy-syntax.md %}

#### `IMPORT INTO` limitations

{% include {{ page.version.version }}/known-limitations/import-into-limitations.md %}

#### `ALTER VIEW` limitations

{% include {{ page.version.version }}/known-limitations/alter-view-limitations.md %}

#### Row-Level TTL limitations

{% include {{page.version.version}}/known-limitations/row-level-ttl-limitations.md %}

#### `CAST` expressions containing a subquery with an `ENUM` target are not supported

Casting subqueries to ENUMs in views and UDFs is not supported. [#108184](https://github.com/cockroachdb/cockroach/issues/108184)

#### Statements containing multiple modification subqueries of the same table are disallowed

Statements containing multiple modification subqueries mutating the same row could cause corruption. These statements are disallowed by default, but you can enable multiple modification subqueries with one the following:

- Set the `sql.multiple_modifications_of_table.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `true`.
- Use the `enable_multiple_modifications_of_table` [session variable]({% link {{ page.version.version }}/set-vars.md %}).

If multiple mutations inside the same statement affect different tables with [`FOREIGN KEY`]({% link {{ page.version.version }}/foreign-key.md %}) relations and `ON CASCADE` clauses between them, the results will be different from what is expected in PostgreSQL. [#70731](https://github.com/cockroachdb/cockroach/issues/70731)

#### Using `default_int_size` session variable in batch of statements

When setting the `default_int_size` [session variable]({% link {{ page.version.version }}/set-vars.md %}) in a batch of statements such as `SET default_int_size='int4'; SELECT 1::IN`, the `default_int_size` variable will not take effect until the next statement. Statement parsing is asynchronous with  statement execution.

As a workaround, set `default_int_size` via your database driver, or ensure that `SET default_int_size` is in its own statement. [#32846](https://github.com/cockroachdb/cockroach/issues/32846)

#### Overload resolution for collated strings

Many string operations are not properly overloaded for [collated strings]({% link {{ page.version.version }}/collate.md %}), for example:

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

[#10679](https://github.com/cockroachdb/cockroach/issues/10679)

#### `LIKE` with `ESCAPE` performance

{% include {{ page.version.version }}/known-limitations/like-escape-performance.md %}

#### Current sequence value not checked when updating min/max value

Altering the minimum or maximum value of a series does not check the current value of a series. This means that it is possible to silently set the maximum to a value less than, or a minimum value greater than, the current value. [#23719](https://github.com/cockroachdb/cockroach/issues/23719)

#### `null_ordered_last` does not produce correct results with tuples

By default, CockroachDB orders `NULL`s before all other values. For compatibility with PostgreSQL, the `null_ordered_last` [session variable]({% link {{ page.version.version }}/set-vars.md %}) was added, which changes the default to order `NULL` values after all other values. This works in most cases, due to some transformations CockroachDB makes in the optimizer to add extra ordering columns. However, it does not work when the ordering column is a tuple. [#93558](https://github.com/cockroachdb/cockroach/issues/93558)

### Functions and procedures

#### PL/pgSQL support

{% include {{ page.version.version }}/known-limitations/plpgsql-limitations.md %}

#### UDF and stored procedure support

{% include {{ page.version.version }}/known-limitations/routine-limitations.md %}
{% include {{ page.version.version }}/known-limitations/stored-proc-limitations.md %}
{% include {{ page.version.version }}/known-limitations/udf-limitations.md %}

### Triggers

{% include {{ page.version.version }}/known-limitations/trigger-limitations.md %}

### Transactions

#### Read Committed features and performance

[Read Committed isolation]({% link {{ page.version.version }}/read-committed.md %}) has the following limitations:

{% include {{ page.version.version }}/known-limitations/read-committed-limitations.md %}

#### Follower reads

{% include {{ page.version.version }}/known-limitations/follower-reads-limitations.md %}

#### `SELECT FOR UPDATE` locks are dropped on lease transfers and range splits/merges

{% include {{page.version.version}}/known-limitations/select-for-update-limitations.md %}

#### `SET` does not `ROLLBACK` in a transaction

{% include {{page.version.version}}/known-limitations/set-transaction-no-rollback.md %}

#### `ROLLBACK TO SAVEPOINT` in high-priority transactions containing DDL
1
Transactions with [priority `HIGH`]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities) that contain DDL and `ROLLBACK TO SAVEPOINT` are not supported, as they could result in a deadlock. For example:

~~~ sql
> BEGIN PRIORITY HIGH; SAVEPOINT s; CREATE TABLE t(x INT); ROLLBACK TO SAVEPOINT s;
~~~

~~~
ERROR: unimplemented: cannot use ROLLBACK TO SAVEPOINT in a HIGH PRIORITY transaction containing DDL
SQLSTATE: 0A000
HINT: You have attempted to use a feature that is not yet implemented.
See: https://github.com/cockroachdb/cockroach/issues/46414
~~~

[#46414](https://github.com/cockroachdb/cockroach/issues/46414)

#### `CANCEL JOB` limitations

{% include {{ page.version.version }}/known-limitations/cancel-job-limitations.md %}

#### SQL cursor support

{% include {{page.version.version}}/known-limitations/sql-cursors.md %}

#### Materialized views inside transactions

{% include {{page.version.version}}/known-limitations/cannot-refresh-materialized-views-inside-transactions.md %}

### Schemas and indexes

#### Vector index limitations

{% include {{ page.version.version }}/known-limitations/vector-limitations.md %}

#### Online schema change limitations

{% include {{ page.version.version }}/known-limitations/online-schema-changes-limitations.md %}

#### Adding a column with sequence-based `DEFAULT` values

It is currently not possible to [add a column]({% link {{ page.version.version }}/alter-table.md %}#add-column) to a table when the column uses a [sequence]({% link {{ page.version.version }}/create-sequence.md %}) as the [`DEFAULT`]({% link {{ page.version.version }}/default-value.md %}) value, for example:

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
ERROR: failed to construct index entries during backfill: nextval(): unimplemented: cannot evaluate scalar expressions containing sequence operations in this context
SQLSTATE: 0A000
HINT: You have attempted to use a feature that is not yet implemented.
See: https://go.crdb.dev/issue-v/42508/v24.2
~~~

[#42508](https://github.com/cockroachdb/cockroach/issues/42508)

#### Dropping a column referenced by a partial index

{% include {{ page.version.version }}/known-limitations/drop-column-partial-index.md %}

#### Schema change DDL statements inside a multi-statement transaction can fail while other statements succeed

{% include {{ page.version.version }}/known-limitations/schema-change-ddl-inside-multi-statement-transactions.md %}

#### Schema changes between executions of prepared statements

{% include {{ page.version.version }}/known-limitations/schema-changes-between-prepared-statements.md %}

#### New values generated by `DEFAULT` expressions during `ALTER TABLE ADD COLUMN`

When executing an [`ALTER TABLE ADD COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#add-column) statement with a [`DEFAULT`]({% link {{ page.version.version }}/default-value.md %}) expression, new values generated:

- use the default [search path]({% link {{ page.version.version }}/sql-name-resolution.md %}#search-path) regardless of the search path configured in the current session via `SET SEARCH_PATH`.
- use the UTC time zone regardless of the time zone configured in the current session via [`SET TIME ZONE`]({% link {{ page.version.version }}/set-vars.md %}).
- have no default database regardless of the default database configured in the current session via [`SET DATABASE`]({% link {{ page.version.version }}/set-vars.md %}), so you must specify the database of any tables they reference.
- use the transaction timestamp for the `statement_timestamp()` function regardless of the time at which the `ALTER` statement was issued.

#### Some column-dropping schema changes do not roll back properly

Some [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}) that [drop columns]({% link {{ page.version.version }}/alter-table.md %}#drop-column) cannot be [rolled back]({% link {{ page.version.version }}/rollback-transaction.md %}) properly.

In some cases, the rollback will succeed, but the column data might be partially or totally missing, or stale due to the asynchronous nature of the schema change. [#46541](https://github.com/cockroachdb/cockroach/issues/46541)

In other cases, the rollback will fail in such a way that will never be cleaned up properly, leaving the table descriptor in a state where no other schema changes can be run successfully. [#47712](https://github.com/cockroachdb/cockroach/issues/47712)

To reduce the chance that a column drop will roll back incorrectly:

- Perform column drops in transactions separate from other schema changes. This ensures that other schema change failures will not cause the column drop to be rolled back.

- Drop all [constraints]({% link {{ page.version.version }}/constraints.md %}) (including [unique indexes]({% link {{ page.version.version }}/unique.md %})) on the column in a separate transaction, before dropping the column.

- Drop any [default values]({% link {{ page.version.version }}/default-value.md %}) or [computed expressions]({% link {{ page.version.version }}/computed-columns.md %}) on a column before attempting to drop the column. This prevents conflicts between constraints and default/computed values during a column drop rollback.

If you think a rollback of a column-dropping schema change has occurred, check the [jobs table]({% link {{ page.version.version }}/show-jobs.md %}). Schema changes with an error prefaced by `cannot be reverted, manual cleanup may be required` might require manual intervention.

#### `ALTER COLUMN` limitations

{% include {{ page.version.version }}/known-limitations/alter-column-limitations.md %}

#### `CREATE TABLE AS` limitations

{% include {{ page.version.version }}/known-limitations/create-table-as-limitations.md %}

#### Remove a `UNIQUE` index created as part of `CREATE TABLE`

{% include {{ page.version.version }}/known-limitations/drop-unique-index-from-create-table.md %}

#### Max size of a single column family

When creating or updating a row, if the combined size of all values in a single [column family]({% link {{ page.version.version }}/column-families.md %}) exceeds the [max range size]({% link {{ page.version.version }}/configure-replication-zones.md %}#range-max-bytes) for the table, the operation may fail, or cluster performance may suffer.

As a workaround, you can either [manually split a table's columns into multiple column families]({% link {{ page.version.version }}/column-families.md %}#manual-override), or you can [create a table-specific zone configuration]({% link {{ page.version.version }}/configure-replication-zones.md %}#create-a-replication-zone-for-a-table) with an increased max range size.

#### Dropping a single partition

{% include {{ page.version.version }}/known-limitations/drop-single-partition.md %}

#### Placeholders in `PARTITION BY`

{% include {{ page.version.version }}/known-limitations/partitioning-with-placeholders.md %} [#19464](https://github.com/cockroachdb/cockroach/issues/19464)

#### Unsupported trigram syntax

The following PostgreSQL syntax and features are currently unsupported for [trigrams]({% link {{ page.version.version }}/trigram-indexes.md %}):

{% include {{ page.version.version }}/known-limitations/trigram-unsupported-syntax.md %}

#### Unsupported full-text search features

The following PostgreSQL syntax and features are currently unsupported for [full-text search]({% link {{ page.version.version }}/full-text-search.md %}):

{% include {{ page.version.version }}/known-limitations/full-text-search-unsupported.md %}

#### CockroachDB does not allow inverted indexes with `STORING`

CockroachDB does not allow inverted indexes with a [`STORING` column]({% link {{ page.version.version }}/create-index.md %}#store-columns). [#88278](https://github.com/cockroachdb/cockroach/issues/88278)

#### Multiple arbiter indexes for `INSERT ON CONFLICT DO UPDATE`

{% include {{ page.version.version }}/known-limitations/multiple-arbiter-indexes.md %}

#### Expression index limitations

{% include {{ page.version.version }}/known-limitations/expression-index-limitations.md %}

### Data types

#### `CITEXT` limitations

{% include {{ page.version.version }}/known-limitations/citext-limitations.md %}

#### Spatial support limitations

CockroachDB supports efficiently storing and querying [spatial data]({% link {{ page.version.version }}/export-spatial-data.md %}), with the following limitations:

- Not all [PostGIS spatial functions](https://postgis.net/docs/reference.html) are supported. [#49203](https://github.com/cockroachdb/cockroach/issues/49203)

- The `AddGeometryColumn` [spatial function]({% link {{ page.version.version }}/functions-and-operators.md %}#spatial-functions) only allows constant arguments. [#49402](https://github.com/cockroachdb/cockroach/issues/49402)

- The `AddGeometryColumn` spatial function only allows the `true` value for its `use_typmod` parameter. [#49448](https://github.com/cockroachdb/cockroach/issues/49448)

- CockroachDB does not support the `@` operator. Instead of using `@` in spatial expressions, we recommend using the inverse, with `~`. For example, instead of `a @ b`, use `b ~ a`. [#56124](https://github.com/cockroachdb/cockroach/issues/56124)

- CockroachDB does not yet support [`INSERT`]({% link {{ page.version.version }}/insert.md %})s into the [`spatial_ref_sys` table]({% link {{ page.version.version }}/architecture/glossary.md %}#spatial-system-tables). This limitation also blocks the [`ogr2ogr -f PostgreSQL` file conversion command](https://gdal.org/programs/ogr2ogr.html#cmdoption-ogr2ogr-f). [#55903](https://github.com/cockroachdb/cockroach/issues/55903)

- CockroachDB does not yet support [k-nearest neighbors](https://wikipedia.org/wiki/K-nearest_neighbors_algorithm). [#55227](https://github.com/cockroachdb/cockroach/issues/55227)

- CockroachDB does not support using [schema name prefixes]({% link {{ page.version.version }}/sql-name-resolution.md %}#how-name-resolution-works) to refer to [data types]({% link {{ page.version.version }}/data-types.md %}) with type modifiers (e.g., `public.geometry(linestring, 4326)`). Instead, use fully-unqualified names to refer to data types with type modifiers (e.g., `geometry(linestring,4326)`). [#56492](https://github.com/cockroachdb/cockroach/issues/56492)

- {% include {{ page.version.version }}/known-limitations/srid-4326-limitations.md %}

- {% include {{ page.version.version }}/known-limitations/geospatial-heterogeneous-architectures.md %}

#### `OID` limitations

Refer to [`OID` best practices]({% link {{ page.version.version }}/oid.md %}#best-practices).

#### Limitations for composite types

- {% include {{page.version.version}}/cdc/types-udt-composite-general.md %} The following limitations apply:
    - {% include {{page.version.version}}/cdc/avro-udt-composite.md %}
    - {% include {{page.version.version}}/cdc/csv-udt-composite.md %}

- Updating subfields of composite types using dot syntax results in a syntax error. [#102984](https://github.com/cockroachdb/cockroach/issues/102984)

- Tuple elements cannot be accessed without enclosing the [composite variable]({% link {{ page.version.version }}/create-type.md %}#create-a-composite-data-type) name in parentheses. For example, `(OLD).column` and `(NEW).column` when used in [triggers]({% link {{ page.version.version }}/triggers.md %}). [#114687](https://github.com/cockroachdb/cockroach/issues/114687)

#### `ALTER TYPE` limitations

{% include {{ page.version.version }}/known-limitations/alter-type-limitations.md %}

#### `JSONB` limitations

{% include {{ page.version.version }}/known-limitations/jsonb-limitations.md %}

### Security and privileges

#### Row-level security

- {% include {{ page.version.version }}/known-limitations/rls-values-on-conflict-do-nothing.md %}
- {% include {{ page.version.version }}/known-limitations/rls-update-set-where-returning.md %}

#### `GRANT`/`REVOKE` limitations

{% include {{ page.version.version }}/known-limitations/grant-revoke-schema-changes.md %}

#### `DROP OWNED BY` limitations

{% include {{page.version.version}}/known-limitations/drop-owned-by-limitations.md %}

#### Privileges for `DELETE` and `UPDATE`

Every [`DELETE`]({% link {{ page.version.version }}/delete.md %}) or [`UPDATE`]({% link {{ page.version.version }}/update.md %}) statement constructs a `SELECT` statement, even when no `WHERE` clause is involved. As a result, the user executing `DELETE` or `UPDATE` requires both the `DELETE` and `SELECT` or `UPDATE` and `SELECT` [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the table.

### Deployment and operations

#### Admission control

{% include {{ page.version.version }}/known-limitations/admission-control-limitations.md %}

#### Data domiciling

{% include {{ page.version.version }}/known-limitations/data-domiciling-limitations.md %}

#### DistSQL

{% include {{ page.version.version }}/known-limitations/distsql-heterogeneous-endianness.md %}

#### CockroachDB does not test for all connection failure scenarios

CockroachDB servers rely on the network to report when a TCP connection fails. In most scenarios when a connection fails, the network immediately reports a connection failure, resulting in a `Connection refused` error.

However, if there is no host at the target IP address, or if a firewall rule blocks traffic to the target address and port, a TCP handshake can linger while the client network stack waits for a TCP packet in response to network requests. To work around this kind of scenario, we recommend the following:

- When migrating a node to a new machine, keep the server listening at the previous IP address until the cluster has completed the migration.
- Configure any active network firewalls to allow node-to-node traffic.
- Verify that orchestration tools (e.g., Kubernetes) are configured to use the correct network connection information.

[#53410](https://github.com/cockroachdb/cockroach/issues/53410)

#### No guaranteed state switch from `DECOMMISSIONING` to `DECOMMISSIONED` if `node decommission` is interrupted

There is no guaranteed state switch from `DECOMMISSIONING` to `DECOMMISSIONED` if [`node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) is interrupted in one of the following ways:

- The `cockroach node decommission --wait-all` command was run and then interrupted
- The `cockroach node decommission --wait=none` command was run

This is because the state flip is effected by the CLI program at the end. Only the CLI (or its underlying API call) is able to finalize the "decommissioned" state. If the command is interrupted, or `--wait=none` is used, the state will only flip to "decommissioned" when the CLI program is run again after decommissioning has done all its work. [#94430](https://github.com/cockroachdb/cockroach/issues/94430)

#### Simultaneous client connections and running queries on a single node

When a node has both a high number of client connections and running queries, the node may crash due to memory exhaustion. This is due to CockroachDB not accurately limiting the number of clients and queries based on the amount of available RAM on the node.

To prevent memory exhaustion, monitor each node's memory usage and ensure there is some margin between maximum CockroachDB memory usage and available system RAM. For more details about memory usage in CockroachDB, see [this blog post](https://www.cockroachlabs.com/blog/memory-usage-cockroachdb/).

{% include {{page.version.version}}/sql/server-side-connection-limit.md %} This may be useful in addition to your memory monitoring.

#### Load-based lease rebalancing in uneven latency deployments

When nodes are started with the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#flags) flag, CockroachDB attempts to place the replica lease holder (the replica that client requests are forwarded to) on the node closest to the source of the request. This means as client requests move geographically, so too does the replica lease holder.

However, you might see increased latency caused by a consistently high rate of lease transfers between datacenters in the following case:

- Your cluster runs in datacenters which are very different distances away from each other.
- Each node was started with a single tier of `--locality`, e.g., `--locality=datacenter=a`.
- Most client requests get sent to a single datacenter because that's where all your application traffic is.

To detect if this is happening, open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), select the **Queues** dashboard, hover over the **Replication Queue** graph, and check the **Leases Transferred / second** data point. If the value is consistently larger than 0, you should consider stopping and restarting each node with additional tiers of locality to improve request latency.

For example, let's say that latency is 10ms from nodes in datacenter A to nodes in datacenter B but is 100ms from nodes in datacenter A to nodes in datacenter C. To ensure A's and B's relative proximity is factored into lease holder rebalancing, you could restart the nodes in datacenter A and B with a common region, `--locality=region=foo,datacenter=a` and `--locality=region=foo,datacenter=b`, while restarting nodes in datacenter C with a different region, `--locality=region=bar,datacenter=c`.

#### Size limits on statement input from SQL clients

CockroachDB imposes a hard limit of 16MiB on the data input for a single statement passed to CockroachDB from a client (including the SQL shell). We do not recommend attempting to execute statements from clients with large input.

#### Using `\|` to perform a large input in the SQL shell

In the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}), using the [`\|`]({% link {{ page.version.version }}/cockroach-sql.md %}#commands) operator to perform a large number of inputs from a file can cause the server to close the connection. This is because `\|` sends the entire file as a single query to the server, which can exceed the upper bound on the size of a packet the server can accept from any client (16MB).

As a workaround, [execute the file from the command line]({% link {{ page.version.version }}/cockroach-sql.md %}#execute-sql-statements-from-a-file) with `cat data.sql | cockroach sql` instead of from within the interactive shell.

#### Spatial features disabled for ARM Macs

[Spatial features]({% link {{ page.version.version }}/spatial-data-overview.md %}) are disabled due to an issue with macOS code signing for the [GEOS](https://libgeos.org/) libraries. Users needing spatial features on an ARM Mac may instead [use Rosetta](https://developer.apple.com/documentation/virtualization/running_intel_binaries_in_linux_vms_with_rosetta) to [run the Intel binary]({% link {{ page.version.version }}/install-cockroachdb-mac.md %}#install-binary) or use the [Docker image]({% link {{ page.version.version }}/install-cockroachdb-mac.md %}#use-docker) distribution. [GitHub tracking issue](https://github.com/cockroachdb/cockroach/issues/93161)

#### Logging system limitations

{% include {{ page.version.version }}/known-limitations/logging-limitations.md %}

#### Per-replica circuit breaker limitations

{% include {{ page.version.version }}/known-limitations/per-replica-circuit-breaker-limitations.md %}

#### Kubernetes limitations

Refer to [Kubernetes best practices]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %}#best-practices).

### Observability

#### Datadog

{% include {{ page.version.version }}/known-limitations/datadog-self-hosted-limitations.md %}

#### DB Console may become inaccessible for secure clusters

Accessing the DB Console for a secure cluster now requires login information (i.e., username and password). This login information is stored in a system table that is replicated like other data in the cluster. If a majority of the nodes with the replicas of the system table data go down, users will be locked out of the DB Console.

#### Available capacity metric in the DB Console

{% include {{ page.version.version }}/misc/available-capacity-metric.md %}

### Disaster recovery

#### Physical cluster replication

{% include {{ page.version.version }}/known-limitations/physical-cluster-replication.md %}
- {% include {{ page.version.version }}/known-limitations/failover-stop-application.md %}

#### `RESTORE` limitations

- {% include {{ page.version.version }}/known-limitations/restore-udf.md %}
- {% include {{ page.version.version }}/known-limitations/restore-tables-non-multi-reg.md %}
- {% include {{ page.version.version }}/known-limitations/restore-multiregion-match.md %}

#### Enterprise `BACKUP` does not capture database/table/column comments

The [`COMMENT ON`]({% link {{ page.version.version }}/comment-on.md %}) statement associates comments to databases, tables, or columns. However, the internal table (`system.comments`) in which these comments are stored is not captured by a [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) of a table or database.

As a workaround, take a cluster backup instead, as the `system.comments` table is included in cluster backups. [#44396](https://github.com/cockroachdb/cockroach/issues/44396)

#### `SHOW BACKUP` does not support symlinks for nodelocal

{% include {{page.version.version}}/known-limitations/show-backup-symlink.md %}

### High Availability

#### Logical data replication (LDR)

- {% include {{ page.version.version }}/known-limitations/ldr-triggers.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-udfs.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-sequences.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-indexes.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-column-families.md %}
- {% include {{ page.version.version }}/known-limitations/ldr-composite-primary.md %}

### Change data capture

Change data capture (CDC) provides efficient, distributed, row-level changefeeds into Apache Kafka for downstream processing such as reporting, caching, or full-text indexing. It has the following known limitations:

{% include {{ page.version.version }}/known-limitations/cdc.md %}
{% include {{ page.version.version }}/known-limitations/cdc-queries.md %}
- {% include {{ page.version.version }}/known-limitations/cdc-queries-column-families.md %}
- {% include {{ page.version.version }}/known-limitations/changefeed-column-family-message.md %}

#### `ALTER CHANGEFEED` limitations

{% include {{ page.version.version }}/known-limitations/alter-changefeed-limitations.md %}
- {% include {{ page.version.version }}/known-limitations/alter-changefeed-cdc-queries.md %}

### Performance optimization

#### Generic query plan limitations

{% include {{ page.version.version }}/known-limitations/generic-query-plan-limitations.md %}

#### Optimizer and locking behavior

The SQL optimizer has limitations under certain isolation levels:

- The new implementation of `SELECT FOR UPDATE` is not yet the default setting under `SERIALIZABLE` isolation. It can be used under `SERIALIZABLE` isolation by setting the `optimizer_use_lock_op_for_serializable` [session setting]({% link {{ page.version.version }}/session-variables.md %}) to `true`. [#114737](https://github.com/cockroachdb/cockroach/issues/114737)
- `SELECT FOR UPDATE` does not lock completely-`NULL` column families in multi-column-family tables. [#116836](https://github.com/cockroachdb/cockroach/issues/116836)

#### Statistics limitations

{% include {{page.version.version}}/known-limitations/stats-refresh-upgrade.md %}
{% include {{ page.version.version }}/known-limitations/forecasted-stats-limitations.md %}

#### Incorrect query plans for partitions with `NULL` values

In cases where the partition definition includes a comparison with `NULL` and a query constraint, incorrect query plans are returned. However, this case uses non-standard partitioning which defines partitions which could never hold values, so it is not likely to occur in production environments. [#82774](https://github.com/cockroachdb/cockroach/issues/82774)

#### Vectorized engine limitations

{% include {{ page.version.version }}/known-limitations/vectorized-engine-limitations.md %}

#### `transaction_rows_read_err` and `transaction_rows_written_err` do not halt query execution

The `transaction_rows_read_err` and `transaction_rows_written_err` [session settings]({% link {{ page.version.version }}/set-vars.md %}) limit the number of rows read or written by a single [transaction]({% link {{ page.version.version }}/transactions.md %}#limit-the-number-of-rows-written-or-read-in-a-transaction). These session settings will fail the transaction with an error, but not until the current query finishes executing and the results have been returned to the client. [#70473](https://github.com/cockroachdb/cockroach/issues/70473)

#### `sql.guardrails.max_row_size_err` misses indexed virtual computed columns

The `sql.guardrails.max_row_size_err` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) misses large rows caused by indexed virtual computed columns. This is because the guardrail only checks the size of primary key rows, not secondary index rows. [#69540](https://github.com/cockroachdb/cockroach/issues/69540)

#### Using `LIKE...ESCAPE` in `WHERE` and `HAVING` constraints

CockroachDB tries to optimize most comparisons operators in `WHERE` and `HAVING` clauses into constraints on SQL indexes by only accessing selected rows. This is done for `LIKE` clauses when a common prefix for all selected rows can be determined in the search pattern (e.g., `... LIKE 'Joe%'`). However, this optimization is not yet available if the `ESCAPE` keyword is also used. [#30192](https://github.com/cockroachdb/cockroach/issues/30192)

#### Import with a high amount of disk contention

{% include {{ page.version.version }}/known-limitations/import-high-disk-contention.md %}

#### CockroachDB does not properly optimize some left and anti joins with GIN indexes

[Left joins]({% link {{ page.version.version }}/joins.md %}#left-outer-joins) and anti joins involving [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}), [`ARRAY`]({% link {{ page.version.version }}/array.md %}), or [spatial-typed]({% link {{ page.version.version }}/export-spatial-data.md %}) columns with a multi-column or [partitioned]({% link {{ page.version.version }}/alter-index.md %}#partition-by) [GIN index](inverted-indexes.html) will not take advantage of the index if the prefix columns of the index are unconstrained, or if they are constrained to multiple, constant values.

To work around this limitation, make sure that the prefix columns of the index are either constrained to single constant values, or are part of an equality condition with an input column (e.g., `col1 = col2`, where `col1` is a prefix column and `col2` is an input column).

For example, suppose you have the following [multi-region database]({% link {{ page.version.version }}/multiregion-overview.md %}) and tables:

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

And you [insert]({% link {{ page.version.version }}/insert.md %}) some data into the tables:

``` sql
INSERT INTO t1 SELECT generate_series(1, 1000), 'POINT(1.0 1.0)';
INSERT INTO t2 (crdb_region, k, geom) SELECT 'us-east1', generate_series(1, 1000), 'POINT(1.0 1.0)';
INSERT INTO t2 (crdb_region, k, geom) SELECT 'us-west1', generate_series(1001, 2000), 'POINT(2.0 2.0)';
INSERT INTO t2 (crdb_region, k, geom) SELECT 'europe-west1', generate_series(2001, 3000), 'POINT(3.0 3.0)';
```

If you attempt a left join between `t1` and `t2` on only the geometry columns, CockroachDB will not be able to plan an [inverted join]({% link {{ page.version.version }}/joins.md %}#inverted-joins):

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

If you do not know which region to use, you can combine queries with [`UNION ALL`]({% link {{ page.version.version }}/selection-queries.md %}#union-combine-two-queries):

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

[#59649](https://github.com/cockroachdb/cockroach/issues/59649)

#### Locality optimized search limitations

{% include {{page.version.version}}/known-limitations/locality-optimized-search-virtual-computed-columns.md %}
{% include {{ page.version.version }}/known-limitations/locality-optimized-search-limited-records.md %}

#### Query plans for materialized views

{% include {{page.version.version}}/known-limitations/materialized-views-no-stats.md %}

#### Inverted join for `tsvector` and `tsquery` types is not supported

CockroachDB cannot index-accelerate queries with `@@` predicates when both sides of the operator are variables. [#102731](https://github.com/cockroachdb/cockroach/issues/102731)

#### `LIKE` operator with `ESCAPE` clause

{% include {{ page.version.version }}/known-limitations/like-escape-performance.md %}