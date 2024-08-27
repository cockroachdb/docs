---
title: Plan a CockroachDB Standard Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page describes how to plan your CockroachDB {{ site.data.products.standard }} cluster.

This page describes how resource usage, pricing, and cluster configurations work in CockroachDB {{ site.data.products.standard }}. For information on diagnosing and optimizing your resource consumption, see [Optimize your Resource Usage]({% link cockroachcloud/resource-usage.md %}).

## Provisioned capacity

The *compute* resources available to Standard clusters is provisioned and scaled using a *provisioned capacity* model based on *vCPUs* as the unit of measurement for compute. The amount of capacity required for a Standard cluster is entirely dependent on the scale and query profile of the workload, and may change over time as the workload evolves. Note that *storage capacity* in Standard is allocated as needed for the current data volume, so it’s not covered here under capacity provisioning.

It’s typical to roughly estimate the compute capacity needed for a workload before creating the Standard cluster and then easily adjust that capacity up or down based on observing the actual compute capacity consumed by the workload.

## Pricing

CockroachDB {{ site.data.products.standard }} pricing is determined by two components: provisioned capacity and storage.

### Provisioned capacity pricing

The pricing per-vCPUs does not depend in any way on the workload. Standard vCPUs are priced at 60% of the price of Advanced vCPUs, with some slight variations depending on the Cloud provider and region. Since vCPUs are equivalent between Standard and Advanced on average, both plans require the same number of vCPUs on average, so total cluster cost for Standard is 60% of Advanced on average.

The minimum GCP price is $0.10 per vCPU-hr, which is $73/month.
The minimum AWS price is $0.12 per vCPU-hr, which is $88/month.

Workloads may vary significantly from the average, so the estimation challenge is one of predicting the actual number of vCPUs a workload may require, regardless of whether you’re considering Standard or Advanced.

### Storage pricing

You will only be charged for the storage you use. Storage starts at $0.75/GiB hour and the cost varies by region.

## Multi-region clusters

When you create a multi-region {{ site.data.products.standard }} cluster, you will be prompted to select a **Primary region** from which CockroachDB will optimize access to data. If you want to change your region configuration, [you can use the {{ site.data.products.cloud }} Console]({% link cockroachcloud/cluster-management.md %}#add-a-region-to-your-cluster), or you can [back up and restore]({% link cockroachcloud/use-managed-service-backups.md %}) your data into a new cluster with the desired configuration. 

{{site.data.alerts.callout_info}}
You cannot currently remove regions once they have been added.
{{site.data.alerts.end}}

For optimal performance, deploy client applications in one of your cluster's configured regions. CockroachDB {{ site.data.products.standard }} uses a geolocation routing policy to automatically route clients to the nearest region, even if that region is not one of your cluster's configured regions. This means that if you are running an application from a region that is not used by your cluster, connecting to that region may cause high network latency. This may be acceptable for development, but should be avoided for any production or performance-sensitive applications.

While multi-region CockroachDB {{ site.data.products.advanced }} clusters must have a minimum of three regions, {{ site.data.products.standard }} clusters can survive [zone failures](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-survival-goals#survive-zone-failures) with only two regions. To survive a [regional failure](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-survival-goals#survive-region-failures), a minimum of three regions is required.

Databases created in CockroachDB {{ site.data.products.standard }} will automatically inherit all of a cluster's regions, so it is not necessary to run [`ALTER DATABASE ... ADD REGION`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#add-region) to configure regions when adding a database to the cluster. To override the default inheritance, you can specify the primary region with the [`CREATE DATABASE <db_name> WITH PRIMARY REGION`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-database) SQL syntax or the [`sql.defaults_primary_region`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cluster-settings#setting-sql-defaults-primary-region) setting.

Storage for a multi-region cluster is billed at the same rate as a single-region cluster. However, by default data is replicated three times in the primary region and once in each additional region, and each replica in the additional regions will accrue more storage costs. For example, a three-region cluster with data replicated five times will use 5/3 times the storage space of a single-region cluster where data is replicated three times.

Cross-region operations consume RUs for cross-region networking. Cross-region networking costs depend on the source and destination regions. For read operations, the source region contains the replica and the destination region is the gateway region. For write operations, the source region is the gateway region and the destination region contains the replica. There is a network charge for each replica to which an operation writes. Refer to [Pricing](https://www.cockroachlabs.com/pricing) for a matrix of cross-region costs.

Keep in mind the following key points when planning your multi-region CockroachDB {{ site.data.products.standard }} application's architecture:

- Write-heavy applications may experience a significant increase in RU consumption because replicating writes across all regions consumes more resources.
- Read-heavy applications may experience a smaller increase in RU consumption because the resources required to read from a single region of a multi-region cluster are comparable with a single-region cluster.
- Cross-region reads are an anti-pattern and may significantly increase RU consumption. Features such as [global tables](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/global-tables), [regional by row tables](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/regional-tables), and [follower reads](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/follower-reads) help avoid most cross-region reads.
- Cross-region writes will also consume additional RUs, but should not significantly increase consumption.