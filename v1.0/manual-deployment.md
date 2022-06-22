---
title: Manual Deployment
summary: Learn how to manually deploy a secure, multi-node CockroachDB cluster on multiple machines.
toc: true
---

<div class="filters filters-big clearfix">
  <a href="manual-deployment.html"><button class="filter-button current"><strong>Secure</strong></button></a>
  <a href="manual-deployment-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This tutorial shows you how to manually deploy a secure multi-node CockroachDB cluster on multiple machines, using [HAProxy](http://www.haproxy.org/) load balancers to distribute client traffic.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.


## Requirements

- You must have [CockroachDB installed](install-cockroachdb.html) locally. This is necessary for generating and managing your deployment's certificates.
- You must have SSH access to each machine. This is necessary for distributing binaries and certificates.
- Your network configuration must allow TCP communication on the following ports:
	- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and for clients to connect to HAProxy
	- **8080** (`tcp:8080`) to expose your Admin UI

## Recommendations

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

## Step 1. Generate certificates

Locally, you'll need to [create the following certificates and keys](create-security-certificates.html):

- A certificate authority (CA) key pair (`ca.crt` and `ca.key`).
- A node key pair for each node, issued to its IP addresses and any common names the machine uses, as well as to the IP addresses and common names for machines running HAProxy.
- A client key pair for the `root` user.

{{site.data.alerts.callout_success}}Before beginning, it's useful to collect each of your machine's internal and external IP addresses, as well as any server names you want to issue certificates for.{{site.data.alerts.end}}

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if you haven't already.

2. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll generate your CA certificate and all node and client certificates and keys in this directory and then upload some of the files to your nodes.
    - `my-safe-directory`: You'll generate your CA key in this directory and then reference the key when generating node and client certificates. After that, you'll keep the key safe and secret; you will not upload it to your nodes.

3. Create the CA certificate and key:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-ca \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

4. Create the certificate and key for the first node, issued to all common names you might use to refer to the node as well as to the HAProxy instances:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-node \
	<node1 internal IP address> \
	<node1 external IP address> \
	<node1 hostname>  \
	<other common names for node1> \
	localhost \
	127.0.0.1 \
	<haproxy internal IP addresses> \
	<haproxy external IP addresses> \
	<haproxy hostnames>  \
	<other common names for haproxy instances> \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

5. Upload certificates to the first node:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	# Create the certs directory:
	$ ssh <username>@<node1 address> "mkdir certs"
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ shell
	# Upload the CA certificate and node certificate and key:
	$ scp certs/ca.crt \
	certs/node.crt \
	certs/node.key \
	<username>@<node1 address>:~/certs
	~~~

6. Delete the local copy of the node certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code> As an alternative to deleting these files, you can run the next <code>cockroach cert create-node</code> commands with the <code>--overwrite</code> flag.{{site.data.alerts.end}}

7. Create the certificate and key for the second node, issued to all common names you might use to refer to the node as well as to the HAProxy instances:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-node \
	<node2 internal IP address> \
	<node2 external IP address> \
	<node2 hostname>  \
	<other common names for node1> \
	localhost \
	127.0.0.1 \
	<haproxy internal IP addresses> \
	<haproxy external IP addresses> \
	<haproxy hostnames>  \
	<other common names for haproxy instances> \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

8. Upload certificates to the second node:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	# Create the certs directory:
	$ ssh <username>@<node2 address> "mkdir certs"
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ shell
	# Upload the CA certificate and node certificate and key:
	$ scp certs/ca.crt \
	certs/node.crt \
	certs/node.key \
	<username>@<node2 address>:~/certs
	~~~

9. Repeat steps 6 - 8 for each additional node.

10. Create a client certificate and key for the `root` user:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-client \
	root \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

    {{site.data.alerts.callout_success}}In later steps, you'll use the <code>root</code> user's certificate to run <a href="cockroach-commands.html"><code>cockroach</code></a> client commands from your local machine. If you might also want to run <code>cockroach</code> client commands directly on a node (e.g., for local debugging), you'll need to copy the <code>root</code> user's certificate and key to that node as well.{{site.data.alerts.end}}

## Step 2. Start the first node

1. SSH to your first machine.

2. Install CockroachDB from our latest binary:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	# Get the latest CockroachDB tarball:
	$ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ shell
	# Extract the binary:
	$ tar -xzf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
	--strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ shell
	# Move the binary:
	$ sudo mv cockroach /usr/local/bin/
	~~~

3. Start a new CockroachDB cluster with a single node:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach start --background \
	--certs-dir=certs \
	--host=<node1 address>
	~~~

	This command specifies the location of certificates and the address at which other nodes can reach it. Otherwise, it uses all available defaults. For example, the node stores data in the `cockroach-data` directory, binds internal and client communication to port 26257, and binds Admin UI HTTP requests to port 8080. To set these options manually, see [Start a Node](start-a-node.html).

## Step 3. Add nodes to the cluster

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by starting and joining additional nodes.

1. SSH to another machine.

2. Install CockroachDB from our latest binary:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	# Get the latest CockroachDB tarball:
	$ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ shell
	# Extract the binary:
	$ tar -xzf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
	--strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ shell
	# Move the binary:
	$ sudo mv cockroach /usr/local/bin/
	~~~

3. Start a new node that joins the cluster using the first node's address:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach start --background  \
	--certs-dir=certs \
	--host=<node address> \
	--join=<node1 address>:26257
	~~~

	The only difference when adding a node is that you connect it to the cluster with the `--join` flag, which takes the address and port of the first node. Otherwise, it's fine to accept all defaults; since each node is on a unique machine, using identical ports will not cause conflicts.

4. Repeat these steps for each node you want to add.

## Step 4. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client with the `--host` flag set to the address of node 1 and security flags pointing to the CA cert and the client cert and key:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach sql \
	--certs-dir=certs \
	--host=<node1 address>
	~~~

2. Create a `securenodetest` database:

    {% include_cached copy-clipboard.html %}
	~~~ sql
	> CREATE DATABASE securenodetest;
	~~~

3. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

4. Launch the built-in SQL client with the `--host` flag set to the address of node 2 and security flags pointing to the CA cert and the client cert and key:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach sql \
	--certs-dir=certs \
	--host=<node2 address>
	~~~

5. View the cluster's databases, which will include `securenodetest`:

    {% include_cached copy-clipboard.html %}
	~~~ sql
	> SHOW DATABASES;
	~~~

	~~~
	+--------------------+
	|      Database      |
	+--------------------+
	| crdb_internal      |
	| information_schema |
	| securenodetest     |
	| pg_catalog         |
	| system             |
	+--------------------+
	(5 rows)
	~~~

6. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 5. Set up HAProxy load balancers

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.
  {{site.data.alerts.callout_success}}With a single load balancer, client connections are resilient to node failure, but the load balancer itself is a point of failure. It's therefore best to make load balancing resilient as well by using multiple load balancing instances, with a mechanism like floating IPs or DNS to select load balancers for clients.{{site.data.alerts.end}}

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster, so we feature that tool here.

1. On your local machine, run the [`cockroach gen haproxy`](generate-cockroachdb-resources.html) command with the `--host` flag set to the address of any node and security flags pointing to the CA cert and the client cert and key:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach gen haproxy \
	--certs-dir=certs \
	--host=<address of any node> \
	--port=26257
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

2. Upload the `haproxy.cfg` file to the machine where you want to run HAProxy:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	$ scp haproxy.cfg <username>@<haproxy address>:~/
	~~~

3. SSH to the machine where you want to run HAProxy.

4. Install HAProxy:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ apt-get install haproxy
	~~~

5. Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ haproxy -f haproxy.cfg
	~~~

6. Repeat these steps for each additional instance of HAProxy you want to run.

## Step 6. Test load balancing

Now that HAProxy is running, it can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to a HAProxy server, which will then redirect the connection to a CockroachDB node.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client with the `--host` flag set to the address of any HAProxy server and security flags pointing to the CA cert and the client cert and key:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach sql \
	--certs-dir=certs \
	--host=<haproxy address>
	~~~

2. View the cluster's databases:

    {% include_cached copy-clipboard.html %}
	~~~ sql
	> SHOW DATABASES;
	~~~

	~~~
	+--------------------+
	|      Database      |
	+--------------------+
	| crdb_internal      |
	| information_schema |
	| securenodetest     |
	| pg_catalog         |
	| system             |
	+--------------------+
	(5 rows)
	~~~

	As you can see, HAProxy redirected the query to one of the CockroachDB nodes.

3. Check which node you were redirected to:

    {% include_cached copy-clipboard.html %}
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

4. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 7. Configure replication

In CockroachDB, you use **replication zones** to control the number and location of replicas for specific sets of data. Initially, there is a single, default replication zone for the entire cluster. You can adjust this default zone as well as add zones for individual databases and tables as needed.

For more information, see [Configure Replication Zones](configure-replication-zones.html).

## Step 8. Use the cluster

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the HAProxy server, not to a CockroachDB node.

## Step 9. Monitor the cluster

View your cluster's Admin UI by going to `https://<any node's address>:8080`.

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
