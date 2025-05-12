Before [upgrading to CockroachDB v25.2]({% link v25.2/upgrade-cockroach-version.md %}), be sure to review the following backward-incompatible changes, as well as [key cluster setting changes](#v25-2-0-cluster-settings), and adjust your deployment as necessary.

- Removed the `storage.queue.store-failures` metric. [#139150](https://github.com/cockroachdb/cockroach/pull/139150)
- Removed the `kv.snapshot_receiver.excise.enable` cluster setting. Excise is now enabled unconditionally. [#142651](https://github.com/cockroachdb/cockroach/pull/142651)
- The cluster setting `changefeed.new_webhook_sink_enabled`/`changefeed.new_webhook_sink.enabled` is no longer supported. The new webhook sink has been enabled by default since v23.2, and the first version webhook sink has been removed. [#141940](https://github.com/cockroachdb/cockroach/pull/141940)
- The cluster setting `changefeed.new_pubsub_sink_enabled`/`changefeed.new_pubsub_sink.enabled` is no longer supported. The new Google Cloud Pub/Sub sink has been enabled by default since v23.2, and the first version Pub/Sub sink has been removed. [#141948](https://github.com/cockroachdb/cockroach/pull/141948)
- Removed the deprecated `--storage-engine` parameter from the CLI. [#139744](https://github.com/cockroachdb/cockroach/pull/139744)
- Removed the **Paused Follower** graph from the **Replication** dashboard in the DB Console as followers are no longer paused by default from v25.1. [#141427](https://github.com/cockroachdb/cockroach/pull/141427)
- The `server.client_cert_expiration_cache.capacity` cluster setting has been removed. The `security.certificate.expiration.client` and `security.certificate.ttl.client` metrics now report the lowest value observed for a user in the last 24 hours.
- Removed the `ST_3DLength` function.