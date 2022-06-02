### Request Units

{{ site.data.products.serverless }} cluster resource usage is measured by two metrics: storage and Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many Request Units your cluster has used on the [**Cluster Overview**](#view-cluster-overview) page.

### Cluster scaling

{{ site.data.products.serverless }} clusters scale based on your workload. Baseline performance for a Serverless cluster is 100 RUs per second, and any usage above that is called [burst performance](architecture.html#cockroachdb-cloud-terms). Clusters start with 10M RUs of free burst capacity each month and earn 100 RUs per second up to a maximum of 250M free RUs per month. Earned RUs can be used immediately or accumulated as burst capacity. If you use all of your burst capacity, your cluster will revert to baseline performance.

You can set your spend limit higher to maintain a high level of performance with larger workloads. If you have a spend limit, your cluster will not be throttled to baseline performance once you use all of your free earned RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second.

The following diagram shows how RUs are accumulated and consumed:

<img src="{{ 'images/cockroachcloud/ru-diagram.png' | relative_url }}" alt="RU diagram" style="max-width:100%" />

### Resource usage

{% include cockroachcloud/serverless-usage.md %}

All [Console Admins](console-access-management.html#console-admin) will receive email alerts when your cluster reaches 75% and 100% of its burst capacity or storage limit. If you set a spend limit, you will also receive alerts at 50%, 75%, and 100% of your spend limit.

### Example 

Let's say you have an application that processes sensor data at the end of the week. Most of the week it handles only occasional read requests and uses under the 100 RUs per second baseline. At the end of the week the sensors send in their data to the application, requiring a performance burst over the 100 RUs per second baseline. When the cluster requires more than 100 RUs per second to cover the burst, it first spends the earned RUs that accrued over the previous week and the 10M free burst RUs given to the cluster each month. 

If you have a free cluster, it will be throttled to baseline performance once all of the free and earned burst RUs are used. The sensor data will still be processed while the cluster is throttled, but it may take longer to complete the job. If you have a spend limit set, the cluster will be able to scale up and spend RUs to cover the burst, up to your maximum spend limit. If you reach your spend limit at any point during the month, your cluster will be throttled to baseline performance.

If your cluster gets throttled after using all of its burst capacity during the high load period, it will still earn RUs during lower load periods and be able to burst again. At the end of the month, your usage will reset and you will receive another 10M free burst RUs.