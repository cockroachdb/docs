---
title: Common Errors
summary: Learn how to troubleshoot issues with a single-node cluster
toc: false
---

This page helps you understand and resolve errors written to `stderr` or your [logs](debug-and-error-logs.html).

<style>
table td:first-child {
    max-width: 550px;
}
</style>

Error | Topic
------|------
[`getsockopt: connection refused`](#getsockopt-connection-refused) | Connecting to a cluster
[`replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"`](#replicas-failing-with-0-of-1-store-with-an-attribute-matching-likely-not-enough-nodes-in-cluster) | Replication
[`clock synchronization error: this node is more than 500ms away from at least half of the known nodes`](#clock-synchronization-error-this-node-is-more-than-500ms-away-from-at-least-half-of-the-known-nodes) | Clock synchronization

## getsockopt: connection refused

This error indicates that the `cockroach` binary is either not running or is not listening on the interfaces (i.e., hostname or port) you specified.

To resolve this issue, you must do one of the following:

- [Start your CockroachDB node](start-a-node.html).
- If you specified a `--host` flag when starting your node, you must include it with all other [`cockroach` commands](cockroach-commands.html).
- If you specified a `--port` flag when starting your node, you must include it with all other [`cockroach` commands](cockroach-commands.html) or change the `COCKROACH_PORT` environment variable.

If you're not sure what the `--host` and `--port` values might have been, you can kill the `cockroach` process, and then restart the node:

{% include copy-clipboard.html %}
~~~ shell
$ pkill cockroach
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start [flags]
~~~

## replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster

When running a single-node CockroachDB cluster, an error about replicas failing will eventually show up in the node's log files, for example:

~~~ shell
E160407 09:53:50.337328 storage/queue.go:511  [replicate] 7 replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"
~~~

This error occurs because CockroachDB expects three nodes by default. If you do not intend to add additional nodes, you can stop this error by updating your default zone configuration to expect only one node:

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

## clock synchronization error: this node is more than 500ms away from at least half of the known nodes

This error indicates that a node has spontaneously shut down because it detected that its clock is out of synch with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default). CockroachDB requires moderate levels of [clock synchronization](recommended-production-settings.html#clock-synchronization) to preserve data consistency, so the node shutting down in this way avoids the risk of consistency anomalies.

To prevent this from happening, you should run clock synchronization software on each node. For guidance on synchronizing clocks, see the tutorial for your deployment environment:

Environment | Approach
------------|---------
[Manual](manual-deployment.html#step-1-synchronize-clocks) | Use NTP with Google's external NTP service.
[AWS](deploy-cockroachdb-on-aws.html#step-3-synchronize-clocks) | Use the Amazon Time Sync Service.
[Azure](deploy-cockroachdb-on-microsoft-azure.html#step-3-synchronize-clocks) | Disable Hyper-V time synchronization and use NTP with Google's external NTP service.
[Digital Ocean](deploy-cockroachdb-on-digital-ocean.html#step-2-sychronize-clocks) | Use NTP with Google's external NTP service.
[GCE](deploy-cockroachdb-on-google-cloud-platform.html#step-3-synchronize-clocks) | Use NTP with Google's internal NTP service.

## Something Else?

If we don't have a solution here, you can try using our other [support resources](support-resources.html), including:

- [Other troubleshooting pages](troubleshooting-overview.html)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
