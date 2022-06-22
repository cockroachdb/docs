---
title: Build a Java App with CockroachDB and Hibernate
summary: Learn how to use CockroachDB from a simple Java application with the Hibernate ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button current">Use <strong>Hibernate</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-jooq.html"><button class="filter-button">Use <strong>jOOQ</strong></button></a>
    <a href="build-a-spring-app-with-cockroachdb-mybatis.html"><button style="width: 25%" class="filter-button">Use <strong>MyBatis-Spring</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB and the Hibernate ORM.

{% include {{page.version.version}}/app/java-version-note.md %}

{{site.data.alerts.callout_success}}
For a sample app and tutorial that uses Spring Data JPA (Hibernate) and CockroachDB, see [Build a Spring App with CockroachDB and JPA](build-a-spring-app-with-cockroachdb-jpa.html).

For another use of Hibernate with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the Gradle build tool

This tutorial uses the [Gradle build tool](https://gradle.org/) to get all dependencies for your application, including Hibernate.

To install Gradle on Mac, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ brew install gradle
~~~

To install Gradle on a Debian-based Linux distribution like Ubuntu:

{% include_cached copy-clipboard.html %}
~~~ shell
$ apt-get install gradle
~~~

To install Gradle on a Red Hat-based Linux distribution like Fedora:

{% include_cached copy-clipboard.html %}
~~~ shell
$ dnf install gradle
~~~

For other ways to install Gradle, see [its official documentation](https://gradle.org/install).

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

You can pass the [`--also-generate-pkcs8-key` flag](cockroach-cert.html#flag-pkcs8) to generate a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java. In this case, the generated PKCS8 key will be named `client.maxroach.key.pk8`.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key --also-generate-pkcs8-key
~~~

## Step 4. Run the Java code

The code below uses Hibernate to map Java methods to SQL operations. It perform the following steps which roughly correspond to method calls in the `Sample` class.

1. Create an `accounts` table in the `bank` database as specified by the Hibernate `Account` class.
2. Inserts rows into the table using `session.save(new Account(int id, int balance))` (see `Sample.addAccounts()`).
3. Transfer money from one account to another, printing out account balances before and after the transfer (see `transferFunds(long fromId, long toId, long amount)`).
4. Print out account balances before and after the transfer (see `Sample.getAccountBalance(long id)`).

In addition, the code shows a pattern for automatically handling [transaction retries](transactions.html#client-side-intervention-example) by wrapping transactions in a higher-order function `Sample.runTransaction()`. It also includes a method for testing the retry handling logic (`Sample.forceRetryLogic()`), which will be run if you set the `FORCE_RETRY` variable to `true`.

It does all of the above using the practices we recommend for using Hibernate (and the underlying JDBC connection) with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

To run it:

1. Download and extract [hibernate-basic-sample.tgz](https://github.com/cockroachdb/docs/raw/master/_includes/{{ page.version.version }}/app/hibernate-basic-sample/hibernate-basic-sample.tgz). The settings in [`hibernate.cfg.xml`](https://github.com/cockroachdb/docs/raw/master/_includes/{{ page.version.version }}/app/hibernate-basic-sample/hibernate.cfg.xml) specify how to connect to the database.

    {{site.data.alerts.callout_info}}
    The version of the CockroachDB Hibernate dialect in `hibernate.cfg.xml` corresponds to a version of CockroachDB. For more information, see [Install Client Drivers: Hibernate](install-client-drivers.html).
    {{site.data.alerts.end}}

2. Compile and run the code using [`build.gradle`](https://github.com/cockroachdb/docs/raw/master/_includes/{{ page.version.version }}/app/hibernate-basic-sample/build.gradle), which will also download the dependencies.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gradle run
    ~~~

{{site.data.alerts.callout_success}}
To clone a version of the code below that connects to insecure clusters, run the command below. Note that you will need to edit the connection string to use the certificates that you generated when you set up your secure cluster.

`git clone https://github.com/cockroachlabs/example-app-java-hibernate/`
{{site.data.alerts.end}}

The contents of [`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/hibernate-basic-sample/Sample.java):

{% include_cached copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/hibernate-basic-sample/Sample.java %}
~~~

Toward the end of the output, you should see:

~~~
APP: BEGIN;
APP: addAccounts() --> 1
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(1) --> 1000
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(2) --> 250
APP: COMMIT;
APP: getAccountBalance(1) --> 1000
APP: getAccountBalance(2) --> 250
APP: BEGIN;
APP: transferFunds(1, 2, 100) --> 100
APP: COMMIT;
APP: transferFunds(1, 2, 100) --> 100
APP: BEGIN;
APP: getAccountBalance(1) --> 900
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(2) --> 350
APP: COMMIT;
APP: getAccountBalance(1) --> 900
APP: getAccountBalance(2) --> 350
~~~

To verify that the account balances were updated successfully, start the [built-in SQL client](cockroach-sql.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

To check the account balances, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, balance FROM accounts;
~~~

~~~
  id | balance
+----+---------+
   1 |     900
   2 |     350
   3 |  314159
(3 rows)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Java code

The code below uses Hibernate to map Java methods to SQL operations. It perform the following steps which roughly correspond to method calls in the `Sample` class.

1. Create an `accounts` table in the `bank` database as specified by the Hibernate `Account` class.
2. Inserts rows into the table using `session.save(new Account(int id, int balance))` (see `Sample.addAccounts()`).
3. Transfer money from one account to another, printing out account balances before and after the transfer (see `transferFunds(long fromId, long toId, long amount)`).
4. Print out account balances before and after the transfer (see `Sample.getAccountBalance(long id)`).

In addition, the code shows a pattern for automatically handling [transaction retries](transactions.html#client-side-intervention-example) by wrapping transactions in a higher-order function `Sample.runTransaction()`. It also includes a method for testing the retry handling logic (`Sample.forceRetryLogic()`), which will be run if you set the `FORCE_RETRY` variable to `true`.

It does all of the above using the practices we recommend for using Hibernate (and the underlying JDBC connection) with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

To run it:

1. Clone the `example-app-java-hibernate` repo to your machine:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachlabs/example-app-java-hibernate/
    ~~~

2. Compile and run the code using [`build.gradle`](https://github.com/cockroachdb/docs/raw/master/_includes/{{ page.version.version }}/app/insecure/hibernate-basic-sample/build.gradle), which will also download the dependencies.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gradle run
    ~~~

The contents of [`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/insecure/hibernate-basic-sample/Sample.java):

{% include_cached copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/insecure/hibernate-basic-sample/Sample.java %}
~~~

Toward the end of the output, you should see:

~~~
APP: BEGIN;
APP: addAccounts() --> 1
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(1) --> 1000
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(2) --> 250
APP: COMMIT;
APP: getAccountBalance(1) --> 1000
APP: getAccountBalance(2) --> 250
APP: BEGIN;
APP: transferFunds(1, 2, 100) --> 100
APP: COMMIT;
APP: transferFunds(1, 2, 100) --> 100
APP: BEGIN;
APP: getAccountBalance(1) --> 900
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(2) --> 350
APP: COMMIT;
APP: getAccountBalance(1) --> 900
APP: getAccountBalance(2) --> 350
~~~

To verify that the account balances were updated successfully, start the [built-in SQL client](cockroach-sql.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

To check the account balances, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, balance FROM accounts;
~~~

~~~
  id | balance
+----+---------+
   1 |     900
   2 |     350
   3 |  314159
(3 rows)
~~~

</section>

## Recommended Practices

### Use `IMPORT` to read in large data sets

If you are trying to get a large data set into CockroachDB all at once (a bulk import), avoid writing client-side code altogether and use the [`IMPORT`](import.html) statement instead. It is much faster and more efficient than making a series of [`INSERT`s](insert.html) and [`UPDATE`s](update.html). It bypasses the [SQL layer](architecture/sql-layer.html) altogether and writes directly to the [storage layer](architecture/storage-layer.html) of the database.

For more information about importing data from Postgres, see [Migrate from Postgres](migrate-from-postgres.html).

For more information about importing data from MySQL, see [Migrate from MySQL](migrate-from-mysql.html).

### Use `rewriteBatchedInserts` for increased speed

We strongly recommend setting `rewriteBatchedInserts=true`; we have seen 2-3x performance improvements with it enabled. From [the JDBC connection parameters documentation](https://jdbc.postgresql.org/documentation/head/connect.html#connection-parameters):

> This will change batch inserts from `insert into foo (col1, col2, col3) values (1,2,3)` into `insert into foo (col1, col2, col3) values (1,2,3), (4,5,6)` this provides 2-3x performance improvement

### Retrieve large data sets in chunks using cursors

CockroachDB now supports the Postgres wire-protocol cursors for implicit transactions and explicit transactions executed to completion. This means the [PGJDBC driver](https://jdbc.postgresql.org) can use this protocol to stream queries with large result sets. This is much faster than [paginating through results in SQL using `LIMIT .. OFFSET`](selection-queries.html#paginate-through-limited-results).

For instructions showing how to use cursors in your Java code, see [Getting results based on a cursor](https://jdbc.postgresql.org/documentation/head/query.html#query-with-cursor) from the PGJDBC documentation.

Note that interleaved execution (partial execution of multiple statements within the same connection and transaction) is not supported when [`Statement.setFetchSize()`](https://docs.oracle.com/javase/8/docs/api/java/sql/Statement.html#setFetchSize-int-) is used.

## What's next?

Read more about using the [Hibernate ORM](http://hibernate.org/orm/), or check out a more realistic implementation of Hibernate with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{page.version.version}}/app/see-also-links.md %}
