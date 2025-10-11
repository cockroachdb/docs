---
title: Build a Go App with CockroachDB
summary: Learn how to use CockroachDB from a simple Go application with the Go pq driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button">Use <strong>GORM</strong></button></a>
</div>

This tutorial shows you how build a simple Go application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Go pq driver](https://godoc.org/github.com/lib/pq) and the [GORM ORM](http://gorm.io) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the Go pq driver

To install the [Go pq driver](https://godoc.org/github.com/lib/pq), run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Go code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

{{site.data.alerts.callout_success}}
To clone a version of the code below that connects to insecure clusters, run the command below. Note that you will need to edit the connection string to use the certificates that you generated when you set up your secure cluster.

`git clone https://github.com/cockroachlabs/hello-world-go-pq/`
{{site.data.alerts.end}}

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.go" download><code>basic-sample.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/basic-sample.go %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run basic-sample.go
~~~

The output should be:

~~~
Initial balances:
1 1000
2 250
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time will execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.go" download><code>txn-sample.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/txn-sample.go %}
~~~

CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. For Go, the CockroachDB retry function is in the `crdb` package of the CockroachDB Go client. To install  Clone the library into your `$GOPATH` as follows:

{% include_cached copy-clipboard.html %}
~~~ shell
$ mkdir -p $GOPATH/src/github.com/cockroachdb
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd $GOPATH/src/github.com/cockroachdb
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone git@github.com:cockroachdb/cockroach-go.git
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run txn-sample.go
~~~

The output should be:

~~~ shell
Success
~~~

To verify that funds were transferred from one account to another, use the [built-in SQL client](use-the-built-in-sql-client.html):

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

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Go code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

{{site.data.alerts.callout_success}}
To clone a version of the code below that connects to insecure clusters, run the command below. Note that you will need to edit the connection string to use the certificates that you generated when you set up your secure cluster.

`git clone https://github.com/cockroachlabs/hello-world-go-pq/`
{{site.data.alerts.end}}

### Basic statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample.go" download><code>basic-sample.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/insecure/basic-sample.go %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run basic-sample.go
~~~

The output should be:

~~~
Initial balances:
1 1000
2 250
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time will execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample.go" download><code>txn-sample.go</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/insecure/txn-sample.go %}
~~~

CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. For Go, the CockroachDB retry function is in the `crdb` package of the CockroachDB Go client.

To install the [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go), run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -d github.com/cockroachdb/cockroach-go
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run txn-sample.go
~~~

The output should be:

~~~ shell
Success
~~~

To verify that funds were transferred from one account to another, use the [built-in SQL client](use-the-built-in-sql-client.html):

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

Read more about using the [Go pq driver](https://godoc.org/github.com/lib/pq).

{% include {{ page.version.version }}/app/see-also-links.md %}
