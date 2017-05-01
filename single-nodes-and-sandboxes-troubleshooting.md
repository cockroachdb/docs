---
title: Single Nodes & Sandboxes
summary: Learn how to troubleshoot issues with a single-node cluster
toc: false
---

When you're trying out CockroachDB in a local sandbox or as a single-node deployment, there are some issues you might encounter.

<div id="toc"></div>

## `getsockopt: connection refused`

This error indicates that the `cockroach` binary is either not running or is not listening on the interfaces (i.e., hostname and port) you specified.

To resolve this issue, you must do one of the following:

- [Start your CockroachDB node](start-a-node.html).
- If you specified a `--host` flag when starting your node, you must include it with the commands.
- If you specified a `--port` flag when starting your node, you must include it with the commands or change the `COCKROACH_PORT` environment variable.

## Replication Error in a Single-Node Cluster

When running a single-node CockroachDB cluster for testing, an error about replicas failing will eventually show up in the node's log files, for example:

~~~ shell
E160407 09:53:50.337328 storage/queue.go:511  [replicate] 7 replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"
~~~

This error occurs because CockroachDB expects three nodes by default. If you do not intend to add additional nodes, you can stop this error by updating your default zone configuration to expect only one node:

~~~ shell
# Insecure cluster:
$ cockroach zone set .default --insecure --disable-replication

# Secure cluster:
$ cockroach zone set .default --certs-dir=<path to certs directory> --disable-replication
~~~

The `--disable-replication` flag automatically reduces the zone's replica count to 1, but you can do this manually as well:

~~~ shell
# Insecure cluster:
$ echo 'num_replicas: 1' | cockroach zone set .default --insecure -f -

# Secure cluster:
$ echo 'num_replicas: 1' | cockroach zone set .default --certs-dir=<path to certs directory> -f -
~~~

See [Configure Replication Zones](configure-replication-zones.html) for more details.

## Something Else?

If we don't have an solution here, you can try:

- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
