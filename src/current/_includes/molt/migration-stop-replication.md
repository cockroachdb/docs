1. Stop application traffic to your source database. **This begins downtime.**

1. Wait for replication to drain, which means that all transactions that occurred on the source database have been fully processed and replicated to CockroachDB. When replication has fully drained, you will not see new `upserted rows` logs.

1. Cancel replication to CockroachDB by entering `ctrl-c` to issue a `SIGTERM` signal. This returns an exit code `0`.