---
title: Restoring Backups Across Versions
summary: CockroachDB's support policy for restoring backups across versions.
toc: true
docs_area: manage
---

This page describes the support Cockroach Labs provides for restoring backups across major versions of CockroachDB. The sections outline the support for the most common use cases when restoring backups across versions:

- [Support for restoring backups into a newer version](#support-for-restoring-backups-into-a-newer-version)
- [Support for long-term backup archival](#support-for-long-term-backup-archival)

{{site.data.alerts.callout_info}}
Since CockroachDB considers the cluster version when running a backup, this page refers to versions in a "{{ page.version.version }}.x" format. For example, both {{ page.version.version }}.1 and {{ page.version.version }}.2 are considered as {{ page.version.version }} clusters for backup purposes.
{{site.data.alerts.end}}

{% include {{page.version.version}}/backups/recommend-backups-for-upgrade.md%} See [how to upgrade to the latest version of CockroachDB]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}).

## Support for restoring backups into a newer version

Cockroach Labs supports restoring a backup taken on a cluster on a specific major version into a cluster that is on the same version or the next major version. Therefore, when upgrading your cluster from version N to N+1, if you took a backup on major version N, you can restore it to your cluster on either major version N or N+1. 

Additionally, you can skip an [innovation release]({% link releases/index.md %}#major-releases) version when restoring a backup. Innovation releases are intermediate releases that introduce new features, but are not long-term supported versions.

Other than skipping innovation releases, restoring backups outside major version N or N+1 is **not supported**.

For example, backups taken on v24.1.x can be restored into v24.3.x (skipping the v24.2 innovation release). Backups taken on v24.3.x can be restored into v25.1.x:

Backup taken on version   | Restorable into version
--------------------------+--------------------------
23.2.x                    | 23.2.x, 24.1.x
24.1.x                    | 24.1.x, 24.2.x, 24.3.x
24.2.x (innovation)       | 24.2.x, 24.3.x
24.3.x                    | 24.3.x, 25.1.x (innovation), 25.2.x

Refer to [Recent releases]({% link releases/index.md %}#recent-releases) and [Upcoming releases]({% link releases/index.md %}#upcoming-releases).

When a cluster is in a mixed-version state during an upgrade, [full cluster restores]({% link {{ page.version.version }}/restore.md %}#restore-a-cluster) will fail. See the [Upgrade documentation]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}) for the necessary steps to finalize your upgrade. For CockroachDB {{ site.data.products.cloud }} clusters, see the [CockroachDB Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}) page.

{{site.data.alerts.callout_info}}
Cockroach Labs does **not** support restoring backups from a higher version into a lower version.
{{site.data.alerts.end}}

## Support for long-term backup archival

When you need to archive a backup for the long term, we recommend that you also archive the CockroachDB binary of the version that the backup was taken on.

For a true archival copy that is not dependent on CockroachDB at all, running a changefeed to export your data from CockroachDB and archiving the files would be a better approach instead of taking a backup. See [Export Data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %}) for more detail.

## See also

- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
