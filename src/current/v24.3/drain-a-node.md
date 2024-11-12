---
title: Drain a node
summary: Learn how to drain a node to perform maintenance.
toc: true
docs_area: manage
---

This page shows how to temporarily drain a node for maintenance. To permanently remove a node from your cluster instead, refer to [Decommission a node]({% link {{ page.version.version }}/decommission-a-node.md %}). For details about how draining and decommissioning work, refer to [Node shutdown]({% link {{ page.version.version }}/node-shutdown.md %}).

## Prepare to drain a node

Review the following sections before draining a node and make adjustments as required.

### Load balancing

{% include common/shutdown/load-balancing.md %}

### Cluster settings

{% include common/shutdown/cluster-settings.md %}

## Drain a node

Follow these steps to temporarily stop a node. This both drains the node and terminates the `cockroach` process. **Drain only one node at a time**.

{{site.data.alerts.callout_success}}
This guidance applies to manual deployments. In a Kubernetes deployment or a CockroachDB {{ site.data.products.advanced }} cluster, terminating the `cockroach` process is handled through Kubernetes. Refer to [Draining on Kubernetes](#draining-on-kubernetes) and [Draining on CockroachDB {{ site.data.products.advanced }}](#draining-on-cockroachdb-advanced).
{{site.data.alerts.end}}

1. When you terminate the `cockroach` process by sending a `SIGTERM` signal, it is drained automatically. If you forcibly stop the `cockroach` process, the node is not drained, client connections are dropped, and transactions must be rolled back and retried on another node.

   To drain a node manually, you can use the command [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}). If you pass the `--shutdown` flag, the `cockroach` process terminates automatically after draining completes. Otherwise, when draining is complete, terminate the `cockroach` process. Refer to [Example: Drain a mode manually](#drain-a-node-manually) for details.

1. Perform maintenance on the node as required.
1. Restart the `cockroach` process on the node and verify that it has rejoined the cluster.

If necessary, repeat these steps to perform maintenance on additional nodes, one at a time.

## Monitor shutdown progress

After you initiate a node shutdown or restart, the node's progress is regularly logged to the [default logging destination]({% link {{ page.version.version }}/logging-overview.md %}#logging-destinations) until the operation is complete. The following sections provide additional ways to monitor the operation's progress.

### `OPS`

During node shutdown, progress messages are generated in the [`OPS` logging channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels). The frequency of these messages is configured with [`server.shutdown.lease_transfer_iteration.timeout`](#server-shutdown-lease_transfer_iteration-timeout). [By default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), the `OPS` logs output to a `cockroach.log` file.

Node drain progress is reported in unstructured log messages:

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

### `cockroach node status`

Draining status is reflected in the [`cockroach node status --decommission`]({% link {{ page.version.version }}/cockroach-node.md %}) output:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach node status --decommission --certs-dir=certs --host={address of any live node}
~~~

~~~
  id |     address     |   sql_address   |      build      |         started_at         |         updated_at         | locality | is_available | is_live | gossiped_replicas | is_decommissioning |   membership   | is_draining
-----+-----------------+-----------------+-----------------+----------------------------+----------------------------+----------+--------------+---------+-------------------+--------------------+----------------+--------------
   1 | localhost:26257 | localhost:26257 | v22.2.0-alpha.1 | 2022-09-01 02:11:55.07734  | 2022-09-01 02:17:28.202777 |          | true         | true    |                73 | false              | active         | true
   2 | localhost:26258 | localhost:26258 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.203535 | 2022-09-01 02:17:29.465841 |          | true         | true    |                73 | false              | active         | false
   3 | localhost:26259 | localhost:26259 | v22.2.0-alpha.1 | 2022-09-01 02:11:56.406667 | 2022-09-01 02:17:29.588486 |          | true         | true    |                73 | false              | active         | false
(3 rows)
~~~

`is_draining == true` indicates that the node is either undergoing or has completed the draining process.

### `stderr`

When CockroachDB receives a signal to drain and terminate the node process, this message is printed to `stderr`:

~~~
initiating graceful shutdown of server
~~~

After the `cockroach` process has stopped, this message is printed to `stderr`:

~~~
server drained and shutdown completed
~~~

## Examples

These examples assume that you have already [prepared to drain the node](#prepare-to-drain-a-node).

### Stop and restart a node

To drain and shut down a node that was started in the foreground with [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}):

1. Press `ctrl-c` in the terminal where the node is running.

    ~~~
    initiating graceful shutdown of server
    server drained and shutdown completed
    ~~~

1. Filter the logs for draining progress messages. [By default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), the `OPS` logs output to a `cockroach.log` file:

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

1. Start the node to have it rejoin the cluster.

    Re-run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command that you used to start the node initially. For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    ~~~

    ~~~
    CockroachDB node starting at 2022-09-01 06:25:24.922474 +0000 UTC (took 5.1s)
    build:               CCL v22.2.0-alpha.1 @ 2022/08/30 23:02:58 (go1.19.1)
    webui:               https://localhost:8080
    sql:                 postgresql://root@localhost:26257/defaultdb?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt
    sql (JDBC):          jdbc:postgresql://localhost:26257/defaultdb?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt&user=root
    RPC client flags:    cockroach <client cmd> --host=localhost:26257 --certs-dir=certs
    logs:                /Users/maxroach/node1/logs
    temp dir:            /Users/maxroach/node1/cockroach-temp2906330099
    external I/O path:   /Users/maxroach/node1/extern
    store[0]:            path=/Users/maxroach/node1
    storage engine:      pebble
    clusterID:           b2b33385-bc77-4670-a7c8-79d79967bdd0
    status:              restarted pre-existing node
    nodeID:              1
    ~~~

### Drain a node manually

You can use [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}) to drain a node separately from decommissioning the node or terminating the node process.

1. Run the `cockroach node drain` command, specifying the ID of the node to drain (and optionally a custom [drain timeout](#drain-timeout) to allow draining more time to complete). {% include_cached new-in.html version="v24.2" %}You can optionally pass the `--shutdown` flag to [`cockroach node drain`]({% link {{ page.version.version }}/cockroach-node.md %}#flags) to automatically terminate the `cockroach` process after draining completes.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach node drain 1 --host={address of any live node} --drain-wait=15m --certs-dir=certs
    ~~~

    You will see the draining status print to `stderr`:

    ~~~
    node is draining... remaining: 50
    node is draining... remaining: 0 (complete)
    ok
    ~~~

1. Filter the logs for shutdown progress messages. [By default]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration), the `OPS` logs output to a `cockroach.log` file:

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

## Draining on Kubernetes

{% include common/shutdown/kubernetes.md %}

## Draining on CockroachDB {{ site.data.products.advanced }}

{% include common/shutdown/cockroachdb-advanced.md %}

## See also

- [Decommission a node]({% link {{ page.version.version }}/decommission-a-node.md %})
- [Upgrade CockroachDB]({% link {{ page.version.version }}/upgrade-cockroach-version.md %})
- [`cockroach node`]({% link {{ page.version.version }}/cockroach-node.md %})
- [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %})
- [Node status]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-status)
- [Replication Layer]({% link {{ page.version.version }}/architecture/replication-layer.md %})
