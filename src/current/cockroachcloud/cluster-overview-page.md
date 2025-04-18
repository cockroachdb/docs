---
title: Cluster Overview Page
summary: How to use the Cluster Overview page to view cluster details on CockroachDB Cloud.
toc: true
docs_area: manage
---

The **Cluster Overview** page displays key metrics about your CockroachDB {{ site.data.products.cloud }} cluster. To view this page, click on a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="standard">CockroachDB {{ site.data.products.standard }} / {{ site.data.products.basic }}</button>
  <button class="filter-button page-level" data-scope="advanced">CockroachDB {{ site.data.products.advanced }}</button>
</div>

<section class="filter-content" markdown="1" data-scope="standard">

## Cluster settings

The **Cluster settings** panel shows the settings selected during [cluster creation]({% link cockroachcloud/create-a-basic-cluster.md %}), as well as any [labels]({% link cockroachcloud/labels.md %}) added to the cluster after its creation.

| Field     | Description                                                                                             |
|-----------|---------------------------------------------------------------------------------------------------------|
| Cloud     | The cluster's [cloud provider]({% link cockroachcloud/create-a-basic-cluster.md %}#step-2-select-the-cloud-provider). |
| Plan type | The plan type used to create the cluster.                                                               |
| Regions   | The cluster's [regions]({% link cockroachcloud/create-a-basic-cluster.md %}#step-3-select-the-regions). |
| Labels    | The [labels]({% link cockroachcloud/labels.md %}) added to the cluster.       |

## Capacity used this month

The **Capacity used this month** panel displays your cluster usage statistics for the current month. You can click [**Estimate usage cost**]({% link cockroachcloud/basic-cluster-management.md %}#estimate-usage-cost) to open a tool that estimates your monthly costs based on your workload during a selected time frame.

| Field         | Description                                                                                                                                                                                                                                                                      |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Capacity used   | The CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster's [configured capacity]({% link cockroachcloud/create-a-basic-cluster.md %}#step-4-configure-cluster-capacity). Click the **edit** icon to change the configured capacity.                                                                                                         |
| [Request Units]({% link cockroachcloud/plan-your-cluster-basic.md %}#request-units) | The CPU and I/O resources being used by queries on the cluster, and whether throttling is in effect. The total available RUs are determined by your configured capacity.              |
| Storage       | The amount of data currently stored in the cluster. This value does not account for compression or replication. The total available storage is determined by your configured capacity. |


## Current activity panel

This panel displays operational statistics for your cluster.

| Field               | Description                                                                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Throughput          | The cluster throughput in queries per second (QPS).                                                                                                 |
| P99 latency         | The 99th percentile of service latency. This value indicates the time within which the cluster executed 99 percent of queries over the last minute. |                                                                             |
| Open sessions       | The number of open sessions in the cluster.                                                                                                         |

## Cluster Overview metrics

These time-series graphs display important cluster metrics over time.

You can use the timeframe selector above the graphs to view data for a specific time period.

### Request Units

The **Request Units** graph displays the CPU and I/O resources being used by queries on the cluster. This is measured in Request Units per second at each timestamp. Simple queries consume few RUs, while complicated queries with many reads and writes consume more RUs.

### Storage Used

The **Storage Used** graph displays the amount of data being stored in the cluster over time. This is the logical number of live bytes and does not account for compression or replication.

### SQL Statements

The **SQL Statements** graph displays an average of the number of [`SELECT`]({% link {{site.current_cloud_version}}/select-clause.md %}), [`INSERT`]({% link {{site.current_cloud_version}}/insert.md %}), [`UPDATE`]({% link {{site.current_cloud_version}}/update.md %}), and [`DELETE`]({% link {{site.current_cloud_version}}/delete.md %}) statements successfully executed per second.

</section>

<section class="filter-content" markdown="1" data-scope="advanced">

## Cluster configuration

The **Cluster configuration** panel displays the settings you chose during [cluster creation]({% link cockroachcloud/create-your-cluster.md %}).

| Field     | Description                                                                                             |
|-----------|---------------------------------------------------------------------------------------------------------|
| Cloud     | The cluster's [cloud provider]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-2-select-the-cloud-provider). |
| Plan type | The [plan type]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-1-start-the-cluster-creation-process) used to create the cluster.                                                           |
| Regions   | The cluster's [region]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-3-configure-regions-and-nodes).         |
| Nodes     | The [number of nodes]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-3-configure-regions-and-nodes) the cluster has and the status of each. |
| Compute   | The cluster's [compute power per node]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-5-configure-cluster-capacity).         |
| Storage   | The cluster's [storage per node]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-5-configure-cluster-capacity).         |

<a id="pci-ready"></a>
## PCI ready (with Security add-on)

CockroachDB {{ site.data.products.advanced }} clusters with Security add-on have a **PCI ready** panel to monitor the status of security features required for [PCI readiness]({% link cockroachcloud/pci-dss.md %}). Feature statuses will update from **INACTIVE** to **ACTIVE** once you configure them. Learn more about configuring these features:

- [CockroachDB {{ site.data.products.cloud }} Organization Audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
- [Cluster audit log export]({% link cockroachcloud/export-logs.md %})
- [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/managing-cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})
- Single Sign-On (SSO) for your [CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/configure-cloud-org-sso.md %}) and your [clusters]({% link cockroachcloud/cloud-sso-sql.md %})
- [Network security]({% link cockroachcloud/network-authorization.md %})

</section>
