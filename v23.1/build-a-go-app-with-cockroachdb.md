---
title: Build a Simple CRUD Go App with CockroachDB and the Go pgx Driver
summary: Learn how to use CockroachDB from a simple Go application with the Go pgx driver.
toc: true
twitter: false
referral_id: docs_go_pgx
docs_area: get_started
---

{% include {{ page.version.version }}/filter-tabs/crud-go.md %}

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
└── main.go
~~~

The `main.go` file contains the code for `CREATE TABLE`, `INSERT`, `SELECT`, `UPDATE`, and `DELETE` SQL operations. The file also executes the `main` method of the program.

{% include_cached copy-clipboard.html %}
~~~ go
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-go-pgx/main/main.go %}
~~~

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in the case of read/write [contention](performance-best-practices-overview.html#transaction-contention). The [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go) includes a generic **retry function** (`ExecuteTx()`) that runs inside a transaction and retries it as needed. The code sample shows how you can use this function to wrap SQL statements.
{{site.data.alerts.end}}

## Step 3. Initialize the database

1. Navigate to the `example-app-go-pgx` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd example-app-go-pgx
    ~~~

1. Set the `DATABASE_URL` environment variable to the connection string for your cluster:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    export DATABASE_URL="{connection-string}"
    ~~~

    Where `{connection-string}` is the connection string you copied earlier.

    </section>

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
    2023/03/24 13:48:13 Drop existing accounts table if necessary.
    2023/03/24 13:48:13 Creating accounts table.
    2023/03/24 13:48:13 Creating new rows...
    2023/03/24 13:48:13 New rows created.
    2023/03/24 13:48:13 Initial balances:
    2023/03/24 13:48:13 19a2b534-11f6-4bbd-ab50-b94c44479280: 500
    2023/03/24 13:48:13 882bb8be-31cb-4481-8e28-69b0566a322b: 300
    2023/03/24 13:48:13 b8cbefed-37ee-4bae-b5b0-3bcfb7a6d3bf: 250
    2023/03/24 13:48:13 d0a238d5-96bd-42d7-89a3-3e2448b3137b: 100
    2023/03/24 13:48:14 Transferring funds from account with ID 19a2b534-11f6-4bbd-ab50-b94c44479280 to account with ID d0a238d5-96bd-42d7-89a3-3e2448b3137b...
    2023/03/24 13:48:14 Transfer successful.
    2023/03/24 13:48:14 Balances after transfer:
    2023/03/24 13:48:14 19a2b534-11f6-4bbd-ab50-b94c44479280: 400
    2023/03/24 13:48:14 882bb8be-31cb-4481-8e28-69b0566a322b: 300
    2023/03/24 13:48:14 b8cbefed-37ee-4bae-b5b0-3bcfb7a6d3bf: 250
    2023/03/24 13:48:14 d0a238d5-96bd-42d7-89a3-3e2448b3137b: 200
    2023/03/24 13:48:14 Deleting rows with IDs b8cbefed-37ee-4bae-b5b0-3bcfb7a6d3bf and d0a238d5-96bd-42d7-89a3-3e2448b3137b...
    2023/03/24 13:48:14 Rows deleted.
    2023/03/24 13:48:14 Balances after deletion:
    2023/03/24 13:48:14 19a2b534-11f6-4bbd-ab50-b94c44479280: 400
    2023/03/24 13:48:14 882bb8be-31cb-4481-8e28-69b0566a322b: 300
    ~~~

    As shown in the output, the code does the following:
    - Drops any existing `accounts` table.
    - Creates a new `accounts` table.
    - Inserts some rows into the table.
    - Reads values from the table.
    - Updates values in the table.
    - Deletes values from the table.

## What's next?

Read more about using the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx?tab=doc).

{% include {{ page.version.version }}/app/see-also-links.md %}
