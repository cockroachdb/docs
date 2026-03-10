Now that your deployment is working, you can:

1. [Implement your data model]({% link {{ page.version.version }}/sql-statements.md %}).
1. [Create users]({% link {{ page.version.version }}/create-user.md %}) and [grant them privileges]({% link {{ page.version.version }}/grant.md %}).
1. [Connect your application]({% link {{ page.version.version }}/install-client-drivers.md %}). Be sure to connect your application to the load balancer, not to a CockroachDB node.
1. [Take backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) of your data.

You may also want to adjust the way the cluster replicates data. For example, by default, a multi-node cluster replicates all data 3 times; you can change this replication factor or create additional rules for replicating individual databases and tables differently. For more information, see [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %}).

{{site.data.alerts.callout_danger}}
When running a cluster of 5 nodes or more, it's safest to [increase the replication factor for important internal data]({% link {{ page.version.version }}/configure-replication-zones.md %}#create-a-replication-zone-for-a-system-range) to 5, even if you do not do so for user data. For the cluster as a whole to remain available, the ranges for this internal data must always retain a majority of their replicas.
{{site.data.alerts.end}}
