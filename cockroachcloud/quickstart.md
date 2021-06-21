---
title: Quickstart with CockroachCloud Free (beta)
summary: Learn how to create and use your free CockroachCloud cluster.
toc: true
---

<div class="filters clearfix">
    <a href="quickstart.html"><button class="filter-button page-level current">CockroachCloud Free (beta)</button></a>
    <a href="quickstart-trial-cluster.html"><button class="filter-button page-level">CockroachCloud</button></a>
</div>

This page guides you through the quickest way to get started with CockroachDB by setting up a CockroachCloud Free (beta) cluster with the default options and minimal connection security. For information on how to create a CockroachCloud cluster with other options, see the [Learn more](#learn-more) section.

{% include cockroachcloud/free-limitations.md %}

## Step 1. Create a free cluster

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_quickstart_free" rel="noopener" target="_blank">sign up for a CockroachCloud account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
1. On the **Clusters** page, click **Create Cluster**.
1. On the **Create your cluster** page, select **CockroachCloud Free**.
1. Click **Create your free cluster**.

    Your cluster will be created in approximately 20-30 seconds and the **Connection info** dialog will display.

1. Skip Step 1 (downloading the CA certificate) since we are going to connect with the less secure option `sslmode=required` instead.

## Step 2. Install CockroachDB

If you have not done so already, install the CockroachDB binary:

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="mac">Mac</button>
  <button class="filter-button page-level" data-scope="linux">Linux</button>
  <button class="filter-button page-level" data-scope="windows">Windows</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">

1. In your terminal, use [Homebrew](https://brew.sh/) to install CockroachDB by running the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ brew install cockroachdb/tap/cockroach
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="linux">

1. In your terminal, download the CockroachDB binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

1. Copy the binary into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="windows">

1. Download and extract the [CockroachDB {{ page.release_info.version }} archive for Windows](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip).

1. Open PowerShell, navigate to the directory containing the executable, and make sure it works:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    PS C:\cockroach-{{ page.release_info.version }}.windows-6.2-amd64> .\cockroach.exe version
    ~~~

</section>

## Step 3. Edit your connection string

1. Copy the connection string provided in Step 3 of the dialog, and save it in a secure place (e.g., in a password manager) to use in the next steps (and to connect to your cluster in the future).

    {{site.data.alerts.callout_danger}}
    This connection string contains your password, which will be provided only once. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}

1. Edit your connection string by replacing `sslmode=verify-full&sslrootcert=<your_certs_directory>/cc-ca.crt` with `sslmode=require`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url 'postgres://<username>:<password>@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=require&options=--cluster=<cluster-name>'
    ~~~

    Your username, password, and cluster name are pre-populated for you.

## Step 4. Use the built-in SQL client

You can now connect to your cluster using CockroachDB's built-in SQL client:

1. In your terminal, run the command with the updated connection string:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url 'postgres://<username>:<password>@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=require&options=--cluster=<cluster-name>'
    ~~~

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

## Learn more

This page outlines the quickest way to get started with CockroachDB. For information on other options that are available when creating a CockroachCloud Free (beta) cluster, see the following:

- To create a free cluster with other configurations (e.g., a different cloud provider or region), see [Create a CockroachCloud Free (beta) Cluster](create-a-free-cluster.html).
- To connect to a free cluster with other options (e.g., a CA certificate or different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../stable/third-party-database-tools.html)), see [Connect to a CockroachCloud Free (beta) Cluster](connect-to-a-free-cluster.html).
- For information about how to connect securely to your cluster (recommended), see [Authentication](authentication.html).
- To watch a video walkthrough of connecting to a cluster, see [How to connect to CockroachCloud and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).

Next steps:

- Use the [built-in SQL client](../{{site.versions["stable"]}}/cockroach-sql.html) to connect to your cluster and [learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Build a ["Hello World" app with the Django framework](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb-django.html), or [install a client driver](../{{site.versions["stable"]}}/install-client-drivers.html) for your favorite language.
- Explore our [sample apps](../{{site.versions["stable"]}}/hello-world-example-apps.html) for examples on how to build simple "Hello World" applications using CockroachCloud Free (beta).
