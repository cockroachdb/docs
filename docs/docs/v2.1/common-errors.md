---
title: Common Errors
summary: Understand and resolve common error messages written to stderr or logs.
toc: false
---

This page helps you understand and resolve error messages written to `stderr` or your [logs](debug-and-error-logs.html).

| Topic                                  | Message                                                                                                                                                                                                                                         |
|----------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Client connection                      | [`connection refused`](#connection-refused)                                                                                                                                                                                                     |
| Client connection                      | [`node is running secure mode, SSL connection required`](#node-is-running-secure-mode-ssl-connection-required)                                                                                                                                  |
| Transaction retries                    | [`restart transaction`](#restart-transaction)                                                                                                                                                                                                   |
| Node startup                           | [`node belongs to cluster <cluster ID> but is attempting to connect to a gossip network for cluster <another cluster ID>`](#node-belongs-to-cluster-cluster-id-but-is-attempting-to-connect-to-a-gossip-network-for-cluster-another-cluster-id) |
| Node configuration                     | [`clock synchronization error: this node is more than 500ms away from at least half of the known nodes`](#clock-synchronization-error-this-node-is-more-than-500ms-away-from-at-least-half-of-the-known-nodes)                                  |
| Node configuration                     | [`open file descriptor limit of <number> is under the minimum required <number>`](#open-file-descriptor-limit-of-number-is-under-the-minimum-required-number)                                                                                   |
| Replication                            | [`replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"`](#replicas-failing-with-0-of-1-store-with-an-attribute-matching-likely-not-enough-nodes-in-cluster)                                   |
| Deadline exceeded                      | [`context deadline exceeded`](#context-deadline-exceeded)                                                                                                                                                                                       |
| Ambiguous results                      | [`result is ambiguous`](#result-is-ambiguous)                                                                                                                                                                                                   |
| Time zone data                         | [`invalid value for parameter "TimeZone"`](#invalid-value-for-parameter-timezone)                                                                                                                                                               |

## connection refused

This message indicates a client is trying to connect to a node that is either not running or is not listening on the specified interfaces (i.e., hostname or port).

To resolve this issue, do one of the following:

- If the node hasn't yet been started, [start the node](start-a-node.html).
- If you specified a [`--listen-addr` and/or a `--advertise-addr` flag](start-a-node.html#networking) when starting the node, you must include the specified IP address/hostname and port with all other [`cockroach` commands](cockroach-commands.html) or change the `COCKROACH_HOST` environment variable.

If you're not sure what the IP address/hostname and port values might have been, you can look in the node's [logs](debug-and-error-logs.html). If necessary, you can also terminate the `cockroach` process, and then restart the node:

{% include copy-clipboard.html %}
~~~ shell
$ pkill cockroach
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start [flags]
~~~

## node is running secure mode, SSL connection required

This message indicates that the cluster is using TLS encryption to protect network communication, and the client is trying to open a connection without using the required TLS certificates.

To resolve this issue, use the [`cockroach cert create-client`](create-security-certificates.html) command to generate a client certificate and key for the user trying to connect. For a secure deployment walkthrough, including generating security certificates and connecting clients, see [Manual Deployment](manual-deployment.html).

## restart transaction

Messages with the error code `40001` and the string `restart transaction` indicate that a transaction failed because it conflicted with another concurrent or recent transaction accessing the same data. The transaction needs to be retried by the client. See [client-side transaction retries](transactions.html#client-side-transaction-retries) for more details.

The sections below describe different types of transaction retry errors.  Your application's retry logic does not need to distinguish between these types of errors; they are listed here for reference.

- [read within uncertainty interval](#read-within-uncertainty-interval)

### read within uncertainty interval

(Error string includes: `ReadWithinUncertaintyIntervalError`)

Uncertainty errors can occur when two transactions which start on different gateway nodes attempt to operate on the same data at close to the same time. The uncertainty comes from the fact that we cannot tell which one started first - the clocks on the two gateway nodes may not be perfectly in sync.

For example, if the clock on node A is ahead of the clock on node B, a transaction started on node A may be able to commit a write with a timestamp that is still in the "future" from the perspective of node B. A later transaction that starts on node B should be able to see the earlier write from node A, even if B's clock has not caught up to A. The "read within uncertainty interval" occurs if we discover this situation in the middle of a transaction, when it is too late for the database to handle it automatically. When node B's transaction retries, it will unambiguously occur after the transaction from node A.

Note that as long as the [client-side retry protocol](transactions.html#client-side-intervention) is followed, a transaction that has restarted once is much less likely to hit another uncertainty error, and the [`--max-offset` option](start-a-node.html#flags) provides an upper limit on how long a transaction can continue to restart due to uncertainty.

When errors like this occur, the application has the following options:

- Prefer consistent historical reads using [AS OF SYSTEM TIME](as-of-system-time.html) to reduce contention.
- Design the schema and queries to reduce contention. For information on how to avoid contention, see [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
- Be prepared to retry on uncertainty (and other) errors. For more information, see [Transaction retries](transactions.html#transaction-retries).

{{site.data.alerts.callout_info}}
Uncertainty errors are a form of transaction conflict. For more information about transaction conflicts, see [Transaction conflicts](architecture/transaction-layer.html#transaction-conflicts).
{{site.data.alerts.end}}

<!-- ### write too old -->

<!-- ### async write failure -->

## node belongs to cluster \<cluster ID> but is attempting to connect to a gossip network for cluster \<another cluster ID>

This message usually indicates that a node tried to connect to a cluster, but the node is already a member of a different cluster. This is determined by metadata in the node's data directory. To resolve this issue, do one of the following:

- Choose a different directory to store the CockroachDB data:

    ~~~ shell
    $ cockroach start [flags] --store=[new directory] --join=[cluster host]:26257
    ~~~

- Remove the existing directory and start a node joining the cluster again:

    ~~~ shell
    $ rm -r cockroach-data/
    ~~~

    ~~~ shell
    $ cockroach start [flags] --join=[cluster host]:26257
    ~~~

This message can also occur in the following scenario:

1. The first node of a cluster is started without the `--join` flag.
2. Subsequent nodes are started with the `--join` flag pointing to the first node.
3. The first node is stopped and restarted after the node's data directory is deleted or using a new directory. This causes the first node to initialize a new cluster.
4. The other nodes, still communicating with the first node, notice that their cluster ID and the first node's cluster ID do not match.

To avoid this scenario, update your scripts to use the new, recommended approach to initializing a cluster:

1. Start each initial node of the cluster with the `--join` flag set to addresses of 3 to 5 of the initial nodes.
2. Run the `cockroach init` command against any node to perform a one-time cluster initialization.
3. When adding more nodes, start them with the same `--join` flag as used for the initial nodes.

For more guidance, see this [example](start-a-node.html#start-a-multi-node-cluster).

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

{% include copy-clipboard.html %}
~~~ shell
# Insecure cluster:
$ cockroach sql --execute="ALTER RANGE default CONFIGURE ZONE USING num_replicas=1;" --insecure
~~~

{% include copy-clipboard.html %}
~~~ shell
# Secure cluster:
$ cockroach sql --execute="ALTER RANGE default CONFIGURE ZONE USING num_replicas=1;" --certs-dir=[path to certs directory]
~~~

The zone's replica count is reduced to 1. For more information, see [`ALTER RANGE ... CONFIGURE ZONE`](configure-zone.html) and [Configure Replication Zones](configure-replication-zones.html).

### When running a multi-node cluster

When running a multi-node CockroachDB cluster, if you see an error like the one above about replicas failing, some nodes might not be able to talk to each other. For recommended actions, see [Cluster Setup Troubleshooting](cluster-setup-troubleshooting.html#replication-error-in-a-multi-node-cluster).

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

## context deadline exceeded

This message occurs when a component of CockroachDB gives up because it was relying on another component that has not behaved as expected, for example, another node dropped a network connection. To investigate further, look in the node's logs for the primary failure that is the root cause.

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

## invalid value for parameter "TimeZone"

This error indicates that the machine running the CockroachDB node is missing the [`tzdata`](https://www.iana.org/time-zones) library (sometimes called `tz` or `zoneinfo`), which is required by certain features of CockroachDB that use time zone data, for example, to support using location-based names as time zone identifiers.

To resolve this issue, install the `tzdata` library and keep it up-to-date. It's important for all nodes to have the same version, so when updating the library, do so as quickly as possible across all nodes.

For details about other libraries the CockroachDB binary for Linux depends on, see [Dependencies](recommended-production-settings.html#dependencies).

## Something else?

Try searching the rest of our docs for answers or using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
