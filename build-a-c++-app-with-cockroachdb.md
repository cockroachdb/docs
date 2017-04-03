---
title: Build a C++ App with CockroachDB
summary: Learn how to use CockroachDB from a simple C++ application with a low-level client driver.
toc: false
twitter: true
---

This tutorial shows you how build a simple C++ application with CockroachDB using a PostgreSQL-compatible driver. We've tested and can recommend the [C++ libpqxx driver](http://pqxx.org/development/libpqxx/), so that driver is featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the libpqxx driver

Install the C++ libpqxx driver as described in the [official documentation](http://pqxx.org/development/libpqxx/).

{% include app/common-steps.md %}

## Step 5. Run the C++ code

### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.cpp" download>download it directly</a>.

~~~ cpp
{% include app/basic-sample.cpp %}
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.cpp" download>download it directly</a>.

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ cpp
{% include app/txn-sample.cpp %}
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

Read more about using the [C++ libpqxx driver](http://pqxx.org/development/libpqxx/).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
