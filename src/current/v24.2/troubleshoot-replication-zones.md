---
title: Troubleshoot Replication Zones
summary: Troubleshooting guide for replication zones, which control the number and location of replicas for specific sets of data.
keywords: ttl, time to live, availability zone
toc: true
docs_area: manage
---

This page has instructions showing how to troubleshoot scenarios where you believe replicas are not behaving as specified by your [zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}).

{{site.data.alerts.callout_danger}}
{% include {{ page.version.version }}/zone-configs/avoid-manual-zone-configs.md %}
{{site.data.alerts.end}}

## Prerequisites

This page assumes you have read and understood the following:

- [Replication controls > Replication zone levels]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-levels), which describes how the inheritance hierarchy of replication zones works. **This is critical to understand for troubleshooting.**
- [Monitoring and alerting > Critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint), which is used to monitor if any of your cluster's ranges are under-replicated, or if your data placement constraints are being violated.
- [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}), which is the SQL statement used to view details about the replication zone configuration of various schema objects.

## Types of problems

The most common types of problems you may encounter when [manually configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}#manage-replication-zones) are:

1. The _replica location_ problem, a.k.a., "The replicas are not **where** they should be". For replica location problems, the following [zone config variables]({% link {{ page.version.version}}/configure-replication-zones.md %}#replication-zone-variables) may be involved:
    - [`constraints`]({% link {{ page.version.version }}/configure-replication-zones.md %}#constraints)
    - [`lease_preferences`]({% link {{ page.version.version }}/configure-replication-zones.md %}#lease_preferences)
    - [`voter_constraints`]({% link {{ page.version.version }}/configure-replication-zones.md %}#voter_constraints)
    - [`global_reads`]({% link {{ page.version.version }}/configure-replication-zones.md %}#global_reads)
1. The _replica state_ problem, a.k.a., "The replicas are not **how** they should be". For replica state problems, the following [zone config variables]({% link {{ page.version.version}}/configure-replication-zones.md %}#replication-zone-variables) may be involved:
    - [`range_min_bytes`]({% link {{ page.version.version }}/configure-replication-zones.md %}#range-min-bytes)
    - [`range_max_bytes`]({% link {{ page.version.version }}/configure-replication-zones.md %}#range-max-bytes)
    - [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds)
    - [`num_replicas`]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas)
    - [`num_voters`]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_voters)

The replica location problem is the most common. It is most often caused by misconfiguration introduced by manually configuring replication zones, which is [why manual zone config management is not recommended]({% link {{ page.version.version }}/configure-replication-zones.md %}#why-manual-zone-config-management-is-not-recommended). Most users should use the [multi-region SQL statements]({% link {{ page.version.version }}/multiregion-overview.md %}). If additional control is needed, [Zone config extensions]({% link {{ page.version.version }}/zone-config-extensions.md %}) can be used to augment the multi-region SQL statements.

{{site.data.alerts.callout_info}}
If you just did a [cluster restore]({% link {{ page.version.version }}/restore.md %}#full-cluster) and are seeing problems with your zone configs, it may be because [zone configs are overwritten by a cluster restore](#zone-configs-are-overwritten-during-cluster-restore).
{{site.data.alerts.end}}

## Troubleshooting steps

Use the following steps to determine which schema objects (if any) have zone configurations that are misconfigured. 

The examples assume a local multi-region [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster started using the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --global --nodes 9 --insecure
~~~

Next, execute the following statements to set the [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) for the [`movr` database]({% link {{ page.version.version }}/movr.md %}#the-movr-database):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr SET PRIMARY REGION "us-east1";
ALTER DATABASE movr ADD REGION "us-west1";
ALTER DATABASE movr ADD REGION "europe-west1";
~~~

<a name="step1"></a>

### Step 1. Start with a target schema object

Look at the zone configuration for the schema object that you think may be misconfigured. Depending on the [type of problem](#types-of-problems), you might have come to this conclusion by [monitoring the critical nodes endpoint](#monitoring).

Use the [`SHOW ZONE CONFIGURATION`]({% link {{ page.version.version }}/show-zone-configurations.md %}) statement to inspect the target object's zone configurations.

For example, to view the zone configuration for the `movr.rides` table:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FOR TABLE movr.users;
~~~

~~~
----------------+-------------------------------------------------------------------------------------------
  DATABASE movr | ALTER DATABASE movr CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 14400,
                |     num_replicas = 5,
                |     num_voters = 3,
                |     constraints = '{+region=europe-west1: 1, +region=us-east1: 1, +region=us-west1: 1}',
                |     voter_constraints = '[+region=us-east1]',
                |     lease_preferences = '[[+region=us-east1]]'
(1 row)
~~~

The preceding output is expected for a multi-region cluster spread across 9 nodes that was configured using [multi-region SQL]({% link {{ page.version.version }}/multiregion-overview.md %}). Since nothing about the zone configuration has been manually modified, the output shows that `movr.users` is using the zone configuration from its parent `movr` database. For more information about how this works, see [How zone config inheritance works]({% link {{ page.version.version }}/configure-replication-zones.md %}#how-zone-config-inheritance-works).

However, if the zone configuration had been manually modified, there could be inconsistencies in the output that would show a misconfiguration.

For example:

- If the [type of problem](#types-of-problems) were a [constraint violation](#monitoring), you'd want to check whether the values in [`constraints`]({% link {{ page.version.version }}/configure-replication-zones.md %}#constraints), [`voter_constraints`]({% link {{ page.version.version }}/configure-replication-zones.md %}#voter_constraints), and [`lease_preferences`]({% link {{ page.version.version }}/configure-replication-zones.md %}#lease_preferences) are logically inconsistent, which would cause constraint violations.
- If the [type of problem](#types-of-problems) were an [under-replicated range](#monitoring), you'd want to check the values of [`num_replicas`]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas) and [`num_voters`]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_voters). Modifying these values can cause under-replication. For example, `num_replicas` could be set too low. It's also easy to make an arithmetic mistake when configuring `num_voters`; if `num_voters` is less than `num_replicas`, the difference dictates the number of [non-voting replicas]({% link {{ page.version.version }}/architecture/replication-layer.md %}#non-voting-replicas). This is why most users should control non-voting replica placement with the high-level [multi-region SQL features]({% link {{ page.version.version }}/multiregion-overview.md %}) instead.
- If [range splits are failing]({% link {{ page.version.version }}/common-errors.md %}#split-failed-while-applying-backpressure-are-rows-updated-in-a-tight-loop), the value of [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) may be too high.

If the zone configuration for the target schema object looks good, [move to Step 2](#step2).

If the zone configuration does not look right, repair it now using [`ALTER TABLE ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-table.md %}#configure-zone). You can set the problem-causing field to another value, but often the best thing to do is to discard the changed settings using [`ALTER TABLE ... CONFIGURE ZONE DISCARD`]({% link {{ page.version.version }}/alter-table.md %}#remove-a-replication-zone) so that it returns to inheriting values from its parent object:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE movr.users CONFIGURE ZONE DISCARD;
~~~

<a name="step2"></a>

### Step 2. Move upward in the inheritance hierarchy as needed

If the target schema object looked good in [Step 1](#step1), look at its parent schema object at the next level up in [the inheritance hierarchy]({% link {{ page.version.version }}/configure-replication-zones.md%}#how-zone-config-inheritance-works).

This is the new target schema object. Return to [the previous step](#step1) and follow the instructions there.

Continue this process recursively until you either find the misconfigured zone configuration or make it all the way up to [the `default` replication zone]({% link {{ page.version.version }}/configure-replication-zones.md %}#view-the-default-replication-zone) and confirm that all of your schema objects have the expected zone configurations.

## Considerations

<a name="monitoring"></a>

### Monitor for ranges that are under-replicated or violating constraints

Monitor the output of the [critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint) to see if you have ranges that are under-replicated or violating constraints.

Using the range IDs from that endpoint, you can map from range IDs to schema objects as described in the following example. This will give you [a target schema object to start from](#step1).

- To monitor for under-replicated range IDs, see [Critical nodes endpoint &gt; Replication status - under-replicated ranges]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#replication-status-under-replicated-ranges).

- To monitor for range IDs that are violating constraints, see [Critical nodes endpoint &gt; Replication status - constraint violation]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#replication-status-constraint-violation).

Once you have a range ID, you need to map from that ID to the name of a schema object that you can pass to [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}).

The following example query uses the [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) statement to show, for each range ID, which tables and indexes use that range for their underlying storage. The query assumes the [`movr` schema]({% link {{ page.version.version }}/movr.md %}#the-movr-database) that is loaded by [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}), so you'll need to modify it to work with your schema.

{% include_cached copy-clipboard.html %}
~~~ sql
    WITH movr_tables AS (SHOW RANGES FROM DATABASE movr WITH TABLES),
         movr_indexes AS (SHOW RANGES FROM DATABASE movr WITH INDEXES)
  SELECT array_agg(movr_indexes.range_id) AS ranges,
         movr_tables.table_name,
         movr_indexes.index_name
    FROM movr_tables, movr_indexes
   WHERE movr_tables.range_id = movr_indexes.range_id
GROUP BY movr_tables.table_name, movr_indexes.index_name
ORDER BY table_name, index_name
~~~

In the following output, each range ID in the leftmost column maps to a table name and index name in the subsequent columns. For example, given this output, if the [critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint) said the constraint violation was for range ID `101`, we would know to look at the zone configuration(s) for the `users` table and the `users_pkey` primary index.

~~~
                ranges               |         table_name         |                  index_name
-------------------------------------+----------------------------+------------------------------------------------
  {150}                              | promo_codes                | promo_codes_pkey
  {150}                              | promo_codes                | rides_auto_index_fk_city_ref_users
  {150}                              | promo_codes                | rides_auto_index_fk_vehicle_city_ref_vehicles
  {150}                              | promo_codes                | rides_pkey
  {150}                              | promo_codes                | user_promo_codes_pkey
  {150}                              | promo_codes                | vehicle_location_histories_pkey
  {150}                              | rides                      | promo_codes_pkey
  {150}                              | rides                      | rides_auto_index_fk_city_ref_users
  {150}                              | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles
  {83,153,152,96,154,95,141,140,150} | rides                      | rides_pkey
  {150}                              | rides                      | user_promo_codes_pkey
  {150}                              | rides                      | vehicle_location_histories_pkey
  {83}                               | rides                      | vehicles_auto_index_fk_city_ref_users
  {83}                               | rides                      | vehicles_pkey
  {150}                              | user_promo_codes           | promo_codes_pkey
  {150}                              | user_promo_codes           | rides_auto_index_fk_city_ref_users
  {150}                              | user_promo_codes           | rides_auto_index_fk_vehicle_city_ref_vehicles
  {150}                              | user_promo_codes           | rides_pkey
  {150}                              | user_promo_codes           | user_promo_codes_pkey
  {150}                              | user_promo_codes           | vehicle_location_histories_pkey
  {101,73,72,71,100,70,81,80,90}     | users                      | users_pkey
  {90}                               | users                      | vehicles_pkey
  {150}                              | vehicle_location_histories | promo_codes_pkey
  {150}                              | vehicle_location_histories | rides_auto_index_fk_city_ref_users
  {150}                              | vehicle_location_histories | rides_auto_index_fk_vehicle_city_ref_vehicles
  {150}                              | vehicle_location_histories | rides_pkey
  {150}                              | vehicle_location_histories | user_promo_codes_pkey
  {150}                              | vehicle_location_histories | vehicle_location_histories_pkey
  {83}                               | vehicles                   | rides_pkey
  {90}                               | vehicles                   | users_pkey
  {83}                               | vehicles                   | vehicles_auto_index_fk_city_ref_users
  {90,94,93,92,85,91,84,82,83}       | vehicles                   | vehicles_pkey
(32 rows)
~~~

### Replication system priorities: data placement vs. data durability

As noted in [Data Domiciling with CockroachDB]({% link {{ page.version.version }}/data-domiciling.md %}):

<blockquote markdown="1">
*[Zone configs]({% link {{ page.version.version }}/configure-replication-zones.md %}) can be used for data placement but these features were historically built for performance, not for domiciling. The [replication system]({% link {{ page.version.version }}/architecture/replication-layer.md %})'s top priority is to prevent the loss of data and it may override the zone configurations if necessary to ensure data durability.*
</blockquote>

### Performance

Changes you make to a schema object's zone configuration may take some time to be reflected in the schema object's actual state, and can result in an increase in CPU usage, IOPS, and network traffic while the cluster rebalances replicas to meet the provided constraints. This is especially true for larger clusters.

For more information about how replica rebalancing works, see [Load-based replica rebalancing]({% link {{ page.version.version }}/architecture/replication-layer.md %}#load-based-replica-rebalancing).

### Zone configs are overwritten during cluster restore

{% include {{ page.version.version }}/backups/zone-configs-overwritten-during-restore.md %}

For more information, see [`RESTORE` considerations]({% link {{ page.version.version }}/restore.md %}#considerations).

## See also

- [Troubleshooting overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Troubleshoot Self-Hosted Setup > Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues)
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [Critical nodes status endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint): check the status of your cluster's data replication, data placement, and zone constraint conformance.
