---
title: ALTER DATABASE ... PLACEMENT (RESTRICTED | DEFAULT)
summary: The ALTER DATABASE ... PLACEMENT (RESTRICTED | DEFAULT) statement constrains replica placement to a REGIONAL table's home region.
toc: true
---

{{site.data.alerts.callout_info}}
If you do not need to implement a [data domiciling](data-domiciling.html) strategy for a [multi-region cluster](multiregion-overview.html), you can ignore this page.
{{site.data.alerts.end}}

<span class="version-tag">New in v21.2</span>: The `ALTER DATABASE ... PLACEMENT RESTRICTED` [statement](sql-statements.html) is used to constrain the replica placement for a [multiregion database](multiregion-overview.html)'s [regional tables](regional-tables.html) to the [home regions](set-locality.html#crdb_region) associated with those tables. In other words, it keeps [regional table](regional-tables.html) data stored in the [database regions](multiregion-overview.html#database-regions) that provide "fast stale reads" (aka those with [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) and [`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables) tables). It is a way of opting out of [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) for [regional tables](regional-tables.html) as part of a [data domiciling](data-domiciling.html) strategy.

Note that this statement does not allow you to opt out of placing [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) entirely. For example, [`GLOBAL` tables](global-tables.html) in the database will remain unaffected by this statement.  `GLOBAL` tables are designed to have replicas placed across all available [cluster regions](multiregion-overview.html#cluster-regions) to ensure fast local reads.

{{site.data.alerts.callout_info}}
This is a subcommand of [`ALTER DATABASE`](alter-database.html), which results in a [schema change](online-schema-changes.html).
{{site.data.alerts.end}}

## Synopsis

```
ALTER DATABASE {database_name} PLACEMENT {placement_policy}
```

## Parameters

| Parameter          | Description                                                                                                                                   |
|--------------------+-----------------------------------------------------------------------------------------------------------------------------------------------|
| `database_name`    | The database whose replica placement you want to constrain to its [home region](set-locality.html#crdb_region).                               |
| `placement_policy` | Determines which replica placement policy will be used for [regional tables](regional-tables.html). For more information, see the list below. |

The replica placement policies available via this statement are:

- `DEFAULT` (**Default**): If the replica placement policy [is set to 'default'](#set-the-replica-placement-policy-to-default), CockroachDB will use its default replica placement settings, which mean that data will be placed in as many regions as necessary to ensure your [database survival goals](multiregion-overview.html#survival-goals) are met.

- `RESTRICTED`: If the replica placement policy [is set to 'restricted'](#set-the-replica-placement-policy-to-restricted), it will constrain replica placement to only those regions where the table has voting replicas (that is, replicas which participate in the [Raft quorum](architecture/replication-layer.html#raft)). In practice, this means that voting replicas for the table will be constrained to the table's [home region](set-locality.html#crdb_region). This can help you achieve your [data domiciling](data-domiciling.html) strategy in a [multi-region cluster](multiregion-overview.html). Note that the `RESTRICTED` replica placement policy is only available for databases with the [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures).

## Required privileges

To use this statement, the user must have one of the following:

- Membership to the [`admin`](authorization.html#roles) role for the cluster.
- Membership to the [owner](authorization.html#object-ownership) role, or the [`CREATE` privilege](authorization.html#supported-privileges), for the database and all tables in the database.

## Examples

To follow along with the examples below:

1. Start a [demo cluster](cockroach-demo.html) with the [`--global` flag](cockroach-demo.html#general) to simulate a multi-region cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach demo --global --nodes 9
    ~~~

2. Set the demo cluster's [database regions](multiregion-overview.html#database-regions) and [table localities](multiregion-overview.html#table-locality) as described in [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html) (specifically, starting at [Step 5. Execute multi-region SQL statements](demo-low-latency-multi-region-deployment.html#step-5-execute-multi-region-sql-statements)).

3. Enable the replica placement syntax with the following [session variable](set-vars.html) _or_ non-public [cluster setting](cluster-settings.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET enable_multiregion_placement_policy = on;
    ~~~
 
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING sql.defaults.multiregion_placement_policy.enabled = on;
    ~~~

### Set the replica placement policy to restricted

When you set the database's placement policy to "restricted", you are saying that you want the underlying data to be restricted to the table's [home region](set-locality.html#crdb_region).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PLACEMENT RESTRICTED;
~~~

~~~
ALTER DATABASE PLACEMENT
~~~

### Set the replica placement policy to default

If you change the replica placement policy as described elsewhere on this page, you can set it back to the default by issuing the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PLACEMENT DEFAULT;
~~~

~~~
ALTER DATABASE PLACEMENT
~~~

## See also

- [Multi-region overview](multiregion-overview.html)
- [`ALTER DATABASE`](alter-database.html)
- [`ADD REGION`](add-region.html)
- [Ranges](architecture/overview.html#architecture-range)
- [Non-voting replicas](architecture/replication-layer.html#non-voting-replicas)
- [Other SQL Statements](sql-statements.html)
