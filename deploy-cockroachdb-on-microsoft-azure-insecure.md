---
title: Deploy CockroachDB on Microsoft Azure (Insecure)
summary: Learn how to deploy CockroachDB on Microsoft Azure.
toc: false
toc_not_nested: true
---

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Microsoft Azure.

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
  <a href="deploy-cockroachdb-on-microsoft-azure.html"><button class="filter-button scope-button"><strong>Secure</strong></button>
  <button class="filter-button scope-button current"><strong>Insecure</strong></button></a>
</div><p></p>

<div id="toc"></div>

## Requirements

You must have [SSH access](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-linux-mac-create-ssh-keys) to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

Decide how you want to access your Admin UI:

- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

## Step 1. Configure Your Network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and connecting with applications
- **8080** (`tcp:8080`) for exposing your Admin UI

To enable this in Azure, you must create a Resource Group, Virtual Network, and Network Security Group.

1. [Create a Resource Group](https://azure.microsoft.com/en-us/updates/create-empty-resource-groups/).
2. [Create a Virtual Network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-create-vnet-arm-pportal) that uses your **Resource Group**.
3. [Create a Network Security Group](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-create-nsg-arm-pportal) that uses your **Resource Group**, and then add the following rules to it:
   
   - **Admin UI support**:

     | Field | Recommended Value |
     |-------|-------------------|
     | Name | **cockroachadmin** |
     | Priority | Any value > 1000 |
     | Source | **CIDR block** |
     | IP address range | Your local network’s IP ranges |
     | Service | **Custom** |
     | Protocol | **TCP** |
     | Port range | **8080** |
     | Action | **Allow** |

   - **Application support**:

     {{site.data.alerts.callout_success}}If your application is also hosted on the same Azure Virtual Network, you won't need to create a firewall rule for your application to communicate with your instances hosting CockroachDB.{{site.data.alerts.end}}

     | Field | Recommended Value |
     |-------|-------------------|
     | Name | **cockroachapp** |
     | Priority | Any value > 1000 |
     | Source | **CIDR block** |
     | IP address range | Your application’s IP ranges |
     | Service | **Custom** |
     | Protocol | **TCP** |
     | Port range | **26257** |
     | Action | **Allow** |

	To connect your application to CockroachDB, use a [PostgreSQL wire protocol driver](install-client-drivers.html).

## Step 2. Create VMs

[Create Linux VMs](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-linux-quick-create-portal) for each node you plan to have in your cluster. We [recommend](https://www.cockroachlabs.com/docs/configure-replication-zones.html#nodereplica-recommendations):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your VMs for best performance.

When creating the VMs, make sure to select the **Resource Group**, **Virtual Network**, and **Network Security Group** you created.

## Step 3. Set up the First Node

1. 	SSH to your VM:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2.	Install the latest CockroachDB binary:
	
	~~~ shell
	# Get the latest CockroachDB tarball.
	$ wget https://s3.amazonaws.com/binaries.cockroachdb.com/cockroach-latest.linux-amd64.tgz

	# Extract the binary.
	$ tar -xf cockroach-latest.linux-amd64.tgz  \
	--strip=1 cockroach-latest.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new CockroachDB cluster with a single node:
	
	~~~ shell
	$ cockroach start --insecure --background --advertise-host=<node1 internal IP address>
	~~~

	{{site.data.alerts.callout_info}}You can find the VM's internal IP address listed in the Resource Group's Virtual Network.{{site.data.alerts.end}}

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

## Step 4. Set up Additional Nodes

1. 	SSH to your VM:

	~~~
	$ ssh <username>@<additional node external IP address>
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
	$ cockroach start --insecure --background \
	--advertise-host=<node internal IP address> \
	--join=<node1 internal IP address>:26257
	~~~

Repeat these steps for each VM you want to use as a node.

## Step 5. Test Your Cluster

To test your distributed, multi-node cluster, access SQL and create a new database. That database will then be accessible from all of the nodes in your cluster.

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

- **Nodes** to ensure all of your nodes successfully joined the cluster
- **Databases** to ensure `insecurenodetest` is listed

{% include prometheus-callout.html %}

## Use the Database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Grant privileges to users](grant.html).
3. [Connect your application](install-client-drivers.html).

## See Also

- [GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
