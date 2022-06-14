---
title: Build a Python App with CockroachDB and psycopg2
summary: Learn how to use CockroachDB from a simple Python application with the psycopg2 driver.
toc: true
twitter: false
referral_id: docs_python_psycopg2
filter_category: crud_python
filter_html: <strong>psycopg2</strong>
filter_sort: 1
docs_area: get_started
---

{% include_cached filter-tabs.md %}

{% include cockroach_u_pydev.md %}

This tutorial shows you how build a simple Python application with CockroachDB and the [psycopg2](https://www.psycopg.org/) driver.

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-certs.md %}

## Step 2. Get the sample code

Clone the sample code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-python-psycopg2
~~~

The sample code in `example.py` does the following:

- Creates an `accounts` table and inserts some rows
- Transfers funds between two accounts inside a [transaction](transactions.html)
- Deletes the accounts from the table before exiting so you can re-run the example code

To [handle transaction retry errors](error-handling-and-troubleshooting.html#transaction-retry-errors), the code uses an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another retry error, it sleeps for a longer interval, implementing [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff).


## Step 3. Install the psycopg2 driver

`psycopg2-binary` is the sample app's only third-party module dependency.

To install `psycopg2-binary`, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install psycopg2-binary
~~~

For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

## Step 4. Run the code

1. Set the `DATABASE_URL` environment variable to the connection string to your {{ site.data.products.db }} cluster:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="{connection-string}"
    ~~~

    Where `{connection-string}` is the connection string you obtained from the {{ site.data.products.db }} Console.

    </section>

    The app uses the connection string saved to the `DATABASE_URL` environment variable to connect to your cluster and execute the code.

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd hello-world-python-psycopg2
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python example.py
    ~~~

    The output should show the account balances before and after the funds transfer:

    ~~~
    Balances at Fri Oct 30 18:27:00 2020:
    (1, 1000)
    (2, 250)
    Balances at Fri Oct 30 18:27:00 2020:
    (1, 900)
    (2, 350)
    ~~~

## What's next?

Read more about using the [Python psycopg2 driver](http://initd.org/psycopg/docs/).

{% include {{page.version.version}}/app/see-also-links.md %}
