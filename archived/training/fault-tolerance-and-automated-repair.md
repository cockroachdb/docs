---
title: Fault Tolerance and Automated Repair
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQXJYTZky37sze5ZKd_xfSuK_bqMWDbMCNVIWM1h4s6rtoQqpNzM2drT4ZQGbBsUJefwwaY3cmEQe6A/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before You Begin

Make sure you have already completed [Cluster Startup and Scaling](cluster-startup-and-scaling.html) and have 5 nodes running locally.

## Step 1. Set up load balancing

In this module, you'll run a sample workload to simulate multiple client connections. Each node is an equally suitable SQL gateway for the load, but it's always recommended to spread requests evenly across nodes. You'll use the open-source [HAProxy](http://www.haproxy.org/) load balancer to do that here.

1. In a new terminal, install HAProxy.

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    If you're on a Mac and use Homebrew, run:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ brew install haproxy
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    If you're using Linux and use apt-get, run:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install haproxy
    ~~~
    </div>

2. Run the [`cockroach gen haproxy`](../cockroach-gen.html) command, specifying the port of any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen haproxy \
    --insecure \
    --host=localhost \
    --port=26257
    ~~~

    This command generates an `haproxy.cfg` file automatically configured to work with the nodes of your running cluster.

3. In `haproxy.cfg`, change `bind :26257` to `bind :26000`. This changes the port on which HAProxy accepts requests to a port that is not already in use by a node.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    sed -i.saved 's/^    bind :26257/    bind :26000/' haproxy.cfg
    ~~~

4. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ haproxy -f haproxy.cfg &
    ~~~

## Step 2. Run a sample workload

Now that you have a load balancer running in front of your cluster, use the YCSB workload built into CockroachDB to simulate multiple client connections, each performing mixed read/write workloads.

1. In a new terminal, load the initial `ycsb` schema and data, pointing it at HAProxy's port:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init ycsb \
    'postgresql://root@localhost:26000?sslmode=disable'
    ~~~

2. Run the `ycsb` workload, pointing it at HAProxy's port:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run ycsb \
    --duration=20m \
    --concurrency=3 \
    --max-rate=1000 \
    --splits=50 \
    'postgresql://root@localhost:26000?sslmode=disable'
    ~~~

    This command initiates 3 concurrent client workloads for 20 minutes, but limits the total load to 1000 operations per second (since you're running everything on a single machine).

    Also, the `--splits` flag tells the workload to manually split ranges a number of times. This is not something you'd normally do, but for the purpose of this training, it makes it easier to visualize the movement of data in the cluster.

## Step 3. Check the workload

Initially, the workload creates a new database called `ycsb`, creates a `usertable` table in that database, and inserts a bunch of rows into the table. Soon, the load generator starts executing approximately 95% reads and 5% writes.

1. To check the SQL queries getting executed, go back to the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>, click **Metrics** on the left, and hover over the **SQL Queries** graph at the top:

    <img src="{{ 'images/v20.1/training-4.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

2. To check the client connections from the load generator, select the **SQL** dashboard and hover over the **SQL Connections** graph:

    <img src="{{ 'images/v20.1/training-5.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You'll notice 3 client connections for the 3 concurrent workloads from the load generator. If you want to check that HAProxy balanced each connection to a different node, you can change the **Graph** dropdown from **Cluster** to each of the nodes. For three of the nodes, you'll see a single client connection.

3. To see more details about the `ycsb` database and `usertable` table, click **Databases** in the upper left and then scroll down until you see **ycsb**:

    <img src="{{ 'images/v20.1/training-6.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You can also view the schema of the `usertable` by clicking the table name:

    <img src="{{ 'images/v20.1/training-6.1.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />    

## Step 4. Simulate a single node failure

When a node fails, the cluster waits for the node to remain offline for 5 minutes by default before considering it dead, at which point the cluster automatically repairs itself by re-replicating any of the replicas on the down nodes to other available nodes.

1. In a new terminal, reduce the amount of time the cluster waits before considering a node dead to the minimum allowed of 1 minute and 15 seconds:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26000 \
    --execute="SET CLUSTER SETTING server.time_until_store_dead = '1m15s';"
    ~~~

2. Then use the [`cockroach quit`](../cockroach-quit.html) command to stop node 5:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit \
    --insecure \
    --host=localhost:26261
    ~~~

## Step 5. Check load continuity and cluster health

Go back to the Admin UI, click **Metrics** on the left, and verify that the cluster as a whole continues serving data, despite one of the nodes being unavailable and marked as **Suspect**:

<img src="{{ 'images/v20.1/training-7.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

This shows that when all ranges are replicated 3 times (the default), the cluster can tolerate a single node failure because the surviving nodes have a majority of each range's replicas (2/3).

## Step 6. Watch the cluster repair itself

Scroll down to the **Replicas per Node** graph:

<img src="{{ 'images/v20.1/training-8.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Because you reduced the time it takes for the cluster to consider the down node dead, after 1 minute or so, you'll see the replica count on nodes 1 through 4 increase. This shows the cluster repairing itself by re-replicating missing replicas.

## Step 7. Prepare for two simultaneous node failures

At this point, the cluster has recovered and is ready to handle another failure. However, the cluster cannot handle two _near-simultaneous_ failures in this configuration. Failures are "near-simultaneous" if they are closer together than the `server.time_until_store_dead` setting plus the time taken for the number of replicas on the dead node to drop to zero. If two failures occurred in this configuration, some ranges would become unavailable until one of the nodes recovers.

To be able to tolerate 2 of 5 nodes failing simultaneously without any service interruption, ranges must be replicated 5 times.

1. Restart node 5, using the same command you used to start the node initially:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

2. In a new terminal, use the [`ALTER RANGE ... CONFIGURE ZONE`](../configure-zone.html) command to change the cluster's `default` replication factor to 5:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER RANGE default CONFIGURE ZONE USING num_replicas=5;" --insecure --host=localhost:26000
    ~~~

3. Back in the Admin UI **Metrics** dashboard, watch the **Replicas per Node** graph to see how the replica count increases and evens out across all 5 nodes:

    <img src="{{ 'images/v20.1/training-9.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    This shows the cluster up-replicating so that each range has 5 replicas, one on each node.

## Step 8. Simulate two simultaneous node failures

1. Use the [`cockroach quit`](../cockroach-quit.html) command to stop nodes 4 and 5:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26260
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26261
    ~~~

## Step 9. Check load continuity and cluster health

1. Like before, go to the Admin UI, click **Metrics** on the left, and verify that the cluster as a whole continues serving data, despite 2 nodes being offline:

    <img src="{{ 'images/v20.1/training-10.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    This shows that when all ranges are replicated 5 times, the cluster can tolerate 2 simultaneous node outages because the surviving nodes have a majority of each range's replicas (3/5).

2. To verify this further, use the `cockroach sql` command to count the number of rows in the `ycsb.usertable` table and verify that it is still serving reads:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT count(*) FROM ycsb.usertable;"
    ~~~

    ~~~
      count
    +-------+
      10000
    (1 row)
    ~~~

    And writes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="INSERT INTO ycsb.usertable VALUES ('asdf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);"
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SELECT count(*) FROM ycsb.usertable;"
    ~~~

    ~~~
      count
    +-------+
      10001
    (1 row)
    ~~~

## Step 10. Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes, HAProxy, and the YCSB load generator:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach haproxy ycsb
    ~~~

    This simplified shutdown process is only appropriate for a lab/evaluation scenario.

2. Remove the nodes' data directories and the HAProxy config:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 haproxy.cfg
    ~~~

## What's Next?

[Locality and Replication Zones](locality-and-replication-zones.html)
