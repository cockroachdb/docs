---
title: Connect to Your CockroachCloud Cluster
summary: Learn how to connect and start interacting with your cluster.
toc: true
redirect_from:
- ../v20.2/cockroachcloud-connect-to-your-cluster.html
---

<div class="filters clearfix">
    <a href="connect-to-a-free-cluster.html"><button class="filter-button page-level">CockroachCloud Free (beta)</button></a>
    <a href="connect-to-your-cluster.html"><button class="filter-button page-level current">CockroachCloud</button></a>
</div>

This page shows you how to connect to your CockroachCloud cluster.

## Step 1. Authorize your network

CockroachCloud requires you to authorize the networks that can access the cluster to prevent denial-of-service and brute force password attacks:

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.
- If you have a GCP cluster, you can set up and authorize [a VPC peered network](create-your-cluster.html#step-7-enable-vpc-peering-optional).
- If you have an AWS cluster, you can set up an [AWS PrivateLink](network-authorization.html#aws-privatelink) connection.

### Add IP addresses to the allowlist

1. Navigate to your cluster's **Networking > IP Allowlist** tab.

    The **IP Allowlist** tab displays a list of authorized networks (i.e., an IP network allowlist) that can access the cluster.

1. Check if the current network has been authorized. If not, proceed with the following steps.

1. Click the **Add Network** button.

    The **Add Network** dialog displays.

1. _(Optional)_ Enter a **Network name**.

1. From the **Network** dropdown, select:
   - **New Network** to authorize your local machine's network or application server's network. Enter the public IPv4 address of the machine in the **Network** field.
   - **Current Network** to auto-populate your local machine's IP address.
   - **Public (Insecure)** to allow all networks, use `0.0.0.0/0`. Use this with caution as your cluster will be vulnerable to denial-of-service and brute force password attacks.

    {{site.data.alerts.callout_info}}
    IPv6 addresses are currently not supported.
    {{site.data.alerts.end}}

    To add a range of IP addresses, use the CIDR (Classless Inter-Domain Routing) notation. The CIDR notation is constructed from an IP address (e.g., `192.168.15.161`), a slash (`/`), and a number (e.g., `32`). The number is the count of leading 1-bits in the network identifier. In the example above, the IP address is 32-bits and the number is `32`, so the full IP address is also the network identifier. For more information, see Digital Ocean's [Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).

1. Select whether the network can connect to the cluster's **DB Console to monitor the cluster**, **CockroachDB Client to access databases**, or both.

    The DB Console is where you can observe your cluster's health and performance. For more information, see [DB Console Overview](../{{site.versions["stable"]}}/ui-overview.html).

1. Click **Apply**.

### Establish VPC Peering or AWS PrivateLink
VPC peering is only available for GCP clusters, and AWS PrivateLink is only available for AWS clusters.

<div class="filters clearfix">
  <button class="filter-button" data-scope="gcp">VPC Peering</button>
  <button class="filter-button" data-scope="aws">AWS PrivateLink</button>
</div>

<section class="filter-content" markdown="1" data-scope="gcp">

<a name="vpc-peering"></a>

1. Navigate to your cluster's **Networking > VPC Peering** tab.
1. Click **Set up a VPC peering connection**.
1. On the **Request a VPC peering connection** modal, enter your [GCP Project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
1. Enter your [GCP VPC network name](https://cloud.google.com/vpc/docs/using-vpc#viewing-networks).
1. In the **Connection name** field, enter a descriptive name for the VPC connection.
1. Click **Request Connection**.
1. Run the command displayed on the **Accept VPC peering connection request** window using [Google Cloud Shell](https://cloud.google.com/shell) or using the [gcloud command-line tool](https://cloud.google.com/sdk/gcloud).
1. On the **Networking** page, verify the connection status is **Active**.

</section>

<section class="filter-content" markdown="1" data-scope="aws">

<a name="aws-privatelink"></a>

1. Navigate to your cluster's **Networking > PrivateLink** tab.
1. Click **Set up a PrivateLink connection**.
1. If you have a multi-region cluster, select the region to create a connection in. Skip this step if you have a single-region cluster.
1. Use the **Service Name** provided in the dialog to [create an AWS endpoint](network-authorization.html#create-an-aws-endpoint) in the AWS console.
1. Click **Next**.
1. Paste the Endpoint ID you created into the **VPC Endpoint ID** field.
1. Click **Verify** to verify the ID.
1. Click **Next** to continue to the third step.
1. Return to the AWS console to [enable private DNS](network-authorization.html#enable-private-dns).
1. Click **Complete**.
1. On the **Networking** page, verify the connection status is Available.

</section>

## Step 2. Create a SQL user

{% include cockroachcloud/create-a-sql-user.md %}

## Step 3. Select a connection method

1. In the top right corner of the Console, click the **Connect** button.

    The **Connect** dialog displays with **IP Allowlist** selected by default.

1.  Select a **Network Security** option:

      You can use the **IP Allowlist** option if you have already [added an IP address to your allowlist.](#add-ip-addresses-to-the-allowlist)

      For AWS clusters, you can select **AWS PrivateLink** if you have already [established a PrivateLink connection](#establish-vpc-peering-or-aws-privatelink).

      For GCP clusters, you can select **VPC Peering** if you have already:
    - [Enabled VPC peering while creating your cluster](create-your-cluster.html#step-7-enable-vpc-peering-optional)
    - [Established a VPC Peering connection](#establish-vpc-peering-or-aws-privatelink)

1. From the **User** dropdown, select the SQL user you created in [Step 2. Create a SQL user](#step-2-create-a-sql-user).
1. From the **Region** dropdown, select the region closest to where your client or application is running.
1. From the **Database** dropdown, select the database you want to connect to.

    The default database is `defaultdb`. For more information, see [Default databases](../{{site.versions["stable"]}}/show-databases.html#preloaded-databases).

1. Click **Next**.

1. Select a connection method (the instructions below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="command-line">Command line</button>
        <button class="filter-button page-level" data-scope="connection-string">Connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
    </div>
<p></p>

## Step 4. Connect to your cluster

<section class="filter-content" markdown="1" data-scope="command-line">

To connect to your cluster with the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html):

1. Click the name of the `<cluster_name>-ca.crt` to download the CA certificate to your local machine.

    Alternatively, you can set [`sslmode=require`](authentication.html#ssl-mode-settings). This is less secure than using a CA certificate and should not be used with sensitive data.

1. Create a `certs` directory on your local machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `<cluster_name>-ca.crt` file to the `certs` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /path/to/cc-ca.crt /path/to/certs
    ~~~

    For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /Users/maxroach/Downloads/<cluster_name>-ca.crt /Users/maxroach/certs
    ~~~    

1. If you have not done so already, [install the CockroachDB binary](../{{site.versions["stable"]}}/install-cockroachdb.html).
1. Copy the [`cockroach sql`](../{{site.versions["stable"]}}/cockroach-sql.html) command and connection string provided in the Console, which will be used in the next step (and to connect to your cluster in the future).
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html).

    Be sure to replace the `<your_certs_ directory>` placeholder with the path to the `certs` directory you created earlier.

1. Enter the SQL user's password and hit enter.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html).
</section>

<section class="filter-content" markdown="1" data-scope="connection-string">
To connect to your cluster with your application, use the connection string provided in the Console:

1. Click the name of the `<cluster_name>-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `<cluster_name>-ca.crt` file to the `certs` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /path/to/cc-ca.crt /path/to/certs
    ~~~

    For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /Users/maxroach/Downloads/<cluster_name>-ca.crt /Users/maxroach/certs
    ~~~    

1. Copy the connection string provided in the Console, which will be used to connect your application to CockroachCloud.
1. Add your copied connection string to your application code.

    Be sure to replace the `<your_certs_ directory>` placeholder with the path to the `certs` directory you created earlier.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

For examples, see the following:

- [Build a Python App with CockroachDB](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb.html)
- [Build a Go App with CockroachDB](../{{site.versions["stable"]}}/build-a-go-app-with-cockroachdb.html)
- [Build a Java App with CockroachDB](../{{site.versions["stable"]}}/build-a-java-app-with-cockroachdb.html)

</section>

<section class="filter-content" markdown="1" data-scope="connection-parameters">
To connect to your cluster with a [CockroachDB-compatible tool](../{{site.versions["stable"]}}/third-party-database-tools.html), use the connection parameters provided in the Console.
</section>

## What's next

- [Build a "Hello, World" app](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachCloud](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
