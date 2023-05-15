---
title: Manual Deployment (Insecure)
summary: Learn how to manually deploy an insecure, multi-node CockroachDB cluster on multiple machines.
toc: true
---

<div class="filters filters-big clearfix">
  <a href="manual-deployment.html"><button class="filter-button">Secure</button></a>
  <a href="manual-deployment-insecure.html"><button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This tutorial shows you how to manually deploy an insecure multi-node CockroachDB cluster on multiple machines, using [HAProxy](http://www.haproxy.org/) load balancers to distribute client traffic.

{{site.data.alerts.callout_danger}}If you plan to use CockroachDB in production, we strongly recommend using a secure cluster instead. Select <strong>Secure</strong> above for instructions.{{site.data.alerts.end}}


## Requirements

- You must have SSH access to each machine. This is necessary for distributing binaries.
- Your network configuration must allow TCP communication on the following ports:
	- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and for clients to connect to HAProxy
	- **8080** (`tcp:8080`) to expose your Admin UI

## Recommendations

- If you plan to use CockroachDB in production, we recommend using a [secure cluster](manual-deployment.html) instead. Using an insecure cluster comes with risks:
  - Your cluster is open to any client that can access any node's IP addresses.
  - Any user, even `root`, can log in without providing a password.
  - Any user, connecting as `root`, can read or write any data in your cluster.
  - There is no network encryption or authentication, and thus no confidentiality.

- For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

## Step 1. Start the first node

1. SSH to your first machine.

2. Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball:
	$ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz

	# Extract the binary:
	$ tar -xzf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
	--strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach

	# Move the binary:
	$ sudo mv cockroach /usr/local/bin/
	~~~

3. Start a new CockroachDB cluster with a single node:

	~~~ shell
	$ cockroach start --insecure \
	--host=<node1 internal address>
	~~~

	This commands starts an insecure node and identifies the address at which other nodes can reach it, in this case an internal address since you likely do not want applications outside your network reaching an insecure cluster. Otherwise, it uses all available defaults. For example, the node stores data in the `cockroach-data` directory, listens for internal and client communication on port 26257, and listens for HTTP requests from the Admin UI on port 8080. To set these options manually, see [Start a Node](start-a-node.html).

## Step 2. Add nodes to the cluster

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by starting and joining additional nodes.

1. SSH to another machine.

2. Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball:
	$ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz

	# Extract the binary:
	$ tar -xzf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
	--strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach

	# Move the binary:
	$ sudo mv cockroach /usr/local/bin/
	~~~

3. Start a new node that joins the cluster using the first node's address:

	~~~ shell
	$ cockroach start --insecure \
	--host=<node2 internal address> \
	--join=<node1 internal address>:26257
	~~~

	The only difference when adding a node is that you connect it to the cluster with the `--join` flag, which takes the address and port of the first node. Otherwise, it's fine to accept all defaults; since each node is on a unique machine, using identical ports will not cause conflicts.

4. Repeat these steps for each node you want to add.

## Step 3. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. SSH to your first node.

2. Launch the built-in SQL client and create a database:

	~~~ shell
	$ cockroach sql --insecure --host=<node1 internal address>
	~~~

	~~~ sql
	> CREATE DATABASE insecurenodetest;
	~~~

3. In another terminal window, SSH to another node.

4. Launch the built-in SQL client:

	~~~ shell
	$ cockroach sql --insecure --host=<node's internal address>
	~~~

5. View the cluster's databases, which will include `insecurenodetest`:

	~~~ sql
	> SHOW DATABASES;
	~~~
	~~~
	+--------------------+
	|      Database      |
	+--------------------+
	| crdb_internal      |
	| information_schema |
	| insecurenodetest   |
	| pg_catalog         |
	| system             |
	+--------------------+
	(5 rows)
	~~~

6. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 4. Set up HAProxy load balancers

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.
  {{site.data.alerts.callout_success}}With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.{{site.data.alerts.end}}

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster, so we feature that tool here.

1. SSH to the machine where you want to run HAProxy.

2. Install HAProxy:

	~~~ shell
	$ apt-get install haproxy
	~~~

3. Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball.
	$ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz

	# Extract the binary.
	$ tar -xzf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
	--strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin/
	~~~

4. Run the [`cockroach gen haproxy`](generate-cockroachdb-resources.html) command, specifying the address of any CockroachDB node:

	~~~ shell
	$ cockroach gen haproxy --insecure \
	--host=<internal address of any node> \
	--port=26257 \
	~~~

	By default, the generated configuration file is called `haproxy.cfg` and looks as follows, with the `server` addresses pre-populated correctly:

	~~~ shell
	global
	  maxconn 4096

	defaults
	    mode                tcp
	    timeout connect     10s
	    timeout client      1m
	    timeout server      1m

	listen psql
	    bind :26257
	    mode tcp
	    balance roundrobin
	    server cockroach1 <node1 address>:26257
	    server cockroach2 <node2 address>:26257
	    server cockroach3 <node3 address>:26257
	~~~

	The file is preset with the minimal [configurations](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html) needed to work with your running cluster:

	Field | Description
	------|------------
	`timout connect`<br>`timeout client`<br>`timeout server` | Timeout values that should be suitable for most deployments.
	`bind` | The port that HAProxy listens on. This is the port clients will connect to and thus needs to be allowed by your network configuration.<br><br>This tutorial assumes HAProxy is running on a separate machine from CockroachDB nodes. If you run HAProxy on the same machine as a node (not recommended), you'll need to change this port, as `26257` is also used for inter-node communication.
	`balance` | The balancing algorithm. This is set to `roundrobin` to ensure that connections get rotated amongst nodes (connection 1 on node 1, connection 2 on node 2, etc.). Check the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html#4-balance) for details about this and other balancing algorithms.
	`server` | For each node in the cluster, this field specifies the interface that the node listens on, i.e., the address passed in the `--host` flag on node startup.

	{{site.data.alerts.callout_info}}For full details on these and other configuration settings, see the <a href="http://cbonte.github.io/haproxy-dconv/1.7/configuration.html">HAProxy Configuration Manual</a>.{{site.data.alerts.end}}

5. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

	~~~ shell
	$ haproxy -f haproxy.cfg
	~~~

6. Repeat these steps for each additional instance of HAProxy you want to run.

## Step 5. Test load balancing

Now that HAProxy is running, it can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to a HAProxy server, which will then redirect the connection to a CockroachDB node.

To test this, install CockroachDB locally and use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if it's not there already.

2. Launch the built-in SQL client, with the `--host` flag set to the address of one of the HAProxy servers:

	~~~ shell
	$ cockroach sql --insecure \
	--host=<haproxy address> \
	--port=26257
	~~~

3. View the cluster's databases:

	~~~ sql
	> SHOW DATABASES;
	~~~
	~~~
	+--------------------+
	|      Database      |
	+--------------------+
	| crdb_internal      |
	| information_schema |
	| insecurenodetest   |
	| pg_catalog         |
	| system             |
	+--------------------+
	(5 rows)
	~~~

	As you can see, HAProxy redirected the query to one of the CockroachDB nodes.

4. Check which node you were redirected to:

	~~~ sql
	> SELECT node_id FROM crdb_internal.node_build_info LIMIT 1;
	~~~
	~~~
	+---------+
	| node_id |
	+---------+
	|       3 |
	+---------+
	(1 row)
	~~~

5. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 6. Configure replication

In CockroachDB, you use **replication zones** to control the number and location of replicas for specific sets of data. Initially, there is a single, default replication zone for the entire cluster. You can adjust this default zone as well as add zones for individual databases and tables as needed.

For more information, see [Configure Replication Zones](configure-replication-zones.html).

## Step 7. Use the cluster

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the HAProxy server, not to a CockroachDB node.

## Step 8. Monitor the cluster

View your cluster's Admin UI by going to `http://<any node's address>:8080`.

On this page, verify that the cluster is running as expected:

1. Click **View nodes list** on the right to ensure that all of your nodes successfully joined the cluster.

    Also check the **Replicas** column. If you have nodes with 0 replicas, it's possible you didn't properly set the `--host` flag. This prevents the node from receiving replicas and working as part of the cluster.

2. Click the **Databases** tab on the left to verify that `insecurenodetest` is listed.

{% include {{ page.version.version }}/misc/prometheus-callout.html %}

## See Also

- [Cloud Deployment](cloud-deployment.html)
- [Orchestration](orchestration.html)
- [Monitoring](monitor-cockroachdb-with-prometheus.html)
- [Start a Local Cluster](start-a-local-cluster.html)
- [Run CockroachDB in a VirtualBox VM](http://uptimedba.github.io/cockroach-vb-single/cockroach-vb-single/home.html) (community-supported)
