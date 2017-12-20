---
title: Decommission Nodes
summary: Learn how to remove nodes from your cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vR0C9G-W0sNE1-SwziVHU7jJikwx50K-cDwy0kdFkADqSeu1po_nq8OM-IHyqngaeKtRiUNjKcZXZJL/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Lab

In this lab, you'll safely remove a node from your cluster by decommissioning it.

### Before You Begin

To complete this lab, you need a [local cluster of 3 nodes](3-node-local-secure-cluster.html).

### Step 1. Scale the cluster

Because our cluster has a replication factor of 3, we must add a fourth node to ensure we have enough nodes to replicate our data *after* we remove a node from the cluster.

1. Make sure your cluster is up and running:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --certs-dir=certs
    ~~~

    If it's not, you'll need to [restart a 3-node cluster](3-node-local-secure-cluster.html).

    If you already have >3 nodes running, you can move ahead to [Step 2. Decommission and remove the node](#step-2-decommission-and-remove-the-node).

2. Start a fourth secure node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node4 \
    --host=localhost \
    --port=26260 \
    --http-port=8083 \
    --http-host=localhost \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. Make sure the fourth node joined the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --certs-dir=certs
    ~~~

### Step 2. Decommission and remove the node

Decommission the second node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach quit --decommission --certs-dir=certs --port=26258
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status --certs-dir=certs
~~~

The second node will no longer display.

## Up Next

- [Back up a Cluster](back-up-a-cluster.html)
