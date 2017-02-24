---
title: Deploy CockroachDB on Microsoft Azure
summary: Learn how to deploy CockroachDB on Microsoft Azure.
toc: false
toc_not_nested: true
---

This page shows you how to manually deploy a multi-node CockroachDB cluster on Microsoft Azure.

If you plan to use CockroachDB in production, we recommend using a secure cluster *(documented on this page)*. However, if you are not concerned with protecting your data with SSL encryption, you can use the **Insecure** instructions below.

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="deploy-cockroachdb-on-microsoft-azure-insecure.html"><button class="filter-button"><strong>Insecure</strong></button></a>
</div><p></p>

<div id="toc"></div>

## Requirements

Locally, you must have [CockroachDB installed](install-cockroachdb.html), which you'll use to generate and manage your deployment's certificates.

In Azure, you must have [SSH access](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-linux-mac-create-ssh-keys) to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

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

[Create Linux VMs](https://docs.microsoft.com/en-us/azure/virtual-machines/virtual-machines-linux-quick-create-portal) for each node you plan to have in your cluster. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your VMs for best performance.

When creating the VMs, make sure to select the **Resource Group**, **Virtual Network**, and **Network Security Group** you created.

## Step 3. Generate Your Certificates

Locally, you'll need to [create the following certificates and keys](create-security-certificates.html):

- A certificate authority (CA) key pair (`ca.cert` and `ca.key`)
- A client key pair for the `root` user
- A node key pair for each node, issued to its IP addresses and any common names the machine uses

{{site.data.alerts.callout_success}}Before beginning, it's useful to collect each of your machine's internal and external IP addresses, as well as any server names you want to issue certificates for.{{site.data.alerts.end}}

1. Create a `certs` directory:

   ~~~ shell
   $ mkdir certs
   ~~~

2. Create the CA key pair:

   ~~~ shell
   $ cockroach cert create-ca \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key
   ~~~

4. Create a client key pair for the `root` user:

   ~~~ shell
   $ cockroach cert create-client \
   root \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key \
   --cert=certs/root.cert \
   --key=certs/root.key
   ~~~

3. For each node, create a node key pair issued for all common names you might use to refer to the node, including:

   - `<node internal IP address>` which is the VM's **Private IP address** (available on the VM's **Network Interface**).
   - `<node external IP address>` which is the VM's **Public IP address** (available on the VM's **Network Interface**).
   - `<node hostname>` which is the VM's **Name**.
   - `<other common names for node>` which include any domain names you point to the instance.
   - `localhost` and `127.0.0.1`

   ~~~ shell
   $ cockroach cert create-node \
   <node internal IP address> \
   <node external IP address> \
   <node hostname>  \
   <other common names for node> \
   localhost \
   127.0.0.1 \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key \
   --cert=certs/<node name>.cert \
   --key=certs/<node name>.key
   ~~~

4. Upload the certificates to each node:

   ~~~ shell
   # Create the certs directory:
   $ ssh <username>@<node external IP address> "mkdir certs"

   # Upload the CA certificate, client (root) certificate and key, and node certificate and key:
   $ scp certs/ca.cert \
   certs/root.cert \
   certs/root.key \
   certs/<node name>.cert \
   certs/<node name>.key \
   <username>@<node external IP address>:~/certs
   ~~~

## Step 4. Set up the First Node

1. 	SSH to your instance:

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

3. 	Start a new CockroachDB cluster with a single node, specifying the location of certificates and the address at which other nodes can reach it:
	
	~~~ shell
	$ cockroach start --background \
	--ca-cert=certs/ca.cert \
	--cert=certs/<node1 name>.cert \
	--key=certs/<node1 name>.key \
	--advertise-host=<node1 internal IP address>
	~~~

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

## Step 5. Set up Additional Nodes

1. 	SSH to your instance:

	~~~
	$ ssh <username>@<additional node external IP address>
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

3. 	Start a new node that joins the cluster using the first node's internal IP address:
	
	~~~ shell
	$ cockroach start --background  \
	--ca-cert=certs/ca.cert \
	--cert=certs/<node name>.cert \
	--key=certs/<node name>.key \
	--advertise-host=<node internal IP address> \
	--join=<node1 internal IP address>:26257
	~~~

Repeat these steps for each instance you want to use as a node.

## Step 6. Test Your Cluster

To test your distributed, multi-node cluster, access the built-in SQL client and create a new database. That database will then be accessible from all of the nodes in your cluster.

1. 	SSH to your first node:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2.	Launch the built-in SQL client and create a database:
	
	~~~ shell
	$ cockroach sql --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
	~~~
	{{site.data.alerts.callout_info}}When issuing <a href="cockroach-commands.html"><code>cockroach</code></a> commands on secure clusters, you must include flags for the <code>ca-cert</code>, as well as the client's <code>cert</code> and <code>key</code>.{{site.data.alerts.end}}
	~~~ sql
	> CREATE DATABASE securenodetest;
	~~~

3. 	In another terminal window, SSH to another node:

	~~~ shell
	$ ssh <username>@<node3 external IP address>
	~~~

4.	Launch the built-in SQL client:
	
	~~~ shell
	$ cockroach sql --ca-cert=certs/ca.cert --cert=certs/root.cert --key=certs/root.key
	~~~

5.	View the cluster's databases, which will include `securenodetest`:
	
	~~~ sql 
	> SHOW DATABASE;
	~~~
	~~~
	+----------------+
	|    DATABASE    |
	+----------------+
	| securenodetest |
	+----------------+
	~~~

## Step 7. View the Admin UI

View your cluster's Admin UI by going to `https://<any node's external IP address>:8080`.

{{site.data.alerts.callout_info}}Note that your browser will consider the CockroachDB-created certificate invalid; you’ll need to click through a warning message to get to the UI.{{site.data.alerts.end}}

On this page, go to the following tabs on the left:

- **Nodes** to ensure all of your nodes successfully joined the cluster.
- **Databases** to ensure `securenodetest` is listed.

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
