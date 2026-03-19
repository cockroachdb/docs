---
title: Build a C# App with CockroachDB and the .NET Npgsql Driver
summary: Learn how to use CockroachDB from a simple C# (.NET) application with a low-level client driver.
toc: true
twitter: true
referral_id: docs_csharp
docs_area: get_started
---

This tutorial shows you how build a simple C# application with CockroachDB and the .NET Npgsql driver.

## Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Create a .NET project

In your terminal, run the following commands:

{% include_cached copy-clipboard.html %}
~~~ shell
dotnet new console -o cockroachdb-test-app
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
cd cockroachdb-test-app
~~~

The `dotnet` command creates a new app of type `console`. The `-o` parameter creates a directory named `cockroachdb-test-app` where your app will be stored and populates it with the required files. The `cd cockroachdb-test-app` command puts you into the newly created app directory.

## Install the Npgsql driver

Install the latest version of the [Npgsql driver](https://www.nuget.org/packages/Npgsql/) into the .NET project using the built-in nuget package manager:

{% include_cached copy-clipboard.html %}
~~~ shell
dotnet add package Npgsql
~~~

## Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Set the connection string

Choose your OS:

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="mac"><strong>macOS</strong></button>
    <button class="filter-button page-level" data-scope="linux"><strong>Linux</strong></button>
    <button class="filter-button page-level" data-scope="windows"><strong>Windows</strong></button>
</div>

{% include {{page.version.version}}/connect/connection-url.md %}

## Run the C# code

Now that you have set up your project and created a database, in this section you will:

- [Create a table and insert some rows](#basic-example)
- [Execute a batch of statements as a transaction](#transaction-example-with-retry-logic)

### Basic example

#### Get the code

Replace the contents of the `Program.cs` file that was automatically generated in your `cockroachdb-test-app` directory with the code below:

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/main/basic.cs %}
~~~

#### Run the basic example

Compile and run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
dotnet run
~~~

The output should be:

~~~
Initial balances:
 account 1: 1000
 account 2: 250
~~~

### Transaction example (with retry logic)

#### Modify the code

Open `cockroachdb-test-app/Program.cs` again and replace the contents with the code shown below.

<section class="filter-content" markdown="1" data-scope="local">

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/main/transaction.cs %}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/cockroachcloud/transaction.cs %}
~~~

</section>

#### Run the transactions example

This time, running the code will execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted:

{% include_cached copy-clipboard.html %}
~~~ shell
dotnet run
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

However, if you want to verify that funds were transferred from one account to another, use the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, balance FROM accounts;
~~~

~~~
  id | balance
+----+---------+
   1 |     900
   2 |     350
(2 rows)
~~~

## What's next?

Read more about using the [.NET Npgsql driver](http://www.npgsql.org/).

{% include {{ page.version.version }}/app/see-also-links.md %}
