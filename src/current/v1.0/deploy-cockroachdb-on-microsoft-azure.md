---
title: Deploy CockroachDB on Microsoft Azure
summary: Learn how to deploy CockroachDB on Microsoft Azure.
toc: true
toc_not_nested: true
---

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Secure</strong></button>
  <a href="deploy-cockroachdb-on-microsoft-azure-insecure.html"><button class="filter-button">Insecure</button></a>
</div>

This page shows you how to manually deploy a secure multi-node CockroachDB cluster on Microsoft Azure, using Azure's managed load balancing service to distribute client traffic.

If you are only testing CockroachDB, or you are not concerned with protecting network communication with TLS encryption, you can use an insecure cluster instead. Select **Insecure** above for instructions.


## Requirements

- Locally, you must have [CockroachDB installed](install-cockroachdb.html), which you'll use to generate and manage your deployment's certificates.

- In Azure, you must have SSH access to each machine with root or sudo privileges. This is necessary for distributing binaries and starting CockroachDB.

## Recommendations

- For guidance on cluster topology, clock synchronization, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

- Decide how you want to access your Admin UI:
  - Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
  - Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.

## Step 1. Configure your network

CockroachDB requires TCP communication on two ports:

- **26257** (`tcp:26257`) for inter-node communication (i.e., working as a cluster), for applications to connect to the load balancer, and for routing from the load balancer to nodes
- **8080** (`tcp:8080`) for exposing your Admin UI

To enable this in Azure, you must create a Resource Group, Virtual Network, and Network Security Group.

1. [Create a Resource Group](https://azure.microsoft.com/en-us/updates/create-empty-resource-groups/).
2. [Create a Virtual Network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-create-vnet-arm-pportal) that uses your **Resource Group**.
3. [Create a Network Security Group](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-create-nsg-arm-pportal) that uses your **Resource Group**, and then add the following **inbound** rules to it:
    - **Admin UI support**:

        | Field | Recommended Value |
        |-------|-------------------|
        | Name | **cockroachadmin** |
        | Source | **IP Addresses** |
        | Source IP addresses/CIDR ranges | Your local network’s IP ranges |
        | Source port ranges | * |
        | Destination | **Any** |
        | Destination port range | **8080** |
        | Protocol | **TCP** |
        | Action | **Allow** |
        | Priority | Any value > 1000 |
    - **Application support**:

        {{site.data.alerts.callout_success}}If your application is also hosted on the same Azure     Virtual Network, you will not need to create a firewall rule for your application to communicate     with your load balancer.{{site.data.alerts.end}}

        | Field | Recommended Value |
        |-------|-------------------|
        | Name | **cockroachapp** |
        | Source | **IP Addresses** |
        | Source IP addresses/CIDR ranges | Your local network’s IP ranges |
        | Source port ranges | * |
        | Destination | **Any** |
        | Destination port range | **26257** |
        | Protocol | **TCP** |
        | Action | **Allow** |
        | Priority | Any value > 1000 |
## Step 2. Create VMs

[Create Linux VMs](https://docs.microsoft.com/en-us/azure/virtual-machine-scale-sets/quick-create-portal) for each node you plan to have in your cluster. We [recommend](recommended-production-settings.html#cluster-topology):

- Running at least 3 nodes to ensure survivability.
- Selecting the same continent for all of your VMs for best performance.

When creating the VMs, make sure to select the **Resource Group**, **Virtual Network**, and **Network Security Group** you created.

## Step 3. Set up load balancing

Each CockroachDB node is an equally suitable SQL gateway to your cluster, but to ensure client performance and reliability, it's important to use load balancing:

- **Performance:** Load balancers spread client traffic across nodes. This prevents any one node from being overwhelmed by requests and improves overall cluster performance (queries per second).

- **Reliability:** Load balancers decouple client health from the health of a single CockroachDB node. In cases where a node fails, the load balancer redirects client traffic to available nodes.

Microsoft Azure offers fully-managed load balancing to distribute traffic between instances.

1.  [Add Azure load balancing](https://docs.microsoft.com/en-us/azure/load-balancer/load-balancer-overview). Be sure to:
  - Set forwarding rules to route TCP traffic from the load balancer's port **26257** to port **26257** on the node Droplets.
  - Configure health checks to use HTTP port **8080** and path `/health`.

2.  Note the provisioned **IP Address** for the load balancer. You'll use this later to test load balancing and to connect your application to the cluster.

{{site.data.alerts.callout_info}}If you would prefer to use HAProxy instead of Azure's managed load balancing, see <a href="manual-deployment.html">Manual Deployment</a> for guidance.{{site.data.alerts.end}}

## Step 4. Generate certificates

Locally, you'll need to [create the following certificates and keys](create-security-certificates.html):

- A certificate authority (CA) key pair (`ca.crt` and `ca.key`).
- A node key pair for each node, issued to its IP addresses and any common names the machine uses, as well as to the IP address provisioned for the Azure load balancer.
- A client key pair for the `root` user.

{{site.data.alerts.callout_success}}Before beginning, it's useful to collect each of your machine's internal and external IP addresses, as well as any server names you want to issue certificates for.{{site.data.alerts.end}}

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if you haven't already.

2. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll generate your CA certificate and all node and client certificates and keys in this directory and then upload some of the files to your nodes.
    - `my-safe-directory`: You'll generate your CA key in this directory and  then reference the key when generating node and client certificates. After that, you'll keep the key safe and secret; you will not upload it to your nodes.

3. Create the CA certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

4. Create the certificate and key for the first node, issued to all common names you might use to refer to the node as well as to addresses provisioned for the Azure load balancer:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    <node internal IP address> \
    <node external IP address> \
    <node hostname>  \
    <other common names for node> \
    localhost \
    127.0.0.1 \
    <load balancer IP address> \
    <load balancer hostname> \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~
    - `<node1 internal IP address>` which is the VM's **Private IP address** (available on the VM's **Network Interface**).
    - `<node1 external IP address>` which is the VM's **Public IP address** (available on the VM's **Network Interface**).
    - `<node1 hostname>` which is the VM's **Name**.
    - `<other common names for node1>` which include any domain names you point to the instance.
    - `localhost` and `127.0.0.1`
    - `<load balancer IP address>`
    - `<load balancer hostname>`

5. Upload certificates to the first node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node1 external IP address> "mkdir certs"

    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node1 external IP address>:~/certs
    ~~~

6. Delete the local copy of the node certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code> As an alternative to deleting these files, you can run the next <code>cockroach cert create-node</code> commands with the <code>--overwrite</code> flag.{{site.data.alerts.end}}

7. Create the certificate and key for the second node, issued to all common names you might use to refer to the node as well as to addresses provisioned for the Azure load balancer:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    <node2 internal IP address> \
    <node2 external IP address> \
    <node2 hostname>  \
    <other common names for node2> \
    localhost \
    127.0.0.1 \
    <load balancer IP address> \
    <load balancer hostname> \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

8. Upload certificates to the second node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Create the certs directory:
    $ ssh <username>@<node2 external IP address> "mkdir certs"
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Upload the CA certificate and node certificate and key:
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node2 external IP address>:~/certs
    ~~~

9. Repeat steps 6 - 8 for each additional node.

10. Create a client certificate and key for the `root` user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {{site.data.alerts.callout_success}}In later steps, you'll use the <code>root</code> user's certificate to run <a href="cockroach-commands.html"><code>cockroach</code></a> client commands from your local machine. If you might also want to run <code>cockroach</code> client commands directly on a node (e.g., for local debugging), you'll need to copy the <code>root</code> user's certificate and key to that node as well.{{site.data.alerts.end}}

## Step 5. Start the first node

1.  SSH to your instance:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ssh <username>@<node1 external IP address>
    ~~~

2. Install the latest CockroachDB binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Get the latest CockroachDB tarball.
    $ wget https://s3.amazonaws.com/binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Extract the binary.
    $ tar -xzf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
    --strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Move the binary.
    $ sudo mv cockroach /usr/local/bin/
    ~~~

3. Start a new CockroachDB cluster with a single node, specifying the location of certificates and the address at which other nodes can reach it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --background \
    --certs-dir=certs \
    --advertise-host=<node1 internal IP address>
    ~~~

## Step 6. Add nodes to the cluster

At this point, your cluster is live and operational but contains only a single node. Next, scale your cluster by setting up additional nodes that will join the cluster.

1.  SSH to your instance:

    {% include_cached copy-clipboard.html %}
    ~~~
    $ ssh <username>@<additional node external IP address>
    ~~~

2.  Install the latest CockroachDB binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Get the latest CockroachDB tarball.
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Extract the binary.
    $ tar -xzf cockroach-{{ page.release_info.version }}.linux-amd64.tgz  \
    --strip=1 cockroach-{{ page.release_info.version }}.linux-amd64/cockroach
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    # Move the binary.
    $ sudo mv cockroach /usr/local/bin/
    ~~~

3. Start a new node that joins the cluster using the first node's internal IP address:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --background \
    --certs-dir=certs \
    --advertise-host=<node internal IP address> \
    --join=<node1 internal IP address>:26257
    ~~~

4.  Repeat these steps for each instance you want to use as a node.

## Step 7. Test your cluster

CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client with the `--host` flag set to the external address of node 1 and security flags pointing to the CA cert and the client cert and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=<node1 external IP address>
    ~~~

2. Create a `securenodetest` database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE securenodetest;
    ~~~

3. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

4. Launch built-in SQL client with the `--host` flag set to the external address of node 2 and security flags pointing to the CA cert and the client cert and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=<node2 external IP address>
    ~~~

5. View the cluster's databases, which will include `securenodetest`:

    {% include_cached copy-clipboard.html %}
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

6. Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 8. Test load balancing

The Azure load balancer created in [step 3](#step-3-set-up-load-balancing) can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to the load balancer, which will then redirect the connection to a CockroachDB node.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1.  On your local machine, launch the built-in SQL client, with the `--host` flag set to the load balancer's IP address:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --certs-dir=certs \
    --host=<load balancer IP address>
    ~~~

2.  View the cluster's databases:

    {% include_cached copy-clipboard.html %}
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

3.  Check which node you were redirected to:

    {% include_cached copy-clipboard.html %}
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

4.  Use **CTRL-D**, **CTRL-C**, or `\q` to exit the SQL shell.

## Step 9. Monitor the cluster

View your cluster's Admin UI by going to `https://<any node's external IP address>:8080`.

{{site.data.alerts.callout_info}}Note that your browser will consider the CockroachDB-created certificate invalid; you’ll need to click through a warning message to get to the UI.{{site.data.alerts.end}}

On this page, verify that the cluster is running as expected:

1. Click **View nodes list** on the right to ensure that all of your nodes successfully joined the cluster.

2. Click the **Databases** tab on the left to verify that `securenodetest` is listed.

{% include {{ page.version.version }}/misc/prometheus-callout.html %}

## Step 10. Use the database

Now that your deployment is working, you can:

1. [Implement your data model](sql-statements.html).
2. [Create users](create-and-manage-users.html) and [grant them privileges](grant.html).
3. [Connect your application](install-client-drivers.html). Be sure to connect your application to the Azure load balancer, not to a CockroachDB node.

## See Also

- [GCE Deployment](deploy-cockroachdb-on-google-cloud-platform.html)
- [Digital Ocean Deployment](deploy-cockroachdb-on-digital-ocean.html)
- [AWS Deployment](deploy-cockroachdb-on-aws.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestration](orchestration.html)
