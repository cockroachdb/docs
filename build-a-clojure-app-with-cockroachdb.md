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

## Step 1. Install `leiningen`

Install the Clojure `lein` utility as described in its [official documentation](https://leiningen.org/)

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

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Make a basic Clojure/JDBC project.

1. Create a new directory `myapp`.
2. Create a file `myapp/project.clj` and populate it with the following code, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/project.clj" download>download it directly</a> (be sure to place the file in the subdirectory `src/test` in your project!)

~~~ clojure
{% include app/project.clj %}
~~~

3. Create a file `myapp/src/test/util.clj` and populate it with the code from <a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/util.clj" download>this file</a>. (be sure to place the file in the subdirectory `src/test` in your project!)

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

Create a file `myapp/src/test/test.clj` and copy the code below to it, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.clj" download>download it directly</a> (be sure to rename this file to `test.clj` in the subdirectory `src/test` in your project).

~~~ clojure
{% include app/basic-sample.clj %}
~~~

Run with:

~~~ shell
lein run
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.clj" download>download it directly</a>.

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can reuse the code from <a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/util.clj">util.clj</a> or copy it into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ clojure
{% include app/txn-sample.clj %}
~~~

Run with:

~~~ shell
lein run
~~~

After running the code, use the [built-in SQL client](use-the-built-in-sql-client.html) to verify that funds were transferred from one account to another:

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
