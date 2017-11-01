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

### Step 1. Install prerequisites

In this tutorial, you'll use CockroachDB, the HAProxy load balancer, and CockroachDB's version of the YCSB load generator, which requires Go. Before you begin, make sure these applications are installed:

- Install the latest version of [CockroachDB](/stable/install-cockroachdb.html).
- Install [HAProxy](http://www.haproxy.org/). If you're on a Mac and using Homebrew, use `brew install haproxy`.
- Install [Go](https://golang.org/dl/). If you're on a Mac and using Homebrew, use `brew install go`.
- Install the [CockroachDB version of YCSB](https://github.com/cockroachdb/loadgen/tree/master/ycsb): `go get github.com/cockroachdb/loadgen/ycsb`

Also, to keep track of the data files and logs for your cluster, you may want to create a new directory (e.g., `mkdir crdb-training`) and start all your nodes in that directory.

### Step 2. Start a local 3-node cluster

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

### Step 3. Initialize the cluster

In a new terminal, use the [`cockroach init`](/stable/initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

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

### Step 4. Scale the Cluster

You can easily add nodes to the cluster with the same command you used to start nodes:

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

# Start node5
$ cockroach start \
--insecure \
--store=node5 \
--host=localhost \
--port=25261 \
--http-port=8084 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

{{site.data.alerts.callout_info}}We're running 5 nodes because CockroachDB deployments are easy to reason about with odd numbers of nodes, because they require consensus at all times.{{site.data.alerts.end}}

You can then see that all 5 nodes are in the cluster
{% include copy-clipboard.html %}
~~~ shell
$ cockroach node status \
--insecure
~~~

### Step 4. Set up HAProxy Load Balancing

You're now running 5 nodes locally. Each of these nodes is an equally suitable SQL gateway to your cluster, but to ensure an even balancing of client requests across these nodes, you can use a TCP load balancer. Let's use the open-source [HAProxy](http://www.haproxy.org/) load balancer that you installed earlier.

In a new terminal, run the [`cockroach gen haproxy`](/stable/generate-cockroachdb-resources.html) command, specifying the port of any node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--insecure \
--host=localhost \
--port=26257
~~~

This command generates an `haproxy.cfg` file automatically configured to work with the 5 nodes of your running cluster.

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
    server cockroach2 localhost:26258
    server cockroach3 localhost:26259
    server cockroach4 localhost:26260
    server cockroach5 localhost:26261
~~~

Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

{% include copy-clipboard.html %}
~~~ shell
$ haproxy -f haproxy.cfg
~~~

### Step 5. Start a load generator

Now that you have a load balancer running in front of your cluster, let's use the YCSB load generator that you installed earlier to simulate multiple client connections, each performing mixed read/write workloads.

In a new terminal, start `ycsb`, pointing it at HAProxy's port:

{% include copy-clipboard.html %}
~~~ shell
$ $HOME/go/bin/ycsb -duration 20m -tolerate-errors -concurrency 10 -rate-limit 10 'postgresql://root@localhost:26000?sslmode=disable'
~~~

This command initiates 10 concurrent client workloads for 20 minutes, but limits each worker to 100 operations per second (since you're running everything on a single machine).

## Up Next

- [Replication, Rebalancinng, &amp; Fault Tolerance](replication-rebalancing-fault-tolerance.html)
