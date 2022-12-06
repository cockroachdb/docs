---
title: Quickstart with CockroachDB
summary: Get started with a free CockroachDB Cloud cluster.
toc: true
referral_id: docs_quickstart_free
docs_area: get_started
---

This page shows you how to get started with CockroachDB quickly. You'll create a CockroachDB cluster, and then insert and read some sample data from a sample application.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="serverless"><strong>Use a cloud cluster</strong></button>
    <button class="filter-button page-level" data-scope="local"><strong>Use a local cluster</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="serverless">

{{ site.data.products.serverless }} is the easiest way to get started with CockroachDB Cloud. Follow these steps to create a new {{ site.data.products.serverless }} cluster.

To get started with {{ site.data.products.db }} using {{ site.data.products.dedicated }} clusters, see [Quickstart with {{ site.data.products.dedicated }}](quickstart-trial-cluster.html).

</section>
{% comment %} End serverless {% endcomment %}

<section class="filter-content" markdown="1" data-scope="local">

Follow these steps to get started with CockroachDB using a {{ site.data.products.core }} cluster.

</section>
{% comment %} End local {% endcomment %}

<section class="filter-content" markdown="1" data-scope="serverless">

<h2>Choose your installation method</h2>

You can install a {{ site.data.products.serverless }} cluster using either the CockroachDB Cloud Console, a web-based graphical user interface (GUI) tool, or <code>ccloud</code>, a command-line interface (CLI) tool.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="console">Use the Cloud Console (GUI)<strong></strong></button>
    <button class="filter-button page-level" data-scope="ccloud"><strong>Use <code>ccloud</code> (CLI)</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="console">

Follow these steps to create a {{ site.data.products.serverless }} cluster using the CockroachDB Cloud Console, a web based GUI.

## Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Create a SQL user

{% include cockroachcloud/quickstart/create-first-sql-user.md %}

## Connect to the cluster

</section>
{% comment %} End console {% endcomment %}

<section class="filter-content" markdown="1" data-scope="ccloud">

Follow these steps to create a {{ site.data.products.serverless }} cluster using the <code>ccloud</code> CLI tool.

{{site.data.alerts.callout_info}}
The <code>ccloud</code> CLI tool is in Preview.
{{site.data.alerts.end}}

<h2>Install <code>ccloud</code></h2>

{% include cockroachcloud/ccloud/install-ccloud.md %}

## Run `ccloud quickstart` to create a new cluster, create a SQL user, and retrieve the connection string.

{% include cockroachcloud/ccloud/quickstart.md %}

Select **General connection string**, then copy the connection string displayed and save it in a secure location. The connection string is the line starting `postgresql://`.

~~~
? How would you like to connect? General connection string
Retrieving cluster info: succeeded
 Downloading cluster cert to /Users/maxroach/.postgresql/root.crt: succeeded
postgresql://maxroach:ThisIsNotAGoodPassword@dim-dog-147.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fmaxroach%2F.postgresql%2Froot.crt
~~~

</section>
{% comment %} End ccloud {% endcomment %}

</section>
{% comment %} End serverless {% endcomment %}

<section class="filter-content" markdown="1" data-scope="serverless">

<section class="filter-content" markdown="1" data-scope="console">

<section class="filter-content" markdown="1" data-scope="node go">

{% include cockroachcloud/quickstart/get-connection-string.md %}

</section>
{% comment %} End node go {% endcomment %}

<section class="filter-content" markdown="1" data-scope="python">

The **Connect to cluster** dialog shows information about how to connect to your cluster.

1. Select **General connection string** from the **Select option** dropdown.
1. Open a new terminal on your local machine, and run the **CA Cert download command** provided in the **Download CA Cert** section. This certificate is required by most Python clients connecting to {{ site.data.products.db }}.
1. Open the **General connection string** section, then copy the connection string provided and save it in a secure location.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}

</section>
{% comment %} End python {% endcomment %}

<section class="filter-content" markdown="1" data-scope="java">

The **Connect to cluster** dialog shows information about how to connect to your cluster.

1. Select **Java** from the **Select option** dropdown.
1. Copy the `JDBC_DATABASE_URL` environment variable command provided and save it in a secure location.

    This Quickstart uses default certificates, so you can skip the **Download CA Cert** instructions.

    {{site.data.alerts.callout_info}}
    The connection string is pre-populated with your username, password, cluster name, and other details. Your password, in particular, will be provided *only once*. Save it in a secure place (Cockroach Labs recommends a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}

</section>
{% comment %} End java {% endcomment %}

</section>
{% comment %} End console {% endcomment %}

</section>
{% comment %} End serverless {% endcomment %}

## Choose your language

The sample code used in this tutorial is located in the [`quickstart-code-samples` GitHub repo](https://github.com/cockroachdb/quickstart-code-samples). This repo contains code samples written in JavaScript, Python, Go, and Java.

<div class="filters clearfix">
  <button class="filter-button" data-scope="node">Node.js</button>
  <button class="filter-button" data-scope="python">Python</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
</div>

<section class="filter-content" markdown="1" data-scope="node">
Use the [node-postgres](https://node-postgres.com/) driver in a Node.js application.
</section>
{% comment %} End node {% endcomment %}

<section class="filter-content" markdown="1" data-scope="python">
Use the [psycopg3](https://www.psycopg.org/) driver in a Python application.
</section>
{% comment %} End python {% endcomment %}

<section class="filter-content" markdown="1" data-scope="go">
Use the [pgx](https://github.com/jackc/pgx) driver in a Go application.
</section>
{% comment %} End go {% endcomment %}

<section class="filter-content" markdown="1" data-scope="java">
Use the [JDBC driver](https://jdbc.postgresql.org/) in a Java application.
</section>
{% comment %} End java {% endcomment %}

<section class="filter-content" markdown="1" data-scope="local">

<h2>Start CockroachDB</h2>

<section class="filter-content" markdown="1" data-scope="node python go">

{% include common/quickstart/start-demo.md %}

1. Copy the `(sql/unix)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
    #   (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
    #   (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257
    ~~~

    You'll use the `sql/unix` connection string to connect to the cluster later in this tutorial.
</section>
{% comment %} End node python go {% endcomment %}

<section class="filter-content" markdown="1" data-scope="java">

{% include common/quickstart/start-demo.md %}

1. Copy the `(sql/jdbc)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
    #   (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
    #   (sql/jdbc) jdbc:postgresql://127.0.0.1:26257/defaultdb?password=demo76950&sslmode=require&sslrootcert=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957%2Fca.crt&user=demo
    #   (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257
    ~~~

    You'll use the `sql/jdbc` connection string to connect to the cluster later in this tutorial.
</section>
{% comment %} End java {% endcomment %}

## Configure the connection environment variable

</section>
{% comment %} End local {% endcomment %}


<div class="filters clearfix">
  <button class="filter-button" data-scope="mac">Mac</button>
  <button class="filter-button" data-scope="linux">Linux</button>
  <button class="filter-button" data-scope="windows">Windows</button>
</div>

<section class="filter-content" markdown="1" data-scope="node python go">

{% include cockroachcloud/quickstart/database-url-environment-variable.md %}

</section>
{% comment %} End node python go {% endcomment %}

<section class="filter-content" markdown="1" data-scope="java">

<section class="filter-content" markdown="1" data-scope="ccloud">

Use the `cockroach convert-url` command to convert the connection string that you copied earlier to a [valid connection string for JDBC connections](../{{site.current_cloud_version}}/connect-to-the-database.html?filters=java):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach convert-url --url "<connection-string>"
~~~

~~~
...
# Connection URL for JDBC (Java and JVM-based languages):
jdbc:postgresql://{host}:{port}/{database}?password={password}&sslmode=verify-full&user={username}
~~~

</section>
{% comment %} End ccloud{% endcomment %}

<section class="filter-content" markdown="1" data-scope="mac linux">
In a terminal set the `JDBC_DATABASE_URL` environment variable to the JDBC connection string:


{% include_cached copy-clipboard.html %}
~~~ shell
export JDBC_DATABASE_URL="<jdbc-connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `JDBC_DATABASE_URL` to connect to your cluster.
</section>
{% comment %} End mac linux {% endcomment %}

<section class="filter-content" markdown="1" data-scope="windows">
In a terminal set the `JDBC_DATABASE_URL` environment variable to the JDBC connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
$env:JDBC_DATABASE_URL = "<jdbc-connection-string>"
~~~

The code sample uses the connection string stored in the environment variable `JDBC_DATABASE_URL` to connect to your cluster.
</section>
{% comment %} End windows {% endcomment %}

{{site.data.alerts.callout_success}}
For reference information about connecting to CockroachDB with supported client drivers, see [Connect to a CockroachDB Cluster](../../docs/stable/connect-to-the-database.html).
{{site.data.alerts.end}}

</section>
{% comment %} End java {% endcomment %}

## Run the sample code

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
      1. Connects to {{ site.data.products.db }} with the [node-postgres driver](https://node-postgres.com) using the connection string set in the `DATABASE_URL` environment variable.
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

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
{% comment %} End node {% endcomment %}

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
      1. Connects to {{ site.data.products.db }} with the [psycopg2 driver](https://www.psycopg.org) using the connection string set in the `DATABASE_URL` environment variable.
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

1. Install psycopg3.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    pip3 install "psycopg[binary]"
    ~~~

1. Run the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    python3 main.py
    ~~~

    The output will look like this:

    ~~~
    Hello world!
    ~~~

</section>
{% comment %} End python {% endcomment %}

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
      1. Connects to {{ site.data.products.db }} with the [pgx driver](https://github.com/jackc/pgx) using the connection string set in the `DATABASE_URL` environment variable.
      1. Creates a table.
      1. Inserts some data into the table.
      1. Reads the inserted data.
      1. Prints the data to the terminal.

1. Initialize and run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go mod init basic-sample
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    go mod tidy
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
{% comment %} End go {% endcomment %}

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

</section>
{% comment %} End java {% endcomment %}

## Next steps

- Build a simple CRUD application in [Go](../{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb.html), [Java](../{{site.current_cloud_version}}/build-a-java-app-with-cockroachdb.html), [Node.js](../{{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb.html), or [Python](../{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb.html).
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Explore our [example apps](../{{site.current_cloud_version}}/example-apps.html) for examples on how to build applications using your preferred driver or ORM and run it on CockroachDB.
- [Migrate your existing data](../{{site.current_cloud_version}}/migration-overview.html).

## Learn more

This page outlines the quickest way to get started with CockroachDB. For information on other options that are available when creating a CockroachDB cluster, see the following:

- To create a free cluster with other configurations (e.g., a different cloud provider, region, or monthly budget), see [Create a {{ site.data.products.serverless }} Cluster](create-a-serverless-cluster.html).
- To connect to a free cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../{{site.current_cloud_version}}/third-party-database-tools.html)), see [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).
- To watch a video tutorial of connecting to a cluster, see [Setting Up a {{ site.data.products.serverless }} Cluster](https://www.youtube.com/watch?v=6CIDXdlnwHk).
- To watch a video tutorial of running queries against a cluster, see [Using a {{ site.data.products.serverless }} Cluster](https://www.youtube.com/watch?v=VCuTmvKXjP0).
