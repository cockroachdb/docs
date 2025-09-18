Field    | Response
---------+----------
`id` | The ID of a virtual cluster.
`name` | The name of the standby (destination) virtual cluster.
`data_state` | The state of the data on a virtual cluster. This can show one of the following: `initializing replication`, `ready`, `replicating`, `replication paused`, `replication pending failover`, `replication failing over`, `replication error`. Refer to [Data state](#data-state) for more detail on each response.
`service_mode` | The service mode shows whether a virtual cluster is ready to accept SQL requests. This can show `none` or `shared`. When `shared`, a virtual cluster's SQL connections will be served by the same nodes that are serving the system virtual cluster.
`source_tenant_name` | The name of the primary (source) virtual cluster.
`source_cluster_uri` | The URI of the primary (source) cluster. The standby cluster connects to the primary cluster using this URI when [starting a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication).
`replicated_time` | The latest timestamp at which the standby cluster has consistent data — that is, the latest time you can fail over to. This time advances automatically as long as the replication proceeds without error. `replicated_time` is updated periodically (every `30s`).
`retained_time` | The earliest timestamp at which the standby cluster has consistent data — that is, the earliest time you can fail over to.
`replication_lag` | The time between the most up-to-date replicated time and the actual time. Refer to the [Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) for more detail.
`failover_time` | The time at which the failover will begin. This can be in the past or the future. Refer to [Fail over to a point in time]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-a-point-in-time).
`status` | The status of the replication stream. This can show one of the following: `initializing replication`, `ready`, `replicating`, `replication paused`, `replication pending failover`, `replication failing over`, `replication error`. Refer to [Data state](#data-state) for more detail on each response.
`capability_name` | The [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) name.
`capability_value` | Whether the [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) is enabled for a virtual cluster.
