---
title: Deploy CockroachDB on Digital Ocean (Insecure)
summary: Learn how to deploy CockroachDB on Digital Ocean.
toc: false
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-digital-ocean.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Digital Ocean, using HAProxy to load balance client connections.

If you plan to use CockroachDB in production, we recommend using a secure cluster instead. Select **Secure** above for instructions.

<div id="toc"></div>

## Requirements

You must have [SSH access](https://www.digitalocean.com/community/tutorials/how-to-connect-to-your-droplet-with-ssh) to each Droplet with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

- Set up your Droplets using [private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking).
- Decide how you want to access your Admin UI:
	- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
	- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

## Step 1. Create Droplets

[Create Droplets with private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking) for each node you plan to have in your cluster and a separate Droplet for HAProxy. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Running HAProxy on its own droplet. This ensures that when a CockroachDB node fails, HAProxy continues uninterrupted.
- Selecting the same continent for all of your Droplets for best performance.

## Step 2. Configure your network

Set up a firewall for each of your Droplets, allowing TCP communication on the following two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and connecting with applications.
- **8080** (`tcp:8080`) for exposing your Admin UI.

For guidance, you can use Digital Ocean's guide to configuring firewalls based on the Droplet's OS:

- Ubuntu and Debian can use [`ufw`](https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server).
- FreeBSD can use [`ipfw`](https://www.digitalocean.com/community/tutorials/recommended-steps-for-new-freebsd-10-1-servers).
- Fedora can use [`iptables`](https://www.digitalocean.com/community/tutorials/initial-setup-of-a-fedora-22-server).
- CoreOS can use [`iptables`](https://www.digitalocean.com/community/tutorials/how-to-secure-your-coreos-cluster-with-tls-ssl-and-firewall-rules).
- CentOS can use [`firewalld`](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-using-firewalld-on-centos-7).

## Step 3. Set up the first node

1. 	SSH to your Droplet:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2.	Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball:
	$ wget https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz

	# Extract the binary:
	$ tar -xf cockroach-latest.linux-amd64.tgz  \
	--strip=1 cockroach-latest.linux-amd64/cockroach

	# Move the binary:
	$ sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new CockroachDB cluster with a single node, which will communicate with other nodes on its internal IP address:

	~~~ shell
	$ cockroach start --insecure --background --advertise-host=<node1 internal IP address>
	~~~

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

## Step 4. Add nodes to the cluster

1. 	SSH to your Droplet:

	~~~
	$ ssh <username>@<additional node external IP address>
	~~~

2.	Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball:
	$ wget https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz

	# Extract the binary:
	$ tar -xf cockroach-latest.linux-amd64.tgz  \
	--strip=1 cockroach-latest.linux-amd64/cockroach

	# Move the binary:
	$ sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new node that joins the cluster using the first node's internal IP address:

	~~~ shell
	$ cockroach start --insecure --background   \
	--advertise-host=<this node’s internal IP address>  \
	--join=<node1 internal IP address>:26257
	~~~

Repeat these steps for each Droplet you want to use as a node.

## Step 5. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to guarantee that each node can locate data across the cluster. To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. 	SSH to your first node:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2.	Launch the built-in SQL client and create a database:

	~~~ shell
	$ cockroach sql
	~~~
	~~~ sql
	> CREATE DATABASE insecurenodetest;
	~~~

3. 	In another terminal window, SSH to another node:

	~~~ shell
	$ ssh <username>@<node2 external IP address>
	~~~

4.	Launch the built-in SQL client:

	~~~ shell
	$ cockroach sql
	~~~

5.	View the cluster's databases, which will include `insecurenodetest`:

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

## Step 6. Set up a load balancer

Each CockroachDB node is an equally suitable SQL gateway to your cluster. However, it's important to note that a gateway node does a lot of work; it routes queries to other nodes, receives data from other nodes, performs its own computations, and returns results to the client. For optimal performance (queries per second), it's therefore best to use a TCP load balancer to spread client workloads evenly across nodes.

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster, so we feature that tool here.

1. 	SSH to the droplet where you want to run HAProxy:

	~~~ shell
	$ ssh <username>@<haproxy external IP address>
	~~~

2.	Install HAProxy:

	~~~ shell
	$ apt-get install haproxy
	~~~

3.	Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball.
	$ wget https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz

	# Extract the binary.
	$ tar -xf cockroach-latest.linux-amd64.tgz  \
	--strip=1 cockroach-latest.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin
	~~~

4. 	Run the `cockroach gen haproxy` command, specifying the interal IP address of any instance running a CockroachDB node:

	~~~ shell
	$ cockroach gen haproxy \
	--host=<internal IP address of any node> \
	--port=26257 \
	--insecure
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
	    server cockroach1 <node1 internal IP address>:26257
	    server cockroach2 <node2 internal IP address>:26257
	    server cockroach3 <node3 internal IP address>:26257
	~~~

	The file is preset with the minimal configurations needed to work with your running cluster:

	- For each node in the cluster, the `server` field specifies the interface that the node listens on, i.e., the address passed in the `--advertise-host` flag on node startup.
	- The `timout` fields specify timeout values that should be suitable for most deployments.
	- The `balance` field is set to the `roundrobin` balancing algorithm to ensure that traffic is spread as evenly as possible across nodes.

	For more details about these and other configuration settings, see the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html).

5. 	Start HAProxy, with the `-f` flag pointing to the `haproxy.cfg` file:

	~~~ shell
	$ haproxy -f haproxy.cfg
	~~~

## Step 7. Test your load balancer

Now that HAProxy is running, it can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to the HAProxy server, which will then redirect the connection to a CockroachDB node. To test this, install CockroachDB locally and launch the [built-in SQL client](use-the-built-in-sql-client.html), pointing to the HAProxy server:

1.	[Install CockroachDB](install-cockroachdb.html) on your local machine, if it's not there already.

2.	Launch the built-in SQL client, with the `--host` flag set to the external IP address of the HAProxy server:

	~~~ shell
	$ cockroach sql \
	--host=<haproxy external IP address> \
	--port=26257 \
	--insecure
	~~~

3.	View the cluster's databases:

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

## Step 8. Monitor the cluster

View your cluster's Admin UI by going to `http://<any node's external IP address>:8080`.

On this page, verify that the cluster is running as expected:

1. Click **View nodes list** on the right to ensure that all of your nodes successfully joined the cluster.

   Also check the **Replicas** column. If you have nodes with 0 replicas, it's possible you didn't properly set the `--advertise-host` flag to the Droplet's internal IP address. This prevents the node from receiving replicas and working as part of the cluster.

2. Click the **Databases** tab on the left to verify that `insecurenodetest` is listed.

{% include prometheus-callout.html %}

## Step 9. Use the database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the HAProxy server, not to a CockroachDB node.

## See Also

- [Google Cloud GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
