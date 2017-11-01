---
title: Starting & Scaling a Cluster
summary: Learn how to start and scale a local, insecure CockroachDB cluster.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vReMGQvxlD5A84On802gukVFgoSuL4gJKl0JX2xy9aQenikBOmO12W08566QaKVJzD5c6VkoYlWUPKI/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

#### URL for Comments

[https://docs.google.com/presentation/d/1AJXdG3yon0hKAeiRQZgAPe6U19DrW4h2VO3bm_zSwDc/edit](https://docs.google.com/presentation/d/1AJXdG3yon0hKAeiRQZgAPe6U19DrW4h2VO3bm_zSwDc/edit)

## Lab

In this lab, we'll start a cluster, scale it, and get a load-balanced load generator to write data to it.

### Before You Begin

This will be the first time you interact with the `cockroach` binary, so there are some nuances to it you should understand.

- Because we're going to start by running an insecure deployment, _all_ of our `cockroach` commands need to include the `--insecure` flag. Without it, `cockroach` expects to be able to find a set of security certificates to encrypt its communication.
- Because our deployment is going to be local, `cockroach` commands we issue are going to default to communicating to the node running on the default port **26257**. We're going to start node1 on that port, so if you want to issue commands to other nodes, you'll need to specify a different port.

### Step 1. Install CockroachDB

Go over to our docs and [install the latest version of CockroachDB](/stable/install-cockroachdb.html).

Also, to keep track of the data files and logs for your cluster, you may want to create a new directory (e.g., `mkdir crdb-training`) and start all your nodes in that directory.

### Step 2. Start a Local 3-Node Cluster

For the training, we're going to run our clusters locally. To make things as straightforward as possible, we recommend using a terminal that supports multiple tabs––starting each node in its own tab, and then using an extra tab to run commands against your cluster.

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

### Step 3. Initialize the cluster

In a new terminal, use the [`cockroach init`](/stable/initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure
~~~

You can then see that all 3 nodes are in the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status \
--insecure
~~~

You can use this terminal as the one to issue commands to your cluster.

### Step 4. Scale the Cluster

You can easily add nodes to the cluster with the same command you used to start nodes (again, you'll want to run this command in a new terminal):

{% include copy-clipboard.html %}
~~~ shell
# Start node4
$ cockroach start \
--insecure \
--store=node4 \
--host=localhost \
--port=25260 \
--http-port=8083 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

You can then see that all 4 nodes are in the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status \
--insecure
~~~

## Up Next

- [Replication, Rebalancing, &amp; Fault Tolerance](replication-rebalancing-fault-tolerance.html)
