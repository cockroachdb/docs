---
title: SHOW RANGE FOR ROW
summary: The SHOW RANGE FOR ROW statement shows information about the range for a particular row.
toc: true
---

The `SHOW RANGE ... FOR ROW` [statement](sql-statements.html) shows information about a [range](architecture/overview.html#glossary) for a particular row of data. This information is useful for verifying how SQL data maps to underlying ranges, and where the replicas for a range are located.

{% include {{ page.version.version }}/misc/experimental-warning.md %}

{{site.data.alerts.callout_info}}
To show information about the ranges that comprise the data for a table, index, or entire database, use the [`SHOW RANGES`](show-ranges.html) statement.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_range_for_row.html %}
</div>

## Required privileges

The user must have the `SELECT` [privilege](authorization.html#assign-privileges) on the target table.

## Parameters

Parameter | Description
----------|------------
[`table_name`](sql-grammar.html#table_name) | The name of the table that contains the row that you want range information about.
[`table_index_name`](sql-grammar.html#table_index_name) | The name of the index for the row that you want range information about.
`row_vals` | The values of the row whose range information you want to show.

## Response

The following fields are returned:

Field | Description
------|------------
`start_key` | The start key for the range.
`end_key` | The end key for the range.
`range_id` | The range ID.
`lease_holder` | The node that contains the range's [leaseholder](architecture/overview.html#glossary).
`lease_holder_locality` | The [locality](cockroach-start.html#locality) of the leaseholder.
`replicas` | The nodes that contain the range [replicas](architecture/overview.html#glossary).
`replica_localities` | The [locality](cockroach-start.html#locality) of the range.

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Show range information for a row in a table

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGE FROM TABLE users FOR ROW ('ae147ae1-47ae-4800-8000-000000000022', 'amsterdam', 'Tyler Dalton', '88194 Angela Gardens Suite 94', '4443538758')];
~~~
~~~
   start_key   |        end_key         | range_id | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
+--------------+------------------------+----------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+
  /"amsterdam" | /"amsterdam"/PrefixEnd |       47 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(1 row)
~~~

### Show range information for a row by a secondary index

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGE FROM INDEX vehicles_auto_index_fk_city_ref_users FOR ROW ('aaaaaaaa-aaaa-4800-8000-00000000000a', 'amsterdam', 'scooter', 'c28f5c28-f5c2-4000-8000-000000000026', '2019-01-02 03:04:05+00:00', 'in_use', '62609 Stephanie Route', '{"color": "red"}')];
~~~
~~~
   start_key   |        end_key         | range_id | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
+--------------+------------------------+----------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+
  /"amsterdam" | /"amsterdam"/PrefixEnd |       94 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(1 row)
~~~

## See also

- [`SHOW RANGES`](show-ranges.html)
- [`SPLIT AT`](split-at.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
- [Partitioning tables](partitioning.html)
- [Architecture Overview](architecture/overview.html)
