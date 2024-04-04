{{site.data.alerts.callout_danger}}
We do not recommend sending `SIGKILL` to perform a "hard" shutdown, which bypasses CockroachDB's [node shutdown logic](#node-shutdown-sequence) and forcibly terminates the process. This can corrupt log files and, in certain edge cases, can result in temporary data unavailability, latency spikes, uncertainty errors, ambiguous commit errors, or query timeouts. When decommissioning, a hard shutdown will leave ranges under-replicated and vulnerable to another node failure, causing [loss of quorum]({% link {{ page.version.version }}/architecture/replication-layer.md %}#overview) in the window before up-replication completes.
{{site.data.alerts.end}}

- On production deployments, use the process manager, orchestration system, or other deployment tooling to send `SIGTERM` to the process. For example, with [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/), run `systemctl stop {systemd config filename}`.

- If you run CockroachDB in the foreground for local testing, you can use `ctrl-c` in the terminal to terminate the process.send `SIGINT` to the process.
