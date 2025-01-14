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

Troubleshooting zone configs is difficult because it requires running a mix of one or more of the following statements, peering at their output, and deducing what went wrong. Specifically, running a mix of:

- [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}) for different levels of objects in the inheritance hierarchy and checking where they differ.
- [`SHOW ALL ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}#view-all-replication-zones) and parsing the output into a tree-like format that lets you see what has changed. ([XXX](): is this really what we want to say?)

### confirm invalid behavior (critical nodes)

### get range ID of ranges out of compliance

### map range ID to schema object

### look at schema object's zone config

## Considerations

### Zone configs are overwritten during a cluster restore

{% include {{ page.version.version }}/backups/zone-configs-overwritten-during-restore.md %}

For more information about how backup and restore work, see [Backup and Restore Overview]({% link {{ page.version.version }}/backup-and-restore-overview.md %}).

### Replication system priorities: data placement vs data durability

As noted in [Data Domiciling with CockroachDB]({% link {{ page.version.version }}/data-domiciling.md %}):

> [Zone configs]({% link {{ page.version.version }}/configure-replication-zones.md %}) can be used for data placement but these features were historically built for performance, not for domiciling. The [replication system]({% link {{ page.version.version }}/architecture/replication-layer.md %})'s top priority is to prevent the loss of data and it may override the zone configurations if necessary to ensure data durability.

### Replication lag

Sometimes the changes you make to a zone configuration are not reflected in the running system for a few minutes. Depending on the size of the cluster, this is expected behavior. It can take several minutes for changes to replica locality settings to propagate across a large cluster. In general, the larger the cluster, the longer this process may take, due to the amount of data movement that occurs. There is also CPU cost, since [XXX](): LINK TO CPU BASED REBALANCING

In general, it's better to avoid making big changes to replica constraints on a large cluster unless you are prepared for it to take some time.

## See also

- [Troubleshooting overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Troubleshoot Self-Hosted Setup > Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues)
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [Critical nodes status endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint): check the status of your cluster's data replication, data placement, and zone constraint conformance.
