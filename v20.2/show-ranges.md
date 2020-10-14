---
title: SHOW RANGES
summary: The SHOW RANGES statement shows information about the ranges that comprise the data for a table, index, or entire database.
toc: true
redirect_from: [show-testing-ranges.html, show-experimental-ranges.html]
---

The `SHOW RANGES` [statement](sql-statements.html) shows information about the [ranges](architecture/overview.html#glossary) that comprise the data for a table, index, or entire database. This information is useful for verifying how SQL data maps to underlying ranges, and where the replicas for ranges are located.

{{site.data.alerts.callout_info}}
To show range information for a specific row in a table or index, use the [`SHOW RANGE ... FOR ROW`](show-range-for-row.html) statement.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_ranges.html %}
</div>

## Required privileges

Only members of the [`admin` role](authorization.html#admin-role) can run `SHOW RANGES`. By default, the `root` user belongs to the `admin` role.

## Parameters

Parameter | Description
----------|------------
[`table_name`](sql-grammar.html#table_name) | The name of the table you want range information about.
[`table_index_name`](sql-grammar.html#table_index_name) | The name of the index you want range information about.
[`database_name`](sql-grammar.html#database_name) | The name of the database you want range information about.

## Response

The following fields are returned for each partition:

Field | Description
------|------------
`table_name` | The name of the table.
`start_key` | The start key for the range.
`end_key` | The end key for the range.
`range_id` | The range ID.
`range_size_mb` | The size of the range.
`lease_holder` | The node that contains the range's [leaseholder](architecture/overview.html#glossary).
`lease_holder_locality` | The [locality](cockroach-start.html#locality) of the leaseholder.
`replicas` | The nodes that contain the range [replicas](architecture/overview.html#glossary).
`replica_localities` | The [locality](cockroach-start.html#locality) of the range.

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Show ranges for a table (primary index)

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGES FROM TABLE vehicles] WHERE "start_key" NOT LIKE '%Prefix%';
~~~
~~~
     start_key     |          end_key           | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
+------------------+----------------------------+----------+---------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+
  /"new york"      | /"new york"/PrefixEnd      |       58 |      0.000304 |            2 | region=us-east1,az=c     | {1,2,5}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-west1,az=b"}
  /"washington dc" | /"washington dc"/PrefixEnd |      102 |      0.000173 |            2 | region=us-east1,az=c     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"boston"        | /"boston"/PrefixEnd        |       63 |      0.000288 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"seattle"       | /"seattle"/PrefixEnd       |       97 |      0.000295 |            4 | region=us-west1,az=a     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  /"los angeles"   | /"los angeles"/PrefixEnd   |       55 |      0.000156 |            5 | region=us-west1,az=b     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  /"san francisco" | /"san francisco"/PrefixEnd |       71 |      0.000309 |            6 | region=us-west1,az=c     | {1,5,6}  | {"region=us-east1,az=b","region=us-west1,az=b","region=us-west1,az=c"}
  /"amsterdam"     | /"amsterdam"/PrefixEnd     |       59 |      0.000305 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"paris"         | /"paris"/PrefixEnd         |       62 |      0.000299 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"rome"          | /"rome"/PrefixEnd          |       67 |      0.000168 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(9 rows)
~~~

### Show ranges for an index

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGES FROM INDEX vehicles_auto_index_fk_city_ref_users] WHERE "start_key" NOT LIKE '%Prefix%';
~~~
~~~
     start_key     |          end_key           | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
+------------------+----------------------------+----------+---------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+
  /"washington dc" | /"washington dc"/PrefixEnd |      188 |      0.000089 |            2 | region=us-east1,az=c     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"boston"        | /"boston"/PrefixEnd        |      141 |      0.000164 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"new york"      | /"new york"/PrefixEnd      |      168 |      0.000174 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"los angeles"   | /"los angeles"/PrefixEnd   |      165 |      0.000087 |            6 | region=us-west1,az=c     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  /"san francisco" | /"san francisco"/PrefixEnd |      174 |      0.000183 |            6 | region=us-west1,az=c     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  /"seattle"       | /"seattle"/PrefixEnd       |      186 |      0.000166 |            6 | region=us-west1,az=c     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  /"amsterdam"     | /"amsterdam"/PrefixEnd     |      137 |       0.00017 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"paris"         | /"paris"/PrefixEnd         |      170 |      0.000162 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"rome"          | /"rome"/PrefixEnd          |      172 |       0.00008 |            9 | region=europe-west1,az=d | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(9 rows)
~~~

### Show ranges for a database

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGES FROM database movr] WHERE "start_key" NOT LIKE '%Prefix%';
~~~
~~~
          table_name         |    start_key     |          end_key           | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
+----------------------------+------------------+----------------------------+----------+---------------+--------------+--------------------------+----------+------------------------------------------------------------------------------------+
  users                      | /"amsterdam"     | /"amsterdam"/PrefixEnd     |       47 |      0.000562 |            7 | region=europe-west1,az=b | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  users                      | /"boston"        | /"boston"/PrefixEnd        |       51 |      0.000665 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  users                      | /"chicago"       | /"los angeles"             |       83 |             0 |            4 | region=us-west1,az=a     | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  users                      | /"los angeles"   | /"los angeles"/PrefixEnd   |       45 |      0.000697 |            4 | region=us-west1,az=a     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  users                      | /"new york"      | /"new york"/PrefixEnd      |       48 |      0.000664 |            1 | region=us-east1,az=b     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  users                      | /"paris"         | /"paris"/PrefixEnd         |       52 |      0.000628 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}

  ...

  user_promo_codes           | /"washington dc" | /"washington dc"/PrefixEnd |      144 |             0 |            2 | region=us-east1,az=c     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
(73 rows)
~~~

## See also

- [`SHOW RANGE ... FOR ROW`](show-range-for-row.html)
- [`SPLIT AT`](split-at.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
- [Partitioning tables](partitioning.html)
- [Architecture Overview](architecture/overview.html)
