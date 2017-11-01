---
title: Replication, Rebalancing & Fault Tolerance
summary: Learn how CockroachDB replicated and rebalances your data to survive failures.
toc: false
sidebar_data: sidebar-data-training.json
---

<div id="toc"></div>

## Presentation

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vQXJYTZky37sze5ZKd_xfSuK_bqMWDbMCNVIWM1h4s6rtoQqpNzM2drT4ZQGbBsUJefwwaY3cmEQe6A/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

#### URL for comments

[Replication, Rebalancing &amp; Rebalancing](https://docs.google.com/presentation/d/1rOSpwKD48T4OsFRFwnrRo-7x6dLK9Gr2pg9oBRTaChg/edit#slide=id.g18624943e3_0_0)

## Lab

In this lab, we'll show you that CockroachDB is a fault-tolerant database by taking down one of the nodes and showing that the cluster keeps operating.

### Before You Start

To complete this lab, we assume you have [a 3-node cluster running](3-node-local-insecure-cluster.html).

### Step 1. Set up HAProxy Load Balancing

Each node in your cluster is an equally suitable SQL gateway to your cluster, but to ensure an even balancing of client requests across these nodes, we'll use a TCP load balancer.

For this lab, we'll install the open-source [HAProxy](http://www.haproxy.org/). If you're on a Mac and using Homebrew, use `brew install haproxy`.

After the installation is complete, in a new terminal, run the [`cockroach gen haproxy`](/stable/generate-cockroachdb-resources.html) command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy --insecure
~~~

This command generates an `haproxy.cfg` file automatically configured to work with the nodes of your running cluster.

Open `haproxy.cfg`, and change `bind :26257` to `bind :26000`. This changes the port on which HAProxy accepts requests to a port that is not already in use by a node and that won't be used by the nodes you'll add later.

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

### Step 2. Start a Load Generator

Now that you have a load balancer running in front of your cluster, we'll generate a load against it to see how CockroachDB behaves.

To do this, we need to install two things:

- [Go](https://golang.org/dl/). If you're on a Mac and using Homebrew, use `brew install go`.
- [CockroachDB's version of YCSB](https://github.com/cockroachdb/loadgen/tree/master/ycsb): `go get github.com/cockroachdb/loadgen/ycsb`

After installing both of those, in a new terminal, start `ycsb`, pointing it at HAProxy's port:

{% include copy-clipboard.html %}
~~~ shell
$ $HOME/go/bin/ycsb -duration 20m -tolerate-errors -concurrency 2 -rate-limit 100 'postgresql://root@localhost:26000?sslmode=disable'
~~~

This command initiates 2 concurrent client workloads for 20 minutes, but limits each worker to 100 operations per second (since you're running everything on a single machine).

### Step 3. Watch Data Rebalance

Now open the Admin UI at `http://localhost:8080` and hover over the **SQL Queries** graph at the top. After a minute or so, you'll see that the load generator is executing approximately 95% reads and 5% writes across all nodes:

<img src="{{ 'images/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Scroll down a bit and hover over the **Replicas per Node** graph. You should see a roughly even mix among the nodes in your cluster:

<img src="{{ 'images/admin_ui_replicas_migration.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Step 4. Kill a Node

Back in your terminal, kill one of your `cockroach` processes:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach quit --insecure --port=26258
~~~

This kills the first node, though it doesn't really matter which node you kill because we're running a load balancer.

### Step 5. Check Your Cluster's Availability

Now pop back to the Admin UI, and you'll see that your cluster continued serving data and that the Summary Panel will show that you have a Suspect node that might be dead. If you wait > 5 minutes, it will become identified as dead.

This shows that CockroachDB tolerated a single failure, which is what we promised: _(n-1)/2_ where _n_ = a replication factor of 3. It's important to note that this *is not* the number of nodes. If you had a 100-node cluster, but with a replication factor of 3, you could still only be certain to tolerate 1 failure.

### Step 6. Restart Your Downed Node

You can now rejoin your first node to the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node1 \
--host=localhost \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

### Step 7. Stop the Load Generator

We won't use the load generator or HAProxy again, so you can stop them.

~~~ shell
$ pkill -9 haproxy
~~~

~~~ shell
$ pkill -9 ycsb
~~~

### Up Next

- [Importing Data](import-data.html)
