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

- [Replication controls > Replication zone levels]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-levels), which describes how the hierarchy of inheritance of replication zones works. **This is critical to understand for troubleshooting.**
- [Monitoring and alerting > Critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint), which is used to monitor if any of your cluster's ranges are under-replicated, or if your data placement constraints are being violated.
- [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}), which is the SQL statement used to view details about the replication zone configuration of various schema objects.

## Types of problems

The most common types of problems you may encounter when [manually configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}#manage-replication-zones) are:

1. The _replica location_ problem, a.k.a., "The replicas are not _where_ they should be". For replica location problems, the following zone config variables may be involved:
    - [`constraints`]({% link {{ page.version.version }}/configure-replication-zones.md %}#constraints)
    - [`lease_preferences`]({% link {{ page.version.version }}/configure-replication-zones.md %}#lease_preferences)
    - [`voter_constraints`]({% link {{ page.version.version }}/configure-replication-zones.md %}#voter_constraints)
    - [`global_reads`]({% link {{ page.version.version }}/configure-replication-zones.md %}#global_reads)
1. The _replica state_ problem_, a.k.a., "The replicas are not _how_ they should be". For replica state problems, the following zone config variables may be involved:
    - [`range_min_bytes`]({% link {{ page.version.version }}/configure-replication-zones.md %}#range-min-bytes)
    - [`range_max_bytes`]({% link {{ page.version.version }}/configure-replication-zones.md %}#range-max-bytes)
    - [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds)
    - [`num_replicas`]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas)
    - [`num_voters`]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_voters)

This document focuses specifically on the replica location problem. **The replica location problem is the most common reason for a troubleshooting session.**  It is most often caused by misconfiguration introduced by manually configuring replication zones, which is why we recommend sticking to abstractions like the [Multi-region SQL statements]({% link {{ page.version.version }}/multiregion-overview.md %}).

{{site.data.alerts.callout_info}}
If you just did a [cluster restore]({% link {{ page.version.version }}/restore.md %}#full-cluster) and are seeing problems with your zone configs, it may be because [your zone configs were overwritten by the restore](#zone-configs-are-overwritten-during-a-cluster-restore).
{{site.data.alerts.end}}

## Troubleshooting steps

[XXX](XXX): ACTUALLY WRITE ME

### Step 1. Start with target object and see what changed



### Step 2. Move upward in the inheritance hierarchy as needed

### Step 3. Confirm invalid replication behavior using critical nodes endpoint

Monitor the output of the [critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint) to see if you have ranges that are under-replicated or violating constraints.

This step is optional because even if the cluster is running as expected according to the reports from the critical nodes endpoint, as the operator you may be encountering [problems](#types-of-problems).

#### Get range IDs of ranges that are under-replicated or out of compliance

To get the range ID from the critical nodes endpoint of a range that is under-replicated, see [Critical nodes endpoint &gt; Replication status - under-replicated ranges]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#replication-status-under-replicated-ranges)

To get the range ID from the critical nodes endpoint of a range that is out of compliance with its specified constraints, see [Critical nodes endpoint &gt; Replication status - constraint violation]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#replication-status-constraint-violation).

#### Map from range IDs to schema objects

Once you have a range ID for a range that is under-replicated or out of compliance, you need to map from that range id to the name of a schema object that you can pass to [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %})

The following query uses the information provided by [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) to show, for each range ID, which tables and indexes use that range for their underlying storage.  The cluster is running a small [`movr` workload]({% link {{ page.version.version }}/cockroach-workload.md %}#movr-workload).

{% include_cached copy-clipboard.html %}
~~~ sql
    WITH movr_tables AS (SHOW RANGES FROM DATABASE movr WITH TABLES),
         movr_indexes AS (SHOW RANGES FROM DATABASE movr WITH INDEXES)
  SELECT movr_indexes.range_id,
         movr_tables.table_name,
         movr_indexes.index_name
    FROM movr_tables, movr_indexes
   WHERE movr_tables.range_id = movr_indexes.range_id
ORDER BY movr_tables.range_id
~~~

~~~
  range_id |         table_name         |                  index_name
-----------+----------------------------+------------------------------------------------
        71 | promo_codes                | promo_codes_pkey
        71 | user_promo_codes           | promo_codes_pkey
        78 | vehicle_location_histories | vehicle_location_histories_pkey
        78 | promo_codes                | vehicle_location_histories_pkey
        79 | user_promo_codes           | user_promo_codes_pkey
        85 | vehicle_location_histories | rides_auto_index_fk_vehicle_city_ref_vehicles
        85 | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles
        87 | users                      | users_pkey
        88 | users                      | users_pkey
        89 | users                      | users_pkey
        90 | users                      | users_pkey
        91 | users                      | users_pkey
        92 | vehicles                   | vehicles_pkey
        92 | users                      | users_pkey
        92 | users                      | vehicles_pkey
        92 | vehicles                   | users_pkey
        93 | users                      | users_pkey
        94 | users                      | users_pkey
        95 | vehicles                   | vehicles_pkey
        96 | vehicles                   | vehicles_pkey
        97 | vehicles                   | vehicles_pkey
        98 | rides                      | vehicles_pkey
        98 | rides                      | vehicles_auto_index_fk_city_ref_users
        98 | vehicles                   | rides_pkey
        98 | rides                      | rides_pkey
        98 | vehicles                   | vehicles_pkey
        98 | vehicles                   | vehicles_auto_index_fk_city_ref_users
        99 | vehicles                   | vehicles_pkey
       100 | vehicles                   | vehicles_pkey
       101 | vehicles                   | vehicles_pkey
       102 | vehicles                   | vehicles_pkey
       103 | rides                      | rides_pkey
       104 | rides                      | rides_pkey
       105 | rides                      | rides_pkey
       106 | rides                      | rides_pkey
       106 | rides                      | rides_auto_index_fk_city_ref_users
       107 | rides                      | rides_pkey
       108 | rides                      | rides_pkey
       109 | rides                      | rides_pkey
       110 | rides                      | rides_pkey
       111 | users                      | users_pkey
(41 rows)
~~~

If the critical nodes endpoint said the constraint violation was for range ID 103 (say), we would know to look at the zone configuration for the `rides` table and the `rides_pkey` primary index.

### Step 4. Start with Look at schema object's zone config ([XXX](XXX): REWRITE ME)

To look at the zone configurations for the `rides` table and the `rides@rides_pkey` index, run the following statements:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM TABLE rides;
~~~

~~~
     target     |              raw_config_sql
----------------+-------------------------------------------
  RANGE default | ALTER RANGE default CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 14400,
                |     num_replicas = 3,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW ZONE CONFIGURATION FROM INDEX rides@rides_pkey;
~~~

~~~
     target     |              raw_config_sql
----------------+-------------------------------------------
  RANGE default | ALTER RANGE default CONFIGURE ZONE USING
                |     range_min_bytes = 134217728,
                |     range_max_bytes = 536870912,
                |     gc.ttlseconds = 14400,
                |     num_replicas = 3,
                |     constraints = '[]',
                |     lease_preferences = '[]'
(1 row)
~~~

## Considerations

### Replication system priorities: data placement vs data durability

As noted in [Data Domiciling with CockroachDB]({% link {{ page.version.version }}/data-domiciling.md %}):

<blockquote markdown="1">
[Zone configs]({% link {{ page.version.version }}/configure-replication-zones.md %}) can be used for data placement but these features were historically built for performance, not for domiciling. The [replication system]({% link {{ page.version.version }}/architecture/replication-layer.md %})'s top priority is to prevent the loss of data and it may override the zone configurations if necessary to ensure data durability.
</blockquote>

### Performance considerations

Changes you make to a schema object's zone configuration may take some time to be reflected in the schema object's actual state, and can result in an increase in CPU usage, IOPS, and network traffic while the cluster rebalances replicas to meet the provided constraints. This is especially true for larger clusters.

For more information about how replica rebalancing works, see [Load-based replica rebalancing]({% link {{ page.version.version }}/architecture/replication-layer.md %}#load-based-replica-rebalancing).

### Zone configs are overwritten during a cluster restore

{% include {{ page.version.version }}/backups/zone-configs-overwritten-during-restore.md %}

For more information about how backup and restore work, see [Backup and Restore Overview]({% link {{ page.version.version }}/backup-and-restore-overview.md %}).

## See also

- [Troubleshooting overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Troubleshoot Self-Hosted Setup > Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues)
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [Critical nodes status endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint): check the status of your cluster's data replication, data placement, and zone constraint conformance.
