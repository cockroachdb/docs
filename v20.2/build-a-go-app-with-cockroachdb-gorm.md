---
title: Build a Go App with CockroachDB and GORM
summary: Learn how to use CockroachDB from a simple Go application with the GORM ORM.
toc: true
twitter: false
referral_id: docs_hello_world_go_gorm
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button">Use <strong>pgx</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-pq.html"><button class="filter-button">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button current">Use <strong>GORM</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-upperdb.html"><button class="filter-button">Use <strong>upper/db</strong></button></a>
</div>

This tutorial shows you how build a simple Go application with CockroachDB and the [GORM ORM](https://gorm.io/index.html).

{{site.data.alerts.callout_success}}
For another use of GORM with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Run the Go code

The following code uses the [GORM](http://gorm.io) ORM (v1) to map Go-specific objects to SQL operations, and the [`crdbgorm`](https://godoc.org/github.com/cockroachdb/cockroach-go/crdb/crdbgorm) package to handle [transactions](transactions.html). Specifically:

- `db.AutoMigrate(&Account{})` creates an `accounts` table based on the Account model.
- `db.Create(&Account{})` inserts rows into the table.
- `db.Find(&accounts)` selects from the table so that balances can be printed.
- The funds transfer occurs in `transferFunds()`. To ensure that we [handle retry errors](transactions.html#client-side-intervention), we wrap the function call in [`crdbgorm.ExecuteTx()`](https://github.com/cockroachdb/cockroach-go/blob/master/crdb/crdbgorm/gorm.go#L29).

### Get the code

You can copy the code below, <a href="https://raw.githubusercontent.com/cockroachlabs/hello-world-go-gorm/master/main.go">download the code directly</a>, or clone [the code's GitHub repository](https://github.com/cockroachlabs/hello-world-go-gorm).

Here are the contents of `main.go`:

{% include_cached copy-clipboard.html %}
~~~ go
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-go-gorm/master/main.go %}
~~~

### Update the connection parameters

<section class="filter-content" markdown="1" data-scope="local">

Edit the `addr` constant so that:

- `{username}` and `{password}` specify the SQL username and password that you created earlier.
- `{hostname}` and `{port}` specify the hostname and port in the `(sql/tcp)` connection string from SQL shell welcome text.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Replace the string given for the `addr` constant definition with the connection string that you copied [earlier](#set-up-your-cluster-connection) from the **Connection info** dialog.

The constant definition should look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ go
const addr = "postgresql://{user}:{password}@{globalhost}:26257/bank?sslmode=verify-full&sslrootcert={path to the CA certificate}&options=--cluster={cluster_name}"
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

</section>

### Run the code

Initialize the module:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go mod init basic-sample
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run main.go
~~~

The output should be:

~~~
Balance at '2020-12-01 17:31:01.499548 -0500 EST m=+0.092649542':
1 1000
2 250
Balance at '2020-12-01 17:31:01.570412 -0500 EST m=+0.163512523':
1 900
2 350
~~~

## What's next?

Read more about using the [GORM ORM](http://gorm.io), or check out a more realistic implementation of GORM with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
