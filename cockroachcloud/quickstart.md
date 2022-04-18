---
title: Quickstart with CockroachDB Serverless (beta)
summary: Learn how to create and use your free CockroachDB Cloud cluster.
toc: true
referral_id: docs_quickstart_free
filter_category: qs_crdb_cloud
filter_html: CockroachDB Serverless (beta)
filter_sort: 1
docs_area: get_started
---

{% include filter-tabs.md %}

This page shows you how to get started with {{ site.data.products.db }} quickly. You'll create a free {{ site.data.products.serverless }} cluster, and then insert and read some sample data from a sample application.

{% include cockroachcloud/free-limitations.md %}

The sample code used in this tutorial is located in the [`quickstart-code-samples` GitHub repo](https://github.com/cockroachdb/quickstart-code-samples). This repo contains code samples written in JavaScript, Python, Go, and Java. Select the language that you want to use:

<div class="filters clearfix">
  <button class="filter-button" data-scope="node">Node.js</button>
  <button class="filter-button" data-scope="python">Python</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
</div>

## Step 1. Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Step 2. Create a SQL user

{% include cockroachcloud/quickstart/create-first-sql-user.md %}

## Step 3. Connect to the cluster

<section class="filter-content" markdown="1" data-scope="node">

{% include cockroachcloud/quickstart/get-connection-string.md %}

</section>

<section class="filter-content" markdown="1" data-scope="python">

The **Connect to cluster** dialog shows information about how to connect to your cluster.

1. Select **General connection string** from the **Select option** dropdown.
1. Open a new terminal on your local machine, and run the **CA Cert download command** provided in the **Download CA Cert** section. This certificate is required by most Python clients connecting to {{ site.data.products.db }}.
1. Open the **General connection string** section, then copy the connection string provided and save it in a secure location.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="go">

{% include cockroachcloud/quickstart/get-connection-string.md %}

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include cockroachcloud/quickstart/get-connection-string.md %}

1. If you haven't already, install the [`cockroach` binary](../stable/install-cockroachdb.html) and add it to your OS's `PATH`.

</section>

## Step 4. Run the sample code

<section class="filter-content" markdown="1" data-scope="node">

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
      1. Connects to {{ site.data.products.db }} with the [node-postgres driver](https://node-postgres.com).
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

1. Set the `DATABASE_URL` environment variable to the connection string that you [copied from the {{ site.data.products.cloud }} Console earlier](#step-3-connect-to-the-cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export DATABASE_URL="<connection-string>"
    ~~~

    The code sample uses the connection string stored in the environment variable `DATABASE_URL` to connect to your cluster.

    {{site.data.alerts.callout_success}}
    For reference information about connecting to CockroachDB with supported client drivers, see [Connect to a CockroachDB Cluster](../stable/connect-to-the-database.html?filters=js-ts).
    {{site.data.alerts.end}}

1. Install the code dependencies:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npm install
    ~~~

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    node app.js
    ~~~

    The output will look like this:

    ~~~
    Hello world!
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

1. Clone the `quickstart-code-samples` repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachdb/quickstart-code-samples
    ~~~  

1. Navigate to the `python` directory of the repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd quickstart-code-samples/python
    ~~~

    The code sample in this directory does the following:
      1. Connects to {{ site.data.products.db }} with the [psycopg2 driver](https://www.psycopg.org).
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

1. Set the `DATABASE_URL` environment variable to the connection string that you [copied from the {{ site.data.products.cloud }} Console earlier](#step-3-connect-to-the-cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export DATABASE_URL="<connection-string>"
    ~~~

    The code sample uses the connection string stored in the environment variable `DATABASE_URL` to connect to your cluster.

    {{site.data.alerts.callout_success}}
    For reference information about connecting to CockroachDB with supported client drivers, see [Connect to a CockroachDB Cluster](../stable/connect-to-the-database.html?filters=python).
    {{site.data.alerts.end}}

1. Install psycopg2.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    pip install -r requirements.txt
    ~~~

1. Run the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    python main.py
    ~~~

    The output will look like this:

    ~~~
    Hello world!
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

1. Clone the `quickstart-code-samples` repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachdb/quickstart-code-samples
    ~~~

1. Navigate to the `go` directory of the repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd quickstart-code-samples/go
    ~~~

    The code sample in this directory does the following:
      1. Connects to {{ site.data.products.db }} with the [pgx driver](https://github.com/jackc/pgx).
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

1. Set the `DATABASE_URL` environment variable to the connection string that you [copied from the {{ site.data.products.cloud }} Console earlier](#step-3-connect-to-the-cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export DATABASE_URL="<connection-string>"
    ~~~

    The code sample uses the connection string stored in the environment variable `DATABASE_URL` to connect to your cluster.

    {{site.data.alerts.callout_success}}
    For reference information about connecting to CockroachDB with supported client drivers, see [Connect to a CockroachDB Cluster](../stable/connect-to-the-database.html?filters=go).
    {{site.data.alerts.end}}

1. Initialize and run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go mod init basic-sample && go mod tidy
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go run main.go
    ~~~

    The output will look like this:

    ~~~
    Hello world!
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="java">

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
      1. Connects to {{ site.data.products.db }} with the [JDBC driver](https://jdbc.postgresql.org).
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

1. Use the `cockroach convert-url` command to convert the connection string that you [copied from the {{ site.data.products.cloud }} Console earlier](#step-3-connect-to-the-cluster) to a [valid connection string for JDBC connections](../stable/connect-to-the-database.html?filters=java):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach convert-url --url "<connection-string>"
    ~~~

    ~~~
    ...

    # Connection URL for JDBC (Java and JVM-based languages):
    jdbc:postgresql://{host}:{port}/{database}?options=--cluster%3D{routing-id}&password={password}&sslmode=verify-full&user={username}
    ~~~

1. Set the `JDBC_DATABASE_URL` environment variable to the JDBC-compatible connection string:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export JDBC_DATABASE_URL="<jdbc-connection-string>"
    ~~~

    The code sample uses the connection string stored in the environment variable `JDBC_DATABASE_URL` to connect to your cluster.

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

## Next steps

You've successfully created your {{ site.data.products.serverless }} cluster, connected to it using the SQL client, and run some basic SQL statements.

- Build a simple CRUD application in [Go](../{{site.versions["stable"]}}/build-a-go-app-with-cockroachdb.html), [Java](../{{site.versions["stable"]}}/build-a-java-app-with-cockroachdb.html), [Node.js](../{{site.versions["stable"]}}/build-a-nodejs-app-with-cockroachdb.html), or [Python](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb.html).
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Explore our [example apps](../{{site.versions["stable"]}}/example-apps.html) for examples on how to build applications using your preferred driver or ORM and run it on {{ site.data.products.serverless }}.

## Learn more

This page outlines the quickest way to get started with CockroachDB. For information on other options that are available when creating a {{ site.data.products.serverless }} cluster, see the following:

- To create a free cluster with other configurations (e.g., a different cloud provider, region, or monthly budget), see [Create a {{ site.data.products.serverless }} Cluster](create-a-serverless-cluster.html).
- To connect to a free cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../stable/third-party-database-tools.html)), see [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).
- To watch a video walkthrough of connecting to a cluster, see [How to connect to {{ site.data.products.db }} and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).
