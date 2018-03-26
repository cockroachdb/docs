---
title: Fault Tolerance and Automated Repair
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
feedback: false
redirect_from: /training/fault-tolerance-and-automated-repair.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQXJYTZky37sze5ZKd_xfSuK_bqMWDbMCNVIWM1h4s6rtoQqpNzM2drT4ZQGbBsUJefwwaY3cmEQe6A/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

Make sure you have already completed [Cluster Startup and Scaling](cluster-startup-and-scaling.html) and have 5 nodes running locally.

## Step 1. Set up load balancing

In this module, you'll run a load generator to simulate multiple client connections. Each node is an equally suitable SQL gateway for the load, but it's always recommended to spread requests evenly across nodes. You'll use the open-source [HAProxy](http://www.haproxy.org/) load balancer to do that here.

1. In a new terminal, install HAProxy. If you're on a Mac and use Homebrew, run:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ brew install haproxy
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install haproxy
    ~~~
    </div>

2. Run the [`cockroach gen haproxy`](../generate-cockroachdb-resources.html) command, specifying the port of any node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach gen haproxy \
    --insecure \
    --host=localhost \
    --port=26257
    ~~~

    This command generates an `haproxy.cfg` file automatically configured to work with the nodes of your running cluster.

3. Open `haproxy.cfg` and change `bind :26257` to `bind :26000`. This changes the port on which HAProxy accepts requests to a port that is not already in use by a node.

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
        server cockroach1 localhost:26257 check
        server cockroach2 localhost:26259 check
        server cockroach3 localhost:26258 check
        server cockroach4 localhost:26260 check
        server cockroach5 localhost:26261 check
    ~~~

4. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ haproxy -f haproxy.cfg
    ~~~

## Step 2. Start a load generator

Now that you have a load balancer running in front of your cluster, download and start a load generator to simulate client traffic.

1. In a new terminal, download the archive for the CockroachDB version of YCSB, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl {{site.url}}/docs/v1.1/training/resources/crdb-ycsb-mac.tar.gz \
    | tar -xJ
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- {{site.url}}/docs/v1.1/training/resources/crdb-ycsb-linux.tar.gz \
    | tar xvz
    ~~~
    </div>

2. Start `ycsb`, pointing it at HAProxy's port:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./ycsb \
    -duration 20m \
    -tolerate-errors \
    -concurrency 3 \
    -splits 50 \
    -max-rate 100 \
    'postgresql://root@localhost:26000?sslmode=disable'
    ~~~

    This command initiates 3 concurrent client workloads for 20 minutes, but limits the benchmark to just 100 operations per second (since you're running everything on a single machine).

    Also, the `-splits` flag tells the load generator to manually split ranges a number of times. This is not something you'd normally do, but for the purpose of this training, it makes it easier to visualize the movement of data in the cluster.

## Step 3. Check the workload

Initially, the load generator creates a new database called `ycsb`, creates a `usertable` table in that database, and inserts a bunch of rows into the table. Soon, the load generator starts executing approximately 95% reads and 5% writes.

1. To check the SQL queries getting executed, go back to the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a> and hover over the **SQL Queries** graph at the top:

    <img src="{{ 'images/v1.1/training-4.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

2. To check the client connections from the load generator, select the **SQL** dashboard and hover over the **SQL Connections** graph:

    <img src="{{ 'images/v1.1/training-5.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You'll notice 3 client connections for the 3 concurrent workloads from the load generator. If you want to check that HAProxy balanced each connection to a different node, you can change the **Graph** dropdown from **Cluster** to each of the first three nodes. For each node, you'll see a single client connection.

3. To see more details about the `ycsb` database and `usertable` table, click **Databases** in the upper left and then scroll down until you see **ycsb**:

    <img src="{{ 'images/v1.1/training-6.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You can also view the schema of the `usertable` by clicking the table name:

## Step 4. Simulate a single node failure

When a node fails, the cluster waits for the node to remain offline for 5 minutes by default before considering it dead, at which point the cluster automatically repairs itself by re-replicating any of the replicas on the down nodes to other available nodes.

1. In a new terminal, reduce the amount of time the cluster waits before considering a node dead to just 1 minute:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SET CLUSTER SETTING server.time_until_store_dead = '1m0s';"
    ~~~

2. Then use the the [`cockroach quit`](../stop-a-node.html) command to stop node 5:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach quit \
    --insecure \
    --port=26261
    ~~~

## Step 5. Check load continuity and cluster health

1. Go back to the Admin UI and verify that the cluster as a whole continues serving data, despite one of the nodes being unavailable and marked as **Suspect**:

    <img src="{{ 'images/v1.1/training-7.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    This shows that when all ranges are replicated 3 times (the default), the cluster can tolerate a single node failure because the surviving nodes have a majority of each range's replicas (2/3).

2. To verify this further, use the `cockroach sql` command to count the number of rows in the `ycsb.usertable` table and see how the count is increasing:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT count(*) FROM ycsb.usertable;"
    ~~~

    ~~~
    # Server version: CockroachDB CCL {{page.release_info.version}} (darwin amd64, built 2018/01/08 17:30:06, go1.8.3) (same version as client)
    # Cluster ID: de299958-a53e-4cbb-af16-eac7a8d7791c
    +----------+
    | count(*) |
    +----------+
    |    22032 |
    +----------+
    (1 row)
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT count(*) FROM ycsb.usertable;"
    ~~~

    ~~~
    # Server version: CockroachDB CCL {{page.release_info.version}} (darwin amd64, built 2018/01/08 17:30:06, go1.8.3) (same version as client)
    # Cluster ID: de299958-a53e-4cbb-af16-eac7a8d7791c
    +----------+
    | count(*) |
    +----------+
    |    22150 |
    +----------+
    (1 row)
    ~~~

## Step 6. Watch the cluster repair itself

Scroll down to the **Replicas per Node** graph:

<img src="{{ 'images/v1.1/training-8.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Because you reduced the time it takes for the cluster to consider the down node dead, after 1 minute or so, you'll see the replica count on node 5 drop to 0 and the replica count on the other nodes increase. This shows the cluster repairing itself by re-replicating missing replicas.

## Step 7. Prepare for two simultaneous node failures

At this point, the cluster is in a vulnerable state. With a replication factor of 3, if any of the 4 remaining nodes die, the cluster will lose access to at least some of its ranges.

To be able to tolerate 2 of 5 nodes failing simultaneously without any service interruption, ranges must be replicated 5 times.

1. In the terminal for node 5, restart the node, using the same command you used to start the node initially:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node5 \
    --host=localhost \
    --port=26261 \
    --http-port=8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

2. In a new terminal, use the [`cockroach zone`](../configure-replication-zones.html) command change the cluster's default replication factor to 5:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'num_replicas: 5' | ./cockroach zone set .default --insecure -f -
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 90000
    num_replicas: 5
    constraints: []
    ~~~

3. Back in the Admin UI, watch the **Replicas per Node** graph to see how the replica count increases and evens out across all 5 nodes:

    <img src="{{ 'images/v1.1/training-9.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    This shows the cluster up-replicating so that each range has 5 replicas, one on each node.

## Step 8. Simulate two simultaneous node failures

1. Use the the [`cockroach quit`](../stop-a-node.html) command to stop nodes 4 and 5:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach quit --insecure --port=26260
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach quit --insecure --port=26261
    ~~~

## Step 9. Check load continuity and cluster health

1. Like before, go to the Admin UI and verify that the cluster as a whole continues serving data, despite 2 nodes being offline:

    <img src="{{ 'images/v1.1/training-10.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    This shows that when all ranges are replicated 5 times, the cluster can tolerate 2 simultaneous node outages because the surviving nodes have a majority of each range's replicas (3/5).

2. To verify this further, use the `cockroach sql` command to count the number of rows in the `ycsb.usertable` table and see how the count is still increasing:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT count(*) FROM ycsb.usertable;"
    ~~~

    ~~~
    # Server version: CockroachDB CCL {{page.release_info.version}} (darwin amd64, built 2018/01/08 17:30:06, go1.8.3) (same version as client)
    # Cluster ID: de299958-a53e-4cbb-af16-eac7a8d7791c
    +----------+
    | count(*) |
    +----------+
    |    24066 |
    +----------+
    (1 row)
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SELECT count(*) FROM ycsb.usertable;"
    ~~~

    ~~~
    # Server version: CockroachDB CCL {{page.release_info.version}} (darwin amd64, built 2018/01/08 17:30:06, go1.8.3) (same version as client)
    # Cluster ID: de299958-a53e-4cbb-af16-eac7a8d7791c
    +----------+
    | count(*) |
    +----------+
    |    24092 |
    +----------+
    (1 row)
    ~~~

## Step 10. Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes, HAProxy, and the YCSB load generator:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach haproxy ycsb
    ~~~

    This simplified shutdown process is only appropriate for a lab/evaluation scenario. In a production environment, you would use `cockroach quit` to gracefully shut down each node.

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5
    ~~~

## What's Next?

- [Locality and Replication Zones](locality-and-replication-zones.html)
