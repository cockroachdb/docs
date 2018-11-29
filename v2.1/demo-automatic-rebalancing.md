---
title: Automatic Rebalancing
summary: Use a local cluster to explore how CockroachDB automatically rebalances data as you scale.
toc: true
---

This page walks you through a simple demonstration of how CockroachDB automatically rebalances data as you scale. Starting with a 3-node local cluster, you'll lower the maximum size for a single range, the unit of data that is replicated in CockroachDB. You'll then run a sample workload and watch the replica count quickly increase as ranges split. You'll then add 2 more nodes and watch how CockroachDB automatically rebalances replicas to efficiently use all available capacity.

## Before you begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Start a 3-node cluster

Use the [`cockroach start`](start-a-node.html) command to start 3 nodes:

{% include copy-clipboard.html %}
~~~ shell
# In a new terminal, start node 1:
$ cockroach start \
--insecure \
--store=scale-node1 \
--listen-addr=localhost:26257 \
--http-addr=localhost:8080 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

{% include copy-clipboard.html %}
~~~ shell
# In a new terminal, start node 2:
$ cockroach start \
--insecure \
--store=scale-node2 \
--listen-addr=localhost:26258 \
--http-addr=localhost:8081 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

{% include copy-clipboard.html %}
~~~ shell
# In a new terminal, start node 3:
$ cockroach start \
--insecure \
--store=scale-node3 \
--listen-addr=localhost:26259 \
--http-addr=localhost:8082 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 2. Initialize the cluster

In a new terminal, use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=localhost:26257
~~~

## Step 3. Verify that the cluster is live

In a new terminal, connect the [built-in SQL shell](use-the-built-in-sql-client.html) to any node to verify that the cluster is live:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26257
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
+---------------+
  defaultdb
  postgres
  system
(3 rows)
~~~

Exit the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

## Step 4. Lower the max range size

In CockroachDB, you use [replication zones](configure-replication-zones.html) to control the number and location of replicas. Initially, there is a single default replication zone for the entire cluster that is set to copy each range of data 3 times. This default replication factor is fine for this demo.

However, the default replication zone also defines the size at which a single range of data spits into two ranges. Since you want to create many ranges quickly and then see how CockroachDB automatically rebalances them, use [`ALTER RANGE ... CONFIGURE ZONE`](configure-zone.html) to reduce the max range size from the default 67108864 bytes (64MB) to cause ranges to split more quickly:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --execute="ALTER RANGE default CONFIGURE ZONE USING range_min_bytes=1, range_max_bytes=262144;" --insecure --host=localhost:26257
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --execute="SHOW ZONE CONFIGURATION FOR RANGE default;" --insecure
~~~

~~~
  zone_name |                config_sql
+-----------+------------------------------------------+
  .default  | ALTER RANGE default CONFIGURE ZONE USING
            |     range_min_bytes = 1,
            |     range_max_bytes = 262144,
            |     gc.ttlseconds = 90000,
            |     num_replicas = 3,
            |     constraints = '[]',
            |     lease_preferences = '[]'
(1 row)
~~~

## Step 5. Run a sample workload

CockroachDB comes with [built-in load generators](cockroach-workload.html) for simulating different types of client workloads, printing out per-operation statistics every second and totals after a specific duration or max number of operations. In this tutorial, you'll use the `tpcc` workload to simulates transaction processing using a rich schema of multiple tables.

1. Load the initial schema and data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init tpcc \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. The initial data is enough for the purpose of this tutorial, but you can run the workload for as long as you like to increase the data size, adjusting the `--duration` flag as appropriate:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run tpcc \
    --duration=30s \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second.

## Step 6. Watch the replica count increase

Open the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a> and you’ll see the bytes, replica count, and other metrics increase as the `tpcc` workload writes data.

<img src="{{ 'images/v2.1/scalability1.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 7. Add 2 more nodes

Adding capacity is as simple as starting more nodes and joining them to the running cluster:

{% include copy-clipboard.html %}
~~~ shell
# In a new terminal, start node 4:
$ cockroach start \
--insecure \
--store=scale-node4 \
--listen-addr=localhost:26260 \
--http-addr=localhost:8083 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

{% include copy-clipboard.html %}
~~~ shell
# In a new terminal, start node 5:
$ cockroach start \
--insecure \
--store=scale-node5 \
--listen-addr=localhost:26261 \
--http-addr=localhost:8084 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 8. Watch data rebalance across all 5 nodes

Back in the Admin UI, you'll now see 5 nodes listed. At first, the bytes and replica count will be lower for nodes 4 and 5. You'll see those metrics gradually even out across all nodes, indicating that data is being automatically rebalanced to utilize the additional capacity of the new nodes.

<img src="{{ 'images/v2.1/scalability2.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
After scaling to 5 nodes, the Admin UI will call out a number of under-replicated ranges. This is due to the cluster preferring 5 replicas for important [internal system data](configure-replication-zones.html#for-system-data) by default. When the cluster is less than 5 nodes, this preference is ignored in reporting, but as soon as there are more than 3 nodes, the cluster recognizes this preference and reports the under-replicated state in the UI. As those ranges are up-replicated, the under-replicated range count will decrease to 0.  
{{site.data.alerts.end}}

## Step 9.  Stop the cluster

Once you're done with your test cluster, stop each node by switching to its terminal and pressing **CTRL-C**.

{{site.data.alerts.callout_success}}
For the last node, the shutdown process will take longer (about a minute) and will eventually force kill the node. This is because, with only 1 node still online, a majority of replicas are no longer available (2 of 3), and so the cluster is not operational. To speed up the process, press **CTRL-C** a second time.
{{site.data.alerts.end}}

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

{% include copy-clipboard.html %}
~~~ shell
$ rm -rf scale-node1 scale-node2 scale-node3 scale-node4 scale-node5
~~~

## What's next?

Explore other core CockroachDB benefits and features:

{% include {{ page.version.version }}/misc/explore-benefits-see-also.md %}
