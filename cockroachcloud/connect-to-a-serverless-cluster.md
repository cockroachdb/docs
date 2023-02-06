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
- _(Optional)_ [Create a new SQL user](user-authorization.html#create-a-sql-user).

## Step 1. Select a connection method

1. Select your cluster to navigate to the cluster [**Overview** page](cluster-overview-page.html).

1. In the top right corner of the {{ site.data.products.db }} Console, click the **Connect** button.

    The **Connect to cluster** dialog displays.

1. _(Optional)_ If you have multiple SQL users or databases, you can:
    - Select the SQL user you want to connect with from the **SQL user** dropdown.
    - Select the database you want to connect to from the **Database** dropdown.

## Step 2. Connect to your cluster

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
If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
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
    `{username}`  | The [SQL user](user-authorization.html#create-a-sql-user) connecting to the cluster.
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
