---
title: Build a Simple CRUD Go App with CockroachDB and the Go pgx Driver
summary: Learn how to use CockroachDB from a simple Go application with the Go pgx driver.
toc: true
twitter: false
referral_id: docs_hello_world_go_pgx
---

<div class="filters filters-big clearfix">
    <a href="build-a-go-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>pgx</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-pq.html"><button class="filter-button">Use <strong>pq</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-gorm.html"><button class="filter-button">Use <strong>GORM</strong></button></a>
    <a href="build-a-go-app-with-cockroachdb-upperdb.html"><button class="filter-button">Use <strong>upper/db</strong></button></a>
</div>

This tutorial shows you how build a simple CRUD Go application with CockroachDB and the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx).

## Step 1. Start CockroachDB

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use CockroachCloud</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

### Set up your cluster connection

1. Navigate to the cluster's **SQL Users** page, and create a new user, with a new password.

1. Navigate to the **Cluster Overview page**, select **Connect**, and, under the **Connection String** tab, download the cluster certificate.

1. Take note of the connection string provided. You'll use it to connect to the database later in this tutorial.

</section>

<section class="filter-content" markdown="1" data-scope="local">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach demo`](cockroach-demo.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --empty
    ~~~

    This starts a temporary, in-memory cluster and opens an interactive SQL shell to the cluster. Any changes to the database will not persist after the cluster is stopped.
1. Take note of the `(sql)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (console) http://127.0.0.1:49584
    #   (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo180485299&port=26257
    #   (sql/tcp) postgres://root:admin@127.0.0.1:49586?sslmode=require
    ~~~

    You'll use this connection string to connect to the database later in this tutorial.

</section>

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-go-pgx/
~~~

The project has the following directory structure:

~~~
├── README.md
├── dbinit.sql
└── main.go
~~~

The `dbinit.sql` file initializes the database schema that the application uses:

{% include_cached copy-clipboard.html %}
~~~ go
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-go-pgx/master/dbinit.sql %}
~~~

The `main.go` file contains the code for `INSERT`, `SELECT`, `UPDATE`, and `DELETE` SQL operations. The file also executes the `main` method of the program.

{% include_cached copy-clipboard.html %}
~~~ go
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-go-pgx/master/main.go %}
~~~

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in the case of read/write contention. The [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go) includes a generic **retry function** (`ExecuteTx()`) that runs inside a transaction and retries it as needed. The code sample shows how you can use this function to wrap SQL statements.
{{site.data.alerts.end}}

## Step 3. Run the code

Initialize the module:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go mod init basic-sample && go mod tidy
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ go run main.go
~~~

The program will prompt you for a connection string to the database:

~~~
Enter a connection string:
~~~

<section class="filter-content" markdown="1" data-scope="local">

Enter the `(sql)` connection URL provided in the demo cluster's SQL shell welcome text.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Enter the connection string provided in the **Connection info** window of the CockroachCloud Console.

{{site.data.alerts.callout_info}}
You need to provide a SQL user password in order to securely connect to a CockroachCloud cluster. The connection string should have a placeholder for the password (`<ENTER-PASSWORD>`).
{{site.data.alerts.end}}

</section>

The output should look similar to the following:

~~~
2021/07/20 14:48:01 Initializing bank database...
2021/07/20 14:48:02 bank database initialized.
2021/07/20 14:48:02 Creating new rows...
2021/07/20 14:48:02 New rows created.
2021/07/20 14:48:02 Initial balances:
2021/07/20 14:48:02 3a936990-a0c9-45bf-bc24-92e10d91dca9: 300
2021/07/20 14:48:02 8d1849dd-9222-4b12-a4ff-94e583b544a8: 250
2021/07/20 14:48:02 c6ae8917-d24e-4115-b719-f663dbfb9ffb: 500
2021/07/20 14:48:02 d0ce1f5c-e468-4899-8590-2bb6076247f2: 100
2021/07/20 14:48:02 Transferring funds from account with ID c6ae8917-d24e-4115-b719-f663dbfb9ffb to account with ID d0ce1f5c-e468-4899-8590-2bb6076247f2...
2021/07/20 14:48:02 Transfer successful.
2021/07/20 14:48:02 Balances after transfer:
2021/07/20 14:48:02 3a936990-a0c9-45bf-bc24-92e10d91dca9: 300
2021/07/20 14:48:02 8d1849dd-9222-4b12-a4ff-94e583b544a8: 250
2021/07/20 14:48:02 c6ae8917-d24e-4115-b719-f663dbfb9ffb: 400
2021/07/20 14:48:02 d0ce1f5c-e468-4899-8590-2bb6076247f2: 200
2021/07/20 14:48:02 Deleting rows with IDs 8d1849dd-9222-4b12-a4ff-94e583b544a8 and d0ce1f5c-e468-4899-8590-2bb6076247f2...
2021/07/20 14:48:02 Rows deleted.
2021/07/20 14:48:02 Balances after deletion:
2021/07/20 14:48:02 3a936990-a0c9-45bf-bc24-92e10d91dca9: 300
2021/07/20 14:48:02 c6ae8917-d24e-4115-b719-f663dbfb9ffb: 400
~~~

As shown in the output, the code does the following:

- Initializes the `bank` database with the `accounts` table, using the `dbinit.sql` file.
- Inserts some rows into the `accounts` table.
- Reads values from the table.
- Updates values in the table.
- Deletes values from the table.

To verify that the SQL statements were executed, run the following query from inside the SQL shell:

{% include_cached copy-clipboard.html %}
~~~ sql
> USE bank;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
~~~

The output should look similar to the following:

~~~
                   id                  | balance
---------------------------------------+----------
  3a936990-a0c9-45bf-bc24-92e10d91dca9 |     300
  c6ae8917-d24e-4115-b719-f663dbfb9ffb |     400
(2 rows)
~~~

## What's next?

Read more about using the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx?tab=doc).

{% include {{ page.version.version }}/app/see-also-links.md %}
