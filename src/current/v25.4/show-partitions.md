---
title: SHOW PARTITIONS
summary: Use the SHOW PARTITIONS statement to list details about existing partitions.
toc: true
docs_area: reference.sql
---

Use the `SHOW PARTITIONS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) to view details about existing [partitions]({% link {{ page.version.version }}/partitioning.md %}).

{% include {{page.version.version}}/sql/use-multiregion-instead-of-partitioning.md %}



{% include {{page.version.version}}/sql/crdb-internal-partitions.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_partitions.html %}
</div>

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to list partitions.

## Parameters

Parameter | Description
----------|------------
`database_name` | The name of the [database]({% link {{ page.version.version }}/create-database.md %}) for which to show [partitions]({% link {{ page.version.version }}/partitioning.md %}).
`table_name` | The name of the [table]({% link {{ page.version.version }}/create-table.md %}) for which to show [partitions]({% link {{ page.version.version }}/partitioning.md %}).
`table_index_name` | The name of the [index]({% link {{ page.version.version }}/create-index.md %}) for which to show [partitions]({% link {{ page.version.version }}/partitioning.md %}).

## Response

The following fields are returned for each partition:

Field | Description
------|------------
`database_name` | The name of the database that contains the partition.
`table_name` | The name of the table that contains the partition.
`partition_name` | The name of the partition.
`parent_partition` | The name of the parent partition, if the partition is a [subpartition]({% link {{ page.version.version }}/partitioning.md %}#define-subpartitions-on-a-table).
`column_names` | The names of the columns in the partition definition expression.
`index_name` | The name of the index for the partition.
`partition_value` | The value that defines the partition.
`zone_constraints` | The [zone constraints]({% link {{ page.version.version }}/configure-replication-zones.md %}), if replication zones are configured for the partition.

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

The `movr` database in this example is pre-partitioned. For information about partitioning tables, see [Define Table Partitions]({% link {{ page.version.version }}/partitioning.md %}) or [`ALTER TABLE ... PARTITION BY`]({% link {{ page.version.version }}/alter-table.md %}#partition-by).

### Show table partitions

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM TABLE users;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |  index_name      |                 partition_value                 |              zone_config               |            full_zone_config
+---------------+------------+----------------+------------------+--------------+------------------+-------------------------------------------------+----------------------------------------+-----------------------------------------+
  movr          | users      | us_west        | NULL             | city         | users@users_pkey | ('seattle'), ('san francisco'), ('los angeles') | constraints = '[+region=us-west1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[+region=us-west1]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | us_east        | NULL             | city         | users@users_pkey | ('new york'), ('boston'), ('washington dc')     | constraints = '[+region=us-east1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[+region=us-east1]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | europe_west    | NULL             | city         | users@users_pkey | ('amsterdam'), ('paris'), ('rome')              | constraints = '[+region=europe-west1]' | range_min_bytes = 134217728,
                |            |                |                  |              |                  |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                  |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                  |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                  |                                                 |                                        | constraints = '[+region=europe-west1]',
                |            |                |                  |              |                  |                                                 |                                        | lease_preferences = '[]'
(3 rows)
~~~

You can also use [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}) to view partitions on a table:

{% include_cached copy-clipboard.html %}
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
             | ALTER PARTITION europe_west OF INDEX movr.public.users@users_pkey CONFIGURE ZONE USING
             |     constraints = '[+region=europe-west1]';
             | ALTER PARTITION us_east OF INDEX movr.public.users@users_pkey CONFIGURE ZONE USING
             |     constraints = '[+region=us-east1]';
             | ALTER PARTITION us_west OF INDEX movr.public.users@users_pkey CONFIGURE ZONE USING
             |     constraints = '[+region=us-west1]'
(1 row)
~~~

If a partitioned table has no zones configured, the `SHOW CREATE TABLE` output includes a warning.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF TABLE users CONFIGURE ZONE DISCARD;
  ALTER PARTITION us_east OF TABLE users CONFIGURE ZONE DISCARD;
  ALTER PARTITION europe_west OF TABLE users CONFIGURE ZONE DISCARD;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM DATABASE movr;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |    index_name          |                 partition_value                 |              zone_config               |            full_zone_config
+---------------+------------+----------------+------------------+--------------+------------------------+-------------------------------------------------+----------------------------------------+-----------------------------------------+
  movr          | users      | us_west        | NULL             | city         | users@users_pkey       | ('seattle'), ('san francisco'), ('los angeles') | NULL                                   | range_min_bytes = 134217728,
                |            |                |                  |              |                        |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                        |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                        |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                        |                                                 |                                        | constraints = '[]',
                |            |                |                  |              |                        |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | us_east        | NULL             | city         | users@users_pkey       | ('new york'), ('boston'), ('washington dc')     | NULL                                   | range_min_bytes = 134217728,
                |            |                |                  |              |                        |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                        |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                        |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                        |                                                 |                                        | constraints = '[]',
                |            |                |                  |              |                        |                                                 |                                        | lease_preferences = '[]'
  movr          | users      | europe_west    | NULL             | city         | users@users_pkey       | ('amsterdam'), ('paris'), ('rome')              | NULL                                   | range_min_bytes = 134217728,
                |            |                |                  |              |                        |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                        |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                        |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                        |                                                 |                                        | constraints = '[]',
                |            |                |                  |              |                        |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | us_west        | NULL             | city         | vehicles@vehicles_pkey | ('seattle'), ('san francisco'), ('los angeles') | constraints = '[+region=us-west1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                        |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                        |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                        |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                        |                                                 |                                        | constraints = '[+region=us-west1]',
                |            |                |                  |              |                        |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | us_east        | NULL             | city         | vehicles@vehicles_pkey | ('new york'), ('boston'), ('washington dc')     | constraints = '[+region=us-east1]'     | range_min_bytes = 134217728,
                |            |                |                  |              |                        |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                        |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                        |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                        |                                                 |                                        | constraints = '[+region=us-east1]',
                |            |                |                  |              |                        |                                                 |                                        | lease_preferences = '[]'
  movr          | vehicles   | europe_west    | NULL             | city         | vehicles@vehicles_pkey | ('amsterdam'), ('paris'), ('rome')              | constraints = '[+region=europe-west1]' | range_min_bytes = 134217728,
                |            |                |                  |              |                        |                                                 |                                        | range_max_bytes = 536870912,
                |            |                |                  |              |                        |                                                 |                                        | gc.ttlseconds = 90000,
                |            |                |                  |              |                        |                                                 |                                        | num_replicas = 3,
                |            |                |                  |              |                        |                                                 |                                        | constraints = '[+region=europe-west1]',
                |            |                |                  |              |                        |                                                 |                                        | lease_preferences = '[]'
...
(24 rows)
~~~

{% include {{page.version.version}}/sql/crdb-internal-partitions-example.md %}

## See also

- [Define Table Partitions]({% link {{ page.version.version }}/partitioning.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
