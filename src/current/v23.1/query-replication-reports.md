---
title: Replication Reports
summary: Verify that your cluster's data replication, data placement, and zone configurations are working as expected.
keywords: availability zone, zone config, zone configs, zone configuration, constraint, constraints
toc: true
docs_area: manage
---

{{site.data.alerts.callout_danger}}
The SQL API described on this page is deprecated and will be removed in a future release. **Due to architectural changes in CockroachDB, the SQL queries described here will not result in correct output.** To check the status of your cluster's data replication, data placement, and zone constraint conformance, use the [Critical nodes status endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint).
{{site.data.alerts.end}}

Several new and updated tables (listed below) are available to help you query the status of your cluster's data replication, data placement, and zone constraint conformance. For example, you can:

- See what data is under-replicated or unavailable.
- Show which of your localities (if any) are critical. A locality is "critical" for a range if all of the nodes in that locality becoming unreachable would cause the range to become unavailable. In other words, the locality contains a majority of the range's replicas.
- See if any of your cluster's data placement constraints are being violated.

{{site.data.alerts.callout_info}}
The information on this page assumes you are familiar with [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) and [partitioning]({% link {{ page.version.version }}/partitioning.md %}).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
**This is an experimental feature.**  The interface and output are subject to change.

In particular, the direct access to `system` tables shown here will not be a supported way to inspect CockroachDB in future versions. We're committed to adding stable ways to inspect these replication reports in the future, likely via `SHOW` statements and/or [views]({% link {{ page.version.version }}/views.md %}) and [built-in functions]({% link {{ page.version.version }}/functions-and-operators.md %}) in the `crdb_internal` schema.
{{site.data.alerts.end}}

## Conformance reporting tables

The following new and updated tables are available for verifying constraint conformance.

- [`system.reports_meta`](#system-reports_meta) contains metadata about the replication report data listed in the `system.replication_*` tables. Currently, the only metadata available is the report generation time.
- [`system.replication_stats`](#system-replication_stats) shows information about whether data is under-replicated, over-replicated, or unavailable.
- [`system.replication_constraint_stats`](#system-replication_constraint_stats) shows the status of any data placement constraints you've configured.
- [`system.replication_critical_localities`](#system-replication_critical_localities) shows which localities in your cluster (if any) are critical. A locality is "critical" for a range if all of the nodes in that locality becoming unreachable would cause the range to become unavailable. In other words, the locality contains a majority of the range's replicas.
- [`crdb_internal.zones`](#crdb_internal-zones) can be used with the tables above to figure out the databases and table names where the non-conforming or at-risk data is located.

To configure how often the conformance reports are run, adjust the `kv.replication_reports.interval` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), which accepts an [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}). For example, to run it every five minutes:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER setting kv.replication_reports.interval = '5m';
~~~

Only members of the `admin` role can access these tables. By default, the `root` user belongs to the `admin` role. Learn more about [users and roles]({% link {{ page.version.version }}/security-reference/authorization.md %}).

<a name="necessary-attributes"></a>

{{site.data.alerts.callout_info}}
The replication reports are only generated for zones that meet the following criteria:

- The zone overrides some replication attributes compared to their parent zone. Ranges in zones for which a report is not generated are counted in the report of the first ancestor zone for which a report is generated.

The attributes that must be overridden to trigger each report to run are:

| Report                            | Field(s)                       |
|-----------------------------------+--------------------------------|
| `replication_constraint_stats`    | `constraints`                  |
| `replication_critical_localities` | `constraints`,  `num_replicas` |
| `replication_stats`               | `constraints`, `num_replicas`  |

In addition to the above, the system's `default` zone always gets a report.
{{site.data.alerts.end}}

### system.replication_stats

The `system.replication_stats` report contains information about whether data is under-replicated, over-replicated, or unavailable.

For an example using this table, see [Find out which databases and tables have under-replicated ranges](#find-out-which-databases-and-tables-have-under-replicated-ranges).

 Ranges are considered under-replicated when one of the replicas is unresponsive. This includes the case when the node where the replica is stored is not running.

 This report considers a node to be dead (for the purposes of calculating the `unavailable_ranges` and `under_replicated_ranges` columns) if its [liveness record]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues) is expired, which occurs if the node is unresponsive for more than a few seconds. In versions of CockroachDB prior to 20.1, this report used the value of the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `server.time_until_store_dead`, which defaults to 5 minutes.

#### Columns

| Column name             | Data type          | Description                                                                                                                           |
|-------------------------+--------------------+---------------------------------------------------------------------------------------------------------------------------------------|
| zone_id                 | [`INT8`]({% link {{ page.version.version }}/int.md %}) | The ID of the [replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}).                                                                                |
| subzone_id              | [`INT8`]({% link {{ page.version.version }}/int.md %}) | The ID of the subzone (i.e., [partition]({% link {{ page.version.version }}/partitioning.md %})).                                                                         |
| report_id               | [`INT8`]({% link {{ page.version.version }}/int.md %}) | The ID of the [report](#system-reports_meta) that generated all of the rows in this table.                                            |
| total_ranges            | [`INT8`]({% link {{ page.version.version }}/int.md %}) | Total [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) in the zone this report entry is referring to.                                       |
| unavailable_ranges      | [`INT8`]({% link {{ page.version.version }}/int.md %}) | Unavailable ranges in the zone this report entry is referring to.                                                                     |
| under_replicated_ranges | [`INT8`]({% link {{ page.version.version }}/int.md %}) | [Under-replicated ranges]({% link {{ page.version.version }}/ui-replication-dashboard.md %}#under-replicated-ranges) in the zone this report entry is referring to.       |
| over_replicated_ranges  | [`INT8`]({% link {{ page.version.version }}/int.md %}) | Over-replicated ranges in the zone this report entry is referring to.                                                                 |

### system.replication_critical_localities

The `system.replication_critical_localities` report contains which of your localities (if any) are critical. A locality is "critical" for a range if all of the nodes in that locality becoming unreachable would cause the range to become unavailable. In other words, the locality contains a majority of the range's replicas.

That said, a locality being critical is not necessarily a bad thing as long as you are aware of it. What matters is that [you configure the topology of your cluster to get the resiliency you expect]({% link {{ page.version.version }}/topology-patterns.md %}).

As described in [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}#descriptive-attributes-assigned-to-nodes), localities are key-value pairs defined at [node startup time]({% link {{ page.version.version }}/cockroach-start.md %}#locality), and are ordered into _locality tiers_ that range from most inclusive to least inclusive (e.g., region before datacenter as in `region=eu,dc=paris`).

For an example using this table, see [Find out which databases and tables have ranges in critical localities](#find-out-which-databases-and-tables-have-ranges-in-critical-localities).

 This report considers a node to be dead (for the purposes of calculating the `at_risk_ranges` column) if its [liveness record]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues) is expired, which occurs if the node is unresponsive for more than a few seconds. In versions of CockroachDB prior to 20.1, this report used the value of the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `server.time_until_store_dead`, which defaults to 5 minutes.

#### Columns

| Column name    | Data type               | Description                                                                                                                         |
|----------------+-------------------------+-------------------------------------------------------------------------------------------------------------------------------------|
| zone_id        | [`INT8`]({% link {{ page.version.version }}/int.md %})      | The ID of the [replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}).                                                                              |
| subzone_id     | [`INT8`]({% link {{ page.version.version }}/int.md %})      | The ID of the subzone (i.e., [partition]({% link {{ page.version.version }}/partitioning.md %})).                                                                       |
| locality       | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The name of the critical [locality]({% link {{ page.version.version }}/configure-replication-zones.md %}#zone-config-node-locality).                                    |
| report_id      | [`INT8`]({% link {{ page.version.version }}/int.md %})      | The ID of the [report](#system-reports_meta) that generated all of the rows in this table.                                          |
| at_risk_ranges | [`INT8`]({% link {{ page.version.version }}/int.md %})      | The [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) that are at risk of becoming unavailable as of the time of this report. |

{{site.data.alerts.callout_info}}
If you have not [defined any localities]({% link {{ page.version.version }}/configure-replication-zones.md %}#zone-config-node-locality), this report will not return any results. It only reports on localities that have been explicitly defined.
{{site.data.alerts.end}}

### system.replication_constraint_stats

The `system.replication_constraint_stats` report lists violations to any data placement requirements you've configured.

For an example using this table, see [Find out which of your tables have a constraint violation](#find-out-which-of-your-tables-have-a-constraint-violation).

#### Columns

| Column name      | Data type                       | Description                                                                                             |
|------------------+---------------------------------+---------------------------------------------------------------------------------------------------------|
| zone_id          | [`INT8`]({% link {{ page.version.version }}/int.md %})              | The ID of the [replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}).                                                  |
| subzone_id       | [`INT8`]({% link {{ page.version.version }}/int.md %})              | The ID of the subzone (i.e., [partition]({% link {{ page.version.version }}/partitioning.md %})).                                           |
| type             | [`STRING`]({% link {{ page.version.version }}/string.md %})         | The type of zone configuration that was violated, e.g., `constraint`.                                   |
| config           | [`STRING`]({% link {{ page.version.version }}/string.md %})         | The YAML key-value pair used to configure the zone, e.g., `+region=europe-west1`.                       |
| report_id        | [`INT8`]({% link {{ page.version.version }}/int.md %})              | The ID of the [report](#system-reports_meta) that generated all of the rows in this table.              |
| violation_start  | [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) | The time when the violation was detected. Will return `NULL` if the number of `violating_ranges` is 0.  |
| violating_ranges | [`INT8`]({% link {{ page.version.version }}/int.md %})              | The [ranges]({% link {{ page.version.version }}/architecture/glossary.md %}#architecture-range) that are in violation of the configuration. |

### system.reports_meta

The `system.reports_meta` report contains metadata about when the replication reports were last run. Each report contains a number of report entries, one per zone.

Replication reports are run at the interval specified by the `kv.replication_reports.interval` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}).

#### Columns

| Column name | Data type                       | Description                                             |
|-------------+---------------------------------+---------------------------------------------------------|
| id          | [`INT8`]({% link {{ page.version.version }}/int.md %})              | The ID of the report that this report entry is part of. |
| generated   | [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) | When the report was generated.                          |

### crdb_internal.zones

The `crdb_internal.zones` table is useful for:

- Viewing your cluster's zone configurations in various formats: YAML, SQL, etc.
- Matching up data returned from the various replication reports with the names of the databases and tables, indexes, and partitions where that data lives.

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM crdb_internal.zones;
~~~

| column_name         | data_type               | description                                                                                                                     |
|---------------------+-------------------------+---------------------------------------------------------------------------------------------------------------------------------|
| zone_id             | [`INT8`]({% link {{ page.version.version }}/int.md %})      | The ID of the [replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}).                                                                          |
| subzone_id          | [`INT8`]({% link {{ page.version.version }}/int.md %})      | The ID of the subzone (i.e., [partition]({% link {{ page.version.version }}/partitioning.md %})).                                                                   |
| target              | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The "object" that the constraint is being applied to, e.g., `PARTITION us_west OF INDEX movr.public.users@users_pkey`.             |
| range_name          | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The zone's name.                                                                                                                |
| database_name       | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The [database]({% link {{ page.version.version }}/show-databases.md %}) where the `target`'s data is located.                                                       |
| table_name          | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The [table]({% link {{ page.version.version }}/show-tables.md %}) where the `target`'s data is located.                                                             |
| index_name          | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The [index]({% link {{ page.version.version }}/show-index.md %}) where the `target`'s data is located.                                                              |
| partition_name      | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The [partition]({% link {{ page.version.version }}/show-partitions.md %}) where the `target`'s data is located.                                                     |
| full_config_yaml    | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The YAML you used to [configure this replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}).                                       |
| full_config_sql     | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The SQL you used to [configure this replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}).                                        |
| raw_config_yaml     | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The YAML for this [replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}), showing only values the user changed from the defaults. |
| raw_config_sql      | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The SQL for this [replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}), showing only values the user changed from the defaults.  |
| raw_config_protobuf | [`BYTES`]({% link {{ page.version.version }}/bytes.md %})   | A protobuf representation of the configuration for this [replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}).                   |

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Find out which of your tables have a constraint violation

By default, this geo-distributed demo cluster will not have any constraint violations.

To introduce a violation that we can then query for, we'll modify the zone configuration of the `users` table.

1. Let's see what existing zone configurations are attached to the `users` table, so we know what to modify.

    {% include_cached copy-clipboard.html %}
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
                |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
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

1. To create a constraint violation, let's tell the ranges in the `europe_west` partition that they are explicitly supposed to *not* be in the `region=europe-west1` locality by issuing the following statement:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER PARTITION europe_west of INDEX movr.public.users@users_pkey CONFIGURE ZONE USING constraints = '[-region=europe-west1]';
    ~~~

Once the statement above executes, the ranges currently stored in that locality will now be in a state where they are explicitly not supposed to be in that locality, and are thus in violation of a constraint.

In other words, we are telling the ranges "where you are now is exactly where you are *not* supposed to be". This will cause the cluster to rebalance the ranges, which will take some time. During the time it takes for the rebalancing to occur, the ranges will be in violation.

By default, the system constraint conformance report runs once every minute. You can change that interval by modifying the `kv.replication_reports.interval` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}).

After the internal constraint conformance report has run again, the following query should report a violation:

{% include_cached copy-clipboard.html %}
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

To be more useful, we'd like to find out the database and table names where these constraint-violating ranges live. To get that information we'll need to join the output of `system.replication_constraint_stats` report with the `crdb_internal.zones` table using a query like the following:

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
  zone_id | subzone_id |                                             target                                             | database_name | table_name |                  index_name                   |    type    |        config        |         violation_start         | violating_ranges
+---------+------------+------------------------------------------------------------------------------------------------+---------------+------------+-----------------------------------------------+------------+----------------------+---------------------------------+------------------+
       53 |          1 | PARTITION us_west OF INDEX movr.public.users@users_pkey                                        | movr          | users      | users_pkey                                    | constraint | -region=europe-west1 | 2019-10-21 20:28:40.79508+00:00 |                1
       53 |          2 | PARTITION us_east OF INDEX movr.public.users@users_pkey                                        | movr          | users      | users_pkey                                    | constraint | -region=europe-west1 | 2019-10-21 20:28:40.79508+00:00 |                1
       53 |          3 | PARTITION europe_west OF INDEX movr.public.users@users_pkey                                    | movr          | users      | users_pkey                                    | constraint | -region=europe-west1 | 2019-10-21 20:28:40.79508+00:00 |                1
       54 |          1 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_pkey                                  | movr          | vehicles   | vehicles_pkey                                 | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       54 |          2 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles   | vehicles_auto_index_fk_city_ref_users         | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       54 |          3 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_pkey                                  | movr          | vehicles   | vehicles_pkey                                 | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       54 |          4 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles   | vehicles_auto_index_fk_city_ref_users         | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       54 |          5 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_pkey                              | movr          | vehicles   | vehicles_pkey                                 | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       54 |          6 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users      | movr          | vehicles   | vehicles_auto_index_fk_city_ref_users         | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       55 |          1 | PARTITION us_west OF INDEX movr.public.rides@rides_pkey                                        | movr          | rides      | rides_pkey                                    | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       55 |          2 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides      | rides_auto_index_fk_city_ref_users            | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       55 |          3 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       55 |          4 | PARTITION us_east OF INDEX movr.public.rides@rides_pkey                                        | movr          | rides      | rides_pkey                                    | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       55 |          5 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides      | rides_auto_index_fk_city_ref_users            | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       55 |          6 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
       55 |          7 | PARTITION europe_west OF INDEX movr.public.rides@rides_pkey                                    | movr          | rides      | rides_pkey                                    | constraint | +region=us-east1     | 2019-10-21 20:28:40.79508+00:00 |                1
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

By default, this geo-distributed demo cluster will not have any [under-replicated ranges]({% link {{ page.version.version }}/ui-replication-dashboard.md %}#under-replicated-ranges).

To force it into a state where some ranges are under-replicated, issue the following statement, which tells it to store 9 copies of each range underlying the `rides` table (by default [it stores 3]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas)).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE rides CONFIGURE ZONE USING num_replicas=9;
~~~

Once the statement above executes, the cluster will rebalance so that it's storing 9 copies of each range underlying the `rides` table. During the time it takes for the rebalancing to occur, these ranges will be considered "under-replicated", since there are not yet as many copies (9) of each range as you have just specified.

By default, the internal constraint conformance report runs once every minute. You can change that interval by modifying the `kv.replication_reports.interval` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}).

After the system constraint conformance report has run again, the following query should report under-replicated ranges:

{% include_cached copy-clipboard.html %}
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

To be more useful, we'd like to find out the database and table names where these under-replicated ranges live. To get that information we'll need to join the output of `system.replication_stats` report with the `crdb_internal.zones` table using a query like the following:

{% include_cached copy-clipboard.html %}
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
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_pkey                                        | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_pkey                                        | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_pkey                                        | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_pkey                                        | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_pkey                                        | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_pkey                                        | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_pkey                                    | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_pkey                                    | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_pkey                                    | NULL       | movr          | rides      | rides_pkey                                    |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | NULL       | movr          | rides      | rides_auto_index_fk_city_ref_users            |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | NULL       | movr          | rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |                       9
(30 rows)
~~~

### Find out which databases and tables have ranges in critical localities

The `system.replication_critical_localities` report contains which of your localities (if any) are critical. A locality is "critical" for a range if all of the nodes in that locality becoming unreachable would cause the range to become unavailable. In other words, the locality contains a majority of the range's replicas.

That said, a locality being critical is not necessarily a bad thing as long as you are aware of it. What matters is that [you configure the topology of your cluster to get the resiliency you expect]({% link {{ page.version.version }}/topology-patterns.md %}).

By default, the [movr demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}) has some ranges in critical localities. This is expected because it ties data for latency-sensitive queries to specific geographies at the cost of data unavailability during a region-wide failure.

{% include {{page.version.version}}/sql/use-multiregion-instead-of-partitioning.md %}

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM system.replication_critical_localities WHERE at_risk_ranges > 0;
~~~

~~~
  zone_id | subzone_id |      locality       | report_id | at_risk_ranges
+---------+------------+---------------------+-----------+----------------+
       53 |          1 | region=us-west1     |         2 |              3
       53 |          2 | region=us-east1     |         2 |              3
       53 |          3 | region=europe-west1 |         2 |              3
       54 |          2 | region=us-west1     |         2 |              6
       54 |          4 | region=us-east1     |         2 |              6
       54 |          6 | region=europe-west1 |         2 |              6
       55 |          3 | region=us-west1     |         2 |              9
       55 |          6 | region=us-east1     |         2 |              9
       55 |          9 | region=europe-west1 |         2 |              9
       56 |          1 | region=us-west1     |         2 |              3
       56 |          2 | region=us-east1     |         2 |              3
       56 |          3 | region=europe-west1 |         2 |              3
       58 |          1 | region=us-west1     |         2 |              3
       58 |          2 | region=us-east1     |         2 |              3
       58 |          3 | region=europe-west1 |         2 |              3
(15 rows)
~~~

To be more useful, we'd like to find out the database and table names where these ranges live that are at risk of unavailability in the event of a locality becoming unreachable. To get that information we'll need to join the output of `system.replication_critical_localities` report with the `crdb_internal.zones` table using a query like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH
	at_risk_zones AS (
			SELECT
				zone_id, locality, at_risk_ranges
			FROM
				system.replication_critical_localities
			WHERE
				at_risk_ranges > 0
		),
	report AS (
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
SELECT DISTINCT * FROM report;
~~~

~~~
  zone_id |                                             target                                             | database_name |         table_name         |                  index_name                   | at_risk_ranges
+---------+------------------------------------------------------------------------------------------------+---------------+----------------------------+-----------------------------------------------+----------------+
       53 | PARTITION us_west OF INDEX movr.public.users@users_pkey                                        | movr          | users                      | users_pkey                                    |              3
       53 | PARTITION us_east OF INDEX movr.public.users@users_pkey                                        | movr          | users                      | users_pkey                                    |              3
       53 | PARTITION europe_west OF INDEX movr.public.users@users_pkey                                    | movr          | users                      | users_pkey                                    |              3
       54 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_pkey                                  | movr          | vehicles                   | vehicles_pkey                                 |              6
       54 | PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6
       54 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_pkey                                  | movr          | vehicles                   | vehicles_pkey                                 |              6
       54 | PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_pkey                              | movr          | vehicles                   | vehicles_pkey                                 |              6
       54 | PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users      | movr          | vehicles                   | vehicles_auto_index_fk_city_ref_users         |              6
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_pkey                                        | movr          | rides                      | rides_pkey                                    |              9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9
       55 | PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_pkey                                        | movr          | rides                      | rides_pkey                                    |              9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9
       55 | PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_pkey                                    | movr          | rides                      | rides_pkey                                    |              9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | movr          | rides                      | rides_auto_index_fk_city_ref_users            |              9
       55 | PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | movr          | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |              9
       56 | PARTITION us_west OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | vehicle_location_histories_pkey               |              3
       56 | PARTITION us_east OF INDEX movr.public.vehicle_location_histories@primary                      | movr          | vehicle_location_histories | vehicle_location_histories_pkey               |              3
       56 | PARTITION europe_west OF INDEX movr.public.vehicle_location_histories@primary                  | movr          | vehicle_location_histories | vehicle_location_histories_pkey               |              3
       58 | PARTITION us_west OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | user_promo_codes_pkey                         |              3
       58 | PARTITION us_east OF INDEX movr.public.user_promo_codes@primary                                | movr          | user_promo_codes           | user_promo_codes_pkey                         |              3
       58 | PARTITION europe_west OF INDEX movr.public.user_promo_codes@primary                            | movr          | user_promo_codes           | user_promo_codes_pkey                         |              3
(24 rows)
~~~

To give another example, let's say your cluster were similar to the one shown above, but configured with [tiered localities]({% link {{ page.version.version }}/cockroach-start.md %}#locality) such that you had split `us-east1` into `{region=us-east1,dc=dc1, region=us-east1,dc=dc2, region=us-east1,dc=dc3}`. In that case, you wouldn't expect any DC to be critical, because the cluster would "diversify" each range's location as much as possible across data centers. In such a situation, if you were to see a DC identified as a critical locality, you'd be surprised and you'd take some action. For example, perhaps the diversification process is failing because some localities are filled to capacity. If there is no disk space free in a locality, your cluster cannot move replicas there.

{% include {{page.version.version}}/storage/free-up-disk-space.md %}

## See also

- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [Partitioning]({% link {{ page.version.version }}/partitioning.md %})
- [`PARTITION BY`]({% link {{ page.version.version }}/partitioning.md %})
- [`CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone)
- [Start a node]({% link {{ page.version.version }}/cockroach-start.md %})
- [Troubleshoot Replication Zones]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %})
