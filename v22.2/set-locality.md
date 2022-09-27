---
title: SET LOCALITY
summary: The SET LOCALITY statement changes the locality of a table.
toc: true
docs_area: reference.sql
---

The `ALTER TABLE .. SET LOCALITY` [statement](sql-statements.html) changes the [table locality](multiregion-overview.html#table-locality) of a [table](create-table.html) in a [multi-region database](multiregion-overview.html).

While CockroachDB is processing an `ALTER TABLE .. SET LOCALITY` statement that enables or disables `REGIONAL BY ROW` on a table within a database, any [`ADD REGION`](add-region.html) and [`DROP REGION`](drop-region.html) statements on that database will fail.

{{site.data.alerts.callout_info}}
`SET LOCALITY` is a subcommand of [`ALTER TABLE`](alter-table.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_table_locality.html %}
</div>

## Parameters

| Parameter    | Description                                                                                                                                                                                  |
|--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `table_name` | The table whose [locality](multiregion-overview.html#table-locality) you are configuring.                                                                                                    |
| `locality`   | The [locality](multiregion-overview.html#table-locality) to apply to this table.  Allowed values: <ul><li>[`REGIONAL BY TABLE`](#regional-by-table) (default)</li><li>[`REGIONAL BY ROW`](#regional-by-row)</li><li>[`GLOBAL`](#global)</li></ul> |

For more information about which table locality is right for your use case, see [Table localities](multiregion-overview.html#table-locality).

## Required privileges

The user must be a member of the [`admin`](security-reference/authorization.html#roles) or [owner](security-reference/authorization.html#object-ownership) roles, or have the [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the table.

## Examples

{{site.data.alerts.callout_info}}
[`RESTORE`](restore.html) on [`REGIONAL BY TABLE`](#regional-by-table), [`REGIONAL BY ROW`](#regional-by-row), and [`GLOBAL`](#global) tables is supported with some limitations — see [Restoring to multi-region databases](restore.html#restoring-to-multi-region-databases) for more detail.
{{site.data.alerts.end}}

<a name="regional-by-table"></a>

### Set the table locality to `REGIONAL BY TABLE`

To optimize read and write access to the data in a table from the primary region, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
~~~

To optimize read and write access to the data in a table from the `us-east-1` region, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY TABLE IN "us-east-1";
~~~

{{site.data.alerts.callout_info}}
If no region is supplied, `REGIONAL BY TABLE` defaults to the primary region.
{{site.data.alerts.end}}

For more information about how table localities work, see [Regional tables](multiregion-overview.html#regional-tables).

<a name="regional-by-row"></a>

### Set the table locality to `REGIONAL BY ROW`

{{site.data.alerts.callout_info}}
Before setting the locality to `REGIONAL BY ROW` on a table targeted by a changefeed, read the considerations in [Changefeeds on regional by row tables](changefeeds-in-multi-region-deployments.html).
{{site.data.alerts.end}}

To make an existing table a _regional by row_ table, use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY ROW;
~~~

<a name="crdb_region"></a>

Every row in a regional by row table has a hidden `crdb_region` column that represents the row's home region. To see a row's region, issue a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT crdb_region, id FROM {table};
~~~

<a name="update-a-rows-home-region"></a> To update an existing row's home region, use an [`UPDATE`](update.html) statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE {table} SET crdb_region = 'eu-west' WHERE id IN (...)
~~~

To add a new row to a regional by row table, you must choose one of the following options.

- Let CockroachDB set the row's home region automatically. It will use the region of the [gateway node](architecture/life-of-a-distributed-transaction.html#gateway) from which the row is inserted.

- Set the home region explicitly using an [`INSERT`](insert.html) statement like the following:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO {table} (crdb_region, ...) VALUES ('us-east-1', ...);
    ~~~

This is necessary because every row in a regional by row table must have a home region.

If you do not set a home region for a row in a regional by row table, it defaults to the value returned by the built-in function `gateway_region()`. If the value returned by `gateway_region()` does not belong to the multi-region database the table is a part of, the home region defaults to the database's primary region.

For more information about how this table locality works, see [Regional by row tables](multiregion-overview.html#regional-by-row-tables).

<a name="rename-crdb_region"></a>

Note that you can use a name other than `crdb_region` for the hidden column by using the following statements:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE foo SET LOCALITY REGIONAL BY ROW AS bar;
SELECT bar, id FROM foo;
INSERT INTO foo (bar, ...) VALUES ('us-east-1', ...);
~~~

In fact, you can specify any column definition you like for the `REGIONAL BY ROW AS` column, as long as the column is of type `crdb_internal_region` and is not nullable. For example, you could modify the [movr schema](movr.html#the-movr-database) to have a region column generated as:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE rides ADD COLUMN region crdb_internal_region AS (
  CASE
    WHEN city IN ('new york', 'boston', 'washington dc', 'chicago', 'detroit', 'minneapolis') THEN 'us-east-1'
    WHEN city IN ('san francisco', 'seattle', 'los angeles') THEN 'us-west-1'
    WHEN city IN ('amsterdam', 'paris', 'rome') THEN 'eu-west-1'
  END
) STORED;
~~~

{% include {{page.version.version}}/sql/locality-optimized-search.md %}

### Turn on auto-rehoming for `REGIONAL BY ROW` tables

{% include feature-phases/preview.md %}

This feature is disabled by default.

When auto-rehoming is enabled, the [home regions](#crdb_region) of rows in [`REGIONAL BY ROW`](#set-the-table-locality-to-regional-by-row) tables are automatically set to the region of the [gateway node](ui-sessions-page.html#session-details-gateway-node) from which any [`UPDATE`](update.html) or [`UPSERT`](upsert.html) statements that operate on those rows originate. This functionality is provided by adding [an `ON UPDATE` expression](create-table.html#on-update-expressions) to the [home region column](#crdb_region).

Once enabled, the auto-rehoming behavior described here has the following limitations:

- It **will only apply to newly created `REGIONAL BY ROW` tables**. Existing `REGIONAL BY ROW` tables will not be auto-rehomed.
- The [`crdb_region`](#crdb_region) column from a [`REGIONAL BY ROW`](#set-the-table-locality-to-regional-by-row) table cannot be referenced as a [foreign key](foreign-key.html) from another table.

To enable it using the [session setting](set-vars.html), issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SET enable_auto_rehoming = on;
~~~

~~~
SET
~~~

#### Example

1. Follow steps 1 and 2 from the [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html) tutorial. This will involve starting a [`cockroach demo`](cockroach-demo.html) cluster in a terminal window (call it _terminal 1_).

1. From the [SQL client](cockroach-sql.html) running in terminal 1, set the cluster setting that enables auto-rehoming. You must issue this session setting before creating the `REGIONAL BY ROW` tables this feature operates on.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET enable_auto_rehoming = on;
    ~~~

1. In a second terminal window (call it _terminal 2_), [finish the tutorial starting from step 3](demo-low-latency-multi-region-deployment.html#step-3-load-and-run-movr) onward to finish loading the cluster with data and applying the multi-region SQL configuration.

1. Switch back to terminal 1, and check the gateway region of the node you are currently connected to:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT gateway_region();
    ~~~

    ~~~
      gateway_region
    ------------------
      us-east1
    (1 row)
    ~~~

1. Open another terminal (call it _terminal 3_), and use [`cockroach sql`](cockroach-sql.html) to connect to a node in a different region in the demo cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure --host localhost --port 26262
    ~~~

    ~~~
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    # Server version: CockroachDB CCL {{ page.release_info.version }} (x86_64-apple-darwin19, built {{ page.release_info.build_time }}) (same version as client)
    # Cluster ID: 87b22d9b-b9ce-4f3a-8635-acad89c5981f
    # Organization: Cockroach Demo
    #
    # Enter \? for a brief introduction.
    #
    root@localhost:26262/defaultdb>
    ~~~

1. From the SQL shell prompt that appears in terminal 3, switch to the `movr` database, and verify that the current gateway node is in a different region (`us-west1`):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    USE movr;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT gateway_region();
    ~~~

    ~~~
      gateway_region
    ------------------
      us-west1
    (1 row)
    ~~~

1. Still in terminal 3, update a row in the `vehicles` table that is homed in the `us-east1` region. After the update, it should be homed in the current gateway node's home region, `us-west1`.

   1. First, pick a row at random from the `us-east1` region:

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       select * from vehicles where region = 'us-east1' limit 1;
       ~~~

       ~~~
                          id                  |  city  | type |               owner_id               |       creation_time        |  status   |       current_location       |                    ext                     |  region
       ---------------------------------------+--------+------+--------------------------------------+----------------------------+-----------+------------------------------+--------------------------------------------+-----------
         3e127e68-a3f9-487d-aa56-bf705beca05a | boston | bike | 2f057d6b-ba8d-4f56-8fd9-894b7c082713 | 2021-10-28 16:19:22.309834 | available | 039 Stacey Plain             | {"brand": "FujiCervelo", "color": "green"} | us-east1
                                              |        |      |                                      |                            |           | Lake Brittanymouth, LA 09374 |                                            |
       (1 row)
       ~~~

   1. Next, update that row's `city` and `current_location` to addresses in Seattle, WA (USA). Note that this UUID is different than what you will see in your cluster, so you'll have to update the query accordingly.

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       UPDATE vehicles set (city, current_location) = ('seattle', '2604 1st Ave, Seattle, WA 98121-1305') WHERE id = '3e127e68-a3f9-487d-aa56-bf705beca05a';
       ~~~

       ~~~
       UPDATE 1
       ~~~

   1. Finally, verify that the row has been auto-rehomed in this gateway's region by running the following statement and checking that the `region` column is now `us-west1` as shown below.

       {% include_cached copy-clipboard.html %}
       ~~~ sql
       SELECT * FROM vehicles WHERE id = '3e127e68-a3f9-487d-aa56-bf705beca05a';
       ~~~

       ~~~
                          id                  |  city   | type |               owner_id               |       creation_time        |  status   |           current_location           |                    ext                     |  region
       ---------------------------------------+---------+------+--------------------------------------+----------------------------+-----------+--------------------------------------+--------------------------------------------+-----------
         3e127e68-a3f9-487d-aa56-bf705beca05a | seattle | bike | 2f057d6b-ba8d-4f56-8fd9-894b7c082713 | 2021-10-28 16:19:22.309834 | available | 2604 1st Ave, Seattle, WA 98121-1305 | {"brand": "FujiCervelo", "color": "green"} | us-west1
       (1 row)
       ~~~

<a name="global"></a>

### Set the table locality to `GLOBAL`

To optimize read access to the data in a table from any region (that is, globally), use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY GLOBAL;
~~~

~~~
ALTER TABLE SET LOCALITY
~~~

For more information about how this table locality works, see [Global tables](multiregion-overview.html#global-tables).

## See also

- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [`ALTER TABLE`](alter-table.html)
- [SQL Statements](sql-statements.html)
- [Secondary regions](multiregion-overview.html#secondary-regions)
- [`SET SECONDARY REGION`](set-secondary-region.html)
- [`DROP SECONDARY REGION`](drop-secondary-region.html)
