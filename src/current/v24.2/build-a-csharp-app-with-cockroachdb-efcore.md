---
title: Build a C# App with CockroachDB and the .NET EFCore Driver
summary: Learn how to use CockroachDB from a simple C# (.NET) application with EFCore.
toc: true
twitter: true
referral_id: docs_csharp_efcore
docs_area: get_started
---

This tutorial shows you how build a simple C# application with CockroachDB and the [EFCore driver](https://learn.microsoft.com/en-us/ef/core/).

## Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Get the code

~~~ shell
git clone https://github.com/cockroachdb/efcore.pg.cockroach
~~~

~~~ shell
cd efcore.pg.cockroach/examples/
~~~

## Install the EFCore driver

Install the latest version of the [EFCore driver](https://www.nuget.org/packages/EFCore/) into the .NET project using the built-in nuget package manager:

{% include_cached copy-clipboard.html %}
~~~ shell
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
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

Edit the contents of the `Program.cs` file in the `efcore.pg.cockroach/examples` directory, which is shown below. Note that you will need to update the code with the username and password of the SQL user you created earlier.

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachdb/efcore.pg.cockroach/main/examples/Program.cs %}
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

Open `cockroachdb-efcore-test-app/Program.cs` again and replace the contents with the code shown below.

[XXX](): UPDATE THESE EXAMPLES

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

Read more about [Getting Started with EFCore](https://learn.microsoft.com/en-us/ef/core/get-started/overview/first-app?tabs=netcore-cli).

{% include {{ page.version.version }}/app/see-also-links.md %}
