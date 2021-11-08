---
title: Build a Go App with CockroachDB and upper/db
summary: Learn how to use CockroachDB from a simple Go application with the upper/db data access layer.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button">Use <strong>pgx</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-pq.html"><button class="filter-button">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button">Use <strong>GORM</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-upperdb.html"><button class="filter-button current">Use <strong>upper/db</strong></button></a>
</div>

This tutorial shows you how build a simple Go application with CockroachDB and the [upper/db](https://upper.io/) data access layer.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

<section class="filter-content" markdown="1" data-scope="secure">

## Step 1. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 2. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

The code samples will run with `maxroach` as the user.

## Step 3. Run the Go code

The sample code shown below uses upper/db to map Go-specific objects to SQL operations. Specifically, the code:

- Creates the `accounts` table, if it does not already exist.
- Deletes any existing rows in the `accounts` table.
- Inserts two rows into the `accounts` table.
- Prints the rows in the `accounts` table to the terminal.
- Deletes the first row in the `accounts` table.
- Updates the rows in the `accounts` table within an explicit [transaction](transactions.html).
- Prints the rows in the `accounts` table to the terminal once more.

{% include copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/upperdb-basic-sample/main.go %}
~~~

Note that the sample code also includes a function that simulates a transaction error (`crdbForceRetry()`). Upper/db's CockroachDB adapter [automatically retries transactions](transactions.html#client-side-intervention) when transaction errors are thrown. As a result, this function forces a transaction retry.

To run the code, copy the sample above, or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/upperdb-basic-sample/main.go" download>download it directly</a>.

{{site.data.alerts.callout_success}}
To clone a version of the code below that connects to insecure clusters, run the following command:

`git clone https://github.com/cockroachlabs/hello-world-go-upperdb/`

Note that you will need to edit the connection string to use the certificates that you generated when you set up your secure cluster.
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 1. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 2. Run the Go code

The sample code shown below uses upper/db to map Go-specific objects to SQL operations. Specifically, the code:

- Creates the `accounts` table, if it does not already exist.
- Deletes any existing rows in the `accounts` table.
- Inserts two rows into the `accounts` table.
- Prints the rows in the `accounts` table to the terminal.
- Deletes the first row in the `accounts` table.
- Updates the rows in the `accounts` table within an explicit [transaction](transactions.html).
- Prints the rows in the `accounts` table to the terminal once more.

{% include copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/insecure/upperdb-basic-sample/main.go %}
~~~

Note that the sample code also includes a function that simulates a transaction error (`crdbForceRetry()`). Upper/db's CockroachDB adapter [automatically retries transactions](transactions.html#client-side-intervention) when transaction errors are thrown. As a result, this function forces a transaction retry.

Copy the code or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/upperdb-basic-sample/main.go" download>download it directly</a>.

{{site.data.alerts.callout_success}}
To clone a version of the code below that connects to insecure clusters, run the following command:

`git clone https://github.com/cockroachlabs/hello-world-go-upperdb/`
{{site.data.alerts.end}}

</section>

Change to the directory where you cloned the repo and get the dependencies with `go mod init`:

{% include copy-clipboard.html %}
~~~ shell
$ go mod init hello-world-go-upperdb
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ go run main.go
~~~

The output should look similar to the following:

~~~
go: finding module for package github.com/upper/db/v4
go: finding module for package github.com/upper/db/v4/adapter/cockroachdb
go: found github.com/upper/db/v4 in github.com/upper/db/v4 v4.0.0
2020/09/16 10:31:55 Balances:
	accounts[590467288222990337]: 1000
	accounts[590467288229576705]: 250
2020/09/16 10:31:55 Balances:
	accounts[590467288222990337]: 500
	accounts[590467288229576705]: 999
2020/09/16 10:31:55 upper/db: log_level=WARNING file=go/pkg/mod/github.com/upper/db/v4@v4.0.0/internal/sqladapter/session.go:642
	Session ID:     00006
	Transaction ID: 00005
	Query:          SELECT crdb_internal.force_retry('1ms'::INTERVAL)
	Error:          pq: restart transaction: crdb_internal.force_retry(): TransactionRetryWithProtoRefreshError: forced by crdb_internal.force_retry()
	Time taken:     0.00171s
	Context:        context.Background

2020/09/16 10:31:55 upper/db: log_level=WARNING file=go/pkg/mod/github.com/upper/db/v4@v4.0.0/internal/sqladapter/session.go:642
	Session ID:     00006
	Transaction ID: 00005
	Query:          INSERT INTO "accounts" ("balance") VALUES ($1) RETURNING "id"
	Arguments:      []interface {}{887}
	Error:          pq: current transaction is aborted, commands ignored until end of transaction block
	Time taken:     0.00065s
	Context:        context.Background

2020/09/16 10:31:56 Balances:
	accounts[590467288229576705]: 999
	accounts[590467288342757377]: 887
	accounts[590467288350064641]: 342
~~~

Note that the forced transaction errors result in errors printed to the terminal, but the transactions are retried until they succeed.

## What's next?

Read more about upper/db:

- [Introduction to upper/db](https://upper.io/v4/getting-started/)
- [The upper/db tour](https://tour.upper.io/)
- [upper/db reference docs](https://pkg.go.dev/github.com/upper/db/v4)

{% include {{ page.version.version }}/app/see-also-links.md %}
