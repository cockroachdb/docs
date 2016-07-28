---
title: Troubleshooting
summary: Troubleshooting issues with CockroachDB.
toc: true
---

## Replication

### Replicas failing on a single-node cluster

When running a single-node CockroachDB cluster for testing, an error about replicas failing will eventually show up in the node's log files, for example:

~~~ shell
E160407 09:53:50.337328 storage/queue.go:511  [replicate] 7 replicas failing with "0 of 1 store with an attribute matching []; likely not enough nodes in cluster"
~~~

This error occurs because CockroachDB expects three nodes by default. If you do not intend to add additional nodes, you can stop this error by updating your default zone configuration to expect only one node as follows:

~~~ shell
$ cockroach zone set .default 'replicas: [attrs: []]'
~~~

See [Configure Replication Zones](configure-replication-zones.html) for more details.

### Replicas failing on a multi-node cluster

When running a multi-node CockroachDB cluster, if you see an error like the one above about replicas failing, some nodes might not be able to talk to each other. Here are some recommended actions:

1. Check to make sure that every node but the first was started with the `--join` flag set to the hostname and port of the first node. If the flag was not set correctly for a node, shut down the node and restart it with the `--join` flag set correctly. See [Stop a Node](stop-a-node.html) and [Start a Node](start-a-node.html) for more details. 

2. If all `--join` flags were set correctly, look in the logs of each node for messages like “connection refused". If you see such messages, check your network or firewall configuration.
