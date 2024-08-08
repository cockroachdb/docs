---
title: CockroachDB Cloud Support and Upgrade Policy
summary: Learn about the upgrade policy for clusters deployed in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes the support and upgrade policy for clusters deployed in CockroachDB {{ site.data.products.cloud }}. For CockroachDB Self-Hosted, refer to the CockroachDB [Release Support Policy]({% link releases/release-support-policy.md %}).

## CockroachDB Cloud Support Policy

[Major versions]({% link releases/index.md %}) of CockroachDB that are labeled [Regular releases]({% link releases/index.md %}#major-releases) are supported for 12 months from their initial production release date.

[Major versions]({% link releases/index.md %}) of CockroachDB that are labeled [Innovation releases]({% link releases/index.md %}#major-releases) are supported for 6 months from their initial production release date. 

For each release type, the end date of this period is called End of Support (EOS).

A cluster running an unsupported CockroachDB version is not eligible for Cockroach Labs’ [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/).

CockroachDB {{ site.data.products.serverless }} clusters will automatically be upgraded to the next major version while the current one is still supported, which prevents a Serverless cluster from reaching EOS.

A CockroachDB {{ site.data.products.dedicated }} cluster must be upgraded by an administrator prior to its EOS date to maintain uninterrupted support and SLA guarantees.
{% comment %}TODO: Update with more nuanced wording on which roles can perform an upgrade. Awaiting confirmation from Eng.{% endcomment %}

When a CockroachDB {{ site.data.products.dedicated }} cluster is nearing its EOS date, you will be reminded to upgrade the cluster at least 30 days before the EOS date to avoid losing support. An Org Administrator can [upgrade a cluster]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}) directly from the CockroachDB Cloud Console.
{% comment %}TODO: Update with more nuanced wording on which roles can perform an upgrade. Awaiting confirmation from Eng.{% endcomment %}

### Currently supported versions

| Version | Release Type | Support period | Release date | EOS date |
| :---: | :---: | :---: | :---: | :---: |
| v23.2 | Regular | 12 months | 2024-02-05 | 2025-02-05 |
| v24.1 | Regular | 12 months | 2024-05-20 | 2025-05-20 |
| v24.2 | Innovation | 6 months | 2024-08-12 | 2025-02-12 |

For expected future versions, refer to [Upcoming releases]({% link releases/index.md %}#upcoming-releases).

### EOS versions

| Version | Release Type | Support period | Release date | EOS date |
| :---: | :---: | :---: | :---: | :---: |
| v23.1 | Regular | 12 months | 2023-05-15 | 2024-05-15 |

## Patch version upgrades

Patch version [releases]({% link releases/index.md %}), or "maintenance" releases, contain stable, backward-compatible improvements to the major versions of CockroachDB (for example, v23.1.12 and v23.1.13).

Warning: Single-node clusters will experience some downtime during cluster maintenance, including patch version upgrades.

## CockroachDB {{ site.data.products.dedicated }} patch upgrades and maintenance windows 
{% comment %}TODO: Update with more nuanced wording on which roles can perform an upgrade. Awaiting confirmation from Eng.{% endcomment %}

CockroachDB {{ site.data.products.dedicated }} clusters are automatically upgraded to the latest patch version release of the cluster’s current CockroachDB major version, but a major-version upgrade must be initiated by an Org Administrator.

For CockroachDB {{ site.data.products.dedicated }} clusters, [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) can [set a weekly 6-hour maintenance window]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) during which patch upgrades may be applied. During the maintenance window, your cluster may experience restarts, degraded performance, and, for single-node clusters, downtime. Upgrades may not always be completed by the end of the window, and maintenance that is critical for security or stability may occur outside of the window. Patch upgrades can also be [deferred for 60 days]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window). If no maintenance window is configured, CockroachDB {{ site.data.products.dedicated }} clusters will be automatically upgraded to the latest supported patch version soon after it becomes available.

### CockroachDB {{ site.data.products.serverless }} automatic upgrades

CockroachDB {{ site.data.products.serverless }} clusters are automatically upgraded to new patch versions, as well as new major versions.

## Major version upgrades

Major version [releases](https://www.cockroachlabs.com/docs/releases) (for example, v23.1.0 and v23.2.0) contain new functionality and may include backward-incompatible changes to CockroachDB.

Major version upgrades are automatic for CockroachDB {{ site.data.products.serverless }} clusters and must be initiated by an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) for CockroachDB {{ site.data.products.dedicated }} clusters. In CockroachDB {{ site.data.products.dedicated }}, major versions labeled Regular releases are all required upgrades, while Innovation releases are optional. Once a new major version is available, you can [start an upgrade]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}) from the CockroachDB Cloud Console. The cluster will be upgraded to the latest patch release within that major version.

### Innovation releases

As of v24.2, Cockroach Labs releases a major version of CockroachDB once per quarter, alternating between releases classified as a [Regular release or an Innovation release]({% link releases/index.md %}#release-types). Regular releases provide a longer support period and a longer period between upgrades, while Innovation releases offer a shorter support period and faster access to new features. 

- Regular releases are not optional; they must be applied to CockroachDB {{ site.data.products.dedicated }} clusters and they are applied automatically to CockroachDB {{ site.data.products.serverless }} clusters. Regular releases are produced twice a year, alternating with Innovation Releases. They are supported for one year. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one regular release to the next regular release, skipping the intervening Innovation release, is supported.  
- Innovation releases are optional and can be skipped for CockroachDB {{ site.data.products.dedicated }} clusters but are required for CockroachDB {{ site.data.products.serverless }}. Innovation releases are produced twice a year, alternating with Regular releases. An innovation release is supported for 6 months, at which time a Dedicated cluster must be upgraded to the next Regular Release. At a given time, only one Innovation release is typically supported. Upgrading CockroachDB {{ site.data.products.dedicated }} directly from one Innovation release to the next Innovation release is not supported.

{{site.data.alerts.callout_info}}To opt out of Innovation releases entirely and hide them from your CockroachDB organization, contact Support.{{site.data.alerts.end}}

To summarize the available major-version upgrade paths for CockroachDB {{ site.data.products.dedicated }}:

* When your cluster is running a Regular release, you can select which of the next two major versions to upgrade to:  
  * the next version, an Innovation release  
  * the Regular release that follows that Innovation release.  
* When your cluster is running an Innovation release, you can only upgrade to the subsequent Regular release.

### Pre-production preview upgrades

Prior to the GA release of a major CockroachDB version, CockroachDB Cloud organizations can create new Dedicated clusters or upgrade existing clusters to a Pre-Production Preview release for testing and experimentation using a beta or release candidate (RC) of that next major version. Upgrading to a Pre-Production Preview is a major-version upgrade. After a cluster is upgraded to a Pre-Production Preview release, it is automatically upgraded to all subsequent releases within the same major version—including additional beta and RC releases, the GA release, and subsequent production patch releases as [patch version upgrades](#patch-version-upgrades).{% comment %}TODO (Can be post-v24.2-release): Determine whether to make this next sentence conditional, move further PPP details to a more permanent location and link there, or remove this altogether.
To learn more, refer to [Upgrade to vXX.Y Pre-Production Preview](https://cockroachlabs.com/docs/cockroachcloud/upgrade-to-vXX.Y).
{% endcomment %}

### Rollback support

When upgrading a CockroachDB {{ site.data.products.dedicated }} cluster to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can trigger a rollback to the previous major version from the CockroachDB Cloud Console.

To stop the upgrade and roll back to the latest patch release of the previous major version, click **Roll back** in the banner at the top of the CockroachDB Cloud Console, and then click **Roll back upgrade**.

{{site.data.alerts.callout_danger}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of the previous major version, which may differ from the patch release you were running before you initiated the upgrade.
{{site.data.alerts.end}}

During rollback, nodes are reverted to that prior major version's latest patch one at a time, without interrupting the cluster's health and availability.

If you notice problems after a major version upgrade has been finalized, it will not be possible to roll back via the CockroachDB {{ site.data.products.cloud }} Console. For assistance, [contact Support](https://support.cockroachlabs.com/hc/requests/new).

## Additional information

For more details about the upgrade and finalization process, refer to the instructions on [upgrading to the latest CockroachDB version]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}).
