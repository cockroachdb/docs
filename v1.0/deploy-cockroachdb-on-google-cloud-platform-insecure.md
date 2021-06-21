---
title: Deploy CockroachDB on Google Cloud Platform GCE (Insecure)
summary: Learn how to deploy CockroachDB on Google Cloud Platform's Compute Engine.
toc: true
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <a href="deploy-cockroachdb-on-google-cloud-platform.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Google Cloud Platform's Compute Engine (GCE), using Google's TCP Proxy Load Balancing service to distribute client traffic.

{{site.data.alerts.callout_danger}}If you plan to use CockroachDB in production, we strongly recommend using a secure cluster instead. Select <strong>Secure</strong> above for instructions.{{site.data.alerts.end}}


## Requirements

You must have [SSH access](https://cloud.google.com/compute/docs/instances/connecting-to-instance) to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

- If you plan to use CockroachDB in production, we recommend using a [secure cluster](deploy-cockroachdb-on-google-cloud-platform.html) instead. Using an insecure cluster comes with risks:
  - Your cluster is open to any client that can access any node's IP addresses.
  - Any user, even `root`, can log in without providing a password.
  - Any user, connecting as `root`, can read or write any data in your cluster.
  - There is no network encryption or authentication, and thus no confidentiality.

- For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

- Decide how you want to access your Admin UI:
  - Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
  - Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster)
- **8080** (`tcp:8080`) for exposing your Admin UI

Inter-node communication works by default using your GCE instances' internal IP addresses, which allow communication with other instances on CockroachDB's default port `26257`. However, to expose your admin UI and allow traffic from the TCP proxy load balancer and health checker to your instances, you need to [create firewall rules for your project](https://cloud.google.com/compute/docs/vpc/firewalls).

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

Applications will not connect directly to your CockroachDB nodes. Instead, they'll connect to GCE's TCP Proxy Load Balancing service, which automatically routes traffic to the instances that are closest to the user. Because this service is implemented at the edge of the Google Cloud, you'll need to create a firewall rule to allow traffic from the load balancer and health checker to your instances. This is covered in [Step 3](#step-3-set-up-tcp-proxy-load-balancing).

{{site.data.alerts.callout_danger}}When using TCP Proxy Load Balancing, you cannot use firewall rules to control access to the load balancer. If you need such control, consider using <a href="https://cloud.google.com/compute/docs/load-balancing/network/">Network TCP Load Balancing</a> instead, but note that it cannot be used across regions. You might also consider using the HAProxy load balancer (see <a href="manual-deployment-insecure.html">Manual Deployment</a> for guidance).{{site.data.alerts.end}}

## Step 2. Create instances

[Create an instance](https://cloud.google.com/compute/docs/instances/create-start-instance) for each node you plan to have in your cluster. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your instances for best performance.

If you used a tag for your firewall rules, when you create the instance, select **Management, disk, networking, SSH keys**. Then on the **Networking** tab, in the **Network tags** field, enter **cockroachdb**.

## Step 3. Set up TCP Proxy Load Balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

GCE offers fully-managed [TCP Proxy Load Balancing](https://cloud.google.com/load-balancing/docs/tcp/). This service lets you use a single IP address for all users around the world, automatically routing traffic to the instances that are closest to the user.

{{site.data.alerts.callout_danger}}When using TCP Proxy Load Balancing, you cannot use firewall rules to control access to the load balancer. If you need such control, consider using <a href="https://cloud.google.com/compute/docs/load-balancing/network/">Network TCP Load Balancing</a> instead, but note that it cannot be used across regions. You might also consider using the HAProxy load balancer (see <a href="manual-deployment-insecure.html">Manual Deployment</a> for guidance).{{site.data.alerts.end}}

To use GCE's TCP Proxy Load Balancing service:

1. For each zone in which you're running an instance, [create a distinct instance group](https://cloud.google.com/compute/docs/instance-groups/creating-groups-of-unmanaged-instances).
    - To ensure that the load balancer knows where to direct traffic, specify a port name mapping, with `tcp26257` as the **Port name** and `26257` as the **Port number**.
2. [Add the relevant instances to each instance group](https://cloud.google.com/compute/docs/instance-groups/creating-groups-of-unmanaged-instances#addinstances).
3. [Configure TCP Proxy Load Balancing](https://cloud.google.com/load-balancing/docs/tcp/setting-up-tcp#configure_load_balancer).
    - During backend configuration, create a health check, setting the **Protocol** to `HTTP`, the **Port** to `8080`, and the **Request path** to `/health`. If you want to maintain long-lived SQL connections that may be idle for more than tens of seconds, increase the backend timeout setting accordingly.
    - During frontend configuration, reserve a static IP address and choose a port. Note this address/port combination, as you'll use it for all of you client connections.
4. [Create a firewall rule](https://cloud.google.com/load-balancing/docs/tcp/setting-up-tcp#config-hc-firewall) to allow traffic from the load balancer and health checker to your instances. This is necessary because TCP Proxy Load Balancing is implemented at the edge of the Google Cloud.
    - Be sure to set **Source IP ranges** to `130.211.0.0/22` and `35.191.0.0/16` and set **Target tags** to `cockroachdb` (not to the value specified in the linked instructions).

## Step 4. Start the first node

1. SSH to your instance:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2. Install the latest CockroachDB binary:

	~~~ shell
	# Get the latest CockroachDB tarball.
	$ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz

	# Extract the binary.
	$ tar -xzf cockroach-{{page.release_info.version}}.linux-amd64.tgz  \
	--strip=1 cockroach-{{page.release_info.version}}.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin/
	~~~

3. Start a new CockroachDB cluster with a single node:

	~~~ shell
	$ cockroach start --insecure \
	--background
	~~~

## Step 5. Add nodes to the cluster

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

1. SSH to your instance:

	~~~
	$ ssh <username>@<additional node external IP address>
	~~~

2. Install CockroachDB from our latest binary:

	~~~ shell
	# Get the latest CockroachDB tarball.
	$ curl https://binaries.cockroachdb.com/cockroach-{{page.release_info.version}}.linux-amd64.tgz

	# Extract the binary.
	$ tar -xzf cockroach-{{page.release_info.version}}.linux-amd64.tgz  \
	--strip=1 cockroach-{{page.release_info.version}}.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin/
	~~~

3. Start a new node that joins the cluster using the first node's internal IP address:

	~~~ shell
	$ cockroach start --insecure \
	--background \
	--join=<node1 internal IP address>:26257
	~~~

4. Repeat these steps for each instance you want to use as a node.

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
	$ ssh <username>@<node3 external IP address>
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

The GCE load balancer created in [step 3](#step-3-set-up-tcp-proxy-load-balancing) can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients connect to the load balancer, which will then redirect the connection to a CockroachDB node.

To test this, install CockroachDB locally and use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if it's not there already.

2. Launch the built-in SQL client, with the `--host` flag set to the load balancer's IP address:

	~~~ shell
	$ cockroach sql --insecure \
	--host=<load balancer IP address> \
	--port=<load balancer port>
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
	|       1 |
	+---------+
	(1 row)
	~~~

5. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 8. Monitor the cluster

View your cluster's Admin UI by going to `http://<any node's external IP address>:8080`.

On this page, verify that the cluster is running as expected:

1. Click **View nodes list** on the right to ensure that all of your nodes successfully joined the cluster.

2. Click the **Databases** tab on the left to verify that `insecurenodetest` is listed.

{% include {{ page.version.version }}/misc/prometheus-callout.html %}

## Step 9. Use the database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the GCE load balancer, not to a CockroachDB node.

## See Also

- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Azure Deployment](deploy-cockroachdb-on-microsoft-azure.html)
- [Manual Deployment](manual-deployment.html)
- [Start a Local Cluster](start-a-local-cluster.html)
