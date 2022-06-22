---
title: Build a C++ App with CockroachDB
summary: Learn how to use CockroachDB from a simple C++ application with a low-level client driver.
toc: true
twitter: false
---

This tutorial shows you how build a simple C++ application with CockroachDB using a PostgreSQL-compatible driver.

We have tested the [C++ libpqxx driver](https://github.com/jtv/libpqxx) enough to claim **beta-level** support, so that driver is featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.


## Before you begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the libpqxx driver

Install the C++ libpqxx driver as described in the [official documentation](https://github.com/jtv/libpqxx).

{% include {{ page.version.version }}/app/common-steps.md %}

## Step 5. Run the C++ code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.cpp" download><code>basic-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/basic-sample.cpp %}
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.cpp" download><code>txn-sample.cpp</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ cpp
{% include {{ page.version.version }}/app/txn-sample.cpp %}
~~~

After running the code, use the [built-in SQL client](use-the-built-in-sql-client.html) to verify that funds were transferred from one account to another:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SELECT id, balance FROM accounts' --database=bank
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

## What's next?

Read more about using the [C++ libpqxx driver](https://github.com/jtv/libpqxx).

{% include {{ page.version.version }}/app/see-also-links.md %}
