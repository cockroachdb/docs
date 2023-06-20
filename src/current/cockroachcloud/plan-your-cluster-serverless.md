---
title: Plan a CockroachDB Serverless Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page describes how resource usage, pricing, and cluster configurations work in {{ site.data.products.serverless }}.

## Request Units

All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. An RU is an abstracted metric that represent the size and complexity of requests made to your cluster. In addition to queries that you run, background activity, such as automatic statistics to optimize your queries or connecting a changefeed to an external sink, also consumes RUs.

## Pricing

With {{ site.data.products.serverless }}, you are charged only for the storage and activity of your cluster. Cluster activity is measured in [Request Units](#request-units); cluster storage is measured in GiB and is based on the total amount of storage your cluster used over a billing period. Request Unit consumption scales to zero when your cluster has no activity.

RU and storage consumption is prorated at the following prices:

  Unit                    | Cost
  ------------------------|------
  1M Request Units        | $0.20
  1 GiB storage           | $0.50

You can see your cluster's RU and storage usage on the [**Cluster Overview** page](cluster-overview-page.html).

## Free vs. paid usage

{{ site.data.products.serverless }} clusters scale based on your workload so that you will only pay for what you use beyond the free resources. All {{ site.data.products.db }} organizations are given 50 million [Request Units](#request-units) and 10 GiB of storage for free each month. Free resources can be spent across all {{ site.data.products.serverless }} clusters in an organization and will appear as a deduction on your monthly invoice.

Setting resource limits will allow your cluster to scale to meet your application's needs and maintain a high level of performance. You must [set resource limits](serverless-cluster-management.html#edit-your-resource-limits) if you've already created one free {{ site.data.products.serverless }} cluster. To set your limits, you can either set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You can also choose an unlimited amount of resources to prevent your cluster from ever being throttled or disabled.
  
## Choose resource limits

Your cluster's [resource limits](../{{site.versions["stable"]}}/architecture/glossary.html#resource-limits) define the maximum amount of storage and RUs the cluster can use in a month.

- If you reach your storage limit, your cluster will be unable to write to its storage unless you delete data or increase your storage limit.
- If you reach your RU limit, your cluster will be disabled until you increase your RU limit or a new billing cycle begins.

  {% include cockroachcloud/serverless-usage.md %}

Cockroach Labs recommends setting your resource limits to about 30% higher than your expected usage to prevent cluster disruption. To learn about tuning your workload to reduce costs, refer to [Optimize Your {{ site.data.products.serverless }} Workload](optimize-serverless-workload.html).

Each [Org Administrator](authorization.html#org-administrator-legacy) will receive email alerts when a cluster reaches 50%, 75%, and 100% of its [resource limits](../{{site.versions["stable"]}}/architecture/glossary.html#resource-limits).

## Multi-region clusters

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

You can [create a {{ site.data.products.serverless }} cluster](create-a-serverless-cluster.html) with up to [six regions](serverless-faqs.html#what-regions-are-available-for-cockroachdb-serverless-clusters). When you create a multi-region {{ site.data.products.serverless-plan }} cluster, you will be prompted to select a **Primary region** from which CockroachDB will optimize access to data. At this time, you cannot add or remove regions from a {{ site.data.products.serverless }} cluster once it has been created. If you want to change your region configuration, you can [back up and restore](use-managed-service-backups.html) your data into a new cluster with the desired configuration.

For optimal performance, deploy client applications in one of your cluster's configured regions. {{ site.data.products.serverless }} uses a geolocation routing policy to automatically route clients to the nearest region, even if that region is not one of your cluster's configured regions. This means that if you are running an application from a region that is not used by your cluster, connecting to that region may cause high network latency. This may be acceptable for development, but should be avoided for any production or performance-sensitive applications. Refer to the [{{ site.data.products.serverless }} FAQs](serverless-faqs.html#how-do-i-get-the-sql-endpoint-for-a-specific-region-of-my-multi-region-cluster) for information on overriding the automatic routing policy.

While multi-region {{ site.data.products.dedicated }} clusters must have a minimum of three regions, {{ site.data.products.serverless-plan }} clusters can survive [zone failures](../{{site.versions["stable"]}}/multiregion-overview.html#survive-zone-failures) with only two regions. To survive a [regional failure](../{{site.versions["stable"]}}/multiregion-overview.html#survive-region-failures), a minimum of three regions is required.

Databases created in {{ site.data.products.serverless }} will automatically inherit all of a cluster's regions, so it is not necessary to run [`ALTER DATABASE ... ADD REGION`](../{{site.versions["stable"]}}/alter-database.html#add-region) to configure regions when adding a database to the cluster. To override the default inheritance, you can specify the primary region with the [`CREATE DATABASE <db_name> WITH PRIMARY REGION`](../{{site.versions["stable"]}}/create-database.html) SQL syntax or the [`sql.defaults_primary_region`](../{{site.versions["stable"]}}/cluster-settings.html#setting-sql-defaults-primary-region) setting.

Storage for a multi-region cluster is billed at the same rate as a single-region cluster. However, by default data is replicated three times in the primary region and once in each additional region, and storage costs are multiplied based on the number of replicas.

- Write-heavy applications may experience a significant increase in RU consumption because replicating writes across all regions consumes more resources.
- Read-heavy applications may experience a smaller increase in RU consumption because the resources required to read from a single region of a multi-region cluster are comparable with a single-region cluster.

During the multi-region {{ site.data.products.serverless-plan }} [preview](../{{site.versions["stable"]}}/cockroachdb-feature-availability.html#feature-availability-phases), RU usage for queries that cross regions will not account for inter-region bandwidth.
