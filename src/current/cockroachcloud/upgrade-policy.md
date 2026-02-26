---
title: CockroachDB Cloud Support and Upgrade Policy
summary: Learn about the upgrade policy for clusters deployed in CockroachDB Cloud.
toc: true
docs_area: manage
---

This page describes the support and upgrade policy for clusters deployed in CockroachDB {{ site.data.products.cloud }}. For CockroachDB {{ site.data.products.core }}, refer to the CockroachDB [Release Support Policy]({% link releases/release-support-policy.md %}).

## CockroachDB Cloud Support Policy

CockroachDB {{ site.data.products.cloud }} clusters are intended to always run a supported, recent major version of CockroachDB. Clusters receive regular patch updates to ensure they have the latest stability and security updates. Different {{ site.data.products.cloud }} plans offer different options for version selection and upgrade windows, as described on this page.

A cluster running an unsupported CockroachDB version is not eligible for Cockroach Labs’ [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/cockroachcloud-technical-service-level-agreement/).

### Version and upgrade support by cloud plan

[Major versions]({% link releases/index.md %}) of CockroachDB are labeled either as [Regular releases]({% link releases/index.md %}#major-releases) or [Innovation releases]({% link releases/index.md %}#major-releases).

- **Regular releases** are supported for 12 months from their initial production release date.
- **Innovation releases** are supported for 6 months from their initial production release date.

CockroachDB **{{ site.data.products.basic }}** and **{{ site.data.products.standard }}** clusters only support **Regular releases**. This ensures that these clusters are using versions of CockroachDB that receive a full year of support with routine patch updates. All CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters are automatically upgraded to the next major Regular release upon its GA release.

{{site.data.alerts.callout_info}}
CockroachDB {{ site.data.products.standard }} clusters have the option to [disable automatic major-version upgrades]({% link cockroachcloud/cluster-management.md %}#manage-cluster-upgrades). In this case, you are responsible for upgrading the cluster before the current version hits the end-of-support (EOS) date in order to maintain uninterrupted support and SLA guarantees. Clusters that have not upgraded after the EOS date for that version are upgraded automatically.
{{site.data.alerts.end}}

CockroachDB **{{ site.data.products.advanced }}** clusters optionally support **Innovation releases** as well as **Regular releases**, allowing users to access the latest CockroachDB features on an accelerated timeline, while still receiving 6 months of patch support before a recommended upgrade to another major version.

When a CockroachDB {{ site.data.products.advanced }} cluster is nearing its EOS date, you will be reminded to upgrade the cluster at least 30 days before the EOS date to avoid losing support. {% capture who_can_upgrade %}A user with the Cluster Admin or Cluster Operator [role]({% link cockroachcloud/authorization.md %}) can [upgrade a cluster]({% link cockroachcloud/upgrade-cockroach-version.md %}) directly from the CockroachDB Cloud Console. An [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) can assign these roles.{% endcapture %}{{ who_can_upgrade }}

{{site.data.alerts.callout_info}}
On CockroachDB Cloud {{ site.data.products.advanced }} clusters, the EOS date for Regular releases is shared between CockroachDB Cloud and CockroachDB Self-Hosted, meaning the EOS date for a Regular release on an {{ site.data.products.advanced }} cluster is identical to the [Self-Hosted release and support schedule]({% link releases/release-support-policy.md %}#supported-versions). When a GA release is [promoted into an LTS]({% link releases/release-support-policy.md %}#regular-releases), the long-term maintence support window for that version applies to the Cloud cluster as well.

This policy is effective as of v24.3 onwards, and is applicable only to {{ site.data.products.advanced }}. Regular releases on {{ site.data.products.standard }} and {{ site.data.products.basic }} are always supported for 12 months after release. 

You are responsible for upgrading a CockroachDB {{ site.data.products.advanced }} cluster before its current version reaches its EOS date to maintain uninterrupted support and SLA guarantees.
{{site.data.alerts.end}}

### Currently supported versions

The following table describes currently-supported versions on {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters:

Version | Release Type | Release date | End-of-support (EOS) date
:------:|:------------:|:------------:|:---------:
v25.4   | Regular      | 2025-11-03   | 2026-11-03
v25.2   | Regular      | 2025-05-12   | 2026-05-12

The following table describes currently-supported versions on {{ site.data.products.advanced }} clusters:

Version | Release Type | Release date | End-of-support (EOS) date
:------:|:------------:|:------------:|:---------:
v26.1   | Innovation   | 2026-02-02   | 2026-08-02
v25.4   | Regular      | 2025-11-03   | 2026-11-03
v25.2   | Regular      | 2025-05-09   | 2026-05-12
v24.3   | Regular      | 2024-11-18   | 2026-05-05

To review a version's release notes, click its link in the Version column.

For expected future versions, refer to [Upcoming releases]({% link releases/index.md %}#upcoming-releases).

### EOS versions

The following table describes versions that have reached their EOS dates on {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters:

Version | Release Type | Release date | End-of-support (EOS) date
:------:|:------------:|:------------:|:--------:
v24.3   | Regular      | 2024-11-18   | 2025-11-18
v24.1   | Regular      | 2024-05-20   | 2025-05-20
v23.2   | Regular      | 2024-02-05   | 2025-02-05
v23.1   | Regular      | 2023-05-15   | 2024-05-15

The following table describes versions that have reached their EOS dates on {{ site.data.products.advanced }} clusters:

Version | Release Type | Release date | End-of-support (EOS) date
:------:|:------------:|:------------:|:--------:
v25.3   | Innovation   | 2025-08-04   | 2026-02-04
v25.1   | Innovation   | 2025-02-18   | 2025-08-18
v24.1   | Regular      | 2024-05-20   | 2025-05-20
v24.2   | Innovation   | 2024-08-12   | 2025-02-12
v23.2   | Regular      | 2024-02-05   | 2025-02-05
v23.1   | Regular      | 2023-05-15   | 2024-05-15

## Patch version upgrades

Patch version [releases]({% link releases/index.md %}), or "maintenance" releases, contain stable, backward-compatible improvements to major versions of CockroachDB. 

For CockroachDB {{ site.data.products.advanced }} clusters, [Organization Admins]({% link cockroachcloud/authorization.md %}#organization-admin) can [set a weekly 6-hour maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window) during which available maintenance and patch upgrades will be applied. During the window, your cluster may experience node restarts, reduced performance, and, for single-node clusters, downtime. Upgrades may not always be completed by the end of the window, and maintenance that is critical for security or stability may occur outside the window. Patch upgrades can also be [deferred for 30, 60, or 90 days]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window). If no maintenance window is configured, CockroachDB {{ site.data.products.advanced }} clusters will be automatically upgraded to the latest supported patch version as soon as it becomes available.

CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters receive automatic upgrades to the latest supported patch version of their current major version.

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime while the node is restarted during cluster maintenance, including patch version upgrades.
{{site.data.alerts.end}}

## CockroachDB {{ site.data.products.advanced }} patch upgrades and maintenance windows

CockroachDB {{ site.data.products.advanced }} clusters are automatically upgraded to the latest patch version release of the cluster’s current CockroachDB major version, but a major-version upgrade must be initiated by an Organization Admin.

A [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) can [set a weekly 6-hour maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window) for a CockroachDB {{ site.data.products.advanced }} cluster. During the maintenance window, patch upgrades may be applied, and the cluster may experience restarts, degraded performance, and, for single-node clusters, downtime. Upgrades may not always be completed by the end of the window, and maintenance that is critical for security or stability may occur outside of the window. A patch upgrade can be [deferred for 30, 60, or 90 days]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window). If no maintenance window is configured, a CockroachDB {{ site.data.products.advanced }} cluster will be upgraded automatically to the latest supported patch version soon after it becomes available.

### CockroachDB {{ site.data.products.standard }} and {{ site.data.products.basic }} automatic patch upgrades

CockroachDB {{ site.data.products.standard }} clusters default to automatic upgrades for both new patch versions and new major versions. If you [disable automatic upgrades]({% link cockroachcloud/cluster-management.md %}#manage-cluster-upgrades), you must manually upgrade it to a later major version before its current version reaches End of Support (EOS). After one year, CockroachDB {{ site.data.products.standard }} clusters will be automatically upgraded to the next major version, even if set for manual upgrades. 

CockroachDB {{ site.data.products.basic }} clusters are automatically upgraded to new patch versions, as well as new major versions, to maintain support.

## Major version upgrades

Major version [releases]({% link releases/index.md %}) contain new functionality and may include backward-incompatible changes to CockroachDB. {{ site.current_cloud_version }} is an example of a major version.

Major version upgrades are:

- Automatic for CockroachDB {{ site.data.products.basic }}. Only regular releases are supported.
- Automatic by default for {{ site.data.products.standard }}. Only regular releases are supported.
- Customer-initiated on CockroachDB {{ site.data.products.advanced }}. Both regular and innovation releases are supported.

On CockroachDB {{ site.data.products.standard }} with manual upgrades, and on CockroachDB {{ site.data.products.advanced }}, a major-version upgrade can be initiated by an [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin). Major versions labeled Regular releases are required upgrades, and Innovation releases are optional. When a new major version is available, you can [start an upgrade]({% link cockroachcloud/upgrade-cockroach-version.md %}) from the CockroachDB {{ site.data.products.cloud }} Console. The cluster will be upgraded to the latest patch release within that major version.

<a id="regular-releases"></a>
### Innovation releases

As of v24.2, Cockroach Labs releases a major version of CockroachDB once per quarter, alternating between releases classified as a [Regular release or an Innovation release]({% link releases/index.md %}#release-types). Regular releases provide a longer support period and a longer period between upgrades, while Innovation releases offer a shorter support period and faster access to new features.

- Regular releases are not optional; they must be applied to CockroachDB {{ site.data.products.advanced }} and CockroachDB {{ site.data.products.standard }} clusters within their support periods. They are applied automatically to CockroachDB {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters that are configured for automatic upgrades. Regular releases are produced twice a year, alternating with Innovation Releases. They are supported for one year. It is supported to upgrade CockroachDB {{ site.data.products.advanced }} directly from one regular release to the next regular release and skip the intervening Innovation release.
- Innovation releases are optional and can be skipped for CockroachDB {{ site.data.products.advanced }}, and are not available for CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }}. Innovation releases are produced twice a year, alternating with Regular releases. An Innovation release is supported for 6 months, at which time the cluster must be upgraded to the next Regular Release. At a given time, only one Innovation release is typically supported. Upgrading a cluster directly from one Innovation release to the next Innovation release is not supported.

{{site.data.alerts.callout_info}}
To opt out of Innovation releases entirely and hide them from your CockroachDB organization, contact Support.
{{site.data.alerts.end}}

To summarize the available major-version upgrade paths for CockroachDB {{ site.data.products.advanced }}:

- When your cluster is running a Regular release, you can select which of the next two major versions to upgrade to:
  - The next version, an Innovation release.
  - The Regular release that follows that Innovation release, when it is available.
- When your cluster is running an Innovation release, you can upgrade only to the subsequent Regular release, not directly to the newer Innovation release, if it is available.

### Pre-production preview upgrades

Prior to the GA release of a major CockroachDB version, CockroachDB {{ site.data.products.cloud }} organizations can request access to create new CockroachDB {{ site.data.products.advanced }} clusters on a Pre-Production Preview release or upgrade an existing cluster to a Pre-Production Preview. Pre-Production Preview releases are beta or release candidate (RC) builds of the next major version of CockroachDB, and are provided by request only for testing and experimentation. 

Upgrading to a Pre-Production Preview is a major-version upgrade. After a cluster is upgraded to a Pre-Production Preview release, it is automatically upgraded to all subsequent releases within the same major version—including additional beta and RC releases, the GA release, and subsequent production patch releases as [patch version upgrades](#patch-version-upgrades). Upgrading to a Pre-Production Preview follows the same procedure as updating to a Production release. To learn more about the upgrade procedure, refer to [Upgrade a cluster in CockroachDB Cloud]({% link cockroachcloud/upgrade-cockroach-version.md %}).

### Rollback support

When upgrading a CockroachDB {{ site.data.products.advanced }} or CockroachDB {{ site.data.products.standard }} cluster to a new major version, once all nodes are running the new version, the upgrade is finalized automatically in approximately 72 hours. During this window, if you see unexpected behavior, you can [trigger a rollback]({% link cockroachcloud/upgrade-cockroach-version.md %}) to the previous major version from the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud).

{{site.data.alerts.callout_info}}
If you choose to roll back a major version upgrade, your cluster will be rolled back to the latest patch release of the previous major version, which may differ from the patch release you were running before you initiated the upgrade.
{{site.data.alerts.end}}

During rollback, nodes are reverted one at a time to reduce the impact of the operation on the cluster's health and availability.

If you notice problems after a major version upgrade has been finalized, it will not be possible to roll back via the CockroachDB {{ site.data.products.cloud }} Console. For assistance, [contact support](https://support.cockroachlabs.com/hc/requests/new).

### End of Support for CockroachDB versions

As CockroachDB releases new major versions, older versions reach their End of Support (EOS) on CockroachDB {{ site.data.products.cloud }}. A CockroachDB version reaches EOS when it is two major versions behind the latest version. For example, when CockroachDB v21.2 was released, CockroachDB v20.2 reached EOS.

Clusters running unsupported CockroachDB versions are not eligible for our [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions/). Further downgrades in support may occur as per the [CockroachDB Release Support Policy]({% link releases/release-support-policy.md %}).

If you are running a CockroachDB version nearing EOS, you will be reminded at least one month before that version’s EOS that your clusters must be upgraded by the EOS date to avoid losing support. An Organization Admin can [upgrade your cluster]({% link cockroachcloud/upgrade-cockroach-version.md %}) directly from the CockroachDB {{ site.data.products.cloud }} Console.

## Additional information

For more details about the upgrade and finalization process in CockroachDB, refer to the instructions on [upgrading to the latest CockroachDB version]({% link cockroachcloud/upgrade-cockroach-version.md %}).
