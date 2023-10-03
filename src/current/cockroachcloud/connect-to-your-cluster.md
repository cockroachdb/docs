---
title: Connect to a CockroachDB Cloud Dedicated Cluster
summary: Learn how to connect and start interacting with your cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/crdb-cloud-connection.md %}

This page shows you how to connect to your CockroachDB {{ site.data.products.dedicated }} cluster. This includes the administrative task of configuring allowed networks to support SQL client connections, as well as the steps for connecting to the cluster with CockroachDB's [built-in SQL client](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql).

## Before you start

- [Create a cluster]({% link cockroachcloud/create-your-cluster.md %}).
- [Create a SQL user]({% link cockroachcloud/managing-access.md %}#create-a-sql-user).
- Understand [Network Authorization for CockroachDB Cloud Clusters]({% link cockroachcloud/network-authorization.md %})

## Authorize your network

By default, CockroachDB {{ site.data.products.dedicated }} clusters are locked down to all network access. You must authorized certain network connections in order to allow SQL clients to connect to your clusters. Dedicated clusters can accept connections via two types of authorized network:

- Allowed IP address ranges on the internet.
- Cloud-provider-specific peer networking options:
    - Google Cloud Platform (GCP) VPC Peering
    - Amazon Web Services (AWS) Private link

{{site.data.alerts.callout_info}}
Removing or adding an authorized network on your CockroachDB {{ site.data.products.dedicated }} cluster may take a few seconds to take effect.
{{site.data.alerts.end}}

{% include cockroachcloud/authorize-your-clusters-networks.md %}

1. Select whether the network can connect to the cluster's **DB Console to monitor the cluster**, **CockroachDB Client to access databases**, or both.

    The DB Console is where you can observe your cluster's health and performance. For more information, see [DB Console Overview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-overview).

1. Click **Apply**.

### Establish GCP VPC Peering or AWS PrivateLink

GCP VPC Peering and AWS PrivateLink allow customers to establish SQL access to their clusters entirely through cloud provider private infrastructure, without exposure to the public internet, affording enhanced security and performance.

VPC peering is available only for GCP clusters, and AWS PrivateLink is available for AWS clusters.

To configure VPC Peering or PrivateLink, you create the private connection in your cloud provider, then configure your cluster to allow connections from your VPC or private endpoint. For more information, refer to [Network Authorization for CockroachDB {{ site.data.products.dedicated }} clusters: GCP VPC Peering]({% link cockroachcloud/network-authorization.md %}#vpc-peering) and [Network Authorization for CockroachDB {{ site.data.products.dedicated }} clusters: AWS PrivateLink]({% link cockroachcloud/network-authorization.md %}#aws-privatelink).

AWS PrivateLink can be configured only after the cluster is created. For detailed instructions, refer to [Managing AWS PrivateLink for a cluster]({% link cockroachcloud/aws-privatelink.md %}). To configure VPC Peering, continue to the [VPC Peering](#vpc-peering) section below.

Azure Private Link is not yet available for [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).

#### VPC Peering

1. Navigate to your cluster's **Networking > VPC Peering** tab.
1. Click **Set up a VPC peering connection**.
1. On the **Request a VPC peering connection** dialog, enter your [GCP Project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
1. Enter your [GCP VPC network name](https://cloud.google.com/vpc/docs/using-vpc#viewing-networks).
1. In the **Connection name** field, enter a descriptive name for the VPC connection.
1. Click **Request Connection**.
1. Run the command displayed on the **Accept VPC peering connection request** window using [Google Cloud Shell](https://cloud.google.com/shell) or using the [gcloud command-line tool](https://cloud.google.com/sdk/gcloud).
1. On the **Networking** page, verify the connection status is **Available**.

## Select a connection method

1. In the top right corner of the Console, click the **Connect** button.

    The **Connect** dialog displays with **IP Allowlist** selected by default.

1.  Select a **Network Security** option:

      You can use the **IP Allowlist** option if you have already [added an IP address to your allowlist.](#add-ip-addresses-to-the-allowlist)

      For AWS clusters, you can select **AWS PrivateLink** if you have already [established a PrivateLink connection](#establish-gcp-vpc-peering-or-aws-privatelink).

      For GCP clusters, you can select **VPC Peering** if you have already:
    - [Enabled VPC peering while creating your cluster]({% link cockroachcloud/create-your-cluster.md %}#step-7-enable-vpc-peering-optional)
    - [Established a VPC Peering connection](#establish-gcp-vpc-peering-or-aws-privatelink)

1. From the **User** dropdown, select the SQL user you created.
1. From the **Region** dropdown, select the region closest to where your client or application is running.
1. From the **Database** dropdown, select the database you want to connect to.

    The default database is `defaultdb`. For more information, see [Default databases](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-databases#preloaded-databases).

1. Click **Next**.

1. Select a connection method (the instructions below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="command-line">Command line</button>
        <button class="filter-button page-level" data-scope="connection-string">General connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
    </div>

## Connect to your cluster

  <section class="filter-content" markdown="1" data-scope="command-line">

To connect to your cluster with the [built-in SQL client](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql):

1. Select **Mac**, **Linux**, or **Windows** to adjust the commands used in the next steps accordingly.

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="mac">Mac</button>
        <button class="filter-button page-level" data-scope="linux">Linux</button>
        <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

1. {% include cockroachcloud/download-the-binary.md %}

1. In your terminal, run the second command from the dialog to create a new `certs` directory on your local machine and download the CA certificate to that directory:

    {% include cockroachcloud/download-the-cert.md %}

1. If you [established a private connection using VPC Peering or AWS PrivateLink](#establish-gcp-vpc-peering-or-aws-privatelink), click **VPC Peering** or **PrivateLink** to connect privately.

1. Copy the [`cockroach sql`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql) command and connection string provided in the Console, which will be used in the next step (and to connect to your cluster in the future):

    {% include cockroachcloud/sql-connection-string.md %}

1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql).

1. Enter the SQL user's password and hit enter.

    {% include cockroachcloud/postgresql-special-characters.md %}

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator-legacy) or a Cluster Admin on the cluster can change the password on the **SQL Users** page. Refer to: [Change a User's password](https://www.cockroachlabs.com/docs/cockroachcloud/managing-access#change-a-sql-users-password).
    {{site.data.alerts.end}}

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements]({% link cockroachcloud/learn-cockroachdb-sql.md %}).

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

1. If you [established a private connection using VPC Peering or AWS PrivateLink](#establish-gcp-vpc-peering-or-aws-privatelink), click **VPC Peering** or **PrivateLink** to connect privately.

1. Copy the connection string provided in the Console, which will be used to connect your application to CockroachDB {{ site.data.products.cloud }}:

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
    If you forget your SQL user's password, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator-legacy) or a Cluster Admin on the cluster can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

For examples, see the following:

- [Build a Python App with CockroachDB](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb)
- [Build a Go App with CockroachDB](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb)
- [Build a Java App with CockroachDB](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb)

  </section>

  <section class="filter-content" markdown="1" data-scope="connection-parameters">
To connect to your cluster with a [CockroachDB-compatible tool](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/third-party-database-tools), use the connection parameters provided in the Console.

1. From the cluster's **Details** page, click **Connect**.
1. If you [established a private connection using VPC Peering or AWS PrivateLink](#establish-gcp-vpc-peering-or-aws-privatelink), click **VPC Peering** or **PrivateLink** to connect privately.
1. Copy the connection string and provide it to the CockroachDB-compatible tool.

  </section>

## What's next

- [Build a "Hello, World" app](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django)
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})
