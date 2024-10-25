On a CockroachDB [node]({% link {{ page.version.version }}/architecture/overview.md %}#node) with [multiple stores]({% link {{ page.version.version }}/cockroach-start.md %}#store), you can mitigate some effects of [disk stalls]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-stalls) by configuring the node to failover each store's [write-ahead log (WAL)]({% link {{ page.version.version }}/architecture/storage-layer.md %}#memtable-and-write-ahead-log) to another store's data directory using the `--wal-failover` flag.

Failing over the WAL may allow some operations against a store to continue to complete despite temporary unavailability of the underlying storage. For example, if the node's primary store is stalled, and the node can't read from or write to it, the node can still write to the WAL on another store. This can give the node a chance to eventually catch up once the disk stall has been resolved.

When WAL failover is enabled, CockroachDB will take the the following actions:

- At node startup, each store is assigned another store to be its failover destination.
- CockroachDB will begin monitoring the latency of all WAL writes. If latency to the WAL exceeds the value of the [cluster setting `storage.wal_failover.unhealthy_op_threshold`]({% link {{page.version.version}}/cluster-settings.md %}#setting-storage-wal-failover-unhealthy-op-threshold), the node will attempt to write WAL entries to a secondary store's volume.
- CockroachDB will update the [store status endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#store-status-endpoint) at `/_status/stores` so you can monitor the store's status.
