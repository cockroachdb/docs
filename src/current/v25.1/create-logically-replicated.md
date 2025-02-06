---
title: CREATE LOGICALLY REPLICATED
summary: The CREATE LOGICALLY REPLICATED statement starts a new unidirectional or bidirectional LDR stream with a fast, offline scan.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v25.1" %} The `CREATE LOGICALLY REPLICATED` statement starts [**logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) on a table(s) that runs between a source and destination cluster in an active-active setup. `CREATE LOGICALLY REPLICATED` creates the new table on the destination cluster automatically and conduct a fast, offline initial scan. It accepts `unidirectional` or `bidirectional` as an option in order to create either one of the setups automatically. 

Once the offline initial scan completes, the new table will come online and is ready to serve queries. In a bidirectional setup, the second LDR stream will also initialize after the offline initial scan completes.

{{site.data.alerts.callout_danger}}
If the table to be replicated contains user-define types or foreign key dependencies, you must use the [`CREATE LOGICAL REPLICATION STREAM`]({% link {{ page.version.version }}/create-logical-replication-stream.md %}) statement instead. 
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
`db_object_name` | The fully qualified name of the table on the source or destination cluster. Refer to [Examples](#examples).
`logical_replication_resources_list` | A list of the fully qualified table names on the source or destination cluster to include in the LDR stream. Refer to the [LDR with multiple tables](#multiple-tables) example.
`source_connection_string` | The connection string to the source cluster. Use an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) to store the source cluster's connection URI. To start LDR, you run `CREATE LOGICAL REPLICATION STREAM` from the destination cluster.
`logical_replication_options` | Options to modify the behavior of the LDR stream.

## Options

Option | Description
-------+------------
`bidirectional` / `unidirectional` | (**Required**) 
`label` | Tracks LDR metrics at the job level. Add a user-specified string with `label`. For more details, refer to [Metrics labels]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}#metrics-labels).
`mode` | Determines how LDR replicates the data to the destination cluster. Possible values: `immediate`, `validated`. For more details, refer to [LDR modes](#ldr-modes).

## LDR modes

_Modes_ determine how LDR replicates the data to the destination cluster. There are two modes:

- `immediate` (default): {% include {{ page.version.version }}/ldr/immediate-description.md %}
- `validated`: {% include {{ page.version.version }}/ldr/validated-description.md %}

## Examples

### Unidirectional

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICALLY REPLICATED TABLE {database.public.destination_table_name} FROM TABLE {database.public.source_table_name} ON 'external://source' WITH unidirectional, mode=validated;
~~~

### Bidirectional

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICALLY REPLICATED TABLE {database.public.destination_table_name} FROM TABLE {database.public.source_table_name} ON 'external://source' WITH bidirectional ON 'external://destination', label=track_job;
~~~

## See more