{{site.data.alerts.callout_danger}}
Cockroach Labs does not recommend sending a `SIGKILL` signal to the `cockroach` process on a node to forcibly terminate it, because it bypasses CockroachDB's [node shutdown logic](#node-shutdown-sequence) and degrades the cluster's health. From the point of view of other cluster nodes, the node will be suddenly unavailable.

- If a decommissioning node is forcibly terminated before decommission completes, ranges will be under-replicated and the cluster is at risk of [loss of quorum]({% link {{ page.version.version }}/architecture/replication-layer.md %}#overview) if an additional node experiences an outage in the window before up-replication completes.
- If a draining or decommissioning node is forcibly terminated before the operation completes, it can corrupt log files and, in certain edge cases, can result in temporary data unavailability, latency spikes, uncertainty errors, ambiguous commit errors, or query timeouts.

{{site.data.alerts.end}}

- On production deployments, use the process manager, orchestration system, or other deployment tooling to send `SIGTERM` to the process. For example, with [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/), run `systemctl stop {systemd config filename}`.

- If you run CockroachDB in the foreground for local testing, you can use `ctrl-c` in the terminal to terminate the process.send `SIGINT` to the process.
