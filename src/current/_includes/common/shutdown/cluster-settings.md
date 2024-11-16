#### `server.shutdown.initial_wait`
<a id="server-shutdown-drain_wait"></a>

Alias: `server.shutdown.drain_wait`

`server.shutdown.initial_wait` sets a **fixed** duration for the ["unready phase"]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) of node drain. Because a load balancer reroutes connections to non-draining nodes within this duration (`0s` by default), this setting should be coordinated with the load balancer settings.

Increase `server.shutdown.initial_wait` so that your load balancer is able to make adjustments before this phase times out. Because the drain process waits unconditionally for the `server.shutdown.initial_wait` duration, do not set this value too high.

For example, [HAProxy]({% link {{ page.version.version }}/cockroach-gen.md %}#generate-an-haproxy-config-file) uses the default settings `inter 2000 fall 3` when checking server health. This means that HAProxy considers a node to be down (and temporarily removes the server from the pool) after 3 unsuccessful health checks being run at intervals of 2000 milliseconds. To ensure HAProxy can run 3 consecutive checks before timeout, set `server.shutdown.initial_wait` to `8s` or greater:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.shutdown.initial_wait = '8s';
~~~

#### `server.shutdown.connections.timeout`
<a id="server-shutdown-connection_wait"></a>

Alias: `server.shutdown.connection_wait`

`server.shutdown.connections.timeout` sets the **maximum** duration for the ["connection phase"]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) of node drain. SQL client connections are allowed to close or time out within this duration (`0s` by default). This setting presents an option to gracefully close the connections before CockroachDB forcibly closes those that remain after the ["SQL drain phase"]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases).

Change this setting **only** if you cannot tolerate connection errors during node drain and cannot configure the maximum lifetime of SQL client connections, which is usually configurable via a [connection pool]({% link {{ page.version.version }}/connection-pooling.md %}#about-connection-pools). Depending on your requirements:

- Lower the maximum lifetime of a SQL client connection in the pool. This will cause more frequent reconnections. Set `server.shutdown.connections.timeout` above this value.
- If you cannot tolerate more frequent reconnections, do not change the SQL client connection lifetime. Instead, use a longer `server.shutdown.connections.timeout`. This will cause a longer draining process.

#### `server.shutdown.transactions.timeout`
<a id="server-shutdown-query_wait"></a>

Alias: `server.shutdown.query_wait`

`server.shutdown.transactions.timeout` sets the **maximum** duration for the ["SQL drain phase"]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) and the **maximum** duration for the ["DistSQL drain phase"]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) of node drain. Active local and distributed queries must complete, in turn, within this duration (`10s` by default).

Ensure that `server.shutdown.transactions.timeout` is greater than:

- The longest possible transaction in the workload that is expected to complete successfully.
- The `sql.defaults.idle_in_transaction_session_timeout` cluster setting, which controls the duration a session is permitted to idle in a transaction before the session is terminated (`0s` by default).
- The `sql.defaults.statement_timeout` cluster setting, which controls the duration a query is permitted to run before it is canceled (`0s` by default).

`server.shutdown.transactions.timeout` defines the upper bound of the duration, meaning that node drain proceeds to the next phase as soon as the last open transaction completes.

{{site.data.alerts.callout_success}}
If there are still open transactions on the draining node when the server closes its connections, you will encounter errors. You may need to adjust your application server's [connection pool]({% link {{ page.version.version }}/connection-pooling.md %}#about-connection-pools) settings.
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

#### `server.shutdown.lease_transfer_iteration.timeout`
<a id="server-shutdown-lease_transfer_wait"></a>

Alias: `server.shutdown.lease_transfer_wait`

In the ["lease transfer phase"]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) of node drain, the server attempts to transfer all [range leases]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) and [Raft leaderships]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) from the draining node. `server.shutdown.lease_transfer_iteration.timeout` sets the maximum duration of each iteration of this attempt (`5s` by default). Because this phase does not exit until all transfers are completed, changing this value affects only the frequency at which drain progress messages are printed.

{% if page.path contains "drain" %}
In most cases, the default value is suitable. Do **not** set `server.shutdown.lease_transfer_iteration.timeout` to a value lower than `5s`. In this case, leases can fail to transfer and node drain will not be able to complete.

#### `server.time_until_store_dead`

`server.time_until_store_dead` sets the duration after which a node is considered "dead" and its data is rebalanced to other nodes (`5m0s` by default). In the node shutdown sequence, this follows [process termination]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases).

Before temporarily stopping nodes for planned maintenance (e.g., upgrading system software), if you expect any nodes to be offline for longer than 5 minutes, you can prevent the cluster from unnecessarily moving data off the nodes by increasing `server.time_until_store_dead` to match the estimated maintenance window:

{{site.data.alerts.callout_danger}}
During this window, the cluster has reduced ability to tolerate another node failure. Be aware that increasing this value therefore reduces fault tolerance.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.time_until_store_dead = '15m0s';
~~~

After completing the maintenance work and [restarting the nodes]({% link {{ page.version.version }}/cockroach-start.md %}), you would then change the setting back to its default:

{% include_cached copy-clipboard.html %}
~~~ sql
RESET CLUSTER SETTING server.time_until_store_dead;
~~~

{% elsif page.path contains "decommission" %}
Since [decommissioning]({% link {{ page.version.version }}/decommission-a-node.md %}) a node rebalances all of its range replicas onto other nodes, no replicas will remain on the node by the time draining begins. Therefore, no iterations occur during this phase. This setting can be left alone.
{% endif %}

{{site.data.alerts.callout_info}}
The sum of [`server.shutdown.initial_wait`](#server-shutdown-connections-timeout), [`server.shutdown.connections.timeout`](#server-shutdown-connections-timeout), [`server.shutdown.transactions.timeout`](#server-shutdown-transactions-timeout) times two, and [`server.shutdown.lease_transfer_iteration.timeout`](#server-shutdown-lease_transfer_iteration-timeout) should not be greater than the configured [drain timeout](#drain-timeout).
{{site.data.alerts.end}}

#### `kv.allocator.recovery_store_selector`

When a node is dead or decommissioning and all of its range replicas are being up-replicated onto other nodes, this setting controls the algorithm used to select the new node for each range replica. Regardless of the algorithm, a node must satisfy all available constraints for replica placement and survivability to be eligible.

Possible values are `good` (the default) and `best`. When set to `good`, a random node is selected from the list of all eligible nodes. When set to `best`, a node with a low range count is preferred.

### Drain timeout

When [draining manually]({% link {{ page.version.version }}/drain-a-node.md %}#drain-a-node-manually) with `cockroach node drain`, all [draining phases]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) must be completed within the duration of `--drain-wait` (`10m` by default) or the drain will stop. This can be observed with an `ERROR: drain timeout` message in the terminal output. To continue the drain, re-initiate the command.

A very long drain may indicate an anomaly, and you should manually inspect the server to determine what blocks the drain.

CockroachDB automatically increases the verbosity of logging when it detects a stall in the range lease transfer stage of `node drain`. Messages logged during such a stall include the time an attempt occurred, the total duration stalled waiting for the transfer attempt to complete, and the lease that is being transferred.

`--drain-wait` sets the timeout for [all draining phases]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) and is **not** related to the `server.shutdown.initial_wait` cluster setting, which configures the "unready phase" of draining. The value of `--drain-wait` should be greater than the sum of [`server.shutdown.initial_wait`](#server-shutdown-connections-timeout), [`server.shutdown.connections.timeout`](#server-shutdown-connections-timeout), [`server.shutdown.transactions.timeout`](#server-shutdown-transactions-timeout) times two, and [`server.shutdown.lease_transfer_iteration.timeout`](#server-shutdown-lease_transfer_iteration-timeout).

### Termination grace period

On production deployments, a process manager or orchestration system can disrupt graceful node shutdown if its termination grace period is too short.

{{site.data.alerts.callout_danger}}
Do not terminate the `cockroach` process before all of the phases of draining are complete. Otherwise, you may experience latency spikes until the [leases]({% link {{ page.version.version }}/architecture/glossary.md %}#leaseholder) that were on that node have transitioned to other nodes. It is safe to terminate the `cockroach` process only after a node has completed the drain process. This is especially important in a containerized system, to allow all TCP connections to terminate gracefully.
{{site.data.alerts.end}}

If the `cockroach` process has not terminated at the end of the grace period, a `SIGKILL` signal is sent to perform a "hard" shutdown that bypasses CockroachDB's [node shutdown logic]({% link {{ page.version.version }}/node-shutdown.md %}#draining-phases) and forcibly terminates the process.

- When using [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/) to run CockroachDB as a service, set the termination grace period with [`TimeoutStopSec`](https://www.freedesktop.org/software/systemd/man/systemd.service.html#TimeoutStopSec=) setting in the service file.

- When using [Kubernetes]({% link {{ page.version.version }}/kubernetes-overview.md %}) to orchestrate CockroachDB, refer to [Draining on Kubernetes]({% link {{ page.version.version }}/drain-a-node.md %}#draining-on-kubernetes).

To determine an appropriate termination grace period:

- [Run `cockroach node drain` with `--drain-wait`]({% link {{ page.version.version }}/drain-a-node.md %}#drain-a-node-manually) and observe the amount of time it takes node drain to successfully complete.

- In general, we recommend setting the termination grace period to the sum of all `server.shutdown.*` settings. If a node requires more time than this to drain successfully, this may indicate a technical issue such as inadequate [cluster sizing]({% link {{ page.version.version }}/recommended-production-settings.md %}#sizing).

- Increasing the termination grace period does not increase the duration of a node shutdown. However, the termination grace period should not be excessively long, as this can mask an underlying hardware or software issue that is causing node shutdown to become "stuck".
