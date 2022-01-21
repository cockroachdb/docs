---
title: Connect to a {{ site.data.products.serverless }} Cluster
summary: Learn how to connect and start interacting with your free cluster.
toc: true
redirect_from: connect-to-a-free-cluster.html
filter_category: conn_crdb_cloud
filter_html: {{ site.data.products.serverless }}
filter_sort: 1
---

{% include filter-tabs.md %}

This page shows you how to connect to your {{ site.data.products.serverless }} cluster. If you'd like to follow along with a video walkthrough, see [How to connect to {{ site.data.products.db }} and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).

{% include cockroachcloud/free-limitations.md %}

## Before you start

- [Create a {{ site.data.products.serverless }} cluster](create-a-serverless-cluster.html).
- _(Optional)_ [Create a new SQL user](user-authorization.html#create-a-sql-user).

## Step 1. Select a connection method

1. Select your cluster to navigate to the cluster **Overview** page.

1. In the top right corner of the {{ site.data.products.db }} Console, click the **Connect** button.

    The **Connect** modal displays on the **Step 2. Connect > Command Line** subtab.

1. _(Optional)_ To configure your connection information, click **Go Back**:
    - Select the **SQL User** you want to connect with.
    - Select the **Database** you want to connect to.
    - Click **Next**.

1. Select a connection method (the instructions in Step 2 below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="command-line">Command line</button>
        <button class="filter-button page-level" data-scope="connection-string">Connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
    </div>
<p></p>

## Step 2. Connect to your cluster

{% include cockroachcloud/cc-cert-expire.md %}

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

    {% include cockroachcloud/download-the-cert-free.md %}

1. Copy the [`cockroach sql`](../{{site.versions["stable"]}}/cockroach-sql.html) command and connection string provided in the **Connect** modal, which will be used in the next step (and to connect to your cluster in the future):

    {% include cockroachcloud/sql-connection-string-free.md %}

1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html).

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

  <section class="filter-content" markdown="1" data-scope="connection-string">

To connect to your cluster with your application, use the connection string provided in the Console:

1. Select **Mac**, **Linux**, or **Windows** to adjust the commands used in the next steps accordingly.

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

1. In your terminal, run the first command from the dialog to create a new `certs` directory on your local machine and download the CA certificate to that directory:

    {% include cockroachcloud/download-the-cert-free.md %}

1. Copy the connection string provided in the **Connect** modal, which will be used to connect your application to {{ site.data.products.serverless }}:

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    'postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/.postgresql/root.crt&options=--cluster=<routing-id>'
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    'postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full&sslrootcert='$HOME'/.postgresql/root.crt&options=--cluster=<routing-id>'
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    "postgresql://<username>:<password>@<serverless-host>:26257/defaultdb?sslmode=verify-full&sslrootcert=$env:appdata/.postgresql/root.crt&options=--cluster=<routing-id>"
    ~~~
    </section>

    Where:
    - `<username>` is the SQL user. By default, this is your {{ site.data.products.db }} account username.
    - `<password>` is the password for the SQL user. The password will be shown only once in the **Connection info** dialog after creating the cluster.
    - `<serverless-host>` is the hostname of the {{ site.data.products.serverless }} cluster.
    - `<routing-id>` identifies your tenant cluster on a [multi-tenant host](architecture.html#architecture). For example, `funny-skunk-123`.
    - `<cluster-id>` is a unique string used to identify your cluster when downloading the CA certificate. For example, `12a3bcde-4fa5-6789-1234-56bc7890d123`.

    You can find these settings in the **Connection parameters** tab of the **Connection info** dialog.

1. Add your copied connection string to your application code.

    {% include cockroachcloud/postgresql-special-characters.md %}

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

For connection examples and code snippets in your language, see the following:

- [Build a Python App with CockroachDB](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb.html)
- [Build a Go App with CockroachDB](../{{site.versions["stable"]}}/build-a-go-app-with-cockroachdb.html)
- [Build a Java App with CockroachDB](../{{site.versions["stable"]}}/build-a-java-app-with-cockroachdb.html)
- [Build a Ruby App with CockroachDB](../{{site.versions["stable"]}}/build-a-ruby-app-with-cockroachdb.html)
- [Build a Javascript App with CockroachDB](../{{site.versions["stable"]}}/build-a-nodejs-app-with-cockroachdb.html)
- [Build a C++ App with CockroachDB](../{{site.versions["stable"]}}/build-a-c++-app-with-cockroachdb.html)
  </section>

  <section class="filter-content" markdown="1" data-scope="connection-parameters">

To connect to your cluster with a [CockroachDB-compatible tool](../{{site.versions["stable"]}}/third-party-database-tools.html), use the connection parameters provided in the Console.

  </section>

## What's next

- [Build a "Hello, World" app](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and {{ site.data.products.db }}](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
