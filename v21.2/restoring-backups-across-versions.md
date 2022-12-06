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
We refer to versions on this page in the "v21.2.x" format, because the minor versions of CockroachDB are not considered in backup eligibility. For example, CockroachDB considers both v21.2.8 and v21.2.14 as v21.2 clusters. 
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

For a true archival copy that is not dependent on CockroachDB at all, running an [`EXPORT INTO CSV`](export.html) and archiving the files would be a better approach instead of taking a backup.

## See also

- [`RESTORE`](restore.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)