---
title: CREATE LOGICALLY REPLICATED
summary: The CREATE LOGICALLY REPLICATED statement starts a new unidirectional or bidirectional LDR stream with a fast, offline scan.
toc: true
---

{{site.data.alerts.callout_info}}
Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

The `CREATE LOGICALLY REPLICATED` statement starts [**logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) on a table(s) that runs between a source and destination cluster in an active-active setup. `CREATE LOGICALLY REPLICATED` creates the new table on the destination cluster automatically and conducts a fast, offline initial scan. It accepts [`unidirectional`](#unidirectional) or [`bidirectional on`](#bidirectional) as an option to create either one of the setups automatically. 

Once the offline initial scan completes, the new table will come online and is ready to serve queries. In a [bidirectional]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#use-cases) setup, the second LDR stream will also initialize after the offline initial scan completes.

{{site.data.alerts.callout_danger}}
If the table to be replicated contains [user-defined types]({% link {{ page.version.version }}/enum.md %}), you must use the [`CREATE LOGICAL REPLICATION STREAM`]({% link {{ page.version.version }}/create-logical-replication-stream.md %}) statement instead. You can set up unidirectional or bidirectional LDR manually with `CREATE LOGICAL REPLICATION STREAM`. 
{{site.data.alerts.end}}

This page is a reference for the `CREATE LOGICALLY REPLICATED` SQL statement, which includes information on its parameters and options. For a step-by-step guide to set up LDR, refer to the [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}) page.

## Required privileges

Users need the following privileges to create an LDR stream with `CREATE LOGICALLY REPLICATED`:

- **Source connection string user:** Needs the `REPLICATIONSOURCE` privilege on the source table(s). This is the user specified in the [source connection string]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}#step-2-connect-from-the-destination-to-the-source) in unidirectional or bidirectional streams.
- **User starting the LDR stream on the destination:** Must have `CREATE` on the destination database **and** be the same user that is specified in the destination connection string for a bidirectional stream. The destination table will be created and the user given the `REPLICATIONDEST` privilege on the new table automatically.
- **For reverse (bidirectional) setup:** The original source user must have `REPLICATIONDEST` on the tables in the original source cluster.

LDR from cluster A to B represents a _unidirectional_ setup from a source to a destination cluster. LDR from cluster B to A is the reverse stream for a _bidirectional_ setup:

Replication direction | Cluster | User role | Required privileges
----------------------+---------+-----------+-------------------
A ➔ B | A | User in source connection string. | `REPLICATIONSOURCE` on A's tables.
A ➔ B | B | User running `CREATE LOGICALLY REPLICATED` from the destination cluster. The destination table will be created and the user given the `REPLICATIONDEST` privilege on the new table automatically.<br>**Note:** Must match the user in the destination connection string for bidirectional LDR. | `CREATE` on B's parent database.
Reverse replication requirement | A | Original source connection string user. | `REPLICATIONDEST` on A's tables.

For example, the user `maxroach` will run the following statement to start LDR on the destination cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICALLY REPLICATED TABLE B.table FROM TABLE A.table ON 'A_connection_string/user=samroach' WITH BIDIRECTIONAL ON 'B_connection_string/user=maxroach;
~~~

To start LDR successfully with this statement:

- `maxroach` requires `CREATE` on database B, implicitly gets `REPLICATIONDEST` and `REPLICATIONSOURCE` on `B.table`.
- `samroach` requires `REPLICATIONSOURCE` and `REPLICATIONDEST` on `A.table`.
- `maxroach` must be the user in the `BIDIRECTIONAL ON` connection string.

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
{% include {{ page.version.version }}/ldr/create_logically_replicated_stmt.html %}
</div>

### Parameters

Parameter | Description
----------+------------
`db_object_name` | The [fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) name of the table on the source or destination cluster. Refer to [Examples](#examples).
`logical_replication_resources_list` | A list of the [fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) table names on the source or destination cluster to include in the LDR stream. Refer to the [LDR with multiple tables](#multiple-tables) example.
`source_connection_string` | The connection string to the source cluster. Use an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) to store the source cluster's connection URI. To start LDR, run `CREATE LOGICALLY REPLICATED` from the destination cluster.
`logical_replication_create_table_options` | Options to modify the behavior of the LDR stream. For a list, refer to [Options](#options). **Note:** `bidirectional on` or `unidirectional`is a required option. For use cases of unidirectional and bidirectional LDR, refer to the [Logical Data Replication Overview]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#use-cases) page. 

## Options

Option | Description
-------+------------
`bidirectional on` / `unidirectional` | (**Required**) Specifies whether the LDR stream will be unidirectional or bidirectional. With `bidirectional on` specified, LDR will set up two LDR streams between the clusters. Refer to the examples for [unidirectional](#unidirectional) and [bidirectional](#bidirectional).
`label` | Tracks LDR metrics at the job level. Add a user-specified string with `label`. For more details, refer to [Metrics labels]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}#metrics-labels).

## Examples

`CREATE LOGICALLY REPLICATED` will automatically create the specified source tables on the destination cluster. For unidirectional and bidirectional, run the statement to start LDR on the destination cluster that does not contain the tables.

### Unidirectional

From the destination cluster of the LDR stream, run:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICALLY REPLICATED TABLE {database.public.destination_table_name} FROM TABLE {database.public.source_table_name} ON 'external://source' WITH unidirectional;
~~~

Include the following: 

- [Fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) destination table name.
- [Fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) source table name.
- [External connection]({% link {{ page.version.version }}/create-external-connection.md %}) for the source cluster. For instructions on creating the external connection for LDR, refer to [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}#step-2-connect-from-the-destination-to-the-source).
- `unidirectional` option.
- Any other [options](#options).

{% include {{ page.version.version }}/ldr/note-manage-ldr.md %}

### Bidirectional

Both clusters will act as a source and destination in bidirectional LDR setups. To start the LDR jobs, you must run this statement from the destination cluster that does not contain the tables:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICALLY REPLICATED TABLE {database.public.destination_table_name} FROM TABLE {database.public.source_table_name} ON 'external://source' WITH bidirectional ON 'external://destination';
~~~

Include the following: 

- [Fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) destination table name.
- [Fully qualified]({% link {{ page.version.version }}/sql-name-resolution.md %}) source table name.
- [External connection]({% link {{ page.version.version }}/create-external-connection.md %}) for the source cluster. For instructions on creating the external connection for LDR, refer to [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}#step-2-connect-from-the-destination-to-the-source).
- `bidirectional on` option defining the external connection for the destination cluster. 
- Any other [options](#options).

{% include {{ page.version.version }}/ldr/note-manage-ldr.md %}

### Multiple tables

To include multiple tables in an LDR stream, add the fully qualified table names in a list format. Ensure that the table name in the source table list and destination table list are in the same order:

~~~ sql
CREATE LOGICALLY REPLICATED TABLES ({database.public.destination_table_name_1}, {database.public.destination_table_name_2}) FROM TABLES ({database.public.source_table_name_1}, {database.public.source_table_name_2}) ON 'external://source' WITH bidirectional ON 'external://destination';
~~~

{% include {{ page.version.version }}/ldr/note-manage-ldr.md %}

## See more

- [`SHOW LOGICAL REPLICATION JOBS`]({% link {{ page.version.version }}/show-logical-replication-jobs.md %})