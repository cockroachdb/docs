---
title: Plan a CockroachDB Serverless Cluster
summary: Plan your cluster's configuration.
toc: true
docs_area: manage
---

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page describes how resource usage, pricing, and cluster configurations work in {{ site.data.products.serverless }} so you can plan your cluster.

## Request Units

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in [Request Units](learn-about-request-units.html), or RUs. RUs are an abstracted metric that represent the size and complexity of requests made to your cluster. [Pricing](https://cockroachlabs.com/pricing) shows cost estimates of some common queries and how they increase with the size and complexity of the query. In addition to queries that you run, Request Units can be consumed by background activity, such as automatic statistics gathering used to optimize your queries or changefeeds connected to an external sink.

You can see your cluster's RU and storage usage on the [**Cluster Overview** page](cluster-overview-page.html).

## Pricing

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. Cluster storage is measured in GiB and based on the total volume of storage used over the billing period. Cluster activity, including SQL queries, bulk operations, and background jobs, is measured in [Request Units](learn-about-request-units.html), or RUs. A Request Unit is an abstracted metric that represents the size and complexity of requests made to your cluster. Note that a single activity or request could cost more than 1 Request Unit. Request Unit consumption scales to zero when your cluster has no activity, so you will only be charged for what you use.

RU and storage consumption is prorated at the following prices:

  Unit                    | Cost
  ------------------------|------
  1M Request Units        | $0.20
  1 GiB storage           | $0.50

## Choosing resource limits

Your cluster's [resource limits](../{{site.versions["stable"]}}/architecture/glossary.html#resource-limits) are the maximum amount of storage and RUs you can use in a month. If you reach your storage limit, your cluster will be throttled and you will only be able to delete data or increase your storage limit. If you reach your RU limit, your cluster will be disabled until the end of the billing cycle unless you increase your RU limit.

  {% include cockroachcloud/serverless-usage.md %}

We recommend setting your resource limits to about 30% higher than your expected usage to prevent unexpected throttling. To learn about tuning your workload to reduce costs, see [Optimize Your {{ site.data.products.serverless }} Workload](optimize-serverless-workload.html).

All [Org Administrators](authorization.html#org-administrator-legacy) will receive email alerts when a cluster reaches 50%, 75%, and 100% of its [resource limits](../{{site.versions["stable"]}}/architecture/glossary.html#resource-limits).

## Free vs. paid usage

{{ site.data.products.serverless }} clusters scale based on your workload so that you will only pay for what you use beyond the free resources. All {{ site.data.products.db }} organizations are given 50 million RUs and 10 GiB of storage for free each month. Free resources can be spent across all {{ site.data.products.serverless }} clusters in an organization and will appear as a deduction on your monthly invoice. 

You must [set resource limits](serverless-cluster-management.html#edit-your-resource-limits) if you've already created one free {{ site.data.products.serverless }} cluster. Setting resource limits will allow your cluster to scale to meet your application's needs and maintain a high level of performance. To set your limits, you can either set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You can also choose an unlimited amount of resources to prevent your cluster from ever being throttled or disabled.

## Multi-region clusters

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

You can create a {{ site.data.products.serverless }} cluster with up to six regions. When you create a multi-region Serverless cluster, you will be prompted to select a **Primary region** from which CockroachDB will optimize access to data. At this time, you cannot add or remove regions from a {{ site.data.products.serverless }} cluster once it has been created. If you want to change your region configuration, you can backup and restore your data into a new cluster with the desired configuration.

Unlike {{ site.data.products.dedicated }} clusters, {{ site.data.products.serverless }} clusters can have two regions if your goal is only to survive zone failure. Clusters must have at least three regions to ensure that data replicated across regions can survive the region failure.

Databases created in {{ site.data.products.serverless }} will automatically inherit all of a cluster's regions. To override the default inheritance, you can specify the primary region with the `CREATE DATABASE <db_name> WITH PRIMARY REGION` SQL syntax or the `sql.defaults_primary_region` setting.

For multi-region clusters, storage is billed at the same rate, but because data is replicated three times in the primary region and once in each additional region by default, storage costs will be multiplied based on the number of replicas. During the [public preview](../{{site.versions["stable"]}}/cockroachdb-feature-availability.html#feature-availability-phases), RU usage for queries that cross regions will not account for inter-region bandwidth.
