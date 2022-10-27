---
title: Data Domiciling with CockroachDB
summary: Learn how to use CockroachDB's multi-region SQL capabilities and the ALTER DATABASE ... PLACEMENT RESTRICTED statement as part of your data domiciling approach
toc: true
docs_area: deploy
---

As you scale your usage of [multi-region clusters](multiregion-overview.html), you may need to keep certain subsets of data in specific localities. Keeping specific data on servers in specific geographic locations is also known as _data domiciling_.

CockroachDB has basic support for data domiciling in multi-region clusters using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement.

{{site.data.alerts.callout_danger}}
Using CockroachDB as part of your approach to data domiciling has several limitations. For more information, see [Limitations](#limitations).
{{site.data.alerts.end}}

## Overview

This page has instructions for data domiciling in [multi-region clusters](multiregion-overview.html) using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement. At a high level, this process involves:

1. Controlling the placement of specific row or table data using regional tables with the [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) and [`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables) clauses.
1. Further restricting where the data in those regional tables is stored using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement, which constrains the replicas for a partition or table to be stored in only the [home regions](set-locality.html#crdb_region) associated with those rows or tables.

## Prerequisites

This page assumes you are already familiar with:

- CockroachDB's [multi-region SQL abstractions](multiregion-overview.html). If you are not using them, the instructions on this page will not apply.
- The fact that CockroachDB stores your data in [a distributed key-value store, which is split into chunks called ranges](architecture/distribution-layer.html#overview).

## Example

In the following example, you will go through the process of configuring the [MovR](movr.html) data set using [multi-region SQL statements](multiregion-overview.html). Then, as part of implementing a data domiciling strategy, you will apply restricted replica settings using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement. Finally, you will verify that the resulting replica placements are as expected using [replication reports](query-replication-reports.html).

For the purposes of this example, the data domiciling requirement is to configure a multi-region deployment of the [MovR database](movr.html) such that data for EU-based users, vehicles, etc. is being stored on CockroachDB nodes running in EU localities.

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/sql/super-regions-for-domiciling-with-region-survivability.md %}
{{site.data.alerts.end}}

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

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PRIMARY REGION "europe-west1";
ALTER DATABASE movr ADD REGION "us-east1";
ALTER DATABASE movr ADD REGION "us-west1";
~~~

{% include {{page.version.version}}/sql/multiregion-movr-global.md %}

{% include {{page.version.version}}/sql/multiregion-movr-regional-by-row.md %}

### Step 3. View noncompliant replicas

Next, run a [replication report](query-replication-reports.html) to see which ranges are still not in compliance with your desired domiciling: that data on EU-based entities (users, etc.) does not leave EU-based nodes.

On a small demo cluster like this one, the data movement from the previous step should have finished almost instantly; on larger clusters, the rebalancing process may take longer. For more information about the performance considerations of rebalancing data in multi-region clusters, see [Performance considerations](migrate-to-multiregion-sql.html#performance-considerations).

With the default settings, you should expect some replicas in the cluster to be violating this constraint. This is because [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) are enabled by default in [multi-region clusters](multiregion-overview.html) to enable stale reads of data in [regional tables](regional-tables.html) from outside those tables' [home regions](set-locality.html#crdb_region). For many use cases, this is preferred, but it keeps you from meeting the domiciling requirements for this example.

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

This output shows that the `movr` database has ranges out of compliance, which you saw previously. Unfortunately, this output does not contain the table or index names due to a current limitation of the replication reports: non-voting replicas are not associated with any tables or indexes by the reports.

### Step 4. Apply stricter replica placement settings

To ensure that data on EU-based users, vehicles, etc. from [`REGIONAL BY ROW` tables](regional-tables.html#regional-by-row-tables) is stored only on EU-based nodes in the cluster, you must disable the use of [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) on all of the [regional tables](regional-tables.html) in this database. You can do this using the [`ALTER DATABASE ... PLACEMENT RESTRICTED`](placement-restricted.html) statement.

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

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

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

Now that you have verified that the system is configured to meet the domiciling requirement, it's a good idea to run these replication reports on a regular basis (via automation of some kind) to ensure that the requirement continues to be met.

{{site.data.alerts.callout_info}}
The steps above are necessary but not sufficient to accomplish a data domiciling solution using CockroachDB. Be sure to review the [limitations of CockroachDB for data domiciling](#limitations) and design your total solution with those limitations in mind.
{{site.data.alerts.end}}

## Limitations

Using CockroachDB as part of your approach to data domiciling has several limitations:

- When columns are [indexed](indexes.html), a subset of data from the indexed columns may appear in [meta ranges](architecture/distribution-layer.html#meta-ranges) or other system tables. CockroachDB synchronizes these system ranges and system tables across nodes. This synchronization does not respect any multi-region settings applied via either the [multi-region SQL statements](multiregion-overview.html), or the low-level [zone configs](configure-replication-zones.html) mechanism.
- [Zone configs](configure-replication-zones.html) can be used for data placement but these features were historically built for performance, not for domiciling. The replication system's top priority is to prevent the loss of data and it may override the zone configurations if necessary to ensure data durability. For more information, see [Configure Replication Zones](configure-replication-zones.html#types-of-constraints).
- If your [log files](logging-overview.html) are kept in the region where they were generated, there is some cross-region leakage (like the system tables described previously), but the majority of user data that makes it into the logs is going to be homed in that region. If that's not strong enough, you can use the [log redaction functionality](configure-logs.html#redact-logs) to strip all raw data from the logs. You can also limit your log retention entirely.
- If you start a node with a [`--locality`](cockroach-start.html#locality) flag that says the node is in region _A_, but the node is actually running in some region _B_, data domiciling based on the inferred node placement will not work. A CockroachDB node only knows its locality based on the text supplied to the `--locality` flag; it can not ensure that it is actually running in that physical location.

## See also

- [How to Choose a Multi-region Configuration](choosing-a-multi-region-configuration.html)
- [Migrate to Multi-Region SQL](migrate-to-multiregion-sql.html)
- [Multi-Region Overview](multiregion-overview.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
- [Multi-Region Capabilities Overview](multiregion-overview.html)
- [Reads and Writes in CockroachDB](architecture/reads-and-writes-overview.html)
- [When to Use `REGIONAL` vs. `GLOBAL` Tables](when-to-use-regional-vs-global-tables.html)
- [When to Use `ZONE` vs. `REGION` Survival Goals](when-to-use-zone-vs-region-survival-goals.html)
- [`ADD REGION`](add-region.html)
- [Secondary regions](multiregion-overview.html#secondary-regions)
- [`ALTER DATABASE ... SET SECONDARY REGION`](set-secondary-region.html)
- [`ALTER DATABASE ... DROP SECONDARY REGION`](drop-secondary-region.html)
