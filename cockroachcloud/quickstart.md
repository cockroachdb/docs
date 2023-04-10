---
title: Quickstart with CockroachDB
summary: Get started with a free CockroachDB Cloud cluster.
toc: true
cloud: true
referral_id: docs_quickstart_free
docs_area: get_started
---

This page shows you how to get started with CockroachDB quickly. You'll use the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) to create a {{ site.data.products.serverless }} cluster and then insert and read some sample data from a Java sample application.

## Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Create a SQL user

{% include cockroachcloud/quickstart/create-first-sql-user.md %}

## Connect to the cluster

Once you create a SQL user, the **Connect to cluster** dialog will show information about how to connect to your cluster.

1. Select **Java** from the **Select option/language** dropdown.
1. Copy the `JDBC_DATABASE_URL` environment variable command provided and save it in a secure location.

    This Quickstart uses default certificates, so you can skip the Download CA Cert instructions.

    {{site.data.alerts.callout_info}} 
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only* once. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [SQL Users page](user-authorization.html).
    {{site.data.alerts.end}}
    
## Configure the connection environment variable

<div class="filters clearfix">
  <button class="filter-button" data-scope="mac">Mac</button>
  <button class="filter-button" data-scope="linux">Linux</button>
  <button class="filter-button" data-scope="windows">Windows</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac linux">
In a terminal set the `JDBC_DATABASE_URL` environment variable to the JDBC connection string:

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
      1. Connects to {{ site.data.products.db }} with the [JDBC driver](https://jdbc.postgresql.org) using the JDBC connection string set in the `JDBC_DATABASE_URL` environment variable.
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
    
## Learn more

Now that you have a free {{ site.data.products.serverless }} cluster running, try out the following:

- Build a simple CRUD application in [Go](../{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.html), [Java](../{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.html), [Node.js](../{{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb.html), or [Python](../{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.html).
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Explore our [example apps](../{{site.current_cloud_version}}/example-apps.html) for examples on how to build applications using your preferred driver or ORM and run it on CockroachDB.
- [Migrate your existing data](../{{site.current_cloud_version}}/migration-overview.html).

This page highlights just one way you can get started with CockroachDB. For information on other options that are available when creating a CockroachDB cluster, see the following:

- To create a Self-Hosted cluster, see [Start a Local Cluster](../{{site.versions["stable"]}}/start-a-local-cluster.html).
- To create a {{ site.data.products.dedicated }} cluster, see [Quickstart with {{ site.data.products.dedicated }}](quickstart-trial-cluster.html).
- To create a {{ site.data.products.serverless }} cluster with other configurations (e.g., a different cloud provider, region, or monthly budget), see [Create a {{ site.data.products.serverless }} Cluster](create-a-serverless-cluster.html).
- To connect to a {{ site.data.products.serverless }} cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../{{site.current_cloud_version}}/third-party-database-tools.html)), see [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).
