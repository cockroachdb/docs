### Resource usage

Most resource usage in {{ site.data.products.serverless }} is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 1 RU, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many request units your cluster has used on the [Cluster Overview](#view-cluster-overview) page.

### Cluster scaling

{{ site.data.products.serverless }} clusters scale based on your workload. Free clusters include 250M RUs with 10M RUs reserved for [burst performance](architecture.html#concepts) per month and 5 GiB of storage. They have a guaranteed baseline performance of 100 RUs per second, or up to 100 QPS.

You can set your spend limit higher to maintain a high level of performance with larger workloads. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, your cluster will revert to the baseline performance of free clusters.

To see a graph of your monthly resource usage and recommended spend limit, navigate to the [Edit cluster](#edit-your-spend-limit) page.