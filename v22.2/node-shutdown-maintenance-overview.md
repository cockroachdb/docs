---
title: Node Shutdown and Maintenance Overview
summary: A description of what happens when you terminate the cockroach process, manually drain a node, or decommission a node, and some of the reasons for performing these operations.
toc: true
docs_area: manage
---

This page describes what happens when you [stop or restart the `cockroach` process](#stopping-or-restarting-the-cockroach-process) on a node, manually [drain](node-shutdown.html#drain-a-node) a node to perform maintenance, or [decommission](node-shutdown.html#decommission-a-node) a node to scale down a cluster or change the cluster's topology. When you are designing your organization's maintenance procedures and contingency plans, keep the information on this page in mind, as well as the procedures outlined in [Shut Down a Node](node-shutdown.html), [Drain a Node](node-drain.html), and [Decommission a Node](node-decommission.html). Following this guidance can help to ensure the stability of your cluster and the availability of its data during routine and unplanned maintenance.

- You [stop or restart the `cockroach` process](#stopping-or-restarting-the-cockroach-process) on a node by sending a `SIGTERM` or `SIGHUP` signal to it, typically using a process manager such as `systemd`. Unless it is already drained or decommissioned, the node is automatically drained before the process terminates or restarts. A node is not drained before it is forcibly stopped using a `SIGKILL` signal; SQL clients are disconnected immediately unless the node was manually [drained](#draining-a-node) before sending the signal.

  The `cockroach` process is expected to restart within the duration specified by the [`server.time_until_store_dead`](cluster-settings.html#setting-server-time-until-store-dead) cluster setting (5 minutes by default). Otherwise, the node's replicas are moved to other nodes.

- You [drain a node](#draining-a-node) to perform maintenance or restart the node. When a node is drained, it stops accepting SQL client connections and holding leadership of leases, but participates in the cluster for the purposes of quorum and replication. After maintenance is complete, you must restart the `cockroach` process for the node to resume normal operations.

  A drained node is expected to rejoin the cluster after its maintenance. If the `cockroach` process is not restarted within the duration specified by the [`server.time_until_store_dead`](cluster-settings.html#setting-server-time-until-store-dead) cluster setting (5 minutes by default), the node's replicas are moved to other nodes.

- You [decommission a node](#decommissioning-a-node) to remove it from the cluster. A node can be decommissioned even if a node's underlying operating system or hardware are no longer reachable.

  {{site.data.alerts.callout_success}}
  A decommissioning node is drained automatically near the end of the decommissioning process.
  {{site.data.alerts.end}}

  Decommissioning a node is a heavyweight process that generates a large amount of cluster traffic. A decommissioned node can be [recommissioned](node-shutdown.html#recommission-a-node), but this is also a heavyweight process.

{{site.data.alerts.callout_info}}
CockroachDB's node shutdown behavior does not match any of the [PostgreSQL server shutdown modes](https://www.postgresql.org/docs/current/server-shutdown.html).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
This guidance applies to primarily to manual deployments. For more details about graceful termination when CockroachDB is deployed using Kubernetes, refer to [Decommissioning and draining on Kubernetes](#decommissioning-and-draining-on-kubernetes). For more details about graceful termination in a {{ site.data.products.dedicated }} cluster, refer to [Decommissioning and draining on {{ site.data.products.dedicated }}](#decommissioning-and-draining-on-cockroachdb-dedicated).
{{site.data.alerts.end}}

The following sections provide more information about exactly what happens when you stop or restart the `cockroach` process, manually drain a node, or decommission a node, as well as the expected performance impacts of each operation on your cluster. For details about how to perform these operations, refer to the following topics:

- TBD
- TBD
- TBD

### Stopping or restarting the `cockroach` process

To stop or restart the `cockroach` process, you send it a signal. The signals discussed in this section are included in the Linux and macOS kernels, but are not part of the Windows kernel.

{{site.data.alerts.callout_info}}
Linux is the only supported platform for running CockroachDB clusters in production.
{{site.data.alerts.end}}

To stop the `cockroach` process, you send a `SIGTERM` signal to it, typically using a process manager such as `systemd`. When the `cockroach` process receives the signal, it is automatically [drained](#draining-a-node), unless it had not yet joined the cluster when it was terminated or restarted, in which case it exits immediately without draining.

When a terminating node is draining, it transfers its leases to other nodes, stops accepting new SQL client connections, and attempts to complete existing SQL client queries. If an existing query takes too long, the client will be disconnected. Client applications must always be implemented with logic to retry an operation in the event of a disconnection.

After draining is complete, the `cockroach` process exits. You can then perform system maintenance, such as updating system software or restarting the node's operating system.

{{site.data.alerts.callout_success}}
To rotate certificates or logs without restarting the `cockroach` process, you send a `SIGHUP` signal to it. This does not stop the `cockroach` process or drain the node.
{{site.data.alerts.end}}

If you forcibly stop the `cockroach` process by sending a `SIGKILL` signal to it, the node is not automatically drained. Instead, from the point of view of the cluster, the node is unexpectedly unavailable. Cockroach Labs recommends that you use `SIGKILL` only as a last resort, and that you manually [drain](#draining-a-node) the node before sending the `SIGKILL` signal.

On Windows, there is no way to gracefully terminate the `cockroach` process. Instead, first manually [drain](#draining-a-node) the node to prevent new SQL client connections and so that queries that are in progress can finish. When draining is complete, you can stop the process using the Windows task manager or the `taskkill.exe` command. When maintenance is complete, restart the `cockroach` process on the node. This is equivalent to sending a `SIGKILL` signal on Linux.

Unless it is then [decommissioned](#decommissioning-a-node), a stopped node is expected to rejoin the cluster within the duration specified by the [`server.time_until_store_dead`](cluster-settings.html#setting-server-time-until-store-dead) cluster setting (5 minutes by default). To rejoin the cluster, restart the `cockroach` process on the node.

If you decide not to restart the `cockroach` process on a stopped node, or if the node can no longer be accessed or restored, you must [decommission the node](#decommissioning-a-node) to indicate to the cluster that the node will never rejoin the cluster.

Stopping and restarting a node is a lightweight processes that do not significantly increase load on the rest of the cluster, its storage layer, or its network. However, if you do not restart the `cockroach` process on the node within `server.time_until_store_dead`, then when it rejoins the cluster it must receive snapshots from the other nodes. This creates additional load across the cluster and can take a significant amount of time, because each node can send and receive at most one snapshot at a time for each replica.

If node maintenance typically takes longer than 5 minutes, consider increasing the value of `sserver.time_until_store_dead`. If you are planning unusually long maintenance, consider temporarily increasing its value and then reverting the change after maintenance is complete.

### Draining a node

A node is automatically drained when it is [stopped or restarted](#stopping-or-restarting-the-cockroach-process), during a [rolling upgrade](upgrade-cockroach-version.html#step-4-perform-the-rolling-upgrade), and during [decommissioning](#decommissioning-a-node).

You can manually drain a node to divert SQL client traffic away from the node so that you can perform maintenance on the node or during investigation of an operational issue such as a performance or security problem. If you must forcibly stop the `cockroach` process on a node, Cockroach Labs recommends manually draining it first to avoid disrupting queries that the node is processing.

To manually drain a node, you use the [`cockroach node drain`](cockroach-node) command.

A drained node:

- Does not accept SQL client connections or hold leases.
- Retains its data and continues to receive snapshots from other nodes.
- Continues to participate in the cluster for the purposes of replication and quorum.

Unless it is being decommissioned, a drained node is expected to resume normal operations within the duration specified by the [`server.time_until_store_dead`](cluster-settings.html#setting-server-time-until-store-dead) cluster setting (5 minutes by default). To resume normal operations, restart the `cockroach` process on the node.

If you decide not to restart the `cockroach` process on a drained node, or if the node can no longer be accessed or restored, you must [decommission the node](#decommissioning-a-node) to indicate to the cluster that the node will never rejoin the cluster.

Draining a node is a lightweight processes that does not significantly increase load on the rest of the cluster, its storage layer, or its network. However, if you stop the `cockroach` process and do not restart it within `server.time_until_store_dead`, then when it rejoins the cluster it must receive snapshots from the other nodes. This creates additional load across the cluster and can take a significant amount of time, because each node can send and receive at most one snapshot at a time for each replica.

#### Drain phases

During draining, the following stages occur in sequence:

1. An admin [initiates the draining process](node-shutdown.html#drain-the-node-and-terminate-the-node-process) on the node.
1. The node stops accepting new connections from SQL clients and finishes processing active queries.
1. The node transfers its range leases and Raft leaderships to other nodes, but does not move replicas or data to other nodes.
1. The node completes the following consecutive phases:

      1. **Unready phase:** The node's [`/health?ready=1` endpoint](monitoring-and-alerting.html#health-ready-1) returns an HTTP `503 Service Unavailable` response code, which causes load balancers and connection managers to reroute traffic to other nodes. This phase completes when the [fixed duration set by `server.shutdown.drain_wait`](#server-shutdown-drain_wait) is reached.

      1. **SQL wait phase:** New SQL client connections are no longer permitted, and any remaining SQL client connections are allowed to close or time out. This phase completes either when all SQL client connections are closed or the [maximum duration set by `server.shutdown.connection_wait`](#server-shutdown-connection_wait) is reached.

      1. **SQL drain phase:** All active transactions and statements for which the node is a [gateway](architecture/life-of-a-distributed-transaction.html#gateway) are allowed to complete, and CockroachDB closes the SQL client connections immediately afterward. After this phase completes, CockroachDB closes all remaining SQL client connections to the node. This phase completes either when all transactions have been processed or the [maximum duration set by `server.shutdown.query_wait`](#server-shutdown-query_wait) is reached.

      1. **DistSQL drain phase**: All [distributed statements](architecture/sql-layer.html#distsql) initiated on other gateway nodes are allowed to complete, and DistSQL requests from other nodes are no longer accepted. This phase completes either when all transactions have been processed or the [maximum duration set by `server.shutdown.query_wait`](#server-shutdown-query_wait) is reached.

      1. **Lease transfer phase:** The node's [`is_draining`](cockroach-node.html#node-status) field is set to `true`, which removes the node as a candidate for replica rebalancing, lease transfers, and query planning. Any [range leases](architecture/replication-layer.html#leases) or [Raft leaderships](architecture/replication-layer.html#raft) must be transferred to other nodes. This phase completes when all range leases and Raft leaderships have been transferred.


    If draining does not complete after 10 minutes by default, draining pauses and must be restarted to continue. Refer to [Drain timeout](#drain-timeout).


#### Cluster settings for node draining

These settings influence how long each phase of draining takes.

{{site.data.alerts.callout_info}}
The sum of [`server.shutdown.drain_wait`](#server-shutdown-drain_wait), [`server.shutdown.connection_wait`](#server-shutdown-connection_wait), [`server.shutdown.query_wait`](#server-shutdown-query_wait) times two, and [`server.shutdown.lease_transfer_wait`](#server-shutdown-lease_transfer_wait) should not be greater than the configured [drain timeout](#drain-timeout).
{{site.data.alerts.end}}

#### `server.shutdown.drain_wait`

`server.shutdown.drain_wait` sets a **fixed** duration for the ["unready phase"](#draining) of node drain. Because a load balancer reroutes connections to non-draining nodes within this duration (`0s` by default), this setting should be coordinated with the load balancer settings.

Increase `server.shutdown.drain_wait` so that your load balancer is able to make adjustments before this phase times out. Because the drain process waits unconditionally for the `server.shutdown.drain_wait` duration, do not set this value too high.

For example, [HAProxy](cockroach-gen.html#generate-an-haproxy-config-file) uses the default settings `inter 2000 fall 3` when checking server health. This means that HAProxy considers a node to be down (and temporarily removes the server from the pool) after 3 unsuccessful health checks being run at intervals of 2000 milliseconds. To ensure HAProxy can run 3 consecutive checks before timeout, set `server.shutdown.drain_wait` to `8s` or greater:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.shutdown.drain_wait = '8s';
~~~

#### `server.shutdown.connection_wait`

`server.shutdown.connection_wait` sets the **maximum** duration for the ["connection phase"](#draining) of node drain. SQL client connections are allowed to close or time out within this duration (`0s` by default). This setting presents an option to gracefully close the connections before CockroachDB forcibly closes those that remain after the ["SQL drain phase"](#draining).

Change this setting **only** if you cannot tolerate connection errors during node drain and will not implement a [connection retry loop](#connection-retry-loop) for your application. We suggest setting `server.shutdown.connection_wait` in accordance with the maximum lifetime of a SQL client connection, which is usually configurable via a [connection pool](connection-pooling.html#about-connection-pools). Depending on your requirements:

- Lower the maximum lifetime of a SQL client connection in the pool. This will cause more frequent reconnections. Set `server.shutdown.connection_wait` above this value.
- If you cannot tolerate more frequent reconnections, do not change the SQL client connection lifetime. Instead, use a longer `server.shutdown.connection_wait`. This will cause a longer draining process.

{{site.data.alerts.callout_success}}
If you do not change `server.shutdown.connection_wait`, you should use a [connection retry loop](#connection-retry-loop) to handle connection errors during node drain.
{{site.data.alerts.end}}

#### `server.shutdown.query_wait`

`server.shutdown.query_wait` sets the **maximum** duration for the ["SQL drain phase"](#draining) and the **maximum** duration for the ["DistSQL drain phase"](#draining) of node drain. Active local and distributed queries must complete, in turn, within this duration (`10s` by default).

Ensure that `server.shutdown.query_wait` is greater than:

- The longest possible transaction in the workload that is expected to complete successfully.
- The `sql.defaults.idle_in_transaction_session_timeout` cluster setting, which controls the duration a session is permitted to idle in a transaction before the session is terminated (`0s` by default).
- The `sql.defaults.statement_timeout` cluster setting, which controls the duration a query is permitted to run before it is canceled (`0s` by default).

`server.shutdown.query_wait` defines the upper bound of the duration, meaning that node drain proceeds to the next phase as soon as the last open transaction completes.

{{site.data.alerts.callout_success}}
If there are still open transactions on the draining node when the server closes its connections, you will encounter errors. Your application should handle these errors with a [connection retry loop](#connection-retry-loop).
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

#### `server.shutdown.lease_transfer_wait`

In the ["lease transfer phase"](#draining) of node drain, the server attempts to transfer all range leases and Raft leaderships from the draining node. `server.shutdown.lease_transfer_wait` sets the maximum duration of each iteration of this attempt (`5s` by default). Because this phase does not exit until all transfers are completed, changing this value only affects the frequency at which drain progress messages are printed.

In most cases, the default value is suitable. Do **not** set `server.shutdown.lease_transfer_wait` to a value lower than `5s`. In this case, leases can fail to transfer and node drain will not be able to complete.

#### `kv.allocator.recovery_store_selector`

When a node is dead or decommissioning and all of its range replicas are being up-replicated onto other nodes, this setting controls the algorithm used to select the new node for each range replica. Regardless of the algorithm, a node must satisfy all available constraints for replica placement and survivability to be eligible.

Possible values are `good` (the default) and `best`. When set to `good`, a random node is selected from the list of all eligible nodes. When set to `best`, a node with a low range count is preferred.

#### `server.time_until_store_dead`

`server.time_until_store_dead` sets the duration after which a node is considered "dead" and its data is rebalanced to other nodes (`5m0s` by default). In the node shutdown sequence, this follows [process termination](#node-shutdown-sequence).

Before temporarily stopping nodes for planned maintenance (e.g., upgrading system software), if you expect any nodes to be offline for longer than 5 minutes, you can prevent the cluster from unnecessarily moving data off the nodes by increasing `server.time_until_store_dead` to match the estimated maintenance window:

{{site.data.alerts.callout_danger}}
During this window, the cluster has reduced ability to tolerate another node failure. Be aware that increasing this value therefore reduces fault tolerance.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.time_until_store_dead = '15m0s';
~~~

After completing the maintenance work and [restarting the nodes](cockroach-start.html), you would then change the setting back to its default:

{% include_cached copy-clipboard.html %}
~~~ sql
RESET CLUSTER SETTING server.time_until_store_dead;
~~~

### Decommissioning a node

Decommissioning a node indicates to the cluster that the node will never rejoin the cluster. A node does not need to be online to decommission it. You must decommission a node in the following circumstances:

- To scale down the number of cluster nodes.
- To move a node from one region to another.
- When a node is no longer accessible because of a hardware failure or because its hardware or virtual machine are no longer accessible or recoverable.

Near the end of the decommissioning process, the node is automatically [drained](#draining-a-node) and manually draining the node ahead of time has little impact on how long the decommissioning process will take. If you avoid manually pre-draining the node, this can reduce the load on other cluster nodes because the decommissioning node can perform some of the work of decommissioning itself.

However, if a node is being decommissioned because of poor query performance or issues with storage or network I/O, consider manually draining the node before beginning decommissioning to divert SQL client traffic away from the under-performing node.

Decommissioning a node is a heavyweight process that increases load on the cluster, because the decommissioning node must send snapshots to the other nodes, and each node can send and receive at most one snapshot at a time for each replica.

A decommissioned node must be recommissioned before it can rejoin the cluster and resume normal operations. To recommission a decommissioned node, you use the [`cockroach node recommission`](cockroach-node) command, then restart the `cockroach` process on the node. If the node has been decommissioned for longer than [`server.time_until_store_dead`](cluster-settings.html#setting-server-time-until-store-dead) cluster setting (5 minutes by default), its data may be stale, in which case it must receive snapshots from other nodes.

#### Decommission phases

When a node is decommissioned, the following stages occur in sequence:

1. An admin initiates the decommissioning process on the node.
1. The node's [`is_decommissioning`](cockroach-node.html#node-status) field is set to `true` and its `membership` status is set to `decommissioning`, which causes its replicas to be rebalanced to other nodes. If the rebalancing stalls during decommissioning, replicas that have not yet moved are printed to the [SQL shell](cockroach-sql.html) and written to the [`OPS` logging channel](logging-overview.html#logging-channels). [By default](configure-logs.html#default-logging-configuration), the `OPS` channel logs output to a `cockroach.log` file.
1. The node's [`/health?ready=1` endpoint](monitoring-and-alerting.html#health-ready-1) continues to consider the node "ready" so that the node can function as a gateway to route SQL client connections to relevant data.
1. The node is automatically [drained](#draining-a-node) of existing client connections. If draining does not complete after 10 minutes by default, node draining (and decommissioning) will stop and must be restarted to continue. Refer to [Drain timeout](#drain-timeout).

    {{site.data.alerts.callout_danger}}
    Until the node's status changes from `decommissioning` to `decommissioned`, do **not** terminate the `cockroach` process on the node, shut down the node's operating system, delete the storage volume, or remove the node's VM. A `decommissioning` node has not finished rebalancing all of its range replicas onto other nodes; transient query errors will occur in client applications, and ranges will be under-replicated and could be vulnerable to loss of [quorum](architecture/replication-layer.html#overview) if another node goes down.
    {{site.data.alerts.end}}

1. After all of the preceding steps are complete, the node membership changes from `decommissioning` to `decommissioned`.

    This node is now cut off from communicating with the rest of the cluster. A client attempting to connect to a `decommissioned` node and run a query will get an error.

1. **Only** after the node's status changes to `decommissioned`, you can safely terminate the `cockroach` process. The node will stop updating its liveness record. Although a node that stays offline for the duration set by the `server.time_until_store_dead` [cluster setting](cluster-settings.html) (5 minutes by default) is usually considered "dead" by the cluster, a decommissioned node retains its **decommissioned** status even if it is no longer reachable.

#### Cluster settings relevant to node decommissioning

These settings influence how long node decommissioning takes, primarily by influencing the maximum duration of the automatic [draining](#draining-a-node) that happens during decommissioning. Because decommissioning is generally more rare than draining, it usually makes sense to tune these settings for draining during routine cluster maintenance, rather than tuning them for decommissioning.

#### `server.shutdown.drain_wait`

`server.shutdown.drain_wait` sets a **fixed** duration for the ["unready phase"](#draining) of node drain (`0s` by default), whether initiated manually or automatically as part of decommissioning the node.

#### `server.shutdown.connection_wait`

`server.shutdown.connection_wait` sets the **maximum** duration for the ["connection phase"](#draining) of node drain. SQL client connections are allowed to close or time out within this duration (`0s` by default) before CockroachDB forcibly closes those that remain after the ["SQL drain phase"](#draining).

#### `server.shutdown.query_wait`

`server.shutdown.query_wait` sets the **maximum** duration for the ["SQL drain phase"](#draining) and the **maximum** duration for the ["DistSQL drain phase"](#draining) of node drain. Active local and distributed queries must complete, in turn, within this duration (`10s` by default).

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

#### `server.shutdown.lease_transfer_wait`

In the ["lease transfer phase"](#draining) of node drain, the server attempts to transfer all range leases and Raft leaderships from the draining node. `server.shutdown.lease_transfer_wait` sets the maximum duration of each iteration of this attempt (`5s` by default). Because this phase does not exit until all transfers are completed, changing this value only affects the frequency at which drain progress messages are printed.

#### `kv.allocator.recovery_store_selector`

When a node is dead or decommissioning and all of its range replicas are being up-replicated onto other nodes, this setting controls the algorithm used to select the new node for each range replica. Regardless of the algorithm, a node must satisfy all available constraints for replica placement and survivability to be eligible.

Possible values are `good` (the default) and `best`. When set to `good`, a random node is selected from the list of all eligible nodes. When set to `best`, a node with a low range count is preferred.

## Next steps

- [Stop the `cockroach` process on a node](node-shutdown.html)
- [Drain a node](node-drain.html)
- [Decommission a node](node-decommission.html)
- [Recommission a decommissioned node](node-recommission.html)

Lyon Martin
Gender Health SF

Nothing until May 31 @ 2pm
New patients: schedule 2 appointments. Followup: June 14, 1:15pm
Need:
- UCSF MyChart
- New patient questionnaire, fill it out and 
