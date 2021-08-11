---
title: SHOW RANGE FOR ROW
summary: The SHOW RANGE FOR ROW statement shows information about the range for a single row.
toc: true
---

The `SHOW RANGE ... FOR ROW` [statement](sql-statements.html) shows information about a [range](architecture/overview.html#glossary) for a single row in a table or index. This information is useful for verifying how SQL data maps to underlying ranges, and where the replicas for a range are located.

{% include {{ page.version.version }}/misc/experimental-warning.md %}

{{site.data.alerts.callout_info}}
To show information about the ranges for all data in a table, index, or database, use the [`SHOW RANGES`](show-ranges.html) statement.
{{site.data.alerts.end}}

## Syntax

~~~
SHOW RANGE FROM TABLE <tablename> FOR ROW (value1, value2, ...)
SHOW RANGE FROM INDEX [ <tablename> @ ] <indexname> FOR ROW (value1, value2, ...)
~~~

## Required privileges

The user must have the `SELECT` [privilege](authorization.html#assign-privileges) on the target table.

## Parameters

Parameter | Description
----------|------------
`tablename` | The name of the table that contains the row that you want range information about.
`indexname` | The name of the index that contains the row that you want range information about.
`(value1, value2, ...)` |  The values of the indexed columns of the row that you want range information about, as a tuple. In previous releases, this statement required the values of all columns of a row.

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

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show range information for a row in a table

To show information about a row in a table, you must know the values of the columns in the row's primary key:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM vehicles;
~~~

~~~
  table_name |              index_name               | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+---------------------------------------+------------+--------------+-------------+-----------+---------+-----------
  vehicles   | primary                               |   false    |            1 | city        | ASC       |  false  |  false
  vehicles   | primary                               |   false    |            2 | id          | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            1 | city        | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            2 | owner_id    | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            3 | id          | ASC       |  false  |   true
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, id FROM vehicles LIMIT 5;
~~~

~~~
     city     |                  id
--------------+---------------------------------------
  amsterdam   | bbbbbbbb-bbbb-4800-8000-00000000000b
  amsterdam   | aaaaaaaa-aaaa-4800-8000-00000000000a
  boston      | 22222222-2222-4200-8000-000000000002
  boston      | 33333333-3333-4400-8000-000000000003
  los angeles | 99999999-9999-4800-8000-000000000009
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGE FROM TABLE vehicles FOR ROW (
    'boston',
    '22222222-2222-4200-8000-000000000002'
  );
~~~

~~~
                            start_key                           |                         end_key                         | range_id | lease_holder | lease_holder_locality | replicas |    replica_localities
----------------------------------------------------------------+---------------------------------------------------------+----------+--------------+-----------------------+----------+---------------------------
  /"boston"/"\"\"\"\"\"\"B\x00\x80\x00\x00\x00\x00\x00\x00\x02" | /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\x03" |       57 |            1 | region=us-east1,az=b  | {1}      | {"region=us-east1,az=b"}
(1 row)
~~~

### Show range information for a row by a secondary index

To show information about a row in a secondary index, you must know the values of the indexed columns:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM vehicles;
~~~

~~~
  table_name |              index_name               | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+---------------------------------------+------------+--------------+-------------+-----------+---------+-----------
  vehicles   | primary                               |   false    |            1 | city        | ASC       |  false  |  false
  vehicles   | primary                               |   false    |            2 | id          | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            1 | city        | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            2 | owner_id    | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            3 | id          | ASC       |  false  |   true
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, owner_id, id FROM vehicles@vehicles_auto_index_fk_city_ref_users LIMIT 5;
~~~

~~~
     city     |               owner_id               |                  id
--------------+--------------------------------------+---------------------------------------
  amsterdam   | bd70a3d7-0a3d-4000-8000-000000000025 | bbbbbbbb-bbbb-4800-8000-00000000000b
  amsterdam   | c28f5c28-f5c2-4000-8000-000000000026 | aaaaaaaa-aaaa-4800-8000-00000000000a
  boston      | 2e147ae1-47ae-4400-8000-000000000009 | 22222222-2222-4200-8000-000000000002
  boston      | 33333333-3333-4400-8000-00000000000a | 33333333-3333-4400-8000-000000000003
  los angeles | 9eb851eb-851e-4800-8000-00000000001f | 99999999-9999-4800-8000-000000000009
(5 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGE FROM INDEX vehicles@vehicles_auto_index_fk_city_ref_users FOR ROW (
    'boston',
    '2e147ae1-47ae-4400-8000-000000000009',
    '22222222-2222-4200-8000-000000000002'
  );
~~~

~~~
  start_key | end_key | range_id | lease_holder | lease_holder_locality | replicas |    replica_localities
------------+---------+----------+--------------+-----------------------+----------+---------------------------
  NULL      | NULL    |       53 |            1 | region=us-east1,az=b  | {1}      | {"region=us-east1,az=b"}
~~~

## See also

- [`SHOW RANGES`](show-ranges.html)
- [`SPLIT AT`](split-at.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
- [Partitioning tables](partitioning.html)
- [Architecture Overview](architecture/overview.html)
