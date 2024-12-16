This section shows how to perform a major-version upgrade for a cluster in CockroachDB {{ site.data.products.cloud }}. Patch upgrades within a cluster's major version are applied automatically, and no action is required.

1. Verify the cluster's current major version, and which versions it can be upgraded to:
    1. Sign into [CockroachDB {{ site.data.products.cloud }}](https://cockroachlabs.cloud).
    1. From the **Clusters** page, find the cluster by name. If the cluster is in a folder, click the name of the folder to view its descendants. The cluster's major version and patch are shown in the **Version** column.
1. Check which upgrades are available to the cluster, if any.

    Beginning with v24.1, major versions alternate in type between Regular releases, which are required, and Innovation releases, which can be skipped.

    From a Regular release, you can upgrade to the next major release (an Innovation release) or the subsequent major release (another Regular release). From an Innovation release, you must upgrade to the next Regular release.

    These releases also provide different support periods.

    For details, refer the [CockroachDB Cloud Support Policy]({% link cockroachcloud/upgrade-policy.md %}#cockroachdb-cloud-support-policy).

    To check whether major-version upgrades are available, click the three-dot **Actions** menu. If upgrades are available, **Upgrade major version** will be enabled. Click it. In the dialog, if only one newer major version upgrade is available, it is selected automatically. If multiple upgrades are available, the latest Regular release is selected by default. If you intend to upgrade the cluster, keep this dialog open while completing the next steps. Otherwise, close the dialog.
1. Before beginning a major-version upgrade, review its [Release notes]({% link releases/index.md %}), as well as the release notes for any skipped Innovation Releases. If any backward-incompatible changes or new features impact the cluster's workloads, you may need to make adjustments before beginning the upgrade.
1. A CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster remains fully available while it is upgraded. For a multi-node CockroachDB {{ site.data.products.advanced }} cluster, nodes are upgraded one at a time in a rolling fashion so the cluster remains available, with one node unavailable at a time. A single-node {{ site.data.products.advanced }} cluster will be unavailable while the cluster is upgraded and restarted. If necessary, prepare for the upgrade by communicating ahead of time with your users, and plan to begin the upgrade during a time when the impact on the cluster's workload will be minimized.
1. To begin a major-version upgrade, go back to the dialog in the CockroachDB {{ site.data.products.cloud }} Console. If multiple upgrades are available, select the desired version. Review the details, then click **Start upgrade**. The dialog closes, and the **Version** column in the **Cluster List** page changes to **Upgrading**. When the upgrade has finished but has not yet been finalized, the **Version** column reports that the new version is **pending**.

The upgrade is not complete until it is [finalized](#finalize-a-major-version-upgrade-manually). After the upgrade is finalized, the cluster can no longer be [rolled back](#roll-back-a-major-version-upgrade) to its previous major version. If you take no action, finalization occurs automatically after approximately 72 hours.
