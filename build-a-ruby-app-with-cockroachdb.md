---
title: Build a Ruby App with CockroachDB
summary: Learn how to use CockroachDB from a simple Ruby application with a low-level client driver.
toc: false
---

This tutorial shows you how build a simple Ruby application with CockroachDB using a PostgreSQL-compatible driver. We've tested and can recommend the [Ruby pg driver](https://rubygems.org/gems/pg), so that driver is featured here.

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

{{site.data.alerts.callout_info}}With the default `SERIALIZABLE` isolation level, CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

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
