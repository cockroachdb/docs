---
title: Restoring Backups Across Versions
summary: CockroachDB's support policy for restoring backups across versions.
toc: true
docs_area: manage
---

This page describes the support Cockroach Labs provides for restoring backups across major versions of CockroachDB. The sections outline the support for the most common use cases when restoring backups across versions:

- [Support for restoring backups into a higher version](#support-for-restoring-backups-into-a-higher-version)
- [Support for long-term backup archival](#support-for-long-term-backup-archival)

{{site.data.alerts.callout_info}}
Since CockroachDB considers the cluster version when running a backup, this page refers to versions in a "v22.1.x" format. For example, both v22.1.8 and v22.1.14 are considered as v22.1 clusters for backup purposes.
{{site.data.alerts.end}}


## Support for restoring backups into a higher version

Cockroach Labs supports restoring a backup taken on a cluster on a specific major version into a cluster that is on the same version or the next major version. Therefore, when you're upgrading your cluster from version N to N+1, if you took a backup on major version N, you can restore it to your cluster on either major version N or N+1.

For example, backups taken on v21.1.x can be restored into v21.2.x. Backups taken on v21.2.x can be restored into v22.1.x. The following table outlines this support:

Backup taken on version   | Restorable into version
--------------------------+--------------------------
20.1.x                    | 20.2.x
20.2.x                    | 21.1.x
21.1.x                    | 21.2.x
21.2.x                    | 22.1.x
22.1.x                    | 22.2.x

See the [Upgrade documentation](../{{site.versions["stable"]}}/upgrade-cockroach-version.html) for the necessary steps to finalize your upgrade. For {{ site.data.products.db }} clusters, see the [Upgrade Policy](../cockroachcloud/upgrade-policy.html) page.

{{site.data.alerts.callout_info}}
Cockroach Labs does **not** support restoring backups from a higher version into a lower version. 
{{site.data.alerts.end}}

## Support for long-term backup archival

When you need to archive a backup for the long term, we recommend that you also archive the CockroachDB binary of the version that the backup was taken on.

For a true archival copy that is not dependent on CockroachDB at all, running a changefeed to export your data from CockroachDB and archiving the files would be a better approach instead of taking a backup. See [Export Data with Changefeeds](export-data-with-changefeeds.html) for more detail.

## See also

- [`RESTORE`](restore.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)