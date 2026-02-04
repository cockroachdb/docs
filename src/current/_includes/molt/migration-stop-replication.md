1. Wait for replication to drain, which means that all transactions that occurred on the source database have been fully processed and replicated. There are two ways to determine that replication has fully drained:
	- When replication is caught up, you will not see new `upserted rows` logs.
	- If you set up the replication metrics endpoint with [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) in the preceding steps, metrics are available at:

		~~~ 
		http://{host}:{port}/_/varz
		~~~

		Use the following Prometheus alert expression to observe when the combined rate of upserts and deletes is `0` for each schema:

		~~~
		sum by (schema) (rate(apply_upserts_total[$__rate_interval]) + rate(apply_deletes_total[$__rate_interval]))
		~~~

1. Cancel replication by entering `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`.