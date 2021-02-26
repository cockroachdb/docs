---
title: SET LOCALITY
summary: The SET LOCALITY statement changes the locality of a table.
toc: true
---

<span class="version-tag">New in v21.1:</span> The `ALTER TABLE .. SET LOCALITY` [statement](sql-statements.html) changes the [table locality](multiregion-overview.html#table-locality) of a [table](create-table.html) in a [multi-region database](multiregion-overview.html).

{{site.data.alerts.callout_info}}
`SET LOCALITY` is a subcommand of [`ALTER TABLE`](alter-table.html)
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

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the table.

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

For more information about how this table locality works, see [Regional tables](multiregion-overview.html#regional-tables).

<a name="regional-by-row"></a>

### Set the table locality to `REGIONAL BY ROW`

To make an existing table a _regional by row_ table, use the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE {table} SET LOCALITY REGIONAL BY ROW;
~~~

Every row in a regional by row table has a hidden `crdb_region` column that represents the row's home region. To see a row's region, issue a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
SELECT crdb_region, id FROM {table};
~~~

To update an existing row's home region, use an [`UPDATE`](update.html) statement like the following:

{% include copy-clipboard.html %}
~~~ sql
UPDATE {table} SET crdb_region = "eu-west" WHERE id IN (...)
~~~

To add a new row to a regional by row table, you must choose one of the following options.

- Let CockroachDB set the row's home region automatically. It will use the region of the [gateway node](architecture/life-of-a-distributed-transaction.html#gateway) from which the row is inserted.

- Set the home region explicitly using an [`INSERT`](insert.html) statement like the following:

    {% include copy-clipboard.html %}
    ~~~ sql
    INSERT INTO {table} (crdb_region, ...) VALUES ('us-east-1', ...);
    ~~~

This is necessary because every row in a regional by row table must have a home region.

For more information about how this table locality works, see [Regional by row tables](multiregion-overview.html#regional-by-row-tables).

{{site.data.alerts.callout_success}}
You can also use a name other than `crdb_region` for the hidden column by using the following syntax:  
<ul>
<li>`ALTER TABLE foo SET LOCALITY REGIONAL BY ROW AS bar`</li>
<li>`SELECT bar, id FROM foo`</li>
<li>`INSERT INTO foo (bar, ...) VALUES ('us-east-1', ...)`</li>
<ul>
{{site.data.alerts.end}}

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
