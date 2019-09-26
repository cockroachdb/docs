---
title: SHOW PARTITIONS
summary: Use the SHOW PARTITIONS statement to list details about existing partitions.
toc: true
---

<span class="version-tag">New in v19.2:</span> Use the `SHOW PARTITIONS` [statement](sql-statements.html) to view details about existing [partitions](partitioning.html).

{{site.data.alerts.callout_info}}
[Defining table partitions](partitioning.html) is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

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
`zone_constraints` | The [zone constraints](configure-replication-zones.html), if replication zones are configured for the partition. `SHOW PARTITIONS` does not show inherited zone constraints.

## Examples

{% include {{page.version.version}}/sql/movr-statements-partitioning.md %}

{% include {{page.version.version}}/sql/partitioning-enterprise.md %}

Use [ALTER TABLE](alter-table.html) and [PARTITION BY](partition-by.html) to partition the `users` table by city.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users PARTITION BY LIST (city) (
    PARTITION new_york VALUES IN ('new york'),
    PARTITION chicago VALUES IN ('chicago'),
    PARTITION seattle VALUES IN ('seattle')
  );
~~~

Then partition the `vehicles` table and its secondary index by city:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles PARTITION BY LIST (city) (
    PARTITION new_york VALUES IN ('new york'),
    PARTITION chicago VALUES IN ('chicago'),
    PARTITION seattle VALUES IN ('seattle')
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX vehicles_auto_index_fk_city_ref_users PARTITION BY LIST (city) (
    PARTITION new_york VALUES IN ('new york'),
    PARTITION chicago VALUES IN ('chicago'),
    PARTITION seattle VALUES IN ('seattle')
  );
~~~

Use [`CONFIGURE ZONE`](configure-zone.html) to create [replication zone](configure-replication-zones.html) constraints on the `users` and `vehicles` tables and the `vehicles_auto_index_fk_city_ref_users` index.

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION new_york OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-east1]';
  ALTER PARTITION chicago OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-central1]';
  ALTER PARTITION seattle OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION new_york OF INDEX vehicles@primary CONFIGURE ZONE USING constraints='[+region=us-east1]';
  ALTER PARTITION chicago OF INDEX vehicles@primary CONFIGURE ZONE USING constraints='[+region=us-central1]';
  ALTER PARTITION seattle OF INDEX vehicles@primary CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION new_york OF INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-east1]';
  ALTER PARTITION chicago OF INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-central1]';
  ALTER PARTITION seattle OF INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

### Show table partitions

{% include copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM TABLE users;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |  index_name   | partition_value |   zone_constraints
+---------------+------------+----------------+------------------+--------------+---------------+-----------------+-----------------------+
  movr          | users      | new_york       | NULL             | city         | users@primary | ('new york')    | [+region=us-east1]
  movr          | users      | chicago        | NULL             | city         | users@primary | ('chicago')     | [+region=us-central1]
  movr          | users      | seattle        | NULL             | city         | users@primary | ('seattle')     | [+region=us-west1]
(3 rows)
~~~

You can also use [`SHOW CREATE TABLE`](show-create.html) to view partitions on a table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                                 create_statement
+------------+----------------------------------------------------------------------------------+
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | ) PARTITION BY LIST (city) (
             |     PARTITION new_york VALUES IN (('new york')),
             |     PARTITION chicago VALUES IN (('chicago')),
             |     PARTITION seattle VALUES IN (('seattle'))
             | );
             | ALTER PARTITION chicago OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=us-central1]';
             | ALTER PARTITION new_york OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=us-east1]';
             | ALTER PARTITION seattle OF INDEX movr.public.users@primary CONFIGURE ZONE USING
             |     constraints = '[+region=us-west1]'
(1 row)
~~~

If a partitioned table has no zones configured, the `SHOW CREATE TABLE` output includes a warning.

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION chicago OF TABLE users CONFIGURE ZONE DISCARD;
  ALTER PARTITION new_york OF TABLE users CONFIGURE ZONE DISCARD;
  ALTER PARTITION seattle OF TABLE users CONFIGURE ZONE DISCARD;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                      create_statement
+------------+-------------------------------------------------------------+
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | ) PARTITION BY LIST (city) (
             |     PARTITION new_york VALUES IN (('new york')),
             |     PARTITION chicago VALUES IN (('chicago')),
             |     PARTITION seattle VALUES IN (('seattle'))
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
  database_name | table_name | partition_name | parent_partition | column_names |                   index_name                   | partition_value |   zone_constraints
+---------------+------------+----------------+------------------+--------------+------------------------------------------------+-----------------+-----------------------+
  movr          | vehicles   | new_york       | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('new york')    | [+region=us-east1]
  movr          | vehicles   | chicago        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('chicago')     | [+region=us-central1]
  movr          | vehicles   | seattle        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('seattle')     | [+region=us-west1]
(3 rows)
~~~

### Show partitions by database

{% include copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM DATABASE movr;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |                   index_name                   | partition_value |   zone_constraints
+---------------+------------+----------------+------------------+--------------+------------------------------------------------+-----------------+-----------------------+
  movr          | users      | chicago        | NULL             | city         | users@primary                                  | ('chicago')     | [+region=us-central1]
  movr          | users      | new_york       | NULL             | city         | users@primary                                  | ('new york')    | [+region=us-east1]
  movr          | users      | seattle        | NULL             | city         | users@primary                                  | ('seattle')     | [+region=us-west1]
  movr          | vehicles   | chicago        | NULL             | city         | vehicles@primary                               | ('chicago')     | [+region=us-central1]
  movr          | vehicles   | chicago        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('chicago')     | [+region=us-central1]
  movr          | vehicles   | new_york       | NULL             | city         | vehicles@primary                               | ('new york')    | [+region=us-east1]
  movr          | vehicles   | new_york       | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('new york')    | [+region=us-east1]
  movr          | vehicles   | seattle        | NULL             | city         | vehicles@primary                               | ('seattle')     | [+region=us-west1]
  movr          | vehicles   | seattle        | NULL             | city         | vehicles@vehicles_auto_index_fk_city_ref_users | ('seattle')     | [+region=us-west1]
(9 rows)
~~~


## See also

- [Define Table Partitions](partitioning.html)
- [SQL Statements](sql-statements.html)
- [Geo-Partitioning](demo-geo-partitioning.html)
