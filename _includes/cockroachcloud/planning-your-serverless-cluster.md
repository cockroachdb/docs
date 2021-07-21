### Resource usage

All resource usage in CockroachCloud Serverless (beta) is measured in Request Units, or RUs. RUs represent the compute and I/O resources used by a read or a write query. All database operations cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 1 RU, and a "large read" such as a full table scan with indexes could cost 100 RUs. You can see how many request units your cluster has used on the [Cluster Overview](#view-cluster-overview) page.

### Cluster scaling

CockroachCloud Serverless (beta) clusters scale based on your workload.

**Free forever** clusters include 100M RUs and 5GB of storage per month. They have a guaranteed baseline performance of 2.5K QPS. At this time, you cannot upgrade a free cluster after it is created. Free clusters are throttled to 100 RUs/second don't include the ability to take backups or import data. If you want a cluster with higher performance and full capabilities, choose a paid cluster.

**Pay-as-you-go** clusters include additional resources with no throttling and allow you to perform upgrades, backups, and imports. You will only be charged for the resources you use up to your spend limit. If you reach your spend limit, you will still have access to the resources included with free clusters.

To see a graph of your monthly resource usage and recommended budget, navigate to the [Edit cluster](#edit-your-spend-limit) page.