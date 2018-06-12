---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with the JDBC driver.
toc: false
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button">Use <strong>Hibernate</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Java JDBC driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

<div id="toc"></div>

## Before you begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

{{site.data.alerts.callout_danger}}
The examples on this page assume you are using a Java version <= 9. They do not work with Java 10.
{{site.data.alerts.end}}

## Step 1. Install the Java JDBC driver

Download and set up the Java JDBC driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/head/setup.html).

{% include v2.1/app/common-steps-secure.md %}

## Step 5. Convert the key file for use with Java

The private key generated for user `maxroach` by CockroachDB is [PEM encoded](https://tools.ietf.org/html/rfc1421).  To read the key in a Java application, you will need to convert it into [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java.

To convert the key to PKCS#8 format, run the following OpenSSL command on the `maxroach` user's key file in the directory where you stored your certificates (`/tmp/certs` in this example):

{% include copy-clipboard.html %}
~~~ shell
$ openssl pkcs8 -topk8 -inform PEM -outform DER -in client.maxroach.key -out client.maxroach.pk8 -nocrypt
~~~

## Step 6. Run the Java code

Now that you have created a database, in this section you will:

- [Create a table and insert some rows](#basic-example)
- [Execute a batch of statements as a transaction](#transaction-example-with-retry-logic)

### Basic example

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

To run it:

1. Download <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/BasicSample.java" download><code>BasicSample.java</code></a>, or create the file yourself and copy the code below.
2. Download [the PostgreSQL JDBC driver](https://jdbc.postgresql.org/download.html).
3. Compile and run the code (adding the PostgreSQL JDBC driver to your classpath):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ javac -classpath .:/path/to/postgresql.jar BasicSample.java
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ java -classpath .:/path/to/postgresql.jar BasicSample
    ~~~

The contents of [`BasicSample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/BasicSample.java):

{% include copy-clipboard.html %}
~~~ java
{% include v2.1/app/BasicSample.java %}
~~~

### Transaction example (with retry logic)

Next, use the following code to execute a batch of statements as a [transaction](transactions.html) to transfer funds from one account to another.

To run it:

1. Download <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/TxnSample.java" download><code>TxnSample.java</code></a>, or create the file yourself and copy the code below.  Note the use of [`SQLException.getSQLState()`](https://docs.oracle.com/javase/tutorial/jdbc/basics/sqlexception.html) instead of `getErrorCode()`.
2. Compile and run the code (again adding the PostgreSQL JDBC driver to your classpath):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ javac -classpath .:/path/to/postgresql.jar TxnSample.java
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ java -classpath .:/path/to/postgresql.jar TxnSample
    ~~~

{% include v2.1/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ java
{% include v2.1/app/TxnSample.java %}
~~~

After running the code, use the [built-in SQL client](use-the-built-in-sql-client.html) to verify that funds were transferred from one account to another:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=/tmp/certs -e 'SELECT id, balance FROM accounts' --database=bank
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

## What's next?

Read more about using the [Java JDBC driver](https://jdbc.postgresql.org/).

{% include v2.1/app/see-also-links.md %}
