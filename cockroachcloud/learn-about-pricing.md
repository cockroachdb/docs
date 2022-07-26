---
title: Learn About CockroachDB Serverless Pricing
summary: Understand CockroachDB Serverless pricing and Request Units.
toc: true
docs_area: deploy
redirect_from: planning-your-serverless-cluster.html
---

This page describes how charges accumulate in {{ site.data.products.serverless }}.

## Pricing overview

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. Cluster storage is measured in GiB per month, based on the total volume of storage used over the billing period. Cluster activity, including SQL queries, bulk operations, and background jobs, is measured in [Request Units](learn-about-request-units.html), or RUs. A Request Unit is an abstracted metric that represents the size and complexity of requests made to your cluster. Note that a single activity or request could cost more than 1 Request Unit. Request Unit consumption scales to zero when your cluster has no activity, so you will only be charged for what you use.

RU and storage consumption is prorated at the following prices:

  Unit                    | Cost
  ------------------------|------
  10M Request Units       | $1.00
  1 GiB storage per month | $0.50

## Choosing a spend limit

Your cluster's spend limit is the maximum you could be charged in a month. If you reach your spend limit, your cluster will be throttled and may become slow or unavailable.

  {% include cockroachcloud/serverless-usage.md %}

We recommend setting your spend limit to about 30% higher than your expected usage to prevent unexpected throttling. To learn about tuning your workload to reduce costs, see [Optimize Your {{ site.data.products.serverless }} Workload](optimize-serverless-workload.html).

All [Console Admins](console-access-management.html#console-admin) will receive email alerts when your cluster reaches 75% and 100% of its burst capacity or storage limit. If you set a spend limit, you will also receive alerts at 50%, 75%, and 100% of your spend limit.

## Free vs. paid usage

{{ site.data.products.serverless }} clusters scale based on your workload. Baseline performance for a Serverless cluster is 100 RUs per second, and any usage above that is called [burst performance](architecture.html#cockroachdb-cloud-terms). Clusters start with 10M RUs of free burst capacity each month and earn 100 RUs per second up to a maximum of 250M free RUs per month. Earned RUs can be used immediately or accumulated as burst capacity. If you use all of your burst capacity, your cluster will revert to baseline performance.

You can set your spend limit higher to maintain a high level of performance with larger workloads. If you have set a spend limit, you will get the equivalent number of RUs upfront each month as burst capacity, in addition to your free burst capacity. When you run out of all burst capacity, you will return to the baseline performance of 100 RUs per second.

The following diagram shows how RUs are accumulated and consumed:

<img src="{{ 'images/cockroachcloud/ru-diagram.png' | relative_url }}" alt="RU diagram" style="max-width:100%" />

## Serverless Scaling Example

Let's say you have an application that processes sensor data at the end of the week. Most of the week it handles only occasional read requests and uses under the 100 RUs per second baseline. At the end of the week the sensors send in their data to the application, requiring a performance burst over the 100 RUs per second baseline. When the cluster requires more than 100 RUs per second to cover the burst, it first spends the earned RUs that accrued over the previous week and the 10M free burst RUs given to the cluster each month.

If you have a free cluster, it will be throttled to baseline performance once all of the free and earned burst RUs are used. The sensor data will still be processed while the cluster is throttled, but it may take longer to complete the job. If you have set a spend limit set, the cluster will be able to scale up and spend RUs to cover the burst, up to your maximum spend limit. If you reach your spend limit at any point during the month, your cluster will be throttled to baseline performance.

If your cluster gets throttled after using all of its burst capacity during the high load period, it will still earn RUs during lower load periods and be able to burst again. At the end of the month, your usage will reset and you will receive another 10M free burst RUs.

## Learn more

- [Learn About Request Units](learn-about-request-units.html)
- [Optimize Your {{ site.data.products.serverless }} Workload](optimize-serverless-workload.html)
- [Manage Your {{ site.data.products.serverless }} Cluster](serverless-cluster-management.html)
