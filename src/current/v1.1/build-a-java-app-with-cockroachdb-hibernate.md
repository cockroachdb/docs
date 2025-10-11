---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with the Hibernate ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-java-app-with-cockroachdb.html"><button class="filter-button">Use <strong>jdbc</strong></button></a>
    <a href="build-a-java-app-with-cockroachdb-hibernate.html"><button class="filter-button current">Use <strong>Hibernate</strong></button></a>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Java jdbc driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_success}}For a more realistic use of Hibernate with CockroachDB, see our <a href="https://github.com/cockroachdb/examples-orms"><code>examples-orms</code></a> repository.{{site.data.alerts.end}}


## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Gradle build tool

This tutorial uses the [Gradle build tool](https://gradle.org/) to get all dependencies for your application, including the Hibernate ORM. To install Gradle, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
# On Mac:
$ brew install gradle
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
# On Ubuntu Linux:
$ apt-get install gradle
~~~

For other ways to install Gradle, see the [official documentation](https://gradle.org/install).

{% include {{ page.version.version }}/app/common-steps.md %}

## Step 5. Run the Java code

[Download and extract this tarball](https://github.com/cockroachdb/docs/raw/master/_includes/{{ page.version.version }}/app/hibernate-basic-sample/hibernate-basic-sample.tgz), which includes three files that work together:

File | Description
-----|------------
[`hibernate.cfg.xml`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/hibernate-basic-sample/hibernate.cfg.xml) | This file specifies how to connect to the database and that the database schema will be deleted and recreated each time the app is run. It must be in the `src/main/resources` directory.
[`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/hibernate-basic-sample/Sample.java) | This file uses the Hibernate ORM to map Java-specific objects to SQL operations. It must be in the `src/main/java/com/cockroachlabs/` directory.
[`build.gradle`](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/hibernate-basic-sample/build.gradle) | This is the file you run to execute your app.

For more insight into this sample application, review the `Sample.java` file, which uses the [Hibernate ORM](http://hibernate.org/orm/) to map Java-specific objects to SQL operations. Specifically, an `accounts` table gets created based on the `Account` class, `session.save(new Account())` inserts rows into the table, and the `CriteriaQuery<Account> query` object defines the SQL query for selecting from the table so that balances can be printed.

{% include_cached copy-clipboard.html %}
~~~ java
{% include {{ page.version.version }}/app/hibernate-basic-sample/Sample.java %}
~~~

Then in the `hibernate-basic-sample` directory, run the gradle file to fetch the dependencies in `Sample.java` (including Hibernate) and run the application:

{% include_cached copy-clipboard.html %}
~~~ shell
$ gradle run
~~~

Toward the end of the output, you should see:

~~~ shell
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SELECT id, balance FROM accounts' --database=bank
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

## What's Next?

Read more about using the [Hibernate ORM](http://hibernate.org/orm/), or check out a more realistic implementation of Hibernate with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
