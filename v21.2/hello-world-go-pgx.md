---
title: Build a Hello World App with CockroachDB and the Go pgx Driver
summary: Learn how to use CockroachDB from a Hello World Go application with the pgx driver.
toc: true
twitter: false
referral_id: docs_hello_world_go_pgx
---

This tutorial shows you how build a simple Hello World Go application with CockroachDB and the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx).

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-go-pgx/
~~~

The `main.go` file contains all of the code for the sample Hello World app:

{% include_cached copy-clipboard.html %}
~~~ go
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-go-pgx/main/main.go %}
~~~

The `main` method of this program does the following:

1. Attempts to connect to a running cluster, given a connection string.
2. Prints a message to the terminal about the connection status.

## Step 3. Run the code

Initialize and run the app:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go mod init basic-sample && go mod tidy
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run main.go
~~~

The program will prompt you for a connection string to the database:

~~~
Enter a connection string:
~~~

<section class="filter-content" markdown="1" data-scope="local">

Enter the `(sql/unix)` connection URL provided in the demo cluster's SQL shell welcome text.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Enter the connection string provided in the **Connection info** window of the CockroachCloud Console.

{{site.data.alerts.callout_info}}
You need to provide a SQL user password in order to securely connect to a CockroachCloud cluster. The connection string should have a placeholder for the password (`<ENTER-PASSWORD>`).
{{site.data.alerts.end}}

</section>

After entering the connection string, the program will execute.

The output should look like this:

~~~
Hey! You successfully connected to your CockroachDB cluster.
~~~


## See also

- [Build a Simple CRUD Go App with CockroachDB and the Go pgx Driver](build-a-go-app-with-cockroachdb.html)
- The [pgx](https://pkg.go.dev/github.com/jackc/pgx) docs
- [Transactions](transactions.html)

{% include {{page.version.version}}/app/see-also-links.md %}
