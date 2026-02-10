---
title: Cluster Virtualization Overview
summary: Learn more about cluster virtualization and how it facilitates physical cluster replication.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

This page gives an overview of _cluster virtualization_ in CockroachDB {{page.version.version}}. Cluster virtualization allows you to separate a cluster's _control plane_ from its _data plane_. The cluster's control plane manages cluster nodes and node-to-node traffic, while its data plane reads data from and writes data to the cluster's storage.

Cluster virtualization is only necessary if you want to use [physical cluster replication (PCR)]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}). For details on how PCR works, refer to the [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}).

When cluster virtualization is disabled, the control plane and data plane are unified, and the `cockroach` process on a node handles all system and user activity, and manages the cluster's control plane and data plane. When cluster virtualization is enabled, the `cockroach` process on a node runs both a _system virtual cluster_ and one or more _virtual clusters_.

- The system virtual cluster manages the cluster's control plane and virtual clusters. Administrative access to the system virtual cluster can be restricted. Certain low-level cluster settings can be modified only on the system virtual cluster.
- A virtual cluster manages its own data plane. Administrative access on a virtual cluster does not grant any access to the system virtual cluster. Some settings are scoped to a virtual cluster rather than the system virtual cluster.

{{site.data.alerts.callout_success}}
Cluster virtualization is enabled automatically when you configure [PCR]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}).
{{site.data.alerts.end}}

## Differences when cluster virtualization is enabled

When cluster virtualization is enabled, CockroachDB's behavior changes in several key areas, as described in the following sections. For details about working with a cluster with cluster virtualization enabled, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}).

### Connecting to a cluster

When cluster virtualization is enabled, when you connect using `cockroach sql` or the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), you are connected to the default virtual cluster. To connect to the system virtual cluster, you set `-ccluster=system` in the connection string (for SQL clients) or the DB Console URL. For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#connect-to-a-virtual-cluster).

{{site.data.alerts.callout_success}}
If a SQL user has been added to the system virtual cluster and one or more virtual clusters with the same username and password, that user can select which to connect to from the top of the DB Console.
{{site.data.alerts.end}}

### Cluster settings

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) is scoped to either a virtual cluster or the system virtual cluster.

For more details, including the scope of each cluster setting, refer to [Cluster Setting Scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %}).

### Security

By default, when connecting to a cluster using a SQL client or the DB Console, if a user does not specify whether to connect to a virtual cluster or the system virtual cluster, they are connected to the default virtual cluster.

To grant access to the system virtual cluster, you must connect to the system virtual cluster as a user with the `admin` role, then grant the `admin` role to the SQL user. For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#grant-access-to-the-system-virtual-cluster).

### Upgrades

The system virtual cluster can be at most one [Regular release]({% link releases/index.md %}#release-types) ahead of virtual clusters. For example, a system virtual cluster on CockroachDB v24.3 can have virtual clusters on CockroachDB v24.1 (a Regular release) or v24.2 (an Innovation release). This allows you to roll back an upgrade of the system virtual cluster without impacting schemas or data in virtual clusters.

To upgrade to a new major version when cluster virtualization is enabled, you must:

1. Replace the binary on each node and restart the node.
1. [Finalize]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually) the upgrade on the system virtual cluster to upgrade it (if auto-finalization is disabled).
1. Finalize the upgrade on a virtual cluster to upgrade it (if auto-finalization is disabled).

For details, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#upgrade-a-cluster).


### Observability

When cluster virtualization is enabled, cluster log messages and metrics are scoped to a virtual cluster or to the system virtual cluster, and are labeled with the name of the virtual cluster they relate to.

For details and examples, refer to:

- [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#observability)
- [Cluster setting scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Cluster metric scopes with Cluster Virtualization enabled]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})

When connected to a virtual cluster from the DB Console:

- Most pages and views are scoped to a virtual cluster.
- Metrics which measure SQL and related activity show data scoped to the virtual cluster. All other metrics are collected system-wide and display the same data on all virtual clusters including the system virtual cluster.
- DB Console pages related to SQL activity and jobs for a given virtual cluster are visible only when logged in to that virtual cluster.
- Some pages and views are by default viewable only from the system virtual cluster, including those pertaining to overall cluster health.

For more details, including how to adjust the DB Console's behavior, refer to [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#observability).

{% comment %}
### SQL API

When cluster virtualization is enabled, certain low-level SQL APIs, such as (TODO: Which ones) are accessible only by those users with the `admin` role on the system virtual cluster, and not from virtual clusters.
{% endcomment %}

### Replication

[Replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) can be configured only in a virtual cluster, and are not applicable to the `system` virtual cluster.

## See also

- [Work with virtual clusters]({% link {{ page.version.version }}/work-with-virtual-clusters.md %})
- [Cluster Setting Scopes]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Cluster Metric Scopes]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})

## Known Limitations

In CockroachDB {{ page.version.version }}, cluster virtualization has the following limitations:

- Currently, a single physical cluster can have a maximum of one system virtual cluster and one virtual cluster.
