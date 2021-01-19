---
title: Connect to Your CockroachCloud Cluster
summary: Learn how to connect and start interacting with your cluster.
toc: true
redirect_from:
- ../stable/cockroachcloud-connect-to-your-cluster.html
---

<div class="filters clearfix">
    <a href="connect-to-your-cluster.html"><button class="filter-button page-level current"><strong>CockroachCloud</strong></button></a>
    <a href="connect-to-a-free-cluster.html"><button class="filter-button page-level"><strong>CockroachCloud Free (beta)</strong></button></a>
</div>
<p></p>
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

<<<<<<< HEAD
1. Click the **Add Network** button.
=======
1. Click the **Add Network** button in the top right corner.
>>>>>>> 70078d22c (formatting and style edits)

    The **Add Network** dialog displays.

1. _(Optional)_ Enter a **Network name**.

<<<<<<< HEAD
=======
1. (Optional) Enter a descriptive name for the network.

>>>>>>> 70078d22c (formatting and style edits)
1. From the **Network** dropdown, select:
   - **New Network** to authorize your local machine's network or application server's network. Enter the public IPv4 address of the machine in the **Network** field.
   - **Current Network** to auto-populate your local machine's IP address.
   - **Public (Insecure)** to allow all networks, use `0.0.0.0/0`. Use this with caution as your cluster will be vulnerable to denial-of-service and brute force password attacks.

    {{site.data.alerts.callout_info}}
    IPv6 addresses are currently not supported.
    {{site.data.alerts.end}}

    To add a range of IP addresses, use the CIDR (Classless Inter-Domain Routing) notation. The CIDR notation is constructed from an IP address (e.g., `192.168.15.161`), a slash (`/`), and a number (e.g., `32`). The number is the count of leading 1-bits in the network identifier. In the example above, the IP address is 32-bits and the number is `32`, so the full IP address is also the network identifier. For more information, see Digital Ocean's [Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).

<<<<<<< HEAD
1. Select whether the network can connect to the cluster's **DB Console to monitor the cluster**, **CockroachDB Client to access databases**, or both.
=======
1. Select whether the network can connect to the cluster's **UI**, **SQL** client, or both.
>>>>>>> 70078d22c (formatting and style edits)

    The DB Console is where you can observe your cluster's health and performance. For more information, see [DB Console Overview](../stable/ui-overview.html).

1. Click **Apply**.

### Establish VPC Peering or AWS PrivateLink
VPC peering is only available for GCP clusters, and AWS PrivateLink is only available for AWS clusters.

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="gcp">VPC Peering</button>
  <button style="width: 15%" class="filter-button" data-scope="aws">AWS PrivateLink</button>
</div>

<section class="filter-content" markdown="1" data-scope="gcp">

<a name="vpc-peering"></a>

<<<<<<< HEAD
1. Navigate to your cluster's **Networking > VPC Peering** tab.
1. Click **Set up a VPC peering connection**.
1. On the **Request a VPC peering connection** modal, enter your [GCP Project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
1. Enter your [GCP VPC network name](https://cloud.google.com/vpc/docs/using-vpc#viewing-networks).
1. In the **Connection name** field, enter a descriptive name for the VPC connection.
=======
1. Navigate to your cluster's **Networking** page
1. Click **Peering**.
1. Click **Set up a VPC peering connection**.
1. On the **Request a VPC peering connection** window, enter your [GCP Project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects) and [GCP VPC network name](https://cloud.google.com/vpc/docs/using-vpc#viewing-networks). In the **Connection name** field, enter a descriptive name for the VPC connection.
>>>>>>> 70078d22c (formatting and style edits)
1. Click **Request Connection**.
1. Run the command displayed on the **Accept VPC peering connection request** window using [Google Cloud Shell](https://cloud.google.com/shell) or using the [gcloud command-line tool](https://cloud.google.com/sdk/gcloud).
1. On the **Networking** page, verify the connection status is **Active**.

</section>

<section class="filter-content" markdown="1" data-scope="aws">

<a name="aws-privatelink"></a>

1. Navigate to your cluster's **Networking** page.
1. Click **PrivateLink**.
1. Click **Set up a PrivateLink connection**.
1. Use the service name provided to [create an AWS endpoint](network-authorization.html#create-an-aws-endpoint) in the AWS console.
1. Click **Create Endpoint**
1. Paste the Endpoint ID you created into the **VPC Endpoint ID** field.
1. Click **Verify** to verify the ID.
1. Click **Next** to continue to the third step.
1. Return to the AWS console to [enable private DNS](network-authorization.html#enable-private-dns).
1. Click **Complete**.
1. On the **Networking** page, verify the connection status is **Active**.

</section>

## Step 2. Create a SQL user

<<<<<<< HEAD
{% include cockroachcloud/create-a-sql-user.md %}
=======
{% include cockroachcloud/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page.

    <img src="{{ 'images/v19.2/cockroachcloud/sql-users.png' | relative_url }}" alt="SQL users" style="border:1px solid #eee;max-width:100%" />

1. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

1. Enter a **Username** and **Password**.
    {{site.data.alerts.callout_info}}
    Password must be at least 12 characters long.
    {{site.data.alerts.end}}
1. Click **Save**.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Granting privileges](user-authorization.html#granting-privileges) and [Using roles](user-authorization.html#using-roles).
>>>>>>> 70078d22c (formatting and style edits)

## Step 3. Select a connection method

1. In the top right corner of the Console, click the **Connect** button.

<<<<<<< HEAD
    The **Connect** dialog displays.
=======
    The **Connect** modal displays.

    <img src="{{ 'images/v19.2/cockroachcloud/connect-modal.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:50%" />    

1. **IP Allowlist** is selected by default as the **Network Security** option. 

      For AWS clusters, you can select AWS PrivateLink if you have already [established a PrivateLink connection](#establish-vpc-peering-or-aws-privatelink).

      For GCP clusters, you can select **VPC Peering** if you have already:
    - [Enabled VPC peering while creating your cluster](create-your-cluster.html#step-7-enable-vpc-peering-optional)
    - [Established a VPC Peering connection](#establish-vpc-peering-or-aws-privatelink)
  
1. From the **User** dropdown, select the SQL user you created in [Step 2. Create a SQL user](#step-2-create-a-sql-user).
1. From the **Region** dropdown, select the region closest to where your client or application is running.
1. From the **Database** dropdown, select the database you want to connect to.

    The default database is `defaultdb`. For more information, see [Default databases](../v20.1/show-databases.html#preloaded-databases).

1. Click **Continue**.
>>>>>>> 70078d22c (formatting and style edits)

1. **IP Allowlist** is selected by default as the **Network Security** option. Select **VPC Peering** if you have already:
    - [Enabled VPC peering while creating your cluster](create-your-cluster.html#step-7-enable-vpc-peering-optional) for your GCP cluster
    - [Established a VPC Peering connection](#establish-a-vpc-peering-connection)
1. From the **User** dropdown, select the SQL user you created in [Step 2. Create a SQL user](#step-2-create-a-sql-user).
1. From the **Region** dropdown, select the region closest to where your client or application is running.
1. From the **Database** dropdown, select the database you want to connect to.

    The default database is `defaultdb`. For more information, see [Default databases](../v20.2/show-databases.html#preloaded-databases).

<<<<<<< HEAD
1. Click **Next**.
=======
1. Select a connection method:
>>>>>>> 70078d22c (formatting and style edits)

1. Select a connection method (the instructions below will adjust accordingly):

<<<<<<< HEAD
    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="cockroachdb-client">CockroachDB client</button>
        <button class="filter-button page-level" data-scope="your-app">Your app</button>
        <button class="filter-button page-level" data-scope="your-tool">Your tool</button>
    </div>
<p></p>
=======
    To connect to your cluster using the [in-built SQL client](#use-the-cockroachdb-sql-client), use the command displayed on the **CockroachDB Client** tab.

    To connect to your cluster [using a Postgres ORM or driver](#use-a-postgres-driver-or-orm), use either the **Connection String** or the **Parameters** as required by your ORM or driver.

    {{site.data.alerts.callout_info}}
    The connection string allows you to connect to the cluster's regional load balancer. No additional load balancing needs to be implemented on the application side.
    {{site.data.alerts.end}}

1. Click the name of the **ca.crt** file to download the CA certificate.

1. Create a `certs` directory and move the `ca.crt` file to the `certs` directory. The `ca.crt` file must be available on every machine from which you want to connect to the cluster and must be referenced in the connection string.

    You will need to replace the `<certs_dir>` placeholders with the path to your certs directory in the CockroachDB client command or the connection string.
>>>>>>> 70078d22c (formatting and style edits)

## Step 4. Connect to your cluster

<section class="filter-content" markdown="1" data-scope="cockroachdb-client">

<<<<<<< HEAD
To connect to your cluster with the [built-in SQL client](../v20.2/cockroach-sql.html):
=======
    For Mac:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~

    For Linux:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

1. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:
>>>>>>> 70078d22c (formatting and style edits)

1. Click the name of the `<cluster_name>-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

<<<<<<< HEAD
1. Move the downloaded `<cluster_name>-ca.crt` file to the `certs` directory:
=======
1. Use the `cockroach sql` command to open an interactive SQL shell, replacing placeholders in the [client connection method](#step-3-select-a-connection-method) with the correct path to the `ca.crt`:
>>>>>>> 70078d22c (formatting and style edits)

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv /path/to/cc-ca.crt /path/to/certs
    ~~~

    For example:

    {% include copy-clipboard.html %}
    ~~~ shell
<<<<<<< HEAD
    $ mv /Users/maxroach/Downloads/<cluster_name>-ca.crt /Users/maxroach/certs
    ~~~    
=======
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>' \
    --execute="CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);"
    ~~~

1. Execute some [CockroachDB SQL](../stable/learn-cockroachdb-sql.html).

{{site.data.alerts.callout_success}}
For more details about the built-in SQL client, and many examples of how to use it, see the [`cockroach sql`](../stable/cockroach-sql.html) documentation.
{{site.data.alerts.end}}

### Use a Postgres driver or ORM

You can use the connection string or parameters to connect to the cluster using a PostgreSQL-compatible driver or ORM. The following language-specific versions assume that you have installed the relevant [client drivers](../stable/install-client-drivers.html).

For code samples in other languages, see [Build an App with CockroachDB](https://www.cockroachlabs.com/docs/v20.1/build-an-app-with-cockroachdb.html).

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="python">Python</button>
  <button style="width: 15%" class="filter-button" data-scope="go">Go</button>
  <button style="width: 15%" class="filter-button" data-scope="java">Java</button>
  <button style="width: 15%" class="filter-button" data-scope="js">Node.js</button>
</div>

<section class="filter-content" markdown="1" data-scope="python">
>>>>>>> 70078d22c (formatting and style edits)

1. If you have not done so already, [install the CockroachDB binary](../stable/install-cockroachdb.html).
1. Copy the [`cockroach sql`](../v20.2/cockroach-sql.html) command and connection string provided in the Console, which will be used in the next step (and to connect to your cluster in the future).
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](../v20.2/cockroach-sql.html).

    Be sure to replace the `<your_certs_ directory>` placeholder with the path to the `certs` directory you created earlier.

1. Enter the SQL user's password and hit enter.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html).
</section>

<section class="filter-content" markdown="1" data-scope="your-app">
To connect to your cluster with your application:

1. Click the name of the `<cluster_name>-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `<cluster_name>-ca.crt` file to the `certs` directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv /path/to/cc-ca.crt /path/to/certs
    ~~~

    For example:

    {% include copy-clipboard.html %}
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

- [Build a Python App with CockroachDB](../v20.2/build-a-python-app-with-cockroachdb.html)
- [Build a Go App with CockroachDB](../v20.2/build-a-go-app-with-cockroachdb.html)
- [Build a Java App with CockroachDB](../v20.2/build-a-java-app-with-cockroachdb.html)

</section>

<section class="filter-content" markdown="1" data-scope="your-tool">
To connect to your cluster with a [CockroachDB-compatible tool](../v20.2/third-party-database-tools.html), use the connection parameters provided in the Console.
</section>

## What's next

- [Build a "Hello, World" app](build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachCloud](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
