[Per-replica circuit breakers]({% link {{ page.version.version }}/architecture/replication-layer.md %}#per-replica-circuit-breakers) have the following limitations:

- They are not tripped if _all_ replicas of a range [become unavailable]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#db-console-shows-under-replicated-unavailable-ranges), because the circuit breaker mechanism operates per-replica. This means at least one replica needs to be available to receive the request in order for the breaker to trip.
