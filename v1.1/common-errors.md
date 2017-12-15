---
title: Common Errors
summary: Understand and resolve common errors.
toc: false
---

This page helps you understand and resolve error messages written to `stderr` or your [logs](debug-and-error-logs.html).

Topic | Message
------|--------
Client connection | [`connection refused`](#connection-refused)
Client connection | [`node is running secure mode, SSL connection required`](#node-is-running-secure-mode-ssl-connection-required)
Client connection | [`unknown variable: "sql_safe_updates"`](#unknown-variable-sql_safe_updates)
Transactions | [`retry transaction`](#retry-transaction)
Node startup | [`node belongs to cluster <cluster ID> but is attempting to connect to a gossip network for cluster <another cluster ID>`](#node-belongs-to-cluster-cluster-id-but-is-attempting-to-connect-to-a-gossip-network-for-cluster-another-cluster-id)
Node configuration | [`clock synchronization error: this node is more than 500ms away from at least half of the known nodes`](#clock-synchronization-error-this-node-is-more-than-500ms-away-from-at-least-half-of-the-known-nodes)
Node configuration | [`open file descriptor limit of <number> is under the minimum required <number>`](#open-file-descriptor-limit-of-number-is-under-the-minimum-required-number)
Replication | [`replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"`](#replicas-failing-with-0-of-1-store-with-an-attribute-matching-likely-not-enough-nodes-in-cluster)
Ambiguous | [`context deadline exceeded`](#context-deadline-exceeded)

## connection refused

This message indicates a client is trying to connect to a node that is either not running or is not listening on the specified interfaces (i.e., hostname or port).

To resolve this issue, do one of the following:

- If the node hasn't yet been started, [start the node](start-a-node.html).
- If you specified a `--host` flag when starting the node, you must include it with all other [`cockroach` commands](cockroach-commands.html).
- If you specified a `--port` flag when starting the node, you must include it with all other [`cockroach` commands](cockroach-commands.html) or change the `COCKROACH_PORT` environment variable.

If you're not sure what the `--host` and `--port` values might have been, you can look in the node's [logs](debug-and-error-logs.html). If necessary, you can also kill the `cockroach` process, and then restart the node:

{% include copy-clipboard.html %}
~~~ shell
$ pkill cockroach
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start [flags]
~~~

## node is running secure mode, SSL connection required

This message indicates that cluster is using TLS encryption to protect network communication, and the client is trying to open a connection without using the required TLS certificates.

To resolve this issue, use the [`cockroach cert client-create`](create-security-certificates.html) command to generate a client certificate and key for the user trying to connect. For a secure deployment walkthrough, including generating security certificates and connecting clients, see [Manual Deployment](manual-deployment.html).

## unknown variable: "sql_safe_updates"

This message indicates that the [built-in SQL client](use-the-built-in-sql-client.html) (`cockroach sql`) is using CockroachDB v1.1.x or later to connect to a node running CockroachDB v1.0.x.

To resolve this issue, do one of the following:

- [Upgrade the cluster to CockroachDB v1.1](upgrade-cockroach-version.html).
- Use a [CockroachDB v1.0 binary](../releases/v1.0.6.html) to start the built-in SQL client.

## retry transaction

Messages with the error code `40001` or the string `retry transaction` indicate that a transaction failed because another concurrent or recent transaction accessed the same values.

To handle these errors, implement [client-side transaction retries](transactions.html#client-side-transaction-retries).

## node belongs to cluster \<cluster ID> but is attempting to connect to a gossip network for cluster \<another cluster ID>

This message indicates that you are trying to join a node to a cluster, but the node has already been a member of a different cluster. This is determined by metadata in the node's data directory.

To resolve this issue, do one of the following:

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

## open file descriptor limit of \<number> is under the minimum required \<number>

CockroachDB can use a large number of open file descriptors, often more than is available by default. This message indicates that the machine on which a CockroachDB node is running is under CockroachDB's recommended limits.

For more details on CockroachDB's file descriptor limits and instructions on increasing the limit on various platforms, see [File Descriptors Limit](recommended-production-settings.html#file-descriptors-limit).

## replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster

### When running a single-node cluster

When running a single-node CockroachDB cluster, an error about replicas failing will eventually show up in the node's log files, for example:

~~~ shell
E160407 09:53:50.337328 storage/queue.go:511  [replicate] 7 replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"
~~~

This happens because CockroachDB expects three nodes by default. If you do not intend to add additional nodes, you can stop this error by updating your default zone configuration to expect only one node:

{% include copy-clipboard.html %}
~~~ shell
# Insecure cluster:
$ cockroach zone set .default --insecure --disable-replication
~~~

{% include copy-clipboard.html %}
~~~ shell
# Secure cluster:
$ cockroach zone set .default --certs-dir=[path to certs directory] --disable-replication
~~~

The `--disable-replication` flag automatically reduces the zone's replica count to 1, but you can do this manually as well:

{% include copy-clipboard.html %}
~~~ shell
# Insecure cluster:
$ echo 'num_replicas: 1' | cockroach zone set .default --insecure -f -
~~~

{% include copy-clipboard.html %}
~~~ shell
# Secure cluster:
$ echo 'num_replicas: 1' | cockroach zone set .default --certs-dir=[path to certs directory] -f -
~~~

See [Configure Replication Zones](configure-replication-zones.html) for more details.

### When running a multi-node cluster

When running a multi-node CockroachDB cluster, if you see an error like the one above about replicas failing, some nodes might not be able to talk to each other. For recommended actions, see [Cluster Setup Troubleshooting](cluster-setup-troubleshooting.html#replication-error-in-a-multi-node-cluster).

## clock synchronization error: this node is more than 500ms away from at least half of the known nodes

This message indicates that a node has spontaneously shut down because it detected that its clock is out of synch with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default). CockroachDB requires moderate levels of [clock synchronization](recommended-production-settings.html#clock-synchronization) to preserve data consistency, so the node shutting down in this way avoids the risk of consistency anomalies.

To prevent this from happening, you should run [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

## context deadline exceeded

This message occurs when a component of CockroachDB gives up because it was relying on another component that has not behaved as expected. To investigate further, look in the node's logs for the root cause where the primary failure is occurring.

## Something Else?

If we don't have a solution here, you can try using our other [support resources](support-resources.html), including:

- [Other troubleshooting pages](troubleshooting-overview.html)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
