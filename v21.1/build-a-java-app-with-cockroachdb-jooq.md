---
title: Build a Java App with CockroachDB and jOOQ
summary: Learn how to use CockroachDB from a simple Java application with jOOQ.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button">Use <strong>Hibernate</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-jooq.html"><button class="filter-button current">Use <strong>jOOQ</strong></button></a>
    <a href="build-a-spring-app-with-cockroachdb-mybatis.html"><button style="width: 25%" class="filter-button">Use <strong>MyBatis-Spring</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB and [jOOQ](https://www.jooq.org/).

CockroachDB is supported in jOOQ [Professional and Enterprise editions](https://www.jooq.org/download/#databases).

{% include {{page.version.version}}/app/java-version-note.md %}

{{site.data.alerts.callout_success}}
For another use of jOOQ with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install Maven

This tutorial uses the [Maven build tool](https://gradle.org/) to manage application dependencies.

To install Maven on Mac, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ brew install maven
~~~

To install Maven on a Debian-based Linux distribution like Ubuntu:

{% include copy-clipboard.html %}
~~~ shell
$ apt-get install maven
~~~

For other ways to install Maven, see [its official documentation](https://maven.apache.org/install.html).

## Step 2. Install jOOQ

Download the free trial of jOOQ Professional or Enterprise edition from [jOOQ's website](https://www.jooq.org/download), and unzip the file.

To install jOOQ to your machine's local Maven repository, run the `maven-install.sh` script included in the jOOQ install folder:

{% include copy-clipboard.html %}
~~~ shell
$ chmod +x maven-install.sh
~~~

{% include copy-clipboard.html %}
~~~ shell
$ ./maven-install.sh
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 3. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 4. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

The [`--also-generate-pkcs8-key` flag](cockroach-cert.html#flag-pkcs8) generates a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java. In this case, the generated PKCS8 key will be named `client.maxroach.key.pk8`.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key --also-generate-pkcs8-key
~~~

## Step 5. Run the Java code

The code below uses jOOQ to map Java methods to SQL operations. It performs the following steps, some of which correspond to method calls of the `Sample` class.

1. Inputs the `db.sql` file to the database. `db.sql` includes SQL statements that create an `accounts` table in the `bank` database.
2. Inserts rows into the `accounts` table using `session.save(new Account(int id, int balance))` (see `Sample.addAccounts()`).
3. Transfers money from one account to another, printing out account balances before and after the transfer (see `transferFunds(long fromId, long toId, long amount)`).
4. Prints out account balances before and after the transfer (see `Sample.getAccountBalance(long id)`).

In addition, the code shows a pattern for automatically handling [transaction retries](transactions.html#client-side-intervention-example) by wrapping transactions in a higher-order function `Sample.runTransaction()`. It also includes a method for testing the retry handling logic (`Sample.forceRetryLogic()`), which will be run if you set the `FORCE_RETRY` variable to `true`.

To run it:

1. Download and unzip [jooq-basic-sample.zip](https://github.com/cockroachdb/docs/raw/master/_includes/{{ page.version.version }}/app/jooq-basic-sample/jooq-basic-sample.zip).
2. Open `jooq-basic-sample/src/main/java/com/cockroachlabs/Sample.java`, and edit the connection string passed to `DriverManager.getConnection()` in the `Sample` class's `main()` method so that the certificate paths are fully and correctly specified.
3. Compile and run the code using Maven:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd jooq-basic-sample
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mvn compile
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mvn exec:java -Dexec.mainClass=com.cockroachlabs.Sample
    ~~~

Here are the contents of [`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/jooq-basic-sample/Sample.java), the Java file containing the main `Sample` class:

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/jooq-basic-sample/Sample.java %}
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

To check the account balances, issue the following statement:

{% include copy-clipboard.html %}
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

## Step 3. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 4. Run the Java code

The code below uses jOOQ to map Java methods to SQL operations. It performs the following steps, some of which correspond to method calls of the `Sample` class.

1. Inputs the `db.sql` file to the database. `db.sql` includes SQL statements that create an `accounts` table in the `bank` database.
2. Inserts rows into the `accounts` table using `session.save(new Account(int id, int balance))` (see `Sample.addAccounts()`).
3. Transfers money from one account to another, printing out account balances before and after the transfer (see `transferFunds(long fromId, long toId, long amount)`).
4. Prints out account balances before and after the transfer (see `Sample.getAccountBalance(long id)`).

In addition, the code shows a pattern for automatically handling [transaction retries](transactions.html#client-side-intervention-example) by wrapping transactions in a higher-order function `Sample.runTransaction()`. It also includes a method for testing the retry handling logic (`Sample.forceRetryLogic()`), which will be run if you set the `FORCE_RETRY` variable to `true`.

To run it:

1. Download and unzip [jooq-basic-sample.zip](https://github.com/cockroachdb/docs/raw/master/_includes/{{ page.version.version }}/app/insecure/jooq-basic-sample/jooq-basic-sample.zip).
2. Compile and run the code using Maven:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd jooq-basic-sample
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mvn compile
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mvn exec:java -Dexec.mainClass=com.cockroachlabs.Sample
    ~~~

Here are the contents of [`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/insecure/jooq-basic-sample/Sample.java), the Java file containing the main `Sample` class:

{% include copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/insecure/jooq-basic-sample/Sample.java %}
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

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

To check the account balances, issue the following statement:

{% include copy-clipboard.html %}
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


## What's next?

Read more about using [jOOQ](https://www.jooq.org/), or check out a more realistic implementation of jOOQ with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{page.version.version}}/app/see-also-links.md %}
