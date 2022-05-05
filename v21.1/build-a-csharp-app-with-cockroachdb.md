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

In your terminal, run the following commands:

{% include_cached copy-clipboard.html %}
~~~ shell
$ dotnet new console -o cockroachdb-test-app
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cd cockroachdb-test-app
~~~

The `dotnet` command creates a new app of type `console`. The `-o` parameter creates a directory named `cockroachdb-test-app` where your app will be stored and populates it with the required files. The `cd cockroachdb-test-app` command puts you into the newly created app directory.

## Step 3. Install the Npgsql driver

Install the latest version of the [Npgsql driver](https://www.nuget.org/packages/Npgsql/) into the .NET project using the built-in nuget package manager:

{% include_cached copy-clipboard.html %}
~~~ shell
$ dotnet add package Npgsql
~~~

## Step 4. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 5. Run the C# code

Now that you have set up your project and created a database, in this section you will:

- [Create a table and insert some rows](#basic-example)
- [Execute a batch of statements as a transaction](#transaction-example-with-retry-logic)

### Basic example

#### Get the code

Replace the contents of the `Program.cs` file that was automatically generated in your `cockroachdb-test-app` directory with the code below:

{{site.data.alerts.callout_info}}
The following examples use the SSL mode `require` because the .NET Npgsql driver validates certificates differently from other PostgreSQL drivers. For other drivers, we recommend using `verify-full` as a security best practice.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="local">

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/main/basic.cs %}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/cockroachcloud/basic.cs %}
~~~

</section>

#### Update the connection parameters

<section class="filter-content" markdown="1" data-scope="local">

In a text editor, modify `Program.cs` with the settings to connect to the demo cluster:

{% include_cached copy-clipboard.html %}
~~~ csharp
connStringBuilder.Host = "{localhost}";
connStringBuilder.Port = 26257;
connStringBuilder.SslMode = SslMode.Require;
connStringBuilder.Username = "{username}";
connStringBuilder.Password = "{password}";
connStringBuilder.Database = "bank";
connStringBuilder.TrustServerCertificate = true;
~~~

Where `{username}` and `{password}` are the database username and password you created earlier.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

1. In the {{ site.data.products.db }} Console, select the **Connection Parameters** tab of the **Connection Info** dialog.

1. In a text editor, modify the connection parameters in `Program.cs` with the settings to connect to your cluster:

{% include_cached copy-clipboard.html %}
~~~ csharp
connStringBuilder.Host = "{host-name}";
connStringBuilder.Port = 26257;
connStringBuilder.SslMode = SslMode.Require;
connStringBuilder.Username = "{username}";
connStringBuilder.Password = "{password}";
connStringBuilder.Database = "{cluster-name}.bank";
connStringBuilder.RootCertificate = "~/.postgresql/root.crt";
connStringBuilder.TrustServerCertificate = true;
~~~

Where:

- `{username}` and `{password}` specify the SQL username and password that you created earlier.
- `{host-name}` is the name of the {{ site.data.products.serverless-plan }} host (e.g., `free-tier.gcp-us-central1.cockroachlabs.cloud`).
- `{cluster_name}` is the name of your cluster.

</section>

#### Run the code

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

#### Get the code

Open `cockroachdb-test-app/Program.cs` again and replace the contents with the code shown below. Make sure to keep the connection parameters the same as in the [previous example](#update-the-connection-parameters).

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

#### Run the code

This time, running the code will execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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


## What's next?

Read more about using the [.NET Npgsql driver](http://www.npgsql.org/).

{% include {{ page.version.version }}/app/see-also-links.md %}
