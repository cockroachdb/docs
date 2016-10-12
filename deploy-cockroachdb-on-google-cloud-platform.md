---
title: Deploy CockroachDB on Google Cloud Platform GCE
summary: Learn how to deploy CockroachDB on Google Cloud Platform's Compute Engine.
toc: false
toc_not_nested: true
---

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Google Cloud Platform's Compute Engine (GCE).

{{site.data.alerts.callout_danger}} This guide demonstrates how to deploy an <strong>insecure</strong> cluster, which we do not recommend for data in production. We'll update this page after improving the process to deploy secure clusters.{{site.data.alerts.end}}

<div id="toc"></div>

## Requirements

You must have [SSH access](https://cloud.google.com/compute/docs/instances/connecting-to-instance) to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

Decide how you want to access your Admin UI:

- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented here)*
- Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

{{site.data.alerts.callout_success}}<strong><a href="https://www.terraform.io/">Terraform</a></strong> users can deploy CockroachDB using the <a href="https://github.com/cockroachdb/cockroach/blob/master/cloud/gce">configuration files and instructions in the our GitHub repo's <code>gce</code>directory</a>.{{site.data.alerts.end}}

## Step 1. Configure Your Network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster) and connecting with applications
- **8080** (`tcp:8080`) for exposing your Admin UI

Inter-node communication works by default using your GCE instances' internal IP addresses, which allow communication with other instances on CockroachDB's default port 26257. However, to accept data from applications external to GCE and expose your admin UI you need to [create firewall rules for your project](https://cloud.google.com/compute/docs/networking).

### Guidance

When creating firewall rules, we recommend using Google Cloud Platform's **tag** feature, which lets you specify that you want to apply the rule only to instance that include the same tag.

#### Admin UI

| Field | Recommended Value |
|-------|-------------------|
| Name | **cockroachadmin** |
| Source filter | IP ranges |
| Source IP ranges | Your network's IP ranges |
| Allowed protocols... | **tcp:8080** |
| Target tags | **cockroachdb** |

#### Application Data

| Field | Recommended Value |
|-------|-------------------|
| Name | **cockroachapp** |
| Source filter | IP ranges |
| Source IP ranges | Your application's IP ranges |
| Allowed protocols... | **tcp:26257** |
| Target tags | **cockroachdb** |

To connect your application to CockroachDB, use a [PostgreSQL wire protocol driver](install-client-drivers.html).

## Step 2. Create Instances

[Create an instance](https://cloud.google.com/compute/docs/instances/create-start-instance) for each node you plan to have in your cluster. We [recommend](https://www.cockroachlabs.com/docs/configure-replication-zones.html#nodereplica-recommendations):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your instances for best performance.

If you used a tag for your firewall rules, when you create the instance, select **Management, disk, networking, SSH keys**. Then on the **Management** tab, in the **Tags** field, enter **cockroachdb**.

## Step 3. Set up the First Node

1. 	SSH to your instance:

	~~~ shell
	$ ssh <username>@<node1 external IP address>
	~~~

2.	Install CockroachDB from our latest binary:
	
	~~~ shell
	# Get the latest CockroachDB tarball.
	$ wget https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.linux-amd64.tgz

	# Extract the binary.
	$ tar -xf cockroach-{{site.data.strings.version}}.linux-amd64.tgz  \
	--strip=1 cockroach-{{site.data.strings.version}}.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new CockroachDB cluster with a single node:
	
	~~~ shell
	$ cockroach start --insecure --background
	~~~

## Step 4. Set up Additional Nodes

1. 	SSH to your instance:

	~~~
	$ ssh <username>@<additional node external IP address>
	~~~

2.	Install CockroachDB from our latest binary:
	
	~~~ shell
	# Get the latest CockroachDB tarball.
	$ wget https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.linux-amd64.tgz

	# Extract the binary.
	$ tar -xf cockroach-{{site.data.strings.version}}.linux-amd64.tgz  \
	--strip=1 cockroach-{{site.data.strings.version}}.linux-amd64/cockroach

	# Move the binary.
	$ sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new node that joins the cluster using the first node's internal IP address:
	
	~~~ shell
	$ cockroach start --insecure --background --join=<node1 internal IP address>:26257
	~~~

Repeat these steps for each instance you want to use as a node.

## Step 5. Test Your Cluster

To test your cluster (which is live at this point), access SQL and create a new database. That database will then be accessible from all of the nodes in your cluster.

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

## Use the Database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Grant privileges to users](grant.html).
3. [Connect your application](install-client-drivers.html).

## See Also

- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Manual Deployment](manual-deployment.html)
- [Start a Local Cluster](start-a-local-cluster.html)
