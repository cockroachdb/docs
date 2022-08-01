---
title: Deploy CockroachDB on Digital Ocean (Insecure)
summary: Learn how to deploy a CockroachDB cluster on Digital Ocean.
toc: true
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-digital-ocean.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Digital Ocean, using Digital Ocean's managed load balancing service to distribute client traffic.

{{site.data.alerts.callout_danger}}If you plan to use CockroachDB in production, we strongly recommend using a secure cluster instead. Select <strong>Secure</strong> above for instructions.{{site.data.alerts.end}}


## Requirements

You must have [SSH access](https://www.digitalocean.com/community/tutorials/how-to-connect-to-your-droplet-with-ssh) to each Droplet with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

- If you plan to use CockroachDB in production, we recommend using a [secure cluster](deploy-cockroachdb-on-digital-ocean.html) instead. Using an insecure cluster comes with risks:
  - Your cluster is open to any client that can access any node's IP addresses.
  - Any user, even `root`, can log in without providing a password.
  - Any user, connecting as `root`, can read or write any data in your cluster.
  - There is no network encryption or authentication, and thus no confidentiality.

- For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

- Set up your Droplets using [private networking](https://docs.digitalocean.com/products/networking/vpc/how-to/create/).

- Decide how you want to access your Admin UI:
	- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
	- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.


## Step 1. Create Droplets

[Create Droplets with private networking](https://docs.digitalocean.com/products/networking/vpc/how-to/create/) for each node you plan to have in your cluster. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your Droplets for best performance.

## Step 2. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

Digital Ocean offers fully-managed load balancers to distribute traffic between Droplets.

1. [Create a Digital Ocean Load Balancer](https://www.digitalocean.com/community/tutorials/an-introduction-to-digitalocean-load-balancers). Be sure to:
	- Set forwarding rules to route TCP traffic from the load balancer's port **26257** to port **26257** on the node Droplets.
	- Configure health checks to use HTTP port **8080** and path `/health`.
2. Note the provisioned **IP Address** for the load balancer. You'll use this later to test load balancing and to connect your application to the cluster.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of Digital Ocean's managed load balancing, see <a href="manual-deployment-insecure.html">Manual Deployment</a> for guidance.{{site.data.alerts.end}}

## Step 3. Configure your network

Set up a firewall for each of your Droplets, allowing TCP communication on the following two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster), for applications to connect to the load balancer, and for routing from the load balancer to nodes
- **8080** (`tcp:8080`) for exposing your Admin UI

For guidance, you can use Digital Ocean's guide to configuring firewalls based on the Droplet's OS:

- Ubuntu and Debian can use [`ufw`](https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server).
- FreeBSD can use [`ipfw`](https://www.digitalocean.com/community/tutorials/recommended-steps-for-new-freebsd-10-1-servers).
- Fedora can use [`iptables`](https://www.digitalocean.com/community/tutorials/initial-setup-of-a-fedora-22-server).
- CoreOS can use [`iptables`](https://www.digitalocean.com/community/tutorials/how-to-secure-your-coreos-cluster-with-tls-ssl-and-firewall-rules).
- CentOS can use [`firewalld`](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-using-firewalld-on-centos-7).

## Step 4. Start the first node

1. SSH to your Droplet:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

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

3. Start a new CockroachDB cluster with a single node, which will communicate with other nodes on its internal IP address:

	~~~ shell
	$ cockroach start --insecure \
	--background \
	--advertise-host=<node1 internal IP address>
	~~~

## Step 5. Add nodes to the cluster

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

1. SSH to your Droplet:

	~~~
	$ ssh <username>@<additional node external IP address>
	~~~

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

3. Start a new node that joins the cluster using the first node's internal IP address:

	~~~ shell
	$ cockroach start --insecure \
	--background   \
	--advertise-host=<this node’s internal IP address>  \
	--join=<node1 internal IP address>:26257
	~~~

4. Repeat these steps for each Droplet you want to use as a node.

## Step 6. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. SSH to your first node:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2. Launch the built-in SQL client and create a database:

	~~~ shell
	$ cockroach sql --insecure
	~~~
	~~~ sql
	> CREATE DATABASE insecurenodetest;
	~~~

3. In another terminal window, SSH to another node:

	~~~ shell
	$ ssh <username>@<node2 external IP address>
	~~~

4. Launch the built-in SQL client:

	~~~ shell
	$ cockroach sql --insecure
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

## Step 7. Test load balancing

The Digital Ocean Load Balancer created in [step 2](#step-2-set-up-load-balancing) can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to the load balancer, which will then redirect the connection to a CockroachDB node.

To test this, install CockroachDB locally and use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if it's not there already.

2. Launch the built-in SQL client, with the `--host` flag set to the load balancer's IP address:

	~~~ shell
	$ cockroach sql --insecure \
	--host=<load balancer IP address> \
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

	As you can see, the load balancer redirected the query to one of the CockroachDB nodes.

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

## Step 8. Monitor the cluster

View your cluster's Admin UI by going to `http://<any node's external IP address>:8080`.

On this page, verify that the cluster is running as expected:

1. Click **View nodes list** on the right to ensure that all of your nodes successfully joined the cluster.

  Also check the **Replicas** column. If you have nodes with 0 replicas, it's possible you didn't properly set the `--advertise-host` flag to the Droplet's internal IP address. This prevents the node from receiving replicas and working as part of the cluster.

2. Click the **Databases** tab on the left to verify that `insecurenodetest` is listed.

{% include {{ page.version.version }}/misc/prometheus-callout.html %}

## Step 9. Use the database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the Digital Ocean Load Balancer, not to a CockroachDB node.

## See Also

- [Google Cloud GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
