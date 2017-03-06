---
title: Build a PHP App with CockroachDB
summary: Learn how to use CockroachDB from a simple PHP application with a low-level client driver.
toc: false
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

~~~ shell
$ cockroach sql --database=bank --user=maxroach -e \
'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)'
~~~

~~~
CREATE TABLE
~~~

## Step 6. Run the PHP code

### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, inserting rows and reading and printing the rows. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.php" download>download it directly</a>.

~~~ php
{% include app/basic-sample.php %}
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.php" download>download it directly</a>. 

{{site.data.alerts.callout_info}}With the default `SERIALIZABLE` isolation level, CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

~~~ php
{% include app/txn-sample.php %}
~~~

After running the code, to verify that funds were, in fact, transferred from one account to another, you can again use the [built-in SQL client](use-the-built-in-sql-client.html): 

~~~ shell
$ cockroach sql -e 'SELECT id, balance FROM accounts' --database=bank
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
- [Scalability](demo-scalability.html)
