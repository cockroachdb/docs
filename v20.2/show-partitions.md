---
title: SHOW PARTITIONS
summary: Use the SHOW PARTITIONS statement to list details about existing partitions.
toc: true
---

Use the `SHOW PARTITIONS` [statement](sql-statements.html) to view details about existing [partitions](partitioning.html).

{% include enterprise-feature.md %}

{% include {{page.version.version}}/sql/crdb-internal-partitions.md %}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_partitions.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list partitions.

## Parameters

Parameter | Description
----------|------------
`database_name` | The name of the [database](create-database.html) for which to show [partitions](partitioning.html).
`table_name` | The name of the [table](create-table.html) for which to show [partitions](partitioning.html).
`table_index_name` | The name of the [index](create-index.html) for which to show [partitions](partitioning.html).

## Response

The following fields are returned for each partition:

Field | Description
------|------------
`database_name` | The name of the database that contains the partition.
`table_name` | The name of the table that contains the partition.
`partition_name` | The name of the partition.
`parent_partition` | The name of the parent partition, if the partition is a [subpartition](partitioning.html#define-subpartitions-on-a-table).
`column_names` | The names of the columns in the partition definition expression.
`index_name` | The name of the index for the partition.
`partition_value` | The value that defines the partition.
`zone_constraints` | The [zone constraints](configure-replication-zones.html), if replication zones are configured for the partition.

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

The `movr` database in this example is pre-partitioned. For information about partitioning tables, see [Define Table Partitions](partitioning.html) or [`PARTION BY`](partition-by.html).

### Show table partitions

{% include copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM TABLE users;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |  index_name   |                 partition_value                 |              zone_config               |            full_zone_config
+---------------+------------+----------------+------------------+--------------+---------------+-------------------------------------------------+----------------------------------------+-----------------------------------------+
  movr          | users      | us_west        | NULL             | city         | users@primary | ('seattle'), ('san francisco'), ('los angeles') | constraints = '[+region=us-west1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |               |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |               |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |               |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |               |                                                 |                                        | constraints = '[+region=us-west1]',
                |            |                |                  |              |               |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | us_east        | NULL             | city         | users@primary | ('new york'), ('boston'), ('washington dc')     | constraints = '[+region=us-east1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |               |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |               |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |               |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |               |                                                 |                                        | constraints = '[+region=us-east1]',
                |            |                |                  |              |               |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | europe_west    | NULL             | city         | users@primary | ('amsterdam'), ('paris'), ('rome')              | constraints = '[+region=europe-west1]' | range_min_bytes = 134217728,
                |            |                |                  |              |               |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |               |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |               |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |               |                                                 |                                        | constraints = '[+region=europe-west1]',
                |            |                |                  |              |               |                                                 |                                        | lease_preferences = '[]'
(3 rows)
~~~

You can also use [`SHOW CREATE TABLE`](show-create.html) to view partitions on a table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                                  create_statement
+------------+-------------------------------------------------------------------------------------+
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | ) PARTITION BY LIST (city) (
             |     PARTITION us_west VALUES IN (('seattle'), ('san francisco'), ('los angeles')),
             |     PARTITION us_east VALUES IN (('new york'), ('boston'), ('washington dc')),
             |     PARTITION europe_west VALUES IN (('amsterdam'), ('paris'), ('rome'))
             | );
             | ALTER PARTITION europe_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=europe-west1]';
             | ALTER PARTITION us_east OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=us-east1]';
             | ALTER PARTITION us_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=us-west1]'
(1 row)
~~~

If a partitioned table has no zones configured, the `SHOW CREATE TABLE` output includes a warning.

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF TABLE users CONFIGURE ZONE DISCARD;
  ALTER PARTITION us_east OF TABLE users CONFIGURE ZONE DISCARD;
  ALTER PARTITION europe_west OF TABLE users CONFIGURE ZONE DISCARD;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                                  create_statement
+------------+-------------------------------------------------------------------------------------+
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | ) PARTITION BY LIST (city) (
             |     PARTITION us_west VALUES IN (('seattle'), ('san francisco'), ('los angeles')),
             |     PARTITION us_east VALUES IN (('new york'), ('boston'), ('washington dc')),
             |     PARTITION europe_west VALUES IN (('amsterdam'), ('paris'), ('rome'))
             | )
             | -- Warning: Partitioned table with no zone configurations.
(1 row)
~~~


### Show partitions by index

{% include copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM INDEX vehicles@vehicles_auto_index_fk_city_ref_users;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |                   index_name                   |                 partition_value                 |              zone_config               |            full_zone_config
+---------------+------------+----------------+------------------+--------------+------------------------------------------------+-------------------------------------------------+----------------------------------------+-----------------------------------------+
  movr          | vehicles   | us_west        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('seattle'), ('san francisco'), ('los angeles') | constraints = '[+region=us-west1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                                                |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                                                |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                                                |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                                                |                                                 |                                        | constraints = '[+region=us-west1]',
                |            |                |                  |              |                                                |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | us_east        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('new york'), ('boston'), ('washington dc')     | constraints = '[+region=us-east1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                                                |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                                                |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                                                |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                                                |                                                 |                                        | constraints = '[+region=us-east1]',
                |            |                |                  |              |                                                |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | europe_west    | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('amsterdam'), ('paris'), ('rome')              | constraints = '[+region=europe-west1]' | range_min_bytes = 134217728,
                |            |                |                  |              |                                                |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                                                |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                                                |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                                                |                                                 |                                        | constraints = '[+region=europe-west1]',
                |            |                |                  |              |                                                |                                                 |                                        | lease_preferences = '[]'
(3 rows)
~~~

### Show partitions by database

{% include copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM DATABASE movr;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |    index_name    |                 partition_value                 |              zone_config               |            full_zone_config
+---------------+------------+----------------+------------------+--------------+------------------+-------------------------------------------------+----------------------------------------+-----------------------------------------+
  movr          | users      | us_west        | NULL             | city         | users@primary    | ('seattle'), ('san francisco'), ('los angeles') | NULL                                   | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | us_east        | NULL             | city         | users@primary    | ('new york'), ('boston'), ('washington dc')     | NULL                                   | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | europe_west    | NULL             | city         | users@primary    | ('amsterdam'), ('paris'), ('rome')              | NULL                                   | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | us_west        | NULL             | city         | vehicles@primary | ('seattle'), ('san francisco'), ('los angeles') | constraints = '[+region=us-west1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[+region=us-west1]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | us_east        | NULL             | city         | vehicles@primary | ('new york'), ('boston'), ('washington dc')     | constraints = '[+region=us-east1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[+region=us-east1]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | europe_west    | NULL             | city         | vehicles@primary | ('amsterdam'), ('paris'), ('rome')              | constraints = '[+region=europe-west1]' | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[+region=europe-west1]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
...
(24 rows)
~~~

{% include {{page.version.version}}/sql/crdb-internal-partitions-example.md %}

## See also

- [Define Table Partitions](partitioning.html)
- [SQL Statements](sql-statements.html)
- [Geo-Partitioning](demo-low-latency-multi-region-deployment.html)
