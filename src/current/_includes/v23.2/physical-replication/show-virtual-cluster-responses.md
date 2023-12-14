Field    | Response
---------+----------
`id` | The ID of the virtual cluster.
`name` | The name of the standby (destination) virtual cluster.
`data_state` | The state of the data on the virtual cluster. This can show one of the following: `initializing replication`, `ready`, `replicating`, `replication paused`, `replication pending cutover`, `replication cutting over`, `replication error`. Refer to [Data state](#data-state) for more detail on each response.
`service_mode` | The service mode shows whether the virtual cluster is ready to accept SQL requests. This can show one `none` or `shared`. When `shared`, the virtual cluster's SQL connections will be served by the same nodes that are serving the system interface.
`source_tenant_name` | The name of the primary (source) virtual cluster.
`source_cluster_uri` | The URI of the primary (source) cluster. The standby cluster connects to the primary cluster using this URI when [starting a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication).
`replication_job_id` | The ID of the replication job.
`replicated_time` | The latest timestamp at which the standby cluser has consistent data — that is, the latest time you can cut over to. This time advances automatically as long as the replication proceeds without error. `replicated_time` is updated periodically (every `30s`).
`retained_time` | The earliest timestamp at which the standby cluster has consistent data — that is, the earliest time you can cut over to.
`cutover_time` | The time at which the cutover will begin. This can be in the past or the future. Refer to [Cut over to a point in time]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-a-point-in-time).
`capability_name` | The [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) name.
`capability_value` | Whether the [capability]({% link {{ page.version.version }}/create-virtual-cluster.md %}#capabilities) is enabled for the virtual cluster.