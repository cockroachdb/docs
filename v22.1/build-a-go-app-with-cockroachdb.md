---
title: Build a Simple CRUD Go App with CockroachDB and the Go pgx Driver
summary: Learn how to use CockroachDB from a simple Go application with the Go pgx driver.
toc: true
twitter: false
referral_id: docs_go_pgx
filter_category: crud_go
filter_html: Use <strong>pgx</strong>
filter_sort: 1
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple CRUD Go application with CockroachDB and the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}

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

## Step 3. Initialize the database

1. Navigate to the `example-app-go-pgx` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd example-app-go-pgx
    ~~~

{% include {{ page.version.version }}/setup/init-bank-sample.md %}

## Step 4. Run the code

1. Initialize the module:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go mod init basic-sample && go mod tidy
    ~~~

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go run main.go
    ~~~

    The output should look similar to the following:

    ~~~
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
    - Inserts some rows into the `accounts` table.
    - Reads values from the table.
    - Updates values in the table.
    - Deletes values from the table.

## What's next?

Read more about using the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx?tab=doc).

{% include {{ page.version.version }}/app/see-also-links.md %}
