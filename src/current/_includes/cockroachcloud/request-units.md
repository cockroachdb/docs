All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. An RU is an abstracted metric that represents the compute and I/O resources used by a database operation. In addition to queries that you run, background activity, such as automatic statistics to optimize your queries or connecting a changefeed to an external sink, also consumes RUs. You can see how many request units your cluster has used on the [Cluster Overview]({% link cockroachcloud/cluster-overview-page.md %}#request-units) page.