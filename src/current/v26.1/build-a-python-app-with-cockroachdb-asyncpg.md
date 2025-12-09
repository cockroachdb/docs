---
title: Build a Python App with CockroachDB and asyncpg
summary: Learn how to use CockroachDB from a simple Python application with the asyncpg driver.
toc: true
twitter: false
referral_id: docs_python_asyncpg
filter_category: crud_python
filter_html: <strong>asyncpg</strong>
filter_sort: 1
docs_area: get_started
---

{% include {{ page.version.version }}/filter-tabs/crud-python.md %}

{% include cockroach_u_pydev.md %}

This tutorial shows you how build a simple Python application with CockroachDB and the [asyncpg](https://magicstack.github.io/asyncpg/current/index.html) driver.

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-certs.md %}

## Step 2. Get the sample code

Clone the sample code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachdb/example-app-python-asyncpg
~~~

The sample code in `example.py` does the following:

- Creates an `accounts` table and inserts some rows
- Transfers funds between two accounts inside a [transaction]({% link {{ page.version.version }}/transactions.md %})
- Deletes the accounts from the table before exiting so you can re-run the example code

To [handle transaction retry errors]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#transaction-retry-errors), the code uses an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another retry error, it sleeps for a longer interval, implementing [exponential backoff](https://wikipedia.org/wiki/Exponential_backoff).

## Step 3. Install the asyncpg driver

`asyncpg` is the sample app's only third-party module dependency.

To install `asyncpg`, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip3 install "asyncpg"
~~~

For other ways to install Psycopg, see the [official documentation](https://www.psycopg.org/psycopg3/docs/basic/install.html).

## Step 4. Run the code

1. Set the `DATABASE_URL` environment variable to the connection string to your cluster:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://root@localhost:26257/defaultdb?sslmode=disable"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="{connection-string}"
    ~~~

    Where `{connection-string}` is the connection string you copied earlier.

    </section>

    The app uses the connection string saved to the `DATABASE_URL` environment variable to connect to your cluster and execute the code.

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd example-app-python-asyncpg
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 example.py
    ~~~

    The output should show the account balances before and after the funds transfer:

    ~~~
    Balances at Thu Aug  4 15:51:03 2022:
    account id: 2e964b45-2034-49a7-8ab8-c5d0082b71f1  balance: $1000
    account id: 889cb1eb-b747-46f4-afd0-15d70844147f  balance: $250
    Balances at Thu Aug  4 15:51:03 2022:
    account id: 2e964b45-2034-49a7-8ab8-c5d0082b71f1  balance: $900
    account id: 889cb1eb-b747-46f4-afd0-15d70844147f  balance: $350
    ~~~

    {{site.data.alerts.callout_info}}
    The example code sets the [`multiple_active_portals_enabled` session variable]({% link {{ page.version.version }}/postgresql-compatibility.md %}#multiple-active-portals) to `true`, a requirement for using `asyncpg` with CockroachDB.
    {{site.data.alerts.end}}

## What's next?

Read more about using the [asyncpg](https://magicstack.github.io/asyncpg/current/usage.html).

{% include_cached {{page.version.version}}/app/see-also-links.md %}
