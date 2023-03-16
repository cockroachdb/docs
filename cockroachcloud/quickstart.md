---
title: Quickstart with CockroachDB
summary: Get started with a free CockroachDB Cloud cluster.
toc: true
cloud: true
referral_id: docs_quickstart_free
docs_area: get_started
---

This page shows you how to get started with CockroachDB quickly. You'll use `ccloud`, {{ site.data.products.db }}'s command-line interface (CLI) tool, to create a {{ site.data.products.serverless }} cluster and then insert and read some sample data from a Java sample application.

{% include cockroachcloud/free-cluster-limit.md %}

## Install <code>ccloud</code>

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% assign ccloud_version = "0.3.7" %}

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="mac"><strong>Mac</strong></button>
    <button class="filter-button page-level" data-scope="linux"><strong>Linux</strong></button>
    <button class="filter-button page-level" data-scope="windows"><strong>Windows</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">

1. [Install Homebrew](http://brew.sh/).
1. Install using the `ccloud` tap:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    brew install cockroachdb/tap/ccloud
    ~~~

</section>
<section class="filter-content" markdown="1" data-scope="linux">
In a terminal, enter the following command to download and extract the `ccloud` binary and add it to your `PATH`:

{% include_cached copy-clipboard.html %}
~~~ shell
curl https://binaries.cockroachdb.com/ccloud/ccloud_linux-amd64_{{ ccloud_version }}.tar.gz | tar -xz && cp -i ccloud /usr/local/bin/
~~~

</section>
<section class="filter-content" markdown="1" data-scope="windows">
In a PowerShell window, enter the following command to download and extract the `ccloud` binary and add it to your `PATH`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; $null = New-Item -Type Directory -Force $env:appdata/ccloud; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/ccloud/ccloud_windows-amd64_{{ ccloud_version }}.zip -OutFile ccloud.zip; Expand-Archive -Force -Path ccloud.zip; Copy-Item -Force ccloud/ccloud.exe -Destination $env:appdata/ccloud; $Env:PATH += ";$env:appdata/ccloud"; # We recommend adding ";$env:appdata/ccloud" to the Path variable for your system environment. See https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables#saving-changes-to-environment-variables for more information.
~~~
</section>

## Run `ccloud quickstart`

The `ccloud quickstart` command guides you through logging in to CockroachDB Cloud, creating a new {{ site.data.products.serverless }} cluster, and connecting to the new cluster. 

1. In a terminal, run `ccloud quickstart`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud quickstart
    ~~~

1. Log in to {{ site.data.products.db }} using the browser window opened by `ccloud quickstart`. 

    If you are new to {{ site.data.products.db }}, you can register using one of the single sign-on (SSO) options, or create a new account using an email address.

1. In your terminal, follow the `ccloud quickstart` prompts to choose a cluster name, cloud provider, and cloud provider region, and then create the cluster.

    Each prompt has default values that you can select, or change if you want a different option.

1. Once your cluster has been created, follow the prompts in your terminal to connect to your cluster.
    
    You will have to create a SQL user and password, but you can use the default values for the database name and CA certificate path.

1. From the list of available connection options, select **General connection string**, then copy the connection string displayed and save it in a secure location. The connection string is the line starting with `postgresql://`:

    ~~~
    ? How would you like to connect? General connection string
    Retrieving cluster info: succeeded
     Downloading cluster cert to /Users/maxroach/.postgresql/root.crt: succeeded
    postgresql://maxroach:ThisIsNotAGoodPassword@dim-dog-147.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fmaxroach%2F.postgresql%2Froot.crt
    ~~~

1. Use the `cockroach convert-url` command to convert the connection string that you copied earlier to a [valid connection string for JDBC connections](../{{site.current_cloud_version}}/connect-to-the-database.html?filters=java):

      {% include_cached copy-clipboard.html %}
      ~~~ shell
      cockroach convert-url --url "<connection-string>"
      ~~~

      ~~~
      ...
      # Connection URL for JDBC (Java and JVM-based languages):
      jdbc:postgresql://{host}:{port}/{database}?password={password}&sslmode=verify-full&user={username}
      ~~~
    
1. Run the following command to set the `JDBC_DATABASE_URL` environment variable to the JDBC connection string:

    <section class="filter-content" markdown="1" data-scope="mac linux">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export JDBC_DATABASE_URL="<jdbc-connection-string>"
    ~~~

    </section>
    {% comment %} End mac linux {% endcomment %}
    <section class="filter-content" markdown="1" data-scope="windows">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $env:JDBC_DATABASE_URL = "<jdbc-connection-string>"
    ~~~
    
    </section>

The code sample uses the connection string stored in the environment variable `JDBC_DATABASE_URL` to connect to your cluster.

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
- Learn more about [`ccloud`](ccloud-get-started.html).

This page highlights just one way you can get started with CockroachDB. For information on other options that are available when creating a CockroachDB cluster, see the following:

- To create a Self-Hosted cluster, see [Start a Local Cluster](../{{site.versions["stable"]}}/start-a-local-cluster.html).
- To create a {{ site.data.products.dedicated }} cluster, see [Quickstart with {{ site.data.products.dedicated }}](quickstart-trial-cluster.html).
- To create a {{ site.data.products.serverless }} cluster with other configurations (e.g., a different cloud provider, region, or monthly budget), see [Create a {{ site.data.products.serverless }} Cluster](create-a-serverless-cluster.html).
- To connect to a {{ site.data.products.serverless }} cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../{{site.current_cloud_version}}/third-party-database-tools.html)), see [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).
