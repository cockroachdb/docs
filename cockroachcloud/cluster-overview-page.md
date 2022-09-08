---
title: Cluster Overview Page
summary: How to use the Cluster Overview page to view cluster details on {{ site.data.products.serverless }}.
toc: true
docs_area: manage
---

The **Cluster Overview** page displays key metrics about your {{ site.data.products.serverless }} cluster.

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
| Storage       | The amount of data currently stored in the cluster. This value does not account for compression or replication. The total available storage is determined by your spend limit and Burst RU usage. For details, see [CockroachCloud Architecture](architecture.html#performance). |
| Request Units | The CPU and I/O resources being used by queries on the cluster, and whether throttling is in effect. The total available RUs are determined by your spend limit and storage usage. For more context, see [CockroachCloud Architecture](architecture.html#cockroachdb-cloud-terms).              |

## Cluster statistics panel

This panel displays operational statistics for your cluster.

| Field               | Description                                                                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| Throughput          | The cluster throughput in queries per second (QPS).                                                                                                 |
| P99 latency         | The 99th percentile of service latency. This value indicates the time within which the cluster executed 99 percent of queries over the last minute. |
| Databases           | The number of databases in the cluster.                                                                                                             |
| Tables              | The total number of system and user-created tables in your databases.                                                                               |
| Open sessions       | The number of open sessions in the cluster.                                                                                                         |

## Cluster Overview metrics

These time-series graphs display important cluster metrics over time.

You can use the month selector above the graphs to view data for a specific month.

### Storage used

The **Storage Used** graph displays the amount of data being stored in the cluster over time. This is the logical number of live bytes and does not account for compression or replication.

### Request Units

The **Request Units** graph displays the CPU and I/O resources being used by queries on the cluster. This is measured in Request Units per second at each timestamp. Simple queries consume few RUs, while complicated queries with many reads and writes consume more RUs.

### SQL Statements

The **SQL Statements** graph displays an average of the number of [`SELECT`](../{{site.versions["stable"]}}/select-clause.html), [`INSERT`](../{{site.versions["stable"]}}/insert.html), [`UPDATE`](../{{site.versions["stable"]}}/update.html), and [`DELETE`](../{{site.versions["stable"]}}/delete.html) statements successfully executed per second.
