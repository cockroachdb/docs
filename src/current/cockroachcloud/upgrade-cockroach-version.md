---
title: Upgrade a cluster in CockroachDB Cloud
summary: Learn how to upgrade a cluster in CockroachDB Cloud
toc: true
docs_area: manage
---

This page describes how major-version and patch upgrades work and shows how to upgrade a cluster in CockroachDB {{ site.data.products.cloud }}. To upgrade a CockroachDB {{ site.data.products.core }} cluster, refer to [Upgrade to {{ site.current_cloud_version }}]({% link {{ site.current_cloud_version }}/upgrade-cockroach-version.md %}) instead.

## Overview

CockroachDB offers the following types of upgrades:

- [**Major-version upgrades**]({% link releases/index.md %}#major-releases): A major-version upgrade moves a cluster from one major version of CockroachDB to another, such as from v24.2 to v24.3. A major-version upgrade may include new features, updates to cluster setting defaults, and backward-incompatible changes. Performing a major-version upgrade requires an additional step to finalize the upgrade.

    As of 2024, every second major version is an **Innovation release**. For CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }}, Innovation releases offer shorter support windows and can be skipped. Innovation releases are required for CockroachDB {{ site.data.products.basic }}, and are applied automatically.
- [**Patch upgrades**]({% link releases/index.md %}#patch-releases): A patch upgrade moves a cluster from one patch to another within a major version, such as from v24.2.3 to v24.2.4. Patch upgrades do not introduce backward-incompatible changes. Patch upgrades are automatically applied to CockroachDB {{ site.data.products.advanced }}, CockroachDB {{ site.data.products.standard }}, and CockroachDB {{ site.data.products.basic }} clusters.

    A major version has two types of patch releases: a series of **testing releases** followed by a series of **production releases**. A major version’s initial production release is also known as its GA release. In the lead-up to a new major version's GA release, a series of Testing releases may be made available to CockroachDB {{ site.data.products.advanced }} as Pre-Production Preview releases for testing and validation. Testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments. If a cluster is upgraded to a Pre-Production Preview patch release as a major-version upgrade, it will be automatically upgraded to subsequent patch releases within the major version, including newer Pre-Production Preview releases, the initial GA release, and subsequent Production patches.

To learn more about CockroachDB major versions and patches, refer to the [Releases Overview]({% link releases/index.md %}#overview).

## Upgrades and maintenance windows

If you have [configured a maintenance window]({% link cockroachcloud/advanced-cluster-management.md %}) for a CockroachDB {{ site.data.products.advanced }} cluster, automatic patch upgrades are applied during the maintenance window. Major-version upgrades must be initiated manually.

{{site.data.alerts.callout_info}}
Maintenance operations that are critical for cluster security or stability may be applied outside of the maintenance window, and upgrades that begin in a maintenance window may not always be completed by the end of the window.
{{site.data.alerts.end}}

Refer to [Cloud Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

## Perform a major-version upgrade

This section shows how to perform a major-version upgrade for a cluster in CockroachDB {{ site.data.products.cloud }}. Patch upgrades within a cluster's major version are applied automatically, and no action is required.

1. Verify the cluster's current major version, and which versions it can be upgraded to:
    1. Sign into [CockroachDB {{ site.data.products.cloud }}](https://cockroachlabs.cloud).
    1. From the **Clusters** page, find the cluster by name. If the cluster is in a folder, click the name of the folder to view its descendants. The cluster's major version and patch are shown in the **Version** column.
1. Check which upgrades are available to the cluster, if any.

    Beginning with v24.1, major versions alternate in type between Regular releases, which are required, and Innovation releases, which can be skipped.
    
    From a Regular release, you can upgrade to the next major release (an Innovation release) or the subsequent major release (another Regular release). From an Innovation release, you must upgrade to the next Regular release.
    
    These releases also provide different support periods.
    
    For details, refer the [CockroachDB Cloud Support Policy]({% link cockroachcloud/upgrade-policy.md %}#cockroachdb-cloud-support-policy).

    To check whether major-version upgrades are available, click the three-dot **Action** menu. If upgrades are available, **Upgrade major version** will be enabled. Click it. In the dialog, if only one newer major version upgrade is available, it is selected automatically. If multiple upgrades are available, the latest Regular release is selected by default. If you intend to upgrade the cluster, keep this dialog open while completing the next steps. Otherwise, close the dialog.
1. Before beginning a major-version upgrade, review its [Release notes]({% link releases/index.md %}), as well as the release notes for any skipped Innovation Releases. If any backward-incompatible changes or new features impact the cluster's workloads, you may need to make adjustments before beginning the upgrade.
1. A CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster remains fully available while it is upgraded. For a multi-node CockroachDB {{ site.data.products.advanced }} cluster, nodes are upgraded one at a time in a rolling fashion so the cluster remains available, with one node unavailable at a time. A single-node {{ site.data.products.advanced }} cluster will be unavailable while the cluster is upgraded and restarted. If necessary, prepare for the upgrade by communicating ahead of time with your users, and plan to begin the upgrade during a time when the impact on the cluster's workload will be minimized.
1. To begin a major-version upgrade, go back to the dialog in the CockroachDB {{ site.data.products.cloud }} Console. If multiple upgrades are available, select the desired version. Review the details, then click **Start upgrade**. The dialog closes, and the **Version** columnin the **Cluster List** page changes to **Upgrading**. When the upgrade has finished but has not yet been finalized, the **Version** column reports that the new version is **pending**.
1. The upgrade is not complete until it is finalized. After the upgrade is finalized, the cluster can no longer be rolled back to its previous major version. If you take no action, finalization occurs automatically after approximately 72 hours.
    - To roll back to the previous major version, click **Roll back**. A CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster remains fully available while it is rolled back. For a multi-node CockroachDB {{ site.data.products.advanced }} cluster, nodes are rolled back one at a time in a rolling fashion so the cluster remains available, with one node unavailable at a time. A single-node CockroachDB {{ site.data.products.advanced }} cluster will be unavailable while the cluster is rolled back and restarted. Like an upgrade, a rollback must be finalized.
    - To finalize the cluster upgrade manually, click the cluster's name to open the **Cluster Details** page. At the top of the page, click **Finalize**. When finalization begins, a series of migration jobs run to enable certain types of features and changes in the new major version that cannot be rolled back. These include changes to system schemas, indexes, and descriptors, and enabling certain types of improvements and new features. These temporary limitations are listed in the release notes for the new major version. Until the upgrade is finalized, these features and functions will not be available and the command `SHOW CLUSTER SETTING version` will continue to report the previous major version.

      You can monitor the process of finalization in the CockroachDB Cloud <a href="/docs/cockroachcloud/jobs-page.html"><strong>[Jobs]({% link cockroachcloud/jobs-page.md %})</strong> page. Migration jobs have names in the format `{major-version}-{migration-id}`. If a migration job fails or stalls, Cockroach Labs can use the migration ID to help diagnose and troubleshoot the problem. Each major version has a unique set of migration jobs and IDs.

      When finalization is complete, the **Cluster List** and **Cluster Details** page report the new version, and you can no longer roll back to the previous major version.
