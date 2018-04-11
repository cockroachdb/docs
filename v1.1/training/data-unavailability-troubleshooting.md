---
title: Data Unavailability Troubleshooting
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: true
redirect_from: /training/data-unavailability-troubleshooting.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQwCCLjWfQRS32P_lbRgOlRRoQUt77KGMrsRrg08_cT_R19YD-CUPe3fQZMNTPxNW2hz9PGcotH7M6J/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a cluster spread across 3 separate localities

Create a 9-node cluster, with 3 nodes in each of 3 different localities.

1. In a new terminal, start node 1 in locality us-east-1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node1 \
    --host=localhost \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~~

2. In the same terminal, start node 2 in locality us-east-1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~~

3. In the same terminal, start node 3 in locality us-east-1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-1 \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~~

4. In the same terminal, start node 4 in locality us-east-2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node4 \
    --host=localhost \
    --port=26260 \
    --http-port=8083 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

5. In the same terminal, start node 5 in locality us-east-2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node5 \
    --host=localhost \
    --port=26261 \
    --http-port=8084 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

6. In the same terminal, start node 6 in locality us-east-2:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node6 \
    --host=localhost \
    --port=26262 \
    --http-port=8085 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

7. In the same terminal, start node 7 in locality us-east-3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-3 \
    --store=node7 \
    --host=localhost \
    --port=26263 \
    --http-port=8086 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

8. In the same terminal, start node 8 in locality us-east-3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-3 \
    --store=node8 \
    --host=localhost \
    --port=26264 \
    --http-port=8087 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

9. In the same terminal, start node 9 in locality us-east-3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-3 \
    --store=node9 \
    --host=localhost \
    --port=26265 \
    --http-port=8088 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

10. In the same terminal, perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure
    ~~~

## Step 2. Simulate the problem

In preparation, add a table and use a replication zone to force the table's data onto the new nodes.

1. Generate an `intro` database with a `mytable` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach gen example-data intro | ./cockroach sql --insecure
    ~~~

2. Create a [replication zone](../configure-replication-zones.html) forcing the replicas of the `mytable` range to be located on nodes with the `datacenter=us-east-3` locality:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+datacenter=us-east-3]' | ./cockroach zone set intro.mytable --insecure -f -
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 90000
    num_replicas: 3
    constraints: [+datacenter=us-east-3]
    ~~~

3. Use the `SHOW TESTING_RANGES` SQL command to determine the nodes on which the replicas for the `mytable` table are now located:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --execute="SHOW TESTING_RANGES FROM TABLE intro.mytable;"
    ~~~

    ~~~
    +-----------+---------+----------+--------------+
    | Start Key | End Key | Replicas | Lease Holder |
    +-----------+---------+----------+--------------+
    | NULL      | NULL    | {3,6,9}  |            9 |
    +-----------+---------+----------+--------------+
    (1 row)
    ~~~

4. The node IDs above may not match the order in which we started the nodes because node IDs only get allocated after `cockroach init` is run. You can verify that the nodes listed by `SHOW TESTING_RANGES` are all in the `datacenter=us-east-3` locality by opening the **Node Diagnostics** debug page at <a href="http://localhost:8080/#/reports/nodes" data-proofer-ignore>http://localhost:8080/#/reports/nodes</a> and checking the locality for each of the 3 node IDs.

    <img src="{{ 'images/v1.1/training-19.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 3. Simulate the problem

Stop 2 of the nodes containing `mytable` replicas. This will cause the range to lose a majority of its replicas and become unavailable. However, all other ranges are spread evenly across all three localities because the replication zone only applies to `mytable`, so the cluster as a whole will remain available.

1. Kill nodes 8 and 9:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach quit \
    --insecure \
    --port=26264
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach quit \
    --insecure \
    --port=26265
    ~~~

## Step 4. Troubleshoot the problem

1. In a new terminal, try to insert into the `mytable` table, pointing at a node that is still online:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --port=26257 \
    --execute="INSERT INTO intro.mytable VALUES (42, '')" \
    --logtostderr=WARNING
    ~~~

    Because the range for `mytable` no longer has a majority of its replicas, the query will hang indefinitely.

2. Go back to the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>.

3. Select the **Replication** dashboard.

4. Hover over the **Ranges** graph:

    <img src="{{ 'images/v1.1/training-14.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You should see that 1 range is now unavailable. If the unavailable count is larger than 1, that would mean that some system ranges had a majority of replicas on the down nodes as well.

    The **Summary** panel on the right should tell you the same thing:

    <img src="{{ 'images/v1.1/training-15.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:25%" />

5. For more insight into the ranges that are unavailable, go to the **Problem Ranges Report** at <a href="http://localhost:8080/#/reports/problemranges" data-proofer-ignore>http://localhost:8080/#/reports/problemranges</a>.

    <img src="{{ 'images/v1.1/training-16.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 5. Resolve the problem

1. Restart the stopped nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-3 \
    --store=node8 \
    --host=localhost \
    --port=26264 \
    --http-port=8087 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --locality=datacenter=us-east-3 \
    --store=node9 \
    --host=localhost \
    --port=26265 \
    --http-port=8088 \
    --join=localhost:26257,localhost:26258,localhost:26259 &
    ~~~

3. Go back to the Admin UI and verify that ranges are no longer unavailable.

4. Check back on your `INSERT` statement that was stuck and verify that it completed successfully.

## Step 6. Clean up

In the next lab, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 node6 node7 node8 node9
    ~~~

## What's Next?

[Data Corruption Troubleshooting](data-corruption-troubleshooting.html)
