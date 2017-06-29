---
title: Build a Go App with CockroachDB
summary: Learn how to use CockroachDB from a simple Go application with the GORM ORM.
toc: false
twitter: true
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button current">Use <strong>GORM</strong></button></a>
</div>

This tutorial shows you how build a simple Go application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Go pq driver](https://godoc.org/github.com/lib/pq) and the [GORM ORM](http://jinzhu.me/gorm/), so those are featured here.

{{site.data.alerts.callout_success}}For a more realistic use of GORM with CockroachDB, see our <a href="https://github.com/cockroachdb/examples-orms"><code>examples-orms</code></a> repository.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the GORM ORM

To install [GORM](http://jinzhu.me/gorm/), run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jinzhu/gorm
~~~

{% include app/common-steps.md %}

## Step 5. Run the Go code

The following code uses the [GORM](http://jinzhu.me/gorm/) ORM to map Go-specific objects to SQL operations. Specifically, `db.AutoMigrate(&Account{})` creates an `accounts` table based on the Account model, `db.Create(&Account{})` inserts rows into the table, and `db.Find(&accounts)` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/gorm-basic-sample.go" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ go
{% include app/gorm-basic-sample.go %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ go run gorm-basic-sample.go
~~~

The output should be:

~~~ shell
Initial balances:
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

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

## What's Next?

Read more about using the [GORM ORM](http://jinzhu.me/gorm/), or check out a more realistic implementation of GORM with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
