Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-user.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the load balancer, not to a CockroachDB node.

You may also want to adjust the way the cluster replicates data. For example, by default, a multi-node cluster replicates all data 3 times; you can change this replication factor or create additional rules for replicating individual databases and tables differently. For more information, see [Configure Replication Zones](configure-replication-zones.html).

{{site.data.alerts.callout_danger}}
When running a cluster of 5 nodes or more, it's safest to [increase the replication factor for important internal data](configure-replication-zones.html#create-a-replication-zone-for-a-system-range) to 5, even if you do not do so for user data. For the cluster as a whole to remain available, the ranges for this internal data must always retain a majority of their replicas.
{{site.data.alerts.end}}
