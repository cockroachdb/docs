All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. An RU is an abstracted metric that represents the [compute and I/O resources]({% link cockroachcloud/resource-usage.md %}#understand-resource-consumption) used by a database operation. In addition to queries that you run, background activity, such as automatic statistics to optimize your queries or running a changefeed to an external sink, also consumes RUs. You can review how many request units your cluster has used on the [Cluster Overview]({% link cockroachcloud/cluster-overview-page.md %}#request-units) page.