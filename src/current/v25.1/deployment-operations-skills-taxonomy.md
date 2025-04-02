---
title: Deployment & Operations Skills Taxonomy
summary: Learn the foundational skills required to deploy and operate CockroachDB
toc: true
docs_area: deploy
---

This document outlines the foundational skills required to deploy and operate CockroachDB in production environments.

The skills are organized into sections based on the following operational domains:

- [Configuration](#configuration)
- [Security](#security)
- [Cluster maintenance](#cluster-maintenance)
- [Troubleshooting](#troubleshooting)
- [Disaster recovery](#disaster-recovery)

Each section includes links to relevant documentation for the listed skills.

## Configuration

- [Verify vCPU, RAM, storage, and disk IOPS performance]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware)
- [Configure time synchronization with NTP server]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-1-synchronize-clocks)
- [Validate network connectivity]({% link {{ page.version.version }}/known-limitations.md %}#cockroachdb-does-not-test-for-all-connection-failure-scenarios)

## Security

- [Create and distribute certificates; initialize cluster]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-2-generate-certificates)
- [Configure load balancer and direct a workload]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}#step-6-set-up-load-balancing)
- [Configure RBAC]({% link {{ page.version.version }}/security-reference/authorization.md %})
- [Encryption at rest]({% link {{ page.version.version }}/encryption.md %})

## Cluster maintenance

- [Shut down a node gracefully]({% link {{ page.version.version }}/node-shutdown.md %})
- [Handling unplanned node outages]({% link {{ page.version.version }}/recommended-production-settings.md %}#load-balancing)
- [Adding nodes]({% link {{ page.version.version }}/cockroach-start.md %}#add-a-node-to-a-cluster)
- [Removing nodes]({% link {{ page.version.version }}/node-shutdown.md %}?filters=decommission#remove-nodes)
- [Add a region]({% link {{ page.version.version }}/alter-database.md %}#add-regions-to-a-database)
- [Remove a region]({% link {{ page.version.version }}/alter-database.md %}#drop-region)
- [Rolling upgrades]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-patch-upgrade)
- Downgrade a cluster from a [patch version]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-patch-upgrade)
- Downgrade a cluster from a [major version]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#roll-back-a-major-version-upgrade)
- [Change a cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#change-a-cluster-setting)
- Cluster repaving involves the following individual skills, which are also used during [rolling upgrades]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#perform-a-patch-upgrade):
    1. [Shut down a node gracefully]({% link {{ page.version.version }}/node-shutdown.md %})
    1. Detach the [persistent volume]({% link {{ page.version.version }}/kubernetes-overview.md %}#kubernetes-terminology) (a.k.a. persistent disk) from the removed node's virtual machine (VM) (this step is optional but recommended)
    1. Delete the removed node's VM
    1. Start a new VM
    1. Reattach the persistent disk to the new VM (necessary if you did step #2)
    1. [Add a node to the cluster]({% link {{ page.version.version }}/cockroach-start.md %}#add-a-node-to-a-cluster) from the new VM

## Troubleshooting

- [SQL response time for specific queries]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#query-issues)
- [SQL throughput degradation across the board]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#low-throughput)
- [Cluster instability: Dead/suspect nodes]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues)
- [Out of memory problems]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash)
- [Imbalanced cluster load]({% link {{ page.version.version }}/architecture/replication-layer.md %}#load-based-replica-rebalancing)
- [EOF errors]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#client-connection-issues)
- [Changefeed is falling behind]({% link {{ page.version.version }}/advanced-changefeed-configuration.md %}#lagging-ranges)

## Disaster recovery

- [Create AWS IAM access key]({% link {{ page.version.version }}/cloud-storage-authentication.md %})
- [Create S3 bucket for backup data]({% link {{ page.version.version }}/use-cloud-storage.md %}#amazon-s3-storage-classes)
- [Full cluster backup to S3]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups)
- [Incremental backup to S3]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups)
- [Cluster restore from AWS S3]({% link {{ page.version.version }}/restore.md %}#restore-a-cluster)

## See also

- [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %})
- [Deploy CockroachDB Manually]({% link {{ page.version.version }}/manual-deployment.md %})
- [Deploy a Local Cluster from Binary (Secure)]({% link {{ page.version.version }}/secure-a-cluster.md %})
- [SQL Performance Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
- [Performance Tuning Recipes]({% link {{ page.version.version }}/performance-recipes.md %})
- [Troubleshoot Self-Hosted Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %})
