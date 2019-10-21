---
title: Run Replication Reports
summary: Verify that your cluster's data replication, data placement, and zone configurations are working as expected.
keywords: availability zone, zone config, zone configs, zone configuration, constraint, constraints
toc: true
---

<span class="version-tag">New in v19.2:</span> Several new and updated tables (listed below) are available to help you report on your cluster's data replication, data placement, and zone constraint conformance. For example, you can:

- See what data is under-replicated or unavailable.
- Show which of your localities (if any) are critical. Critical localities are localities that, if they became unavailable, would lead to data loss. A locality being critical is not necessarily a bad thing, as long as it's what you expect.
- See if any of your cluster's data placement constraints are being violated.

{{site.data.alerts.callout_info}}
The information on this page assumes you are familiar with [replication zones](configure-replication-zones.html) and [partitioning](partitioning.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
**This is an experimental feature.**  The interface and output is subject to change.

In particular, the direct access to `system` tables shown here will not be a supported way to inspect CockroachDB in future versions. We're committed to add stable ways to inspect these replication reports in the future, likely via `SHOW` statements and/or [views](views.html) and [built-in functions](functions-and-operators.html) in the `crdb_internal` schema.
{{site.data.alerts.end}}

## Conformance reporting tables

The following new and updated tables are available for verifying constraint conformance.

- [`system.replication_stats`](#system-replication_stats) shows information about whether data is under-replicated, over-replicated, or unavailable.
- [`system.replication_constraint_stats`](#system-replication_constraint_stats) shows a list of violations to any data placement requirements you've configured.
- [`system.replication_critical_localities`](#system-replication_critical_localities) shows which localities in your cluster have data that is at risk in the event of node failures.
- [`system.reports_meta`](#system-reports_meta) lists the IDs and times when the replication reports were produced that generated the data in the `system.replication_*` tables.
- [`crdb_internal.zones`](#crdb_internal-zones) can be used with the tables above to figure out the databases and table names where the non-conforming or at-risk data is located.

To configure how often the conformance reports run, adjust the `kv.replication_reports.interval` [cluster setting](cluster-settings.html#kv-replication-reports-interval), which accepts an [`INTERVAL`](interval.html). For example, to run it every five minutes:

{% include copy-clipboard.html %}
~~~ sql
SET CLUSTER setting kv.replication_reports.INTERVAL = '00:05:00';
~~~

Only members of the `admin` role can access these tables. By default, the `root` user belongs to the `admin` role. For more information about users and roles, see [Manage Users](authorization.html#create-and-manage-users) and [Manage Roles](roles.html).

<a name="necessary-attributes"></a>

{{site.data.alerts.callout_info}}
The replication reports are only generated for zones that meet the following criteria:

- They override some replication attributes compared to their parent zone
- They don't have a parent zone

The attributes that must be overridden to trigger each report to run are:

| Report                            | Field(s)                       |
|-----------------------------------+--------------------------------|
| `replication_constraint_stats`    | `constraints`                  |
| `replication_critical_localities` | `constraints`,  `num_replicas` |
| `replication_stats`               | `constraints`, `num_replicas`  |
{{site.data.alerts.end}}

### system.replication_stats

The `system.replication_stats` table shows information about whether data is under-replicated, over-replicated, or unavailable.

For an example using this table, see [Find out which databases and tables have under-replicated ranges](#find-out-which-databases-and-tables-have-under-replicated-ranges).

{% include copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM system.replication_stats;
~~~

| Column name             | Data type          | Description                                                                                                                                                                     |
|-------------------------+--------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| zone_id                 | [`INT8`](int.html) | The ID of the [replication zone](configure-zone.html).                                                                                                                          |
| subzone_id              | [`INT8`](int.html) | The ID of the subzone (i.e., [partition](partition-by.html)).                                                                                                                   |
| report_id               | [`INT8`](int.html) | The ID of the [report](#system-reports_meta) that generated this data.                                                                                                          |
| total_ranges            | [`INT8`](int.html) | Total [ranges](architecture/overview.html#architecture-range) in this zone and any of its children that have not overwritten the [necessary attributes](#necessary-attributes). |
| unavailable_ranges      | [`INT8`](int.html) | Unavailable ranges in the zone this report entry is referring to.                                                                                                               |
| under_replicated_ranges | [`INT8`](int.html) | [Under-replicated ranges](admin-ui-replication-dashboard.html#under-replicated-ranges) in the zone this report entry is referring to.                                           |
| over_replicated_ranges  | [`INT8`](int.html) | Over-replicated ranges in the zone this report entry is referring to.                                                                                                           |

### system.replication_critical_localities

The `system.replication_critical_localities` table shows which of your localities (if any) are critical. Critical localities are localities that, if they became unavailable, would lead to data loss. A locality being critical is not necessarily a bad thing, as long as it's what you expect.

For an example using this table, see [Find out which databases and tables have at-risk ranges](#find-out-which-databases-and-tables-are-in-critical-localities).

{% include copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM system.replication_critical_localities;
~~~

| Column name    | Data type               | Description                                                                                                             |
|----------------+-------------------------+-------------------------------------------------------------------------------------------------------------------------|
| zone_id        | [`INT8`](int.html)      | The ID of the [replication zone](configure-zone.html).                                                                  |
| subzone_id     | [`INT8`](int.html)      | The ID of the subzone (i.e., [partition](partition-by.html)).                                                           |
| locality       | [`STRING`](string.html) | The name of the critical [locality](configure-replication-zones.html#zone-config-node-locality).                        |
| report_id      | [`INT8`](int.html)      | The ID of the [report](#system-reports_meta) that generated this data.                                                  |
| at_risk_ranges | [`INT8`](int.html)      | The [ranges](architecture/overview.html#architecture-range) that are at risk of data loss as of the time of the report. |

{{site.data.alerts.callout_info}}
If you have not [defined any localities](configure-replication-zones.html#zone-config-node-locality), this report will not return any results. It only reports on localities that have been explicitly defined.
{{site.data.alerts.end}}

### system.replication_constraint_stats

The `system.replication_constraint_stats` table lists violations to any data placement requirements you've configured.

For an example using this table, see [Find out which of your tables have a constraint violation](#find-out-which-of-your-tables-have-a-constraint-violation).

{% include copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM system.replication_constraint_stats;
~~~

| Column name      | Data type                       | Description                                                                                             |
|------------------+---------------------------------+---------------------------------------------------------------------------------------------------------|
| zone_id          | [`INT8`](int.html)              | The ID of the [replication zone](configure-zone.html).                                                  |
| subzone_id       | [`INT8`](int.html)              | The ID of the subzone (i.e., [partition](partition-by.html)).                                           |
| type             | [`STRING`](string.html)         | The type of zone configuration that was violated, e.g., `constraint`.                                   |
| config           | [`STRING`](string.html)         | The YAML key-value pair used to configure the zone, e.g., `+region=europe-west1`.                       |
| report_id        | [`INT8`](int.html)              | The ID of the [report](#system-reports_meta) that generated this data.                                  |
| violation_start  | [`TIMESTAMPTZ`](timestamp.html) | The time when the violation was detected.  Will return `NULL` if the number of `violating_ranges` is 0. |
| violating_ranges | [`INT8`](int.html)              | The [ranges](architecture/overview.html#architecture-range) that are in violation of the configuration. |

### system.reports_meta

The `system.reports_meta` table contains metadata about when the replication reports were last run.  Each report contains a number of report entries, one per zone.

Replication reports are run at the interval specified by the `kv.replication_reports.interval` [cluster setting](cluster-settings.html#kv-replication-reports-interval).

{% include copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM system.reports_meta;
~~~

| Column name | Data type                       | Description                                             |
|-------------+---------------------------------+---------------------------------------------------------|
| id          | [`INT8`](int.html)              | The ID of the report that this report entry is part of. |
| generated   | [`TIMESTAMPTZ`](timestamp.html) | When the report was generated.                          |

### crdb_internal.zones

The `crdb_internal.zones` table is useful for:

- Viewing your cluster's zone configurations in various formats: YAML, SQL, etc.
- Matching up data returned from the various replication reports with the names of the databases and tables, indexes, and partitions where that data lives.

{% include copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM crdb_internal.zones;
~~~

| column_name      | data_type               | description                                                                                                         |
|------------------+-------------------------+---------------------------------------------------------------------------------------------------------------------|
| zone_id          | [`INT8`](int.html)      | The ID of the [replication zone](configure-zone.html).                                                              |
| subzone_id       | [`INT8`](int.html)      | The ID of the subzone (i.e., [partition](partition-by.html)).                                                       |
| target           | [`STRING`](string.html) | The "object" that the constraint is being applied to, e.g., `PARTITION us_west OF INDEX movr.public.users@primary`. |
| range_name       | [`STRING`](string.html) | The printed representation of the range.                                                                            |
| database_name    | [`STRING`](string.html) | The [database](show-databases.html) where the `target`'s data is located.                                           |
| table_name       | [`STRING`](string.html) | The [table](show-tables.html) where the `target`'s data is located.                                                 |
| index_name       | [`STRING`](string.html) | The [index](show-index.html) where the `target`'s data is located.                                                  |
| partition_name   | [`STRING`](string.html) | The [partition](show-partitions.html) where the `target`'s data is located.                                         |
| full_config_yaml | [`STRING`](string.html) | The YAML you used to [configure this replication zone](configure-replication-zones.html).                           |
| full_config_sql  | [`STRING`](string.html) | The SQL you used to [configure this replication zone](configure-replication-zones.html).                            |

## Examples

The examples shown below are each using a [geo-partitioned demo cluster](cockroach-demo.html#run-cockroach-demo-with-geo-partitioned-replicas) started with the following command:

{% include copy-clipboard.html %}
~~~ shell
cockroach demo movr --geo-partitioned-replicas
~~~

### Find out which of your tables have a constraint violation

By default, this geo-distributed demo cluster will not have any constraint violations.

To introduce a violation that we can then query for, we'll modify the zone configuration of the `users` table.

First, let's see what existing zone configurations are attached to the `users` table, so we know what to modify.

{% include copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE users;
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

To create a constraint violation, let's tell the ranges in the `europe_west` partition that they are explicitly supposed to *not* be in the `region=europe-west1` locality by running the following statement:

{% include copy-clipboard.html %}
~~~ sql
ALTER PARTITION europe_west of INDEX movr.public.users@primary CONFIGURE ZONE USING constraints = '[-region=europe-west1]';
~~~

Once the statement above runs, the ranges currently stored in that locality will now be in a state where they are explicitly not supposed to be in that locality, and are thus in violation of a constraint.

In other words, we are telling the ranges "where you are now is exactly where you are *not* supposed to be". This will cause the cluster to rebalance the ranges, which will take some time. During the time it takes for the rebalancing to occur, the ranges will be in violation.

By default, the system constraint conformance report runs once every minute. You can change that interval by modifying the `kv.replication_reports.interval` [cluster setting](cluster-settings.html#kv-replication-reports-interval).

After the internal constraint conformance report has run again, the following query should report a violation:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM system.replication_constraint_stats WHERE violating_ranges > 0;
~~~

~~~
  zone_id | subzone_id |    type    |        config        | report_id |         violation_start         | violating_ranges  
+---------+------------+------------+----------------------+-----------+---------------------------------+------------------+
       53 |          2 | constraint | +region=us-east1     |         1 | 2019-10-21 20:28:40.79508+00:00 |                2  
       53 |          3 | constraint | -region=europe-west1 |         1 | 2019-10-21 20:28:40.79508+00:00 |                2  
       54 |          2 | constraint | +region=us-west1     |         1 | 2019-10-21 20:28:40.79508+00:00 |                1  
       54 |          4 | constraint | +region=us-east1     |         1 | 2019-10-21 20:28:40.79508+00:00 |                2  
       55 |          6 | constraint | +region=us-east1     |         1 | 2019-10-21 20:28:40.79508+00:00 |                4  
       55 |          9 | constraint | +region=europe-west1 |         1 | 2019-10-21 20:28:40.79508+00:00 |                6  
       56 |          2 | constraint | +region=us-east1     |         1 | 2019-10-21 20:28:40.79508+00:00 |                2  
       56 |          3 | constraint | +region=europe-west1 |         1 | 2019-10-21 20:28:40.79508+00:00 |                1  
       58 |          2 | constraint | +region=us-east1     |         1 | 2019-10-21 20:28:40.79508+00:00 |                2  
(9 rows)
~~~

To be more useful, we'd like to find out the database and table names where these constraint-violating ranges live. To get that information we'll need to join the output of `system.replication_constraint_stats` table with the `crdb_internal.zones` table using a query like the following:

{% include copy-clipboard.html %}
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
  zone_id | subzone_id |                                             target                                             | database_name | table_name |                  index_name                   |    type    |        config        |         violation_start         | violating_ranges  
+---------+------------+------------------------------------------------------------------------------------------------+---------------+------------+-----------------------------------------------+------------+----------------------+---------------------------------+------------------+
       53 |          1 | PARTITION us_west OF INDEX movr.public.users@primary                                           | movr          | users      | primary                                       | constraint | -region=europe-west1 | 2019-10-21 20:28:40.79508+00:00 |                1  
       53 |          2 | PARTITION us_east OF INDEX movr.public.users@primary                                           | movr          | users      | primary                                       | constraint | -region=europe-west1 | 2019-10-21 20:28:40.79508+00:00 |                1  
       53 |          3 | PARTITION europe_west OF INDEX movr.public.users@primary                                       | movr          | users      | primary                                       | constraint | -region=europe-west1 | 2019-10-21 20:28:40.79508+00:00 |                1  
       54 |          1 | PARTITION us_west OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles   | primary                                       | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       54 |          2 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles   | vehicles_auto_index_fk_city_ref_users         | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       54 |          3 | PARTITION us_east OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles   | primary                                       | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       54 |          4 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles   | vehicles_auto_index_fk_city_ref_users         | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       54 |          5 | PARTITION europe_west OF INDEX movr.public.vehicles@primary                                    | movr          | vehicles   | primary                                       | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       54 |          6 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users      | movr          | vehicles   | vehicles_auto_index_fk_city_ref_users         | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          1 | PARTITION us_west OF INDEX movr.public.rides@primary                                           | movr          | rides      | primary                                       | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          2 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides      | rides_auto_index_fk_city_ref_users            | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          3 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          4 | PARTITION us_east OF INDEX movr.public.rides@primary                                           | movr          | rides      | primary                                       | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          5 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides      | rides_auto_index_fk_city_ref_users            | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          6 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          7 | PARTITION europe_west OF INDEX movr.public.rides@primary                                       | movr          | rides      | primary                                       | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          8 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | movr          | rides      | rides_auto_index_fk_city_ref_users            | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
       55 |          9 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1  
(18 rows)
~~~

If you were to repeat this query at 60-second intervals, you would see that the number of results returned decreases and eventually falls to zero as the cluster rebalances the ranges to their new homes. Eventually you will see this output, which will tell you that the rebalancing has finished.

~~~
  zone_id | subzone_id | target | database_name | table_name | index_name | type | config | violation_start | violating_ranges  
+---------+------------+--------+---------------+------------+------------+------+--------+-----------------+------------------+
(0 rows)
~~~

### Find out which databases and tables have under-replicated ranges

By default, this geo-distributed demo cluster will not have any [under-replicated ranges](admin-ui-replication-dashboard.html#under-replicated-ranges).

To force it into a state where some ranges are under-replicated, issue the following statement, which tells it to store 9 copies of each range underlying the `rides` table (by default [it stores 3](configure-replication-zones.html#num_replicas)).

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE rides CONFIGURE ZONE USING num_replicas=9;
~~~

Once the statement above runs, the cluster will rebalance so that it's storing 9 copies of each range underlying the `rides` table. During the time it takes for the rebalancing to occur, these ranges will be considered "under-replicated", since there are not yet as many copies (9) of each range as you have just specified.

By default, the internal constraint conformance report runs once every minute. You can change that interval by modifying the `kv.replication_reports.interval` [cluster setting](cluster-settings.html#kv-replication-reports-interval).

After the system constraint conformance report has run again, the following query should report under-replicated ranges:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM system.replication_stats WHERE under_replicated_ranges > 0;
~~~

~~~
  zone_id | subzone_id | report_id | total_ranges | unavailable_ranges | under_replicated_ranges | over_replicated_ranges  
+---------+------------+-----------+--------------+--------------------+-------------------------+------------------------+
       55 |          0 |         3 |           28 |                  0 |                       6 |                      0  
       55 |          3 |         3 |            9 |                  0 |                       9 |                      0  
       55 |          6 |         3 |            9 |                  0 |                       9 |                      0  
       55 |          9 |         3 |            9 |                  0 |                       9 |                      0  
(4 rows)
~~~

To be more useful, we'd like to find out the database and table names where these under-replicated ranges live. To get that information we'll need to join the output of `system.replication_stats` table with the `crdb_internal.zones` table using a query like the following:

{% include copy-clipboard.html %}
~~~ sql
WITH
    under_replicated_zones
        AS (
            SELECT
                zone_id, under_replicated_ranges
            FROM
                system.replication_stats
            WHERE
                under_replicated_ranges > 0
        ),
    report
        AS (
            SELECT
                crdb_internal.zones.zone_id,
                target,
                range_name,
                database_name,
                table_name,
                index_name,
                under_replicated_zones.under_replicated_ranges
            FROM
                crdb_internal.zones, under_replicated_zones
            WHERE
                crdb_internal.zones.zone_id
                = under_replicated_zones.zone_id
        )
SELECT * FROM report;
~~~

~~~
  zone_id |                                             target                                             | range_name | database_name | table_name |                  index_name                   | under_replicated_ranges  
+---------+------------------------------------------------------------------------------------------------+------------+---------------+------------+-----------------------------------------------+-------------------------+
       55 | TABLE movr.public.rides                                                                        | NULL       | movr          | rides      | NULL                                          |                       9  
       55 | TABLE movr.public.rides                                                                        | NULL       | movr          | rides      | NULL                                          |                       9  
       55 | TABLE movr.public.rides                                                                        | NULL       | movr          | rides      | NULL                                          |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@primary                                           | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@primary                                           | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@primary                                           | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@primary                                           | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@primary                                           | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@primary                                           | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@primary                                       | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@primary                                       | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@primary                                       | NULL       | movr          | rides      | primary                                       |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9  
(30 rows)
~~~

### Find out which databases and tables are in critical localities

By default, this geo-distributed demo cluster will not have any at-risk ranges. A range is considered "at-risk" if its data could be lost.

shows which of your localities (if any) are critical. Critical localities are localities that, if they became unavailable, would lead to data loss. A locality being critical is not necessarily a bad thing, as long as it's what you expect.

To force the cluster into a state where some ranges are at risk, issue the following statement, which tells it to store 9 copies of each range underlying the `rides` table (by default [it stores 3](configure-replication-zones.html#num_replicas)).

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE rides CONFIGURE ZONE USING num_replicas=9;
~~~

Once the statement above runs, the cluster will rebalance so that it's storing 9 replicas of each range underlying the `rides` table.

This puts that data at risk since you are storing 9 copies of the table's data on only 9 nodes. If a node fails, you will be left with 8 replicas, and there will be no additional nodes to upreplicate the range to to fulfill the `num_replicas=9` requirement.

Another way to think about this is as follows: With the default `num_replicas` setting of 3, you are storing 3 bowling balls in 9 bags (given this 9-node demo cluster). If you lose a bag containing one of the bowling balls, you have 2 bowling balls in 8 bags, but you can make a "copy" (replica) of the bowling ball and put it in one of the empty bags (nodes).

When you set `num_replicas=9` on a 9-node cluster, you are asking to store 9 bowling balls in 9 bags. This means that in the event of a node failure, you now have 8 bowling balls in 8 bags, but you have told the cluster you want it to store 9 bowling balls. Since you can't put 9 bowling balls in 8 bags, there is nowhere to store a new "copy" of the bowling ball. The data represented by the bowling balls is now at risk.

By default, the internal constraint conformance report runs once every minute. You can change that interval by modifying the `kv.replication_reports.interval` [cluster setting](cluster-settings.html#kv-replication-reports-interval).

After the system constraint conformance report has run again, the following query should report quite a few at-risk ranges:

{% include copy-clipboard.html %}
~~~ sql
SELECT * FROM system.replication_critical_localities WHERE at_risk_ranges > 0;
~~~

~~~
  zone_id | subzone_id |      locality       | report_id | at_risk_ranges
+---------+------------+---------------------+-----------+----------------+
        0 |          0 | region=europe-west1 |         2 |              1
        0 |          0 | region=us-east1     |         2 |              1
        0 |          0 | region=us-west1     |         2 |              1
        1 |          0 | region=us-east1     |         2 |              1
       16 |          0 | region=us-east1     |         2 |              1
       53 |          1 | region=us-west1     |         2 |              3
       53 |          2 | region=us-east1     |         2 |              3
       53 |          3 | region=europe-west1 |         2 |              3
       54 |          2 | region=us-west1     |         2 |              4
       54 |          4 | region=us-east1     |         2 |              5
       54 |          6 | region=europe-west1 |         2 |              6
       55 |          0 | region=us-east1     |         2 |              1
       55 |          0 | region=us-west1     |         2 |              2
       55 |          3 | region=us-west1     |         2 |              8
       55 |          6 | region=us-east1     |         2 |              8
       55 |          9 | region=europe-west1 |         2 |              9
       56 |          1 | region=us-west1     |         2 |              3
       56 |          2 | region=us-east1     |         2 |              3
       56 |          3 | region=europe-west1 |         2 |              3
       58 |          1 | region=us-west1     |         2 |              3
       58 |          2 | region=us-east1     |         2 |              3
       58 |          3 | region=europe-west1 |         2 |              2
(22 rows)
~~~

To be more useful, we'd like to find out the database and table names where these at-risk ranges live. To get that information we'll need to join the output of `system.replication_critical_localities` table with the `crdb_internal.zones` table using a query like the following:

{% include copy-clipboard.html %}
~~~ sql
WITH
	at_risk_zones
		AS (
			SELECT
				zone_id, locality, at_risk_ranges
			FROM
				system.replication_critical_localities
			WHERE
				at_risk_ranges > 0
		),
	report
		AS (
			SELECT
				crdb_internal.zones.zone_id,
				target,
				database_name,
				table_name,
				index_name,
				at_risk_zones.at_risk_ranges
			FROM
				crdb_internal.zones, at_risk_zones
			WHERE
				crdb_internal.zones.zone_id
				= at_risk_zones.zone_id
		)
SELECT * FROM report;
~~~

~~~
  zone_id |                                             target                                             | database_name |         table_name         |                  index_name                   | at_risk_ranges  
+---------+------------------------------------------------------------------------------------------------+---------------+----------------------------+-----------------------------------------------+----------------+
        0 | RANGE default                                                                                  | NULL          | NULL                       | NULL                                          |              1  
       53 | PARTITION us_west OF INDEX movr.public.users@primary                                           | movr          | users                      | primary                                       |              3  
       53 | PARTITION us_west OF INDEX movr.public.users@primary                                           | movr          | users                      | primary                                       |              3  
       53 | PARTITION us_west OF INDEX movr.public.users@primary                                           | movr          | users                      | primary                                       |              3  
       53 | PARTITION us_east OF INDEX movr.public.users@primary                                           | movr          | users                      | primary                                       |              3  
       53 | PARTITION us_east OF INDEX movr.public.users@primary                                           | movr          | users                      | primary                                       |              3  
       53 | PARTITION us_east OF INDEX movr.public.users@primary                                           | movr          | users                      | primary                                       |              3  
       53 | PARTITION europe_west OF INDEX movr.public.users@primary                                       | movr          | users                      | primary                                       |              3  
       53 | PARTITION europe_west OF INDEX movr.public.users@primary                                       | movr          | users                      | primary                                       |              3  
       53 | PARTITION europe_west OF INDEX movr.public.users@primary                                       | movr          | users                      | primary                                       |              3  
       54 | PARTITION us_west OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION us_west OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION us_west OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION us_east OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION us_east OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION us_east OF INDEX movr.public.vehicles@primary                                        | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@primary                                    | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@primary                                    | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@primary                                    | movr          | vehicles                   | primary                                       |              6  
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users      | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users      | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users      | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6  
       55 | TABLE movr.public.rides                                                                        | movr          | rides                      | NULL                                          |              9  
       55 | TABLE movr.public.rides                                                                        | movr          | rides                      | NULL                                          |              9  
       55 | TABLE movr.public.rides                                                                        | movr          | rides                      | NULL                                          |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@primary                                           | movr          | rides                      | primary                                       |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@primary                                           | movr          | rides                      | primary                                       |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@primary                                           | movr          | rides                      | primary                                       |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@primary                                           | movr          | rides                      | primary                                       |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@primary                                           | movr          | rides                      | primary                                       |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@primary                                           | movr          | rides                      | primary                                       |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@primary                                       | movr          | rides                      | primary                                       |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@primary                                       | movr          | rides                      | primary                                       |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@primary                                       | movr          | rides                      | primary                                       |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9  
       56 | PARTITION us_west OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION us_west OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION us_west OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION us_east OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION us_east OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION us_east OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION europe_west OF INDEX movr.public.vehicle_location_histories@primary                  | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION europe_west OF INDEX movr.public.vehicle_location_histories@primary                  | movr          | vehicle_location_histories | primary                                       |              3  
       56 | PARTITION europe_west OF INDEX movr.public.vehicle_location_histories@primary                  | movr          | vehicle_location_histories | primary                                       |              3  
       58 | PARTITION us_west OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION us_west OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION us_west OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION us_east OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION us_east OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION us_east OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION europe_west OF INDEX movr.public.user_promo_codes@primary                            | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION europe_west OF INDEX movr.public.user_promo_codes@primary                            | movr          | user_promo_codes           | primary                                       |              3  
       58 | PARTITION europe_west OF INDEX movr.public.user_promo_codes@primary                            | movr          | user_promo_codes           | primary                                       |              3  
(76 rows)
~~~

## See also

- [Configure Replication Zones](configure-replication-zones.html)
- [Partitioning](partitioning.html)
- [`PARTITION BY`](partition-by.html)
- [`CONFIGURE ZONE`](configure-zone.html)
