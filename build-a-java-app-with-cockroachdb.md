---
title: Build a Java App with CockroachDB
summary: Learn how to use CockroachDB from a simple Java application with either a low-level client driver or ORM.
toc: false
---

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="driver">Use <strong>jdbc</strong></button>
    <button class="filter-button" data-scope="orm">Use <strong>Hibernate</strong></button>
</div>

This tutorial shows you how build a simple Java application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Java jdbc driver](https://jdbc.postgresql.org/) and the [Hibernate ORM](http://hibernate.org/), so those are featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

<div class="filter-content" markdown="1" data-scope="driver">
## Step 1. Install the Java jdbc driver

Download and set up the Java jdbc driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/head/setup.html).
</div>

<div class="filter-content" markdown="1" data-scope="orm">
## Step 1. Install the Gradle build tool

This tutorial uses the [Gradle build tool](https://gradle.org/) to get all dependencies for your application, including the Hibernate ORM. To install Gradle, run the following command:

~~~ shell
# On Mac:
$ brew install gradle

# On Ubuntu Linux:
$ apt-get install gradle
~~~

For other ways to install Gradle, see the [official documentation](https://gradle.org/install).
</div>

{% include app/common-steps.md %}

## Step 5. Run the Java code

<div class="filter-content" markdown="1" data-scope="driver">
### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, creating a table, inserting rows, and reading and printing the rows. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/BasicSample.java" download>download it directly</a>.

~~~ java
{% include app/BasicSample.java %}
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.rb" download>download it directly</a>. 

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ java
{% include app/TxnSample.java %}
~~~

After running the code, to verify that funds were, in fact, transferred from one account to another, you can again use the [built-in SQL client](use-the-built-in-sql-client.html): 

~~~ shell
$ cockroach sql -e 'SELECT id, balance FROM accounts' --database=bank
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
</div>

<div class="filter-content" markdown="1" data-scope="orm">

[Downlod and extract this tarball](https://github.com/cockroachdb/docs/raw/gh-pages/_includes/app/hibernate-basic-sample/hibernate-basic-sample.tgz), which includes three files that work together:

File | Description
-----|------------
[`hibernate.cfg.xml`](https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/hibernate-basic-sample/hibernate.cfg.xml) | This file specifies how to connect to the database and that the database schema will be deleted and recreated each time the app is run. It must be in the `src/main/resources` directory.
[`Sample.java`](https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/hibernate-basic-sample/Sample.java) | This file uses the Hibernate ORM to map Java-specific objects to SQL operations. It must be in the `src/main/java/com/cockroachlabs/` directory.
[`build.gradle`](https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/hibernate-basic-sample/build.gradle) | This is the file you run to execute your app. 

For more insight into this sample application, review the `Sample.java` file, which uses the [Hibernate ORM](http://hibernate.org/orm/) to map Java-specific objects to SQL operations. Specifically, an `accounts` table gets created based on the `Account` class, `session.save(new Account())` inserts rows into the table, and the `CriteriaQuery<Account> query` object defines the SQL query for selecting from the table so that balances can be printed.

~~~ java
{% include app/hibernate-basic-sample/Sample.java %}
~~~

Then in the `hibernate-basic-sample` directory, run the gradle file to fetch the dependencies in `Sample.java` (including Hibernate) and run the application:

~~~ shell
$ gradle run 
~~~

Toward the end of the output, you should see:

~~~ shell
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):  

~~~ shell
$ cockroach sql -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

~~~ shell
$ cockroach sql -e 'SELECT id, balance FROM accounts' --database=bank
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
</div>

## What's Next?

<div class="filter-content" markdown="1" data-scope="driver">
Read more about using the [Java jdbc driver](https://jdbc.postgresql.org/).
</div>

<div class="filter-content" markdown="1" data-scope="orm">
Read more about using the [Hibernate ORM](http://hibernate.org/orm/).
</div>

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Scalability](demo-scalability.html)
