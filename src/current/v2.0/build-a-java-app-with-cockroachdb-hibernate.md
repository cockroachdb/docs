---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with the Hibernate ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button">Use <strong>JDBC</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button current">Use <strong>Hibernate</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Java JDBC driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_success}}
For a more realistic use of Hibernate with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

{{site.data.alerts.callout_danger}}
The examples on this page assume you are using a Java version <= 9. They do not work with Java 10.
{{site.data.alerts.end}}

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

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Convert the key file for use with Java

The private key generated for user `maxroach` by CockroachDB is [PEM encoded](https://tools.ietf.org/html/rfc1421).  To read the key in a Java application, you will need to convert it into [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java.

To convert the key to PKCS#8 format, run the following OpenSSL command on the `maxroach` user's key file in the directory where you stored your certificates (`certs` in this example):

{% include_cached copy-clipboard.html %}
~~~ shell
$ openssl pkcs8 -topk8 -inform PEM -outform DER -in client.maxroach.key -out client.maxroach.pk8 -nocrypt
~~~

## Step 5. Run the Java code

Download and extract [hibernate-basic-sample.tgz](https://github.com/cockroachdb/docs/raw/master/_includes/v2.0/app/hibernate-basic-sample/hibernate-basic-sample.tgz), which contains a Java project that includes the following files:

File | Description
-----|------------
[`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/hibernate-basic-sample/Sample.java) | Uses [Hibernate](http://hibernate.org/orm/) to map Java object state to SQL operations.  For more information, see [Sample.java](#sample-java).
[`hibernate.cfg.xml`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/hibernate-basic-sample/hibernate.cfg.xml) | Specifies how to connect to the database and that the database schema will be deleted and recreated each time the app is run.  For more information, see [hibernate.cfg.xml](#hibernate-cfg-xml).
[`build.gradle`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/hibernate-basic-sample/build.gradle) | Used to build and run your app.  For more information, see [build.gradle](#build-gradle).

In the `hibernate-basic-sample` directory, build and run the application:

{% include_cached copy-clipboard.html %}
~~~ shell
$ gradle run
~~~

Toward the end of the output, you should see:

~~~
1 1000
2 250
~~~

To verify that the table and rows were created successfully, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank
~~~

To check the account balances, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |    1000 |
|  2 |     250 |
+----+---------+
(2 rows)
~~~

### Sample.java

The Java code shown below uses the [Hibernate ORM](http://hibernate.org/orm/) to map Java object state to SQL operations. Specifically, this code:

- Creates an `accounts` table in the database based on the `Account` class.

- Inserts rows into the table using `session.save(new Account())`.

- Defines the SQL query for selecting from the table so that balances can be printed using the `CriteriaQuery<Account> query` object.

{% include_cached copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/hibernate-basic-sample/Sample.java %}
~~~

### hibernate.cfg.xml

The Hibernate config (in `hibernate.cfg.xml`, shown below) specifies how to connect to the database.  Note the [connection URL](connection-parameters.html#connect-using-a-url) that turns on SSL and specifies the location of the security certificates.

{% include_cached copy-clipboard.html %}
~~~ xml
{% include {{page.version.version}}/app/hibernate-basic-sample/hibernate.cfg.xml %}
~~~

### build.gradle

The Gradle build file specifies the dependencies (in this case the Postgres JDBC driver and Hibernate):

{% include_cached copy-clipboard.html %}
~~~ groovy
{% include {{page.version.version}}/app/hibernate-basic-sample/build.gradle %}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Java code

Download and extract [hibernate-basic-sample.tgz](https://github.com/cockroachdb/docs/raw/master/_includes/v2.0/app/insecure/hibernate-basic-sample/hibernate-basic-sample.tgz), which contains a Java project that includes the following files:

File | Description
-----|------------
[`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/insecure/hibernate-basic-sample/Sample.java) | Uses [Hibernate](http://hibernate.org/orm/) to map Java object state to SQL operations.  For more information, see [Sample.java](#sample-java).
[`hibernate.cfg.xml`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/insecure/hibernate-basic-sample/hibernate.cfg.xml) | Specifies how to connect to the database and that the database schema will be deleted and recreated each time the app is run.  For more information, see [hibernate.cfg.xml](#hibernate-cfg-xml).
[`build.gradle`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.0/app/insecure/hibernate-basic-sample/build.gradle) | Used to build and run your app.  For more information, see [build.gradle](#build-gradle).

In the `hibernate-basic-sample` directory, build and run the application:

{% include_cached copy-clipboard.html %}
~~~ shell
$ gradle run
~~~

Toward the end of the output, you should see:

~~~
1 1000
2 250
~~~

To verify that the table and rows were created successfully, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

To check the account balances, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |    1000 |
|  2 |     250 |
+----+---------+
(2 rows)
~~~

### Sample.java

The Java code shown below uses the [Hibernate ORM](http://hibernate.org/orm/) to map Java object state to SQL operations. Specifically, this code:

- Creates an `accounts` table in the database based on the `Account` class.

- Inserts rows into the table using `session.save(new Account())`.

- Defines the SQL query for selecting from the table so that balances can be printed using the `CriteriaQuery<Account> query` object.

{% include_cached copy-clipboard.html %}
~~~ java
{% include {{page.version.version}}/app/insecure/hibernate-basic-sample/Sample.java %}
~~~

### hibernate.cfg.xml

The Hibernate config (in `hibernate.cfg.xml`, shown below) specifies how to connect to the database.  Note the [connection URL](connection-parameters.html#connect-using-a-url) that turns on SSL and specifies the location of the security certificates.

{% include_cached copy-clipboard.html %}
~~~ xml
{% include {{page.version.version}}/app/insecure/hibernate-basic-sample/hibernate.cfg.xml %}
~~~

### build.gradle

The Gradle build file specifies the dependencies (in this case the Postgres JDBC driver and Hibernate):

{% include_cached copy-clipboard.html %}
~~~ groovy
{% include {{page.version.version}}/app/insecure/hibernate-basic-sample/build.gradle %}
~~~

</section>

## What's next?

Read more about using the [Hibernate ORM](http://hibernate.org/orm/), or check out a more realistic implementation of Hibernate with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{page.version.version}}/app/see-also-links.md %}
