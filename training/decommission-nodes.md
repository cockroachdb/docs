---
title: Decommission Nodes
summary: Learn how to remove nodes from your cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

## Presentation

[Decommission Nodes](https://docs.google.com/presentation/d/1beTO2-Ca7Wg1TDSHMU-J-tdEJJuwmaPIm6KGWufX7jw/edit)

## Lab

In this lab, we'll walk you through decommissioning a node, which safely removes it from your cluster.

### Before You Begin

To complete this lab, you should have a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### Step 1. Scale the Cluster

Because our cluster has a replication factor of 3, we must add a fourth node to ensure we have enough nodes to replicate our data.

1. Make sure your cluster is up and running:

~~~ shell
$ cockroach node status --certs-dir=certs
~~~

    If it's not, you'll need to restart a 3-node cluster.

2. Start a fourth secure node:
    
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node4 \
    --host=localhost \
    --port=26260 \
    --http-port=8083 \
    --http-host=localhost \
    --join=localhost:26257, localhost:26258, localhost:26259, localhost:26260
    ~~~

3. Make sure the fourth node joined the cluster:

~~~ shell
$ cockroach node status --certs-dir=certs
~~~

### Step 2. Decommission and remove the node

Decommission the second node:

~~~ shell
$ cockroach quit --decommission --certs-dir=certs --host=127.0.0.1:26258
~~~

Every second or so, you'll then see the decommissioning status. Once the node has been fully decommissioned and stopped, you'll see a confirmation:

~~~
+----+---------+-------------------+--------------------+-------------+
| id | is_live | gossiped_replicas | is_decommissioning | is_draining |
+----+---------+-------------------+--------------------+-------------+
|  2 | true    |                13 | true               | true        |
+----+---------+-------------------+--------------------+-------------+
(1 row)
~~~

### Step 3. Ensure the node was decomissioned

Check to ensure that the node was successfully decommissioned:

~~~ shell
$ cockroach node status --certs-dir=certs
~~~

## Up Next

- [Back up a Cluster](back-up-a-cluster.html)
