---
title: Quickstart with CockroachDB Serverless (beta)
summary: Learn how to create and use your free CockroachDB Cloud cluster.
toc: true
---

<div class="filters clearfix">
    <a href="quickstart.html"><button class="filter-button page-level current">{{ site.data.products.serverless }}</button></a>
    <a href="quickstart-trial-cluster.html"><button class="filter-button page-level">{{ site.data.products.dedicated }}</button></a>
</div>

This page guides you through the quickest way to get started with CockroachDB by setting up a {{ site.data.products.serverless }} cluster with the default options. For information on how to create a {{ site.data.products.db }} cluster with other options, see the [Learn more](#learn-more) section.

{% include cockroachcloud/free-limitations.md %}

## Step 1. Create a free cluster

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_quickstart_free" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
1. On the **Clusters** page, click **Create Cluster**.
1. On the **Create your cluster** page, select **{{ site.data.products.serverless-plan }}**.

    Unless you change your monthly budget, this cluster will be free forever.

1. Click **Create cluster**.

    Your cluster will be created in approximately 20-30 seconds and the **Connection info** dialog will display.

1. Click the **Connection string** tab in the **Connection info** dialog and copy the connection string in step 2 to a secure location.

    {{site.data.alerts.callout_danger}}
    This connection string contains your password, which will be provided only once. Save it in a secure place (e.g., in a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}

## Step 2. Choose your OS

The **Connection info** dialog shows information about how to connect to your cluster for the client OS. Select your OS from the **Choose your OS** drop down, then select **Mac**, **Linux**, or **Windows** in the tabs below.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="mac">Mac</button>
  <button class="filter-button page-level" data-scope="linux">Linux</button>
  <button class="filter-button page-level" data-scope="windows">Windows</button>
</div>

## Step 3. Install CockroachDB

If you have not done so already, install the CockroachDB binary and copy it into the `PATH`. In a terminal run the command in step 1 of the **Command Line** tab of the **Connection info** dialog:

<section class="filter-content" markdown="1" data-scope="mac">
{% include_cached copy-clipboard.html %}
~~~ shell
curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz | tar -xJ && cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
~~~
</section>

<section class="filter-content" markdown="1" data-scope="linux">
{% include_cached copy-clipboard.html %}
~~~ shell
curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz | tar -xz && sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
~~~
</section>

<section class="filter-content" markdown="1" data-scope="windows">
{% include_cached copy-clipboard.html %}
~~~ shell
$ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;
$ProgressPreference = 'SilentlyContinue';
# Use Windows New-Item with Force
$null = New-Item -Type Directory -Force $env:appdata/cockroach;
Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip -OutFile cockroach.zip;
Expand-Archive -Path cockroach.zip;
# Add force if the cockroach binary is already there
Copy-Item -Force "cockroach/cockroach-{{ page.release_info.version }}.windows-6.2-amd64/cockroach.exe" -Destination $env:appdata/cockroach;
$Env:PATH += ";$env:appdata/cockroach";
# Add command to append the cockroach binary path on every shell. Powershell equivalent of `.bashrc`
Add-Content -Path C:\Users\$env:UserName\Documents\WindowsPowerShell\profile.ps1 -Value '$Env:PATH += ";$env:appdata/cockroach"'
~~~
</section>

## Step 4. Download the CA certificate

In your terminal, download the CA certificate. Run the command in step 2 of the **Command Line** tab in the **Connection info** dialog:

<section class="filter-content" markdown="1" data-scope="mac">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
~~~

Your `cert` file will be downloaded to `~/.postgres/root.crt`.
</section>

<section class="filter-content" markdown="1" data-scope="linux">
{% include_cached copy-clipboard.html %}
~~~ shell
curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
~~~

Your `cert` file will be downloaded to `~/.postgres/root.crt`.
</section>

<section class="filter-content" markdown="1" data-scope="windows">
{% include_cached copy-clipboard.html %}
~~~ shell
mkdir -p $env:appdata\.postgresql\; Invoke-WebRequest -Uri https://cockroachlabs.cloud/clusters/<cluster-id>/cert -OutFile $env:appdata\.postgresql\root.crt
~~~

Your `cert` file will be downloaded to `%APPDATA%/.postgres/root.crt`.
</section>

Where `<cluster-id>` is the ID of the cluster. You can find the cluster ID in step 2 of the **Command Line** tab in the **Connect** dialog.

{{site.data.alerts.callout_info}}
The `~/.postgres/root.crt` (Mac and Linux) or `%APPDATA%/.postgres/root.crt` is the [default location for CA certificates](https://www.postgresql.org/docs/current/libpq-ssl.html) when using PostgreSQL drivers and ORMs.
{{site.data.alerts.end}}

## Step 5. Use the built-in SQL client

Connect to your cluster using the CockroachDB SQL command-line client.

1. In your terminal, run the connection string provided in step 3 of the **Command Line** tab in the **Connection info** dialog. Your username, password, host, and cluster name are pre-populated for you in the dialog.

    {% include cockroachcloud/sql-connection-string-free.md %}

    A welcome message displays:

    ~~~
    #
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    ~~~

1. You can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    -----+----------
       1 | 1000.50
    (1 row)
    ~~~

1. To exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Next steps

You've successfully created your {{ site.data.products.serverless }} cluster, connected to it using the SQL client, and run some basic SQL statements.

- Build a Hello World app with in [Go](../{{site.versions["stable"]}}/hello-world-go-pgx.html), [Java](../{{site.versions["stable"]}}/hello-world-java-jdbc.html), [Node.js](../{{site.versions["stable"]}}/hello-world-node-postgres.html), or [Python](../{{site.versions["stable"]}}/hello-world-python-sqlalchemy.html).
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Explore our [sample apps](../{{site.versions["stable"]}}/hello-world-example-apps.html) for examples on how to build simple "Hello World" applications using {{ site.data.products.serverless }}.

## Learn more

This page outlines the quickest way to get started with CockroachDB. For information on other options that are available when creating a {{ site.data.products.serverless }} cluster, see the following:

- To create a free cluster with other configurations (e.g., a different cloud provider, region, or monthly budget), see [Create a {{ site.data.products.serverless }} Cluster](create-a-serverless-cluster.html).
- To connect to a free cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../stable/third-party-database-tools.html)), see [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).
- To watch a video walkthrough of connecting to a cluster, see [How to connect to {{ site.data.products.db }} and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).

