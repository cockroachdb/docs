---
title: Build a Hello World App with CockroachDB and the node-postgres Driver
summary: Learn how to use CockroachDB from a Hello World Node.js application with the node-postgres driver.
toc: true
twitter: false
---

This tutorial shows you how build a simple Hello World Node.js application with CockroachDB and the [node-postgres driver](https://node-postgres.com/).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/app/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-node-postgres/
~~~

The `app.js` file contains all of the code for the sample Hello World app:

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-node-postgres/master/app.js %}
~~~

This program does the following:

1. Attempts to connect to a running cluster, given a connection string.
2. Prints a message to the terminal about the connection status.

## Step 3. Run the code

Initialize and run the app:

{% include_cached copy-clipboard.html %}
~~~ shell
$ npm install
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ node app.js
~~~

The program will prompt you for a connection string to the database:

~~~
prompt: connectionString:
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

- [Build a Simple CRUD Node.js App with CockroachDB and the node-postgres Driver](build-a-nodejs-app-with-cockroachdb.html)
- The [node-postgres](https://node-postgres.com/) docs
- [Transactions](transactions.html)

{% include {{page.version.version}}/app/see-also-links.md %}
