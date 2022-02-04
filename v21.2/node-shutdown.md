---
title: Node Shutdown
summary: How to drain and shut down a node that you plan to restart.
toc: true
redirect_from: cockroach-quit.html
---

This page describes how to perform a node **shutdown** to temporarily stop a node that you plan to restart.

A node shutdown is part of any operational procedure that requires a CockroachDB node process restart, such as a [rolling software upgrade](upgrade-cockroach-version.html) or planned cluster maintenance (e.g., upgrading system software).

{{site.data.alerts.callout_info}}
In other procedures, such as downsizing the cluster or reacting to hardware failures, nodes must be permanently removed from the cluster. This is done by **decommissioning** nodes. For more information, see [Decommission Nodes](remove-nodes.html).
{{site.data.alerts.end}}

## Overview

### Node shutdown sequence

Once [initiated](#initiate-node-shutdown), a node shutdown consists of two stages:

1. A node **drain**, which performs the following steps consecutively:

	1. The node's [`/health?ready=1` endpoint](monitoring-and-alerting.html#health-ready-1) returns an HTTP `503 Service Unavailable` response code, which causes load balancers and connection managers to reroute traffic to other nodes. This step completes when the [minimum duration set by `server.shutdown.drain_wait`](#server-shutdown-drain_wait) is reached.

	1. All active transactions and statements on the node are allowed to complete. This includes transactions for which the node is a [gateway](architecture/life-of-a-distributed-transaction.html#gateway) and [distributed statements](architecture/sql-layer.html#distsql) initiated on other gateway nodes. After this step completes, CockroachDB closes all client connections to the node. This step completes either when all transactions have been processed or the [maximum duration set by `server.shutdown.query_wait`](#server-shutdown-query_wait) is reached.

	1. The node's [`is_draining`](cockroach-node.html#node-status) status is set to `true`, which removes the node as a candidate for replica rebalancing, lease transfers, and query planning. Any replicas holding [range leases](architecture/replication-layer.html#leases) or [Raft leaderships](architecture/replication-layer.html#raft) are transferred to other nodes. This step completes when all transfers are completed.

	If the above steps have not completed after 10 minutes by default, node draining will stop and must be restarted to continue. For more information, see [Drain timeout](#drain-timeout).

	{{site.data.alerts.callout_info}}
	The `cockroach node drain` command is used to drain a node without shutting it down. This performs the above steps without triggering a process termination as described below. For an example, see [Drain a node without shutting it down](#drain-a-node-without-shutting-it-down).
	{{site.data.alerts.end}}

1. A node **process termination**. This ends the `cockroach` process on the node.

	If the node then stays offline for the duration set by [`server.time_until_store_dead`](#server-time_until_store_dead) (5 minutes by default), the cluster considers the node "dead" and starts to transfer its range replicas to other nodes.

	If the node is brought back online, its remaining range replicas will determine whether or not they are still valid members of replica groups. If a range replica is still valid and any data in its range has changed, it will receive updates from another replica in the group. If a range replica is no longer valid, it will be removed from the node.

{{site.data.alerts.callout_info}}
CockroachDB's node shutdown behavior does not match any of the [PostgreSQL server shutdown modes](https://www.postgresql.org/docs/current/server-shutdown.html).
{{site.data.alerts.end}}

### Ensure a graceful shutdown

Each of the [node shutdown steps](#node-shutdown-sequence) is performed in order, with each step commencing once the previous step has completed. However, because some steps can be interrupted, it's best to ensure that all steps complete gracefully.

Before you [initiate node shutdown](#initiate-node-shutdown), review the following prerequisites to graceful shutdown:

- Configure your [load balancer](#load-balancing) to monitor node health.
- Review and adjust [cluster settings](#cluster-settings) and [drain timeout](#drain-timeout) as needed for your deployment.
- Implement [connection retry logic](#connection-retry-loop) to handle closed connections.
- Configure the [termination grace period](#termination-grace-period) of your process manager or orchestration system.

#### Load balancing

Your [load balancer](recommended-production-settings.html#load-balancing) should use the [`/health?ready=1` endpoint](monitoring-and-alerting.html#health-ready-1) to actively monitor node health and direct client connections away from draining nodes.

To handle node shutdown effectively, the load balancer must be given enough time by the `server.shutdown.drain_wait` duration. For details, see [Cluster settings](#cluster-settings).

#### Cluster settings

##### `server.shutdown.drain_wait`

`server.shutdown.drain_wait` sets the **minimum** duration of the first step of node drain ([1a](#node-shutdown-sequence)). Because a load balancer reroutes connections to non-draining nodes within this duration (`0s` by default), this setting should be coordinated with the load balancer settings.

Increase `server.shutdown.drain_wait` so that your load balancer is able to make adjustments before this step times out. Because the drain process waits unconditionally for the `server.shutdown.drain_wait` duration, do not set this value too high.

For example, [HAProxy](cockroach-gen.html#generate-an-haproxy-config-file) uses the default settings `inter 2000 fall 3` when checking server health. This means that HAProxy considers a node to be down, and temporarily removes the server from the pool, after 3 unsuccessful health checks being run at intervals of 2000 milliseconds. To ensure HAProxy can run 3 conseuctive checks before timeout, you should therefore set `server.shutdown.drain_wait` to `8s` or greater:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.shutdown.drain_wait = '8s';
~~~

{{site.data.alerts.callout_success}}
We also recommend setting your [client connection](connection-pooling.html#about-connection-pools) lifetime to be shorter than `server.shutdown.drain_wait`. This will cause your client to close its connections and reconnect on non-draining nodes before CockroachDB forcibly closes all connections to the draining node at the end of the second step ([1b](#node-shutdown-sequence)).
{{site.data.alerts.end}}

#### `server.shutdown.query_wait`

`server.shutdown.query_wait` sets the **maximum** duration for the second step of node drain ([1b](#node-shutdown-sequence)). Active transactions and statements must complete within this duration (`10s` by default).

Ensure that `server.shutdown.query_wait` is greater than:

- The longest possible transaction in the workload that is expected to complete successfully.
- The `sql.defaults.idle_in_transaction_session_timeout` cluster setting, which controls the duration a session is permitted to idle in a transaction before the session is terminated (`0s` by default).
- The `sql.defaults.statement_timeout` cluster setting, which controls the duration a query is permitted to run before it is canceled (`0s` by default).

`server.shutdown.query_wait` defines the upper bound of the duration, meaning that node drain proceeds to the next step as soon as the last open transaction completes.

{{site.data.alerts.callout_success}}
If there are still open transactions on the draining node when the server closes its connections, you will encounter errors. Your application should handle these errors with a [connection retry loop](#connection-retry-loop).
{{site.data.alerts.end}}

##### `server.shutdown.lease_transfer_wait`

`server.shutdown.lease_transfer_wait` does not define a wait period, despite its name. In the final step of node drain ([1c](#node-shutdown-sequence)), the server attempts to transfer all range leases and Raft leaderships from the draining node. Each iteration of this attempt has a maximum duration set by `server.shutdown.lease_transfer_wait` (`5s` by default).

In most cases, the default value is suitable. Because this step does not exit until all transfers are completed, changing this value only affects the frequency at which progress messages are printed. However, do **not** set `server.shutdown.lease_transfer_wait` to a value lower than a few dozen milliseconds. In this case, leases can fail to transfer and node drain will not be able to complete.

{{site.data.alerts.callout_info}}
The sum of [`server.shutdown.drain_wait`](#server-shutdown-drain_wait), [`server.shutdown.query_wait`](#server-shutdown-query_wait), and [`server.shutdown.lease_transfer_wait`](#server-shutdown-lease_transfer_wait) should not be greater than the configured [drain timeout](#drain-timeout).
{{site.data.alerts.end}}

##### `server.time_until_store_dead`

`server.time_until_store_dead` sets the duration after which a node is considered "dead" and its data is rebalanced to other nodes (`5m0s` by default). In the node shutdown sequence, this follows [process termination](#node-shutdown-sequence).

Before temporarily stopping nodes for planned maintenance (e.g., upgrading system software), if you expect any nodes to be offline for longer than 5 minutes, you can prevent the cluster from unnecessarily moving data off the nodes by increasing `server.time_until_store_dead` to match the estimated maintenance window:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.time_until_store_dead = '15m0s';
~~~

After completing the maintenance work and [restarting the nodes](cockroach-start.html), you would then change the setting back to its default:

{% include_cached copy-clipboard.html %}
~~~ sql
RESET CLUSTER SETTING server.time_until_store_dead;
~~~

#### Drain timeout

By default, [node drain](#node-shutdown-sequence) must be completed within 10 minutes or it will stop and [must be restarted](#initiate-node-shutdown) to continue. This can be observed with an `ERROR: drain timeout` message in the terminal output.

When [using `cockroach node drain` to drain without shutting down](#drain-a-node-without-shutting-it-down), however, the drain timeout can be configured with the `--drain-wait` flag. 

The value of `--drain-wait` should be greater than the sum of [`server.shutdown.drain_wait`](#server-shutdown-drain_wait), [`server.shutdown.query_wait`](#server-shutdown-query_wait), and [`server.shutdown.lease_transfer_wait`](#server-shutdown-lease_transfer_wait). For details on these settings, see [Cluster settings](#cluster-settings). 

#### Connection retry loop

At the end of the second step of node drain ([1b](#node-shutdown-sequence)), the server forcibly closes all client connections to the node. If any open transactions were interrupted or not admitted by the server because of the connection closure, they will fail with one of the following errors:

- `57P01 server is shutting down`
- `08006 An I/O error occurred while sending to the backend`

These errors indicate that the current connection is no longer usable, and they are an expected occurrence during node shutdown. To be resilient to connection closures, your application should use a retry loop to reissue transactions that were open when a connection was closed. This allows procedures such as [rolling upgrades](upgrade-cockroach-version.html) to complete without interrupting your service.

{{site.data.alerts.callout_success}}
You can mitigate connection errors by setting your [client connection](connection-pooling.html#about-connection-pools) lifetime to be shorter than `server.shutdown.drain_wait`. This will cause your client to close its connections and reconnect on non-draining nodes before CockroachDB forcibly closes all connections to the draining node. However, you may still encounter these errors when connections are held open by long-running queries.
{{site.data.alerts.end}}

A connection retry loop should:

- Close the current connection.
- Open a new connection. This will be routed to a non-draining node.
- Reissue the transaction on the new connection.
- Repeat while the connection error persists and the retry count has not exceeded a configured maximum.

A write transaction that enters the [commit phase](architecture/transaction-layer.html#commits-phase-2) on a draining node will run to completion, but the node connection can be closed before your client receives a success message. Therefore, the connection retry logic considers the result of a previously open transaction to be unknown, and reissues the transaction.

When reissuing a write statement that relies on a primary key [`UNIQUE`](unique.html) constraint in your schema, for example, interpret a unique constraint violation message (`ERROR: duplicate key value violates unique constraint "primary"`) as a success.

#### Termination grace period

On production deployments, a process manager or orchestration system can disrupt graceful node shutdown if its termination grace period is too short. 

If the `cockroach` process has not terminated at the end of the grace period, a `SIGKILL` signal is sent to perform a "hard" shutdown that bypasses CockroachDB's [node shutdown logic](#node-shutdown-sequence) and forcibly terminates the process. This can corrupt log files and, in certain edge cases, can result in temporary data unavailability, latency spikes, uncertainty errors, ambiguous commit errors, or query timeouts.

- When using [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/) to run CockroachDB as a service, set the termination grace period with [`TimeoutStopSec`](https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutStopSec=) setting in the service file.

- When using [Kubernetes](kubernetes-overview.html) to orchestrate CockroachDB, set the termination grace period with `terminationGracePeriodSeconds` in the [StatefulSet manifest](deploy-cockroachdb-with-kubernetes.html?filters=manual#configure-the-cluster).

To determine an appropriate termination grace period: 

- [Run `cockroach node drain` with `--drain-wait`](#drain-a-node-without-shutting-it-down) and observe the amount of time it takes node drain to successfully complete.

- On Kubernetes deployments, it is helpful to set `terminationGracePeriodSeconds` to be 5 seconds longer than the configured [drain timeout](#drain-timeout). This allows Kubernetes to remove a pod only after node drain has completed.

- In general, we recommend setting the termination grace period **between 5 and 10 minutes**. If a node requires more than 10 minutes to drain successfully, this may indicate a technical issue such as inadequate [cluster sizing](recommended-production-settings.html#sizing).

- Increasing the termination grace period does not increase the duration of a node shutdown. However, the termination grace period should not be excessively long, in case an underlying hardware or software issue causes node shutdown to become "stuck". 

## Initiate node shutdown

To drain a node and terminate its running process:

- Prepare your deployment for a [graceful node shutdown](#ensure-a-graceful-shutdown).

- If the node was started with a process manager, gracefully stop the node by sending `SIGTERM` with the process manager. 

	- When using [systemd](https://www.freedesktop.org/wiki/Software/systemd/), run `systemctl stop {systemd config filename}`.

- If the node was started manually using [`cockroach start`](cockroach-start.html) and is running in the foreground, press `ctrl-c` in the terminal. This sends `SIGINT` to the process.

- If the node was started manually using [`cockroach start`](cockroach-start.html) and the `--background` and `--pid-file` flags (recommended only for non-production deployments), run `kill -TERM {pid}`, where `{pid}` is the process ID of the node.

- If the node is running on Kubernetes: 

	- To perform maintenance, run `kubectl drain {node name}`, where `{node name}` refers to the [Kubernetes worker node](kubernetes-overview.html#kubernetes-terminology) where the pods are running. This drains the worker node and evicts all pods from service so that maintenance can be performed on the worker node. For details, see the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/).

	- To perform upgrades, see our documentation for [Cluster Upgrades](upgrade-cockroachdb-kubernetes.html) on Kubernetes.

{{site.data.alerts.callout_danger}}
We do not recommend sending `SIGKILL` to perform a "hard" shutdown, which bypasses CockroachDB's [node shutdown logic](#node-shutdown-sequence) and forcibly terminates the process. This can corrupt log files and, in certain edge cases, can result in temporary data unavailability, latency spikes, uncertainty errors, ambiguous commit errors, or query timeouts.
{{site.data.alerts.end}}

It is also possible to drain a node separately from process termination. For an example, see [Drain a node without shutting it down](#drain-a-node-without-shutting-it-down).

### Monitor shutdown progress

When node shutdown is initiated, this message is printed to `stderr`:

~~~
initiating graceful shutdown of server
~~~

After node shutdown successfully completes, this message is printed to `stderr`:

~~~
server drained and shutdown completed
~~~

During node shutdown, these and additional progress messages are also generated in the [`OPS` logging channel](configure-logs.html#ops-channel). The frequency of these messages is configured with [`server.shutdown.lease_transfer_wait`](#server-shutdown-lease_transfer_wait). For an example, see [Shut down a node manually](#shut-down-a-node-manually).

{{site.data.alerts.callout_info}}
If the CLI is severed during a long drain, this will potentially prevent the drain from completing. Simply [re-initiate the process](#initiate-node-shutdown) to continue.
{{site.data.alerts.end}}

### Examples

These examples assume that you have already prepared for a [graceful node shutdown](#ensure-a-graceful-shutdown).

#### Shut down a node manually

To shut down a node that was started with [`cockroach start`](cockroach-start.html):

1. SSH to the machine where the node is running.

1. If the node was started in the foreground, press `ctrl-c` in the terminal.

	If the node was started using [`cockroach start`](cockroach-start.html) and the `--background` and `--pid-file` flags (recommended only for non-production deployments), run:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	kill -TERM <pid>
	~~~

1. Filter the logs for shutdown progress messages. [By default](configure-logs.html#default-logging-configuration), the `OPS` logs output to a `cockroach.log` file:
	
	{% include_cached copy-clipboard.html %}
	~~~ shell
	grep 'drain' node1/logs/cockroach.log
	~~~

	~~~
	I220202 20:51:21.654349 2867 1@server/drain.go:210 ⋮ [n1,server drain process] 299  drain remaining: 15
	I220202 20:51:21.654425 2867 1@server/drain.go:212 ⋮ [n1,server drain process] 300  drain details: descriptor leases: 7, liveness record: 1, range lease iterations: 7
	I220202 20:51:23.052931 2867 1@server/drain.go:210 ⋮ [n1,server drain process] 309  drain remaining: 1
	I220202 20:51:23.053217 2867 1@server/drain.go:212 ⋮ [n1,server drain process] 310  drain details: range lease iterations: 1
	W220202 20:51:23.772264 681 sql/stmtdiagnostics/statement_diagnostics.go:162 ⋮ [n1] 313  error polling for statement diagnostics requests: ‹stmt-diag-poll›: cannot acquire lease when draining
	E220202 20:51:23.800288 685 jobs/registry.go:715 ⋮ [n1] 314  error expiring job sessions: ‹expire-sessions›: cannot acquire lease when draining
	E220202 20:51:23.819957 685 jobs/registry.go:723 ⋮ [n1] 315  failed to serve pause and cancel requests: could not query jobs table: ‹cancel/pause-requested›: cannot acquire lease when draining
	I220202 20:51:24.672435 2867 1@server/drain.go:210 ⋮ [n1,server drain process] 320  drain remaining: 0
	I220202 20:51:24.984089 1 1@cli/start.go:868 ⋮ [n1] 332  server drained and shutdown completed
	~~~

	The `server drained and shutdown completed` message indicates that the `cockroach` process has stopped. 

#### Drain a node without shutting it down

Because replica removal can be slow, you may want to drain a node separately from terminating the `cockroach` process.

1. Run the [`cockroach node drain`](cockroach-node.html) command against the address of the node to decommission, optionally specifying a [drain timeout](#drain-timeout) with `--drain-wait`:

	{% include_cached copy-clipboard.html %}
	~~~
	cockroach node drain --host=localhost:26257 --drain-wait=15m --certs-dir=certs
	~~~

	You will see the draining status print to `stderr`:

	~~~
	node is draining... remaining: 50
	node is draining... remaining: 0 (complete)
	ok
	~~~

1. Filter the logs for shutdown progress messages. [By default](configure-logs.html#default-logging-configuration), the `OPS` logs output to a `cockroach.log` file:
	
	{% include_cached copy-clipboard.html %}
	~~~ shell
	grep 'drain' node1/logs/cockroach.log
	~~~

	~~~
	I220204 00:08:57.382090 1596 1@server/drain.go:110 ⋮ [n1] 77  drain request received with doDrain = true, shutdown = false
	E220204 00:08:59.732020 590 jobs/registry.go:749 ⋮ [n1] 78  error processing claimed jobs: could not query for claimed jobs: ‹select-running/get-claimed-jobs›: cannot acquire lease when draining
	I220204 00:09:00.711459 1596 kv/kvserver/store.go:1571 ⋮ [drain] 79  waiting for 1 replicas to transfer their lease away
	I220204 00:09:01.103881 1596 1@server/drain.go:210 ⋮ [n1] 80  drain remaining: 50
	I220204 00:09:01.103999 1596 1@server/drain.go:212 ⋮ [n1] 81  drain details: liveness record: 2, range lease iterations: 42, descriptor leases: 6
	I220204 00:09:01.104128 1596 1@server/drain.go:134 ⋮ [n1] 82  drain request completed without server shutdown
	I220204 00:09:01.307629 2150 1@server/drain.go:110 ⋮ [n1] 83  drain request received with doDrain = true, shutdown = false
	I220204 00:09:02.459197 2150 1@server/drain.go:210 ⋮ [n1] 84  drain remaining: 0
	I220204 00:09:02.459272 2150 1@server/drain.go:134 ⋮ [n1] 85  drain request completed without server shutdown
	~~~

	The `drain request completed without server shutdown` message indicates that the node was drained.

To terminate the process, follow the instructions in [Initiate node shutdown](#initiate-node-shutdown).