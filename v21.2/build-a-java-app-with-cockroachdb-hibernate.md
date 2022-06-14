---
title: Build a Java App with CockroachDB and Hibernate
summary: Learn how to use CockroachDB from a simple Java application with the Hibernate ORM.
toc: true
twitter: false
referral_id: docs_java_hibernate
filter_category: crud_java
filter_html: Use <strong>Hibernate</strong>
filter_sort: 2
docs_area: get_started
---

{% include_cached filter-tabs.md %}

This tutorial shows you how build a simple Java application with CockroachDB and the Hibernate ORM.

{% include {{page.version.version}}/app/java-version-note.md %}

{{site.data.alerts.callout_success}}
For a sample app and tutorial that uses Spring Data JPA (Hibernate) and CockroachDB, see [Build a Spring App with CockroachDB and JPA](build-a-spring-app-with-cockroachdb-jpa.html).

For another use of Hibernate with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-parameters.md %}

## Step 2. Get the sample code

Clone the `example-app-java-hibernate` repo to your machine:

{% include_cached copy-clipboard.html %}
~~~ shell
git clone https://github.com/cockroachlabs/example-app-java-hibernate/
~~~

{{site.data.alerts.callout_info}}
The version of the CockroachDB Hibernate dialect in `hibernate.cfg.xml` corresponds to a version of CockroachDB. For more information, see [Install Client Drivers: Hibernate](install-client-drivers.html).
{{site.data.alerts.end}}

## Step 3. Run the code

The sample code in this tutorial ([`Sample.java`](#code-contents)) uses Hibernate to map Java methods to SQL operations. The code performs the following operations, which roughly correspond to method calls in the `Sample` class:

1. Creates an `accounts` table as specified by the `Account` mapping class.
1. Inserts rows into the table with the `addAccounts()` method.
1. Transfers money from one account to another with the `transferFunds()` method.
1. Prints out account balances before and after the transfer with the `getAccountBalance()` method.

In addition, the code shows a pattern for automatically handling [transaction retries](transactions.html#client-side-intervention-example) by wrapping transactions in a higher-order function named `runTransaction()`. It also includes a method for testing the retry handling logic (`Sample.forceRetryLogic()`), which will be run if you set the `FORCE_RETRY` variable to `true`.

It does all of the above using the practices we recommend for using Hibernate (and the underlying JDBC connection) with CockroachDB, which are listed in the [Recommended Practices](#recommended-practices) section below.

<a name="code-contents"></a>
The contents of `Sample.java`:

{% include_cached copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-java-hibernate/master/src/main/java/com/cockroachlabs/Sample.java %}
~~~

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Update the connection configuration

Open `src/main/resources/hibernate.cfg.xml`, and set the `hibernate.connection.url`, `hibernate.connection.username`, and `hibernate.connection.password` properties, using the connection information that you obtained from the {{ site.data.products.cloud }} Console:

{% include_cached copy-clipboard.html %}
~~~ xml
<property name="hibernate.connection.url">jdbc:postgresql://{host}:{port}/defaultdb?options=--cluster%3D{routing-id}&amp;sslmode=verify-full</property>
<property name="hibernate.connection.username">{username}</property>
<property name="hibernate.connection.password">{password}</property>
~~~

</section>

### Run the code

Compile and run the code using `gradlew`, which will also download the dependencies:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd example-app-java-hibernate
~~~

{% include_cached copy-clipboard.html %}
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

## Recommended Practices

### Generate PKCS8 keys for client authentication

{% include {{page.version.version}}/app/pkcs8-gen.md %}

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include cockroachcloud/cc-no-user-certs.md %}

</section>

### Use `IMPORT` to read in large data sets

If you are trying to get a large data set into CockroachDB all at once (a bulk import), avoid writing client-side code altogether and use the [`IMPORT`](import.html) statement instead. It is much faster and more efficient than making a series of [`INSERT`s](insert.html) and [`UPDATE`s](update.html). It bypasses the [SQL layer](architecture/sql-layer.html) altogether and writes directly to the [storage layer](architecture/storage-layer.html) of the database.

For more information about importing data from PostgreSQL, see [Migrate from PostgreSQL](migrate-from-postgres.html).

For more information about importing data from MySQL, see [Migrate from MySQL](migrate-from-mysql.html).

### Use `reWriteBatchedInserts` for increased speed

We strongly recommend setting `reWriteBatchedInserts=true`; we have seen 2-3x performance improvements with it enabled. From [the JDBC connection parameters documentation](https://jdbc.postgresql.org/documentation/head/connect.html#connection-parameters):

> This will change batch inserts from `insert into foo (col1, col2, col3) values (1,2,3)` into `insert into foo (col1, col2, col3) values (1,2,3), (4,5,6)` this provides 2-3x performance improvement

### Retrieve large data sets in chunks using cursors

CockroachDB now supports the PostgreSQL wire-protocol cursors for implicit transactions and explicit transactions executed to completion. This means the [PGJDBC driver](https://jdbc.postgresql.org) can use this protocol to stream queries with large result sets. This is much faster than [paginating through results in SQL using `LIMIT .. OFFSET`](pagination.html).

For instructions showing how to use cursors in your Java code, see [Getting results based on a cursor](https://jdbc.postgresql.org/documentation/head/query.html#query-with-cursor) from the PGJDBC documentation.

Note that interleaved execution (partial execution of multiple statements within the same connection and transaction) is not supported when [`Statement.setFetchSize()`](https://docs.oracle.com/javase/8/docs/api/java/sql/Statement.html#setFetchSize-int-) is used.

## What's next?

Read more about using the [Hibernate ORM](http://hibernate.org/orm/), or check out a more realistic implementation of Hibernate with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{page.version.version}}/app/see-also-links.md %}
