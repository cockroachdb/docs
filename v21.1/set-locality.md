---
title: SET LOCALITY
summary: The SET LOCALITY statement changes the locality of a table.
toc: true
---

{% include_cached new-in.html version="v21.1" %} The `ALTER TABLE .. SET LOCALITY` [statement](sql-statements.html) changes the [table locality](multiregion-overview.html#table-locality) of a [table](create-table.html) in a [multi-region database](multiregion-overview.html).

While CockroachDB is processing an `ALTER TABLE .. SET LOCALITY` statement that enables or disables `REGIONAL BY ROW` on a table within a database, any [`ADD REGION`](add-region.html) and [`DROP REGION`](drop-region.html) statements on that database will fail.

{{site.data.alerts.callout_info}}
`SET LOCALITY` is a subcommand of [`ALTER TABLE`](alter-table.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/alter_table_locality.html %}
</div>

## Parameters

| Parameter    | Description                                                                                                                                                                                  |
|--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `table_name` | The table whose [locality](multiregion-overview.html#table-locality) you are configuring.                                                                                                    |
| `locality`   | The [locality](multiregion-overview.html#table-locality) to apply to this table.  Allowed values: <ul><li>[`REGIONAL BY TABLE`](#regional-by-table) (default)</li><li>[`REGIONAL BY ROW`](#regional-by-row)</li><li>[`GLOBAL`](#global)</li></ul> |

{{site.data.alerts.callout_info}}
For more information about which table locality is right for your use case, see the following pages:  
<ul>
<li>[Multi-region table localities](multiregion-overview.html#table-locality)</li>
</ul>
{{site.data.alerts.end}}

## Required privileges

The user must be a member of the [`admin`](authorization.html#roles) or [owner](authorization.html#object-ownership) roles, or have the [`CREATE` privilege](authorization.html#supported-privileges) on the table.

## Examples

<a name="regional-by-table"></a>

### Set the table locality to `REGIONAL BY TABLE`

To optimize read and write access to the data in a table from the primary region, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
~~~

To optimize read and write access to the data in a table from the `us-east-1` region, use the following statement:

{% include copy-clipboard.html %}
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
Before setting the locality to `REGIONAL BY ROW` on a table targeted by a changefeed, read the considerations in [Changefeeds on regional by row tables](stream-data-out-of-cockroachdb-using-changefeeds.html#changefeeds-on-regional-by-row-tables).
{{site.data.alerts.end}}

To make an existing table a _regional by row_ table, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY ROW;
~~~

<a name="crdb_region"></a>

Every row in a regional by row table has a hidden `crdb_region` column that represents the row's home region. To see a row's region, issue a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
SELECT crdb_region, id FROM {table};
~~~

<a name="update-a-rows-home-region"></a> To update an existing row's home region, use an [`UPDATE`](update.html) statement like the following:

{% include copy-clipboard.html %}
~~~ sql
UPDATE {table} SET crdb_region = 'eu-west' WHERE id IN (...)
~~~

To add a new row to a regional by row table, you must choose one of the following options.

- Let CockroachDB set the row's home region automatically. It will use the region of the [gateway node](architecture/life-of-a-distributed-transaction.html#gateway) from which the row is inserted.

- Set the home region explicitly using an [`INSERT`](insert.html) statement like the following:

    {% include copy-clipboard.html %}
    ~~~ sql
    INSERT INTO {table} (crdb_region, ...) VALUES ('us-east-1', ...);
    ~~~

This is necessary because every row in a regional by row table must have a home region.

If you do not set a home region for a row in a regional by row table, it defaults to the value returned by the built-in function `gateway_region()`. If the value returned by `gateway_region()` does not belong to the multi-region database the table is a part of, the home region defaults to the database's primary region.

For more information about how this table locality works, see [Regional by row tables](multiregion-overview.html#regional-by-row-tables).

<a name="rename-crdb_region"></a>

Note that you can use a name other than `crdb_region` for the hidden column by using the following statements:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE foo SET LOCALITY REGIONAL BY ROW AS bar;
SELECT bar, id FROM foo;
INSERT INTO foo (bar, ...) VALUES ('us-east-1', ...);
~~~

In fact, you can specify any column definition you like for the `REGIONAL BY ROW AS` column, as long as the column is of type `crdb_internal_region` and is not nullable. For example, you could modify the [movr schema](movr.html#the-movr-database) to have a region column generated as:

{% include copy-clipboard.html %}
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

<a name="global"></a>

### Set the table locality to `GLOBAL`

To optimize read access to the data in a table from any region (that is, globally), use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY GLOBAL;
~~~

~~~
ALTER TABLE SET LOCALITY
~~~

For more information about how this table locality works, see [Global tables](multiregion-overview.html#global-tables).

## See also

- [Multi-region overview](multiregion-overview.html)
- [`ALTER TABLE`](alter-table.html)
- [Other SQL Statements](sql-statements.html)
