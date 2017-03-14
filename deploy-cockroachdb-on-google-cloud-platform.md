---
title: Deploy CockroachDB on Google Cloud Platform GCE
summary: Learn how to deploy CockroachDB on Google Cloud Platform's Compute Engine.
toc: false
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="deploy-cockroachdb-on-google-cloud-platform-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to manually deploy a secure multi-node CockroachDB cluster on Google Cloud Platform's Compute Engine (GCE), using Google's managed load balancing service to distribute client traffic.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.

<div id="toc"></div>

## Requirements

- Locally, you must have [CockroachDB installed](install-cockroachdb.html), which you'll use to generate and manage your deployment's certificates.

- In GCE, you must have [SSH access](https://cloud.google.com/compute/docs/instances/connecting-to-instance) to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

Decide how you want to access your Admin UI:

- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

{{site.data.alerts.callout_success}}<strong><a href="https://www.terraform.io/">Terraform</a></strong> users can deploy CockroachDB using the <a href="https://github.com/cockroachdb/cockroach/blob/master/cloud/gce">configuration files and instructions in the our GitHub repo's <code>gce</code>directory</a>.{{site.data.alerts.end}}

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster), for applications to connect to the load balancer, and for routing from the load balancer to nodes
- **8080** (`tcp:8080`) for exposing your Admin UI

Inter-node and load balancer-node communication works by default using your GCE instances' internal IP addresses, which allow communication with other instances on CockroachDB's default port `26257`. However, to accept data from applications external to GCE and expose your admin UI, you need to [create firewall rules for your project](https://cloud.google.com/compute/docs/networking).

### Creating Firewall Rules

When creating firewall rules, we recommend using Google Cloud Platform's **tag** feature, which lets you specify that you want to apply the rule only to instance that include the same tag.

#### Admin UI

| Field | Recommended Value |
|-------|-------------------|
| Name | **cockroachadmin** |
| Source filter | IP ranges |
| Source IP ranges | Your local network's IP ranges |
| Allowed protocols... | **tcp:8080** |
| Target tags | **cockroachdb** |

#### Application Data

{{site.data.alerts.callout_success}}If your application is also hosted on GCE, you won't need to create a firewall rule for your application to communicate with your load balancer.{{site.data.alerts.end}}

| Field | Recommended Value |
|-------|-------------------|
| Name | **cockroachapp** |
| Source filter | IP ranges |
| Source IP ranges | Your application's IP ranges |
| Allowed protocols... | **tcp:26257** |
| Target tags | **cockroachdb** |

## Step 2. Create instances

[Create an instance](https://cloud.google.com/compute/docs/instances/create-start-instance) for each node you plan to have in your cluster. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your instances for best performance.

If you used a tag for your firewall rules, when you create the instance, select **Management, disk, networking, SSH keys**. Then on the **Management** tab, in the **Tags** field, enter **cockroachdb**.

## Step 3. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use TCP load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

GCE offers fully-managed load balancing to distribute traffic between instances.

1. 	[Add GCE load balancing](https://cloud.google.com/compute/docs/load-balancing/?hl=en_US). Be sure to:
	- Set forwarding rules to route TCP traffic from the load balancer's port **26257** to port **26257** on the node Droplets.
	- Configure health checks to use HTTP port **8080** and path `/health`.
2. 	Note the provisioned **IP Address** for the load balancer. You'll use this later to test load balancing and to connect your application to the cluster.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of GCE's managed load balancing, see <a href="manual-deployment.html">Manual Deployment</a> for guidance.{{site.data.alerts.end}}

## Step 4. Generate certificates

Locally, you'll need to [create the following certificates and keys](create-security-certificates.html):

- A certificate authority (CA) key pair (`ca.cert` and `ca.key`)
- A client key pair for the `root` user
- A node key pair for each node, issued to its IP addresses and any common names the machine uses, as well as to the IP address provisioned for the GCE load balancer

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

3. Create a client key pair for the `root` user:

   ~~~ shell
   $ cockroach cert create-client \
   root \
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key \
   --cert=certs/root.cert \
   --key=certs/root.key
   ~~~

4. For each node, a create a node key pair issued for all common names you might use to refer to the node, including:

   - `<node internal IP address>` which is the instance's **Internal IP**.
   - `<node external IP address>` which is the instance's **External IP address**.
   - `<node hostname>` which is the instance's **Name**.
   - `<other common names for node>` which include any domain names you point to the instance.
   - `localhost` and `127.0.0.1`
   - `<load balancer IP address>`
   - `<load balancer hostname>`

   ~~~ shell
   $ cockroach cert create-node \
   <node internal IP address> \
   <node external IP address> \
   <node hostname>  \
   <other common names for node> \
   localhost \
   127.0.0.1 \
   <load balancer IP address>
   <load balancer hostname>
   --ca-cert=certs/ca.cert \
   --ca-key=certs/ca.key \
   --cert=certs/<node name>.cert \
   --key=certs/<node name>.key
   ~~~

5. Upload the certificates to each node:

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

## Step 5. Start the first node

1. 	SSH to your instance:

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
	~~~

## Step 6. Add nodes to the cluster

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

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
	--join=<node1 internal IP address>:26257
	~~~

4.	Repeat these steps for each instance you want to use as a node.

## Step 7. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

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

6.	Use **CTRL + D**, **CTRL + C**, or `\q` to exit the SQL shell.

## Step 8. Test load balancing

The GCE load balancer created in [step 3](#step-3-set-up-load-balancing) can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to the load balancer, which will then redirect the connection to a CockroachDB node.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1.	On your local machine, launch the built-in SQL client, with the `--host` flag set to the load balancer's IP address and security flags pointing to the CA cert and the client cert and key:

	~~~ shell
	$ cockroach sql \
	--host=<load balancer IP address> \
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
	| securenodetest     |
	| pg_catalog         |
	| system             |
	+--------------------+
	(5 rows)
	~~~

	As you can see, the load balancer redirected the query to one of the CockroachDB nodes.

3. 	Check which node you were redirected to:

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

4.	Use **CTRL + D**, **CTRL + C**, or `\q` to exit the SQL shell.

## Step 9. Monitor the cluster

View your cluster's Admin UI by going to `https://<any node's external IP address>:8080`.

{{site.data.alerts.callout_info}}Note that your browser will consider the CockroachDB-created certificate invalid; you’ll need to click through a warning message to get to the UI.{{site.data.alerts.end}}

On this page, verify that the cluster is running as expected:

1. Click **View nodes list** on the right to ensure that all of your nodes successfully joined the cluster.

2. Click the **Databases** tab on the left to verify that `securenodetest` is listed.

{% include prometheus-callout.html %}

## Step 10. Use the database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the GCE load balancer, not to a CockroachDB node.

## See Also

- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
- [Start a Local Cluster](start-a-local-cluster.html)
