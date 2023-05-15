---
title: Troubleshooting
summary: Troubleshooting issues with CockroachDB.
toc: true
---

## General Troubleshooting

When you run into a problem, the best place to start is having CockroachDB logging its output to standard error (instead of log files in the storage directory):

```shell
$ cockroach start <flags> --logtostderr
```

You can also have the errors logged in addition to outputting to standard error:

```shell
$ cockroach start <flags> --logtostderr 2>&1 | tee error.log
```

## Starting Clusters & Nodes

### Node Will Not Join Cluster

**Description**: You specified the `--join` flag, but receive one of the following messages:

~~~
not connected to cluster; use --join to specify a connected node
~~~
~~~
node 1 belongs to cluster {"cluster hash"} but is attempting to connect to a gossip network for cluster {"another cluster hash"}
~~~

**Solution**: Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

- 	Choose a different directory to store the CockroachDB data:

	~~~ shell
	# Store this node's data in <new directory>
	$ cockroach start <flags> --store=<new directory> --join=<cluster host>:26257
	~~~

- 	Remove the existing directory and start a node joining the cluster again.

	~~~ shell
	# Remove the directory
	$ rm -r cockroach-data/

	# Start a node joining the cluster
	$ cockroach start <flags> --join=<cluster host>:26257
	~~~

**Explanation**: When you start a node, the directory you choose to store the data in also identifies the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit `cockroach`, and then try to start a "new" node to a different cluster. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot join.

## Replication

### Replication Error in a Single-Node Cluster

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

### Replication Error in a Multi-Node Cluster

When running a multi-node CockroachDB cluster, if you see an error like the one above about replicas failing, some nodes might not be able to talk to each other. Here are some recommended actions:

1. Check to make sure that every node but the first was started with the `--join` flag set to the hostname and port of the first node. If the flag was not set correctly for a node, shut down the node and restart it with the `--join` flag set correctly. See [Stop a Node](stop-a-node.html) and [Start a Node](start-a-node.html) for more details.

2. If all `--join` flags were set correctly, look at the error logs for each node to determine what to do:
	- `connection refused`: Check your network or firewall configuration.
	- `not connected to cluster` or `node <id> belongs to cluster...`: See [Node Will Not Join Cluster](#node-will-not-join-cluster) on this page.

## Something Else?

If we do not have a solution here, you can try using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
