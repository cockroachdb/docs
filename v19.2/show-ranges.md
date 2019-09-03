---
title: SHOW RANGES
summary: The SHOW RANGES statement shows information about the ranges that comprise the data for a table, index, or entire database.
toc: true
redirect_from: [show-testing-ranges.html, show-experimental-ranges.html]
---

The `SHOW RANGES` [statement](sql-statements.html) shows information about the [ranges](architecture/overview.html#glossary) that comprise the data for a table, index, or entire database, including:

- The start and end keys for the range(s)
- The range ID(s)
- Which nodes contain the range [replicas](architecture/overview.html#glossary)
- Which node contains the range that is the [leaseholder](architecture/overview.html#glossary)
- Which [locality](start-a-node.html#locality) the leaseholder is in

This information is useful for verifying how SQL data maps to underlying ranges, and where the replicas for ranges are located.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_ranges.html %}
</div>

## Required privileges

The user must have the `SELECT` [privilege](authorization.html#assign-privileges) on the target table.

## Parameters

Parameter | Description
----------|------------
[`table_name`](sql-grammar.html#table_name) | The name of the table you want range information about.
[`table_index_name`](sql-grammar.html#table_index_name) | The name of the index you want range information about.
[`database_name`](sql-grammar.html#database_name) | The name of the database you want range information about.

## Examples

The following examples use MovR, a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. For more information about the MovR example application and dataset, see [MovR: A Global Vehicle-sharing App](movr.html).

### Show manually-split ranges

You can use the [`SPLIT AT`](split-at.html) statement to manually split table ranges based on primary and secondary index values.

#### Setup

To follow along with the example statements, run [`cockroach demo movr`](cockroach-demo.html) to start a temporary, in-memory cluster with the `movr` dataset pre-loaded:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo movr
~~~

Split the `users` table ranges based on primary key values:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SPLIT AT VALUES ('chicago'), ('new york'), ('seattle');
~~~
~~~
              key              |         pretty         |       split_enforced_until
+------------------------------+------------------------+----------------------------------+
  \275\211\022chicago\000\001  | /Table/53/1/"chicago"  | 2262-04-11 23:47:16.854776+00:00
  \275\211\022new york\000\001 | /Table/53/1/"new york" | 2262-04-11 23:47:16.854776+00:00
  \275\211\022seattle\000\001  | /Table/53/1/"seattle"  | 2262-04-11 23:47:16.854776+00:00
(3 rows)
~~~

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column, and then split the table ranges by secondary index values:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX revenue_idx ON rides(revenue);
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx SPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        |      pretty      |       split_enforced_until
+-------------------+------------------+----------------------------------+
  \277\214*2\000    | /Table/55/4/25   | 2262-04-11 23:47:16.854776+00:00
  \277\214*d\000    | /Table/55/4/5E+1 | 2262-04-11 23:47:16.854776+00:00
  \277\214*\226\000 | /Table/55/4/75   | 2262-04-11 23:47:16.854776+00:00
(3 rows)
~~~

{{site.data.alerts.callout_info}}
In the example output below, a `NULL` in the *Start Key* column means "beginning of table".  
A `NULL` in the *End Key* column means "end of table".
{{site.data.alerts.end}}

#### Show ranges for a table (primary index)

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE users;
~~~
~~~
   start_key  |   end_key   | range_id | replicas | lease_holder | locality
+-------------+-------------+----------+----------+--------------+----------+
  NULL        | /"chicago"  |       21 | {1}      |            1 |
  /"chicago"  | /"new york" |       27 | {1}      |            1 |
  /"new york" | /"seattle"  |       28 | {1}      |            1 |
  /"seattle"  | NULL        |       29 | {1}      |            1 |
(4 rows)
~~~

#### Show ranges for an index

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM INDEX rides@revenue_idx;
~~~
~~~
  start_key | end_key | range_id | replicas | lease_holder | locality
+-----------+---------+----------+----------+--------------+----------+
  NULL      | /25     |       30 | {1}      |            1 |
  /25       | /5E+1   |       31 | {1}      |            1 |
  /5E+1     | /75     |       32 | {1}      |            1 |
  /75       | NULL    |       33 | {1}      |            1 |
(4 rows)
~~~

#### Show ranges for a database

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM database movr;
~~~
~~~
          table_name         |  start_key  |   end_key   | range_id | replicas | lease_holder | locality
+----------------------------+-------------+-------------+----------+----------+--------------+----------+
  promo_codes                | NULL        | NULL        |       25 | {1}      |            1 |
  rides                      | NULL        | NULL        |       23 | {1}      |            1 |
  rides                      | NULL        | /25         |       30 | {1}      |            1 |
  rides                      | /25         | /5E+1       |       31 | {1}      |            1 |
  rides                      | /5E+1       | /75         |       32 | {1}      |            1 |
  rides                      | /75         | NULL        |       33 | {1}      |            1 |
  user_promo_codes           | NULL        | NULL        |       26 | {1}      |            1 |
  users                      | NULL        | /"chicago"  |       21 | {1}      |            1 |
  users                      | /"chicago"  | /"new york" |       27 | {1}      |            1 |
  users                      | /"new york" | /"seattle"  |       28 | {1}      |            1 |
  users                      | /"seattle"  | NULL        |       29 | {1}      |            1 |
  vehicle_location_histories | NULL        | NULL        |       24 | {1}      |            1 |
  vehicles                   | NULL        | NULL        |       22 | {1}      |            1 |
(13 rows)
~~~

### Show ranges across partitions

[Partitioning tables](partitioning.html) creates a distinct set of ranges for each partition.

#### Setup

To follow along with the partitioning examples below, open a new terminal and run [`cockroach demo movr`](cockroach-demo.html) with the `--nodes` and `--demo-locality` tags. This command opens an interactive SQL shell to a temporary, multi-node in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo movr \
--nodes=9 \
--demo-locality=region=us-east1,region=us-east1:region=us-east1:region=us-central1:region=us-central1:region=us-central1:region=us-west1:region=us-west1:region=us-west1
~~~

{% include {{page.version.version}}/sql/partitioning-enterprise.md %}

Use [`PARTITION BY`](partition-by.html) to partition the `users` table by city.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users PARTITION BY LIST (city) (
    PARTITION new_york VALUES IN ('new york'),
    PARTITION chicago VALUES IN ('chicago'),
    PARTITION seattle VALUES IN ('seattle')
  );
~~~

Partition the `vehicles` table and its secondary index by city:

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

Use [`CONFIGURE ZONE`](configure-zone.html) to create [replication zone](configure-replication-zones.html) constraints on the `users` and `vehicles` tables and the `vehicles_auto_index_fk_city_ref_users` index. Replication zones pin the partition replicas to nodes in a specific regions, using the [localities](start-a-node.html#locality) specified when nodes were started.

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION new_york OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-east1]';
  ALTER PARTITION chicago OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-central1]';
  ALTER PARTITION seattle OF TABLE users CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION new_york OF TABLE vehicles CONFIGURE ZONE USING constraints='[+region=us-east1]';
  ALTER PARTITION chicago OF TABLE vehicles CONFIGURE ZONE USING constraints='[+region=us-central1]';
  ALTER PARTITION seattle OF TABLE vehicles CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION new_york OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-east1]';
  ALTER PARTITION chicago OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-central1]';
  ALTER PARTITION seattle OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+region=us-west1]';
~~~

{{site.data.alerts.callout_info}}
In the example output below, a `NULL` in the *Start Key* column means "beginning of table".  
A `NULL` in the *End Key* column means "end of table".
{{site.data.alerts.end}}

#### Show ranges for a table (primary index)

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGES FROM TABLE vehicles] WHERE "start_key" NOT LIKE '%Prefix%';
~~~
~~~
   start_key  |        end_key        | range_id | replicas | lease_holder |      locality
+-------------+-----------------------+----------+----------+--------------+--------------------+
  /"new york" | /"new york"/PrefixEnd |       61 | {1,2,3}  |            2 | region=us-east1
  /"chicago"  | /"chicago"/PrefixEnd  |       64 | {4,5,6}  |            5 | region=us-central1
  /"seattle"  | /"seattle"/PrefixEnd  |       69 | {7,8,9}  |            9 | region=us-west1
(3 rows)
~~~

#### Show ranges for an index

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGES FROM INDEX vehicles_auto_index_fk_city_ref_users] WHERE "start_key" NOT LIKE '%Prefix%';
~~~
~~~
   start_key  |        end_key        | range_id | replicas | lease_holder |      locality
+-------------+-----------------------+----------+----------+--------------+--------------------+
  /"new york" | /"new york"/PrefixEnd |       63 | {1,2,3}  |            3 | region=us-east1
  /"chicago"  | /"chicago"/PrefixEnd  |       66 | {4,5,6}  |            4 | region=us-central1
  /"seattle"  | /"seattle"/PrefixEnd  |       70 | {7,8,9}  |            9 | region=us-west1
(3 rows)
~~~

#### Show ranges for a database

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW RANGES FROM database movr] WHERE "start_key" NOT LIKE '%Prefix%';
~~~
~~~
  table_name |  start_key  |        end_key        | range_id | replicas | lease_holder |      locality
+------------+-------------+-----------------------+----------+----------+--------------+--------------------+
  users      | /"new york" | /"new york"/PrefixEnd |       41 | {1,2,3}  |            2 | region=us-east1
  vehicles   | /"new york" | /"new york"/PrefixEnd |       61 | {1,2,3}  |            2 | region=us-east1
  vehicles   | /"new york" | /"new york"/PrefixEnd |       63 | {1,2,3}  |            3 | region=us-east1
  users      | /"chicago"  | /"chicago"/PrefixEnd  |       43 | {4,5,6}  |            4 | region=us-central1
  vehicles   | /"chicago"  | /"chicago"/PrefixEnd  |       66 | {4,5,6}  |            4 | region=us-central1
  vehicles   | /"chicago"  | /"chicago"/PrefixEnd  |       64 | {4,5,6}  |            5 | region=us-central1
  users      | /"seattle"  | /"seattle"/PrefixEnd  |       45 | {7,8,9}  |            8 | region=us-west1
  vehicles   | /"seattle"  | /"seattle"/PrefixEnd  |       69 | {7,8,9}  |            9 | region=us-west1
  vehicles   | /"seattle"  | /"seattle"/PrefixEnd  |       70 | {7,8,9}  |            9 | region=us-west1
(9 rows)
~~~

## See also

- [`SPLIT AT`](split-at.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
- [Partitioning tables](partitioning.html)
+ [Follow-the-Workload](demo-follow-the-workload.html)
+ [Architecture Overview](architecture/overview.html)
