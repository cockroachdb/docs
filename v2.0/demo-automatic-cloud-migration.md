---
title: Cross-Cloud Migration
summary: Use a local cluster to simulate migrating from one cloud platform to another.
toc: true
---

CockroachDB's flexible [replication controls](configure-replication-zones.html) make it trivially easy to run a single CockroachDB cluster across cloud platforms and to migrate data from one cloud to another without any service interruption. This page walks you through a local simulation of the process.

## Watch a Live Demo

{% include_cached youtube.html video_id="cCJkgZy6s2Q" %}

## Step 1. Install prerequisites

In this tutorial, you'll use CockroachDB, the HAProxy load balancer, and CockroachDB's version of the YCSB load generator, which requires Go. Before you begin, make sure these applications are installed:

- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install [HAProxy](http://www.haproxy.org/). If you're on a Mac and using Homebrew, use `brew install haproxy`.
- Install [Go](https://golang.org/doc/install) version 1.9 or higher. If you're on a Mac and using Homebrew, use `brew install go`. You can check your local version by running `go version`.
- Install the [CockroachDB version of YCSB](https://github.com/cockroachdb/loadgen/tree/master/ycsb): `go get github.com/cockroachdb/loadgen/ycsb`

Also, to keep track of the data files and logs for your cluster, you may want to create a new directory (e.g., `mkdir cloud-migration`) and start all your nodes in that directory.

## Step 2. Start a 3-node cluster on "cloud 1"

If you've already [started a local cluster](start-a-local-cluster.html), the commands for starting nodes should be familiar to you. The new flag to note is [`--locality`](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes), which accepts key-value pairs that describe the topography of a node. In this case, you're using the flag to specify that the first 3 nodes are running on cloud 1.

In a new terminal, start node 1 on cloud 1:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=cloud=1 \
--store=cloud1node1 \
--host=localhost \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~~

In a new terminal, start node 2 on cloud 1:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=cloud=1 \
--store=cloud1node2 \
--host=localhost \
--port=25258 \
--http-port=8081 \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, start node 3 on cloud 1:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=cloud=1 \
--store=cloud1node3 \
--host=localhost \
--port=25259 \
--http-port=8082 \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 3. Initialize the cluster

In a new terminal, use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=localhost \
--port=26257
~~~

## Step 4. Set up HAProxy load balancing

You're now running 3 nodes in a simulated cloud. Each of these nodes is an equally suitable SQL gateway to your cluster, but to ensure an even balancing of client requests across these nodes, you can use a TCP load balancer. Let's use the open-source [HAProxy](http://www.haproxy.org/) load balancer that you installed earlier.

In a new terminal, run the [`cockroach gen haproxy`](generate-cockroachdb-resources.html) command, specifying the port of any node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--insecure \
--host=localhost \
--port=26257
~~~

This command generates an `haproxy.cfg` file automatically configured to work with the 3 nodes of your running cluster. In the file, change `bind :26257` to `bind :26000`. This changes the port on which HAProxy accepts requests to a port that is not already in use by a node and that will not be used by the nodes you'll add later.

~~~
global
  maxconn 4096

defaults
    mode                tcp
    timeout connect     10s
    timeout client      1m
    timeout server      1m

listen psql
    bind :26000
    mode tcp
    balance roundrobin
    server cockroach1 localhost:26257
    server cockroach2 localhost:26258
    server cockroach3 localhost:26259
~~~

Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

{% include copy-clipboard.html %}
~~~ shell
$ haproxy -f haproxy.cfg
~~~

## Step 5. Start a load generator

Now that you have a load balancer running in front of your cluster, let's use the YCSB load generator that you installed earlier to simulate multiple client connections, each performing mixed read/write workloads.

In a new terminal, start `ycsb`, pointing it at HAProxy's port:

{% include copy-clipboard.html %}
~~~ shell
$ $HOME/go/bin/ycsb -duration 20m -tolerate-errors -concurrency 10 -max-rate 1000 'postgresql://root@localhost:26000?sslmode=disable'
~~~

This command initiates 10 concurrent client workloads for 20 minutes, but limits the total load to 1000 operations per second (since you're running everything on a single machine).

## Step 6. Watch data balance across all 3 nodes

Now open the Admin UI at `http://localhost:8080` and click **Metrics** in the left-hand navigation bar. The **Overview** dashboard is displayed. Hover over the **SQL Queries** graph at the top. After a minute or so, you'll see that the load generator is executing approximately 95% reads and 5% writes across all nodes:

<img src="{{ 'images/v2.0/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Scroll down a bit and hover over the **Replicas per Node** graph. Because CockroachDB replicates each piece of data 3 times by default, the replica count on each of your 3 nodes should be identical:

<img src="{{ 'images/v2.0/admin_ui_replicas_migration.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 7. Add 3 nodes on "cloud 2"

At this point, you're running three nodes on cloud 1. But what if you'd like to start experimenting with resources provided by another cloud vendor? Let's try that by adding three more nodes to a new cloud platform. Again, the flag to note is [`--locality`](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes), which you're using to specify that these next 3 nodes are running on cloud 2.

In a new terminal, start node 4 on cloud 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=cloud=2 \
--store=cloud2node4 \
--host=localhost \
--port=26260 \
--http-port=8083 \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, start node 5 on cloud 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=cloud=2 \
--store=cloud2node5 \
--host=localhost \
--port=25261 \
--http-port=8084 \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, start node 6 on cloud 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=cloud=2 \
--store=cloud2node6 \
--host=localhost \
--port=25262 \
--http-port=8085 \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 8. Watch data balance across all 6 nodes

Back on the **Overview** dashboard in Admin UI, hover over the **Replicas per Node** graph again. Because you used [`--locality`](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) to specify that nodes are running on 2 clouds, you'll see an approximately even number of replicas on each node, indicating that CockroachDB has automatically rebalanced replicas across both simulated clouds:

<img src="{{ 'images/v2.0/admin_ui_replicas_migration2.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Note that it takes a few minutes for the Admin UI to show accurate per-node replica counts on hover. This is why the new nodes in the screenshot above show 0 replicas. However, the graph lines are accurate, and you can click **View node list** in the **Summary** area for accurate per-node replica counts as well.

## Step 9. Migrate all data to "cloud 2"

So your cluster is replicating across two simulated clouds. But let's say that after experimentation, you're happy with cloud vendor 2, and you decide that you'd like to move everything there. Can you do that without interruption to your live client traffic? Yes, and it's as simple as running a single command to add a [hard constraint](configure-replication-zones.html#replication-constraints) that all replicas must be on nodes with `--locality=cloud=2`.

In a new terminal, edit the default replication zone:

{% include copy-clipboard.html %}
~~~ shell
$ echo 'constraints: [+cloud=2]' | cockroach zone set .default --insecure --host=localhost -f -
~~~

## Step 10. Verify the data migration

Back on the **Overview** dashboard in the Admin UI, hover over the **Replicas per Node** graph again. Very soon, you'll see the replica count double on nodes 4, 5, and 6 and drop to 0 on nodes 1, 2, and 3:

<img src="{{ 'images/v2.0/admin_ui_replicas_migration3.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

This indicates that all data has been migrated from cloud 1 to cloud 2. In a real cloud migration scenario, at this point you would update the load balancer to point to the nodes on cloud 2 and then stop the nodes on cloud 1. But for the purpose of this local simulation, there's no need to do that.

## Step 11. Stop the cluster

Once you're done with your cluster, stop YCSB by switching into its terminal and pressing **CTRL-C**. Then do the same for HAProxy and each CockroachDB node.

{{site.data.alerts.callout_success}}For the last node, the shutdown process will take longer (about a minute) and will eventually force stop the node. This is because, with only 1 node still online, a majority of replicas are no longer available (2 of 3), and so the cluster is not operational. To speed up the process, press <strong>CTRL-C</strong> a second time.{{site.data.alerts.end}}

If you do not plan to restart the cluster, you may want to remove the nodes' data stores and the HAProxy config file:

{% include copy-clipboard.html %}
~~~ shell
$ rm -rf cloud1node1 cloud1node2 cloud1node3 cloud2node4 cloud2node5 cloud2node6 haproxy.cfg
~~~

## What's Next?

Use a local cluster to explore these other core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Follow-the-Workload](demo-follow-the-workload.html)
- [Orchestration](orchestrate-a-local-cluster-with-kubernetes-insecure.html)
- [JSON Support](demo-json-support.html)

You may also want to learn other ways to control the location and number of replicas in a cluster:

- [Even Replication Across Datacenters](configure-replication-zones.html#even-replication-across-datacenters)
- [Multiple Applications Writing to Different Databases](configure-replication-zones.html#multiple-applications-writing-to-different-databases)
- [Stricter Replication for a Specific Table](configure-replication-zones.html#stricter-replication-for-a-specific-table)
- [Tweaking the Replication of System Ranges](configure-replication-zones.html#tweaking-the-replication-of-system-ranges)
