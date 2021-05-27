---
title: Build a C# App with CockroachDB and the .NET Npgsql Driver
summary: Learn how to use CockroachDB from a simple C# (.NET) application with a low-level client driver.
toc: true
twitter: true
---

This tutorial shows you how build a simple C# application with CockroachDB and the .NET Npgsql driver.

We have tested the [.NET Npgsql driver](http://www.npgsql.org/) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a .NET project

{% include copy-clipboard.html %}
~~~ shell
$ dotnet new console -o cockroachdb-test-app
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cd cockroachdb-test-app
~~~

The `dotnet` command creates a new app of type `console`. The `-o` parameter creates a directory named `cockroachdb-test-app` where your app will be stored and populates it with the required files. The `cd cockroachdb-test-app` command puts you into the newly created app directory.

## Step 3. Install the Npgsql driver

Install the latest version of the [Npgsql driver](https://www.nuget.org/packages/Npgsql/) into the .NET project using the built-in nuget package manager:

{% include copy-clipboard.html %}
~~~ shell
$ dotnet add package Npgsql
~~~

## Step 4. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 5. Run the C# code

Now that you have created a database and set up encryption keys, in this section you will:

- [Create a table and insert some rows](#basic-example)
- [Execute a batch of statements as a transaction](#transaction-example-with-retry-logic)

### Get the code

Clone the `hello-world-sharp` repo to your machine:

{% include_cached copy-clipboard.html %}
~~~ shell
git clone https://github.com/cockroachlabs/hello-world-csharp
~~~

### Update the connection parameters

<section class="filter-content" markdown="1" data-scope="local">

In a text editor modify `main/basic.cs` and `main/transaction.cs` with the settings to connect to the demo cluster:

Modify the options in the `NpgsqlConnectionStringBuilder` instance:

{% include_cached copy-clipboard.html %}
~~~ csharp
connStringBuilder.Host = "<host-name>";
connStringBuilder.Port = 26257;
connStringBuilder.SslMode = SslMode.Require;
connStringBuilder.Username = "<username>";
connStringBuilder.Password = "<password>";
connStringBuilder.Database = "<cluster-name>.bank";
connStringBuilder.TrustServerCertificate = true;
~~~

Where `<host-name>` is `localhost`, `<username>` is the database username you created, `<password>` is the database user's password, and `<cluster-name>.bank` is replaced with `bank`.
</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

In a text editor modify `main/basic.cs` and `main/transaction.cs` with the settings to connect to the cluster:

Modify the options in the `NpgsqlConnectionStringBuilder` instance:

{% include_cached copy-clipboard.html %}
~~~ csharp
connStringBuilder.Host = "<host-name>";
connStringBuilder.Port = 26257;
connStringBuilder.SslMode = SslMode.Require;
connStringBuilder.Username = "<username>";
connStringBuilder.Password = "<password>";
connStringBuilder.Database = "<cluster-name>.bank";
connStringBuilder.RootCertificate = "<certs-dir>/cc-ca.crt";
connStringBuilder.TrustServerCertificate = true;
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

</section>

### Run the code

Compile and run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
dotnet run
~~~

### Basic example

The contents of `basic.cs`:

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/main/basic.cs %}
~~~

The output should be:

~~~
Initial balances:
	account 1: 1000
	account 2: 250
~~~

### Transaction example (with retry logic)

The contents of `transaction.cs`:

{% include {{page.version.version}}/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/main/transaction.cs %}
~~~

The output should be:

~~~
Initial balances:
	account 1: 1000
	account 2: 250
Final balances:
	account 1: 900
	account 2: 350
~~~

However, if you want to verify that funds were transferred from one account to another, use the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank -e 'SELECT id, balance FROM accounts'
~~~

~~~
  id | balance
+----+---------+
   1 |     900
   2 |     350
(2 rows)
~~~

</section>

## What's next?

Read more about using the [.NET Npgsql driver](http://www.npgsql.org/).

{% include {{ page.version.version }}/app/see-also-links.md %}
