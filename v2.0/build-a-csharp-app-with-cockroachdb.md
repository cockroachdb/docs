---
title: Build a C# (.NET) App with CockroachDB
summary: Learn how to use CockroachDB from a simple C# (.NET) application with a low-level client driver.
toc: true
twitter: true
---

This tutorial shows you how build a simple C# (.NET) application with CockroachDB using a PostgreSQL-compatible driver.

We have tested the [.NET Npgsql driver](http://www.npgsql.org/) enough to claim **beta-level** support, so that driver is featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.


## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html) and the <a href="https://www.microsoft.com/net/download/" data-proofer-ignore>.NET SDK</a> for your OS.

## Step 1. Create a .NET project

{% include_cached copy-clipboard.html %}
~~~ shell
$ dotnet new console -o cockroachdb-test-app
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd cockroachdb-test-app
~~~

The `dotnet` command creates a new app of type `console`. The `-o` parameter creates a directory named `cockroachdb-test-app` where your app will be stored and populates it with the required files. The `cd cockroachdb-test-app` command puts you into the newly created app directory.

## Step 2. Install the Npgsql driver

Install the latest version of the [Npgsql driver](https://www.nuget.org/packages/Npgsql/) into the .NET project using the built-in nuget package manager:

{% include_cached copy-clipboard.html %}
~~~ shell
$ dotnet add package Npgsql
~~~

## Step 3. Start a single-node cluster

For the purpose of this tutorial, you need only one CockroachDB node running in insecure mode:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=hello-1 \
--host=localhost
~~~

## Step 4. Create a user

In a new terminal, as the `root` user, use the [`cockroach user`](create-and-manage-users.html) command to create a new user, `maxroach`.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach user set maxroach --insecure
~~~

## Step 5. Create a database and grant privileges

As the `root` user, use the [built-in SQL client](use-the-built-in-sql-client.html) to create a `bank` database.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'CREATE DATABASE bank'
~~~

Then [grant privileges](grant.html) to the `maxroach` user.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'GRANT ALL ON DATABASE bank TO maxroach'
~~~

## Step 6. Run the C# code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Basic Statements

Replace the contents of `cockraochdb-test-app/Program.cs` with the following code:

{% include_cached copy-clipboard.html %}
~~~ csharp
{% include {{ page.version.version }}/app/basic-sample.cs %}
~~~

Then run the code to connect as the `maxroach` user and execute some basic SQL statements, creating a table, inserting rows, and reading and printing the rows:

{% include_cached copy-clipboard.html %}
~~~ shell
$ dotnet run
~~~

The output should be:

~~~
Initial balances:
	account 1: 1000
	account 2: 250
~~~

### Transaction (with retry logic)

Open `cockraochdb-test-app/Program.cs` again and replace the contents with the following code:

{% include_cached copy-clipboard.html %}
~~~ csharp
{% include {{ page.version.version }}/app/txn-sample.cs %}
~~~

Then run the code to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted:

{% include_cached copy-clipboard.html %}
~~~ shell
$ dotnet run
~~~

{{site.data.alerts.callout_info}}With the default <code>SERIALIZABLE</code> isolation level, CockroachDB may require the <a href="transactions.html#transaction-retries">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

The output should be:

~~~
Initial balances:
	account 1: 1000
	account 2: 250
Final balances:
	account 1: 900
	account 2: 350
~~~

However, if you want to verify that funds were transferred from one account to another, use the [built-in SQL client](use-the-built-in-sql-client.html):

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

Read more about using the [.NET Npgsql driver](http://www.npgsql.org/).

{% include {{ page.version.version }}/app/see-also-links.md %}
