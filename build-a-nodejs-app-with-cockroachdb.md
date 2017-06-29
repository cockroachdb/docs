---
title: Build a Node.js App with CockroachDB
summary: Learn how to use CockroachDB from a simple Node.js application with the Node.js pg driver.
toc: false
twitter: true
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>pg</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button">Use <strong>Sequelize</strong></button></a>
</div>

This tutorial shows you how build a simple Node.js application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Node.js pg driver](https://www.npmjs.com/package/pg) and the [Sequelize ORM](http://docs.sequelizejs.com/en/v3/), so those are featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install Node.js packages

To let your application communicate with CockroachDB, install the [Node.js pg driver](https://www.npmjs.com/package/pg):

{% include copy-clipboard.html %}
~~~ shell
$ npm install pg
~~~

The example app on this page also requires [`async`](https://www.npmjs.com/package/async):

{% include copy-clipboard.html %}
~~~ shell
$ npm install async
~~~

{% include app/common-steps.md %}

## Step 5. Run the Node.js code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/basic-sample.js" download><code>basic-sample.js</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ js
{% include app/basic-sample.js %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ node basic-sample.js
~~~

The output should be:

~~~ shell
Initial balances:
{ id: '1', balance: '1000' }
{ id: '2', balance: '250' }
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another and then read the updated values, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/txn-sample.js" download><code>txn-sample.js</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ js
{% include app/txn-sample.js %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ node txn-sample.js
~~~

The output should be:

~~~
Balances after transfer:
{ id: '1', balance: '900' }
{ id: '2', balance: '350' }
~~~

However, if you want to verify that funds were transferred from one account to another, use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |     900 |
|  2 |     350 |
+----+---------+
(2 rows)
~~~

## What's Next?

Read more about using the [Node.js pg driver](https://www.npmjs.com/package/pg).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
