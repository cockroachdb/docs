---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with the JDBC driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button">Use <strong>Hibernate</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Java JDBC driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

1. [Install CockroachDB](install-cockroachdb.html).
2. Start up a [secure](secure-a-cluster.html) or [insecure](start-a-local-cluster.html) local cluster.
3. Choose the instructions that correspond to whether your cluster is secure or insecure:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="secure">Secure</button>
  <button class="filter-button" data-scope="insecure">Insecure</button>
</div>

{{site.data.alerts.callout_danger}}
The examples on this page assume you are using a Java version <= 9. They do not work with Java 10.
{{site.data.alerts.end}}

## Step 1. Install the Java JDBC driver

Download and set up the Java JDBC driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/head/setup.html).

## Step 2. Create the `maxroach` user and `bank` database

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO maxroach;
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ sh
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=certs/ca.key
~~~

## Step 4. Convert the key file for use with Java

The private key generated for user `maxroach` by CockroachDB is [PEM encoded](https://tools.ietf.org/html/rfc1421).  To read the key in a Java application, you will need to convert it into [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java.

To convert the key to PKCS#8 format, run the following OpenSSL command on the `maxroach` user's key file in the directory where you stored your certificates:

{% include copy-clipboard.html %}
~~~ shell
$ openssl pkcs8 -topk8 -inform PEM -outform DER -in client.maxroach.key -out client.maxroach.pk8 -nocrypt
~~~

## Step 5. Run the Java code

Now that you have created a database and set up encryption keys, in this section you will:

- [Create a table and insert some rows](#basic1)
- [Execute a batch of statements as a transaction](#txn1)

<a name="basic1" />

### Basic example

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements: create a table, insert rows, and read and print the rows.

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

    The output should be:

    ~~~
    Initial balances:
        account 1: 1000
        account 2: 250
    ~~~

The contents of [`BasicSample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/BasicSample.java):

{% include copy-clipboard.html %}
~~~ java
{% include v2.1/app/BasicSample.java %}
~~~

<a name="txn1" />

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

    The output should be:

    ~~~
    account 1: 900
    account 2: 350
    ~~~

{% include v2.1/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ java
{% include v2.1/app/TxnSample.java %}
~~~

After running the code, use the [built-in SQL client](use-the-built-in-sql-client.html) to verify that funds were transferred from one account to another:

{% include copy-clipboard.html %}
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

## Step 3. Run the Java code

Now that you have created a database, in this section you will:

- [Create a table and insert some rows](#basic2)
- [Execute a batch of statements as a transaction](#txn2)

<a name="basic2" />

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

The contents of [`BasicSample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/insecure/BasicSample.java):

{% include copy-clipboard.html %}
~~~ java
{% include v2.1/app/insecure/BasicSample.java %}
~~~

<a name="txn2" />

### Transaction example (with retry logic)

Next, use the following code to execute a batch of statements as a [transaction](transactions.html) to transfer funds from one account to another.

To run it:

1. Download <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/insecure/TxnSample.java" download><code>TxnSample.java</code></a>, or create the file yourself and copy the code below.  Note the use of [`SQLException.getSQLState()`](https://docs.oracle.com/javase/tutorial/jdbc/basics/sqlexception.html) instead of `getErrorCode()`.
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
{% include v2.1/app/insecure/TxnSample.java %}
~~~

After running the code, use the [built-in SQL client](use-the-built-in-sql-client.html) to verify that funds were transferred from one account to another:

{% include copy-clipboard.html %}
~~~ sql
> USE bank;
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

Read more about using the [Java JDBC driver](https://jdbc.postgresql.org/).

{% include v2.1/app/see-also-links.md %}
