{{site.data.alerts.callout_danger}}
We do not recommend sending `SIGKILL` to perform a "hard" shutdown, which bypasses CockroachDB's [node shutdown logic](#node-shutdown-sequence) and forcibly terminates the process. This can corrupt log files and, in certain edge cases, can result in temporary data unavailability, latency spikes, uncertainty errors, ambiguous commit errors, or query timeouts. When decommissioning, a hard shutdown will leave ranges under-replicated and vulnerable to another node failure, causing [quorum](architecture/replication-layer.html#overview) loss in the window before up-replication completes.
{{site.data.alerts.end}}

- On production deployments, use the process manager to send `SIGTERM` to the process. 

	- For example, with [`systemd`](https://www.freedesktop.org/wiki/Software/systemd/), run `systemctl stop {systemd config filename}`.

- When using CockroachDB for local testing:
  
  - When running a server on the foreground, use `ctrl-c` in the terminal to send `SIGINT` to the process.

  - When running with the [`--background` flag](cockroach-start.html#general), use `pkill`, `kill`, or look up the process ID with `ps -ef | grep cockroach | grep -v grep` and then run `kill -TERM {process ID}`.