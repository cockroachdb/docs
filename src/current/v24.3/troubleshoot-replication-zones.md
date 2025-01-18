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

- [Replication controls > Replication zone levels]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-levels), which describes how the hierarchy of inheritance of replication zones works. This is critical to understand for troubleshooting.
- [Monitoring and alerting > Critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint), which is used to monitor if any of your cluster's ranges are under-replicated, or if your data placement constraints are being violated.
- [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}), which is the SQL statement used to view details about the replication zone configuration of various schema objects.

## Types of problems

There are several classes of common problems users encounter when [manually configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}#manage-replication-zones).

Generally, the problems tend to fall into one of the following categories:

- "the replicas are not _where_ they should be"
- "the replicas are not _how_ they should be"

Specifically:

- If the problem is "the system isn't sending replicas where I told it to", see:
    - `constraints = '{+region=europe-west1: 1, +region=us-east1: 1, +region=us-west1: 1}',`
    - `voter_constraints = '[+region=us-east1]',`
    - `lease_preferences = '[[+region=us-east1]]'`
- If the problem is "the system isn't doing what I told it to with the replica configuration", see:
    - `num_replicas = 5,`
    - `range_min_bytes = 134217728,`
    - `range_max_bytes = 536870912,`
    - `gc.ttlseconds = 14400,`
    - `num_voters = 3,`

The most common reason for these problems is misconfiguration.

The most common class of logic error occurs because of the way inheritance works for replication zone configurations. As discussed in [Replication Controls > Level priorities]({% link {{ page.version.version }}/configure-replication-zones.md %}#level-priorities), CockroachDB always uses the most granular replication zone available in a "bottom-up" fashion.

When you manually set a field at, say, the table level, it overrides the value that was already set at the next level up, in the parent database. If you later change something at the database level and find that it isn't working as expected for all tables, it may be that the more-specific settings you applied at the table level are overriding the database-level settings. In other words, the system is doing what it was told, because it is respecting the table-level change you already applied. However, this may not be what you _intended_.

It's also possible that [you restored from a backup and your zone configs were overwritten](#zone-configs-are-overwritten-during-a-cluster-restore).

## Troubleshooting steps

### Step 1. (Optional) Confirm invalid replication behavior

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

### Step 2. Look at schema object's zone config

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

### Step 3. Think hard (???) about whether the behavior you're seeing is what you specified but not what you meant

[XXX](): WRITE MEEEE

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
