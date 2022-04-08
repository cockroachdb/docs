---
title: Connect to a CockroachDB Serverless (beta) Cluster
summary: Learn how to connect and start interacting with your free cluster.
toc: true
redirect_from: connect-to-a-free-cluster.html
filter_category: conn_crdb_cloud
filter_html: CockroachDB Serverless (beta)
filter_sort: 1
docs_area: deploy
---

{% include filter-tabs.md %}

This page shows you how to connect to your {{ site.data.products.serverless }} cluster. If you'd like to follow along with a video walkthrough, see [How to connect to {{ site.data.products.db }} and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).

{% include cockroachcloud/free-limitations.md %}

## Before you start

- [Create a Serverless (beta) cluster](create-a-serverless-cluster.html).
- _(Optional)_ [Create a new SQL user](user-authorization.html#create-a-sql-user).
- [Install CockroachDB](../stable/install-cockroachdb.html)

## Step 1. Select a connection method

1. Select your cluster to navigate to the cluster **Overview** page.

1. In the top right corner of the {{ site.data.products.db }} Console, click the **Connect** button.

    The **Connect to your cluster** dialog displays.

1. _(Optional)_ If you have multiple SQL users or databases, you can:
    - Select the SQL user you want to connect with from the **SQL user** dropdown.
    - Select the database you want to connect to from the **Database** dropdown.

## Step 2. Download the CA certificate

1. In the **Download CA Cert** section of the dialog, select **Mac**, **Linux**, or **Windows** to adjust the commands used in the next steps accordingly.

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

1. In your terminal, run the **CA Cert download command** from the dialog to download the CA certificate to the default PostgreSQL certificate directory:

    {% include cockroachcloud/download-the-cert-free.md %}
    
## Step 3. Connect to your cluster

1. Select a connection method from the **Select option/language** dropdown (the instructions in **Step 2** below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="connection-string">General connection string</button>
        <button class="filter-button page-level" data-scope="connection-parameters">Connection parameters</button>
        <button class="filter-button page-level" data-scope="cockroachdb-client">CockroachDB client</button>
        <button class="filter-button page-level" data-scope="python">Python</button>
        <button class="filter-button page-level" data-scope="js-ts">JavaScript/TypeScript</button>
        <button class="filter-button page-level" data-scope="go">Go</button>
        <button class="filter-button page-level" data-scope="java">Java</button>
        <button class="filter-button page-level" data-scope="ruby">Ruby</button>
    </div>
    
  <section class="filter-content" markdown="1" data-scope="connection-string">

1. Copy the connection string provided in the **General connection string** section of the dialog, which will be used to connect your application to {{ site.data.products.serverless }}:

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
    You can find these settings by selecting the **Paramters only** option of the **Select option/language** dropdown.

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

  </section>
  <section class="filter-content" markdown="1" data-scope="connection-parameters">
  
1. Select the **Parameters only** option of the **Select option/language** dropdown.

1. Use the connection parameters provided in the dialog to connect to your cluster using a [CockroachDB-compatible tool](../{{site.versions["stable"]}}/third-party-database-tools.html).

    Parameter | Description
    ----------|------------
    `{username}`  | The [SQL user](security-reference/authorization.html#sql-users) connecting to the cluster.
    `{password}`  | The password for the SQL user connecting to the cluster.
    `{host}`  | The host on which the CockroachDB node is running.
    `{port}`  | The port at which the CockroachDB node is listening.
    `{database}`  | The name of the (existing) database.
    `{routing-id}`  | Your cluster's routing ID (e.g., `funky-skunk-123`). The routing ID identifies your tenant cluster on a [multi-tenant host](../cockroachcloud/architecture.html#architecture).

  </section>
  <section class="filter-content" markdown="1" data-scope="cockroachdb-client">

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
  <section class="filter-content" markdown="1" data-scope="python">
  
1. Select **Python** from the **Select option/language** dropdown.
1. Select your tool from the **Select preferred tool** dropdown.
1. Copy the connection code shown in the dialog and add it to your application code.
    
    For more information, see the [documentation for your tool](../stable/connect-to-the-database.html?filters=python).
    
  </section>    
  <section class="filter-content" markdown="1" data-scope="js-ts">
  
1. Select **JavaScript/TypeScript** from the **Select option/language** dropdown.
1. Select your tool from the **Select preferred tool** dropdown.
1. Copy the connection code shown in the dialog and add it to your application code.
    
    For more information, see the [documentation for your tool](../stable/connect-to-the-database.html?filters=js-ts).
      
  </section>
  <section class="filter-content" markdown="1" data-scope="go">
  
1. Select **Go** from the **Select option/language** dropdown.
1. Select your tool from the **Select preferred tool** dropdown.
1. Copy the connection code shown in the dialog and add it to your application code.
    
    For more information, see the [documentation for your tool](../stable/connect-to-the-database.html?filters=go).
      
  </section>
  <section class="filter-content" markdown="1" data-scope="java">

1. Select **Java** from the **Select option/language** dropdown.
1. Select your tool from the **Select preferred tool** dropdown.
1. Copy the connection code shown in the dialog and add it to your application code.
    
    For more information, see the [documentation for your tool](../stable/connect-to-the-database.html?filters=java).
      
  </section>
  <section class="filter-content" markdown="1" data-scope="ruby">
  
1. Select **Ruby** from the **Select option/language** dropdown.
1. Select your tool from the **Select preferred tool** dropdown.
1. Copy the connection code shown in the dialog and add it to your application code.
    
    For more information, see the [documentation for your tool](../stable/connect-to-the-database.html?filters=ruby).
      
  </section>

## What's next

- [Build a "Hello, World" app](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and {{ site.data.products.db }}](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
