---
title: CockroachDB Cloud Support and Upgrade Policy
summary: Learn about the upgrade policy for clusters deployed in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes the support and upgrade policy for clusters deployed in CockroachDB {{ site.data.products.cloud }}. For CockroachDB Self-Hosted, refer to the CockroachDB  [Release Support Policy](https://www.cockroachlabs.com/docs/releases/release-support-policy).

Cockroach Labs uses a three-component calendar versioning scheme to name CockroachDB [releases](https://cockroachlabs.com/docs/releases/index#production-releases). The format is `YY.R.PP`, where `YY` indicates the year, `R` indicates the release (historically “1” or “2”, representing a biannual cycle), and `PP` indicates the patch release version. For example: Version 23.1.0 (abbreviated v23.1.0). Leading up to a new major version's initial GA (Generally Available) release, multiple testing builds are produced, moving from Alpha to Beta to Release Candidate. CockroachDB began using this versioning scheme with v19.1. For more details, refer to [Release Naming](https://cockroachlabs.com/docs/releases/index#release-naming).

CockroachDB {{ site.data.products.cloud }} provides support for the latest major version of CockroachDB and the major version immediately preceding it.

CockroachDB Dedicated clusters are automatically upgraded to the latest patch of the cluster’s current major version of CockroachDB, but an account administrator must initiate an upgrade to a new major version.

CockroachDB Serverless clusters are upgraded to the latest major version and each patch automatically.

{{site.data.alerts.callout_success}}
Prior to the GA release of a major CockroachDB version, CockroachDB {{ site.data.products.dedicated }} clusters can optionally be upgraded to a [Pre-Production Preview](#pre-production-preview-upgrades) release—a beta or release candidate (RC) testing release for testing and validation of that next major version. To learn more, refer to [Upgrade to v24.1 Pre-Production Preview]({% link cockroachcloud/upgrade-to-v24.1.md %}).
{{site.data.alerts.end}}

## Patch version upgrades

Patch version [releases](https://www.cockroachlabs.com/docs/releases), or "maintenance" releases, contain stable, backward-compatible improvements to the major versions of CockroachDB (for example, v23.1.12 and v23.1.13).

For CockroachDB {{ site.data.products.dedicated }} clusters, [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can [set a weekly 6-hour maintenance window]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) during which available patch upgrades will be applied. During the window, your cluster may experience restarts, degraded performance, and, for single-node clusters, downtime. Upgrades may not always be completed by the end of the window, and maintenance that is critical for security or stability may occur outside the window. Patch upgrades can also be [deferred for 60 days]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window). If no maintenance window is configured, CockroachDB {{ site.data.products.dedicated }} clusters will be automatically upgraded to the latest supported patch version as soon as it becomes available.

CockroachDB {{ site.data.products.serverless }} clusters are subject to automatic upgrades to the latest supported patch version.

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major version upgrades

Major version [releases](https://www.cockroachlabs.com/docs/releases) (for example, v23.1.0 and v23.2.0) contain new functionality and may include backward-incompatible changes to CockroachDB.

Major version upgrades are automatic for CockroachDB {{ site.data.products.serverless }} clusters and opt-in for CockroachDB {{ site.data.products.dedicated }} clusters. An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) must initiate major version upgrades for CockroachDB {{ site.data.products.dedicated }} clusters. When a new major version is available, Admins will be able to [start an upgrade]({% link cockroachcloud/upgrade-to-v23.1.md %}) from the CockroachDB {{ site.data.products.cloud }} Console for clusters using CockroachDB {{ site.data.products.dedicated }}. When a major version upgrade is initiated for a cluster, it will upgrade to the latest patch version as well.

### Pre-production preview upgrades

Prior to the GA release of a major CockroachDB version, CockroachDB {{ site.data.products.cloud }} organizations can create new {{ site.data.products.dedicated }} clusters or upgrade existing clusters to a Pre-Production Preview release for testing and experimentation using a beta or release candidate (RC) of that next major version. Upgrading to a Pre-Production Preview is a major-version upgrade. After a cluster is upgraded to a Pre-Production Preview release, it is automatically upgraded to all subsequent releases within the same major version—including additional beta and RC releases, the GA release, and subsequent patch releases after GA, as [patch version upgrades](#patch-version-upgrades). To learn more, refer to [Upgrade to v23.2 Pre-Production Preview](https://cockroachlabs.com/docs/cockroachcloud/upgrade-to-v24.1).

### Rollback support

When upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can trigger a rollback to the previous major version from the CockroachDB {{ site.data.products.cloud }} Console.

To stop the upgrade and roll back to the latest patch release of the previous major version, click **Roll back** in the banner at the top of the CockroachDB Cloud Console, and then click **Roll back upgrade**.

{{site.data.alerts.callout_danger}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of the previous major version, which may differ from the patch release you were running before you initiated the upgrade.
{{site.data.alerts.end}}

During rollback, nodes are reverted to that prior major version's latest patch one at a time, without interrupting the cluster's health and availability.

If you notice problems after a major version upgrade has been finalized, it will not be possible to roll back via the CockroachDB {{ site.data.products.cloud }} Console. For assistance, [contact support](https://support.cockroachlabs.com/hc/requests/new).

### End of Support for CockroachDB versions

As CockroachDB releases new major versions, older versions reach their End of Support (EOS) on CockroachDB {{ site.data.products.cloud }}. A CockroachDB version reaches EOS when it is two major versions behind the latest version. For example, when CockroachDB v21.2 was released, CockroachDB v20.2 reached EOS.

Clusters running unsupported CockroachDB versions are not eligible for our [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/). Further downgrades in support may occur as per the [CockroachDB Release Support Policy](https://www.cockroachlabs.com/docs/releases/release-support-policy).

If you are running a CockroachDB version nearing EOS, you will be reminded at minimum one month before that version’s EOS that your clusters must be upgraded by the EOS date to avoid losing support. A Org Administrator can [upgrade your cluster]({% link cockroachcloud/upgrade-to-v23.2.md %}) directly from the CockroachDB {{ site.data.products.cloud }} Console.

## Additional information

For more details about the upgrade and finalization process, see [Upgrade to the Latest CockroachDB Version](https://cockroachlabs.com/docs/cockroachcloud/upgrade-to-v23.1).
