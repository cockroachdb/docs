### Resource usage

All resource usage in CockroachCloud Serverless (beta) is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a read or a write query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 1 RU, and a "large read" such as a full table scan with indexes could cost 100 RUs. You can see how many request units your cluster has used on the [Cluster Overview](#view-cluster-overview) page.

### Cluster scaling

CockroachCloud Serverless (beta) clusters scale based on your workload. Free clusters include 100M RUs and 5GB of storage per month. They have a guaranteed baseline performance of 100 RUs per second, or 2.5K QPS.

Paid clusters include additional resources with no throttling. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, you will still have access to the resources included with free clusters.

To see a graph of your monthly resource usage and recommended budget, navigate to the [Edit cluster](#edit-your-spend-limit) page.