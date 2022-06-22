---
title: Troubleshoot Cluster Setup
summary: Learn how to troubleshoot issues with starting CockroachDB clusters
toc: true
---

If you're having trouble starting or scaling your cluster, this page will help you troubleshoot the issue.

## Before you begin

### Terminology

To use this guide, it's important to understand some of CockroachDB's terminology:

  - A **Cluster** acts as a single logical database, but is actually made up of many cooperating nodes.
  - **Nodes** are single instances of the `cockroach` binary running on a machine. It's possible (though atypical) to have multiple nodes running on a single machine.

### Using this guide

To diagnose issues, we recommend beginning with the simplest scenario and then increasing its complexity until you discover the problem. With that strategy in mind, you should proceed through these troubleshooting steps sequentially.

We also recommend executing these steps in the environment where you want to deploy your CockroachDB cluster. However, if you run into issues you cannot solve, try the same steps in a simpler environment. For example, if you cannot successfully start a cluster using Docker, try deploying CockroachDB in the same environment without using containers.

## Locate your issue

Proceed through the following steps until you locate the source of the issue with starting or scaling your CockroachDB cluster.

### 1. Start a single-node cluster

1. Terminate any running `cockroach` processes and remove any old data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -r testStore
    ~~~

2. Start a single insecure node and log all activity to your terminal:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure --logtostderr --store=testStore
    ~~~

    Errors at this stage potentially include:
    - CPU incompatibility
    - Other services running on port `26257` or `8080` (CockroachDB's default `-listen-addr` port and `http-addr` port respectively). You can either stop those services or start your node with different ports, specified in the [`--listen-addr` and `--http-addr`](start-a-node.html#networking) flags.

        If you change the port, you will need to include the `--port=<specified port>` flag in each subsequent `cockroach` command or change the `COCKROACH_PORT` environment variable.
    - Networking issues that prevent the node from communicating with itself on its hostname. You can control the hostname CockroachDB uses with the [`--listen-addr` flag](start-a-node.html#networking).

        If you change the host, you will need to include `--host=<specified host>` in each subsequent `cockroach` command.

3. If the node appears to have started successfully, open a new terminal window, and attempt to execute the following SQL statement:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure -e "SHOW DATABASES"
    ~~~

    You should receive a response that looks similar to this:

    ~~~
    +---------------+
    | database_name |
    +---------------+
    | defaultdb     |
    | postgres      |
    | system        |
    +---------------+
    (3 rows)
    ~~~

    Errors at this stage potentially include:
    - `connection refused`, which indicates you have not included some flag that you used to start the node. We have additional troubleshooting steps for this error [here](common-errors.html#connection-refused).
    - The node crashed. You can identify if this is the case by looking for the `cockroach` process through `ps`. If you cannot locate the `cockroach` process (i.e., it crashed), [file an issue](file-an-issue.html).

**Next step**: If you successfully completed these steps, try starting a multi-node cluster.

### 2. Start a multi-node cluster

1. Terminate any running `cockroach` processes and remove any old data on the additional machines::

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -r testStore
    ~~~

    {{site.data.alerts.callout_info}}If you're running all nodes on the same machine, skip this step. Running this command will kill your first node making it impossible to proceed.{{site.data.alerts.end}}

2. On each machine, start the CockroachDB node, joining it to the first node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure --logtostderr --store=testStore \
    --join=<host of first node>
    ~~~

    {{site.data.alerts.callout_info}}
    If you're running all nodes on the same machine, you will need to change the <code>--port</code>, <code>--http-port</code>, and <code>--store</code> flags. For an example of this, see <a href="start-a-local-cluster.html#step-2-add-nodes-to-the-cluster">Start a Local Cluster</a>.
    {{site.data.alerts.end}}

    Errors at this stage potentially include:
    - The same port and host issues from [running a single node](#1-start-a-single-node-cluster).
    - [Networking issues](#networking-troubleshooting)
    - [Nodes not joining the cluster](#node-will-not-join-cluster)

3. Visit the Admin UI on any node at `http://<node host>:8080` and click **Metrics** on the left-hand navigation bar. All nodes in the cluster should be listed and have data replicated onto them.

    Errors at this stage potentially include:
    - [Networking issues](#networking-troubleshooting)
    - [Nodes not receiving data](#replication-error-in-a-multi-node-cluster)

**Next step**: If you successfully completed these steps, try [securing your deployment](manual-deployment.html) (*troubleshooting docs for this coming soon*) or reviewing our other [support resources](support-resources.html).

## Troubleshooting information

Use the information below to resolve issues you encounter when trying to start or scale your cluster.

### Networking troubleshooting

Most networking-related issues are caused by one of two issues:

- Firewall rules, which require your network administrator to investigate

- Inaccessible hostnames on your nodes, which can be controlled with the `--listen-addr` and `--advertise-addr` flags on [`cockroach start`](start-a-node.html#networking)

However, to efficiently troubleshoot the issue, it's important to understand where and why it's occurring. We recommend checking the following network-related issues:

- By default, CockroachDB advertises itself to other nodes using its hostname. If your environment doesn't support DNS or the hostname is not resolvable, your nodes cannot connect to one another. In these cases, you can:
  - Change the hostname each node uses to advertises itself with `--advertise-addr`
  - Set `--listen-addr=<node's IP address>` if the IP is a valid interface on the machine

- Every node in the cluster should be able to `ping` each other node on the hostnames or IP addresses you use in the `--join`, `--listen-addr`, or `--advertise-addr` flags.

- Every node should be able to connect to other nodes on the port you're using for CockroachDB (**26257** by default) through `telnet` or `nc`:
  - `telnet <other node host> 26257`
  - `nc <other node host> 26257`

Again, firewalls or hostname issues can cause any of these steps to fail.

### Node will not join cluster

When joining a node to a cluster, you might receive one of the following errors:

~~~
no resolvers found; use --join to specify a connected node
~~~

~~~
node belongs to cluster {"cluster hash"} but is attempting to connect to a gossip network for cluster {"another cluster hash"}
~~~

**Solution**: Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

- Choose a different directory to store the CockroachDB data:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Store this node's data in [new directory]
    $ cockroach start --store=<new directory> --join=<cluster host> <other flags>
    ~~~

- Remove the existing directory and start a node joining the cluster again:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Remove the directory
    $ rm -r cockroach-data/
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Start a node joining the cluster
    $ cockroach start --join=<cluster host>:26257 <other flags>
    ~~~

**Explanation**: When starting a node, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit `cockroach`, and then tried to join another cluster. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot join it.

### Replication error in a multi-node cluster

If data is not being replicated to some nodes in the cluster, we recommend checking out the following:

- Ensure every node but the first was started with the `--join` flag set to the hostname and port of first node (or any other node that's successfully joined the cluster).

    If the flag was not set correctly for a node, shut down the node and restart it with the `--join` flag set correctly. See [Stop a Node](stop-a-node.html) and [Start a Node](start-a-node.html) for more details.

- Nodes might not be able to communicate on their advertised hostnames, even though they're able to connect.

    You can try to resolve this by [stopping the nodes](stop-a-node.html), and then [restarting them](start-a-node.html) with the `--advertise-addr` flag set to an interface all nodes can access.

- Check the [logs](debug-and-error-logs.html) for each node for further detail, as well as these common errors:

  - `connection refused`: [Troubleshoot your network](#networking-troubleshooting).
  - `not connected to cluster` or `node <id> belongs to cluster...`: See [Node Will Not Join Cluster](#node-will-not-join-cluster) on this page.

## Something else?

Try searching the rest of our docs for answers or using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
