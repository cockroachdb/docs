---
title: Build a C# App with CockroachDB and the .NET Npgsql Driver
summary: Learn how to use CockroachDB from a simple C# (.NET) application with a low-level client driver.
toc: true
twitter: true
---

This tutorial shows you how build a simple C# application with CockroachDB and the .NET Npgsql driver.

We have tested the [.NET Npgsql driver](http://www.npgsql.org/) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Create a .NET project

{% include copy-clipboard.html %}
~~~ shell
$ dotnet new console -o cockroachdb-test-app
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cd cockroachdb-test-app
~~~

The `dotnet` command creates a new app of type `console`. The `-o` parameter creates a directory named `cockroachdb-test-app` where your app will be stored and populates it with the required files. The `cd cockroachdb-test-app` command puts you into the newly created app directory.

## Step 2. Install the Npgsql driver

Install the latest version of the [Npgsql driver](https://www.nuget.org/packages/Npgsql/) into the .NET project using the built-in nuget package manager:

{% include copy-clipboard.html %}
~~~ shell
$ dotnet add package Npgsql
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 3. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 4. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 5. Convert the key file for use by C# programs

The private key generated for user `maxroach` by CockroachDB is [PEM encoded](https://tools.ietf.org/html/rfc1421).  To read the key in a C# application, you will need to convert it into PKCS#12 format.

To convert the key to PKCS#12 format, run the following OpenSSL command on the `maxroach` user's key file in the directory where you stored your certificates:

{% include copy-clipboard.html %}
~~~ shell
$ openssl pkcs12 -inkey client.maxroach.key -password pass: -in client.maxroach.crt -export -out client.maxroach.pfx
~~~

As of December 2018, you need to provide a password for this to work on macOS. See <https://github.com/dotnet/corefx/issues/24225>.

## Step 6. Run the C# code

Now that you have created a database and set up encryption keys, in this section you will:

- [Create a table and insert some rows](#basic-example)
- [Execute a batch of statements as a transaction](#transaction-example-with-retry-logic)

### Basic example

Replace the contents of `cockroachdb-test-app/Program.cs` with the following code:

{% include copy-clipboard.html %}
~~~ csharp
{% include {{ page.version.version }}/app/basic-sample.cs %}
~~~

Then, run the code to connect as the `maxroach` user.  This time, execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted:

{% include copy-clipboard.html %}
~~~ shell
$ dotnet run
~~~

The output should be:

~~~
Initial balances:
	account 1: 1000
	account 2: 250
~~~

### Transaction example (with retry logic)

Open `cockroachdb-test-app/Program.cs` again and replace the contents with the code shown below.

{% include {{page.version.version}}/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ csharp
{% include {{ page.version.version }}/app/txn-sample.cs %}
~~~

Then, run the code to connect as the `maxroach` user.  This time, execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted:

{% include copy-clipboard.html %}
~~~ shell
$ dotnet run
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

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 3. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 4. Run the C# code

Now that you have created a database and set up encryption keys, in this section you will:

- [Create a table and insert some rows](#basic2)
- [Execute a batch of statements as a transaction](#transaction2)

<a name="basic2"></a>

### Basic example

Replace the contents of `cockroachdb-test-app/Program.cs` with the following code:

{% include copy-clipboard.html %}
~~~ csharp
{% include {{ page.version.version }}/app/insecure/basic-sample.cs %}
~~~

Then, run the code to connect as the `maxroach` user and execute some basic SQL statements: creating a table, inserting rows, and reading and printing the rows:

{% include copy-clipboard.html %}
~~~ shell
$ dotnet run
~~~

The output should be:

~~~
Initial balances:
	account 1: 1000
	account 2: 250
~~~

<a name="transaction2"></a>

### Transaction example (with retry logic)

Open `cockroachdb-test-app/Program.cs` again and replace the contents with the code shown below.

{% include {{page.version.version}}/client-transaction-retry.md %}

{% include copy-clipboard.html %}
~~~ csharp
{% include {{ page.version.version }}/app/insecure/txn-sample.cs %}
~~~

Then, run the code to connect as the `maxroach` user.  This time, execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted:

{% include copy-clipboard.html %}
~~~ shell
$ dotnet run
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
$ cockroach sql --insecure  --database=bank -e 'SELECT id, balance FROM accounts'
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
