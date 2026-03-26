---
title: CREATE LOGICAL REPLICATION STREAM
summary: The CREATE LOGICAL REPLICATION STREAM statement starts a new LDR stream.
toc: true
---

{{site.data.alerts.callout_info}}
Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

The `CREATE LOGICAL REPLICATION STREAM` statement starts [**logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) that runs between a source and destination cluster in an active-active setup.

This page is a reference for the `CREATE LOGICAL REPLICATION STREAM` SQL statement, which includes information on its parameters and possible options. For a step-by-step guide to set up LDR, refer to the [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}) page.

{{site.data.alerts.callout_success}}
If the table you're replicating does not contain [user-defined types]({% link {{ page.version.version }}/enum.md %}), we recommend using the [`CREATE LOGICALLY REPLICATED`]({% link {{ page.version.version }}/create-logically-replicated.md %}) syntax that provides a fast, offline initial scan and automatic table setup on the destination cluster.
{{site.data.alerts.end}}

## Required privileges

`CREATE LOGICAL REPLICATION STREAM` creates a one-way LDR stream only. To achieve bidirectional replication, you must manually create two separate streams, one in each direction, with the required privileges set on both clusters.

LDR from cluster A to B represents a one-way stream from a source to a destination cluster. LDR from cluster B to A is the reverse stream for a bidirectional setup.

To run the `CREATE LOGICAL REPLICATION STREAM` statement to create an LDR stream, the following privileges are required:

LDR direction | Cluster | User role | Required privilege 
----------------------+---------+-----------+--------------------
A ➔ B | A | User in the LDR connection string. | `REPLICATIONSOURCE`
A ➔ B | B | User running the command. | `REPLICATIONDEST`
B ➔ A | B | User in the LDR connection string. | `REPLICATIONSOURCE`
B ➔ A | A | User running the command. | `REPLICATIONDEST`

Grant the privilege at the table or [system level]({% link {{ page.version.version }}/grant.md %}#grant-system-level-privileges-on-the-entire-cluster) with the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) statement to a [user or a role]({% link {{ page.version.version }}/security-reference/authorization.md %}#users-and-roles):

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT REPLICATIONSOURCE ON TABLE database.public.tablename TO user/role;
~~~

{{site.data.alerts.callout_info}}
As of v25.2, the [`REPLICATION` system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) is **deprecated** and will be removed in a future release. Use `REPLICATIONSOURCE` and `REPLICATIONDEST` for authorization at the table level.
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/ldr/create_logical_replication_stream_stmt.html %}
</div>

### Parameters

Parameter | Description
----------+------------
`db_object_name` | The fully qualified name of the table on the source or destination cluster. Refer to [Examples](#examples).
`logical_replication_resources_list` | A list of the fully qualified table names on the source or destination cluster to include in the LDR stream. Refer to the [LDR with multiple tables](#multiple-tables) example.
`source_connection_string` | The connection string to the source cluster. Use an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) to store the source cluster's connection URI. To start LDR, you run `CREATE LOGICAL REPLICATION STREAM` from the destination cluster.
`logical_replication_options` | Options to modify the behavior of the LDR stream.

## Options

Option | Description
-------+------------
`cursor` | Emits any changes after the specified timestamp. LDR will not perform an initial backfill with the `cursor` option, it will stream any changes after the specified timestamp. The LDR job will encounter an error if you specify a `cursor` timestamp that is before the configured [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) window for that table. **Warning:** Apply the `cursor` option carefully to LDR streams. Using a timestamp in error could cause data loss.
<a id="discard-ttl-deletes-option"></a>`discard` | ([**Unidirectional LDR only**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#use-cases)) Ignore [TTL deletes]({% link {{ page.version.version }}/row-level-ttl.md %}) in an LDR stream with `discard = ttl-deletes`. **Note**: To ignore row-level TTL deletes in an LDR stream, it is necessary to set the [`ttl_disable_changefeed_replication`]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters) storage parameter on the source table. Refer to the [Ignore row-level TTL deletes](#ignore-row-level-ttl-deletes) example.
`label` | Tracks LDR metrics at the job level. Add a user-specified string with `label`. Refer to [Metrics labels]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}#metrics-labels).

## Bidirectional LDR

_Bidirectional_ LDR consists of two clusters with two LDR jobs running in opposite directions between the clusters. If you're setting up [bidirectional LDR]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#use-cases), both clusters will act as a source and a destination in the respective LDR jobs. 

LDR supports starting with two empty tables, or one non-empty table. LDR does **not** support starting with two non-empty tables. When you set up bidirectional LDR, if you're starting with one non-empty table, start the first LDR job from empty to non-empty table. Therefore, you would run `CREATE LOGICAL REPLICATION STREAM` from the destination cluster where the non-empty table exists.

## Examples

To start LDR, you must run the `CREATE LOGICAL REPLICATION STREAM` statement from the **destination** cluster. Use the [fully qualified table name(s)]({% link {{ page.version.version }}/sql-name-resolution.md %}#how-name-resolution-works). The following examples show statement usage with different options and use cases.

### Start an LDR stream

{% include {{ page.version.version }}/ldr/multiple-tables.md %}

#### Single table

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.table_name};
~~~

#### Multiple tables

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICAL REPLICATION STREAM FROM TABLES ({database.public.table_name},{database.public.table_name},...)  ON 'external://{source_external_connection}' INTO TABLES ({database.public.table_name},{database.public.table_name},...);
~~~

### Ignore row-level TTL deletes

If you would like to ignore [row-level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) deletes in a **unidirectional** LDR stream, set the [`ttl_disable_changefeed_replication` storage parameter]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters) on the table. On the **source** cluster, alter the table to set the table storage parameter:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table_name} SET (ttl_disable_changefeed_replication = 'true');
~~~

When you start LDR on the **destination cluster**, include the [`discard = ttl-deletes` option](#discard-ttl-deletes-option) in the statement:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} ON 'external://{source_external_connection}' INTO TABLE {database.public.table_name} WITH discard = ttl-deletes;
~~~

## See also

- [`SHOW LOGICAL REPLICATION JOBS`]({% link {{ page.version.version }}/show-logical-replication-jobs.md %})