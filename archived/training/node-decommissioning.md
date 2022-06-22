---
title: Node Decommissioning
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
block_search: false

---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vR0C9G-W0sNE1-SwziVHU7jJikwx50K-cDwy0kdFkADqSeu1po_nq8OM-IHyqngaeKtRiUNjKcZXZJL/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Before you begin

Make sure you have already completed [Planned Maintenance](planned-maintenance.html) and have 3 nodes running locally.

## Step 1. Try to decommission a node

Run the `cockroach quit` command with the `--decommission` flag against node 3:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach quit \
--insecure \
--decommission \
--host=localhost:26259
~~~

{{site.data.alerts.callout_info}}
For the purposes of this training, you use the `cockroach quit` command with the `--decommission` flag. However, in production, you'd use `cockroach decommission` and then instruct your process manager to end the process.
{{site.data.alerts.end}}

Because the cluster has 3 nodes, with every range on every node, it is not possible to rebalance node 3's data, so the decommission process hangs:

~~~
  id | is_live | replicas | is_decommissioning | is_draining
+----+---------+----------+--------------------+-------------+
   3 |  true   |       23 |        true        |    false
(1 row)
............
~~~

## Step 2. Add a fourth node

In a new terminal, to make it possible for node 3 to decommission, add a fourth node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node4 \
--listen-addr=localhost:26260 \
--http-addr=localhost:8083 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 3. Verify that decommissioning completed

1. Go back to the terminal where you triggered the decommission process.

    You'll see that, after the fourth node was added, the node's `gossiped_replicas` count decreased to 0 and the process completed with a confirmation:

    ~~~

      id | is_live | replicas | is_decommissioning | is_draining
    +----+---------+----------+--------------------+-------------+
       3 |  true   |        4 |        true        |    false
    (1 row)
    ......
      id | is_live | replicas | is_decommissioning | is_draining
    +----+---------+----------+--------------------+-------------+
       3 |  true   |        3 |        true        |    false
    (1 row)
    ............
      id | is_live | replicas | is_decommissioning | is_draining
    +----+---------+----------+--------------------+-------------+
       3 |  true   |        0 |        true        |    false
    (1 row)

    No more data reported on target nodes. Please verify cluster health before removing the nodes.
    ok
    ~~~

2. Open the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>, click **Metrics** on the left, and hover over the **Replicas per Node** graph in the **Overview** dashboard.

    You'll see that node 3 now has 0 replicas while the other nodes have equal replica counts.

    <img src="{{ 'images/v20.1/training-17.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

3. Click **Overview** on the left. About 5 minutes after the decommission process completes, you'll see node 3 listed under **Decommissioned Nodes**.  

    <img src="{{ 'images/v20.1/training-18.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 4. Clean up

In the next module, you'll start a new cluster from scratch, so take a moment to clean things up.

1. Stop all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

2. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4
    ~~~

## What's next?

[Backup and Restore](backup-and-restore.html)
