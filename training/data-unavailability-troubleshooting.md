---
title: Data Unavailability Troubleshooting
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

In this lab, you'll cause a table's range to lose a majority of its replicas (2 of 3). This will make the data in the table unavailable. You'll then troubleshoot and resolve the problem.

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

Make sure you have already completed [Cluster Unavailability Troubleshooting](cluster-unavailability-troubleshooting.html) and have a cluster of 3 nodes running.

## Step 1. Prepare to simulate the problem

In preparation, add three more nodes with a distinct `--locality`, add a table, and use a replication zone to force the table's data onto the new nodes.

1. In a new terminal, start node 4:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node4 \
    --host=localhost \
    --port=26260 \
    --http-port=8083 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In a new terminal, start node 5:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node5 \
    --host=localhost \
    --port=26261 \
    --http-port=8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In a new terminal, start node 6:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node6 \
    --host=localhost \
    --port=26262 \
    --http-port=8085 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

4. In a new terminal, generate an `intro` database with a `mytable` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach gen example-data intro | cockroach sql --insecure
    ~~~

5. Create a [replication zone](../v1.1/configure-replication-zones.html) forcing the replicas of the `mytable` range to be located on nodes with the `datacenter=us-east-2` locality:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo 'constraints: [+datacenter=us-east-2]' | cockroach zone set intro.mytable --insecure -f -
    ~~~

    ~~~
    range_min_bytes: 1048576
    range_max_bytes: 67108864
    gc:
      ttlseconds: 90000
    num_replicas: 3
    constraints: [+datacenter=us-east-2]
    ~~~

6. Use the `SHOW TESTING_RANGES` SQL command to verify that the replicas for the `mytable` table are now located on nodes 4, 5, and 6:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --execute="SHOW TESTING_RANGES FROM TABLE intro.mytable;"
    ~~~

    ~~~
    +-----------+---------+----------+--------------+
    | Start Key | End Key | Replicas | Lease Holder |
    +-----------+---------+----------+--------------+
    | NULL      | NULL    | {4,5,6}  |            6 |
    +-----------+---------+----------+--------------+
    (1 row)
    ~~~

## Step 2. Simulate the problem

Stop 2 of the nodes containing `mytable` replicas. This will cause the range to lose a majority of its replicas and become unavailable. However, because all system ranges are on other nodes, the cluster as whole will remain available.

1. In the terminal where node 5 is running, press **CTRL + C**.

2. In the terminal where node 6 is running, press **CTRL + C**.

## Step 3. Troubleshoot the problem

1. In a new terminal, try to query the `mytable` table, pointing at a node that is still online:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --port=26257 \
    --execute="SELECT * FROM intro.mytable LIMIT 10;" \
    --logtostderr=WARNING
    ~~~

    Because the range for `mytable` no longer has a majority of its replicas, the query will hang indefinitely.

2. Go back to the Admin UI at <a href="https://localhost:8080" data-proofer-ignore>https://localhost:8080</a>.

3. Select the **Replication** dashboard.

4. Hover over the **Ranges** graph:

    <img src="{{ 'images/training-14.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    You'll see that at least 1 range is now unavailable. If the unavailable count is larger than 1, that means that some system ranges had a majority of replicas on the down nodes as well.

    The **Summary** panel on the right should tell you the same thing:

    <img src="{{ 'images/training-15.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:25%" />

5. For more insight into the ranges that are unavailable, go to the **Problem Ranges Report** at <a href="https://localhost:8080/#/reports/problemranges" data-proofer-ignore>https://localhost:8080/#/reports/problemranges</a>.

    <img src="{{ 'images/training-16.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 4. Resolve the problem

1. In the terminal where node 5 was running, restart the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node5 \
    --host=localhost \
    --port=26261 \
    --http-port=8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

2. In the terminal where node 6 was running, restart the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=datacenter=us-east-2 \
    --store=node6 \
    --host=localhost \
    --port=26262 \
    --http-port=8085 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. Go back to the Admin UI and verify that ranges are no longer unavailable.

## Step 5. Clean up

In the next lab, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 node6
    ~~~

## What's Next?

[Data Corruption Troubleshooting](data-corruption-troubleshooting.html)
