---
title: Deploy CockroachDB on Digital Ocean
summary: Learn how to deploy CockroachDB on Digital Ocean.
toc: false
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="deploy-cockroachdb-on-digital-ocean-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to manually deploy a secure multi-node CockroachDB cluster on Digital Ocean, using HAProxy to load balance client connections.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

<div id="toc"></div>

## Requirements

- Locally, you must have [CockroachDB installed](install-cockroachdb.html), which you’ll use to generate and manage your deployment’s certificates.

- In Digitial Ocean, you must have [SSH access](https://www.digitalocean.com/community/tutorials/how-to-connect-to-your-droplet-with-ssh) to each Droplet with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

- Set up your Droplets using [private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking).
- Decide how you want to access your Admin UI:
	- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
	- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

## Step 1. Configure your network

Set up a firewall for each of your Droplets, allowing TCP communication on the following two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and connecting with applications.
- **8080** (`tcp:8080`) for exposing your Admin UI.

For guidance, you can use Digital Ocean's guide to configuring firewalls based on the Droplet's OS:

- Ubuntu and Debian can use [`ufw`](https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server).
- FreeBSD can use [`ipfw`](https://www.digitalocean.com/community/tutorials/recommended-steps-for-new-freebsd-10-1-servers).
- Fedora can use [`iptables`](https://www.digitalocean.com/community/tutorials/initial-setup-of-a-fedora-22-server).
- CoreOS can use [`iptables`](https://www.digitalocean.com/community/tutorials/how-to-secure-your-coreos-cluster-with-tls-ssl-and-firewall-rules).
- CentOS can use [`firewalld`](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-using-firewalld-on-centos-7).

## Step 2. Create Droplets

[Create Droplets with private networking](https://www.digitalocean.com/community/tutorials/how-to-set-up-and-use-digitalocean-private-networking) for each node you plan to have in your cluster and a separate Droplet for HAProxy. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Running HAProxy on its own droplet. This ensures that when a CockroachDB node fails, HAProxy continues uninterrupted.
- Selecting the same continent for all of your Droplets for best performance.

## Step 3. Generate your certificates

Locally, you'll need to [create the following certificates and keys](create-security-certificates.html):

- A certificate authority (CA) key pair (`ca.cert` and `ca.key`)
- A client key pair for the `root` user
- A node key pair for each node, issued to its IP addresses and any common names the machine uses, as well as to the IP addresses and common names for the Droplet running HAProxy.

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

3. For each node, create a node key pair issued to all common names you might use to refer to the node as well as to the Droplet running HAProxy:

   - `<node internal IP address>`, which is the node Droplet's **Private IP**.
   - `<node external IP address>`, which is the node Droplet's **ipv4** address.
   - `<node hostname>`, which is the node Droplet's **Name**.
   - `<other common names for node>`, which include any domain names you point to the node Droplet.
   - `localhost` and `127.0.0.1`
   - `<haproxy internal IP address>`, which is the HAProxy Droplet's **Private IP**.
   - `<haproxy external IP address>`, which is the HAProxy Droplet's **ipv4** address.
   - `<haproxy hostname>`, which is the HAProxy Droplet's **Name**.
   - `<other common names for haproxy>`, which include any domain names you point to the HAProxy Droplet.

   ~~~ shell
   $ cockroach cert create-node \
   <node internal IP address> \
   <node external IP address> \
   <node hostname>  \
   <other common names for node> \
   localhost \
   127.0.0.1 \
   <haproxy internal IP address> \
   <haproxy external IP address> \
   <haproxy hostname>  \
   <other common names for haproxy> \
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

## Step 4. Set up the first node

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

## Step 5. Add nodes to the cluster

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

## Step 6. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to guarantee that each node can locate data across the cluster. To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. 	SSH to your first node:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2.	Launch the built-in SQL client and create a database:

	~~~ shell
	$ cockroach sql \
	--ca-cert=certs/ca.cert \
	--cert=certs/root.cert \
	--key=certs/root.key
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
	$ cockroach sql \
	--ca-cert=certs/ca.cert \
	--cert=certs/root.cert \
	--key=certs/root.key
	~~~

5.	View the cluster's databases, which will include `securenodetest`:

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

## Step 7. Set up a load balancer

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

## Step 8. Test your load balancer

Now that HAProxy is running, it can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to the HAProxy server, which will then redirect the connection to a CockroachDB node. To test this, launch the [built-in SQL client](use-the-built-in-sql-client.html) locally, pointing to the HAProxy server:

1.	On your local machine, launch the built-in SQL client, with the `--host` flag set to the external IP address of the HAProxy server and security flags pointing to the CA cert and the client cert and key:

	~~~ shell
	$ cockroach sql \
	--host=<haproxy external IP address> \
	--ca-cert=certs/ca.cert \
	--cert=certs/root.cert \
	--key=certs/root.key
	~~~

2.	View the cluster's databases:

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

## Step 9. Monitor the cluster

View your cluster's Admin UI by going to `https://<any node's external IP address>:8080`.

{{site.data.alerts.callout_info}}Note that your browser will consider the CockroachDB-created certificate invalid; you’ll need to click through a warning message to get to the UI.{{site.data.alerts.end}}

On this page, verify that the cluster is running as expected:

1. Click **View nodes list** on the right to ensure that all of your nodes successfully joined the cluster.

   Also check the **Replicas** column. If you have nodes with 0 replicas, it's possible you didn't properly set the `--advertise-host` flag to the Droplet's internal IP address. This prevents the node from receiving replicas and working as part of the cluster.

2. Click the **Databases** tab on the left to verify that `securenodetest` is listed.

{% include prometheus-callout.html %}

## Step 10. Use the database

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
