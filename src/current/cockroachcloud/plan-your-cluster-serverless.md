---
title: Plan a CockroachDB Serverless Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page describes how resource usage, pricing, and cluster configurations work in CockroachDB {{ site.data.products.serverless }}. For information on diagnosing and optimizing your resource consumption, see [Optimize your Serverless Resource Usage]({% link cockroachcloud/serverless-resource-usage.md %}).

## Request Units

All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. An RU is an abstracted metric that represents the compute and I/O resources used by a database operation. In addition to queries that you run, background activity, such as automatic statistics to optimize your queries or connecting a changefeed to an external sink, also consumes RUs. You can see how many request units your cluster has used on the [Cluster Overview]({% link cockroachcloud/serverless-cluster-management.md %}#view-cluster-overview) page.

## Pricing

With CockroachDB {{ site.data.products.serverless }}, you are charged only for the storage and activity of your cluster. Cluster activity is measured in [Request Units](#request-units); cluster storage is measured in GiB and is based on the total amount of storage your cluster used over a billing period. Request Unit consumption scales to zero when your cluster has no activity.

RU and storage consumption is prorated at the following prices:

  Unit                    | Cost
  ------------------------|------
  1M Request Units        | $0.20
  1 GiB storage           | $0.50

Refer to [Pricing](https://cockroachlabs.com/pricing) to see cost estimates of common queries and how they increase with the size and complexity of the query. You can view your cluster's RU and storage usage on the [**Cluster Overview** page]({% link cockroachcloud/cluster-overview-page.md %}).

## Free vs. paid usage

CockroachDB {{ site.data.products.serverless }} clusters scale based on your workload so that you will only pay for what you use beyond the free resources. Each non-contract CockroachDB {{ site.data.products.cloud }} organization is given 50 million [Request Units](#request-units) and 10 GiB of storage for free each month. Free resources do not apply to contract customers. Free resources can be spent across all CockroachDB {{ site.data.products.serverless }} clusters in an organization and will appear as a deduction on your monthly invoice.

Setting resource limits will allow your cluster to scale to meet your application's needs and maintain a high level of performance. You must [set resource limits]({% link cockroachcloud/serverless-cluster-management.md %}#edit-cluster-capacity) if you've already created one free CockroachDB {{ site.data.products.serverless }} cluster. To set your limits, you can either set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You can also choose an unlimited amount of resources to prevent your cluster from ever being throttled or disabled.

## Choose resource limits

Your cluster's [configured capacity]({% link cockroachcloud/create-a-serverless-cluster.md %}#step-4-configure-cluster-capacity) determines the resource limits (the maximum amount of storage and RUs the cluster can use in a month).

- If you reach your storage limit, your cluster will be unable to write to its storage unless you delete data or increase your storage limit.
- If you reach your RU limit, your cluster will be disabled until you increase your RU limit or a new billing cycle begins.

  {% include cockroachcloud/serverless-usage.md %}

Cockroach Labs recommends setting your resource limits to about 30% higher than your expected usage to prevent cluster disruption. To learn about tuning your workload to reduce costs, refer to [Understand your CockroachDB {{ site.data.products.serverless }} Resource Usage]({% link cockroachcloud/serverless-resource-usage.md %}).

Each [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) will receive email alerts when a cluster reaches 50%, 75%, and 100% of its resource limits.

## Multi-region clusters

You can [create a CockroachDB {{ site.data.products.serverless }} cluster]({% link cockroachcloud/create-a-serverless-cluster.md %}) with up to [six regions]({% link cockroachcloud/serverless-faqs.md %}#what-regions-are-available-for-cockroachdb-serverless-clusters). When you create a multi-region {{ site.data.products.serverless-plan }} cluster, you will be prompted to select a **Primary region** from which CockroachDB will optimize access to data. If you want to change your region configuration, [you can use the {{ site.data.products.cloud }} Console]({% link cockroachcloud/serverless-cluster-management.md %}#edit-regions), or you can [back up and restore]({% link cockroachcloud/use-managed-service-backups.md %}) your data into a new cluster with the desired configuration.

{{site.data.alerts.callout_info}}
You cannot currently remove regions once they have been added.
{{site.data.alerts.end}}

For optimal performance, deploy client applications in one of your cluster's configured regions. CockroachDB {{ site.data.products.serverless }} uses a geolocation routing policy to automatically route clients to the nearest region, even if that region is not one of your cluster's configured regions. This means that if you are running an application from a region that is not used by your cluster, connecting to that region may cause high network latency. This may be acceptable for development, but should be avoided for any production or performance-sensitive applications. Refer to the [CockroachDB {{ site.data.products.serverless }} FAQs]({% link cockroachcloud/serverless-faqs.md %}#how-do-i-get-the-sql-endpoint-for-a-specific-region-of-my-multi-region-cluster) for information on overriding the automatic routing policy.

While multi-region CockroachDB {{ site.data.products.dedicated }} clusters must have a minimum of three regions, {{ site.data.products.serverless-plan }} clusters can survive [zone failures]({% link {{site.current_cloud_version}}/multiregion-survival-goals.md %}#survive-zone-failures) with only two regions. To survive a [regional failure]({% link {{site.current_cloud_version}}/multiregion-survival-goals.md %}#survive-region-failures), a minimum of three regions is required.

Databases created in CockroachDB {{ site.data.products.serverless }} will automatically inherit all of a cluster's regions, so it is not necessary to run [`ALTER DATABASE ... ADD REGION`]({% link {{site.current_cloud_version}}/alter-database.md %}#add-region) to configure regions when adding a database to the cluster. To override the default inheritance, you can specify the primary region with the [`CREATE DATABASE <db_name> WITH PRIMARY REGION`]({% link {{site.current_cloud_version}}/create-database.md %}) SQL syntax or the [`sql.defaults_primary_region`]({% link {{site.current_cloud_version}}/cluster-settings.md %}#setting-sql-defaults-primary-region) setting.

Storage for a multi-region cluster is billed at the same rate as a single-region cluster. However, by default data is replicated three times in the primary region and once in each additional region, and each replica in the additional regions will accrue more storage costs. For example, a three-region cluster with data replicated five times will use 5/3 times the storage space of a single-region cluster where data is replicated three times.

Cross-region operations consume RUs for cross-region networking. Cross-region networking costs depend on the source and destination regions. For read operations, the source region contains the replica and the destination region is the gateway region. For write operations, the source region is the gateway region and the destination region contains the replica. There is a network charge for each replica to which an operation writes. Refer to [Pricing](https://www.cockroachlabs.com/pricing) for a matrix of cross-region costs.

Keep in mind the following key points when planning your multi-region CockroachDB {{ site.data.products.serverless }} application's architecture:

- Write-heavy applications may experience a significant increase in RU consumption because replicating writes across all regions consumes more resources.
- Read-heavy applications may experience a smaller increase in RU consumption because the resources required to read from a single region of a multi-region cluster are comparable with a single-region cluster.
- Cross-region reads are an anti-pattern and may significantly increase RU consumption. Features such as [global tables]({% link {{ site.current_cloud_version }}/global-tables.md %}), [regional by row tables]({% link {{ site.current_cloud_version }}/regional-tables.md %}), and [follower reads]({% link {{ site.current_cloud_version }}/follower-reads.md %}) help avoid most cross-region reads.
- Cross-region writes will also consume additional RUs, but should not significantly increase consumption.
