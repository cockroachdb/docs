---
title: Build a Rust App with CockroachDB and the Rust-Postgres Driver
summary: Learn how to use CockroachDB from a simple Rust application with a low-level client driver.
toc: true
twitter: false
docs_area: get_started
---

This tutorial shows you how build a simple Rust application with CockroachDB and the [Rust-Postgres driver](https://github.com/sfackler/rust-postgres).

## Before you begin

You must have Rust and Cargo installed. For instructions on installing Rust and Cargo, see the [Cargo documentation](https://doc.rust-lang.org/cargo/getting-started/installation.html).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}


## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachdb/example-app-rust-postgres
~~~

The project has the following structure:

~~~
├── Cargo.toml
├── LICENSE
├── README.md
└── src
    └── main.rs
~~~

The `Cargo.toml` file is the configuration file for the example, and sets the dependencies for the project.

{% include_cached copy-clipboard.html %}
~~~ toml
{% remote_include https://raw.githubusercontent.com/cockroachdb/example-app-rust-postgres/use-uuids/Cargo.toml %}
~~~

The `main` function is the entry point for the application, with the code for connecting to the cluster, creating the `accounts` table, creating accounts in that table, and transferring money between two accounts.

The `execute_txn` function wraps database operations in the context of an explicit transaction. If a [retry error](transaction-retry-error-reference.html) is thrown, the function will retry committing the transaction, with [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff), until the maximum number of retries is reached (by default, 15).

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write [contention](performance-best-practices-overview.html#transaction-contention). CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ rust
{% remote_include https://raw.githubusercontent.com/cockroachdb/example-app-rust-postgres/use-uuids/src/main.rs || BEGIN execute_txn || END execute_txn %}
~~~

The `transfer_funds` function calls `execute_txn` to perform the actual transfer of funds from one account to the other.

{% include_cached copy-clipboard.html %}
~~~ rust
{% remote_include https://raw.githubusercontent.com/cockroachdb/example-app-rust-postgres/use-uuids/src/main.rs || BEGIN transfer_funds || END transfer_funds %}
~~~

## Step 3. Run the code

1. In a terminal go to the `example-app-rust-postgres` directory.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cd example-app-rust-postgres
    ~~~

1. Set the `DATABASE_URL` environment variable to the connection string to your {{ site.data.products.db }} cluster:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    1. Edit the connection string you copied earlier and replace `sslmode=verify-full` with `sslmode=require`.

        {{site.data.alerts.callout_danger}}
        You **must** change the `sslmode` in your connection string to `sslmode=require`, as the Rust `postgres` driver does not recognize `sslmode=verify-full`. This example uses `postgres-openssl`, which will perform host verification when the `sslmode=require` option is set, so `require` is functionally equivalent to `verify-full`.
        {{site.data.alerts.end}}

        For example:

        ~~~
        postgresql://maxroach:ThisIsNotAGoodPassword@dim-dog-147.6wr.cockroachlabs.cloud:26257/bank?sslmode=require
        ~~~


    1. Set the `DATABASE_URL` environment variable to the modified connection string.

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ export DATABASE_URL="{connection-string}"
        ~~~

        Where `{connection-string}` is the modified connection string.

    </section>

    The app uses the connection string saved to the `DATABASE_URL` environment variable to connect to your cluster and execute the code.

1. Run the code to create a table and insert some rows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cargo run
    ~~~

    The output should look similar to the following:

    ~~~
      Compiling bank v0.1.0 (/Users/maxroach/go/src/github.com/cockroachdb/example-app-rust-postgres)
        Finished dev [unoptimized + debuginfo] target(s) in 8.00s
         Running `target/debug/bank`
    Creating accounts table if it doesn't already exist.
    Deleted existing accounts.
    Balances before transfer:
    account id: 8e88f765-b532-4071-a23d-1b33729d01cb  balance: $250
    account id: c6de70e2-78e0-484b-ae5b-6ac2aa43d9ec  balance: $1000
    Final balances:
    account id: 8e88f765-b532-4071-a23d-1b33729d01cb  balance: $350
    account id: c6de70e2-78e0-484b-ae5b-6ac2aa43d9ec  balance: $900
    ~~~

## What's next?

Read more about using the <a href="https://crates.io/crates/postgres/" data-proofer-ignore>Rust-Postgres driver</a>.

{% include {{ page.version.version }}/app/see-also-links.md %}
