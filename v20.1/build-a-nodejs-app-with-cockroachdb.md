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

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

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

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Node.js code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the [`basic-sample.js`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.js) file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ js
{% include {{page.version.version}}/app/basic-sample.js %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ node basic-sample.js
~~~

The output should be:

~~~
Initial balances:
{ id: '1', balance: '1000' }
{ id: '2', balance: '250' }
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another and then read the updated values, where all included statements are either committed or aborted.

Download the [`txn-sample.js`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.js) file, or create the file yourself and copy the code into it.

{% include {{ page.version.version }}/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ js
{% include {{page.version.version}}/app/txn-sample.js %}
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

To verify that funds were transferred from one account to another, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank
~~~

To check the account balances, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
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

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Node.js code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the [`basic-sample.js`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample.js) file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ js
{% include {{page.version.version}}/app/insecure/basic-sample.js %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ node basic-sample.js
~~~

The output should be:

~~~
Initial balances:
{ id: '1', balance: '1000' }
{ id: '2', balance: '250' }
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another and then read the updated values, where all included statements are either committed or aborted.

Download the [`txn-sample.js`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample.js) file, or create the file yourself and copy the code into it.

{% include {{ page.version.version }}/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ js
{% include {{page.version.version}}/app/insecure/txn-sample.js %}
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

To verify that funds were transferred from one account to another, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

To check the account balances, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
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

</section>

## What's next?

Read more about using the [Node.js pg driver](https://www.npmjs.com/package/pg).

{% include {{page.version.version}}/app/see-also-links.md %}
