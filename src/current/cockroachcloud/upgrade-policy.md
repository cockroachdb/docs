---
title: Upgrade Policy
summary: Learn about the CockroachDB Cloud upgrade policy.
toc: true
docs_area: manage
---

This page describes the upgrade policy for CockroachDB {{ site.data.products.cloud }}. For self-hosted clusters, see the CockroachDB [Release Support Policy](https://www.cockroachlabs.com/docs/releases/release-support-policy).

CockroachDB {{ site.data.products.cloud }} supports the latest major version of CockroachDB and the version immediately preceding it. Support for these versions includes patch version updates and security patches.

{{site.data.alerts.callout_danger}}
[CockroachDB {{ site.data.products.serverless }}]({% link cockroachcloud/quickstart.md %}) clusters are subject to automatic upgrades for both major and patch releases.
{{site.data.alerts.end}}

## Patch version upgrades

Patch version [releases](https://www.cockroachlabs.com/docs/releases), or "maintenance" releases, contain stable, backward-compatible improvements to the major versions of CockroachDB (for example, v21.2.0 → v21.2.1).

For CockroachDB {{ site.data.products.dedicated }} clusters, [Organization Admins]({% link cockroachcloud/authorization.md %}#org-administrator-legacy) can [set a weekly 6-hour maintenance window]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) during which available maintenance and patch upgrades will be applied. During the window, your cluster may experience restarts, degraded performance, and downtime for single-node clusters. Upgrades may not always be completed by the end of the window, and maintenance that is critical for security or stability may occur outside the window. Patch upgrades can also be [deferred for 60 days]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window). If no maintenance window is configured, CockroachDB {{ site.data.products.dedicated }} clusters will be automatically upgraded to the latest supported patch version as soon as it becomes available.

CockroachDB {{ site.data.products.serverless }} clusters are subject to automatic upgrades to the latest supported patch version. 

**To minimize disruption to clients during cluster upgrades, it's important to use [connection retry logic]({% link cockroachcloud/production-checklist.md %}#keeping-connections-current) in your application.**

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major version upgrades

Major version [releases](https://www.cockroachlabs.com/docs/releases) (for example, v21.1.x → v21.2.x) contain new functionality and potentially backward-incompatible changes to CockroachDB.

Major version upgrades are automatic for CockroachDB {{ site.data.products.serverless }} clusters and opt-in for CockroachDB {{ site.data.products.dedicated }} clusters. [Org Administrators]({% link cockroachcloud/authorization.md %}#org-administrator-legacy) must initiate major version upgrades for CockroachDB {{ site.data.products.dedicated }} clusters. When a new major version is available, Admins will be able to [start an upgrade]({% link cockroachcloud/upgrade-to-v21.2.md %}) from the CockroachDB {{ site.data.products.cloud }} Console for clusters using the paid version of CockroachDB {{ site.data.products.dedicated }}. When a major version upgrade is initiated for a cluster, it will upgrade to the latest patch version as well.

### Rollback support

When upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can [trigger a rollback to the previous major version]({% link cockroachcloud/upgrade-to-v21.2.md %}#roll-back-the-upgrade) from the CockroachDB {{ site.data.products.cloud }} Console. 

Note that you will roll back to the latest patch version of the previous major version, not the same patch version you were running before you initiated the upgrade.

If you see problems after the upgrade has been finalized, it will not be possible to roll back via the CockroachDB {{ site.data.products.cloud }} Console; you will have to [reach out to support](https://support.cockroachlabs.com/hc/requests/new).

### End of Support for older CockroachDB versions

As CockroachDB releases new major versions, older versions reach their End of Support (EOS) on CockroachDB {{ site.data.products.cloud }}. A CockroachDB version reaches EOS when it is two major versions behind the latest version. For example, when CockroachDB v21.2 was released, CockroachDB v20.2 reached EOS.

Clusters running unsupported CockroachDB versions are not eligible for our [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/). Further downgrades in support may occur as per the [CockroachDB Release Support Policy](https://www.cockroachlabs.com/docs/releases/release-support-policy).

If you are running a CockroachDB version nearing EOS, you will be reminded at least one month before that version’s EOS that your clusters must be upgraded by the EOS date to avoid losing support. A Org Administrator can [upgrade your cluster]({% link cockroachcloud/upgrade-to-v21.2.md %}) directly from the CockroachDB {{ site.data.products.cloud }} Console.

## See also

For more details about the upgrade and finalization process, see [Upgrade to the Latest CockroachDB Version]({% link cockroachcloud/upgrade-to-v21.2.md %}).
