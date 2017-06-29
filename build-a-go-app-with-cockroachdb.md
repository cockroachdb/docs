---
title: Build a Go App with CockroachDB
summary: Learn how to use CockroachDB from a simple Go application with the Go pq driver.
toc: false
twitter: true
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button">Use <strong>GORM</strong></button></a>
</div>

This tutorial shows you how build a simple Go application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Go pq driver](https://godoc.org/github.com/lib/pq) and the [GORM ORM](http://jinzhu.me/gorm/), so those are featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Go pq driver

To install the [Go pq driver](https://godoc.org/github.com/lib/pq), run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

{% include app/common-steps.md %}

## Step 5. Run the Go code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/basic-sample.go" download><code>basic-sample.go</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ go
{% include app/basic-sample.go %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ go run basic-sample.go
~~~

The output should be:

~~~ shell
Initial balances:
1 1000
2 250
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time will execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/txn-sample.go" download><code>txn-sample.go</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ go
{% include app/txn-sample.go %}
~~~

With the default `SERIALIZABLE` isolation level, CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. For Go, the CockroachDB retry function is in the `crdb` package of the CockroachDB Go client. Clone the library into your `$GOPATH` as follows:

{% include copy-clipboard.html %}
~~~ shell
$ mkdir -p $GOPATH/github.com/cockroachdb
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cd $GOPATH/github.com/cockroachdb
~~~

{% include copy-clipboard.html %}
~~~ shell
$ git clone git@github.com:cockroachdb/cockroach-go.git
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ go run txn-sample.go
~~~

The output should just be:

~~~ shell
Success
~~~

However, if you want to verify that funds were transferred from one account to another, use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
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

## What's Next?

Read more about using the [Go pq driver](https://godoc.org/github.com/lib/pq).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
