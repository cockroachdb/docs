---
title: Build a C++ App with CockroachDB and libpqxx
summary: Learn how to use CockroachDB from a simple C++ application with a low-level client driver.
toc: true
twitter: false
---

This tutorial shows you how build a simple C++ application with CockroachDB and the C++ libpqxx driver.

We have tested the [C++ libpqxx driver](https://github.com/jtv/libpqxx) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database and a user

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Install the libpq and libpqxx drivers

1. Install `libpq` on your machine. For example, on macOS:

    {% include copy-clipboard.html %}
    ~~~ shell
    brew install libpq
    ~~~

1. Install the libpqxx driver, using [CMake](https://github.com/jtv/libpqxx/blob/master/BUILDING-cmake.md) or the [configure script](https://github.com/jtv/libpqxx/blob/master/configure) provided in the [`libpqxx` repo](https://github.com/jtv/libpqxx).

    {{site.data.alerts.callout_info}}
    If you are running macOS, you need to install version 4.0.1 or higher of the libpqxx driver.
    {{site.data.alerts.end}}

## Step 4. Get the C++ code

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample.cpp" download><code>basic-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

## Step 5. Run the code

You'll first run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

<section class="filter-content" markdown="1" data-scope="local">

Use the following code to connect as the [user you created earlier](#step-2-create-a-database-and-a-user) and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

You will need to open `basic-sample.cpp`, and edit the connection configuration parameters:

- Replace the value for `username` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.
- Replace the value for `host` with the host to your cluster.
- Replace the value for `port` with the port to your cluster.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Use the following code to connect and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

You will need to open `basic-sample.cpp`, and edit the following:

- Replace the connection string in the code with the connection string that was provided in the CockroachCloud Console [earlier](#set-up-your-cluster-connection).
- Replace `defaultdb` in the connection string with `bank` to connect to the `bank` database you created [earlier](#step-2-create-a-database-and-a-user).

</section>

{% include copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/basic-sample.cpp %}
~~~

To build the `basic-sample.cpp` source code to an executable file named `basic-sample`, run the following command from the directory that contains the code:

{% include copy-clipboard.html %}
~~~ shell
$ g++ -std=c++17 basic-sample.cpp -lpq -lpqxx -o basic-sample
~~~

Then run the `basic-sample` file from that directory:

{% include copy-clipboard.html %}
~~~ shell
$ ./basic-sample
~~~

### Transaction (with retry logic)

<section class="filter-content" markdown="1" data-scope="local">

Next, use the following code to again connect as the [user you created earlier](#step-2-create-a-database-and-a-user) but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

You will need to open `basic-sample.cpp`, and edit the connection configuration parameters:

- Replace the value for `username` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.
- Replace the value for `host` with the host to your cluster.
- Replace the value for `port` with the port to your cluster.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Next, use the following code to again connect, but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

You will need to open `txn-sample.cpp`, and edit the following:

- Replace the connection string in the code with the connection string that was provided in the CockroachCloud Console [earlier](#set-up-your-cluster-connection).
- Replace `defaultdb` in the connection string with `bank` to connect to the `bank` database you created [earlier](#step-2-create-a-database-and-a-user).

</section>

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample.cpp" download><code>txn-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/txn-sample.cpp %}
~~~

To build the `txn-sample.cpp` source code to an executable file named `txn-sample`, run the following command from the  directory that contains the code:

{% include copy-clipboard.html %}
~~~ shell
$ g++ -std=c++17 txn-sample.cpp -lpq -lpqxx -o txn-sample
~~~

Then run the `txn-sample` file from that directory:

{% include copy-clipboard.html %}
~~~ shell
$ ./txn-sample
~~~

After running the code, use the [built-in SQL client](cockroach-sql.html) to verify that funds were transferred from one account to another:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --url 'postgresql://{username}:{password}@{host}:{port}/{cluster_name}.bank?sslmode=verify-full&sslrootcert={path/to/ca.crt}' -e 'SELECT id, balance FROM accounts'
~~~

~~~
id | balance
+----+---------+
 1 |     900
 2 |     350
(2 rows)
~~~

## What's next?

Read more about using the [C++ libpqxx driver](https://github.com/jtv/libpqxx).

{% include {{ page.version.version }}/app/see-also-links.md %}
