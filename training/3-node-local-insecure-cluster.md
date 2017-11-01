---
title: Catch Up&#58; 3-Node, Local, Insecure Cluster
summary: Get a 3-node, local, insecure CockroachDB cluster up and running quickly.
toc: false
sidebar_data: sidebar-data-training.json
---

If you weren't in the training for the session where we set this, this guide shows you how to set up a CockroachDB cluster:

- With 3 nodes
- Locally
- *Without* SSL encryption

## 1. Install CockroachDB

Use our docs to [install CockroachDB](install-cockroachdb.html).

## Step 2. Start a local 3-node cluster

If you've already [started a local cluster](start-a-local-cluster.html), the commands for starting nodes should be familiar to you. The new flag to note is [`--locality`](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes), which accepts key-value pairs that describe the topography of a node. In this case, you're using the flag to specify that the first 3 nodes are running on cloud 1.

In a new terminal, start node 1:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node1 \
--host=localhost \
--join=localhost:26257,localhost:26258,localhost:26259
~~~~

In a new terminal, start node 2:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node2 \
--host=localhost \
--port=25258 \
--http-port=8081 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

In a new terminal, start node 3:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node3 \
--host=localhost \
--port=25259 \
--http-port=8082 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

## Step 3. Initialize the cluster

In a new terminal, use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=localhost \
--port=26257
~~~

You can then see that all 3 nodes are in the cluster
{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status \
--insecure
~~~
