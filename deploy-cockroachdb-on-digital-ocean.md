---
title: Deploy CockroachDB on Digital Ocean
summary: Learn how to deploy CockroachDB on Digital Ocean.
toc: false
toc_not_nested: true
---

This page shows you how to manually deploy a secure multi-node CockroachDB cluster on Digital Ocean.

If you plan to use CockroachDB in production, we recommend using a secure cluster *(documented on this page)*. However, if you are not concerned with protecting your data with SSL encryption, you can use the **Insecure** instructions below.

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="deploy-cockroachdb-on-digital-ocean-insecure.html"><button class="filter-button"><strong>Insecure</strong></button></a>
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

[Create Droplets with private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking) for each node you plan to have in your cluster. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your Droplets for best performance.

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

3. For each node, a create a node key pair issued for all common names you might use to refer to the node, including:

   - `<node internal IP address>` which is the Droplet's **Internal IP**.
   - `<node external IP address>` which is the Droplet's **External IP address**.
   - `<node hostname>` which is the Droplet's **Name**.
   - `<other common names for node>` which include any domain names you point to the Droplet.
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

1. 	SSH to your Droplet:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
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

1. 	SSH to your Droplet:

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

Repeat these steps for each Droplet you want to use as a node.

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
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html).

## See Also

- [Google Cloud GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
