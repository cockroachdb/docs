---
title: CockroachDB Cloud Support and Upgrade Policy
summary: Learn about the upgrade policy for clusters deployed in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes the support and upgrade policy for clusters deployed in CockroachDB {{ site.data.products.cloud }}. For CockroachDB Self-Hosted, refer to the CockroachDB  [Release Support Policy](https://www.cockroachlabs.com/docs/releases/release-support-policy).

## CockroachDB Cloud Support Policy

[Major versions]({% link releases/index.md %}) of CockroachDB that are labeled [Regular releases]({% link releases/index.md %}#major-release-types) are supported for 12 months from their initial production release date.

[Major versions]({% link releases/index.md %}) of CockroachDB that are labeled [Innovation releases]({% link releases/index.md %}#major-release-types) are supported for 6 months from their initial production release date. 

For each release type, the end date of this period is called End of Support (EOS).

A cluster running an unsupported CockroachDB version is not eligible for Cockroach Labs’ [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/).

CockroachDB Serverless clusters will automatically be upgraded to the next major version while the current one is still supported, which prevents a Serverless cluster from reaching EOS..

A CockroachDB Dedicated cluster must be upgraded by an administrator prior to its EOS date to maintain uninterrupted support and SLA guarantees. 

When a CockroachDB Dedicated cluster is nearing its EOS date, you will be reminded to upgrade the cluster at least 30 days before the EOS date to avoid losing support. An Org Administrator can [upgrade a cluster]({% link cockroachcloud/upgrade-to-{{site.current_cloud_version}}.md %}) directly from the CockroachDB Cloud Console.
{% comment %}TODO: Awaiting details from Eng on upgrade permissions/roles{% endcomment %}
{% comment %}TODO: Update link to use v24.2 upgrade page or to use a version variable{% endcomment %}

### Currently supported versions

| Version | Release Type | Support period | Release date | EOS date |
| :---: | :---: | :---: | :---: | :---: |
| v23.2 | Regular | 12 months | 2024-02-05 | 2025-02-05 |
| v24.1 | Regular | 12 months | 2024-05-20 | 2025-05-20 |
| v24.2 | Innovation | 6 months | 2024-08-12 | 2025-02-12 |

For expected future versions, refer to Upcoming releases.

### EOS versions

| Version | Release Type | Support period | Release date | EOS date |
| :---: | :---: | :---: | :---: | :---: |
| v23.1 | Regular | 12 months | 2023-05-15 | 2024-05-15 |

## Patch version upgrades

Patch version [releases]({% link releases/index.md %}), or "maintenance" releases, contain stable, backward-compatible improvements to the major versions of CockroachDB (for example, v23.1.12 and v23.1.13).

Warning: Single-node clusters will experience some downtime during cluster maintenance, including patch version upgrades.

## CockroachDB Dedicated patch upgrades and maintenance windows 

CockroachDB Dedicated clusters are automatically upgraded to the latest patch version release of the cluster’s current CockroachDB major version, but a major-version upgrade must be initiated by an Org Administrator..

For CockroachDB Dedicated clusters, an [Org Administrator](https://www.cockroachlabs.com/docs/cockroachcloud/authorization\#org-administrator) can [set a weekly 6-hour maintenance window](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management\#set-a-maintenance-window) during which patch upgrades may be applied. During the maintenance window, your cluster may experience restarts, degraded performance, and, for single-node clusters, downtime. Upgrades may not always be completed by the end of the window, and maintenance that is critical for security or stability may occur outside of the window. Patch upgrades can also be [deferred for 60 days](https://www.cockroachlabs.com/docs/cockroachcloud/cluster-management\#set-a-maintenance-window). If no maintenance window is configured, CockroachDB Dedicated clusters will automatically be upgraded to the latest supported patch version, soon after it becomes available.

### CockroachDB Serverless automatic upgrades

CockroachDB Serverless clusters are automatically upgraded to new patch versions, as well as new major versions.

## Major version upgrades

Major version [releases](https://www.cockroachlabs.com/docs/releases) (for example, v23.1.0 and v23.2.0) contain new functionality and may include backward-incompatible changes to CockroachDB.

Major version upgrades are automatic for CockroachDB Serverless clusters and must be initiated by an [Org Administrator](https://www.cockroachlabs.com/docs/cockroachcloud/authorization\#org-administrator) for CockroachDB Dedicated clusters. In CockroachDB Dedicated, major versions labeled Regular releases are all required upgrades, while Innovation releases are optional. Once a new major version is available, you can [start an upgrade](https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-to-v23.1) from the CockroachDB Cloud Console. The cluster will be upgraded to the latest patch within the major version.

### Innovation releases

As of v24.2, Cockroach Labs releases a major version of CockroachDB once per quarter, alternating between releases classified as a [Regular release or an Innovation release]({% link releases/index.md %}#release-types). Regular releases provide a longer support period and a longer period between upgrades, while Innovation releases offer a shorter support period and faster access to new features. 

- Regular releases are not optional; they must be applied to CockroachDB Dedicated clusters and they are applied automatically to CockroachDB Serverless clusters. Regular releases are produced twice a year, alternating with Innovation Releases. They are supported for one year. Upgrading CockroachDB Dedicated directly from one regular release to the next regular release, skipping the intervening Innovation release, is supported.  
- Innovation releases are optional and can be skipped for CockroachDB Dedicated clusters but are required for CockroachDB Serverless. Innovation releases are produced twice a year, alternating with Regular releases. An innovation release is supported for 6 months, at which time a Dedicated cluster must be upgraded to the next Regular Release. At a a given time, only one Innovation release is typically supported. Upgrading CockroachDB Dedicated directly from one Innovation release to the next innovation release is not supported.

Note: To opt out of Innovation releases entirely and hide them from your CockroachDB organization, contact Support.

To summarize the available major-version upgrade paths for CockroachDB Dedicated:

* When your cluster is running a regular release, you can select which of the next two major versions to upgrade to:  
  * the next version, an innovation release  
  * the regular release that follows that innovation release.  
* When your cluster is running an innovation release, you can only upgrade to the subsequent regular release.

If you want all clusters in your organization to hide the option to use innovation versions, contact Support.

### Pre-production preview upgrades

Prior to the GA release of a major CockroachDB version, CockroachDB Cloud organizations can create new Dedicated clusters or upgrade existing clusters to a Pre-Production Preview release for testing and experimentation using a beta or release candidate (RC) of that next major version. Upgrading to a Pre-Production Preview is a major-version upgrade. After a cluster is upgraded to a Pre-Production Preview release, it is automatically upgraded to all subsequent releases within the same major version—including additional beta and RC releases, the GA release, and subsequent production patch releases as [patch version upgrades](https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy\#patch-version-upgrades). To learn more, refer to [Upgrade to v23.2 Pre-Production Preview](https://cockroachlabs.com/docs/cockroachcloud/upgrade-to-v24.1).

### Rollback support

When upgrading a CockroachDB Dedicated cluster to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can trigger a rollback to the previous major version from the CockroachDB Cloud Console.

To stop the upgrade and roll back to the latest patch release of the previous major version, click **Roll back** in the banner at the top of the CockroachDB Cloud Console, and then click **Roll back upgrade**.

{{site.data.alerts.callout_danger}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of the previous major version, which may differ from the patch release you were running before you initiated the upgrade.
{{site.data.alerts.end}}

During rollback, nodes are reverted to that prior major version's latest patch one at a time, without interrupting the cluster's health and availability.

If you notice problems after a major version upgrade has been finalized, it will not be possible to roll back via the CockroachDB {{ site.data.products.cloud }} Console. For assistance, [contact support](https://support.cockroachlabs.com/hc/requests/new).

## Additional information

For more details about the upgrade and finalization process, see [Upgrade to the Latest CockroachDB Version](https://cockroachlabs.com/docs/cockroachcloud/upgrade-to-v23.1).
