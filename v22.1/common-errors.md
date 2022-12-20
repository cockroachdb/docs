---
title: Common Errors and Solutions
summary: Understand and resolve common error messages written to stderr or logs.
toc: false
docs_area: manage
---

This page helps you understand and resolve error messages written to `stderr` or your [logs](logging-overview.html).

| Topic                                  | Message
|----------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| Client connection                      | [`connection refused`](#connection-refused)
| Client connection                      | [`node is running secure mode, SSL connection required`](#node-is-running-secure-mode-ssl-connection-required)
| Transaction retries                    | [`restart transaction`](#restart-transaction)
| Node startup                           | [`node belongs to cluster <cluster ID> but is attempting to connect to a gossip network for cluster <another cluster ID>`](#node-belongs-to-cluster-cluster-id-but-is-attempting-to-connect-to-a-gossip-network-for-cluster-another-cluster-id)
| Node configuration                     | [`clock synchronization error: this node is more than 500ms away from at least half of the known nodes`](#clock-synchronization-error-this-node-is-more-than-500ms-away-from-at-least-half-of-the-known-nodes)
| Node configuration                     | [`open file descriptor limit of <number> is under the minimum required <number>`](#open-file-descriptor-limit-of-number-is-under-the-minimum-required-number)
| Replication                            | [`replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"`](#replicas-failing-with-0-of-1-store-with-an-attribute-matching-likely-not-enough-nodes-in-cluster)
| Split failed                           | [`split failed while applying backpressure; are rows updated in a tight loop?`](#split-failed-while-applying-backpressure-are-rows-updated-in-a-tight-loop)
| Deadline exceeded                      | [`context deadline exceeded`](#context-deadline-exceeded)
| Incremental backups | [`protected ts verification error...`](#protected-ts-verification-error)
| Ambiguous results                      | [`result is ambiguous`](#result-is-ambiguous)
| Import key collision | [`checking for key collisions: ingested key collides with an existing one`](#checking-for-key-collisions-ingested-key-collides-with-an-existing-one)                                                                                                                                                                                                        |
| SQL memory budget exceeded             | [`memory budget exceeded`](#memory-budget-exceeded)

## connection refused

This message indicates a client is trying to connect to a node that is either not running or is not listening on the specified interfaces (i.e., hostname or port).

To resolve this issue, do one of the following:

- If the node hasn't yet been started, [start the node](cockroach-start.html).
- If you specified a [`--listen-addr` and/or a `--advertise-addr` flag](cockroach-start.html#networking) when starting the node, you must include the specified IP address/hostname and port with all other [`cockroach` commands](cockroach-commands.html) or change the `COCKROACH_HOST` environment variable.

If you're not sure what the IP address/hostname and port values might have been, you can look in the node's [logs](logging-overview.html).

If necessary, you can also [shut down](node-shutdown.html) and then restart the node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start [flags]
~~~

## node is running secure mode, SSL connection required

This message indicates that the cluster is using TLS encryption to protect network communication, and the client is trying to open a connection without using the required TLS certificates.

To resolve this issue, use the [`cockroach cert create-client`](cockroach-cert.html) command to generate a client certificate and key for the user trying to connect. For a secure deployment tutorial, including generating security certificates and connecting clients, see [Manual Deployment](manual-deployment.html).

## restart transaction

Messages with the error code `40001` and the string `restart transaction` indicate that a transaction failed because it conflicted with another concurrent or recent transaction accessing the same data. The transaction needs to be retried by the client. For more information about how to implement client-side retries, see [client-side retry handling](transactions.html#client-side-intervention).

For more information about the different types of transaction retry errors such as "retry write too old", "read within uncertainty interval", etc., see the [Transaction Retry Error Reference](transaction-retry-error-reference.html).

## node belongs to cluster \<cluster ID> but is attempting to connect to a gossip network for cluster \<another cluster ID>

This message usually indicates that a node tried to connect to a cluster, but the node is already a member of a different cluster. This is determined by metadata in the node's data directory. To resolve this issue, do one of the following:

- Choose a different directory to store the CockroachDB data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start [flags] --store=[new directory] --join=[cluster host]:26257
    ~~~

- Remove the existing directory and start a node joining the cluster again:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -r cockroach-data/
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start [flags] --join=[cluster host]:26257
    ~~~

## clock synchronization error: this node is more than 500ms away from at least half of the known nodes

This error indicates that a node has spontaneously shut down because it detected that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default). CockroachDB requires moderate levels of [clock synchronization](recommended-production-settings.html#clock-synchronization) to preserve data consistency, so the node shutting down in this way avoids the risk of consistency anomalies.

To prevent this from happening, you should run clock synchronization software on each node. For guidance on synchronizing clocks, see the tutorial for your deployment environment:

Environment | Recommended Approach
------------|---------------------
[Manual](deploy-cockroachdb-on-premises.html#step-1-synchronize-clocks) | Use NTP with Google's external NTP service.
[AWS](deploy-cockroachdb-on-aws.html#step-3-synchronize-clocks) | Use the Amazon Time Sync Service.
[Azure](deploy-cockroachdb-on-microsoft-azure.html#step-3-synchronize-clocks) | Disable Hyper-V time synchronization and use NTP with Google's external NTP service.
[Digital Ocean](deploy-cockroachdb-on-digital-ocean.html#step-2-synchronize-clocks) | Use NTP with Google's external NTP service.
[GCE](deploy-cockroachdb-on-google-cloud-platform.html#step-3-synchronize-clocks) | Use NTP with Google's internal NTP service.

## open file descriptor limit of \<number> is under the minimum required \<number>

CockroachDB can use a large number of open file descriptors, often more than is available by default. This message indicates that the machine on which a CockroachDB node is running is under CockroachDB's recommended limits.

For more details on CockroachDB's file descriptor limits and instructions on increasing the limit on various platforms, see [File Descriptors Limit](recommended-production-settings.html#file-descriptors-limit).

## replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster

### When running a single-node cluster

When running a single-node CockroachDB cluster, an error about replicas failing will eventually show up in the node's log files, for example:

~~~ shell
E160407 09:53:50.337328 storage/queue.go:511  [replicate] 7 replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"
~~~

This happens because CockroachDB expects three nodes by default. If you do not intend to add additional nodes, you can stop this error by using [`ALTER RANGE ... CONFIGURE ZONE`](configure-zone.html) to update your default zone configuration to expect only one node:

{% include_cached copy-clipboard.html %}
~~~ shell
# Insecure cluster:
$ cockroach sql --execute="ALTER RANGE default CONFIGURE ZONE USING num_replicas=1;" --insecure
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
# Secure cluster:
$ cockroach sql --execute="ALTER RANGE default CONFIGURE ZONE USING num_replicas=1;" --certs-dir=[path to certs directory]
~~~

The zone's replica count is reduced to 1. For more information, see [`ALTER RANGE ... CONFIGURE ZONE`](configure-zone.html) and [Configure Replication Zones](configure-replication-zones.html).

### When running a multi-node cluster

When running a multi-node CockroachDB cluster, if you see an error like the one above about replicas failing, some nodes might not be able to talk to each other. For recommended actions, see [Cluster Setup Troubleshooting](cluster-setup-troubleshooting.html#replication-issues).

## split failed while applying backpressure; are rows updated in a tight loop?

In CockroachDB, a table row is stored on disk as a key-value pair. Whenever the row is updated, CockroachDB also stores a distinct version of the key-value pair to enable concurrent request processing while guaranteeing consistency (see [multi-version concurrency control (MVCC)](architecture/storage-layer.html#mvcc)). All versions of a key-value pair belong to a larger ["range"](architecture/overview.html#architecture-range) of the total key space, and the historical versions remain until the garbage collection period defined by the `gc.ttlseconds` variable in the applicable [zone configuration](configure-replication-zones.html#gc-ttlseconds) has passed (25 hours by default). Once a range reaches a size threshold (512 MiB by default), CockroachDB splits the range into two ranges. However, this message indicates that a range cannot be split as intended.

One possible cause is that the range consists only of MVCC version data due to a row being repeatedly updated, and the range cannot be split because doing so would spread MVCC versions for a single row across multiple ranges.

To resolve this issue, make sure you are not repeatedly updating a single row. If frequent updates of a row are necessary, consider one of the following:

- Reduce the `gc.ttlseconds` variable in the applicable [zone configuration](configure-replication-zones.html#gc-ttlseconds) to reduce the garbage collection period and prevent such a large build-up of historical values.
- If a row contains large columns that are not being updated with other columns, put the large columns in separate [column families](column-families.html).

## context deadline exceeded

This message occurs when a component of CockroachDB gives up because it was relying on another component that has not behaved as expected, for example, another node dropped a network connection. To investigate further, look in the node's logs for the primary failure that is the root cause.

## protected ts verification error

Messages that begin with `protected ts verification error…` indicate that your [incremental backup](take-full-and-incremental-backups.html#incremental-backups) failed because the data you are trying to backup was garbage collected. This happens when incremental backups are taken less frequently than the garbage collection periods for any of the objects in the base backup. For example, if your incremental backups recur daily, but the garbage collection period of one table in your backup is less than one day, all of your incremental backups will fail.

The error message will specify which part of your backup is causing the failure. For example, `range span: /Table/771` indicates that table `771` is part of the problem. You can then inspect this table by running [`SELECT * FROM crdb_internal.tables WHERE id=771`](select-clause.html). You can also run [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html) and look for any `gc.ttlseconds` values that are set lower than your incremental backup frequency.

To resolve this issue, take a new [full backup](take-full-and-incremental-backups.html) after doing either of the following:

- Increase the garbage collection period by [configuring the `gc.ttlseconds` replication zone variable](configure-replication-zones.html#gc-ttlseconds). For example, we recommend setting the GC TTL to a time interval **greater** than the sum of `incremental_backup_interval` + `expected_runtime_of_full_backup` + `buffer_for_slowdowns`. To estimate the expected full backup runtime, it is necessary to perform testing or verify the past performance through the [jobs table](ui-jobs-page.html#jobs-list).
- [Increase the frequency of incremental backups](manage-a-backup-schedule.html).

## result is ambiguous

In a distributed system, some errors can have ambiguous results. For
example, if you receive a `connection closed` error while processing a
`COMMIT` statement, you cannot tell whether the transaction
successfully committed or not. These errors are possible in any
database, but CockroachDB is somewhat more likely to produce them than
other databases because ambiguous results can be caused by failures
between the nodes of a cluster. These errors are reported with the
PostgreSQL error code `40003` (`statement_completion_unknown`) and the
message `result is ambiguous`.

Ambiguous errors can be caused by nodes crashing, network failures, or
timeouts. If you experience a lot of these errors when things are
otherwise stable, look for performance issues. Note that ambiguity is
only possible for the last statement of a transaction (`COMMIT` or
`RELEASE SAVEPOINT`) or for statements outside a transaction. If a connection drops during a transaction that has not yet tried to commit, the transaction will definitely be aborted.

In general, you should handle ambiguous errors the same way as
`connection closed` errors. If your transaction is
[idempotent](https://en.wikipedia.org/wiki/Idempotence#Computer_science_meaning),
it is safe to retry it on ambiguous errors. `UPSERT` operations are
typically idempotent, and other transactions can be written to be
idempotent by verifying the expected state before performing any
writes. Increment operations such as `UPDATE my_table SET x=x+1 WHERE
id=$1` are typical examples of operations that cannot easily be made
idempotent. If your transaction is not idempotent, then you should
decide whether to retry or not based on whether it would be better for
your application to apply the transaction twice or return an error to
the user.

## checking for key collisions: ingested key collides with an existing one

When importing into an existing table with [`IMPORT INTO`](import-into.html), this error occurs because the rows in the import file conflict with an existing primary key or another [`UNIQUE`](unique.html) constraint on the table. The import will fail as a result. `IMPORT INTO` is an insert-only statement, so you cannot use it to update existing rows. To update rows in an existing table, use the [`UPDATE`](update.html) statement.

## memory budget exceeded

This message usually indicates that `--max-sql-memory`, the memory allocated to the SQL layer, was exceeded by the operation referenced in the error. A `memory budget exceeded` error also suggests that a node is close to an OOM crash, which might be prevented by failing the query.

{% include {{ page.version.version }}/prod-deployment/resolution-untuned-query.md %}

Increasing `--max-sql-memory` can alleviate `memory budget exceeded` errors. However, allocating more `--max-sql-memory` can also increase the probability of [OOM crashes](cluster-setup-troubleshooting.html#out-of-memory-oom-crash) relative to the amount of memory currently provisioned on each node. For guidance on configuring this flag, see [Cache and SQL memory size](recommended-production-settings.html#cache-and-sql-memory-size).

For [disk-spilling operations](vectorized-execution.html#disk-spilling-operations) such as hash joins that are memory-intensive, another solution is to increase the `sql.distsql.temp_storage.workmem` [cluster setting](cluster-settings.html) to allocate more memory to the operation before it spills to disk and likely consumes more memory. This improves the performance of the query, though at a possible reduction in the concurrency of the workload.

For example, if a query contains a hash join that requires 128 MiB of memory before spilling to disk, values of `sql.distsql.temp_storage.workmem=64MiB` and `--max-sql-memory=1GiB` allow the query to run with a concurrency of 16 without errors. The 17th concurrent instance will exceed `--max-sql-memory` and produce a `memory budget exceeded` error. Increasing `sql.distsql.temp_storage.workmem` to `128MiB` reduces the workload concurrency to 8, but allows the queries to finish without spilling to disk. For more information, see [Disk-spilling operations](vectorized-execution.html#disk-spilling-operations).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/resolution-oom-crash.md %}
{{site.data.alerts.end}}

## Something else?

Try searching the rest of our docs for answers or using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
- [Transaction retry error reference](transaction-retry-error-reference.html)
