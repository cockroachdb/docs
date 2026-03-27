---
title: Overview Page
summary: How to use the Overview page to view cluster details on CockroachDB Cloud.
toc: true
docs_area: manage
---

The **Overview** page displays details and key metrics about your CockroachDB {{ site.data.products.cloud }} cluster. To view this page, click on a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page).

The information displayed on this page in the Console may differ for you based on your assigned [roles]({% link cockroachcloud/authorization.md %}).

## Configuration

The **Configuration** section displays high-level details about the cluster. Clicking on this section expands the **Cluster configuration** panel that displays the following cluster details and settings you chose during [cluster creation]({% link cockroachcloud/create-your-cluster.md %}):

| Field                                         | Description                                                                                                     |
|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Plan type                                     | The plan type of the cluster.                                                                                   |
| Cloud                                         | The cluster's cloud provider.                                                                                   |
| Region(s)                                     | The cluster's regions.                                                                                          |
| Compute                                       | The cluster's provisioned compute power as appropriate for the [plan type]({% link cockroachcloud/costs.md %}). |
| Storage                                       | The cluster's provisioned storage as appropriate for the [plan type]({% link cockroachcloud/costs.md %}).       |
| Nodes ({{ site.data.products.advanced}} only) | The number of nodes the cluster has and the status of each.                                                     |
| Labels                                        | The [labels]({% link cockroachcloud/labels.md %}) applied to the cluster.                                       |
| Cluster created on                            | The creation date of the cluster.                                                                               |

## Settings

The **Settings** section shows the [CockroachDB version]({% link releases/index.md %}) running on the cluster. Clicking on this section expands the **Cluster settings** panel which includes the following options for managing this cluster:

- [**Maintenance window**]({% link cockroachcloud/advanced-cluster-management.md %}#set-a-maintenance-window) ({{ site.data.products.advanced }} only)
- [**Delay patch upgrades**]({% link cockroachcloud/cluster-management.md %}#set-a-maintenance-window) ({{ site.data.products.advanced }} only)
- [**Deletion protection**]({% link cockroachcloud/cluster-management.md %}#enable-deletion-protection)
- [**Manual upgrades**]({% link cockroachcloud/cluster-management.md %}#manage-cluster-upgrades) ({{ site.data.products.standard }} only)

## Usage graphs

The Overview page includes graphs that display real-time metrics about the high level performance and usage of the cluster. You can modify the timeframe displayed on these graphs with the timeframe dropdown. You can also click on the **View all metrics** link to go to the [**Metrics** page]({% link cockroachcloud/metrics.md %}).

### SQL throughput and SQL latency

The **SQL throughput and SQL latency** graph displays the average queries-per-second (QPS) and 99th percentile of service latency (p99 latency) of [`SELECT`]({% link {{site.current_cloud_version}}/select-clause.md %}), [`INSERT`]({% link {{site.current_cloud_version}}/insert.md %}), [`UPDATE`]({% link {{site.current_cloud_version}}/update.md %}), and [`DELETE`]({% link {{site.current_cloud_version}}/delete.md %}) statements successfully executed per second on the cluster.

### Compute used

The **Compute used** graph displays your cluster compute usage statistics for the specified timeframe. On {{ site.data.products.basic }} clusters this graph displays request units (RUs) per second. On {{ site.data.products.standard }} and {{ site.data.products.advanced }} clusters this graph displays total vCPU compute per second.

## Cluster resource totals

The Overview page describes the total provisioned compute and storage for the cluster. Usage costs are [calculated differently based on the cluster's plan]({% link cockroachcloud/costs.md %}) so the displayed information differs based on the cluster's plan:

### {{ site.data.products.basic }} cluster resources

| Section       | Description                                                                                                                                                                            |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Request units | The CPU and I/O resources being used by queries on the cluster, and whether throttling is in effect. The total available RUs are determined by your configured capacity.               |
| Storage       | The amount of data currently stored in the cluster. This value does not account for compression or replication. The total available storage is determined by your configured capacity. |

### {{ site.data.products.standard }} cluster resources

| Section             | Description                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Provisioned compute | The number of vCPUs provisioned to process queries on the cluster.                                                                                                                     |
| Storage             | The amount of data currently stored in the cluster. This value does not account for compression or replication. The total available storage is determined by your configured capacity. |

### {{ site.data.products.advanced }} cluster resources

| Section | Description                                                                                                                                                                            |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Nodes   | The number of nodes the cluster has and the status of each.                                                                                                                            |
| Storage | The amount of data currently stored in the cluster. This value does not account for compression or replication. The total available storage is determined by your configured capacity. |
