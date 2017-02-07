---
title: Build a Python App with CockroachDB
summary: Learn how to use CockroachDB from a simple Python application with a low-level client driver.
toc: false
asciicast: true
---

This tutorial shows you how to use CockroachDB from a simple Python application. You can use any PostgreSQL-compatible drivers, but we've tested and can recommend the [Python psycop2 driver](http://initd.org/psycopg/docs/), so that driver is featured here.

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

Also, feel free to watch this process in action before going through the steps yourself. Note that the demo video features Python code for executing basic statements (step 4), but the code for executing more complex transactions is not covered (step 5). Also note that you can copy commands directly from the video, and you can use **<** and **>** to go back and forward.

<asciinema-player class="asciinema-demo" src="asciicasts/build-a-test-app.json" cols="107" speed="2" theme="monokai" poster="npt:0:40" title="Build a Test App"></asciinema-player>

## Step 1. Install the client driver

Install the Python psycop2 driver as described in the [official documentation](http://initd.org/psycopg/docs/install.html).

{% include app/common-steps.md %}

## Step 5. Run the Python code

### Basic Statements

The following code connects as the `maxroach` user and executes some basic SQL statements, creating a table, inserting rows, and reading and printing the rows. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/basic-sample.py" download>download it directly</a>.

~~~ python
{% include app/basic-sample.py %}
~~~

Then run the code:

~~~ shell
$ python basic-sample.py
~~~

The output should be:

~~~ shell
Initial balances:
['1', '1000']
['2', '250']
~~~

### Transaction (with retry logic)

The following code again connects as the `maxroach` user but this time executes a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted. 

Copy the code or 
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/txn-sample.py" download>download it directly</a>. 

{{site.data.alerts.callout_info}}Because the CockroachDB transaction model requires the client to initiate retries in the case of contention, CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code. For more details, see <a href="https://www.cockroachlabs.com/docs/transactions.html#transaction-retries">Transaction Retries</a>.{{site.data.alerts.end}}

~~~ python
{% include app/txn-sample.py %}
~~~

Then run the code:

~~~ shell
$ python txn-sample.py
~~~

The output should be:

~~~ shell
Balances after transfer:
['1', '900']
['2', '350']
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

## What's Next?

Read more about using the [Python psycop2 driver](http://initd.org/psycopg/docs/).

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Scalability](demo-scalability.html)
