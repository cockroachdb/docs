---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with the jdbc driver.
toc: false
twitter: true
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>jdbc</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button">Use <strong>Hibernate</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Java jdbc driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/), so those are featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Java jdbc driver

Download and set up the Java jdbc driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/head/setup.html).

{% include app/common-steps.md %}

## Step 5. Run the Java code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/BasicSample.java" download><code>BasicSample.java</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ java
{% include app/BasicSample.java %}
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/TxnSample.java" download><code>TxnSample.java</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ java
{% include app/TxnSample.java %}
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

Read more about using the [Java jdbc driver](https://jdbc.postgresql.org/).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
