---
title: Build a Go App with CockroachDB the Go pgx Driver
summary: Learn how to use CockroachDB from a simple Go application with the Go pgx driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>pgx</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-pq.html"><button class="filter-button">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button">Use <strong>GORM</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-upperdb.html"><button class="filter-button">Use <strong>upper/db</strong></button></a>
</div>

This tutorial shows you how build a simple Go application with CockroachDB and the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx).

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the pgx driver

To install the pgx driver, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jackc/pgx
~~~

## Step 2. Install the CockroachDB Go library

To install the [CockroachDB Go library](https://pkg.go.dev/github.com/cockroachdb/cockroach-go/crdb), run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/cockroachdb/cockroach-go/crdb
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 3. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 4. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

The code samples will run with `maxroach` as the user.

## Step 5. Run the Go code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect to the cluster as the `maxroach` user, and then execute some basic SQL statements that create a table, insert some rows, and read and print the rows to the console.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample-pgx.go" download><code>basic-sample-pgx.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/basic-sample-pgx.go %}
~~~

Initialize the module:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go mod init basic-sample-pgx
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run basic-sample-pgx.go
~~~

The output should be:

~~~
Initial balances:
1 1000
2 250
~~~

### Transaction (with retry logic)

Next, use the following code to connect as `maxroach` user, and then execute a batch of statements as an atomic transaction to transfer funds from one account to another. All statements in the transaction are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample-pgx.go" download><code>txn-sample-pgx.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/txn-sample-pgx.go %}
~~~

CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. The [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go) includes a generic **retry function** (`ExecuteTx`) that runs inside a transaction and retries it as needed.

To run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run txn-sample-pgx.go
~~~

The output should be:

~~~
Success
~~~

To verify that funds were transferred from one account to another, use the [built-in SQL client](cockroach-sql.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e 'SELECT id, balance FROM accounts' --database=bank
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

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 3. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 4. Run the Go code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

First, use the following code to connect to the cluster as the `maxroach` user, and then execute some basic SQL statements that create a table, insert some rows, and read and print the rows to the console.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample-pgx.go" download><code>basic-sample-pgx.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/insecure/basic-sample-pgx.go %}
~~~

Initialize the module:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go mod init basic-sample-pgx
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run basic-sample-pgx.go
~~~

The output should be:

~~~
Initial balances:
1 1000
2 250
~~~

### Transaction (with retry logic)

Next, use the following code to connect as `maxroach` user, and then execute a batch of statements as an atomic transaction to transfer funds from one account to another. All statements in the transaction are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample-pgx.go" download><code>txn-sample-pgx.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/insecure/txn-sample-pgx.go %}
~~~

CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. The [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go) includes a generic **retry function** (`ExecuteTx`) that runs inside a transaction and retries it as needed.

To run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run txn-sample-pgx.go
~~~

The output should be:

~~~
Success
~~~

To verify that funds were transferred from one account to another, use the [built-in SQL client](cockroach-sql.html):

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

</section>

## What's next?

Read more about using the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx?tab=doc).

{% include {{ page.version.version }}/app/see-also-links.md %}
