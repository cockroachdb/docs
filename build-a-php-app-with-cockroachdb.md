---
title: Build a PHP App with CockroachDB
summary: Learn how to use CockroachDB from a simple PHP application with a low-level client driver.
toc: false
twitter: true
---

This tutorial shows you how build a simple PHP application with CockroachDB using a PostgreSQL-compatible driver. We've tested and can recommend the [php-pgsql driver](http://php.net/manual/en/book.pgsql.php), so that driver is featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the php-pgsql driver

Install the php-pgsql driver as described in the [official documentation](http://php.net/manual/en/book.pgsql.php).

{% include app/common-steps.md %}

## Step 5. Create a table in the new database

As the `maxroach` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create an `accounts` table in the new database.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--database=bank \
--user=maxroach \
-e 'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)'
~~~

## Step 6. Run the PHP code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/basic-sample.php" download><code>basic-sample.php</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ php
{% include app/basic-sample.php %}
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/txn-sample.php" download><code>txn-sample.php</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ php
{% include app/txn-sample.php %}
~~~

After running the code, use the [built-in SQL client](use-the-built-in-sql-client.html) to verify that funds were transferred from one account to another:

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

Read more about using the [php-pgsql driver](http://php.net/manual/en/book.pgsql.php).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
