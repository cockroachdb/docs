---
title: Quickstart with CockroachDB
summary: Get started with a free CockroachDB Cloud cluster.
toc: true
referral_id: docs_quickstart_free
docs_area: get_started
---

This page shows you how to get started with CockroachDB quickly. You'll use [`ccloud`](ccloud-get-started.html) to create a CockroachDB cluster, and then insert and read some sample data from a Node.js sample application.

{{ site.data.products.serverless }} is the easiest way to get started with CockroachDB. You can also [start a local cluster](../{{site.versions["stable"]}}/start-a-local-cluster.html) or [start a {{ site.data.products.dedicated }} cluster](quickstart-trial-cluster.html).

{{site.data.alerts.callout_info}}
The <code>ccloud</code> CLI tool is in Preview.
{{site.data.alerts.end}}

## Install <code>ccloud</code>

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

The `ccloud quickstart` command guides you through logging in to CockroachDB Cloud, creating a new {{ site.data.products.serverless }} with a $0 spend limit, and connecting to the new cluster. 

1. In a terminal, run `ccloud quickstart`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud quickstart
    ~~~

1. Log in to {{ site.data.products.db }} using the browser window opened by `ccloud quickstart`. If you are new to {{ site.data.products.db }}, you can register using one of the single sign-on (SSO) options, or create a new account using an email address.

1. In your terminal, follow the `ccloud quickstart` prompts to choose a cluster name, cloud provider, and cloud provider region, and then connect to the cluster. Each prompt has default values that you can select, or change if you want a different option.

1. From the list of available connection options, select **General connection string**, then copy the connection string displayed and save it in a secure location. The connection string is the line starting `postgresql://`:

    ~~~
    ? How would you like to connect? General connection string
    Retrieving cluster info: succeeded
     Downloading cluster cert to /Users/maxroach/.postgresql/root.crt: succeeded
    postgresql://maxroach:ThisIsNotAGoodPassword@dim-dog-147.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=%2FUsers%2Fmaxroach%2F.postgresql%2Froot.crt
    ~~~

1. Run the following command to set the `DATABASE_URL` environment variable to the connection string:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

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
