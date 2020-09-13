---
title: Build a C++ App with CockroachDB and libpqxx
summary: Learn how to use CockroachDB from a simple C++ application with a low-level client driver.
toc: true
twitter: false
---

This tutorial shows you how build a simple C++ application with CockroachDB and the C++ libpqxx driver.

We have tested the [C++ libpqxx driver](https://github.com/jtv/libpqxx) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the libpqxx driver

Install the C++ libpqxx driver as described in the [official documentation](https://github.com/jtv/libpqxx).

{{site.data.alerts.callout_info}}
If you are running macOS, you need to install version 4.0.1 or higher of the libpqxx driver.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the C++ code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.cpp" download><code>basic-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/basic-sample.cpp %}
~~~

To build the `basic-sample.cpp` source code to an executable file named `basic-sample`, run the following command from the directory that contains the code:

{% include copy-clipboard.html %}
~~~ shell
$ g++ -std=c++11 basic-sample.cpp -lpq -lpqxx -o basic-sample
~~~

Then run the `basic-sample` file from that directory:

{% include copy-clipboard.html %}
~~~ shell
$ ./basic-sample
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.cpp" download><code>txn-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/txn-sample.cpp %}
~~~

To build the `txn-sample.cpp` source code to an executable file named `txn-sample`, run the following command from the  directory that contains the code:

{% include copy-clipboard.html %}
~~~ shell
$ g++ -std=c++11 txn-sample.cpp -lpq -lpqxx -o txn-sample
~~~

Then run the `txn-sample` file from that directory:

{% include copy-clipboard.html %}
~~~ shell
$ ./txn-sample
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

## Step 3. Run the C++ code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample.cpp" download><code>basic-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/insecure/basic-sample.cpp %}
~~~

To build the `basic-sample.cpp` source code to an executable file named `basic-sample`, run the following command from the directory that contains the code:

{% include copy-clipboard.html %}
~~~ shell
$ g++ -std=c++11 basic-sample.cpp -lpq -lpqxx -o basic-sample
~~~

Then run the `basic-sample` file from that directory:

{% include copy-clipboard.html %}
~~~ shell
$ ./basic-sample
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample.cpp" download><code>txn-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/insecure/txn-sample.cpp %}
~~~

To build the `txn-sample.cpp` source code to an executable file named `txn-sample`, run the following command from the  directory that contains the code:

{% include copy-clipboard.html %}
~~~ shell
$ g++ -std=c++11 txn-sample.cpp -lpq -lpqxx -o txn-sample
~~~

Then run the `txn-sample` file from that directory:

{% include copy-clipboard.html %}
~~~ shell
$ ./txn-sample
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

Read more about using the [C++ libpqxx driver](https://github.com/jtv/libpqxx).

{% include {{ page.version.version }}/app/see-also-links.md %}
