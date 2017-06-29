---
title: Build a Clojure App with CockroachDB
summary: Learn how to use CockroachDB from a simple Clojure application with a low-level client driver.
toc: false
twitter: true
---

This tutorial shows you how build a simple Clojure application with CockroachDB using [leiningen](https://leiningen.org/) and a PostgreSQL-compatible driver. We've tested and can recommend the [Clojure java.jdbc driver](http://clojure-doc.org/articles/ecosystem/java_jdbc/home.html) in conjunction with the [PostgreSQL JDBC driver](https://jdbc.postgresql.org/), so that driver is featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install `leiningen`

Install the Clojure `lein` utility as described in its [official documentation](https://leiningen.org/).

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

## Step 6. Run the Clojure code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Create a basic Clojure/JDBC project

1. Create a new directory `myapp`.
2. Create a file `myapp/project.clj` and populate it with the following code, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/project.clj" download>download it directly</a>. Be sure to place the file in the subdirectory `src/test` in your project.

    {% include copy-clipboard.html %}
    ~~~ clojure
    {% include app/project.clj %}
    ~~~

3. Create a file `myapp/src/test/util.clj` and populate it with the code from <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/util.clj" download>this file</a>. Be sure to place the file in the subdirectory `src/test` in your project.

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

Create a file `myapp/src/test/test.clj` and copy the code below to it, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/basic-sample.clj" download>download it directly</a>. Be sure to rename this file to `test.clj` in the subdirectory `src/test` in your project.

{% include copy-clipboard.html %}
~~~ clojure
{% include app/basic-sample.clj %}
~~~

Run with:

{% include copy-clipboard.html %}
~~~ shell
lein run
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code below to `myapp/src/test/test.clj` or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/txn-sample.clj" download>download it directly</a>. Again, preserve the file name `test.clj`.

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ clojure
{% include app/txn-sample.clj %}
~~~

Run with:

{% include copy-clipboard.html %}
~~~ shell
lein run
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

Read more about using the [Clojure java.jdbc driver](http://clojure-doc.org/articles/ecosystem/java_jdbc/home.html).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
