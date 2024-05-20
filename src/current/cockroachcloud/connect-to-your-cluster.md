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
    - Google Cloud Platform (GCP) VPC Peering or Private Service Connect (Preview)
    - Amazon Web Services (AWS) Privatelink

{{site.data.alerts.callout_info}}
Removing or adding an authorized network on your CockroachDB {{ site.data.products.dedicated }} cluster may take a few seconds to take effect.
{{site.data.alerts.end}}

{% include cockroachcloud/authorize-your-clusters-networks.md %}

1. Select whether the network can connect to the cluster's **DB Console to monitor the cluster**, **CockroachDB Client to access databases**, or both.

    The DB Console is where you can observe your cluster's health and performance. For more information, see [DB Console Overview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/ui-overview).

1. Click **Apply**.

<a id="establish-gcp-vpc-peering-or-aws-privatelink"></a>
### Establish private connectivity

Private connectivity allows you to establish SQL access to a CockroachDB {{ site.data.products.dedicated }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.

- Clusters deployed on GCP can connect privately using [GCP Private Service Connect (PSC)](#gcp-private-service-connect) or [GCP VPC peering](#gcp-vpc-peering). PSC allows you to selectively connect your cluster to a VPC within your Google Cloud project, while VPC Peering allows you to connect the Cockroach Cloud's VPC for your cluster to a VPC within your Google Cloud project.
- Clusters deployed on AWS can connect privately using AWS PrivateLink, which allows you to connect Cockroach Cloud's VPC to a VPC within your AWS account.

For more information, refer to [Network authorization]({% link cockroachcloud/network-authorization.md %}).

{{site.data.alerts.callout_success}}
GCP Private Service Connect and AWS PrivateLink can be configured only after a cluster is created.
{{site.data.alerts.end}}

Azure Private Link is not yet available for [CockroachDB {{ site.data.products.dedicated }} on Azure]({% link cockroachcloud/cockroachdb-dedicated-on-azure.md %}).

{{site.data.alerts.callout_info}}
{% include cockroachcloud/cdc/kafka-vpc-limitation.md %}
{{site.data.alerts.end}}

#### GCP Private Service Connect

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

1. Navigate to your cluster's **Networking > Private endpoint** tab.
1. Click **Add a private endpoint**. Copy the value provided for **Target service**. Do not close this browser window.
1. In a new browser window, log in to Google Cloud Console, go to **Private Service Connect** section, and create a new endpoint in the same VPC as your application. For details, refer to [Create an endpoint](https://cloud.google.com/vpc/docs/configure-private-service-connect-services#create-endpoint) in the Google Cloud documentation.
    - Set **Target** to **Published service**.
    - Set **Target service** to the value you copied from CockroachDB {{ site.data.products.cloud }} Console. If the endpoint's configured target service does not match, validation will fail.
    - Provide a value for **Endpoint name**. This is not used by CockroachDB {{ site.data.products.cloud }}.
    - If it is not enabled, enable the Service Directory API, click **Enable global access*, and create a namespace in each region where your cluster is deployed.
    - Click **Add endpoint**.
    - After the endpoint is created, copy the connection ID.
1. Return to the CockroachDB {{ site.data.products.cloud }} Console browser tab and click **Validate**.
1. Enter the endpoint's ID, then click **Validate**. CockroachDB {{ site.data.products.cloud }} attempts to connect to the endpoint's VPC and verifies that the target service matches the cluster. If validation fails, verify the endpoint's configuration, then try again. After validation succeeds, click **Complete** to finish creating the connection.
1. On the **Networking > Private endpoint** tab, verify that the connection status is **Available**.

{{site.data.alerts.callout_success}}
After validation succeeds for an endpoint, additional endpoints in the same VPC are automatically automatically accepted if they are configured with the cluster's target service ID. Additional VPCs must be added separately.
{{site.data.alerts.end}}

If you remove the endpoint from GCP or change its target service, the endpoint will be removed from the cluster automatically.

After the connection is established, you can use it to [connect to your cluster](#connect-to-your-cluster).

<a id="vpc-peering"></a>
#### GCP VPC Peering

For GKE, we recommend deploying your application to a VPC-native cluster that uses [alias IP addresses](https://cloud.google.com/kubernetes-engine/docs/how-to/alias-ips). If you are connecting from a [routes-based GKE cluster](https://cloud.google.com/kubernetes-engine/docs/how-to/routes-based-cluster) instead, you must [export custom routes](https://cloud.google.com/vpc/docs/vpc-peering#importing-exporting-routes). CockroachDB {{ site.data.products.cloud }} will import your custom routes by default.

1. Navigate to your cluster's **Networking > VPC Peering** tab.
1. Click **Set up a VPC peering connection**.
1. On the **Request a VPC peering connection** dialog, enter your [GCP Project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
1. Enter your [GCP VPC network name](https://cloud.google.com/vpc/docs/using-vpc#viewing-networks).
1. In the **Connection name** field, enter a descriptive name for the VPC connection.
1. Click **Request Connection**.
1. Run the command displayed on the **Accept VPC peering connection request** window using [Google Cloud Shell](https://cloud.google.com/shell) or using the [gcloud command-line tool](https://cloud.google.com/sdk/gcloud).
1. On the **Networking** page, verify the connection status is **Available**.

After the connection is established, you can use it to [connect to your cluster](#connect-to-your-cluster).

{{site.data.alerts.callout_info}}
Self-service VPC peering setup is not supported for CockroachDB {{ site.data.products.dedicated }} clusters deployed before March 5, 2020. If your cluster was deployed before March 5, 2020, you will have to [create a new cluster]({% link cockroachcloud/create-your-cluster.md %}) with VPC peering enabled, then [export your data]({% link cockroachcloud/use-managed-service-backups.md %}) from the old cluster to the new cluster. If your cluster was deployed on or after March 5, 2020, it will be locked into CockroachDB {{ site.data.products.dedicated }}'s default IP range (`172.28.0.0/14`) unless you explicitly configured a different IP range during cluster creation.
{{site.data.alerts.end}}

#### AWS PrivateLink

To establish an AWS PrivateLink connection, refer to [Managing AWS PrivateLink for a cluster]({% link cockroachcloud/aws-privatelink.md %}). After the connection is established, you can use it to [connect to your cluster](#connect-to-your-cluster).

## Connect to your cluster

1. In the top right corner of the CockroachDB {{ site.data.products.cloud }} Console, click the **Connect** button.

    The **Setup** page of the **Connect to cluster** dialog displays.

1. If you have set up a private connection, select it to connect privately. Otherwise, click **IP Allowlist**.
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
