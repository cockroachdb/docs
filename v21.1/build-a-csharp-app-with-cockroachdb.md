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

Now that you have set up your project and created a database, you will run a basic application that creates a table and inserts some rows.

### Get the code

Replace the contents of the `Program.cs` file that was automatically generated in your `cockroachdb-test-app` directory with the code below:

{% include_cached copy-clipboard.html %}
~~~ c#
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-csharp/main/basic.cs %}
~~~

### Update the connection parameters

<section class="filter-content" markdown="1" data-scope="local">

In a text editor, modify `Program.cs` with the settings to connect to the demo cluster:

{% include_cached copy-clipboard.html %}
~~~ csharp
connStringBuilder.Host = "{host-name}";
connStringBuilder.Port = 26257;
connStringBuilder.SslMode = SslMode.Require;
connStringBuilder.Username = "{username}";
connStringBuilder.Password = "{password}";
connStringBuilder.Database = "{cluster-name}.bank";
connStringBuilder.TrustServerCertificate = true;
~~~

Where:

- `{host-name}` is `localhost`.
- `{username}` and `{password}` are database username and password you created earlier.
- `{cluster-name}.bank` is replaced with `bank`.
- The line `connStringBuilder.RootCertificate = "<certs-dir>/cc-ca.crt";` is deleted.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

1. In the CockroachCloud Console, select the **Connection Parameters** tab of the **Connection Info** dialog.

1. In a text editor, modify the connection parameters in `Program.cs` with the settings to connect to your cluster:

{% include_cached copy-clipboard.html %}
~~~ csharp
connStringBuilder.Host = "{host-name}";
connStringBuilder.Port = 26257;
connStringBuilder.SslMode = SslMode.Require;
connStringBuilder.Username = "{username}";
connStringBuilder.Password = "{password}";
connStringBuilder.Database = "{cluster-name}.bank";
connStringBuilder.RootCertificate = "{certs-dir}/cc-ca.crt";
connStringBuilder.TrustServerCertificate = true;
~~~

Where:

- `{username}` and `{password}` specify the SQL username and password that you created earlier.
- `{host-name}` is the name of the CockroachCloud free tier host (e.g., `free-tier.gcp-us-central1.cockroachlabs.cloud`).
- `{certs-dir}` is the path to the `cc-ca.crt` file that you downloaded from the CockroachCloud Console.
- `{cluster_name}` is the name of your cluster.

</section>

### Run the code

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

## What's next?

Read more about using the [.NET Npgsql driver](http://www.npgsql.org/).

{% include {{ page.version.version }}/app/see-also-links.md %}
