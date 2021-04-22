---
title: Quickstart with CockroachCloud Free (beta)
summary: Learn how to create and use your free CockroachCloud cluster.
toc: true
redirect_from:
- ../stable/cockroachcloud-quickstart.html
- create-your-account.html
---

<div class="filters clearfix">
    <a href="quickstart.html"><button class="filter-button page-level current">CockroachCloud Free (beta)</button></a>
    <a href="quickstart-trial-cluster.html"><button class="filter-button page-level">CockroachCloud</button></a>
</div>

This page shows you how to deploy a CockroachDB cluster on CockroachCloud Free (beta), connect to it using the CockroachDB [built-in SQL client](../v20.2/cockroach-sql.html), and run sample SQL statements. This is the simplest way to get started with CockroachCloud using the default options and minimal security. To create a more advanced CockroachCloud cluster, see [Create a Free Cluster](create-a-free-cluster.html).

{% include cockroachcloud/free-limitations.md %}

## Step 1. Create a free cluster

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_quickstart_free" rel="noopener" target="_blank">sign up for a CockroachCloud account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
1. On the **Clusters** page, click **Create Cluster**.
1. On the **Create your cluster** page, select **CockroachCloud Free**.

    {{site.data.alerts.callout_info}}
    This cluster will be free forever.
    {{site.data.alerts.end}}

1. Click **Create your free cluster**.

Your cluster will be created in approximately 20-30 seconds.

## Step 2. Set up your cluster connection

Once your cluster is created, the **Connection info** dialog displays. Use the information provided in the dialog to set up your cluster connection for the SQL user that was created by default:

1. Copy the connection string provided, which will be used in the next steps (and to connect to your cluster in the future).

    {{site.data.alerts.callout_danger}}
    This connection string contains your password, which will be provided only once. If you forget your password, you can reset it by going to the [**SQL Users** page](https://www.cockroachlabs.com/docs/cockroachcloud/user-authorization.html).
    {{site.data.alerts.end}}

## Step 3. Install CockroachDB

If you have not done so already, install the CockroachDB binary:

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="mac">Mac</button>
  <button class="filter-button page-level" data-scope="linux">Linux</button>
  <button class="filter-button page-level" data-scope="windows">Windows</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">
1. Open your terminal and run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~

    {{site.data.alerts.callout_info}}
    You can also use Homebrew to install the CockroachDB binary by running `brew install cockroachdb/tap/cockroach`.
    {{site.data.alerts.end}}
    
1. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:
    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~

    {{site.data.alerts.callout_info}}
    If you used Homebrew, Homebrew will automatically add the CockroachDB binary to your path.
    {{site.data.alerts.end}}
</section>
    
<section class="filter-content" markdown="1" data-scope="linux">
1. Open the command line and run the following command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~
    
1. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~
</section>
    
<section class="filter-content" markdown="1" data-scope="windows">
  {% include windows_warning.md %}

1. Download and extract the <a href="https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip" class="windows-binary-download" id="windows-binary-download-{{page.version.version}}" data-eventcategory="windows-binary-download">CockroachDB {{ page.release_info.version }} archive for Windows</a>.
    
    
1. To ensure that CockroachDB can use location-based names as time zone identifiers, download Go's official [zoneinfo.zip](https://github.com/golang/go/raw/master/lib/time/zoneinfo.zip) and set the `ZONEINFO` [environment variable](https://www.techjunkie.com/environment-variables-windows-10/).
    
    
1. Open PowerShell, navigate to the directory containing the executable, and make sure it works:
    <div class="copy-clipboard">
      <svg data-eventcategory="windows-binary-button" id="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><style>.st0{fill:#A2A2A2;}</style><title>icon/buttons/copy</title><g id="Mask"><path id="path-1_1_" class="st0" d="M4.9 4.9v6h6v-6h-6zM3.8 3.8H12V12H3.8V3.8zM2.7 7.1v1.1H.1S0 5.5 0 0h8.2v2.7H7.1V1.1h-6v6h1.6z"/></g></svg>
      <svg id="copy-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 10"><style>.st1{fill:#54B30E;}</style><path id="path-1_2_" class="st1" d="M3.8 9.1c-.3 0-.5-.1-.6-.2L.3 6C0 5.7-.1 5.2.2 4.8c.3-.4.9-.4 1.3-.1L3.8 7 10.6.2c.3-.3.9-.4 1.2 0 .3.3.3.9 0 1.2L4.4 8.9c-.2.1-.4.2-.6.2z"/></svg>
    </div>
    <div class="highlight"><pre class="highlight"><code><span class="nb">PS </span>C:\cockroach-{{ page.release_info.version }}.windows-6.2-amd64> .\cockroach.exe version</code></pre></div>
</section>

## Step 4. Use the built-in SQL client

You can now connect to your cluster using CockroachDB's built-in SQL client:

1. In your terminal, run the following command to connect to your cluster using the [connection string](#step-2-set-up-your-cluster-connection):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url 'postgres://<username>:<password>@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=require&options=--cluster=<cluster-name>'
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

## What's next?

Learn more:

- Use the [built-in SQL client](../v20.2/cockroach-sql.html) to connect to your cluster and [learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Build a ["Hello World" app with the Django framework](../v20.2/build-a-python-app-with-cockroachdb-django.html), or [install a client driver](../stable/install-client-drivers.html) for your favorite language.
- Explore our [sample apps](../stable/hello-world-example-apps.html) for examples on how to build simple "Hello World" applications using CockroachCloud Free (beta).
