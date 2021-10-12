### Request Units

Most resource usage in {{ site.data.products.serverless }} is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many request units your cluster has used on the [Cluster Overview](#view-cluster-overview) page.

### Cluster scaling

{{ site.data.products.serverless }} clusters scale based on your workload. Clusters start with 10M RUs of free [burst capacity](architecture.html#concepts) and accrue 100 RUs per second up to a maximum of 250M free RUs per month. Accrued RUs can be used for burst performance, and once they have been used the cluster will revert to the baseline performance of 100 RUs per second.

You can set your spend limit higher to maintain a high level of performance with larger workloads. If you have a spend limit, your cluster will not be throttled to baseline performance once you use all of your free accrued RUs. Instead, it will continue to use burst performance as needed until you reach your spend limit. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of 100 RUs per second. All [Console Admins](console-access-management.html#console-admin) will receive email alerts when your cluster reaches 50%, 75%, and 100% of its spend limit, burst capacity, or storage limit.

To see a graph of your monthly resource usage and recommended spend limit, navigate to the [Edit cluster](#edit-your-spend-limit) page.