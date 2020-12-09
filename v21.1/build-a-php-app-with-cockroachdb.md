---
title: Build a PHP App with CockroachDB and php-pgsql
summary: Learn how to use CockroachDB from a simple PHP application with a low-level client driver.
toc: true
twitter: false
---

This tutorial shows you how build a simple PHP application with CockroachDB and the php-pgsql driver.

We have tested the [php-pgsql driver](http://php.net/manual/en/book.pgsql.php) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the php-pgsql driver

Install the php-pgsql driver as described in the [official documentation](http://php.net/manual/en/book.pgsql.php).

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the PHP code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.php" download><code>basic-sample.php</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ php
{% include {{ page.version.version }}/app/basic-sample.php %}
~~~

The output should be:

~~~ shell
Account balances:
1: 1000
2: 250
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.php" download><code>txn-sample.php</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ php
{% include {{ page.version.version }}/app/txn-sample.php %}
~~~

The output should be:

~~~ shell
Account balances after transfer:
1: 900
2: 350
~~~

To verify that funds were transferred from one account to another, use the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e 'SELECT id, balance FROM accounts' --database=bank
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

## Step 3. Run the PHP code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample.php" download><code>basic-sample.php</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ php
{% include {{ page.version.version }}/app/insecure/basic-sample.php %}
~~~

The output should be:

~~~ shell
Account balances:
1: 1000
2: 250
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample.php" download><code>txn-sample.php</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ php
{% include {{ page.version.version }}/app/insecure/txn-sample.php %}
~~~

The output should be:

~~~ shell
Account balances after transfer:
1: 900
2: 350
~~~

To verify that funds were transferred from one account to another, use the [built-in SQL client](cockroach-sql.html):

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

</section>

## What's next?

Read more about using the [php-pgsql driver](http://php.net/manual/en/book.pgsql.php).

{% include {{ page.version.version }}/app/see-also-links.md %}
