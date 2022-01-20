---
title: Data Domiciling with ALTER DATABASE ... PLACEMENT RESTRICTED
summary: Learn how to implement data domiciling using CockroachDB's multi-region SQL capabilities and the ALTER DATABASE ... PLACEMENT RESTRICTED statement.
toc: true
---

{% include {{page.version.version}}/sql/data-domiciling-intro.md %}

## Overview

This page has instructions for data domiciling in [multi-region clusters](multiregion-overview.html) using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement. At a high level, this process involves:

1. Controlling the placement of specific row or table data using regional or global tables - specifically, the [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables), [`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables), and [`GLOBAL`](multiregion-overview.html#global-tables) table localities.
1. Further restricting where the data in those regional tables is stored using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement, which constrains the replicas for a row or table to be stored in only the [home regions](set-locality.html#crdb_region) associated with those rows or tables.

For more information, see the sections below.

## Prerequisites

This page assumes you are already familiar with:

- CockroachDB's [multi-region SQL abstractions](multiregion-overview.html).
- The fact that CockroachDB stores your data in [a distributed key-value store, which is split into chunks called ranges](architecture/distribution-layer.html#overview).

## Example

In the following example, you will go through the process of configuring the [MovR](movr.html) data set using [multi-region SQL statements](multiregion-overview.html). Then, as part of implementing a data domiciling strategy, you will apply stricter-than-default replica placement settings using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement. Finally, you will verify that the resulting replica placements are as expected using a combination of [replication reports](query-replication-reports.html), the [`SHOW RANGE FOR ROW`](show-range-for-row.html) statement, and queries against the [`crdb_internal.ranges_no_leases`](crdb-internal.html#ranges_no_leases) table.

For the purposes of this example, the data domiciling requirement is to configure a multi-region deployment of the [MovR database](movr.html) such that data for EMEA-based users, vehicles, etc. is being stored on CockroachDB nodes running in EMEA localities.

### Step 1. Start a simulated multi-region cluster

{% include {{page.version.version}}/sql/start-a-multi-region-demo-cluster.md %}

You now have a cluster running across 9 nodes, with 3 nodes each in the following regions:

- `us-east1`
- `us-west1`
- `europe-west1`

You can verify this using the [`SHOW REGIONS`](show-regions.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW REGIONS;
~~~

~~~
     region    |  zones  | database_names | primary_region_of
---------------+---------+----------------+--------------------
  europe-west1 | {b,c,d} | {}             | {}
  us-east1     | {b,c,d} | {}             | {}
  us-west1     | {a,b,c} | {}             | {}
(3 rows)
~~~

### Step 2. Apply multi-region SQL abstractions

Execute the following statements to set the [database regions](multiregion-overview.html#database-regions). This information is necessary so that CockroachDB can later move data around to optimize access to particular data from particular regions.

{% include copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PRIMARY REGION "europe-west1";
ALTER DATABASE movr ADD REGION "us-east1";
ALTER DATABASE movr ADD REGION "us-west1";
~~~

{% include {{page.version.version}}/sql/multiregion-movr-global.md %}

{% include {{page.version.version}}/sql/multiregion-movr-regional-by-row.md %}

### Step 3. View noncompliant replicas

Next, run a [replication report](query-replication-reports.html) to see which ranges are still not in compliance with your desired domiciling: that data on EMEA-based entities (users, etc.) does not leave EMEA-based nodes.

With the default settings, you should expect some replicas in the cluster to be violating this constraint. This is because [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) are enabled by default in [multi-region clusters](multiregion-overview.html) to enable stale reads of data in [regional tables](regional-tables.html) from outside those tables' [home regions](set-locality.html#crdb_region). For many use cases, this ispreferred, but it keeps you from meeting the domiciling requirements for this example.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM system.replication_constraint_stats WHERE violating_ranges > 0;
~~~

~~~
  zone_id | subzone_id |    type    |         config         | report_id |        violation_start        | violating_ranges
----------+------------+------------+------------------------+-----------+-------------------------------+-------------------
       52 |          0 | constraint | +region=europe-west1:1 |         1 | 2022-01-19 16:33:49.485535+00 |               10
       52 |          0 | constraint | +region=us-east1:1     |         1 | 2022-01-19 16:34:49.930886+00 |               58
       52 |          0 | constraint | +region=us-west1:1     |         1 | 2022-01-19 16:34:49.930886+00 |               61
~~~

Based on this output, you can see that plenty of replicas are out of compliance (see the `violating_ranges` column) for the reason described above: the presence of non-voting replicas in other regions to enable fast stale reads from those regions.

{{site.data.alerts.callout_info}}
The [Replication Reports](query-replication-reports.html) do not consider [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) located outside of a table's home region to be in compliance with the constraints on that table.
{{site.data.alerts.end}}

Next, run the query suggested in [the Replication Reports documentation](query-replication-reports.html#find-out-which-of-your-tables-have-a-constraint-violation) that should show which database and table names contain the `violating_ranges`.

{% include_cached copy-clipboard.html %}
~~~ sql
WITH
    partition_violations
        AS (
            SELECT
                *
            FROM
                system.replication_constraint_stats
            WHERE
                violating_ranges > 0
        ),
    report
        AS (
            SELECT
                crdb_internal.zones.zone_id,
                crdb_internal.zones.subzone_id,
                target,
                database_name,
                table_name,
                index_name,
                partition_violations.type,
                partition_violations.config,
                partition_violations.violation_start,
                partition_violations.violating_ranges
            FROM
                crdb_internal.zones, partition_violations
            WHERE
                crdb_internal.zones.zone_id
                = partition_violations.zone_id
        )
SELECT * FROM report;
~~~

~~~
  zone_id | subzone_id |    target     | database_name | table_name | index_name |    type    |         config         |        violation_start        | violating_ranges
----------+------------+---------------+---------------+------------+------------+------------+------------------------+-------------------------------+-------------------
       52 |          0 | DATABASE movr | movr          | NULL       | NULL       | constraint | +region=europe-west1:1 | 2022-01-19 16:33:49.485535+00 |               16
       52 |          0 | DATABASE movr | movr          | NULL       | NULL       | constraint | +region=us-west1:1     | 2022-01-19 16:34:49.930886+00 |               78
       52 |          0 | DATABASE movr | movr          | NULL       | NULL       | constraint | +region=us-east1:1     | 2022-01-19 16:34:49.930886+00 |               78
~~~

This output shows that the `movr` database has ranges out of compliance, which you saw previously. Unfortunately, this output does not contain the table or index names due to a limitation of the replication reports: non-voting replicas are not associated with any tables or indexes by the reports. For more information, see [cockroachdb/cockroach#75821](https://github.com/cockroachdb/cockroach/issues/75821).

Now that you know some replicas are out of compliance, you need to see exactly where the ranges for a given row of data are stored. To accomplish this, you must use the [`SHOW RANGE FOR ROW`](show-range-for-row.html) statement.

The values needed to find a range using `SHOW RANGE FOR ROW` are the columns in the row's [primary index](primary-key.html). To find out which columns are in the primary index for the `users` table, use the [`SHOW INDEXES`](show-index.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
show indexes from users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+------------+------------+--------------+-------------+-----------+---------+-----------
  users      | primary    |   false    |            1 | region      | ASC       |  false  |   true
  users      | primary    |   false    |            2 | city        | ASC       |  false  |  false
  users      | primary    |   false    |            3 | id          | ASC       |  false  |  false
  users      | primary    |   false    |            4 | name        | N/A       |  true   |  false
  users      | primary    |   false    |            5 | address     | N/A       |  true   |  false
  users      | primary    |   false    |            6 | credit_card | N/A       |  true   |  false
(6 rows)
~~~

The columns in the primary index are those values of `column_name` where the value of `index_name` is `primary` and the value of `storing` is `false`. The columns that meet these criteria are:

- `region`
- `city`
- `id`

To get the values of those columns for one row in EMEA, use the following [selection query](selection-queries.html):

{% include_cached copy-clipboard.html %}
~~~ sql
select region, city, id from users where region = 'europe-west1' limit 1;
~~~

~~~
     region    |   city    |                  id
---------------+-----------+---------------------------------------
  europe-west1 | amsterdam | ae147ae1-47ae-4800-8000-000000000022
(1 row)
~~~

To see exactly where the ranges for this row of data are stored in the cluster, pass the column values above to the [`SHOW RANGE FOR ROW`](show-range-for-row.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
show range from table users for row ('europe-west1', 'amsterdam', 'ae147ae1-47ae-4800-8000-000000000022');
~~~

~~~
  start_key |      end_key      | range_id | lease_holder |  lease_holder_locality   |  replicas   |                                                        replica_localities
------------+-------------------+----------+--------------+--------------------------+-------------+-----------------------------------------------------------------------------------------------------------------------------------
  /"\x80"   | /"\x80"/PrefixEnd |       75 |            9 | region=europe-west1,az=d | {1,6,7,8,9} | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(1 row)
~~~

The output above shows that:

- The replicas associated with this row of the `users` table have their home region in the `europe-west1` region
- In particular, the leaseholder is in the `europe-west1` region
- However, some of the non-leaseholder replicas are not in the `europe-west1` region, according to the value of the `replica_localities` column. That column shows that there are also non-leaseholder replicas located in the `us-east1` and `us-west1` regions. These are the [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) referenced previously. This shows that not all of the replicas associated with this row are meeting the requirement to be stored on nodes within EMEA localities.

To confirm the above replica placement information by other means, use the statement below to query the [`crdb_internal.ranges_no_leases` table](crdb-internal.html#ranges_no_leases) and see the value of its `replica_localities` column. The value of that column should match the output from the `SHOW RANGE FOR ROW` query above.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM crdb_internal.ranges_no_leases WHERE range_id = 162 AND database_name = 'movr' AND table_name = 'users' ORDER BY start_key ASC LIMIT 1;
~~~

~~~
  range_id |        start_key         |    start_pretty    |         end_key          |          end_pretty          | table_id | database_name | schema_name | table_name | index_name |  replicas   |                                                        replica_localities                                                        | voting_replicas | non_voting_replicas | learner_replicas | split_enforced_until
-----------+--------------------------+--------------------+--------------------------+------------------------------+----------+---------------+-------------+------------+------------+-------------+----------------------------------------------------------------------------------------------------------------------------------+-----------------+---------------------+------------------+-----------------------
       162 | \xbd\x8a\x12\x80\x00\x01 | /Table/53/2/"\x80" | \xbd\x8a\x12\x80\x00\x02 | /Table/53/2/"\x80"/PrefixEnd |       53 | movr          |             | users      |            | {3,5,7,8,9} | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {8,7,9}         | {3,5}               | {}               | NULL
(1 row)
~~~

### Step 4. Apply stricter replica placement settings

To ensure that data on EMEA-based users, vehicles, etc. from [`REGIONAL BY ROW` tables](regional-tables.html#regional-by-row-tables) is stored only on EMEA-based nodes in the cluster, you must disable the use of [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) on all of these tables. You can do this using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement.

To use this statement, you must set the `enable_multiregion_placement_policy` [session setting](set-vars.html) or the `sql.defaults.multiregion_placement_policy.enabled` [cluster setting](cluster-settings.html):

{% include_cached copy-clipboard.html %}
~~~ sql
SET enable_multiregion_placement_policy=on;
~~~

~~~
SET
~~~

Next, use the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement to disable non-voting replicas for regional tables:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PLACEMENT RESTRICTED;
~~~

~~~
ALTER DATABASE PLACEMENT
~~~

The restricted replica placement settings should start to apply immediately.

{{site.data.alerts.callout_info}}
[`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) does not affect the replica placement for [global tables](global-tables.html), which are designed to provide fast, up-to-date reads from all [database regions](multiregion-overview.html#database-regions).
{{site.data.alerts.end}}

### Step 5. Verify updated replica placement

Now that you have restricted the placement of non-voting replicas for all [regional tables](regional-tables.html), you can run another [replication report](query-replication-reports.html) to see the effects:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM system.replication_constraint_stats WHERE violating_ranges > 0;
~~~

~~~
  zone_id | subzone_id |    type    |       config       | report_id |        violation_start        | violating_ranges
----------+------------+------------+--------------------+-----------+-------------------------------+-------------------
       57 |          0 | constraint | +region=us-east1:1 |         1 | 2022-01-19 19:09:00.235247+00 |                1
       57 |          0 | constraint | +region=us-west1:1 |         1 | 2022-01-19 19:09:00.235247+00 |                1
~~~

The output above shows that there are now far fewer replicas that do not meet the data domiciling goal. As described above, [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) does not affect the replica placement for [`GLOBAL` tables](global-tables.html), so it's likely that these few replicas are part of a global table.

To verify that the constraint violating replicas are indeed part of a `GLOBAL` table, run the replication report query from [Step 3](#step-3-view-noncompliant-replicas) again as shown below. This will display the database and table names of these replicas.

{% include_cached copy-clipboard.html %}
~~~ sql
WITH
    partition_violations
        AS (
            SELECT
                *
            FROM
                system.replication_constraint_stats
            WHERE
                violating_ranges > 0
        ),
    report
        AS (
            SELECT
                crdb_internal.zones.zone_id,
                crdb_internal.zones.subzone_id,
                target,
                database_name,
                table_name,
                index_name,
                partition_violations.type,
                partition_violations.config,
                partition_violations.violation_start,
                partition_violations.violating_ranges
            FROM
                crdb_internal.zones, partition_violations
            WHERE
                crdb_internal.zones.zone_id
                = partition_violations.zone_id
        )
SELECT * FROM report;
~~~

~~~
  zone_id | subzone_id |            target             | database_name | table_name  | index_name |    type    |       config       |        violation_start        | violating_ranges
----------+------------+-------------------------------+---------------+-------------+------------+------------+--------------------+-------------------------------+-------------------
       57 |          0 | TABLE movr.public.promo_codes | movr          | promo_codes | NULL       | constraint | +region=us-east1:1 | 2022-01-19 19:09:00.235247+00 |                1
       57 |          0 | TABLE movr.public.promo_codes | movr          | promo_codes | NULL       | constraint | +region=us-west1:1 | 2022-01-19 19:09:00.235247+00 |                1
~~~

As expected, these replicas are part of the `promo_codes` table, which was configured to use the [`GLOBAL`](global-tables.html) [table locality](multiregion-overview.html#table-locality) in [Step 2](#step-2-apply-multi-region-sql-abstractions).

To verify the replica placement using [`SHOW RANGE FOR ROW`](show-range-for-row.html) for the same row as in [Step 3](#step-3-view-noncompliant-replicas), run the same query you ran earlier:

{% include_cached copy-clipboard.html %}
~~~ sql
show range from table users for row ('europe-west1', 'amsterdam', 'ae147ae1-47ae-4800-8000-000000000022');
~~~

~~~
  start_key |      end_key      | range_id | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
------------+-------------------+----------+--------------+--------------------------+----------+-------------------------------------------------------------------------------------
  /"\x80"   | /"\x80"/PrefixEnd |      137 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(1 row)
~~~

The output shows that the replicas underlying this data are now in compliance with the data domiciling requirements listed above: that data for EMEA-based entities (users, etc.) does not leave EMEA-based nodes.

Specifically, the output above shows that:

- The replicas underlying this row of the `users` table are based in the `europe-west-1` region
- The leaseholder is in the `europe-west1` region
- All of the `replica_localities` are in the `europe-west1` region as well (unlike in [Step 3](#step-3-view-noncompliant-replicas)), proving that the replicas underlying this row of data are meeting the domiciling requirement.

{% include_cached copy-clipboard.html %}
~~~ sql
select replica_localities from [show range from table users for row ('europe-west1', 'amsterdam', 'ae147ae1-47ae-4800-8000-000000000022')];
~~~

~~~
                                  replica_localities
--------------------------------------------------------------------------------------
  {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(1 row)
~~~

To confirm the above replica placement information by other means, use the statement below to query the [`crdb_internal.ranges_no_leases` table](crdb-internal.html#ranges_no_leases) and see the value of its `replica_localities` column. The value of that column should match the output from the `SHOW RANGE FOR ROW` query above.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT replica_localities FROM crdb_internal.ranges_no_leases WHERE range_id = 162 AND database_name = 'movr' AND table_name = 'users' ORDER BY start_key ASC LIMIT 1;
~~~

~~~ 
                                  replica_localities
--------------------------------------------------------------------------------------
  {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
(1 row)
~~~

Now that you have verified that the system is configured to meet the domiciling requirement, it's a good idea to run these verification queries on a regular basis (via automation of some kind) to ensure that the requirement continues to be met.


{{site.data.alerts.callout_info}}
The steps above are necessary but not sufficient to accomplish a data domiciling solution using CockroachDB. Be sure to review the [limitations of CockroachDB for data domiciling](#limitations) and design your total solution with those limitations in mind.
{{site.data.alerts.end}}

## Limitations

{% include {{page.version.version}}/sql/data-domiciling-limitations.md %}

## See also

- [Data Domiciling with CockroachDB](data-domiciling.html)
- [Data Domiciling with Separate Databases](data-domiciling-with-separate-databases.html)
- [Choosing a multi-region configuration](choosing-a-multi-region-configuration.html)
- [Install CockroachDB](install-cockroachdb.html)
- [Migrate to Multi-region SQL](migrate-to-multiregion-sql.html)
- [Multi-region Overview](multiregion-overview.html)
- [Multi-region SQL Performance](demo-low-latency-multi-region-deployment.html)
- [Multi-region overview](multiregion-overview.html)
- [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html)
- [When to use REGIONAL vs GLOBAL tables](when-to-use-regional-vs-global-tables.html)
- [When to use ZONE vs REGION survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [When to use `REGIONAL` vs. `GLOBAL` tables](when-to-use-regional-vs-global-tables.html)
- [When to use `ZONE` vs. `REGION` survival goals](when-to-use-zone-vs-region-survival-goals.html)
- [`ADD REGION`](add-region.html)
