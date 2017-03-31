---
title: Build a Ruby App with CockroachDB
summary: Learn how to use CockroachDB from a simple Ruby application with the pg client driver.
toc: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button current">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Ruby pg driver](https://rubygems.org/gems/pg) and the [ActiveRecord ORM](http://guides.rubyonrails.org/active_record_basics.html), so those are featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Ruby pg driver

To install the [Ruby pg driver](https://rubygems.org/gems/pg), run the following command:

~~~ shell
$ gem install pg
~~~

{% include app/common-steps.md %}

## Step 5. Run the Ruby code

### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.rb" download>download it directly</a>.

~~~ ruby
{% include app/basic-sample.rb %}
~~~

Then run the code:

~~~ shell
$ ruby basic-sample.rb
~~~

The output should be:

~~~ shell
Initial balances:
{"id"=>"1", "balance"=>"1000"}
{"id"=>"2", "balance"=>"250"}
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.rb" download>download it directly</a>.

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ ruby
{% include app/txn-sample.rb %}
~~~

Then run the code:

~~~ shell
$ ruby txn-sample.rb
~~~

To verify that funds were, in fact, transferred from one account to another, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

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

Read more about using the [Ruby pg driver](https://rubygems.org/gems/pg).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Scalability](demo-scalability.html)
