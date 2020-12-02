---
title: Cross-Cloud Migration
summary: Use a local cluster to simulate migrating from one cloud platform to another.
toc: true
---

CockroachDB's flexible [replication controls](configure-replication-zones.html) make it trivially easy to run a single CockroachDB cluster across cloud platforms and to migrate data from one cloud to another without any service interruption. This page walks you through a local simulation of the process.

## Watch the demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/cCJkgZy6s2Q" frameborder="0" allowfullscreen></iframe>

## Step 1. Install prerequisites

In this tutorial, you'll use CockroachDB, its built-in `ycsb` workload, and the HAProxy load balancer. Before you begin, make sure these applications are installed:

- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install [HAProxy](http://www.haproxy.org/). If you're on a Mac and using Homebrew, use `brew install haproxy`.

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
--listen-addr=localhost:26257 \
--http-addr=localhost:8080 \
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
--listen-addr=localhost:26258 \
--http-addr=localhost:8081 \
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
--listen-addr=localhost:26259 \
--http-addr=localhost:8082 \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 3. Initialize the cluster

In a new terminal, use the [`cockroach init`](cockroach-init.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=localhost:26257
~~~

## Step 4. Set up HAProxy load balancing

You're now running 3 nodes in a simulated cloud. Each of these nodes is an equally suitable SQL gateway to your cluster, but to ensure an even balancing of client requests across these nodes, you can use a TCP load balancer. Let's use the open-source [HAProxy](http://www.haproxy.org/) load balancer that you installed earlier.

In a new terminal, run the [`cockroach gen haproxy`](cockroach-gen.html) command, specifying the port of any node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--insecure \
--host=localhost:26257
~~~

This command generates an `haproxy.cfg` file automatically configured to work with the 3 nodes of your running cluster. In the file, change `bind :26257` to `bind :26000`. This changes the port on which HAProxy accepts requests to a port that is not already in use by a node and that will not be used by the nodes you'll add later.

~~~
global
  maxconn 4096

defaults
    mode                tcp
    # Timeout values should be configured for your specific use.
    # See: https://cbonte.github.io/haproxy-dconv/1.8/configuration.html#4-timeout%20connect
    timeout connect     10s
    timeout client      1m
    timeout server      1m
    # TCP keep-alive on client side. Server already enables them.
    option              clitcpka

listen psql
    bind :26000
    mode tcp
    balance roundrobin
    option httpchk GET /health?ready=1
    server cockroach1 localhost:26257 check port 8080
    server cockroach2 localhost:26258 check port 8081
    server cockroach3 localhost:26259 check port 8082
~~~

Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

{% include copy-clipboard.html %}
~~~ shell
$ haproxy -f haproxy.cfg
~~~

## Step 5. Run a sample workload

Now that you have a load balancer running in front of your cluster, lets use the YCSB workload built into CockroachDB to simulate multiple client connections, each performing mixed read/write workloads.

1. In a new terminal, load the initial `ycsb` schema and data, pointing it at HAProxy's port:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init ycsb \
    'postgresql://root@localhost:26000?sslmode=disable'
    ~~~

2. Run the `ycsb` workload, pointing it at HAProxy's port:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run ycsb \
    --duration=20m \
    --concurrency=10 \
    --max-rate=1000
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    This command initiates 10 concurrent client workloads for 20 minutes, but limits the total load to 1000 operations per second (since you're running everything on a single machine).

    You'll soon see per-operation statistics print to standard output every second:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
          1s        0         9258.1         9666.6      0.7      1.3      2.0      8.9 read
          1s        0          470.1          490.9      1.7      2.9      4.1      5.0 update
          2s        0        10244.6         9955.6      0.7      1.2      2.0      6.6 read
          2s        0          559.0          525.0      1.6      3.1      6.0      7.3 update
          3s        0         9870.8         9927.4      0.7      1.4      2.4     10.0 read
          3s        0          500.0          516.6      1.6      4.2      7.9     15.2 update
          4s        0         9847.2         9907.3      0.7      1.4      2.4     23.1 read
          4s        0          506.8          514.2      1.6      3.7      7.6     17.8 update
          5s        0        10084.4         9942.6      0.7      1.3      2.1      7.1 read
          5s        0          537.2          518.8      1.5      3.5     10.0     15.2 update
    ...
    ~~~

## Step 6. Watch data balance across all 3 nodes

Now open the DB Console at `http://localhost:8080` and click **Metrics** in the left-hand navigation bar. The **Overview** dashboard is displayed. Hover over the **SQL Queries** graph at the top. After a minute or so, you'll see that the load generator is executing approximately 95% reads and 5% writes across all nodes:

<img src="{{ 'images/v21.1/ui_sql_queries.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

Scroll down a bit and hover over the **Replicas per Node** graph. Because CockroachDB replicates each piece of data 3 times by default, the replica count on each of your 3 nodes should be identical:

<img src="{{ 'images/v21.1/ui_replicas_migration.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

## Step 7. Add 3 nodes on "cloud 2"

At this point, you're running three nodes on cloud 1. But what if you'd like to start experimenting with resources provided by another cloud vendor? Let's try that by adding three more nodes to a new cloud platform. Again, the flag to note is [`--locality`](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes), which you're using to specify that these next 3 nodes are running on cloud 2.

In a new terminal, start node 4 on cloud 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--locality=cloud=2 \
--store=cloud2node4 \
--listen-addr=localhost:26260 \
--http-addr=localhost:8083 \
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
--advertise-addr=localhost:26261 \
--http-addr=localhost:8084 \
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
--advertise-addr=localhost:26262 \
--http-addr=localhost:8085 \
--cache=100MB \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 8. Watch data balance across all 6 nodes

Back on the **Overview** dashboard in DB Console, hover over the **Replicas per Node** graph again. Because you used [`--locality`](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) to specify that nodes are running on 2 clouds, you'll see an approximately even number of replicas on each node, indicating that CockroachDB has automatically rebalanced replicas across both simulated clouds:

<img src="{{ 'images/v21.1/ui_replicas_migration2.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

Note that it takes a few minutes for the DB Console to show accurate per-node replica counts on hover. This is why the new nodes in the screenshot above show 0 replicas. However, the graph lines are accurate, and you can click **View node list** in the **Summary** area for accurate per-node replica counts as well.

## Step 9. Migrate all data to "cloud 2"

So your cluster is replicating across two simulated clouds. But let's say that after experimentation, you're happy with cloud vendor 2, and you decide that you'd like to move everything there. Can you do that without interruption to your live client traffic? Yes, and it's as simple as running a single command to add a [hard constraint](configure-replication-zones.html#replication-constraints) that all replicas must be on nodes with `--locality=cloud=2`.

In a new terminal, [edit the default replication zone](configure-zone.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --execute="ALTER RANGE default CONFIGURE ZONE USING constraints='[+cloud=2]';" --insecure --host=localhost:26257
~~~

## Step 10. Verify the data migration

Back on the **Overview** dashboard in the DB Console, hover over the **Replicas per Node** graph again. Very soon, you'll see the replica count double on nodes 4, 5, and 6 and drop to 0 on nodes 1, 2, and 3:

<img src="{{ 'images/v21.1/ui_replicas_migration3.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

This indicates that all data has been migrated from cloud 1 to cloud 2. In a real cloud migration scenario, at this point you would update the load balancer to point to the nodes on cloud 2 and then stop the nodes on cloud 1. But for the purpose of this local simulation, there's no need to do that.

## Step 11. Stop the cluster

Once you're done with your cluster, stop YCSB by switching into its terminal and pressing **CTRL-C**. Then do the same for HAProxy and each CockroachDB node.

{{site.data.alerts.callout_success}}For the last node, the shutdown process will take longer (about a minute) and will eventually force stop the node. This is because, with only 1 node still online, a majority of replicas are no longer available (2 of 3), and so the cluster is not operational. To speed up the process, press <strong>CTRL-C</strong> a second time.{{site.data.alerts.end}}

If you do not plan to restart the cluster, you may want to remove the nodes' data stores and the HAProxy config file:

{% include copy-clipboard.html %}
~~~ shell
$ rm -rf cloud1node1 cloud1node2 cloud1node3 cloud2node4 cloud2node5 cloud2node6 haproxy.cfg
~~~

## What's next?

Explore other core CockroachDB benefits and features:

{% include {{ page.version.version }}/misc/explore-benefits-see-also.md %}

You may also want to learn other ways to control the location and number of replicas in a cluster:

- [Even Replication Across Datacenters](configure-replication-zones.html#even-replication-across-availability-zones)
- [Multiple Applications Writing to Different Databases](configure-replication-zones.html#multiple-applications-writing-to-different-databases)
- [Stricter Replication for a Table and Its Indexes](configure-replication-zones.html#stricter-replication-for-a-table-and-its-secondary-indexes)
- [Tweaking the Replication of System Ranges](configure-replication-zones.html#tweaking-the-replication-of-system-ranges)
