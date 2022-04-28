---
title: Build a Rust App with CockroachDB and the Rust Postgres Driver
summary: Learn how to use CockroachDB from a simple Rust application with a low-level client driver.
toc: true
twitter: false
---

This tutorial shows you how build a simple Rust application with CockroachDB and the [Rust-Postgres driver](https://github.com/sfackler/rust-postgres).

We have tested the Rust-Postgres driver enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Specify the Rust Postgres driver as a dependency

Update your `Cargo.toml` file to specify a dependency on the Rust Postgres driver, as described in the <a href="https://crates.io/crates/postgres/" data-proofer-ignore>official documentation</a>.

Additionally, include the <a href="https://crates.io/crates/openssl" data-proofer-ignore>OpenSSL bindings</a> and <a href="https://crates.io/crates/postgres-openssl/" data-proofer-ignore>Rust Postgres OpenSSL</a> crates as dependencies.

## Step 2. Create the `maxroach` users and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Rust code

Now that you have a database and a user, you'll run code to create a table and insert some rows, and then you'll run code to read and update values as an atomic [transaction](transactions.html).

### Get the code

Clone the [`example-app-rust-postgres`](https://github.com/cockroachdb/example-app-rust-postgres) GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachdb/example-app-rust-postgres
~~~

### Basic statements

First, run `basic-sample.rs` to connect as the `maxroach` user and execute some basic SQL statements, inserting rows and reading and printing the rows:

{% include_cached copy-clipboard.html %}
~~~ sql
{% remote_include https://raw.githubusercontent.com/cockroachdb/example-app-rust-postgres/main/basic-sample.rs %}
~~~

### Transaction (with retry logic)

Next, run `txn-sample.rs` to again connect as the `maxroach` user but this time execute a batch of statements as an atomic transaction to transfer funds from one account to another, where all included statements are either committed or aborted.

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic <strong>retry function</strong> that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
{% remote_include https://raw.githubusercontent.com/cockroachdb/example-app-rust-postgres/main/txn-sample.rs %}
~~~

After running the code, use the [built-in SQL client](cockroach-sql.html) to verify that funds were transferred from one account to another:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |     900 |
|  2 |     350 |
+----+---------+
(2 rows)
~~~

## What's next?

Read more about using the <a href="https://crates.io/crates/postgres/" data-proofer-ignore>Rust Postgres driver</a>.

{% include {{ page.version.version }}/app/see-also-links.md %}