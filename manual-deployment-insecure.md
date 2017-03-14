---
title: Manual Deployment
summary: Learn how to manually deploy an insecure, multi-node CockroachDB cluster on multiple machines.
toc: false
---

<div class="filters filters-big clearfix">
  <a href="manual-deployment.html"><button class="filter-button">Secure</button></a>
  <a href="manual-deployment-insecure.html"><button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This tutorial shows you how to manually deploy an insecure multi-node CockroachDB cluster on multiple machines, using HAProxy to balance client connections evenly across nodes.

If you plan to use CockroachDB in production, we recommend using a secure cluster instead. Select **Secure** above for instructions.

<div id="toc"></div>

## Requirements

This process assumes the following:

- You have the [CockroachDB binary](install-cockroachdb.html).
- You have SSH access to each machine. This is necessary for distributing binaries and, in the case of a secure cluster, certificates.
- Your network configuration allows TCP communication on the following ports:
	- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and connecting with applications
	- **8080** (`tcp:8080`) to expose your Admin UI

## Recommendations

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

## Step 1. Start the first node

Copy the `cockroach` binary to the first machine and then start the node:

~~~ shell
$ cockroach start --insecure --host=<node1 hostname>
~~~

This command sets the node to insecure and identifies the address at which other nodes can reach it. Otherwise, it uses all available defaults. For example, the node stores data in the `cockroach-data` directory, listens for internal and client communication on port 26257, and listens for HTTP requests from the Admin UI on port 8080. To set these options manually, see [Start a Node](start-a-node.html).

## Step 2. Add nodes to the cluster

Copy the `cockroach` binary to the second machine and then start the node:

~~~ shell
$ cockroach start --insecure --host=<node2 hostname> --join=<node1 hostname>:26257
~~~

The only difference when starting the second node is that you connect it to the cluster with the `--join` flag, which takes the address and port of the first node. Otherwise, it's fine to accept all defaults; since each node is on a unique machine, using identical ports won't cause conflicts.

Repeat this step for each additional nodes.

## Step 3. Configure replication

In CockroachDB, you use **replication zones** to control the number and location of replicas for specific sets of data. Initially, there is a single, default replication zone for the entire cluster. You can adjust this default zone as well as add zones for individual databases and tables as needed.

For more information, see [Configure Replication Zones](configure-replication-zones.html).

## Step 4. Use the Built-in SQL Client

Start the built-in SQL client from any machine with the `cockroach` binary. This could be one of the node machines or a different machine.

~~~ shell
$ cockroach sql --url=postgresql://root@<node hostname>:26257/?sslmode=disable
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

This command uses the `--url` flag to identify the client user and the hostname and port of the node to connect to. You can also specify these details with distinct flags. For more information, see [Use the Built-In SQL Client](use-the-built-in-sql-client.html).

Once you're connected, run some [SQL statements](learn-cockroachdb-sql.html):

~~~ sql
> CREATE DATABASE bank;

> SET DATABASE = bank;

> CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);

> INSERT INTO accounts VALUES (1234, 10000);

> SELECT * FROM accounts;
~~~
~~~
+------+---------+
|  id  | balance |
+------+---------+
| 1234 |   10000 |
+------+---------+
~~~

## Step 5. Connect an app to the cluster

CockroachDB supports the PostgreSQL wire protocol, so you can use any available PostgreSQL client driver to connect an app to the cluster.

For a list of recommended drivers that we've tested, see [Install Client Drivers](install-client-drivers.html). For some basic code samples, see the [Build an App with CockroachDB](build-an-app-with-cockroachdb.html) tutorials.

## Step 6. Monitor the cluster

The CockroachDB Admin UI lets you monitor cluster-wide, node-level, and database-level metrics and events. To start up the Admin UI, point your browser to the URL in the `admin` field listed in the standard output of any node on startup, for example:

~~~ shell
$ cockroach start --insecure --host=node1.example.com
CockroachDB node starting at {{site.data.strings.start_time}}
build:      {{site.data.strings.version}} @ {{site.data.strings.build_time}}
admin:      http://node1.example.com:8080 <-------------------------- USE THIS URL
sql:        postgresql://root@node1.example.com:26257?sslmode=disable
logs:       cockroach-data/logs
store[0]:   path=cockroach-data
status:     initialized new cluster
clusterID:  {dab8130a-d20b-4753-85ba-14d8956a294c}
nodeID:     1
~~~

<img src="images/admin_ui.png" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{% include prometheus-callout.html %}

## Step 7. Stop the cluster

You can stop the nodes (and therefore the cluster) from any machine with the `cockroach` binary as follows:

~~~ shell
$ cockroach quit --host=node1.example.com
$ cockroach quit --host=node2.example.com
$ cockroach quit --host=node3.example.com
~~~

For more details about the `cockroach quit` command, see [Stop a Node](stop-a-node.html).

## See Also

- [Cloud Deployment](cloud-deployment.html)
- [Orchestration](orchestration.html)
- [Monitoring](monitor-cockroachdb-with-prometheus.html)
- [Start a Local Cluster](start-a-local-cluster.html)
- [Run CockroachDB in a VirtualBox VM](http://uptimedba.github.io/cockroach-vb-single/cockroach-vb-single/home.html) (community-supported)
