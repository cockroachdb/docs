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

~~~ shell
$ go get -u github.com/lib/pq
~~~

{% include app/common-steps.md %}

## Step 5. Run the Go code

### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.go" download>download it directly</a>.

~~~ go
{% include app/basic-sample.go %}
~~~

Then run the code:

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

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.go" download>download it directly</a>.

~~~ go
{% include app/txn-sample.go %}
~~~

Because the CockroachDB transaction model requires the [client to initiate retries](transactions.html#transaction-retries) in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. For Go, the CockroachDB retry function is in the `crdb` package of the CockroachDB Go client. Clone the library into your `$GOPATH` as follows:

~~~ shell
$ mkdir -p $GOPATH/github.com/cockroachdb
$ cd $GOPATH/github.com/cockroachdb
$ git clone git@github.com:cockroachdb/cockroach-go.git
~~~

Then run the code:

~~~ shell
$ go run txn-sample.go
~~~

The output should just be:

~~~ shell
Success
~~~

However, if you want to verify that funds were, in fact, transferred from one account to another, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

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

## What's Next?

Read more about using the [Go pq driver](https://godoc.org/github.com/lib/pq).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
