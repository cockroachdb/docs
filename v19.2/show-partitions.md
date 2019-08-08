---
title: SHOW PARTITIONS
summary: Use the SHOW PARTITIONS statement to list details about existing partitions.
toc: true
---

Use the `SHOW PARTITIONS` [statement](sql-statements.html) to view details about existing [partitions](partitioning.html).

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

## Examples

{% include {{page.version.version}}/sql/movr-statements-nodes.md %}

### Create partitions

Use [ALTER TABLE](alter-table.html) and [PARTITION BY](partition-by.html) to partition the `users` table by city.

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE users PARTITION BY LIST (city) (
    PARTITION new_york VALUES IN ('new york'),
    PARTITION chicago VALUES IN ('chicago'),
    PARTITION seattle VALUES IN ('seattle')
  );
~~~

Then partition the `vehicles` table and its secondary index by city:
{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE vehicles PARTITION BY LIST (city) (
    PARTITION new_york VALUES IN ('new york'),
    PARTITION chicago VALUES IN ('chicago'),
    PARTITION seattle VALUES IN ('seattle')
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER INDEX vehicles_auto_index_fk_city_ref_users PARTITION BY LIST (city) (
    PARTITION new_york VALUES IN ('new york'),
    PARTITION chicago VALUES IN ('chicago'),
    PARTITION seattle VALUES IN ('seattle')
  );
~~~

### Configure replication zones

Use [CONFIGURE ZONE](https://www.cockroachlabs.com/docs/v19.2/configure-zone.html) to create [replication zone](configure-replication-zones.html) constraints on the users and vehicles tables and the vehicles_auto_index_fk_city_ref_users index.

{% include copy-clipboard.html %}
~~~ sql
ALTER PARTITION new_york OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-east1]';
ALTER PARTITION chicago OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-central1]';
ALTER PARTITION seattle OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER PARTITION new_york OF TABLE vehicles CONFIGURE ZONE USING constraints='[+region=us-east1]';
ALTER PARTITION chicago OF TABLE vehicles CONFIGURE ZONE USING constraints='[+region=us-central1]';
ALTER PARTITION seattle OF TABLE vehicles CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER PARTITION new_york OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-east1]';
ALTER PARTITION chicago OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-central1]';
ALTER PARTITION seattle OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

### Show table partitions

{% include copy-clipboard.html %}
~~~ sql
SHOW PARTITIONS FROM TABLE users;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |  index_name   | partition_value |   zone_constraints
+---------------+------------+----------------+------------------+--------------+---------------+-----------------+-----------------------+
  movr          | users      | new_york       | NULL             | city         | users@primary | ('new york')    | [+region=us-east1]
  movr          | users      | chicago        | NULL             | city         | users@primary | ('chicago')     | [+region=us-central1]
  movr          | users      | seattle        | NULL             | city         | users@primary | ('seattle')     | [+region=us-west1]
(3 rows)
~~~

### Show partitions by index

{% include copy-clipboard.html %}
~~~ sql
SHOW PARTITIONS FROM INDEX vehicles@vehicles_auto_index_fk_city_ref_users;
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
SHOW PARTITIONS FROM DATABASE movr;
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
