---
title: Build a Python App with CockroachDB
summary: Learn how to use CockroachDB from a simple Python application with the psycopg2 driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button current">Use <strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button style="width: 28%" class="filter-button">Use <strong>SQLAlchemy</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Python psycopg2 driver](http://initd.org/psycopg/docs/) and the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the psycopg2 driver

To install the Python psycopg2 driver, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install psycopg2
~~~

For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Python code

Now that you have a database and a user, you'll run the code shown below to:

- Create a table and insert some rows
- Read and update values as an atomic [transaction](transactions.html)

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/basic-sample.py" download><code>basic-sample.py</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/basic-sample.py %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python basic-sample.py
~~~

The output should be:

~~~
Initial balances:
['1', '1000']
['2', '250']
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/txn-sample.py" download><code>txn-sample.py</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/txn-sample.py %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python txn-sample.py
~~~

The output should be:

~~~
Balances after transfer:
['1', '900']
['2', '350']
~~~

To verify that funds were transferred from one account to another, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank
~~~

To check the account balances, issue the following statement:

{% include_cached copy-clipboard.html %}
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

## Step 3. Run the Python code

Now that you have a database and a user, you'll run the code shown below to:

- Create a table and insert some rows
- Read and update values as an atomic [transaction](transactions.html)

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/insecure/basic-sample.py" download><code>basic-sample.py</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/insecure/basic-sample.py %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python basic-sample.py
~~~

The output should be:

~~~
Initial balances:
['1', '1000']
['2', '250']
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/insecure/txn-sample.py" download><code>txn-sample.py</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/insecure/txn-sample.py %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python txn-sample.py
~~~

The output should be:

~~~
Balances after transfer:
['1', '900']
['2', '350']
~~~

To verify that funds were transferred from one account to another, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

To check the account balances, issue the following statement:

{% include_cached copy-clipboard.html %}
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

Read more about using the [Python psycopg2 driver](http://initd.org/psycopg/docs/).

{% include {{page.version.version}}/app/see-also-links.md %}
