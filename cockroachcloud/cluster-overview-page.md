---
title: Cluster Overview Page
summary: How to use the Cluster Overview page to view cluster details on {{ site.data.products.db }}.
toc: true
docs_area: manage
---

The **Cluster Overview** page displays key metrics about your {{ site.data.products.db }} cluster. To view this page, click on a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="serverless">{{ site.data.products.serverless }}</button>
  <button class="filter-button page-level" data-scope="dedicated">{{ site.data.products.dedicated }}</button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

## Cluster settings

The **Cluster settings** panel displays the settings you chose during [cluster creation](create-a-serverless-cluster.html).

| Field     | Description                                                                                             |
|-----------|---------------------------------------------------------------------------------------------------------|
| Cloud     | The cluster's [cloud provider](create-a-serverless-cluster.html#step-2-select-a-cloud-provider-region). |
| Plan type | The plan type used to create the cluster.                                                               |
| Region    | The cluster's [region](create-a-serverless-cluster.html#step-2-select-a-cloud-provider-region).         |

## Usage this month

The **Usage this month** panel displays your cluster usage statistics for the current month. You can click [**Estimate usage cost**](serverless-cluster-management.html#estimate-usage-cost) to open a tool that estimates your monthly costs based on your workload during a selected time frame.

| Field         | Description                                                                                                                                                                                                                                                                      |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Spend limit   | The spend limit you entered when [creating the cluster](create-a-serverless-cluster.html#step-3-enter-a-spend-limit). Click the **edit** icon to change the spend limit.                                                                                                         |
| Storage       | The amount of data currently stored in the cluster. This value does not account for compression or replication. The total available storage is determined by your spend limit and Burst RU usage. For details, see [{{ site.data.products.db }} Architecture](architecture.html#performance). |
| [Request Units](learn-about-request-units.html) | The CPU and I/O resources being used by queries on the cluster, and whether throttling is in effect. The total available RUs are determined by your spend limit and storage usage. For more context, see [{{ site.data.products.db }} Architecture](architecture.html#cockroachdb-cloud-terms).              |

## Cluster statistics panel

This panel displays operational statistics for your cluster.

| Field               | Description                                                                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Throughput          | The cluster throughput in queries per second (QPS).                                                                                                 |
| P99 latency         | The 99th percentile of service latency. This value indicates the time within which the cluster executed 99 percent of queries over the last minute. |                                                                             |
| Open sessions       | The number of open sessions in the cluster.                                                                                                         |

## Cluster Overview metrics

These time-series graphs display important cluster metrics over time.

You can use the timeframe selector above the graphs to view data for a specific time period.

### Storage Used

The **Storage Used** graph displays the amount of data being stored in the cluster over time. This is the logical number of live bytes and does not account for compression or replication.

### Request Units

The **Request Units** graph displays the CPU and I/O resources being used by queries on the cluster. This is measured in Request Units per second at each timestamp. Simple queries consume few RUs, while complicated queries with many reads and writes consume more RUs.

### SQL Statements

The **SQL Statements** graph displays an average of the number of [`SELECT`](../{{site.current_cloud_version}}/select-clause.html), [`INSERT`](../{{site.current_cloud_version}}/insert.html), [`UPDATE`](../{{site.current_cloud_version}}/update.html), and [`DELETE`](../{{site.current_cloud_version}}/delete.html) statements successfully executed per second.

</section>

<section class="filter-content" markdown="1" data-scope="dedicated">

## Cluster configuration

The **Cluster configuration** panel displays the settings you chose during [cluster creation](create-your-cluster.html).

| Field     | Description                                                                                             |
|-----------|---------------------------------------------------------------------------------------------------------|
| Cloud     | The cluster's [cloud provider](create-a-serverless-cluster.html#step-2-select-a-cloud-provider-region). |
| Plan type | The [plan type](create-your-cluster.html#step-1-start-the-cluster-creation-process) used to create the cluster.                                                           |
| Region(s) | The cluster's [region(s)](create-your-cluster.html#step-3-select-the-region-s).         |
| Nodes     | The [number of nodes](create-your-cluster.html#step-4-select-the-number-of-nodes) the cluster has and how many are live. |
| Compute   | The cluster's [compute power per node](create-your-cluster.html#step-5-select-the-hardware-per-node).         |
| Storage   | The cluster's [storage per node](create-your-cluster.html#step-5-select-the-hardware-per-node).         |

## PCI ready (Dedicated advanced)

{{ site.data.products.dedicated }} advanced clusters have a **PCI ready** panel to monitor the status of security features required for PCI compliance. Feature statuses will update from **INACTIVE** to **ACTIVE** once you configure them. Learn more about configuring these features:

- [Audit logs](cloud-org-audit-logs.html)
- [Customer-Managed Encryption Keys (CMEK)](managing-cmek.html)
- [Egress Perimeter Controls](egress-perimeter-controls.html)
- Single Sign-On (SSO) for both your [{{ site.data.products.db }} organization](configure-cloud-org-sso.html) and the [DB Console](../{{site.versions["stable"]}}/sso-db-console.html)
- [Network security](network-authorization.html)

You can also check the status of these features on the [**PCI ready**](cluster-overview.html?filters=dedicated#pci-ready-dedicated-advanced) page of the {{ site.data.products.db }} Console.

</section>
