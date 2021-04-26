---
title: Connect to a CockroachCloud Free (beta) Cluster
summary: Learn how to connect and start interacting with your free cluster.
toc: true
---

<div class="filters clearfix">
    <a href="connect-to-a-free-cluster.html"><button class="filter-button page-level current">CockroachCloud Free (beta)</button></a>
    <a href="connect-to-your-cluster.html"><button class="filter-button page-level">CockroachCloud</button></a>
</div>

This page shows you how to connect to your CockroachCloud Free (beta) cluster.

{% include cockroachcloud/free-limitations.md %}

## Before you start

- [Create a free cluster](create-a-free-cluster.html).
- _(Optional)_ [Create a new SQL user](user-authorization.html#create-a-sql-user).

## Step 1. Select a connection method

1. In the top right corner of the CockroachCloud Console, click the **Connect** button.

    The **Connection info** modal displays on the **Step 2. Connect > CockroachDB client** subtab.

1. _(Optional)_ To configure your connection information, click **Go Back**:
    - Select the **SQL User** you want to connect with.
    - Select the **Database** you want to connect to.
    - Click **Next**.

1. Select a connection method (the instructions below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="command-line">Command line</button>
        <button class="filter-button page-level" data-scope="connection-string">Connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
    </div>
<p></p>

## Step 2. Connect to your cluster

<section class="filter-content" markdown="1" data-scope="command-line">

To connect to your cluster with the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html):

1. Click the name of the `cc-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `cc-ca.crt` file to the `certs` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /path/to/cc-ca.crt /path/to/certs
    ~~~

    For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /Users/maxroach/Downloads/cc-ca.crt /Users/maxroach/certs
    ~~~    

1. If you have not done so already, [install the CockroachDB binary](../{{site.versions["stable"]}}/install-cockroachdb.html).
1. Copy the [`cockroach sql`](../{{site.versions["stable"]}}/cockroach-sql.html) command and connection string provided in the Console, which will be used in the next step (and to connect to your cluster in the future).
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html).

    Be sure to replace the `<your_certs_ directory>` placeholder with the path to the `certs` directory you created earlier.

1. Enter the [SQL user](user-authorization.html)'s password and hit enter.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html).
</section>

<section class="filter-content" markdown="1" data-scope="connection-string">
To connect to your cluster with your application, use the connection string provided in the Console::

1. Click the name of the `cc-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `cc-ca.crt` file to the `certs` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /path/to/cc-ca.crt /path/to/certs
    ~~~

    For example:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv /Users/maxroach/Downloads/cc-ca.crt /Users/maxroach/certs
    ~~~    

1. Copy the connection string provided in the Console, which will be used to connect your application to CockroachCloud Free (beta).
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
