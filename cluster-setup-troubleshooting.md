---
title: Cluster & Node Setup Troubleshooting
summary: Learn how to troubleshoot issues with starting CockroachDB clusters
toc: false
---

If you're having trouble starting or scaling your cluster, this page will help you troubleshoot the issue.

<span></span> <!--this adds nominal padding above the TOC-->

<div id="toc"></div>

## Before Beginning

### Terminology

To use this guide, it's important to understand some of CockroachDB's terminology:

   - **A Cluster** acts as a single logical databases, but is actually made up of many cooperating nodes.
   - **Nodes** are single instances of the `cockroach` binary running on a machine. It's possible (though atypical) to have multiple nodes running on a single machine.

### Using This Guide

To diagnose issues, we recommend beginning with the simplest scenario and then increasing its complexity until you discover the problem. With that strategy in mind, you should proceed through these troubleshooting steps sequentially.

We also recommend executing these steps in the environment where you want to deploy your CockroachDB cluster. However, if you run into  issues you cannot solve, trying the same steps in a simpler environment can help. For example, if you cannot successfully start a cluster using Docker, try deploying CockroachDB in the same environment without using containers.

## 1. Start a Single-Node Cluster

1. Stop any running `cockroach` processes:

   ~~~ shell
   $ pkill -9 cockroach
   ~~~

2. Start a single insecure node and log any errors to your terminal:
	
   ~~~ shell
   $ cockroach start --insecure --logtostderr --store=testStore
   ~~~

   Errors at this stage potentially include:

   - CPU incompatibility
   - Other services running on port `26257` (CockroachDB's default). You can either stop those services or start your node with a different port, controlled with the [`--port` flag](start-a-node.html#flags).
   - Networking issues that prevent the node from communicating with itself on its hostname. You can control the hostname CockroachDB uses with the [`--host` flag](start-a-node.html#flags).

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
   - The `cockroach` node crashed; see if you can find the process using `ps`. In this case, [file an issue](file-an-issue.html).

**Next step**: If you successfully completed these steps, try starting a multi-node cluster.

## 2. Start a Multi-Node Cluster

1. To scale your cluster, each node must be able to communicate with your first node. This might require quitting your first node (`cockroach quit --insecure`) and then restarting it, specifying a `--host` that other nodes will be able to reach.

2. Stop any running `cockroach` processes on the additional machines:

   ~~~ shell
   $ pkill -9 cockroach
   ~~~

   {{site.data.alerts.callout_info}}If you're trying to run all nodes on the same machine, this step will kill your first node making it impossible to proceed.{{site.data.alerts.end}}

3. On each machine, start the CockroachDB node, joining it to the first node:

   ~~~ shell
   $ cockroach start --insecure --logtostderr --store=testStore \
   --join=[first node's host]
   ~~~

   Errors at this stage potentially include:

   - [Networking issues](#networking-troubleshooting)
   - [Nodes restarting existing clusters instead of joining the first node](#node-wont-join-cluster)

4. Visit the Admin UI on any node at `http://[node host]:8080`. All nodes in the cluster should be listed and have data rebalanced onto them.

   Errors at this stage include:

   - [Networking issues](#networking-troubleshooting)
   - [Nodes not replicating data](#replication-error-in-a-multi-node-cluster)

**Next step**: If you successfully completed these steps, try [securing your deployment](manual-deployment.html) (*troubleshooting docs for this coming soon*) or reviewing our [support resources](support-resources.html).

### Networking Troubleshooting

If you had trouble starting a multi-node cluster, you can check the following network-related issues to try solving the problem.

- By default, CockroachDB advertises itself to other nodes using its hostname. If you're running in an environment without DNS or the hostname is not resolvable, your nodes won't be able to connect to one another. In these cases, you can change the hostname each node uses to advertises itself with the `--advertise-host` flag when [starting a node](start-a-node.html).

- Every node in the cluster should be able to `ping` each other node on the hostnames or IP addresses you use in the `--join`, `--host`, or `--advertise-host` flags.

- Every node should be able to connect to other nodes on the port you're using for CockroachDB (**26257** by default) through `telnet` or `nc`:

   - `telnet [other node host] 26257`
   - `nc [other node host] 26257`

   Problems here are typically caused by firewalls or inaccessible hostnames. You can control nodes' hostnames using [`cockroach start`](start-a-node.html) with `--host` and `--advertise-host` flags.

### Node Won't Join Cluster

When joining a node to a cluster, you might receive one of the following errors: 

~~~
not connected to cluster; use --join to specify a connected node
~~~
~~~
node belongs to cluster {"cluster hash"} but is attempting to connect to a gossip network for cluster {"another cluster hash"}
~~~

**Solution**: Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

- 	Choose a different directory to store the CockroachDB data:

	~~~ shell
	# Store this node's data in <new directory>
	$ cockroach start [flags] --store=[new directory] --join=[cluster host]:26257
	~~~

- 	Remove the existing directory and start a node joining the cluster again:

	~~~ shell
	# Remove the directory
	$ rm -r cockroach-data/

	# Start a node joining the cluster
	$ cockroach start [flags] --join=[cluster host]:26257
	~~~

**Explanation**: When you start a node, the directory you choose to store the data in also identifies the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit `cockroach`, and then tried to join another cluster. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot join it.

### Replication Error in a Multi-Node Cluster

If data is not being replicated to some nodes in the cluster, we recommend checking out the following:

- Ensure every node but the first was started with the `--join` flag set to the hostname and port of the first node. If the flag was not set correctly for a node, shut down the node and restart it with the `--join` flag set correctly. See [Stop a Node](stop-a-node.html) and [Start a Node](start-a-node.html) for more details.

- Nodes might not be able to communicate on their advertised hostnames, even though they're able to connect. You can try to resolve this by [stopping the nodes](stop-a-node.html), and then [restarting them](start-a-node.html) with the `--advertise-host` flag set to an interface all nodes can access. 

- Check the [logs](debug-and-error-logs.html) for each node for further detail, as well as these common errors:
   
	- `connection refused`: [Troubleshoot your network](#networking-troubleshooting).
	- `not connected to cluster` or `node <id> belongs to cluster...`: See [Node Won't Join Cluster](#node-wont-join-cluster) on this page.

## Something Else?

If we don't have a solution here, you can try:

- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
