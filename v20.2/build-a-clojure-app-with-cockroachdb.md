---
title: Build a Clojure App with CockroachDB and java.jdbc
summary: Learn how to use CockroachDB from a simple Clojure application with a low-level client driver.
toc: true
twitter: false
---

This tutorial shows you how build a simple Clojure application with CockroachDB using [leiningen](https://leiningen.org/) and the Closure java.jdbc driver.

We have tested the [Clojure java.jdbc driver](http://clojure-doc.org/articles/ecosystem/java_jdbc/home.html) in conjunction with the [PostgreSQL JDBC driver](https://jdbc.postgresql.org/) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install `leiningen`

Install the Clojure `lein` utility as described in its [official documentation](https://leiningen.org/).

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

<span class="version-tag">New in v19.1</span>: Pass the [`--also-generate-pkcs8-key` flag](cockroach-cert.html#flag-pkcs8) to generate a key in [PKCS#8 format](https://tools.ietf.org/html/rfc5208), which is the standard key encoding format in Java. In this case, the generated PKCS8 key will be named `client.maxroach.key.pk8`.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key --also-generate-pkcs8-key
~~~

## Step 4. Create a table in the new database

As the `maxroach` user, use the [built-in SQL client](cockroach-sql.html) to create an `accounts` table in the new database.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=certs \
--database=bank \
--user=maxroach \
-e 'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)'
~~~

## Step 5. Run the Clojure code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Create a basic Clojure/JDBC project

1. Create a new directory `myapp`.
2. Create a file `myapp/project.clj` and populate it with the following code, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/project.clj" download>download it directly</a>.

    {% include copy-clipboard.html %}
    ~~~ clojure
    {% include {{ page.version.version }}/app/project.clj %}
    ~~~

3. Create a file `myapp/src/test/util.clj` and populate it with the code from <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/util.clj" download>this file</a>. Be sure to place the file in the subdirectory `src/test` in your project.

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

Create a file `myapp/src/test/test.clj` and copy the code below to it, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.clj" download>download it directly</a>. Be sure to rename this file to `test.clj` in the subdirectory `src/test` in your project.

{% include copy-clipboard.html %}
~~~ clojure
{% include {{ page.version.version }}/app/basic-sample.clj %}
~~~

Run with:

{% include copy-clipboard.html %}
~~~ shell
$ lein run
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code below to `myapp/src/test/test.clj` or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.clj" download>download it directly</a>. Again, preserve the file name `test.clj`.

{{site.data.alerts.callout_info}}
CockroachDB may require the
[client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ clojure
{% include {{ page.version.version }}/app/txn-sample.clj %}
~~~

Run with:

{% include copy-clipboard.html %}
~~~ shell
$ lein run
~~~

After running the code, use the [built-in SQL client](cockroach-sql.html) to verify that funds were transferred from one account to another:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
id | balance
+----+---------+
 1 |     900
 2 |     350
(2 rows)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Create a table in the new database

As the `maxroach` user, use the [built-in SQL client](cockroach-sql.html) to create an `accounts` table in the new database.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure \
--database=bank \
--user=maxroach \
-e 'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)'
~~~

## Step 4. Run the Clojure code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Create a basic Clojure/JDBC project

1. Create a new directory `myapp`.
2. Create a file `myapp/project.clj` and populate it with the following code, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/project.clj" download>download it directly</a>.

    {% include copy-clipboard.html %}
    ~~~ clojure
    {% include {{ page.version.version }}/app/project.clj %}
    ~~~

3. Create a file `myapp/src/test/util.clj` and populate it with the code from <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/util.clj" download>this file</a>. Be sure to place the file in the subdirectory `src/test` in your project.

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

Create a file `myapp/src/test/test.clj` and copy the code below to it, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample.clj" download>download it directly</a>. Be sure to rename this file to `test.clj` in the subdirectory `src/test` in your project.

{% include copy-clipboard.html %}
~~~ clojure
{% include {{ page.version.version }}/app/insecure/basic-sample.clj %}
~~~

Run with:

{% include copy-clipboard.html %}
~~~ shell
$ lein run
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code below to `myapp/src/test/test.clj` or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample.clj" download>download it directly</a>. Again, preserve the file name `test.clj`.

{{site.data.alerts.callout_info}}
CockroachDB may require the
[client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ clojure
{% include {{ page.version.version }}/app/insecure/txn-sample.clj %}
~~~

Run with:

{% include copy-clipboard.html %}
~~~ shell
$ lein run
~~~

After running the code, use the [built-in SQL client](cockroach-sql.html) to verify that funds were transferred from one account to another:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
id | balance
+----+---------+
 1 |     900
 2 |     350
(2 rows)
~~~

</section>

## What's next?

Read more about using the [Clojure java.jdbc driver](http://clojure-doc.org/articles/ecosystem/java_jdbc/home.html).

{% include {{ page.version.version }}/app/see-also-links.md %}
