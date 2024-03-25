---
title: Connect to a CockroachDB Dedicated Cluster
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

{{site.data.alerts.callout_info}}
{% include cockroachcloud/cdc/kafka-vpc-limitation.md %}
{{site.data.alerts.end}}

#### VPC Peering

1. Navigate to your cluster's **Networking > VPC Peering** tab.
1. Click **Set up a VPC peering connection**.
1. On the **Request a VPC peering connection** dialog, enter your [GCP Project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
1. Enter your [GCP VPC network name](https://cloud.google.com/vpc/docs/using-vpc#viewing-networks).
1. In the **Connection name** field, enter a descriptive name for the VPC connection.
1. Click **Request Connection**.
1. Run the command displayed on the **Accept VPC peering connection request** window using [Google Cloud Shell](https://cloud.google.com/shell) or using the [gcloud command-line tool](https://cloud.google.com/sdk/gcloud).
1. On the **Networking** page, verify the connection status is **Available**.


## Connect to your cluster

1. In the top right corner of the CockroachDB {{ site.data.products.cloud }} Console, click the **Connect** button.

    The **Setup** page of the **Connect to cluster** dialog displays.

1. If you set up a private connection, click **AWS PrivateLink** (for clusters deployed in AWS) or **VPC Peering** (for clusters deployed in GCP) to connect privately. Otherwise, click **IP Allowlist**.
1. Select the **SQL User**. If you have only one SQL user, it is automatically selected.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, an [Org Administrator]({% link cockroachcloud/authorization.md %}#org-administrator) or a Cluster Admin on the cluster can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

1. Select the **Database**. If you have only one database, it is automatically selected.
1. For a multiregion cluster, select the **Region** to connect to. If you have only one region, it is automatically selected.
1. Click **Next**.

    The **Connect** page of the **Connection info** dialog displays.

1. In the dialog, select the tab for a connection method, then follow the instructions below for that method.

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="command-line">Command line</button>
        <button class="filter-button page-level" data-scope="connection-string">Connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
    </div>

  <section class="filter-content" markdown="1" data-scope="command-line">

You can connect to your cluster with any [supported version](https://www.cockroachlabs.com/docs/releases/release-support-policy#current-supported-releases) of the full CockroachDB binary or the [built-in SQL client](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql). To download the full binary and connect to a CockroachDB {{ site.data.products.dedicated }} cluster, follow these steps.

{{site.data.alerts.callout_success}}
To download a supported version of the SQL shell instead of the full binary, visit [Releases](https://cockroachlabs.com/releases).
{{site.data.alerts.end}}

1. Select the **Command Line** tab.
1. If CockroachDB is not installed locally, copy the command to download and install it. In your terminal, run the command.
1. If the CA certificate for the cluster is not downloaded locally, copy the command to download it. In your terminal, run the command.
1. Copy the [`cockroach sql`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql) command, which will be used in the next step (and to connect to your cluster in the future). Click **Close**.
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql.html).

1. Enter the SQL user's password and hit enter.

    {% include cockroachcloud/postgresql-special-characters.md %}

    A welcome message displays:

    ~~~
    #
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    ~~~

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements]({% link cockroachcloud/learn-cockroachdb-sql.md %}).

  </section>

  <section class="filter-content" markdown="1" data-scope="connection-string">

To connect to your cluster from your application:

1. Select the **Connection string** tab.
1. If the CA certificate for the cluster is not downloaded locally, copy the command to download it. In your terminal, run the command.
1. Copy the connection string, which begins with `postgresql://`. This will be used to connect your application to CockroachDB {{ site.data.products.dedicated }}.
1. Add your copied connection string to your application code. For information about connecting to CockroachDB {{ site.data.products.serverless }} with a [supported client](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/third-party-database-tools), see [Connect to a CockroachDB Cluster](https://www.cockroachlabs.com/docs/{{ site.current_cloud_version }}/connect-to-the-database).
1. Click **Close**.

{% include cockroachcloud/postgresql-special-characters.md %}

For examples, see the following:

- [Build a Python App with CockroachDB](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb)
- [Build a Go App with CockroachDB](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb)
- [Build a Java App with CockroachDB](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb)

  </section>

  <section class="filter-content" markdown="1" data-scope="connection-parameters">
To connect to your cluster with a [CockroachDB-compatible tool](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/third-party-database-tools):

1. If the CA certificate for the cluster is not downloaded locally, select the **Connection string** tab, then copy the command to download the CA certificate. In your terminal, run the command.
1. Select the **Connection parameters** tab.
1. Use the connection parameters provided in the dialog to connect to your cluster using a [CockroachDB-compatible tool](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/third-party-database-tools).

    Parameter     | Description
    --------------|------------
    `{username}`  | The [SQL user]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) connecting to the cluster.
    `{password}`  | The password for the SQL user connecting to the cluster.
    `{host}`      | The host on which the CockroachDB node is running.
    `{port}`      | The port at which the CockroachDB node is listening.
    `{database}`  | The name of the (existing) database.

1. Click **Close**.
  </section>

## What's next

- [Build a "Hello, World" app](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django)
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})
