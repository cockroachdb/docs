---
title: Build a Go App with CockroachDB the Go pq Driver
summary: Learn how to use CockroachDB from a simple Go application with the Go pq driver.
toc: true
twitter: false
referral_id: docs_go_pq
filter_category: crud_go
filter_html: Use <strong>lib/pq</strong></button>
filter_sort: 3
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple Go application with CockroachDB and the Go [pq driver](https://github.com/lib/pq).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-go-pq
~~~

## Step 3. Run the code

You can now run the code sample (`main.go`) provided in this tutorial to do the following:

- Create a table.
- Insert some rows into the table you created.
- Read values from the table.
- Execute a batch of statements as an atomic [transaction](transactions.html).

    Note that CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in the case of read/write contention. The [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go) includes a generic **retry function** (`ExecuteTx()`) that runs inside a transaction and retries it as needed. The code sample shows how you can use this function to wrap SQL statements.

1. Initialize the module:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd hello-world-go-pq
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go mod init basic-sample && go mod tidy
    ~~~

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go run main.go
    ~~~

    The output should be:

    ~~~
    Balances:
    1 1000
    2 250
    Success
    Balances:
    1 900
    2 350
    ~~~

## What's next?

Read more about using the [Go pq driver](https://godoc.org/github.com/lib/pq).

{% include {{ page.version.version }}/app/see-also-links.md %}