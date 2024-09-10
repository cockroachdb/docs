---
title: Cluster Overview Page
summary: How to use the Cluster Overview page to view cluster details on CockroachDB Cloud.
toc: true
docs_area: manage
---

The **Cluster Overview** page displays key metrics about your CockroachDB {{ site.data.products.cloud }} cluster. To view this page, click on a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="serverless">CockroachDB {{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="dedicated">CockroachDB {{ site.data.products.dedicated }}</button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

## Cluster settings

The **Cluster settings** panel displays the settings you chose during [cluster creation]({% link cockroachcloud/create-a-serverless-cluster.md %}).

| Field     | Description                                                                                             |
|-----------|---------------------------------------------------------------------------------------------------------|
| Cloud     | The cluster's [cloud provider]({% link cockroachcloud/create-a-serverless-cluster.md %}#step-2-select-the-cloud-provider). |
| Plan type | The plan type used to create the cluster.                                                               |
| Regions    | The cluster's [regions]({% link cockroachcloud/create-a-serverless-cluster.md %}#step-3-select-the-regions).         |

## Capacity used this month

The **Capacity used this month** panel displays your cluster usage statistics for the current month. You can click [**Estimate usage cost**]({% link cockroachcloud/serverless-cluster-management.md %}#estimate-usage-cost) to open a tool that estimates your monthly costs based on your workload during a selected time frame.

| Field         | Description                                                                                                                                                                                                                                                                      |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Capacity used   | The CockroachDB {{ site.data.products.serverless }} cluster's [configured capacity]({% link cockroachcloud/create-a-serverless-cluster.md %}#step-4-configure-cluster-capacity). Click the **edit** icon to change the configured capacity.                                                                                                         |
| [Request Units]({% link cockroachcloud/plan-your-cluster-serverless.md %}#request-units) | The CPU and I/O resources being used by queries on the cluster, and whether throttling is in effect. The total available RUs are determined by your configured capacity. For more context, see [CockroachDB {{ site.data.products.cloud }} Architecture]({% link cockroachcloud/architecture.md %}#cockroachdb-cloud-terms).              |
| Storage       | The amount of data currently stored in the cluster. This value does not account for compression or replication. The total available storage is determined by your configured capacity. For details, see [CockroachDB {{ site.data.products.cloud }} Architecture]({% link cockroachcloud/architecture.md %}#performance). |


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

<section class="filter-content" markdown="1" data-scope="dedicated">

## Cluster configuration

The **Cluster configuration** panel displays the settings you chose during [cluster creation]({% link cockroachcloud/create-your-cluster.md %}).

| Field     | Description                                                                                             |
|-----------|---------------------------------------------------------------------------------------------------------|
| Cloud     | The cluster's [cloud provider]({% link cockroachcloud/create-your-cluster.md %}#step-2-select-the-cloud-provider). |
| Plan type | The [plan type]({% link cockroachcloud/create-your-cluster.md %}#step-1-start-the-cluster-creation-process) used to create the cluster.                                                           |
| Regions   | The cluster's [region(s)]({% link cockroachcloud/create-your-cluster.md %}#step-3-configure-regions-and-nodes).         |
| Nodes     | The [number of nodes]({% link cockroachcloud/create-your-cluster.md %}#step-3-configure-regions-and-nodes) the cluster has and how many are live. |
| Compute   | The cluster's [compute power per node]({% link cockroachcloud/create-your-cluster.md %}#step-5-configure-cluster-capacity).         |
| Storage   | The cluster's [storage per node]({% link cockroachcloud/create-your-cluster.md %}#step-5-configure-cluster-capacity).         |

## PCI ready (Dedicated advanced)

CockroachDB {{ site.data.products.dedicated }} advanced clusters have a **PCI ready** panel to monitor the status of security features required for [PCI readiness]({% link cockroachcloud/pci-dss.md %}). Feature statuses will update from **INACTIVE** to **ACTIVE** once you configure them. Learn more about configuring these features:

- [CockroachDB {{ site.data.products.cloud }} Organization Audit logs]({% link cockroachcloud/cloud-org-audit-logs.md %})
- [Cluster audit log export]({% link cockroachcloud/export-logs.md %})
- [Customer-Managed Encryption Keys (CMEK)]({% link cockroachcloud/managing-cmek.md %})
- [Egress Perimeter Controls]({% link cockroachcloud/egress-perimeter-controls.md %})
- Single Sign-On (SSO) for your [CockroachDB {{ site.data.products.cloud }} organization]({% link cockroachcloud/configure-cloud-org-sso.md %}) and your [clusters]({% link cockroachcloud/cloud-sso-sql.md %})
- [Network security]({% link cockroachcloud/network-authorization.md %})

You can also check the status of these features on the **PCI ready** page of the CockroachDB {{ site.data.products.cloud }} Console.

</section>
