---
title: Connect to Your CockroachDB Cloud Cluster
summary: Learn how to connect and start interacting with your cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/crdb-cloud-connection.md %}

This page shows you how to connect to your {{ site.data.products.dedicated }} cluster.

## Before you start

- [Create a cluster](create-your-cluster.html).
- [Create a SQL user](user-authorization.html#create-a-sql-user).

## Step 1. Authorize your network

{{ site.data.products.dedicated }} requires you to authorize the networks that can access the cluster to prevent denial-of-service and brute force password attacks:

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.
- If you have a GCP cluster, you can set up and authorize [a VPC peered network](create-your-cluster.html#step-7-enable-vpc-peering-optional).
- If you have an AWS cluster, you can set up an [AWS PrivateLink](network-authorization.html#aws-privatelink) connection.
- You should use PrivateLink or VPC peering if you need to allowlist more than 20 IP addresses, if your servers’ IP addresses are not static, or if you want to limit your cluster's exposure to the public internet.

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
1. On the **Networking** page, verify the connection status is **Available**.

</section>

## Step 2. Select a connection method

1. In the top right corner of the Console, click the **Connect** button.

    The **Connect** dialog displays with **IP Allowlist** selected by default.

1.  Select a **Network Security** option:

      You can use the **IP Allowlist** option if you have already [added an IP address to your allowlist.](#add-ip-addresses-to-the-allowlist)

      For AWS clusters, you can select **AWS PrivateLink** if you have already [established a PrivateLink connection](#establish-vpc-peering-or-aws-privatelink).

      For GCP clusters, you can select **VPC Peering** if you have already:
    - [Enabled VPC peering while creating your cluster](create-your-cluster.html#step-7-enable-vpc-peering-optional)
    - [Established a VPC Peering connection](#establish-vpc-peering-or-aws-privatelink)

1. From the **User** dropdown, select the SQL user you created.
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

## Step 3. Connect to your cluster

  <section class="filter-content" markdown="1" data-scope="command-line">

To connect to your cluster with the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html):

1. Select **Mac**, **Linux**, or **Windows** to adjust the commands used in the next steps accordingly.

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="mac">Mac</button>
        <button class="filter-button page-level" data-scope="linux">Linux</button>
        <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

1. If you have not done so already, run the first command in the dialog to install the CockroachDB binary and copy it into the `PATH`:

    {% include cockroachcloud/download-the-binary.md %}

1. In your terminal, run the second command from the dialog to create a new `certs` directory on your local machine and download the CA certificate to that directory:

    {% include cockroachcloud/download-the-cert.md %}

1. Copy the [`cockroach sql`](../{{site.versions["stable"]}}/cockroach-sql.html) command and connection string provided in the Console, which will be used in the next step (and to connect to your cluster in the future):

    {% include cockroachcloud/sql-connection-string.md %}

1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html).

1. Enter the SQL user's password and hit enter.

    {% include cockroachcloud/postgresql-special-characters.md %}

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html).

  </section>

  <section class="filter-content" markdown="1" data-scope="connection-string">

To connect to your cluster with your application, use the connection string provided in the Console:

1. Select **Mac**, **Linux**, or **Windows** to adjust the commands used in the next steps accordingly.

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="mac">Mac</button>
        <button class="filter-button page-level" data-scope="linux">Linux</button>
        <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

1. In your terminal, run the first command from the dialog to create a new `certs` directory on your local machine and download the CA certificate to that directory:

    {% include cockroachcloud/download-the-cert.md %}

1. Copy the connection string provided in the Console, which will be used to connect your application to {{ site.data.products.db }}:

    <section class="filter-content" markdown="1" data-scope="mac">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    'postgresql://<user>@<cluster-name>-<short-id>.<region>.<host>:26257/<database>?sslmode=verify-full&sslrootcert='$HOME'/Library/CockroachCloud/certs/<cluster-name>-ca.crt'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    'postgresql://<user>@<cluster-name>-<short-id>.<region>.<host>:26257/<database>?sslmode=verify-full&sslrootcert='$HOME'/Library/CockroachCloud/certs/<cluster-name>-ca.crt'
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="windows">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    "postgresql://<user>@<cluster-name>-<short-id>.<region>.<host>:26257/<database>?sslmode=verify-full&sslrootcert=$env:appdata\CockroachCloud\certs\$<cluster-name>-ca.crt"
    ~~~

    </section>

1. Add your copied connection string to your application code.

    {% include cockroachcloud/postgresql-special-characters.md %}

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
- [Deploy a Python To-Do App with Flask, Kubernetes, and {{ site.data.products.db }}](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
