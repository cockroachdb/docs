---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with the Hibernate ORM.
toc: false
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

<div id="toc"></div>

## Before you begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

{{site.data.alerts.callout_danger}}
The examples on this page assume you are using a Java version <= 9. They do not work with Java 10.
{{site.data.alerts.end}}

## Step 1. Install the Gradle build tool

This tutorial uses the [Gradle build tool](https://gradle.org/) to get all dependencies for your application, including Hibernate.

To install Gradle on Mac, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ brew install gradle
~~~

To install Gradle on a Debian-based Linux distribution like Ubuntu:

{% include copy-clipboard.html %}
~~~ shell
$ apt-get install gradle
~~~

To install Gradle on a Red Hat-based Linux distribution like Fedora:

{% include copy-clipboard.html %}
~~~ shell
$ dnf install gradle
~~~

For other ways to install Gradle, see [its official documentation](https://gradle.org/install).

{% include v2.1/app/common-steps-secure.md %}

## Step 5. Convert the key file for use with Java

In the directory where you store your certificates (`/tmp/certs` in this example), convert maxroach's user key file into a format that will work with Java like so:

{% include copy-clipboard.html %}
~~~ shell
$ openssl pkcs8 -topk8 -inform PEM -outform DER -in client.maxroach.key -out client.maxroach.pk8 -nocrypt
~~~

## Step 6. Run the Java code

Download and extract [hibernate-basic-sample.tgz](https://github.com/cockroachdb/docs/raw/master/_includes/v2.1/app/hibernate-basic-sample/hibernate-basic-sample.tgz), which contains a Java project that includes the following files:

File | Description
-----|------------
[`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/hibernate-basic-sample/Sample.java) | Uses [Hibernate](http://hibernate.org/orm/) to map Java object state to SQL operations.  For more information, see [Sample.java](#sample-java).
[`hibernate.cfg.xml`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/hibernate-basic-sample/hibernate.cfg.xml) | Specifies how to connect to the database and that the database schema will be deleted and recreated each time the app is run.  For more information, see [hibernate.cfg.xml](#hibernate-cfg-xml).
[`build.gradle`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/hibernate-basic-sample/build.gradle) | Used to build and run your app.  For more information, see [build.gradle](#build-gradle).

In the `hibernate-basic-sample` directory, build and run the application:

{% include copy-clipboard.html %}
~~~ shell
$ gradle run
~~~

Toward the end of the output, you should see:

~~~
1 1000
2 250
~~~

To verify that the table and rows were created successfully, use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=/tmp/certs -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=/tmp/certs -e 'SELECT id, balance FROM accounts' --database=bank
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

{% include copy-clipboard.html %}
~~~ java
{% include v2.1/app/hibernate-basic-sample/Sample.java %}
~~~

### hibernate.cfg.xml

The Hibernate config (in `hibernate.cfg.xml`, shown below) specifies how to connect to the database.  Note the [connection URL](connection-parameters.html#connect-using-a-url) that turns on SSL and specifies the location of the security certificates.

{% include copy-clipboard.html %}
~~~ xml
{% include v2.1/app/hibernate-basic-sample/hibernate.cfg.xml %}
~~~

### build.gradle

The Gradle build file specifies the dependencies (in this case the Postgres JDBC driver and Hibernate):

{% include copy-clipboard.html %}
~~~ groovy
{% include v2.1/app/hibernate-basic-sample/build.gradle %}
~~~

## What's next?

Read more about using the [Hibernate ORM](http://hibernate.org/orm/), or check out a more realistic implementation of Hibernate with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include v2.1/app/see-also-links.md %}
