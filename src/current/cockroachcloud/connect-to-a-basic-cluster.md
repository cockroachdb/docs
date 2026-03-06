---
title: Connect to a CockroachDB Basic Cluster
summary: Learn how to connect and start interacting with your Basic cluster.
toc: true
docs_area: deploy
---

{% include cockroachcloud/filter-tabs/crdb-cloud-connection.md %}

This page shows you how to connect to your CockroachDB {{ site.data.products.basic }} cluster.

{{site.data.alerts.callout_info}}
{% include_cached common/aws-privatelink-basic.md %}
{{site.data.alerts.end}}

## Before you start

- [Create a CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/create-a-basic-cluster.md %}).
- [Create a new SQL user]({% link cockroachcloud/managing-access.md %}#create-a-sql-user).
- Understand [Network Authorization for CockroachDB Cloud Clusters]({% link cockroachcloud/network-authorization.md %})

## Authorize your network

When it is created, a {{ site.data.products.basic }} cluster is open to all traffic as it is created with a `0.0.0.0/0` IP allowlist.

It is recommended to restrict your network to allow access only from specific IP address ranges controlled by your organization. These might include specific networks for your application deployments, hardened administrator access points, or backup-restore pipelines for disaster recovery. Therefore, if possible you should replace the `0.0.0.0/0` allowlist entry with more specific CIDR ranges for legitimate access.

Removing or adding an authorized network on your CockroachDB {{ site.data.products.basic }} cluster may take up to 30 seconds to take effect.

{% include cockroachcloud/authorize-your-clusters-networks.md %}

## Connect to your cluster

1. Select your cluster to navigate to the cluster [**Overview** page]({% link cockroachcloud/cluster-overview-page.md %}).

1. In the top right corner of the CockroachDB {{ site.data.products.cloud }} Console, click the **Connect** button.

    The **Connect to cluster** dialog displays.

1. _(Optional)_ If you have multiple SQL users or databases, you can:
    - Select the SQL user you want to connect with from the **SQL user** dropdown.
    - Select the database you want to connect to from the **Database** dropdown.

1. Select a connection method from the **Select option / Language** dropdown (the instructions below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="command-line">Command line</button>
        <button class="filter-button page-level" data-scope="connection-string">General connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
    </div>

  <section class="filter-content" markdown="1" data-scope="connection-string">

1. In the **Download CA Cert** section of the dialog, you can optionally download the CA certificate. The CA certificate is signed by Let's Encrypt, which may already be trusted by your local system. However, some use cases, such as developing with Python, do not use the operating system's local certificate store and require the CA certificate to be available locally. When developing with Javascript or Node, you do not need to download the CA certificate locally. To download the CA certificate, select your operating system, then use the command provided to download the CA certificate to the default PostgreSQL certificate directory on your machine.
1. Copy the connection string provided in the **General connection string** section of the dialog, which will be used to connect your application to your cluster.
1. Add your copied connection string to your application code. For information about connecting to your cluster with a [supported client]({% link {{ site.current_cloud_version }}/third-party-database-tools.md %}), see [Connect to a CockroachDB Cluster]({% link {{ site.current_cloud_version }}/connect-to-the-database.md %}).

{% include cockroachcloud/postgresql-special-characters.md %}

{{site.data.alerts.callout_info}}
If you forget your SQL user's password, an [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) or a Cluster Admin on the cluster can change the password on the **SQL Users** page.
{{site.data.alerts.end}}

For connection examples and code snippets in your language, see the following:

- [Build a Python App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.md %})
- [Build a Go App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.md %})
- [Build a Java App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.md %})
- [Build a Ruby App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-ruby-app-with-cockroachdb.md %})
- [Build a Javascript App with CockroachDB]({% link {{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb.md %})

  </section>
  <section class="filter-content" markdown="1" data-scope="connection-parameters">

1. If you need to download the CA certificate, first set **Select option/language** to **General Connection String** and expand the **Downloada CA Cert** section. In the **Download CA Cert** section of the dialog, select your operating system, and use the command provided to download the CA certificate to the default PostgreSQL certificate directory on your machine.
1. Select the **Parameters only** option of the **Select option** dropdown.
1. Use the connection parameters provided in the dialog to connect to your cluster using a [CockroachDB-compatible tool]({% link {{site.current_cloud_version}}/third-party-database-tools.md %}).

    Parameter | Description
    ----------|------------
    `{username}`  | The [SQL user]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) connecting to the cluster.
    `{host}`  | The host on which the CockroachDB node is running.
    `{port}`  | The port at which the CockroachDB node is listening.
    `{database}`  | The name of the (existing) database.

   Additionally, you will need the SQL user's [password]({% link cockroachcloud/managing-access.md %}#create-a-sql-user). If you forget your SQL user's password, an [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) or a Cluster Admin on the cluster can change the password on the **SQL Users** page.

  </section>
  <section class="filter-content" markdown="1" data-scope="command-line">

You can connect to your cluster with any [supported version]({% link releases/release-support-policy.md %}#supported-versions) of the full CockroachDB binary or the [built-in SQL client]({% link {{site.current_cloud_version}}/cockroach-sql.md %}). To download the full binary and connect to your cluster, follow these steps.

1. Select **CockroachDB Client** from the **Select option/language** dropdown.
1. In the **Download the latest CockroachDB Client** section of the dialog, select your operating system, and use the command provided to install the latest downloadable version of CockroachDB on your local system.
1. Copy the [`cockroach sql`]({% link {{site.current_cloud_version}}/cockroach-sql.md %}) command and connection string provided in the **Connect** dialog, which will be used in the next step (and to connect to your cluster in the future).
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client]({% link {{site.current_cloud_version}}/cockroach-sql.md %}).

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

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements]({% link {{site.current_cloud_version}}/sql-statements.md %}).

  </section>

## What's next

- [Build a "Hello, World" app]({% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django.md %})
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.md %})
