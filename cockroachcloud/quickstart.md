---
title: Quickstart with CockroachCloud Free (beta)
summary: Learn how to create and use your free CockroachCloud cluster.
toc: true
redirect_from:
- ../stable/cockroachcloud-quickstart.html
- create-your-account.html
---

<div class="filters clearfix">
    <a href="quickstart.html"><button class="filter-button page-level current"><strong>CockroachCloud Free (beta)</strong></button></a>
    <a href="quickstart-trial-cluster.html"><button class="filter-button page-level"><strong>CockroachCloud (30-day trial)</strong></button></a>
</div>

This page shows you how to deploy a CockroachDB cluster on CockroachCloud Free (beta), connect to it using the CockroachDB [built-in SQL client](../v20.2/cockroach-sql.html), and run sample SQL statements.

{{site.data.alerts.callout_info}}
CockroachCloud Free (beta) is in limited availability. If you do not have access yet, you can [start your first cluster using a 30-day free trial](quickstart-trial-cluster.html).
{{site.data.alerts.end}}

To run CockroachDB on your local machine instead, see [Start a Local Cluster](../stable/secure-a-cluster.html).

## Before you begin

If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs" rel="noopener" target="_blank">sign up for a CockroachCloud account</a>.

## Step 1. Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

## Step 2. Set up your cluster connection

{% include cockroachcloud/quickstart/set-up-your-cluster-connection.md %}

## Step 3. Use the built-in SQL client

You can now connect to your cluster using CockroachDB's built-in SQL client:

1. If you have not done so already, [download the CockroachDB binary](../stable/install-cockroachdb.html):

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="homebrew">Homebrew</button>
    </div>

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~

    {{site.data.alerts.callout_info}}
    You can also use Homebrew to install the CockroachDB binary by running `brew install cockroachdb/tap/cockroach`.
    {{site.data.alerts.end}}
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~
    </section>
    
1. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
    </div>

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~

    {{site.data.alerts.callout_info}}
    If you used Homebrew, Homebrew will automatically add the CockroachDB binary to your path.
    {{site.data.alerts.end}}
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

1. In your terminal, connect to your cluster using the [connection string](#step-2-set-up-your-cluster-connection):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url 'postgres://<username>:<password>@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/<cluster_name>.defaultdb?sslmode=verify-full&sslrootcert=<certs_dir>/cc-ca.crt'
    ~~~

    In the connection string copied from the **Connection info** modal, your username, password, and cluster name are pre-populated. Replace the `<certs_dir>` placeholder with the path to the `certs` directory that you created in [Step 2](#step-2-set-up-your-cluster-connection). For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url 'postgres://maxroach:password123@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/test-cluster.defaultdb?sslmode=verify-full&sslrootcert=/Users/maxroach/certs/cc-ca.crt'
    ~~~

1. Using the [built-in SQL client](../v20.2/cockroach-sql.html), you can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## What's next?

Learn more:

- Use the [built-in SQL client](connect-to-your-cluster.html#use-the-cockroachdb-sql-client) to connect to your cluster and [learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](connect-to-your-cluster.html#step-2-create-a-sql-user).
- Build a ["Hello World" app with the Django framework](build-a-python-app-with-cockroachdb-django.html), or [install a client driver](../stable/install-client-drivers.html) for your favorite language.
- Explore our [sample apps](../stable/hello-world-example-apps.html) for examples on how to build simple "Hello World" applications using CockroachCloud Free (beta).
