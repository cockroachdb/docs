---
title: Restoring Backups Across Versions
summary: CockroachDB's support policy for restoring backups across versions.
toc: true
docs_area: manage
---

This page describes the support Cockroach Labs provides for restoring backups across major versions of CockroachDB. The sections outline the support and examples for the most common use cases when restoring backups across versions:

- [Support for restoring backups into a higher version](#support-for-restoring-backups-into-a-higher-version)
- [Restore into a higher version](#restore-into-a-higher-version)
- [Support for long-term backup archival](#support-for-long-term-backup-archival)

## Support for restoring backups into a higher version

Cockroach Labs supports restoring a backup taken on a cluster on a specific major version into a cluster that is on the next major version. Therefore, if you took a backup on major version N, you can restore it on major version N+1.

For example, backups taken on v21.1.x can be restored into v21.2.x. Backups taken on v21.2.x can be restored into v22.1.x. The following table outlines this support:

Backup taken on version   | Restorable into version
--------------------------+--------------------------
20.1.x                    | 20.2.x
20.2.x                    | 21.1.x
21.1.x                    | 21.2.x
21.2.x                    | 22.1.x
22.1.x                    | 22.2.x

See the following section, [Restore into a higher version](#restore-into-a-higher-version), for an example of of restoring from multiple major versions previous to a higher version.

{{site.data.alerts.callout_info}}
Cockroach Labs does **not** support restoring backups from a higher version into a lower version. 
{{site.data.alerts.end}}

## Restore into a higher version

When you upgrade from version N to N+1, you can restore version N backup into version N+1. Then, you can take a new backup on the version you just upgraded to. If you need to restore a backup that was taken with on an earlier version, you would repeat this process until you have fully upgraded to the desired version.

For example, you have taken a backup on v20.2.x and you want to upgrade to v22.1.x. You would upgrade and back up through the following process:

1. Upgrade from v20.2.x to v21.1.x:
    1. Finalize your upgrade. See [Upgrade to CockroachDB v21.1](../v21.1/upgrade-cockroach-version.html) for the necessary steps to upgrade.
    1. [Restore your backup](restore.html#examples) from v20.2.x into the v21.1.x upgraded cluster.
    1. [Take a new backup](backup.html#examples) on the v21.1.x cluster.
1. Upgrade from v21.1.x to v21.2.x:
    1. Finalize your upgrade. See [Upgrade to CockroachDB v21.2](../v21.2/upgrade-cockroach-version.html) for the necessary steps to upgrade.
    1. Restore your backup from v21.1.x into the v21.2.x upgraded cluster.
    1. Take a new backup on the v21.2.x cluster.
1. Upgrade from v21.2.x to v22.1.x:
    1. Finalize your upgrade. See [Upgrade to CockroachDB v22.1](../v22.1/upgrade-cockroach-version.html) for the necessary steps to upgrade.
    1. Restore your backup from v21.2.x into the v22.1.x upgraded cluster.
    1. Take a new backup on the v22.1.x cluster.

See the [Upgrade Policy](../cockroachcloud/upgrade-policy.html) page for details on version upgrades to {{ site.data.products.db }} clusters.

## Support for long-term backup archival

When you need to archive a backup for the long term, we recommend that you also archive the CockroachDB binary of the version that the backup was taken on. However, for this method, it is necessary that the binary can still be run **and** is able to upgrade to a version that is supported.

For a true archival copy that is not dependent on CockroachDB at all, running an [`EXPORT INTO CSV`](export.html) and archiving the files would be a better approach instead of taking a backup. You can also use changefeeds to export data in this way, see [Export Data with Changefeeds](export-data-with-changefeeds.html) for more detail.

## See also

- [`RESTORE`](restore.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)