---
title: Build a Rust App with CockroachDB
summary: Learn how to use CockroachDB from a simple Rust application with a low-level client driver.
toc: false
twitter: true
---

This tutorial shows you how build a simple Rust application with CockroachDB using a PostgreSQL-compatible driver. We've tested and can recommend the <a href="https://crates.io/crates/postgres/" data-proofer-ignore>Rust postgres driver</a>, so that driver is featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Rust postgres driver

Install the Rust posgres driver as described in the <a href="https://crates.io/crates/postgres/" data-proofer-ignore>official documentation</a>.

{% include app/common-steps.md %}

## Step 5. Create a table in the new database

As the `maxroach` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create an `accounts` table in the new database.

~~~ shell
$ cockroach sql --database=bank --user=maxroach -e \
'CREATE TABLE accounts (id INT PRIMARY KEY, balance INT)'
~~~

~~~
CREATE TABLE
~~~

## Step 6. Run the Rust code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic Statements

First, use the following code to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows.

You can copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.rs" download>download it directly</a>.

~~~ rust
{% include app/basic-sample.rs %}
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

You can copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.rs" download>download it directly</a>.

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ rust
{% include app/txn-sample.rs %}
~~~

After running the code, use the [built-in SQL client](use-the-built-in-sql-client.html) to verify that funds were transferred from one account to another:

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

Read more about using the <a href="https://crates.io/crates/postgres/" data-proofer-ignore>Rust postgres driver</a>.

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
