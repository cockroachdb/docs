---
title: Build a Hello World App with CockroachDB and the GORM ORM.
summary: Learn how to use CockroachDB from a Hello World Go application with the GORM ORM.
toc: true
twitter: false
referral_id: docs_hello_world_go_gorm
filter_category: hello_world_go
filter_html: Use <strong>GORM</strong>
filter_sort: 2
doc_area: 
product_area: 
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple Hello World Go application with CockroachDB and the [GORM ORM](https://gorm.io/index.html).

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-go-gorm
~~~

The `main.go` file contains all of the code for the sample Hello World app:

{% include_cached copy-clipboard.html %}
~~~ go
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-go-gorm/main/main.go %}
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

Enter `postgresql://root@localhost:26257?sslmode=disable` (the `sql` connection URL provided in the `cockroach` welcome text).

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Enter the connection string provided in the **Connection info** window of the {{ site.data.products.db }} Console.

{{site.data.alerts.callout_info}}
You need to provide a SQL user password in order to securely connect to a {{ site.data.products.db }} cluster. The connection string should have a placeholder for the password (`<ENTER-PASSWORD>`).
{{site.data.alerts.end}}

</section>

After entering the connection string, the program will execute.

The output should look like this:

~~~
Hey! You successfully connected to your CockroachDB cluster.
~~~

## See also

- [Build a Simple CRUD Go App with CockroachDB and the GORM ORM](build-a-go-app-with-cockroachdb-gorm.html)
- The [GORM](https://gorm.io/index.html) docs
- [Transactions](transactions.html)

{% include {{page.version.version}}/app/see-also-links.md %}
