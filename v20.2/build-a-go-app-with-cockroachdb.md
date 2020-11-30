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

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Run the Go code

You can now run the code sample (`main.go`) provided in this tutorial to do the following:

- Create a table in the `bank` database.
- Insert some rows into the table you created.
- Read values from the table.
- Execute a batch of statements as an atomic [transaction](transactions.html).

    Note that CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in the case of read/write contention. The [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go) includes a generic **retry function** (`ExecuteTx()`) that runs inside a transaction and retries it as needed. The code sample shows how you can use this function to wrap SQL statements.

### Get the code

You can copy the code below, <a href="https://raw.githubusercontent.com/cockroachlabs/hello-world-go-pgx/master/main.go">download the code directly</a>, or clone [the code's GitHub repository](https://github.com/cockroachlabs/hello-world-go-pgx).

Here are the contents of `main.go`:

{% include copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-go-pgx/master/main.go %}
~~~

### Update the connection parameters

Edit the connection string passed to `pgx.ParseConfig()` so that:

- `{username}` and `{password}` specify the SQL username and password that you created earlier.
- `{hostname}` and `{port}` specify the hostname and port in the `(sql/tcp)` connection string from SQL shell welcome text.

### Run the code

Initialize the module:

{% include copy-clipboard.html %}
~~~ shell
$ go mod init basic-sample
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ go run main.go
~~~

The output should be:

~~~
Initial balances:
1 1000
2 250
Success
~~~

To verify that the SQL statements were executed, run the following query from inside the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> USE bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
~~~

The output should be:

~~~
  id | balance
-----+----------
   1 |     900
   2 |     350
(2 rows)
~~~

## What's next?

Read more about using the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx?tab=doc).

{% include {{ page.version.version }}/app/see-also-links.md %}
