---
title: Troubleshoot Replication Zone Configurations
summary: Troubleshooting guide for replication zones, which control the number and location of replicas for specific sets of data.
keywords: ttl, time to live, availability zone
toc: true
docs_area: manage
---

This page has instructions showing how to troubleshoot scenarios where you believe replicas are not behaving as specified by your zone configurations.

## Prerequisites

This page assumes you have read and understood the following materials:

- [Replication controls > Replication zone levels]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-levels), which describes how the hierarchy of inheritance of replication zones works. This is critical to understand for troubleshooting.
- [Monitoring and alerting > Critical nodes endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint), which is used to monitor if any of your cluster's ranges are under-replicated, or if your data placement constraints are being violated.
- [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}), which is the SQL statement used to view details about the replication zone configuration of various schema objects.

## Types of problems

There are several classes of common problems users encounter when [manually configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}#manage-replication-zones). Cockroach Labs does not recommend adding zone configurations manually, since it is easy to introduce logic errors. It's also difficult to do proper change management and auditing of manually tweaked zone configurations.  Most users should use [Multi-region SQL statements]({% link {{ page.version.version }}/multiregion-overview.md %}) instead; if more control is needed, [Zone config extensions]({% link {{ page.version.version }}/zone-config-extensions.md %}) can be used to augment the multi-region SQL statements.

Generally, the problems tend to fall into one of the following categories:

- "the system isn't sending replicas where I told it to"
- "the system isn't managing replicas how I told it to"

This behavior is almost always caused by a replication zone **misconfiguration**, but it can be difficult to see what the error is or how it was introduced. Zone configurations do not have much observability beyond `SHOW ZONE CONFIGURATIONS`, nor is there much built-in validation to prevent logic errors. It's easy to put the system in a state where you've told it to do two mutually incompatible things.

The most common class of logic error occurs because of the way inheritance works for replication zone configurations. As discussed in [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}#level-priorities), CockroachDB always uses the most granular replication zone available in a "bottom-up" fashion.

When you manually set a field at, say, the table level, it overrides the value that was already set at the next level up, in the parent database. If you later change something at the database level and find that it isn't working as expected for all tables, it may be that the more-specific settings you applied at the table level are overriding the database-level settings. In other words, the system is doing what it was told, because it is respecting the table-level change you already applied. However, this may not be what you _intended_.

As noted previously, the problems tend to fall into one of the following general categories:

- "the system isn't sending replicas where I told it to"
- "the system isn't doing what I told it to with the replica configuration"

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

The most common reason why "the thing isn't going where I told it to go" or "the thing isn't doing what I told it to do" is misconfiguration.

[XXX](): ADD THE THING ABOUT BACKUPS OVERWRITING ZONE CONFIGS ON RESTORE?  (via backup.md search for 'overwritten')

## Troubleshooting steps

Troubleshooting zone configs is difficult because it requires running a mix of one or more of the following statements, peering at their output, and deducing what went wrong. Specifically, running a mix of:

- [`SHOW ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}) for different levels of objects in the inheritance hierarchy and checking where they differ.
- [`SHOW ALL ZONE CONFIGURATIONS`]({% link {{ page.version.version }}/show-zone-configurations.md %}#view-all-replication-zones) and parsing the output into a tree-like format that lets you see what has changed. ([XXX](): is this really what we want to say?)

[XXX](): WRITE ME

### Run SQL statements

## Considerations

### Replication system priorities

A further wrinkle is that the [Replication Layer]({% link {{ page.version.version }}/architecture/replication-layer.md %})'s top priority is avoiding data loss, _not_ putting replicas exactly where you told it to. For more information about this limitation, see [the data domiciling docs]({% link {{ page.version.version }}/data-domiciling.md %}#known-limitations).

That said, the replication logic takes user-supplied zone configurations into account when allocating replicas.

### Replication lag

Sometimes the changes you make to a zone configuration are not reflected in the running system for a few minutes. Depending on the size of the cluster, this is expected behavior. It can take several minutes for changes to replica locality you specify in a changed zone config to propagate across a cluster. In general, the larger the cluster, the longer this process may take, due to the amount of data shuffling that occurs. In general, it's better to avoid making big changes to replica constraints on a large cluster unless you are prepared for it to take some time.

For more information about how to troubleshoot replication issues, especially under-replicated ranges, see [Troubleshoot Self-Hosted Setup > Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues).

## See also

- [Troubleshooting overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Troubleshoot Self-Hosted Setup > Replication issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#replication-issues)
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [Critical nodes status endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#critical-nodes-endpoint): check the status of your cluster's data replication, data placement, and zone constraint conformance.
