---
title: Build a Go App with CockroachDB
summary: Learn how to use CockroachDB from a simple Go application with either a low-level client driver or an ORM.
toc: false
asciicast: true
---

This tutorial shows you how to use CockroachDB from a simple Go application. You can use any PostgreSQL-compatible drivers or ORMs, but we've tested and can recommend the [Go pq driver](https://godoc.org/github.com/lib/pq) and the [GORM ORM](http://jinzhu.me/gorm/), so those are featured here.

<style>
.filters .filter-button {
  width: 20%;
  height: 65px;
  margin: 15px 15px 10px 0px;
}
.filters a:hover {
  border-bottom: none;
}
</style>

<div id="tool-filters" class="filters clearfix">
    <button class="filter-button current" data-tool="driver" >Use a <strong>Driver</strong></button>
    <button class="filter-button" data-tool="orm">Use an <strong>ORM</strong></button>
</div>

{{site.data.alerts.callout_success}}For tutorials in other languages, see the menu to the left.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

<div class="filter-content current" markdown="1" data-tool="driver">
## Step 1. Install the Client Driver

To install the [Go pq driver](https://godoc.org/github.com/lib/pq), run the following command:

~~~ shell
$ go get -u github.com/lib/pq
~~~
</div>

<div class="filter-content" markdown="1" data-tool="orm">
## Step 1. Install the ORM

To install [GORM](http://jinzhu.me/gorm/), run the following command:

~~~ shell
$ go get -u github.com/jinzhu/gorm
~~~
</div>

## Step 2. Start a cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

~~~ shell
# Start node 1:
$ cockroach start --background \
--store=hello-go-1
~~~

But as you might've seen in the [Start a Local Cluster](start-a-local-cluster.html) tutorial, it's incredibly easy to start and join addition nodes, if you want to simulate a real cluster:

~~~ shell
# Start node 2:
$ cockroach start --background \
--store=hello-go-2 \
--port=26258 \
--http-port=8081 \
--join=localhost:26257

# Start node 3:
$ cockroach start --background \
--store=hello-go-3 \
--port=26259 \
--http-port=8082 \
--join=localhost:26257
~~~

## Step 3. Create a user

As the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

~~~ shell
$ cockroach user set maxroach
~~~

## Step 4. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

~~~ shell
$ cockroach sql -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user

~~~ shell
$ cockroach sql -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~

<div class="filter-content current" markdown="1" data-tool="driver">
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

The balance printout should look like this:

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
</div>

<div class="filter-content" markdown="1" data-tool="orm">
## Step 5. Run the Go code

The following code use the [GORM](http://jinzhu.me/gorm/) ORM to map Go-specific objects to SQL operations. Specifically, `db.AutoMigrate(&Account{})` creates an `accounts` table based on the Account model, `db.Create()` inserts rows into the table, and `db.Find(&accounts)` selects from the table so that balances can be printed.

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/gorm-basic-sample.go" download>download it directly</a>.

~~~ go
{% include app/gorm-basic-sample.go %}
~~~

Then run the code:

~~~ shell
$ go run gorm-basic-sample.go
~~~

The balance printout should look like this:

~~~ shell
Initial balances:
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):  

~~~ shell
$ cockroach sql -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

~~~ shell
$ cockroach sql -e 'SELECT id, balance FROM accounts' --database=bank
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
</div>

## What's Next?

<div class="filter-content current" markdown="1" data-tool="driver">
Read more about using the [Go pq driver](https://godoc.org/github.com/lib/pq).
</div>

<div class="filter-content" markdown="1" data-tool="orm">
Read more about using the [GORM ORM](http://jinzhu.me/gorm/). 
</div>

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Scalability](demo-scalability.html)

<script>
$(document).ready(function() {
    // Generate toc of h2 and h3 headers currently visible on page.
    function renderTOC() {
        $('#toc').toc({ minimumHeaders: 0, listType: 'ul', showSpeed: 0, headers: 'h2:not(.filter-content:not(.current) h2),h3:not(.filter-content:not(.current) h3)' });
    }

    renderTOC();

    // Show and hide content blocks with buttons.
    var $filter_button = $('.filter-button');

    $filter_button.on('click', function(){
        var tool = $(this).data('tool'),
        $current_tab = $('.filter-button.current'), $current_content = $('.filter-content.current');

        // Remove current class from tab and content blocks.
        $current_tab.removeClass('current');
        $current_content.removeClass('current');

        // Add current class to clicked button and corresponding content blocks.
        $('.filter-button[data-tool="'+tool+'"]').addClass('current');
        $('.filter-content[data-tool="'+tool+'"]').addClass('current');

        renderTOC();
    });
});
</script>
