---
title: Quickstart with CockroachCloud Free (beta)
summary: Learn how to create and use your free CockroachCloud cluster.
toc: true
---

<div class="filters clearfix">
    <a href="quickstart.html"><button class="filter-button page-level current">CockroachCloud Free (beta)</button></a>
    <a href="quickstart-trial-cluster.html"><button class="filter-button page-level">CockroachCloud</button></a>
</div>

This page shows you the quickest way to get started with CockroachDB. You'll create a free-forever CockroachCloud cluster, install CockroachDB's SQL client, download your cluster's security certificate, and then run your first query from the SQL client or a sample application.

{% include cockroachcloud/free-limitations.md %}

## Step 1. Create a free cluster

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_quickstart_free" rel="noopener" target="_blank">sign up for a CockroachCloud account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your CockroachCloud account.
1. On the **Clusters** page, click **Create Cluster**.
1. On the **Create your cluster** page, select **CockroachCloud Free**.
1. _(Optional)_ Under **Additional configuration**, select a cloud provider (GCP or AWS) and region, and customize your cluster name.
1. Click **Create your free database**.

Your free-forever cluster will be ready in approximately 20-30 seconds and the **Connection info** dialog will display.

## Step 2. Download the certificate

In the **Connection info** dialog, ...

<div class="filters clearfix">
  <button class="filter-button" data-scope="mac">Mac</button>
  <button class="filter-button" data-scope="linux">Linux</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">
{% include_cached copy-clipboard.html %}
~~~ shell
$ curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
~~~
</section>

<section class="filter-content" markdown="1" data-scope="linux">
{% include_cached copy-clipboard.html %}
~~~ shell
$ curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
~~~
</section>

## Step 3. Install the SQL client

The CockroachDB binary comes with a built-in SQL client that's useful for learning CockroachDB SQL and manipulating your data. If you haven't already, download the CockroachDB binary and put it on your `PATH`.

<div class="filters clearfix">
  <button class="filter-button" data-scope="mac">Mac</button>
  <button class="filter-button" data-scope="linux">Linux</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">
{% include_cached copy-clipboard.html %}
~~~ shell
$ curl https://binaries.cockroachdb.com/cockroach-v21.1.1.darwin-10.9-amd64.tgz | tar -xz ; sudo cp -i cockroach-v21.1.1.darwin-10.9-amd64/cockroach /usr/local/bin/
~~~
</section>

<section class="filter-content" markdown="1" data-scope="linux">
{% include_cached copy-clipboard.html %}
~~~ shell
$ curl https://binaries.cockroachdb.com/cockroach-v21.1.0.linux-amd64.tgz | tar -xz ; sudo cp -i cockroach-v21.1.0.linux-amd64/cockroach /usr/local/bin/
~~~
</section>

## Step 4. Run your first query

<div class="filters clearfix">
  <button class="filter-button" data-scope="sql">SQL shell</button>
  <button class="filter-button" data-scope="node">Node.js</button>
  <button class="filter-button" data-scope="python">Python</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="ruby">Ruby</button>
</div>

<section class="filter-content" markdown="1" data-scope="sql">

1. Open an interactive SQL shell:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url "postgresql://user:ENTER-PASSWORD@<free-tier-host>.<region>.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt&options=--cluster%3D<cluster-name>-<tenant-id>"
    ~~~

    A welcome message displays:

    ~~~
    #
    # Welcome to the CockroachDB SQL shell.
    # All statements must be terminated by a semicolon.
    # To exit, type: \q.
    #
    ~~~

1. Create a `bank` database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

1. Create an `accounts` table and insert a few rows:

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE IF NOT EXISTS bank.accounts (id INT PRIMARY KEY, balance INT);
    INSERT INTO bank.accounts (id, balance) VALUES (1, 1000), (2, 250);
    ~~~

1. Read data from the `accounts` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    -----+----------
       1 | 1000.50
       2 | 250.00
    (2 rows)
    ~~~

    For more information about how to use the built-in SQL client, see the [`cockroach sql`](../stable/cockroach-sql.html) reference docs.

</section>

<section class="filter-content" markdown="1" data-scope="node">

1. To let your application communicate with CockroachDB, install the [Node.js pg driver](https://www.npmjs.com/package/pg):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install pg
    ~~~

1. Download the [sample Node.js code](https://raw.githubusercontent.com/cockroachlabs/hello-world-node-pg/main/app.js):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachlabs/hello-world-node-pg/main/app.js
    ~~~

1. In the **Connection info** dialog in CockroachCloud, select the **Connection parameters** tab.

1. Open the downloaded `app.js` file in your code editor, and replace the `user`, `host`, `port`, `database`, and `password` values with the values in the **Connection parameters** tab.

    For example, the updated connection details will look something like this:

    ~~~ javascript
    const config = {
      user: "max",
      host: "free-tier.gcp-us-central1.cockroachlabs.cloud",
      port: 26257,
      database: "oily-vole-2186.defaultdb",
      password: "a1b2c3d4e5",
      ssl: {
        ca: fs.readFileSync('/certs/ca.crt').toString()
      },
    };
    ~~~

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ node app.js
    ~~~

    The code creates a table, inserts some rows, and then reads and updates values as an atomic [transaction](../stable/transactions.html).

    Note that all of the database operations are wrapped in the `retryTxn` function. This function attempts to commit statements in the context of an explicit transaction. If a [retry error](../stable/transaction-retry-error-reference.html) is thrown, the wrapper will retry committing the transaction, with [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff), until the maximum number of retries is reached (by default, 15).

    The output should be:

    ~~~
    Initializing table...
    New account balances:
    { id: '1', balance: '1000' }
    { id: '2', balance: '250' }
    Transferring funds...
    New account balances:
    { id: '1', balance: '900' }
    { id: '2', balance: '350' }
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="python">

</section>

<section class="filter-content" markdown="1" data-scope="go">

</section>

<section class="filter-content" markdown="1" data-scope="ruby">

</section>

## Learn more

This page outlines the quickest way to get started with CockroachDB. For information on other options that are available when creating a CockroachCloud Free (beta) cluster, see the following:

- To create a free cluster with other configurations (e.g., a different cloud provider or region), see [Create a CockroachCloud Free (beta) Cluster](create-a-free-cluster.html).
- To connect to a free cluster with other options (e.g., a CA certificate or different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../stable/third-party-database-tools.html)), see [Connect to a CockroachCloud Free (beta) Cluster](connect-to-a-free-cluster.html).
- For information about how to connect securely to your cluster (recommended), see [Authentication](authentication.html).
- To watch a video walkthrough of connecting to a cluster, see [How to connect to CockroachCloud and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).

Next steps:

- Use the [built-in SQL client](../stable/cockroach-sql.html) to connect to your cluster and [learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Build a ["Hello World" app with the Django framework](../stable/build-a-python-app-with-cockroachdb-django.html), or [install a client driver](../stable/install-client-drivers.html) for your favorite language.
- Explore our [sample apps](../stable/hello-world-example-apps.html) for examples on how to build simple "Hello World" applications using CockroachCloud Free (beta).
