<section class="filter-content" markdown="1" data-scope="postgres mysql">
1. Wait for replication to drain, which means that all transactions that occurred on the source database have been fully processed and replicated. There are several ways to determine that replication has fully drained:
	- When replication is caught up, you will not see new `upserted rows` logs.
	- If you set up the replication metrics endpoint with [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) in the preceding steps, metrics are available at:

		~~~ 
		http://{host}:{port}/_/varz
		~~~

		Use the following Prometheus alert expression to observe when the combined rate of upserts and deletes is `0` for each schema:

		~~~
		sum by (schema) (rate(apply_upserts_total[$__rate_interval]) + rate(apply_deletes_total[$__rate_interval]))
		~~~
	- You can also check Prometheus metrics associated with replication lag, including [`target_apply_transaction_lag_seconds`]({% link molt/replicator-metrics.md %}#target-apply-transaction-lag-seconds), [`core_source_lag_seconds`]({% link molt/replicator-metrics.md %}#core-source-lag-seconds), and [`source_commit_to_apply_lag_seconds`]({% link molt/replicator-metrics.md %}#source-commit-to-apply-lag-seconds).

2. Cancel replication by entering `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
1. Wait for replication to drain, which means that all transactions that occurred on the source database have been fully processed and replicated. There are several ways to determine that replication has fully drained:
	- When replication is caught up, you will not see new `upserted rows` logs.
	- If you set up the replication metrics endpoint with [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) in the preceding steps, metrics are available at:

		~~~ 
		http://{host}:{port}/_/varz
		~~~

		Use the following Prometheus alert expression to observe when the combined rate of upserts and deletes is `0` for each schema:

		~~~
		sum by (schema) (rate(apply_upserts_total[$__rate_interval]) + rate(apply_deletes_total[$__rate_interval]))
		~~~
	- You can also check Prometheus metrics associated with replication lag, including [`source_commit_to_apply_lag_seconds`]({% link molt/replicator-metrics.md %}#source-commit-to-apply-lag-seconds).

2. Cancel replication by entering `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`.
</section>

<section class="filter-content" markdown="1" data-scope="cockroachdb">
1. Wait for replication to drain, which means that all transactions that occurred on the source database have been fully processed and replicated. There are several ways to determine that replication has fully drained:
	- When replication is caught up, you will not see new `upserted rows` logs.
	- If you set up the replication metrics endpoint with [`--metricsAddr`]({% link molt/replicator-flags.md %}#metrics-addr) in the preceding steps, metrics are available at:

		~~~ 
		http://{host}:{port}/_/varz
		~~~

		Use the following Prometheus alert expression to observe when the combined rate of upserts and deletes is `0` for each schema:

		~~~
		sum by (schema) (rate(apply_upserts_total[$__rate_interval]) + rate(apply_deletes_total[$__rate_interval]))
		~~~
	- You can also check Prometheus metrics associated with replication lag, including [`target_apply_transaction_lag_seconds`]({% link molt/replicator-metrics.md %}#target-apply-transaction-lag-seconds), [`core_source_lag_seconds`]({% link molt/replicator-metrics.md %}#core-source-lag-seconds) [`source_commit_to_apply_lag_seconds`]({% link molt/replicator-metrics.md %}#source-commit-to-apply-lag-seconds), and [`stage_commit_lag_seconds`]({% link molt/replicator-metrics.md %}#stage-commit-lag-seconds).

2. Cancel replication by entering `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`.
</section>