---
title: Catch Up&#58; 3-Node, Local, Insecure Cluster w/ Load Generator
summary: Get a 3-node, local, insecure CockroachDB cluster up and running quickly with a load generator.
toc: false
sidebar_data: sidebar-data-training.json
---

If you weren't in the training for the session where we set this, this guide shows you how to set up a CockroachDB cluster:

- With 3 nodes
- Locally
- *Without* SSL encryption
- With a load generator

## Step 1. Install prerequisites

In this tutorial, you'll use CockroachDB, the HAProxy load balancer, and CockroachDB's version of the YCSB load generator, which requires Go. Before you begin, make sure these applications are installed:

- Install the latest version of [CockroachDB](/stable/install-cockroachdb.html).
- Install [HAProxy](http://www.haproxy.org/). If you're on a Mac and using Homebrew, use `brew install haproxy`.
- Install [Go](https://golang.org/dl/). If you're on a Mac and using Homebrew, use `brew install go`.
- Install the [CockroachDB version of YCSB](https://github.com/cockroachdb/loadgen/tree/master/ycsb): `go get github.com/cockroachdb/loadgen/ycsb`

Also, to keep track of the data files and logs for your cluster, you may want to create a new directory (e.g., `mkdir crdb-training`) and start all your nodes in that directory.

## Step 2. Start a local 3-node cluster

If you've already [started a local cluster](/stable/start-a-local-cluster.html), the commands for starting nodes should be familiar to you. The new flag to note is [`--locality`](/stable/configure-replication-zones.html#descriptive-attributes-assigned-to-nodes), which accepts key-value pairs that describe the topography of a node. In this case, you're using the flag to specify that the first 3 nodes are running on cloud 1.

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

In a new terminal, use the [`cockroach init`](/stable/initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=localhost \
--port=26257
~~~

You can then see that all 3 nodes are in the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status \
--insecure
~~~

## Step 4. Set up HAProxy Load Balancing

You're now running 3 nodes locally. Each of these nodes is an equally suitable SQL gateway to your cluster, but to ensure an even balancing of client requests across these nodes, you can use a TCP load balancer. Let's use the open-source [HAProxy](http://www.haproxy.org/) load balancer that you installed earlier.

In a new terminal, run the [`cockroach gen haproxy`](/stable/generate-cockroachdb-resources.html) command, specifying the port of any node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--insecure \
--host=localhost \
--port=26257
~~~

This command generates an `haproxy.cfg` file automatically configured to work with the nodes in your running cluster.

In the file, change `bind :26257` to `bind :26000`. This changes the port on which HAProxy accepts requests to a port that is not already in use by a node and that won't be used by the nodes you'll add later.

~~~
global
  maxconn 4096

defaults
    mode                tcp
    timeout connect     10s
    timeout client      1m
    timeout server      1m

listen psql
    bind :26000
    mode tcp
    balance roundrobin
    server cockroach1 localhost:26257
    ...
~~~

Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

{% include copy-clipboard.html %}
~~~ shell
$ haproxy -f haproxy.cfg
~~~

## Step 5. Start a load generator

Now that you have a load balancer running in front of your cluster, let's use the YCSB load generator that you installed earlier to simulate multiple client connections, each performing mixed read/write workloads.

In a new terminal, start `ycsb`, pointing it at HAProxy's port:

{% include copy-clipboard.html %}
~~~ shell
$ $HOME/go/bin/ycsb -duration 5m -tolerate-errors -concurrency 10 -rate-limit 10 'postgresql://root@localhost:26000?sslmode=disable'
~~~

This command initiates 10 concurrent client workloads for 20 minutes, but limits each worker to 100 operations per second (since you're running everything on a single machine).
