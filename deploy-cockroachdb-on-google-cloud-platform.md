---
title: Deploy CockroachDB on Google Cloud Platform GCE
summary: Learn how to deploy CockroachDB on Google Cloud Platform's Compute Engine.
toc: false
toc_not_nested: true
---

This page shows you how to manually deploy an insecure multi-node CockroachDB cluster on Google Cloud Platform's Compute Engine (GCE).

{{site.data.alerts.callout_danger}} This guide demonstrates how to deploy an <strong>insecure</strong> cluster, which we do not recommend for data in production. We'll update this page once we've improved the workflow for deploying secure clusters.{{site.data.alerts.end}}

<div id="toc"></div>

## Requirements

- You must have [SSH access](https://cloud.google.com/compute/docs/instances/connecting-to-instance) to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.
- Instances you host CockroachDB on must use a persistent SSD drive (**[Create Instance](https://cloud.google.com/compute/docs/instances/create-start-instance) > Boot disk > Change > Boot disk type > SSD persistent disk**).

## Recommendations

For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

You should also decide how you want to access your Admin UI:

- Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented here)*
- Using an SSH tunnel, which requires you to use `--http-addr=localhost` when starting your nodes

{{site.data.alerts.callout_success}}<a href="https://www.terraform.io/">Terraform</a> users can deploy CockroachDB using the <a href="https://github.com/cockroachdb/cockroach/blob/master/cloud/gce">configuration files and instructions in the our GitHub repo's <code>gce</code>directory</a>.{{site.data.alerts.end}}

## Configure Your Network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for nodes to join clusters and connect with applications
- **8080** (`tcp:8080`) to expose your Admin UI

To create firewalls rules allowing this communication, see [Google Cloud Platform: Using Networks and Firewalls](https://cloud.google.com/compute/docs/networking).

### Guidance

For inter-node communication, we recommend using your GCE instances' internal IP addresses, which allow communication with other GCE instances on port 26257 by default.

To expose your admin UI and accept data from your application, you'll need to create firewall rules in your GCE Network. For these rules, we recommend using GCE's **tag** feature, which lets you specify that you want to apply these firewall rules only to instance that include the same tag.

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

## Create Instances

[Create an instance](https://cloud.google.com/compute/docs/instances/create-start-instance) for each node you plan to have in your cluster. We typically recommend 3 or 5 to ensure survivability.

{{site.data.alerts.callout_danger}} Instances you host CockroachDB on must use a persistent SSD drive (<strong><a href="https://cloud.google.com/compute/docs/instances/create-start-instance">Create Instance</a> > Boot disk > Change > Boot disk type > SSD persistent disk</strong>).{{site.data.alerts.end}}

If you used a tag for your firewall rules, include it when you create the instance (**Management, disk, networking, SSH keys > Tags**).

## Set up the First Node

1. 	SSH to your instance:

	~~~
	ssh <username>@<node1 external IP address>
	~~~

2.	Install CockroachDB from our latest binary:
	
	~~~ shell
	wget https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.linux-amd64.tgz
	~~~
	
	~~~
	tar -xf cockroach-{{site.data.strings.version}}.linux-amd64.tgz  \
	--strip=1 cockroach-{{site.data.strings.version}}.linux-amd64/cockroach
	~~~
	
	~~~
	sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new CockroachDB cluster with a single node:
	
	~~~
	cockroach start --insecure --background
	~~~

## Set up Additional Nodes

1. 	SSH to your instance:

	~~~
	ssh <username>@<additional node external IP address>
	~~~

2.	Install CockroachDB from our latest binary:
	
	~~~ shell
	wget https://binaries.cockroachdb.com/cockroach-{{site.data.strings.version}}.linux-amd64.tgz
	~~~
	
	~~~
	tar -xf cockroach-{{site.data.strings.version}}.linux-amd64.tgz  \
	--strip=1 cockroach-{{site.data.strings.version}}.linux-amd64/cockroach
	~~~
	
	~~~
	sudo mv cockroach /usr/local/bin
	~~~

3. 	Start a new node that joins the cluster using the first node's internal IP address:
	
	~~~
	cockroach start --insecure --join=<node1 internal IP address>:26257 --background
	~~~

Repeat these steps for each instance you want to use as a node.

## Test Your Cluster

To test your cluster (which is live at this point), access SQL and create a new database. That database will then be accessible from all of the nodes in your cluster.

1. 	SSH to your first node:

	~~~
	ssh <username>@<node2 external IP address>
	~~~

2.	Launch the built-in SQL client and create a database:
	
	~~~
	cockroach sql
	~~~
	~~~ sql
	CREATE DATABASE insecurenodetest;
	~~~

3. 	SSH to another node:

	~~~
	ssh <username>@<node3 external IP address>
	~~~

4.	Launch the built-in SQL client:
	
	~~~
	cockroach sql
	~~~

5.	View the node's databases, which will include `insecurenodetest`:
	
	~~~
	SHOW DATABASES;
	+------------------+
	|     Database     |
	+------------------+
	| insecurenodetest |
	| system           |
	+------------------+
	~~~

## View the Admin UI

View your cluster's Admin UI by going to `http://<any node's external IP address>:8080`. 

On this page, go to the following tabs on the left:

- **Nodes** to ensure all of your nodes successfully joined the cluster
- **Databases** to ensure `insecurenodetest` is listed alongside `system`

## Using the Database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](grant.html).
3. [Connect your application](install-client-drivers.html).

## See Also

- [Manual Deployment](manual-deployment.html)
- [Start a Local Cluster](start-a-local-cluster.html)
