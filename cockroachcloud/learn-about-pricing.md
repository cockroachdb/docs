---
title: Learn About CockroachDB Serverless Pricing
summary: Understand CockroachDB Serverless pricing and Request Units.
toc: true
docs_area: deploy
---

This page describes how charges accumulate in {{ site.data.products.serverless }}.

## Pricing overview

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. Cluster storage is measured in GiB and based on the total volume of storage used over the billing period. Cluster activity, including SQL queries, bulk operations, and background jobs, is measured in [Request Units](learn-about-request-units.html), or RUs. A Request Unit is an abstracted metric that represents the size and complexity of requests made to your cluster. Note that a single activity or request could cost more than 1 Request Unit. Request Unit consumption scales to zero when your cluster has no activity, so you will only be charged for what you use.

RU and storage consumption is prorated at the following prices:

  Unit                    | Cost
  ------------------------|------
  1M Request Units        | $0.20
  1 GiB storage           | $0.50

## Choosing resource limits

Your cluster's resource limits are the maximum amount of storage and RUs you can use in a month. If you reach your storage limit, your cluster will be throttled and you will only be able to delete data or increase your storage limit. If you reach your RU limit, your cluster will be disabled until the end of the billing cycle unless you increase your RU limit.

  {% include cockroachcloud/serverless-usage.md %}

We recommend setting your resource limits to about 30% higher than your expected usage to prevent unexpected throttling. To learn about tuning your workload to reduce costs, see [Optimize Your {{ site.data.products.serverless }} Workload](optimize-serverless-workload.html).

All [Console Admins](console-access-management.html#console-admin) will receive email alerts when a cluster reaches 50%, 75%, and 100% of its resource limits.

## Free vs. paid usage

{{ site.data.products.serverless }} clusters scale based on your workload so that you will only pay for what you use beyond the free resources. All {{ site.data.products.db }} organizations are given 50 million RUs and 10 GiB of storage for free each month. Free resources can be spent across all {{ site.data.products.serverless }} clusters in an organization and will appear as a deduction on your monthly invoice. 

You must set resource limits if you've already created one free {{ site.data.products.serverless }} cluster. Setting resource limits will allow your cluster to scale to meet your application's needs and maintain a high level of performance. To set your limits, you can either set storage and RU limits individually, or enter a dollar amount that will be split automatically between both resources. You can also choose an unlimited amount of resources to prevent your cluster from ever being throttled or disabled.

## Learn more

- [Learn About Request Units](learn-about-request-units.html)
- [Optimize Your {{ site.data.products.serverless }} Workload](optimize-serverless-workload.html)
- [Manage Your {{ site.data.products.serverless }} Cluster](serverless-cluster-management.html)
