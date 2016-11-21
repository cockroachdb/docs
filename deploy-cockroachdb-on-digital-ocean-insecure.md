---
title: Deploy CockroachDB on Digital Ocean (Insecure)
summary: Learn how to deploy CockroachDB on Digital Ocean.
toc: false
toc_not_nested: true
---

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Digital Ocean.

If you plan to use CockroachDB in production, we recommend instead using the **Secure** instructions below.

<style>
.filters .scope-button {
  width: 20%;
  height: 65px;
  margin: 30px 15px 10px 0px;
}
.filters a:hover {
  border-bottom: none;
}
</style>

<div id="step-three-filters" class="filters clearfix">
  <a href="deploy-cockroachdb-on-digital-ocean.html"><button class="filter-button scope-button"><strong>Secure</strong></button>
  <button class="filter-button scope-button current"><strong>Insecure</strong></button></a>
</div><p></p>

<div id="toc"></div>

## Requirements

You must have [SSH access](https://www.digitalocean.com/community/tutorials/how-to-connect-to-your-droplet-with-ssh) to each Droplet with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

- Set up your Droplets using [private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking).
- Decide how you want to access your Admin UI:
	- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
	- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

## Step 1. Configure Your Network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and connecting with applications.
- **8080** (`tcp:8080`) for exposing your Admin UI.

To control access to these ports, you'll need to modify each of your Droplet's firewalls. For guidance, you can use Digital Ocean's guide to configuring firewalls based on the Droplet's OS:

- Ubuntu and Debian can use [`ufw`](https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server).
- FreeBSD can use [`ipfw`](https://www.digitalocean.com/community/tutorials/recommended-steps-for-new-freebsd-10-1-servers).
- Fedora can use [`iptables`](https://www.digitalocean.com/community/tutorials/initial-setup-of-a-fedora-22-server).
- CoreOS can use [`iptables`](https://www.digitalocean.com/community/tutorials/how-to-secure-your-coreos-cluster-with-tls-ssl-and-firewall-rules).
- CentOS can use [`firewalld`](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-using-firewalld-on-centos-7).

## Step 2. Create Droplets

[Create Droplets with private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking) for each node you plan to have in your cluster. We [recommend](https://www.cockroachlabs.com/docs/configure-replication-zones.html#nodereplica-recommendations):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your Droplet for best performance.

## Step 3. Set up the First Node

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

## Step 4. Set up Additional Nodes

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

## Step 5. Test Your Cluster

To test your distributed, multi-node cluster, access the built-in SQL client and create a new database. That database will then be accessible from all of the nodes in your cluster.

1. 	SSH to your first node:

	~~~ shell
	$ ssh <username>@<node2 external IP address>
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
	$ ssh <username>@<node3 external IP address>
	~~~

4.	Launch the built-in SQL client:
	
	~~~ shell
	$ cockroach sql
	~~~

5.	View the cluster's databases, which will include `insecurenodetest`:
	
	~~~ sql 
	> SHOW DATABASE;
	~~~
	~~~
	+------------------+
	|     DATABASE     |
	+------------------+
	| insecurenodetest |
	+------------------+
	~~~

## Step 6. View the Admin UI

View your cluster's Admin UI by going to `http://<any node's external IP address>:8080`. 

On this page, go to the following tabs on the left:

- **Nodes** to ensure all of your nodes successfully joined the cluster.<br/><br/>Also check the **Replicas** column on this page. If you have nodes with 0 replicas, it's possible you didn't properly set the `--advertise-host` flag to the Droplet's internal IP address. This prevents the node from receiving replicas and working as part of the cluster.
- **Databases** to ensure `insecurenodetest` is listed.

## Use the Database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Grant privileges to users](grant.html).
3. [Connect your application](install-client-drivers.html).

## See Also

- [Google Cloud GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
