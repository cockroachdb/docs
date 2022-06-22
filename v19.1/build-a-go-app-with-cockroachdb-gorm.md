---
title: Build a Go App with CockroachDB
summary: Learn how to use CockroachDB from a simple Go application with the GORM ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button current">Use <strong>GORM</strong></button></a>
</div>

This tutorial shows you how build a simple Go application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Go pq driver](https://godoc.org/github.com/lib/pq) and the [GORM ORM](http://gorm.io) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_success}}
For another use of GORM with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the GORM ORM

To install [GORM](http://gorm.io), run the following commands:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq # dependency
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jinzhu/gorm
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Go code

The following code uses the [GORM](http://gorm.io) ORM to map Go-specific objects to SQL operations. Specifically:

- `db.AutoMigrate(&Account{})` creates an `accounts` table based on the Account model.
- `db.Create(&Account{})` inserts rows into the table.
- `db.Find(&accounts)` selects from the table so that balances can be printed.
- The funds transfer occurs in `transferFunds()`. To ensure that we [handle retry errors](transactions.html#client-side-intervention), we write an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another error, it sleeps again for a longer interval, implementing [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff).

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/gorm-sample.go" download>download it directly</a>.

{{site.data.alerts.callout_success}}
To clone a version of the code below that connects to insecure clusters, run the command below. Note that you will need to edit the connection string to use the certificates that you generated when you set up your secure cluster.
`git clone https://github.com/cockroachlabs/hello-world-go-gorm`
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/gorm-sample.go %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run gorm-sample.go
~~~

The output should show the account balances before and after the funds transfer:

~~~ shell
Balance at '2019-08-06 13:37:19.311423 -0400 EDT m=+0.034072606':
1 1000
2 250
Balance at '2019-08-06 13:37:19.325654 -0400 EDT m=+0.048303286':
1 900
2 350
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Go code

The following code uses the [GORM](http://gorm.io) ORM to map Go-specific objects to SQL operations. Specifically:

- `db.AutoMigrate(&Account{})` creates an `accounts` table based on the Account model.
- `db.Create(&Account{})` inserts rows into the table.
- `db.Find(&accounts)` selects from the table so that balances can be printed.
- The funds transfer occurs in `transferFunds()`. To ensure that we [handle retry errors](transactions.html#client-side-intervention), we write an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another error, it sleeps again for a longer interval, implementing [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff).

To get the code below, clone the `hello-world-go-gorm` repo to your machine:

{% include_cached copy-clipboard.html %}
~~~ shell
git clone https://github.com/cockroachlabs/hello-world-go-gorm
~~~

{% include_cached copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/insecure/gorm-sample.go %}
~~~

Change to the directory where you cloned the repo and run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run main.go
~~~

The output should show the account balances before and after the funds transfer:

~~~ shell
Balance at '2019-07-15 13:34:22.536363 -0400 EDT m=+0.019918599':
1 1000
2 250
Balance at '2019-07-15 13:34:22.540037 -0400 EDT m=+0.023592845':
1 900
2 350
~~~

</section>

## What's next?

Read more about using the [GORM ORM](http://gorm.io), or check out a more realistic implementation of GORM with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
