---
title: Build a Node.js App with CockroachDB and the Node.js pg Driver
summary: Learn how to use CockroachDB from a simple Node.js application with the Node.js pg driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>pg</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button">Use <strong>Sequelize</strong></button></a>
</div>

This tutorial shows you how build a simple Node.js application with CockroachDB and the Node.js pg driver.

We have tested the [Node.js pg driver](https://www.npmjs.com/package/pg) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Install client driver

To let your application communicate with CockroachDB, install the [Node.js pg driver](https://www.npmjs.com/package/pg):

{% include_cached copy-clipboard.html %}
~~~ shell
$ npm install pg
~~~

## Step 4. Get the code

<a href="https://raw.githubusercontent.com/cockroachlabs/example-app-node-postgres/main/app.js">Download the sample code directly</a>, or clone [the code's GitHub repository](https://github.com/cockroachlabs/example-app-node-postgres).

## Step 5. Update the connection parameters

Open the `app.js` file, and edit the connection configuration parameters:

<section class="filter-content" markdown="1" data-scope="local">

- Replace the value for `user` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.
- Replace the value for `port` with the port to your cluster.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

- At the top of the file, uncomment the `const fs = require('fs');` line.

    This line imports the `fs` Node module, which enables you to read in the CA cert that you downloaded from the {{ site.data.products.db }} Console.
- Replace the value for `user` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.
- Replace the value for `host` with the name of the {{ site.data.products.serverless-plan }} host (e.g., `host: 'free-tier.gcp-us-central1.cockroachlabs.cloud'`).
- Replace the value for `port` with the port to your cluster.
- Replace the value for `database` with the database that you created earlier, suffixed with the name of the cluster (e.g., `database: '{cluster_name}.bank'`).
- Remove the existing `ssl` object and its contents.
- Uncomment the `ssl` object with the `ca` key-value pair, and edit the `fs.readFileSync('/certs/ca.crt').toString()` call to use the path to the `cc-ca.crt` file that you downloaded from the {{ site.data.products.db }} Console.

</section>

## Step 6. Run the code

The sample code creates a table, inserts some rows, and then reads and updates values as an atomic [transaction](transactions.html).

Here are the contents of `app.js`:

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-node-postgres/main/app.js %}
~~~

Note that all of the database operations are wrapped in the `retryTxn` function. This function attempts to commit statements in the context of an explicit transaction. If a [retry error](transaction-retry-error-reference.html) is thrown, the wrapper will retry committing the transaction, with [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff), until the maximum number of retries is reached (by default, 15).

To run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ node app.js
~~~

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

## What's next?

Read more about using the [Node.js pg driver](https://www.npmjs.com/package/pg).

{% include {{page.version.version}}/app/see-also-links.md %}
