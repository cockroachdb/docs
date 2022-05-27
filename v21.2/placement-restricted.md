---
title: ALTER DATABASE ... PLACEMENT (RESTRICTED | DEFAULT)
summary: The ALTER DATABASE ... PLACEMENT (RESTRICTED | DEFAULT) statement constrains replica placement to a REGIONAL table's home region.
toc: true
docs_area: reference.sql
---

{% include_cached new-in.html version="v21.2" %} The `ALTER DATABASE ... PLACEMENT RESTRICTED` [statement](sql-statements.html) is used to constrain the replica placement for a [multi-region database](multiregion-overview.html)'s [regional tables](regional-tables.html) to the [home regions](set-locality.html#crdb_region) associated with those tables. [Regional tables](regional-tables.html) are those with [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) or [`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables) localities. `ALTER DATABASE ... PLACEMENT RESTRICTED` is a way of opting out of [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) for [regional tables](regional-tables.html) to accomplish one or more of the following goals:

- Implement a [data domiciling](data-domiciling.html) strategy.
- Reduce the amount of data stored on the cluster.
- Reduce the overhead of replicating data across a large number of regions (e.g., 10 or more) for databases with heavier write loads.

Note that this statement does not allow you to opt out of placing [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) entirely. For example, [`GLOBAL` tables](global-tables.html) in the database will remain unaffected by this statement. `GLOBAL` tables are designed to have replicas placed across all available [cluster regions](multiregion-overview.html#cluster-regions) to ensure fast local reads.

{{site.data.alerts.callout_info}}
This is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

## Synopsis

```
ALTER DATABASE {database_name} PLACEMENT {placement_policy}
```

## Parameters

| Parameter          | Description                                                                                                                           |
|--------------------+---------------------------------------------------------------------------------------------------------------------------------------|
| `database_name`    | The database whose replica placement you want to constrain to its [home region](set-locality.html#crdb_region).                       |
| `placement_policy` | The replica placement policy that will be used for [regional tables](regional-tables.html). For more information, see the list below. |

The replica placement policies available via this statement are:

- `DEFAULT` (**Default**): <a name="parameters-default"></a> If the replica placement policy [is set to 'default'](#set-the-replica-placement-policy-to-default), CockroachDB will use its default replica placement settings, which mean that:
  - Data will be placed in as many regions as necessary to ensure your [database survival goals](multiregion-overview.html#survival-goals) are met.
  - You can get fast stale reads from all [database regions](multiregion-overview.html#database-regions).

- `RESTRICTED`: <a name="parameters-restricted"></a> If the replica placement policy [is set to 'restricted'](#set-the-replica-placement-policy-to-restricted), CockroachDB will constrain replica placement to only those regions where the table has voting replicas (that is, replicas which participate in the [Raft quorum](architecture/replication-layer.html#raft)). In practice, this means that voting replicas for the table will be constrained to the table's [home region](set-locality.html#crdb_region). Specifically, for [`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables) tables, it will only place replicas in the defined region (or the database's [primary region](set-primary-region.html)); for [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) tables, it will only place replicas for each underlying [partition](partitioning.html) in the partition's specified region. Finally, note that:
    - Regional tables with this placement setting will no longer provide "fast stale reads" from other (non-home) regions, since fast stale reads rely on the presence of non-voting replicas.
    - The `RESTRICTED` replica placement policy is only available for databases with the [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures).
    - This setting does not affect how [`GLOBAL` tables](global-tables.html) work; they will still place replicas in all [database regions](multiregion-overview.html#database-regions).

## Required privileges

To use this statement, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#roles) role for the cluster.
- [Ownership](security-reference/authorization.html#object-ownership) or the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) for the database and all tables in the database.

## Examples

To follow along with the examples below:

1. Start a [demo cluster](cockroach-demo.html) with the [`--global` flag](cockroach-demo.html#general) to simulate a multi-region cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach demo --global --nodes 9
    ~~~

2. Set the demo cluster's [database regions](multiregion-overview.html#database-regions) and [table localities](multiregion-overview.html#table-locality) as described in [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html) (specifically, starting at [Step 5. Execute multi-region SQL statements](demo-low-latency-multi-region-deployment.html#step-5-execute-multi-region-sql-statements)).

3. Enable the replica placement syntax with either the [session variable](set-vars.html) or the [cluster setting](cluster-settings.html) as shown below.

    1. To use the session variable:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        SET enable_multiregion_placement_policy = on;
        ~~~

    2. To use the cluster setting:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        SET CLUSTER SETTING sql.defaults.multiregion_placement_policy.enabled = on;
        ~~~

### Create a database with the replica placement policy set to restricted

If you know at database creation time that you'd like to set the database's replica placement policy to ["restricted"](#parameters-restricted), you can do so in a [`CREATE DATABASE`](create-database.html) statement as shown below:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE movr2 PRIMARY REGION "us-east1" REGIONS "us-west1", "europe-west1" PLACEMENT RESTRICTED;
~~~

~~~
CREATE DATABASE
~~~

### Set the replica placement policy to restricted

When you set the database's placement policy to ["restricted"](#parameters-restricted), you are saying that you want the underlying data to be restricted to the table or partition's [home region](set-locality.html#crdb_region).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PLACEMENT RESTRICTED;
~~~

~~~
ALTER DATABASE PLACEMENT
~~~

### Set the replica placement policy to default

If previously you set the replica placement policy to ["restricted"](#set-the-replica-placement-policy-to-restricted), you can set it back to [the default](#parameters-default) by issuing the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PLACEMENT DEFAULT;
~~~

~~~
ALTER DATABASE PLACEMENT
~~~

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [`ALTER DATABASE`](alter-database.html)
- [`ADD REGION`](add-region.html)
- [Ranges](architecture/overview.html#architecture-range)
- [Non-voting replicas](architecture/replication-layer.html#non-voting-replicas)
- [SQL Statements](sql-statements.html)
- [Data Domiciling with CockroachDB](data-domiciling.html)
