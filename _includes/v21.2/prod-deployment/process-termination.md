{{site.data.alerts.callout_danger}}
We do not recommend sending `SIGKILL` to perform a "hard" shutdown, which bypasses CockroachDB's [node shutdown logic](#node-shutdown-sequence) and forcibly terminates the process. This can corrupt log files and, in certain edge cases, can result in temporary data unavailability, latency spikes, uncertainty errors, ambiguous commit errors, or query timeouts.
{{site.data.alerts.end}}

- If the node was started with a process manager, send `SIGTERM` with the process manager. 

	- When using [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/), run `systemctl stop {systemd config filename}`.

- If the node was started manually using [`cockroach start`](cockroach-start.html) and is running in the foreground, press `ctrl-c` in the terminal. This sends `SIGINT` to the process.

- If the node was started manually using [`cockroach start`](cockroach-start.html) and the `--background` flag (recommended only for non-production deployments), run `kill -TERM {pid}`, where `{pid}` is the process ID of the node. To find the process ID of a node, run `ps -ef | grep cockroach | grep -v grep`.