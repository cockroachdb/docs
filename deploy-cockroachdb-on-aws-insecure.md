---
title: Deploy CockroachDB on AWS EC2 (Insecure)
summary: Learn how to deploy CockroachDB on Amazon's AWS EC2 platform.
toc: false
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-aws.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Google Cloud Platform's Compute Engine (GCE), using HAProxy to load balance client connections.

If you plan to use CockroachDB in production, we recommend using a secure cluster instead. Select **Secure** above for instructions.

<div id="toc"></div>

## Requirements

You must have SSH access ([key pairs](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)/[SSH login](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html)) to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

- All instances running CockroachDB and HAProxy should be members of the same Security Group.
- Decide how you want to access your Admin UI:
	- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*
	- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

{{site.data.alerts.callout_success}}<strong><a href="https://www.terraform.io/">Terraform</a></strong> users can deploy CockroachDB using the <a href="https://github.com/cockroachdb/cockroach/blob/master/cloud/aws">configuration files and instructions in our GitHub repo's <code>aws</code>directory</a>.{{site.data.alerts.end}}

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- `26257` for inter-node communication (i.e., working as a cluster) and connecting with applications
- `8080` for exposing your Admin UI

You can create these rules using [Security Groups' Inbound Rules](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html#adding-security-group-rule).

#### Inter-node communication

| Field | Recommended Value |
|-------|-------------------|
| Type | Custom TCP Rule |
| Protocol | TCP |
| Port Range | **26257** |
| Source | The name of your security group (e.g., *sg-07ab277a*) |

#### Admin UI

| Field | Recommended Value |
|-------|-------------------|
| Type | Custom TCP Rule |
| Protocol | TCP |
| Port Range | **8080** |
| Source | Your network's IP ranges |

#### Application Data

| Field | Recommended Value |
|-------|-------------------|
| Type | Custom TCP Rules |
| Protocol | TCP |
| Port Range | **26257** |
| Source | Your application's IP ranges |

To connect your application to CockroachDB, use a [PostgreSQL wire protocol driver](install-client-drivers.html).

## Step 2. Create instances

[Create an instance](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/launching-instance.html) for each node you plan to have in your cluster and an instance for HAProxy. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 CockroachDB nodes to ensure survivability.
- Running HAProxy on its own instance. This ensures that when a CockroachDB node fails, HAProxy continues uninterrupted.
- Selecting the same continent for all of your instances for best performance.

## Step 3. Set up the first node

1. 	SSH to your instance:

	~~~ shell
	$ ssh -i <path to AWS .pem> <username>@<node1 external IP address>
	~~~

2.	Install the latest CockroachDB binary:

	~~~ shell
	# Get the latest CockroachDB tarball.
	$ wget https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz

	# Extract the binary.
	$ tar -xf cockroach-latest.linux-amd64.tgz  \
	--strip=1 cockroach-latest.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new CockroachDB cluster with a single node, which will communicate with other nodes on its internal IP address:

	~~~ shell
	$ cockroach start --insecure --background
	~~~

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

## Step 4. Add nodes to the cluster

1. 	SSH to another instance:

	~~~
	$ ssh -i <path to AWS .pem> <username>@<additional node external IP address>
	~~~

2.	Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball.
	$ wget https://binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz

	# Extract the binary.
	$ tar -xf cockroach-latest.linux-amd64.tgz  \
	--strip=1 cockroach-latest.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new node that joins the cluster using the first node's internal IP address:

	~~~ shell
	$ cockroach start --insecure --background --join=<node1 internal IP address>:26257
	~~~

Repeat these steps for each instance you want to use as a node.

## Step 5. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to guarantee that each node can locate data across the cluster. To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. 	SSH to your first node:

	~~~ shell
	$ ssh -i <path to AWS .pem> <username>@<node1 external IP address>
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
	$ ssh -i <path to AWS .pem> <username>@<node3 external IP address>
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

1. 	SSH to the instance where you want to run HAProxy:

	~~~ shell
	$ ssh -i <path to AWS .pem> <username>@<haproxy external IP address>
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

	- For each node in the cluster, the `server` field specifies the interface that the node listens on.
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

On this page, go to the following tabs on the left:

- **Nodes** to ensure all of your nodes successfully joined the cluster
- **Databases** to ensure `insecurenodetest` is listed

{% include prometheus-callout.html %}

## Step 9. Use the database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the HAProxy server, not to a CockroachDB node.


## See Also

- [Google Cloud Platform GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
