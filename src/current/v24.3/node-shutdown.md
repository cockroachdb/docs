---
title: Node shutdown overview
summary: How to drain, decommission, and gracefully shut down a node.
toc: true
docs_area: manage
---

This page describes how both temporary and permanent node shutdown works.

A node **shutdown** terminates the `cockroach` process on the node.

There are two ways to handle node shutdown:

- **Drain a node** to temporarily stop it when you plan restart it later, such as during cluster maintenance. When you drain a node:
    - Clients are disconnected, and subsequent connection requests are sent to other nodes.
    - The node's data store is preserved and will be reused as long as the node restarts in a short time. Otherwise, the node's data is moved to other nodes.

    After the node is drained, you can manually terminate the `cockroach` process to perform maintenance, then restart the process for the node to rejoin the cluster. {% include_cached new-in.html version="v24.2" %}The `--shutdown` flag of [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}#flags) automatically terminates the `cockroach` process after draining completes. A node is also automatically drained when [upgrading its major version]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}). Draining a node is lightweight because it generates little node-to-node traffic across the cluster.
- **Decommission a node** to permanently remove it from the cluster, such as when scaling down the cluster or to replace the node due to hardware failure. During decommission:
    - The node is drained automatically if you have not manually drained it.
    - The node's data is moved off the node to other nodes. This [replica rebalancing]({% link {{ page.version.version }}/architecture/glossary.md %}#replica) generates a large amount of node-to-node network traffic, so decommissioning a node is considered a heavyweight operation.

This page describes node shutdown from the point of view of the `cockroach` process on a CockroachDB node and shows how to [prepare for graceful shutdown]({% link {{ page.version.version }}/drain-a-node.md %}#prepare-to-drain-a-node) on CockroachDB {{ site.data.products.core }} clusters by coordinating load balancer, client application server, process manager, and cluster settings.

For detailed instructions, refer to:

- [Drain a node]({% link {{ page.version.version }}/drain-a-node.md %})
- [Decommission a node]({% link {{ page.version.version }}/decommission-a-node.md %})

{{site.data.alerts.callout_success}}
This guidance applies to primarily to manual deployments. For more details about graceful termination when CockroachDB is deployed using Kubernetes, refer to [Draining on Kubernetes]({% link {{ page.version.version }}/drain-a-node.md %}#draining-on-kubernetes). For more details about graceful termination in a CockroachDB {{ site.data.products.advanced }} cluster, refer to [Draining on CockroachDB {{ site.data.products.advanced }}]({% link {{ page.version.version }}/drain-a-node.md %}#draining-on-cockroachdb-advanced).
{{site.data.alerts.end}}

## Draining a node

When a node is temporarily stopped, the following stages occur in sequence:

1. An operator [initiates the draining process]({% link {{ page.version.version }}/drain-a-node.md %}#drain-a-node) on the node. Draining a node disconnects clients after active queries are completed, and transfers any [range leases]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) and [Raft leaderships]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) to other nodes, but does not move replicas or data off of the node.

    When draining is complete, the node must be shut down prior to any maintenance. After a 60-second wait at minimum, you can send a `SIGTERM` signal to the `cockroach` process to shut it down. {% include_cached new-in.html version="v24.2" %}The `--shutdown` flag of [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}#flags) automatically terminates the `cockroach` process after draining completes.

1. After you perform the required maintenance, you can restart the `cockroach` process on the node for it to rejoin the cluster.

{{site.data.alerts.callout_danger}}
Do not terminate the `cockroach` process before all of the phases of draining are complete. Otherwise, you may experience latency spikes until the [leases]({% link {{ page.version.version }}/architecture/glossary.md %}#leaseholder) that were on that node have transitioned to other nodes. It is safe to terminate the `cockroach` process only after a node has completed the drain process. This is especially important in a containerized system, to allow all TCP connections to terminate gracefully. If necessary, adjust the [`server.shutdown.initial_wait`]({% link {{ page.version.version }}/drain-a-node.md %}#server-shutdown-initial_wait) and the [termination grace period]({% link {{ page.version.version}}/drain-a-node.md %}#termination-grace-period) cluster settings and adjust your process manager or other deployment tooling to allow adequate time for the node to finish draining before it is terminated or restarted.
{{site.data.alerts.end}}

### Draining phases

Node drain consists of the following consecutive phases:

1. **Unready phase:** The node's [`/health?ready=1` endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#health-ready-1) returns an HTTP `503 Service Unavailable` response code, which causes load balancers and connection managers to reroute traffic to other nodes. This phase completes when the [fixed duration set by `server.shutdown.initial_wait`]({% link {{ page.version.version }}/drain-a-node.md %}#server-shutdown-initial_wait) is reached.

1. **SQL wait phase:** New SQL client connections are no longer permitted, and any remaining SQL client connections are allowed to close or time out. This phase completes either when all SQL client connections are closed or the [maximum duration set by `server.shutdown.connections.timeout`]({% link {{ page.version.version }}/drain-a-node.md %}#server-shutdown-connections-timeout) is reached.

1. **SQL drain phase:** All active transactions and statements for which the node is a [gateway]({% link {{ page.version.version }}/architecture/life-of-a-distributed-transaction.md %}#gateway) are allowed to complete, and CockroachDB closes the SQL client connections immediately afterward. After this phase completes, CockroachDB closes all remaining SQL client connections to the node. This phase completes either when all transactions have been processed or the [maximum duration set by `server.shutdown.transactions.timeout`]({% link {{ page.version.version }}/drain-a-node.md %}#server-shutdown-transactions-timeout) is reached.

1. **DistSQL drain phase**: All [distributed statements]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) initiated on other gateway nodes are allowed to complete, and DistSQL requests from other nodes are no longer accepted. This phase completes either when all transactions have been processed or the [maximum duration set by `server.shutdown.transactions.timeout`]({% link {{ page.version.version }}/drain-a-node.md %}#server-shutdown-transactions-timeout) is reached.

1. **Lease transfer phase:** The node's [`is_draining`]({% link {{ page.version.version }}/cockroach-node.md %}#node-status) field is set to `true`, which removes the node as a candidate for replica rebalancing, lease transfers, and query planning. Any [range leases]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) or [Raft leaderships]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) must be transferred to other nodes. This phase completes when all range leases and Raft leaderships have been transferred.

    When draining manually, if the above steps have not completed after [`server.shutdown.initial_wait`]({% link {{ page.version.version }}/drain-a-node.md %}#server-shutdown-initial_wait), node draining will stop and must be restarted manually to continue. For more information, see [Drain timeout]({% link {{ page.version.version }}/drain-a-node.md %}#drain-timeout).

After draining is complete:

- If the node was drained automatically because the `cockroach` process received a `SIGTERM` signal, the `cockroach` process is automatically terminated when draining is complete.
- If the node was drained manually because an operator issued a `cockroach node drain` command:
    - If you pass the `--shutdown` flag to [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}#flags), the `cockroach` process terminates automatically after draining completes.
    - If the node's major version is being updated, the `cockroach` process terminates automatically after draining completes.
    - Otherwise, the `cockroach` process must be terminated manually. A minimum of 60 seconds after draining is complete, send it a `SIGTERM` signal to terminate it. Refer to [Drain a node]({% link {{ page.version.version }}/drain-a-node.md %}).

        While the `cockroach` process is stopped, the node stops updating its liveness record. If the node then stays offline for the duration set by [`server.time_until_store_dead`]({% link {{ page.version.version }}/drain-a-node.md %}#server-time_until_store_dead) (5 minutes by default), the cluster considers the node "dead" and starts to rebalance its range replicas onto other nodes.

        If the node is brought back online, its remaining range replicas will determine whether or not they are still valid members of replica groups. If a range replica is still valid and any data in its range has changed, it will receive updates from another replica in the group. If a range replica is no longer valid, it will be removed from the node.

## Node decommissioning

When a node is permanently removed, the following stages occur in sequence:

1. An operator [initiates the decommissioning process]({% link {{ page.version.version }}/decommission-a-node.md %}) on the node.

    The node's [`is_decommissioning`]({% link {{ page.version.version }}/cockroach-node.md %}#node-status) field is set to `true` and its `membership` status is set to `decommissioning`, which causes its replicas to be rebalanced to other nodes. If the rebalancing stalls during decommissioning, replicas that have yet to move are printed to the [SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) and written to the [`OPS` logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels). [By default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), the `OPS` channel logs output to a `cockroach.log` file.

    The node's [`/health?ready=1` endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#health-ready-1) continues to consider the node "ready" so that the node can function as a gateway to route SQL client connections to relevant data.

1. After all replicas on a decommissioning node are rebalanced, the node is automatically [drained](#draining-a-node) unless it was [drained manually]({% link {{ page.version.version }}/drain-a-node.md %}) before decommissioning was begun.
1. When draining is complete, the node is decommissioned.

    Decommissioning is complete when the node membership status changes from `decommissioning` to `decommissioned`.

    A decommissioned node cannot communicate with the rest of the cluster, and client connection attempts to the node will result in an error.

1. An operator terminates the `cockroach` process manually, using the process manager in the node's operating system, or using other deployment tooling, such as Kubernetes, Nomad, or Docker.

    A node that stays offline for the duration set by the `server.time_until_store_dead` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) (5 minutes by default) is usually considered "dead" by the cluster. However, a decommissioned node retains **decommissioned** status.

## See also

- [Drain a node]({% link {{ page.version.version }}/drain-a-node.md %})
- [Decommission a node]({% link {{ page.version.version }}/decommission-a-node.md %})
- [Upgrade CockroachDB]({% link {{ page.version.version }}/upgrade-cockroach-version.md %})
- [`cockroach node`]({% link {{ page.version.version }}/cockroach-node.md %})
- [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %})
- [Node status]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status)
- [Replication Layer]({% link {{ page.version.version }}/architecture/replication-layer.md %})
- [Decommissioning issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#decommissioning-issues)
