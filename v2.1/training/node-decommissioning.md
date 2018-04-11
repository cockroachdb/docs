---
title: Node Decommissioning
toc: false
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: true
redirect_from: /training/node-decommissioning.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vR0C9G-W0sNE1-SwziVHU7jJikwx50K-cDwy0kdFkADqSeu1po_nq8OM-IHyqngaeKtRiUNjKcZXZJL/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>
<div id="toc"></div>

## Before You Begin

Make sure you have already completed [Planned Maintenance](planned-maintenance.html) and have 3 nodes running locally.

## Step 1. Try to decommission a node

Run the `cockroach quit` command with the `--decommission` flag against node 3:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach quit \
--insecure \
--decommission \
--port=26259
~~~

Because the cluster has 3 nodes, with every range on every node, it is not possible to rebalance node 3's data, so the decommission process hangs:

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  3 | true    |                16 | true               | false       |
+----+---------+-------------------+--------------------+-------------+
(1 row)
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  3 | true    |                16 | true               | false       |
+----+---------+-------------------+--------------------+-------------+
(1 row)
...
~~~

## Step 2. Add a fourth node

To make it possible for node 3 to decommission, add a fourth node:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach start \
--insecure \
--store=node4 \
--host=localhost \
--port=26260 \
--http-port=8083 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 3. Verify that decommissioning completed

1. Go back to the terminal where you triggered the decommission process.

    You'll see that, after the fourth node was added, the node's `gossiped_replicas` count decreased to 0 and the process completed with a confirmation:

    ~~~
    ...
    +----+---------+-------------------+--------------------+-------------+
    | id | is_live | gossiped_replicas | is_decommissioning | is_draining |
    +----+---------+-------------------+--------------------+-------------+
    |  3 | true    |                11 | true               | true        |
    +----+---------+-------------------+--------------------+-------------+
    (1 row)
    +----+---------+-------------------+--------------------+-------------+
    | id | is_live | gossiped_replicas | is_decommissioning | is_draining |
    +----+---------+-------------------+--------------------+-------------+
    |  3 | true    |                 0 | true               | true        |
    +----+---------+-------------------+--------------------+-------------+
    (1 row)
    All target nodes report that they hold no more data. Please verify cluster health before removing the nodes.
    ok
    ~~~

2. Open the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>, click **Metrics** on the left, and hover over the **Replicas per Node** graph in the **Overview** dashboard.

    You'll see that node 3 now has 0 replicas while the other nodes have equal replica counts.

    <img src="{{ 'images/v2.0/training-17.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

3. Click **View nodes list** on the right.

    About 5 minutes after the decommission process completes, you'll see node 3 listed under **Decommissioned Nodes**.  

    <img src="{{ 'images/v2.0/training-18.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 4. Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4
    ~~~

## What's Next?

- [Backup and Restore](backup-and-restore.html)
