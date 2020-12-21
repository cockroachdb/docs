---
title: Build a Ruby App with CockroachDB and the Ruby pg Driver
summary: Learn how to use CockroachDB from a simple Ruby application with the pg client driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-ruby-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button current">Use <strong>pg</strong></button></a>
    <a href="build-a-ruby-app-with-cockroachdb-activerecord.html"><button style="width: 28%" class="filter-button">Use <strong>ActiveRecord</strong></button></a>
</div>

This tutorial shows you how build a simple Ruby application with CockroachDB and the Ruby pg driver.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the Ruby pg driver

To install the [Ruby pg driver](https://rubygems.org/gems/pg), run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ gem install pg
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

## Step 4. Run the Ruby code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

The following code connects as the `maxroach` user and executes some basic SQL statements: creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/basic-sample.rb" download><code>basic-sample.rb</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ ruby
{% include {{page.version.version}}/app/basic-sample.rb %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ ruby basic-sample.rb
~~~

The output should be:

~~~
Initial balances:
id: 1 balance: 1000
id: 2 balance: 250
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/txn-sample.rb" download><code>txn-sample.rb</code></a> file, or create the file yourself and copy the code into it.

{% include {{ page.version.version }}/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ ruby
{% include {{page.version.version}}/app/txn-sample.rb %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ ruby txn-sample.rb
~~~

To verify that funds were transferred from one account to another, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank
~~~

To check the account balances, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
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

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Ruby code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic statements

The following code connects as the `maxroach` user and executes some basic SQL statements: creating a table, inserting rows, and reading and printing the rows.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/basic-sample.rb" download><code>basic-sample.rb</code></a> file, or create the file yourself and copy the code into it.

{% include copy-clipboard.html %}
~~~ ruby
{% include {{page.version.version}}/app/insecure/basic-sample.rb %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ ruby basic-sample.rb
~~~

The output should be:

~~~
Initial balances:
id: 1 balance: 1000
id: 2 balance: 250
~~~

### Transaction (with retry logic)

Next, use the following code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

Download the <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/txn-sample.rb" download><code>txn-sample.rb</code></a> file, or create the file yourself and copy the code into it.

{% include {{ page.version.version }}/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ ruby
{% include {{page.version.version}}/app/insecure/txn-sample.rb %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ ruby txn-sample.rb
~~~

To verify that funds were transferred from one account to another, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

To check the account balances, issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
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

</section>

## What's next?

Read more about using the [Ruby pg driver](https://rubygems.org/gems/pg).

{% include {{page.version.version}}/app/see-also-links.md %}
