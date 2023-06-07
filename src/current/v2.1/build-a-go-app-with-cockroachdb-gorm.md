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
For a more realistic use of GORM with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the GORM ORM

To install [GORM](http://gorm.io), run the following commands:

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq # dependency
~~~

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jinzhu/gorm
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Go code

The following code uses the [GORM](http://gorm.io) ORM to map Go-specific objects to SQL operations. Specifically, `db.AutoMigrate(&Account{})` creates an `accounts` table based on the Account model, `db.Create(&Account{})` inserts rows into the table, and `db.Find(&accounts)` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/gorm-basic-sample.go" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/gorm-basic-sample.go %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ go run gorm-basic-sample.go
~~~

The output should be:

~~~
Initial balances:
1 1000
2 250
~~~

To verify that funds were transferred from one account to another, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |    1000 |
|  2 |     250 |
+----+---------+
(2 rows)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Go code

The following code uses the [GORM](http://gorm.io) ORM to map Go-specific objects to SQL operations. Specifically, `db.AutoMigrate(&Account{})` creates an `accounts` table based on the Account model, `db.Create(&Account{})` inserts rows into the table, and `db.Find(&accounts)` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/gorm-basic-sample.go" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ go
{% include {{ page.version.version }}/app/insecure/gorm-basic-sample.go %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ go run gorm-basic-sample.go
~~~

The output should be:

~~~
Initial balances:
1 1000
2 250
~~~

To verify that funds were transferred from one account to another, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |    1000 |
|  2 |     250 |
+----+---------+
(2 rows)
~~~

</section>

## What's next?

Read more about using the [GORM ORM](http://gorm.io), or check out a more realistic implementation of GORM with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
