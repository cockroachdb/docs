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

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Run the Java code

The sample code in this tutorial ([`Sample.java`](#code-contents))uses Hibernate to map Java methods to SQL operations. The code performs the following operations, which roughly correspond to method calls in the `Sample` class:

1. Creates an `accounts` table in the `bank` database as specified by the `Account` mapping class.
1. Inserts rows into the table with the `addAccounts()` method.
1. Transfers money from one account to another with the `transferFunds()` method.
1. Prints out account balances before and after the transfer with the `getAccountBalance()` method.

In addition, the code shows a pattern for automatically handling [transaction retries](transactions.html#client-side-intervention-example) by wrapping transactions in a higher-order function named `runTransaction()`. It also includes a method for testing the retry handling logic (`Sample.forceRetryLogic()`), which will be run if you set the `FORCE_RETRY` variable to `true`.

It does all of the above using the practices we recommend for using Hibernate (and the underlying JDBC connection) with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

<a name="code-contents"></a>
The contents of `Sample.java`:

{% include copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-java-hibernate/master/src/main/java/com/cockroachlabs/Sample.java %}
~~~

To run it:

1. Clone the `hello-world-java-hibernate` repo to your machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachlabs/hello-world-java-hibernate/
    ~~~

    {{site.data.alerts.callout_info}}
    The version of the CockroachDB Hibernate dialect in `hibernate.cfg.xml` corresponds to a version of CockroachDB. For more information, see [Install Client Drivers: Hibernate](install-client-drivers.html#hibernate).
    {{site.data.alerts.end}}

1. Edit `src/main/resources/hibernate.cfg.xml` in a text editor.

    1. Modify the `hibernate.connection.url` property with the port number from the connection string above:

        {% include copy-clipboard.html %}
        ~~~ xml
        <property name="hibernate.connection.url">jdbc:postgresql://localhost:{port}/bank?ssl=true&amp;sslmode=require</property>
        ~~~

        Where `{port}` is the port number on which the CockroachDB demo cluster is listening.

    1. Set the `hibernate.connection.username` property to the username you created earlier.

    1. Set the `hibernate.connection.password` property to the user's password.



1. Compile and run the code using `gradlew`, which will also download the dependencies.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./gradlew run
    ~~~

Toward the end of the output, you should see:

~~~
APP: BEGIN;
APP: addAccounts() --> 1.00
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(1) --> 1000.00
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(2) --> 250.00
APP: COMMIT;
APP: getAccountBalance(1) --> 1000.00
APP: getAccountBalance(2) --> 250.00
APP: BEGIN;
APP: transferFunds(1, 2, 100.00) --> 100.00
APP: COMMIT;
APP: transferFunds(1, 2, 100.00) --> 100.00
APP: BEGIN;
APP: getAccountBalance(1) --> 900.00
APP: COMMIT;
APP: BEGIN;
APP: getAccountBalance(2) --> 350.00
APP: COMMIT;
APP: getAccountBalance(1) --> 900.00
APP: getAccountBalance(2) --> 350.00
~~~

To verify that the account balances were updated successfully, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir={certs_dir}
~~~

Where:
- `{certs_dir}` is the path to the directory containing the certificates and keys you generated earlier.

To check the account balances, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
SELECT id, balance FROM accounts;
~~~

~~~
id |  balance
-----+------------
 1 |    900.00
 2 |    350.00
 3 | 314159.00
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
