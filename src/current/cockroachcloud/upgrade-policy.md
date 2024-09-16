---
title: CockroachDB Cloud Support and Upgrade Policy
summary: Learn about the upgrade policy for clusters deployed in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes the support and upgrade policy for clusters deployed in CockroachDB {{ site.data.products.cloud }}. For CockroachDB {{ site.data.products.core }}, refer to the CockroachDB [Release Support Policy]({% link releases/release-support-policy.md %}).

## CockroachDB Cloud Support Policy

[Major versions]({% link releases/index.md %}) of CockroachDB are labeled either [Regular releases]({% link releases/index.md %}#major-releases) or [Innovation releases]({% link releases/index.md %}).
- **Regular releases** are supported for 12 months from their initial production release date.
- **Innovation releases** are supported for 6 months from their initial production release date.

For each release type, the end date of this period is called End of Support (EOS).

A cluster running an unsupported CockroachDB version is not eligible for Cockroach Labs’ [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/).

CockroachDB {{ site.data.products.serverless }} clusters will automatically be upgraded to the next major version while the current one is still supported, to prevent a Serverless cluster from reaching EOS.

A CockroachDB {{ site.data.products.dedicated }} cluster must be upgraded prior to its EOS date to maintain uninterrupted support and SLA guarantees.

When a CockroachDB {{ site.data.products.dedicated }} cluster is nearing its EOS date, you will be reminded to upgrade the cluster at least 30 days before the EOS date to avoid losing support. {% capture who_can_upgrade %}A [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator) can [upgrade a cluster]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}) directly from the CockroachDB Cloud Console. An [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) or [Folder Admin]({% link cockroachcloud/authorization.md %}#folder-admin) can grant the Cluster Administrator role.{% endcapture %}{{ who_can_upgrade }}

### Currently supported versions

Version | Release Type | Support period | Release date | EOS date
:------:|:------------:|:--------------:|:------------:|:---------:
v23.2   | Regular      | 12 months      | 2024-02-05   | 2025-02-05
v24.1   | Regular      | 12 months      | 2024-05-20   | 2025-05-20
v24.2   | Innovation   | 6 months       | 2024-08-12   | 2025-02-12

For expected future versions, refer to [Upcoming releases]({% link releases/index.md %}#upcoming-releases).

### EOS versions

Version | Release Type | Support period | Release date | EOS date
:------:|:------------:|:--------------:|:------------:|:--------:
|v23.1  | Regular      | 12 months      | 2023-05-15   | 2024-05-15

## Patch version upgrades

A patch version [release]({% link releases/index.md %}), or "maintenance" releases, contains stable, backward-compatible improvements to a major version of CockroachDB. For example, {{site.current_cloud_version}} is a patch release.

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime while the node is restarted during cluster maintenance, including patch version upgrades.
{{site.data.alerts.end}}


## CockroachDB {{ site.data.products.dedicated }} patch upgrades and maintenance windows

CockroachDB {{ site.data.products.dedicated }} clusters are automatically upgraded to the latest patch version release of the cluster’s current CockroachDB major version, but a major-version upgrade must be initiated by an Org Administrator.

A [Cluster Administrator]({% link cockroachcloud/authorization.md %}#cluster-administrator) can [set a weekly 6-hour maintenance window]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) for a CockroachDB {{ site.data.products.dedicated }} cluster. During the maintenance window, patch upgrades may be applied, and the cluster may experience restarts, degraded performance, and, for single-node clusters, downtime. Upgrades may not always be completed by the end of the window, and maintenance that is critical for security or stability may occur outside of the window. A patch upgrade can be [deferred for 60 days]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window). If no maintenance window is configured, a CockroachDB {{ site.data.products.dedicated }} cluster will be upgraded automatically to the latest supported patch version soon after it becomes available.

### CockroachDB {{ site.data.products.serverless }} automatic upgrades

CockroachDB {{ site.data.products.serverless }} clusters are automatically upgraded to new patch versions, as well as new major versions.

## Major version upgrades

Major version [releases]({% link releases/index.md %}) (for example, {{ site.current_cloud_version }}) contain new functionality and may include backward-incompatible changes to CockroachDB.

Major version upgrades are automatic for CockroachDB {{ site.data.products.serverless }} clusters and must be initiated by an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) for CockroachDB {{ site.data.products.dedicated }} clusters. In CockroachDB {{ site.data.products.dedicated }}, major versions labeled Regular releases are all required upgrades, while Innovation releases are optional. Once a new major version is available, you can [start an upgrade]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}) from the CockroachDB Cloud Console. The cluster will be upgraded to the latest patch release within that major version.

<a id="regular-releases"></a>
### Innovation releases

As of v24.2, Cockroach Labs releases a major version of CockroachDB once per quarter, alternating between releases classified as a [Regular release or an Innovation release]({% link releases/index.md %}#release-types). Regular releases provide a longer support period and a longer period between upgrades, while Innovation releases offer a shorter support period and faster access to new features.

- Regular releases are not optional; they must be applied to CockroachDB {{ site.data.products.dedicated }} clusters and they are applied automatically to CockroachDB {{ site.data.products.serverless }} clusters. Regular releases are produced twice a year, alternating with Innovation Releases. They are supported for one year. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one regular release to the next regular release, skipping the intervening Innovation release, is supported.
- Innovation releases are optional and can be skipped for CockroachDB {{ site.data.products.dedicated }} clusters but are required for CockroachDB {{ site.data.products.serverless }}. Innovation releases are produced twice a year, alternating with Regular releases. An innovation release is supported for 6 months, at which time a Dedicated cluster must be upgraded to the next Regular Release. At a given time, only one Innovation release is typically supported. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one Innovation release to the next Innovation release is not supported.

{{site.data.alerts.callout_info}}
To opt out of Innovation releases entirely and hide them from your CockroachDB organization, contact Support.{{site.data.alerts.end}}

To summarize the available major-version upgrade paths for CockroachDB {{ site.data.products.dedicated }}:

- When your cluster is running a Regular release, you can select which of the next two major versions to upgrade to:
  - The next version, an Innovation release.
  - The Regular release that follows that Innovation release, when it is available.
- When your cluster is running an Innovation release, you can upgrade only to the subsequent Regular release, not directly to the newer Innovation release, if it is available.

### Pre-production preview upgrades

Prior to the GA release of a major CockroachDB version, CockroachDB {{ site.data.products.cloud }} organizations can create new Dedicated clusters or upgrade existing clusters to a Pre-Production Preview release for testing and experimentation using a beta or release candidate (RC) of that next major version. Upgrading to a Pre-Production Preview is a major-version upgrade. After a cluster is upgraded to a Pre-Production Preview release, it is automatically upgraded to all subsequent releases within the same major version—including additional beta and RC releases, the GA release, and subsequent production patch releases as [patch version upgrades](#patch-version-upgrades). Upgrading to a Pre-Production Preview follows the same procedure as updating to a Production release. To learn more, refer to [Upgrade to {{ site.current_cloud_version }}]({% link cockroachcloud/upgrade-to-{{ site.current_cloud_version }}.md %}).

### Rollback support

When upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version, once all nodes are running the new version, the upgrade is finalized automatically in approximately 72 hours. During this window, if you see unexpected behavior, you can [trigger a rollback]({% link cockroachcloud/upgrade-to-{{ site.current_cloud_version }}.md %}#roll-back-the-upgrade) to the previous major version from the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud).

{{site.data.alerts.callout_info}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of the previous major version, which may differ from the patch release you were running before you initiated the upgrade.
{{site.data.alerts.end}}

During rollback, nodes are reverted one at a time to reduce the impact of the operation on the cluster's health and availability.

If you notice problems after a major version upgrade has been finalized, it will not be possible to roll back via the CockroachDB {{ site.data.products.cloud }} Console. For assistance, [contact Support](https://support.cockroachlabs.com/hc/requests/new).

## Additional information

For more details about the upgrade and finalization process in CockroachDB, refer to the instructions on [upgrading to the latest CockroachDB version]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}).
