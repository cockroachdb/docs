---
title: Connect to a CockroachDB Serverless Cluster
summary: Learn how to connect and start interacting with your free cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/crdb-cloud-connection.md %}

This page shows you how to connect to your {{ site.data.products.serverless }} cluster. If you'd like to follow along with a video walkthrough, see [How to connect to {{ site.data.products.db }} and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).

## Before you start

- [Create a {{ site.data.products.serverless }} cluster](create-a-serverless-cluster.html).
- [Create a new SQL user](managing-access.html#create-a-sql-user).
- Understand [Network Authorization for CockroachDB Cloud Clusters](network-authorization.html)

## Authorize your network

On creation, a Serverless cluster is open to all traffic as it is created with a `0.0.0.0/0` IP allowlist.

It is recommended to restrict your network to allow access only from specific IP address ranges controlled by your organization. These might include specific networks for your application deployments, hardened administrator access points, or backup-restore pipelines for disaster recovery. Therefore, if possible you should replace the `0.0.0.0/0` allowlist entry with more specific CIDR ranges for legitimate access.

Removing or adding an authorized network on your {{ site.data.products.serverless }} cluster may take up to 30 seconds to take effect.

{% include cockroachcloud/authorize-your-clusters-networks.md %}

### Establish AWS PrivateLink

Amazon Web Services (AWS) PrivateLink support allows customers to establish SQL access to their clusters entirely through private AWS infrastructure, without exposure to the public internet, affording enhanced security and performance.

AWS PrivateLink is available only for multiregion {{ site.data.products.serverless }} clusters deployed on AWS. GCP Peering is not yet available for {{ site.data.products.serverless }}.

To configure PrivateLink, you create the AWS PrivateLink connection in your or AWS console, then configure your cluster to allow connections from the connection. For more information and detailed instructions, refer to[Network Authorization for {{ site.data.products.dedicated }} clusters: AWS PrivateLink](network-authorization.html#aws-privatelink).

AWS Privatelink can be configured only after the cluster is created. For detailed instructions, refer to [Managing AWS PrivateLink for a cluster](aws-privatelink.html?filter-content=serverless).

During [limited access](/docs/{{site.versions["stable"]}}/cockroachdb-feature-availability.html), Azure Private Link is not available for {{ site.data.products.dedicated }} clusters on Azure. Refer to [{{ site.data.products.dedicated }} on Azure](cockroachdb-dedicated-on-azure.html).

## Select a connection method

1. Select your cluster to navigate to the cluster [**Overview** page](cluster-overview-page.html).

1. In the top right corner of the {{ site.data.products.db }} Console, click the **Connect** button.

    The **Connect to cluster** dialog displays.

1. _(Optional)_ If you have multiple SQL users or databases, you can:
    - Select the SQL user you want to connect with from the **SQL user** dropdown.
    - Select the database you want to connect to from the **Database** dropdown.

## Connect to your cluster

1. Select a connection method from the **Select option** dropdown (the instructions below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="connection-string">General connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
        <button class="filter-button page-level" data-scope="cockroachdb-client">CockroachDB client</button>
    </div>

  <section class="filter-content" markdown="1" data-scope="connection-string">

1. In the **Download CA Cert** section of the dialog, select your operating system, and use the command provided to download the CA certificate to the default PostgreSQL certificate directory on your machine.
1. Copy the connection string provided in the **General connection string** section of the dialog, which will be used to connect your application to {{ site.data.products.serverless }}.
1. Add your copied connection string to your application code. For information about connecting to {{ site.data.products.serverless }} with a [supported client](../stable/third-party-database-tools.html), see [Connect to a CockroachDB Cluster](../stable/connect-to-the-database.html).

{% include cockroachcloud/postgresql-special-characters.md %}

{{site.data.alerts.callout_info}}
If you forget your SQL user's password, an [Org Administrator](authorization.html#org-administrator-legacy) or a Cluster Admin on the cluster can change the password on the **SQL Users** page.
{{site.data.alerts.end}}

For connection examples and code snippets in your language, see the following:

- [Build a Python App with CockroachDB](../{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.html)
- [Build a Go App with CockroachDB](../{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.html)
- [Build a Java App with CockroachDB](../{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.html)
- [Build a Ruby App with CockroachDB](../{{site.current_cloud_version}}/build-a-ruby-app-with-cockroachdb.html)
- [Build a Javascript App with CockroachDB](../{{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb.html)

  </section>
  <section class="filter-content" markdown="1" data-scope="connection-parameters">

1. In the **Download CA Cert** section of the dialog, select your operating system, and use the command provided to download the CA certificate to the default PostgreSQL certificate directory on your machine.
1. Select the **Parameters only** option of the **Select option** dropdown.

1. Use the connection parameters provided in the dialog to connect to your cluster using a [CockroachDB-compatible tool](../{{site.current_cloud_version}}/third-party-database-tools.html).

    Parameter | Description
    ----------|------------
    `{username}`  | The [SQL user](managing-access.html#create-a-sql-user) connecting to the cluster.
    `{password}`  | The password for the SQL user connecting to the cluster.
    `{host}`  | The host on which the CockroachDB node is running.
    `{port}`  | The port at which the CockroachDB node is listening.
    `{database}`  | The name of the (existing) database.

  </section>
  <section class="filter-content" markdown="1" data-scope="cockroachdb-client">

1. In the **Download CA Cert** section of the dialog, select your operating system, and use the command provided to download the CA certificate to the default PostgreSQL certificate directory on your machine.
1. In the **Download the latest CockroachDB Client** section of the dialog, select your operating system, and use the command provided to install CockroachDB.
1. Copy the [`cockroach sql`](../stable/cockroach-sql.html) command and connection string provided in the **Connect** modal, which will be used in the next step (and to connect to your cluster in the future).
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](../{{site.current_cloud_version}}/cockroach-sql.html).

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

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html).

  </section>

## What's next

- [Build a "Hello, World" app](../{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and {{ site.data.products.db }}](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
