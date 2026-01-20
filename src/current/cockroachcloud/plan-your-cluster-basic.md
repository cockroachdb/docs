---
title: Plan a CockroachDB Basic Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page describes how resource usage, pricing, and cluster configurations work in CockroachDB {{ site.data.products.basic }}. For information on diagnosing and optimizing your resource consumption, see [Optimize your Resource Usage]({% link cockroachcloud/resource-usage.md %}).

## Request Units

{% include cockroachcloud/request-units.md %}

{{site.data.alerts.callout_info}}
Basic Tier is ideal for smaller, bursty applications which require up to 30K RU/second, or approximately 60 vCPUs.
{{site.data.alerts.end}}

## Pricing

With CockroachDB {{ site.data.products.basic }}, you are charged only for the storage and activity of your cluster. Cluster activity is measured in [Request Units](#request-units); cluster storage is measured in GiB and is based on the total amount of storage your cluster used over a billing period. Request Unit consumption scales to zero when your cluster has no activity.

RU and storage consumption is prorated at the following prices:

  Unit                    | Cost
  ------------------------|------
  1M Request Units        | $0.20
  1 GiB storage           | $0.50

Refer to [Pricing](https://cockroachlabs.com/pricing) to see cost estimates of common queries and how they increase with the size and complexity of the query. You can view your cluster's RU and storage usage on the [**Cluster Overview** page]({% link cockroachcloud/cluster-overview-page.md %}).

## Free vs. paid usage

CockroachDB {{ site.data.products.basic }} clusters scale based on your workload so that you will only pay for what you use beyond the free resources. Each pay-as-you-go CockroachDB {{ site.data.products.cloud }} organization - those paying monthly by credit card or marketplace - is given $15 of resource consumption (equivalent to 50 million [Request Units](#request-units) and 10 GiB of storage) for free each month. Every monthly billing cycle, this free monthly resource benefit can be spent across all CockroachDB {{ site.data.products.basic }} clusters in an organization. The free usage appears as a $15 deduction on your monthly invoice.

{{site.data.alerts.callout_info}}
Customers with annual or multi-year contracts are not eligible for the free monthly resource benefit.
{{site.data.alerts.end}}

Setting resource limits will allow your cluster to scale to meet your application's needs and maintain a high level of performance. You must [set resource limits]({% link cockroachcloud/basic-cluster-management.md %}#edit-cluster-capacity) if you've already created one free CockroachDB {{ site.data.products.basic }} cluster. To set your limits, you can either set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You can also choose an unlimited amount of resources to prevent your cluster from ever being throttled or disabled.

## Choose resource limits

Your cluster's [configured capacity]({% link cockroachcloud/create-a-basic-cluster.md %}#step-4-configure-cluster-capacity) determines the [resource limits](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#resource-limits) (the maximum amount of storage and RUs the cluster can use in a month).

- If you reach your storage limit, your cluster will be unable to write to its storage unless you delete data or increase your storage limit.
- If you reach your RU limit, your cluster will be disabled until you increase your RU limit or a new billing cycle begins.

  {% include cockroachcloud/basic-usage.md %}

Cockroach Labs recommends setting your resource limits to about 30% higher than your expected usage to prevent cluster disruption. To learn about tuning your workload to reduce costs, refer to [Understand your Resource Usage]({% link cockroachcloud/resource-usage.md %}).

Each [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) will receive email alerts when a cluster reaches 50%, 75%, and 100% of its [resource limits](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/glossary#resource-limits).

## Multi-region clusters

When you create a multi-region {{ site.data.products.basic }} cluster, you will be prompted to select a **Primary region** from which CockroachDB will optimize access to data. If you want to change your region configuration, [you can use the {{ site.data.products.cloud }} Console]({% link cockroachcloud/basic-cluster-management.md %}#edit-regions), or you can [back up and restore]({% link cockroachcloud/managed-backups.md %}) your data into a new cluster with the desired configuration.

{{site.data.alerts.callout_info}}
You cannot currently remove regions once they have been added.
{{site.data.alerts.end}}

For optimal performance, deploy client applications in one of your cluster's configured regions. CockroachDB {{ site.data.products.basic }} uses a geolocation routing policy to automatically route clients to the nearest region, even if that region is not one of your cluster's configured regions. This means that if you are running an application from a region that is not used by your cluster, connecting to that region may cause high network latency. This may be acceptable for development, but should be avoided for any production or performance-sensitive applications.

While multi-region CockroachDB {{ site.data.products.advanced }} clusters must have a minimum of three regions, {{ site.data.products.basic }} clusters can survive [zone failures](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-survival-goals#survive-zone-failures) with only two regions. To survive a [regional failure](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/multiregion-survival-goals#survive-region-failures), a minimum of three regions is required.

Databases created in CockroachDB {{ site.data.products.basic }} will automatically inherit all of a cluster's regions, so it is not necessary to run [`ALTER DATABASE ... ADD REGION`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-database#add-region) to configure regions when adding a database to the cluster. To override the default inheritance, you can specify the primary region with the [`CREATE DATABASE <db_name> WITH PRIMARY REGION`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-database) SQL syntax or the [`sql.defaults_primary_region`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cluster-settings#setting-sql-defaults-primary-region) setting.

Storage for a multi-region cluster is billed at the same rate as a single-region cluster. However, by default data is replicated three times in the primary region and once in each additional region, and each replica in the additional regions will accrue more storage costs. For example, a three-region cluster with data replicated five times will use 5/3 times the storage space of a single-region cluster where data is replicated three times.

Cross-region operations consume RUs for cross-region networking. Cross-region networking costs depend on the source and destination regions. For read operations, the source region contains the replica and the destination region is the gateway region. For write operations, the source region is the gateway region and the destination region contains the replica. There is a network charge for each replica to which an operation writes. Refer to [Pricing](https://www.cockroachlabs.com/pricing) for a matrix of cross-region costs.

Keep in mind the following key points when planning your multi-region CockroachDB {{ site.data.products.basic }} application's architecture:

- Write-heavy applications may experience a significant increase in RU consumption because replicating writes across all regions consumes more resources.
- Read-heavy applications may experience a smaller increase in RU consumption because the resources required to read from a single region of a multi-region cluster are comparable with a single-region cluster.
- Cross-region reads are an anti-pattern and may significantly increase RU consumption. Features such as [global tables](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/global-tables), [regional by row tables](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/regional-tables), and [follower reads](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/follower-reads) help avoid most cross-region reads.
- Cross-region writes will also consume additional RUs, but should not significantly increase consumption.

