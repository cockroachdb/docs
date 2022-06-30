---
title: Learn about Request Units
summary: Understand CockroachDB Serverless resource usage.
toc: true
docs_area: deploy
redirect_from: planning-your-serverless-cluster.html
---

This page describes how Request Units and pricing work in {{ site.data.products.serverless }}.

## Request Units

With {{ site.data.products.serverless }}, you are charged for the storage and activity of your cluster. All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. RUs are an abstracted metric that represent the size and complexity of requests made to your cluster.

For example, the cost to do a prepared point read (fetching a single row by its key) of a 64 byte row is approximately 1 RU, plus 1 RU for each additional KiB. 

~~~ shell
SELECT * FROM table_with_64_byte_rows WHERE key = $1;
~~~

Writing a 64 byte row costs approximately 7 RUs, which includes the cost of replicating the write 3 times for high availability and durability, plus 3 RUs for each additional KiB.

~~~ shell
INSERT INTO table_with_64_byte_rows (key, val) VALUES (100, $1);
~~~

You can see your cluster's RU and storage usage on the [**Cluster Overview** page](cluster-overview-page.html).

### Pricing

RU and storage consumption is prorated at the following prices:

  Activity Measure        | Price
  ------------------------|------
  10M Request Units       | $1.00
  1 GiB storage per month | $0.50

  Query           | RUs per 1 query    | Price per 1M queries
  ------------------------|----------|----------
  Establish SQL Connection      | 26.2   | $2.62
  SELECT 1 |  0.16   | $0.02
  Read 1 row of 10 bytes | 1.02   | $0.10
  Read 1 row of 1024 bytes | 2.05   | $0.20
  Read 1 row of 2048 bytes | 3.08    | $0.31
  Write 1 row of 10 bytes  | 6.42    | $0.64
  Write 1 row of 1024 bytes  | 9.44    | $0.94
  Write 1 row of 2048 bytes | 12.48  | $1.125
  Write 1 row of 1024 bytes, with 0 indexes | 9.44    | $0.94
  Write 1 row of 1024 bytes, with 1 index  | 18.75   | $1.88
  Write 1 row of 1024 bytes, with 2 indexes  | 27.88    | $2.80
  Scan 1K rows of 10 bytes, return 1 | 2.26    | $0.23
  Scan 1K rows of 1024 bytes, return 1 | 27.88   | $2.79
  Scan 10K rows of 1024 bytes, return 1 | 238.72    | $23.87

## Cluster scaling

{{ site.data.products.serverless }} clusters scale based on your workload. Baseline performance for a Serverless cluster is 100 RUs per second, and any usage above that is called [burst performance](architecture.html#cockroachdb-cloud-terms). Clusters start with 10M RUs of free burst capacity each month and earn 100 RUs per second up to a maximum of 250M free RUs per month. Earned RUs can be used immediately or accumulated as burst capacity. If you use all of your burst capacity, your cluster will revert to baseline performance.

You can set your spend limit higher to maintain a high level of performance with larger workloads. If you have set a spend limit, your cluster will not be throttled to baseline performance once you use all of your free earned RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second.

The following diagram shows how RUs are accumulated and consumed:

<img src="{{ 'images/cockroachcloud/ru-diagram.png' | relative_url }}" alt="RU diagram" style="max-width:100%" />

## Choosing a spend limit

{% include cockroachcloud/serverless-usage.md %}

All [Console Admins](console-access-management.html#console-admin) will receive email alerts when your cluster reaches 75% and 100% of its burst capacity or storage limit. If you set a spend limit, you will also receive alerts at 50%, 75%, and 100% of your spend limit.

## Serverless Scaling Example 

Let's say you have an application that processes sensor data at the end of the week. Most of the week it handles only occasional read requests and uses under the 100 RUs per second baseline. At the end of the week the sensors send in their data to the application, requiring a performance burst over the 100 RUs per second baseline. When the cluster requires more than 100 RUs per second to cover the burst, it first spends the earned RUs that accrued over the previous week and the 10M free burst RUs given to the cluster each month. 

If you have a free cluster, it will be throttled to baseline performance once all of the free and earned burst RUs are used. The sensor data will still be processed while the cluster is throttled, but it may take longer to complete the job. If you have set a spend limit set, the cluster will be able to scale up and spend RUs to cover the burst, up to your maximum spend limit. If you reach your spend limit at any point during the month, your cluster will be throttled to baseline performance.

If your cluster gets throttled after using all of its burst capacity during the high load period, it will still earn RUs during lower load periods and be able to burst again. At the end of the month, your usage will reset and you will receive another 10M free burst RUs.