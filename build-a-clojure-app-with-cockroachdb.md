---
title: Build a Clojure App with CockroachDB
summary: Learn how to use CockroachDB from a simple Clojure application with a low-level client driver.
toc: false
twitter: true
---

This tutorial shows you how build a simple Clojure application with CockroachDB using a PostgreSQL-compatible driver. We've tested and can recommend the [Clojure java.jdbc driver](http://clojure-doc.org/articles/ecosystem/java_jdbc/home.html), so that driver is featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Clojure java.jdbc driver

Install the Clojure java.jdbc driver as described in the [official documentation](http://clojure-doc.org/articles/ecosystem/java_jdbc/home.html).

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

## Step 6. Run the Clojure code

### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, inserting rows and reading and printing the rows.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.clj" download>download it directly</a>.

~~~ clojure
{% include app/basic-sample.clj %}
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.clj" download>download it directly</a>.

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ clojure
{% include app/txn-sample.clj %}
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

Read more about using the [Clojure java.jdbc driver](http://clojure-doc.org/articles/ecosystem/java_jdbc/home.html).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
