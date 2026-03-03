---
title: Quickstart with CockroachDB
summary: Learn how to use free trial credits to deploy a CockroachDB cluster on CockroachDB Standard (Preview) and run your first queries.
toc: true
cloud: true
referral_id: docs_quickstart_free
docs_area: get_started
---

This page shows you how to use free trial credits to deploy a CockroachDB cluster on CockroachDB {{ site.data.products.standard }} (Preview) and use sample code to run your first queries.

## Create a free trial cluster

{% include_cached cockroachcloud/quickstart/create-free-trial-standard-cluster.md %}

## Create a SQL user

{% include cockroachcloud/quickstart/create-first-sql-user.md %}

## Connect to the cluster

Select a language to connect a sample application to your cluster. To connect to your cluster directly from the command line, refer to [Connect to a {{ site.data.products.standard }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

    <div class="filters clearfix">
      <button class="filter-button" data-scope="java">Java</button>
      <button class="filter-button" data-scope="node">Node.js</button>
    </div>
    <section class="filter-content" markdown="1" data-scope="java">

Once you create a SQL user, the **Connect to cluster** dialog will show information about how to connect to your cluster.

1. Select **Java** from the **Select option/language** dropdown.
1. Copy the `JDBC_DATABASE_URL` environment variable command provided and save it in a secure location.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only* once. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, a Cluster Admin can reset it. Refer to: [Managing SQL users on a cluster]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster)
    {{site.data.alerts.end}}

## Configure the connection environment variable

<div class="filters clearfix">
  <button class="filter-button" data-scope="mac">Mac</button>
  <button class="filter-button" data-scope="linux">Linux</button>
  <button class="filter-button" data-scope="windows">Windows</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac linux">
In a terminal, set the `JDBC_DATABASE_URL` environment variable to the JDBC connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
export JDBC_DATABASE_URL="<jdbc-connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `JDBC_DATABASE_URL` to connect to your cluster.
</section>

<section class="filter-content" markdown="1" data-scope="windows">
In a terminal set the `JDBC_DATABASE_URL` environment variable to the JDBC connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
$env:JDBC_DATABASE_URL = "<jdbc-connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `JDBC_DATABASE_URL` to connect to your cluster.
</section>

## Run the Java sample code

1. Clone the `quickstart-code-samples` repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachdb/quickstart-code-samples
    ~~~

1. Navigate to the `java` directory of the repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd quickstart-code-samples/java
    ~~~

    The code sample in this directory does the following:
      1. Connects to CockroachDB {{ site.data.products.cloud }} with the [JDBC driver](https://jdbc.postgresql.org) using the JDBC connection string set in the `JDBC_DATABASE_URL` environment variable.
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

1. Run the application using `gradlew`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./gradlew run
    ~~~

    The output should look like this:

    ~~~
    > Task :app:run
    Hello world!

    BUILD SUCCESSFUL in 3s
    2 actionable tasks: 2 executed
    ~~~

</section>
<section class="filter-content" markdown="1" data-scope="node">

Once you create a SQL user, the **Connect to cluster** dialog will show information about how to connect to your cluster.

1. Select **General connection string** from the **Select option** dropdown.
1. Open the **General connection string** section, then copy the connection string provided and save it in a secure location.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only* once. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, a Cluster Admin can reset it. Refer to: [Managing SQL users on a cluster]({% link cockroachcloud/managing-access.md %}#manage-sql-users-on-a-cluster)
    {{site.data.alerts.end}}

## Configure the connection environment variable

<div class="filters clearfix">
  <button class="filter-button" data-scope="mac">Mac</button>
  <button class="filter-button" data-scope="linux">Linux</button>
  <button class="filter-button" data-scope="windows">Windows</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac linux">
In a terminal set the `DATABASE_URL` environment variable to the connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
export DATABASE_URL="<connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `DATABASE_URL` to connect to your cluster.
</section>

<section class="filter-content" markdown="1" data-scope="windows">
In a terminal set the `DATABASE_URL` environment variable to the connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
$env:DATABASE_URL = "<connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `DATABASE_URL` to connect to your cluster.
</section>

## Run the Node.js sample code

1. Clone the `quickstart-code-samples` repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachdb/quickstart-code-samples
    ~~~

1. Navigate to the `node` directory of the repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd quickstart-code-samples/node
    ~~~

    The code sample in this directory does the following:
      1. Connects to CockroachDB {{ site.data.products.cloud }} with the [node-postgres driver](https://node-postgres.com) using the connection string set in the `DATABASE_URL` environment variable.
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.


1. Install the app requirements:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

1. Run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ node app.js
    ~~~

    The output will look like this:

    ~~~
    Hello world!
    ~~~

</section>

## Learn more

Now that you have a CockroachDB {{ site.data.products.standard }} cluster running, try out the following:

- Build a simple CRUD application in [Go]({% link {{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.md %}), [Java]({% link {{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.md %}), [Node.js]({% link {{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb.md %}), or [Python]({% link {{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.md %}).
- Learn [CockroachDB SQL]({% link {{site.current_cloud_version}}/sql-statements.md %}).
- [Create and manage SQL users]({% link cockroachcloud/managing-access.md %}).
- Explore our [example apps]({% link {{site.current_cloud_version}}/example-apps.md %}) for examples on how to build applications using your preferred driver or ORM and run it on CockroachDB.
- [Migrate your existing data]({% link molt/migration-overview.md %}).

This page highlights just one way you can get started with CockroachDB. For information on other options that are available when creating a CockroachDB cluster, see the following:

- To create a Self-Hosted cluster, see [Start a Local Cluster]({% link {{site.current_cloud_version}}/start-a-local-cluster.md %}).
- To create a CockroachDB {{ site.data.products.advanced }} cluster, see [Quickstart with CockroachDB {{ site.data.products.advanced }}]({% link cockroachcloud/quickstart-trial-cluster.md %}).
- To create a CockroachDB {{ site.data.products.standard }} cluster with other configurations (e.g., a different cloud provider, region, or provisioned capacity), see [Create a CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/create-your-cluster.md %}).
- To connect to a CockroachDB {{ site.data.products.standard }} cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool]({% link {{site.current_cloud_version}}/third-party-database-tools.md %})), see [Connect to a CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).
