---
title: Cluster & Node Setup Troubleshooting
summary: Learn how to troubleshoot issues with starting CockroachDB clusters
toc: false
---

If you're having trouble starting or scaling your cluster, this document will help you troubleshoot the issue.

Before beginning, it's important to understand some of CockroachDB's terminology:

   - **Clusters** act as single logical databases, but are actually made up of many cooperating nodes.
   - **Nodes** are single instances of the `cockroach` binary running on a machine. It's possible (though atypical) to have multiple nodes running on a single machine.

<span></span> <!--this adds nominal padding above the TOC-->

<div id="toc"></div>

## Using This Guide

To diagnose issues we recommend beginning with the simplest scenario, and then increase its complexity until you discover the problem. With that strategy in mind, we recommend proceeding through these troubleshooting steps sequentially.

We also recommend executing these steps in the environment where you want to deploy your CockroachDB cluster. However, if you run into unresolvable issues, trying to achieve something similar in a simpler environment can help. For example, if you cannot successfully start a cluster using Docker, try deploying it in the same environment without using a container.

## 1. Run a Single-Node Cluster

1. Stop any running `cockroach` processes:

   ~~~ shell
   $ pkill cockroach
   ~~~

2. Start a single insecure node and log any errors to your terminal:
	
   ~~~ shell
   $ cockroach start --insecure --logtostderr --store=testStore
   ~~~

   Errors at this stage potentially include:

   - CPU incompatibility
   - Other services running on port `26257` (CockroachDB's default). You can either stop those services or start your node with a different port, controlled with the [`--port` flag](start-a-node.html#flags).
   - Networking issues that prevent the node from communicating with itself on its machine name. You can control the hostname CockroachDB uses with the [`--host` flag](start-a-node.html#flags).

3. If the node appears to have started successfully, open a new terminal window, and attempt to execute a SQL statement:

   ~~~ shell
   $ cockroach sql --insecure -e "SHOW DATABASES"
   ~~~   

   You should receive a response that looks similar to this:

   ~~~
   +--------------------+
   |      Database      |
   +--------------------+
   | crdb_internal      |
   | information_schema |
   | pg_catalog         |
   | system             |
   +--------------------+
   ~~~

   Errors at this stage potentially include: 

   - `getsockopt: connection refused`, which indicates you have not included some flag that you used to start the node (such as `--port`).
   - The `cockroach` node crashed; see if you can find the process using `ps`. In this case, file an issue.

**Next step**: If you successfully completed these steps, try starting a multi-node cluster.

## 2. Start a Multi-Node Cluster

1. To scale your cluster, each node must be able to communicate with your first node. This might require that you quit your first node (`cockroach quit --insecure`) and then restart it specifying a `--host` that other nodes will be able to reach.

2. If you're using a non-local environment, stop any running `cockroach` processes on the additional machines:

   ~~~ shell
   $ pkill cockroach
   ~~~

   {{site.data.alerts.callout_info}}If you're using these steps with a local deployment, this step will kill your first node.{{site.data.alerts.end}}

3. On each machine, start the CockroachDB node, joining it to the first node:

   ~~~ shell
   $ cockroach start --insecure --logtostderr \
   --store=testStore --join=[first node's host]
   ~~~

   Errors at this stage potentially include:

   - [Networking issues](#networking-troubleshooting)
   - [Nodes restarting existing clusters instead of joining first node](#node-wont-join-cluster)

4. Visit the Admin UI on any node at `http://[node host]:8080`. All nodes in the cluster should be listed and have data rebalanced onto them.

   Errors at this stage include:

   - [Networking issues](#networking-troubleshooting)
   - [Nodes not replicating data](#replication-error-in-a-multi-node-cluster)

**Next step**: If you successfully completed these steps, try [securing your deployment](manual-deployment.html) (*troubleshooting docs for this forthcoming*) or reviewing our [support resources](support-resources.html).

### Networking Troubleshooting

1. Every node in the cluster should be able to `ping` each other node on the hostnames or IP addresses you use in the `--join` or `--host` flags.

2. Every node should be able to connect to other nodes on the port you're using for CockroachDB (default is **26257**) using `telnet` or `nc`:

   - `telnet [other node host or IP] 26257`
   - `nc [other node host or IP] 26257`

Issues that prevent these from working are typically caused by firewalls in your environments or inaccessible hostnames. You can control nodes' hostnames using [`cockroach start`](start-a-node.html) with `--host` and `--advertise-host` flags.

### Node Won't Join Cluster

When joining a node to a cluster, you might receive one of the following errors: 

- ~~~
  not connected to cluster; use --join to specify a connected node
  ~~~
- ~~~
  node belongs to cluster {"cluster hash"} but is attempting to connect to a gossip network for cluster {"another cluster hash"}
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

### Replication Error in a Multi-Node Cluster

If you see data is not being replicated to some nodes in the cluster, we recommend checking out the following:

1. Check to make sure that every node but the first was started with the `--join` flag set to the hostname and port of the first node. If the flag was not set correctly for a node, shut down the node and restart it with the `--join` flag set correctly. See [Stop a Node](stop-a-node.html) and [Start a Node](start-a-node.html) for more details.

2. Nodes might not be able to communicate on their advertised hostnames, even though they're able to connect. You can try to resolve this by [stopping the nodes](stop-a-node.html), and then [restarting them](start-a-node.html) with the `--advertise-host` flag set to an interface all nodes can access. 

3. Check the [error logs](error-logs.html) for each node for further detail:
	- `connection refused`: [Troubleshoot your network](#networking-troubleshooting).
	- `not connected to cluster` or `node <id> belongs to cluster...`: See [Node Won't Join Cluster](#node-wont-join-cluster) on this page.

## Something Else?

If we don't have an solution here, you can try:

- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
