---
title: Connect to a CockroachDB Advanced Cluster
summary: Learn how to connect and start interacting with your cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/crdb-cloud-connection.md %}

This page shows you how to connect to your CockroachDB {{ site.data.products.advanced }} cluster. This includes the administrative task of configuring allowed networks to support SQL client connections, as well as the steps for connecting to the cluster with CockroachDB's [built-in SQL client]({% link {{site.current_cloud_version}}/cockroach-sql.md %}).

## Before you start

- [Create a cluster]({% link cockroachcloud/create-your-cluster.md %}).
- [Create a SQL user]({% link cockroachcloud/managing-access.md %}#create-a-sql-user).
- Understand [Network Authorization for CockroachDB Cloud Clusters]({% link cockroachcloud/network-authorization.md %})

## Authorize your network

By default, CockroachDB {{ site.data.products.advanced }} clusters are locked down to all network access. You must authorized certain network connections in order to allow SQL clients to connect to your clusters. Advanced clusters can accept connections via two types of authorized network:

- IP allowlisting: Selectively IP address ranges to connect to the cluster.
- Private connectivity: Cloud-provider-specific private networking options, including GCP Private Service Connect, GCP VPC Peering, AWS Privatelink, or Azure Private Link.

{{site.data.alerts.callout_info}}
Removing or adding an authorized network on your CockroachDB {{ site.data.products.advanced }} cluster may take a few seconds to take effect.
{{site.data.alerts.end}}

{% include cockroachcloud/authorize-your-clusters-networks.md %}

### Establish private connectivity

Private connectivity allows you to establish SQL access to a CockroachDB {{ site.data.products.advanced }} cluster entirely through cloud provider private infrastructure, without exposing the cluster to the public internet, affording enhanced security and performance.

- Clusters deployed on GCP can connect privately using [GCP Private Service Connect (PSC)](#gcp-private-service-connect) or [GCP VPC Peering](#vpc-peering). PSC allows you to connect your cluster directly to a VPC within your Google Cloud project, while VPC Peering allows you to peer your cluster's VPC in CockroachDB Cloud to a VPC within your Google Cloud project.
- Clusters deployed on AWS can connect privately using [AWS PrivateLink](#aws-privatelink), which allows you to connect your cluster to a VPC within your AWS account.
- Clusters deployed on Azure can connect privately using [Azure Private Link](#azure-private-link), which allows you to connect your cluster to a virtual network within your Azure tenant.

For more information, refer to [Network authorization]({% link cockroachcloud/network-authorization.md %}).

{{site.data.alerts.callout_success}}
Private connectivity can be configured only after a cluster is created.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
{% include cockroachcloud/cdc/kafka-vpc-limitation.md %}
{{site.data.alerts.end}}

#### GCP Private Service Connect

1. Navigate to your cluster's **Networking > Private endpoint** tab.
1. Click **Add a private endpoint**. Copy the value provided for **Target service**. Do not close this browser window.
1. In a new browser window, log in to Google Cloud Console, go to **Private Service Connect** section, and create a new endpoint in the same VPC as your application. For details, refer to [Create an endpoint](https://cloud.google.com/vpc/docs/configure-private-service-connect-services#create-endpoint) in the Google Cloud documentation.
    - Set **Target** to **Published service**.
    - Set **Target service** to the value you copied from CockroachDB {{ site.data.products.cloud }} Console. If the endpoint's configured target service does not match, validation will fail.
    - Provide a value for **Endpoint name**. You will need to provide this **Endpoint name** when connecting to the cluster using the command line, a connection string, or connection parameters.
    - If it is not enabled, enable the Service Directory API, click **Enable global access**, and create a namespace in each region where your cluster is deployed.
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
Self-service VPC peering setup is not supported for CockroachDB {{ site.data.products.advanced }} clusters deployed before March 5, 2020. If your cluster was deployed before March 5, 2020, you will have to [create a new cluster]({% link cockroachcloud/create-your-cluster.md %}) with VPC peering enabled, then [export your data]({% link cockroachcloud/managed-backups.md %}) from the old cluster to the new cluster. If your cluster was deployed on or after March 5, 2020, it will be locked into CockroachDB {{ site.data.products.advanced }}'s default IP range (`172.28.0.0/14`) unless you explicitly configured a different IP range during cluster creation.
{{site.data.alerts.end}}

#### AWS PrivateLink

To establish an AWS PrivateLink connection, refer to [Managing AWS PrivateLink for a cluster]({% link cockroachcloud/aws-privatelink.md %}). After the connection is established, you can use it to [connect to your cluster](#connect-to-your-cluster).

#### Azure Private Link

1. Navigate to your cluster's **Networking > Private endpoint** tab.
1. Click **Add a private endpoint**. Copy the value provided for **Alias**. Do not close this browser window.
1. In a new browser window, log in to Azure Console and create a new private endpoint for your cluster.
    - Set the connection method to “by resource ID or alias”.
    - Set the resource ID to the **Alias** you previously copied. For details, refer to [Create a private endpoint](https://learn.microsoft.com//azure/private-link/create-private-endpoint-portal?tabs=dynamic-ip) in the Azure documentation.

    After the private endpoint is created, view it, then click **Properties** and copy its Resource ID.

    {{site.data.alerts.callout_info}}
    Copy the resource ID for the private endpoint you just created, not for the Private Link resource itself.
    {{site.data.alerts.end}}

    Do not close this browser window.
1. Return to the CockroachDB {{ site.data.products.cloud }} Console browser tab and click **Next**.
1. Paste the resource ID for the Azure private endpoint, then click **Validate**. If validation fails, verify the resource ID and try again. If you encounter the error `This resource is invalid`, be sure that you are using the resource ID for the Azure private endpoint, rather than the resource ID for Azure Private Link itself.

    When validation succeeds, click **Next** to configure private DNS. Make a note of the Internal DNS Name. Do not close this browser window.
1. Return to the Azure Console. Go to the **Private DNS Zone** page and create private DNS records for your cluster in the` region where you will connect privately.
    - Create a private DNS zone named with the Internal DNS Name you previously copied. Refer to [Quickstart: Create an Azure private DNS zone using the Azure portal](https://learn.microsoft.com/azure/dns/private-dns-getstarted-portal).
    - In the new DNS zone, create an `@` record with the Internal DNS Name you previously copied.
    - Click **Complete** to finish creating the DNS records.
1. Associate the new DNS zone with the private endpoint's virtual network. View the private endpoint's configuration, click **Virtual network links**, then click **Add**.
    - Name the link, then select the resource group and select the DNS zone you just created.
    - Enable auto-registration.
    - Click **OK**.

    For details, refer to [Link the virtual network](https://learn.microsoft.com/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).
1. Return to the CockroachDB {{ site.data.products.cloud }} Console browser tab and click **Complete**.
1. On the **Networking** page, verify the connection status is **Available**.

## Connect to your cluster

1. In the top right corner of the CockroachDB {{ site.data.products.cloud }} Console, click **Connect**.

    The **Setup** page of the **Connect to cluster** dialog displays.

1. If you set up a private connection, select it to connect privately. Otherwise, click **IP Allowlist**.
1. Select the **SQL User**. If you have only one SQL user, it is automatically selected.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, an [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) or a Cluster Admin on the cluster can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

1. Select the **Database**. If you have only one database, it is automatically selected.
1. For a multi-region cluster, select the **Region** to connect to. If you have only one region, it is automatically selected.
1. Click **Next**.

    The **Connect** page of the **Connection info** dialog displays.

1. In the dialog, select the tab for a connection method, then follow the instructions below for that method.

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="command-line">Command line</button>
        <button class="filter-button page-level" data-scope="connection-string">Connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
    </div>

  <section class="filter-content" markdown="1" data-scope="command-line">

You can connect to your cluster with any [supported version]({% link releases/release-support-policy.md %}#supported-versions) of the full CockroachDB binary or the [built-in SQL client]({% link {{site.current_cloud_version}}/cockroach-sql.md %}). To download the full binary and connect to a CockroachDB {{ site.data.products.advanced }} cluster, follow these steps.

{{site.data.alerts.callout_success}}
To download a supported version of the SQL shell instead of the full binary, visit [Releases](https://cockroachlabs.com/releases).
{{site.data.alerts.end}}

1. Select the **Command Line** tab.
1. If CockroachDB is not installed locally, copy the command to download and install it. In your terminal, run the command.
1. If the CA certificate for the cluster is not downloaded locally, copy the command to download it. In your terminal, run the command.
1. Copy the [`cockroach sql`]({% link {{site.current_cloud_version}}/cockroach-sql.md %}) command, which will be used in the next step (and to connect to your cluster in the future). Click **Close**.
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client]({% link {{site.current_cloud_version}}/cockroach-sql.md %}).

1. Enter the SQL user's password and enter.

    {% include cockroachcloud/postgresql-special-characters.md %}

    A welcome message displays:

    ~~~
    #
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    ~~~

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements]({% link {{site.current_cloud_version}}/sql-statements.md %}).

  </section>

  <section class="filter-content" markdown="1" data-scope="connection-string">

To connect to your cluster from your application:

1. Select the **Connection string** tab.
1. If the CA certificate for the cluster is not downloaded locally, copy the command to download it. In your terminal, run the command.
1. Copy the connection string, which begins with `postgresql://`. This will be used to connect your application to CockroachDB {{ site.data.products.advanced }}.
1. Add your copied connection string to your application code. For information about connecting to CockroachDB {{ site.data.products.advanced }} with a [supported client]({% link {{ site.current_cloud_version }}/third-party-database-tools.md %}), see [Connect to a CockroachDB Cluster]({% link {{ site.current_cloud_version }}/connect-to-the-database.md %}).
1. Click **Close**.

{% include cockroachcloud/postgresql-special-characters.md %}

For examples, see the following:

- [Build a Python App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.md %})
- [Build a Go App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.md %})
- [Build a Java App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.md %})

  </section>

  <section class="filter-content" markdown="1" data-scope="connection-parameters">
To connect to your cluster with a [CockroachDB-compatible tool]({% link {{site.current_cloud_version}}/third-party-database-tools.md %}):

1. If the CA certificate for the cluster is not downloaded locally, select the **Connection string** tab, then copy the command to download the CA certificate. In your terminal, run the command.
1. Select the **Connection parameters** tab.
1. Use the connection parameters provided in the dialog to connect to your cluster using a [CockroachDB-compatible tool]({% link {{site.current_cloud_version}}/third-party-database-tools.md %}).

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

- [Build a "Hello, World" app]({% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django.md %})
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})
