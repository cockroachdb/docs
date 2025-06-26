---
title: CREATE LOGICALLY REPLICATED
summary: The CREATE LOGICALLY REPLICATED statement starts a new unidirectional or bidirectional LDR stream with a fast, offline scan.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v25.1" %} The `CREATE LOGICALLY REPLICATED` statement starts [**logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) on a table(s) that runs between a source and destination cluster in an active-active setup. `CREATE LOGICALLY REPLICATED` creates the new table on the destination cluster automatically and conducts a fast, offline initial scan. It accepts [`unidirectional`](#unidirectional) or [`bidirectional on`](#bidirectional) as an option to create either one of the setups automatically. 

Once the offline initial scan completes, the new table will come online and is ready to serve queries. In a [bidirectional]({% link {{ page.version.version }}/logical-data-replication-overview.md %}#use-cases) setup, the second LDR stream will also initialize after the offline initial scan completes.

{{site.data.alerts.callout_danger}}
If the table to be replicated contains [user-defined types]({% link {{ page.version.version }}/enum.md %}), you must use the [`CREATE LOGICAL REPLICATION STREAM`]({% link {{ page.version.version }}/create-logical-replication-stream.md %}) statement instead. You can set up unidirectional or bidirectional LDR manually with `CREATE LOGICAL REPLICATION STREAM`. 
{{site.data.alerts.end}}

This page is a reference for the `CREATE LOGICALLY REPLICATED` SQL statement, which includes information on its parameters and options. For a step-by-step guide to set up LDR, refer to the [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %}) page.

## Required privileges

`CREATE LOGICALLY REPLICATED` requires one of the following privileges:

- The [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).
- The [`REPLICATION` system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges).

Use the [`GRANT SYSTEM`]({% link {{ page.version.version }}/grant.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
GRANT SYSTEM REPLICATION TO user;
~~~

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