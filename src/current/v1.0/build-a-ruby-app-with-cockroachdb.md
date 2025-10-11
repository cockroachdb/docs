---
title: Build a Ruby App with CockroachDB
summary: Learn how to use CockroachDB from a simple Ruby application with the pg client driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button current">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Ruby pg driver](https://rubygems.org/gems/pg) and the [ActiveRecord ORM](http://guides.rubyonrails.org/active_record_basics.html), so those are featured here.


## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Ruby pg driver

To install the [Ruby pg driver](https://rubygems.org/gems/pg), run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ gem install pg
~~~

{% include {{ page.version.version }}/app/common-steps.md %}

## Step 5. Run the Ruby code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.rb" download><code>basic-sample.rb</code></a> file, or create the file yourself and copy the code into it.

{% include_cached copy-clipboard.html %}
~~~ ruby
{% include {{ page.version.version }}/app/basic-sample.rb %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ruby basic-sample.rb
~~~

The output should be:

~~~
Initial balances:
{"id"=>"1", "balance"=>"1000"}
{"id"=>"2", "balance"=>"250"}
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.rb" download><code>txn-sample.rb</code></a> file, or create the file yourself and copy the code into it.

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ ruby
{% include {{ page.version.version }}/app/txn-sample.rb %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ruby txn-sample.rb
~~~

To verify that funds were transferred from one account to another, use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
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

Read more about using the [Ruby pg driver](https://rubygems.org/gems/pg).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
