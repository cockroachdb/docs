---
title: Build a Simple CRUD Node.js App with CockroachDB and Knex.js
summary: Learn how to use CockroachDB from a simple CRUD application that uses the Knex.js query builder.
toc: true
twitter: false
referral_id: docs_node_knexjs
filter_category: crud_js
filter_html: Use <strong>Knex.js</strong>
filter_sort: 3
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple Node.js application with CockroachDB and [Knex.js](https://knexjs.org/).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-node-knex
~~~

## Step 3. Run the code

1. Set the `DATABASE_URL` environment variable to the connection string:

    <section class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="<connection-string>"
    ~~~

    Where `<connection-string>` is the connection string you copied earlier.

    </section>

    The app uses the connection string saved to the `DATABASE_URL` environment variable to connect to your cluster and execute the code.

1. Install the app requirements:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

1. Run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm run
    ~~~

    The output should look like this:

    ~~~
    Initializing accounts table...
    New account balances:
    { id: 'bc0f7136-7103-4dc4-88fc-102d5bbd312f', balance: '1000' }
    { id: '35bde7d0-29c9-4277-a117-3eb80c85ae16', balance: '250' }
    { id: '18cc1b2d-be61-4a8d-942c-480f5a6bc207', balance: '0' }
    Transferring funds...
    New account balances:
    { id: 'bc0f7136-7103-4dc4-88fc-102d5bbd312f', balance: '900' }
    { id: '35bde7d0-29c9-4277-a117-3eb80c85ae16', balance: '350' }
    { id: '18cc1b2d-be61-4a8d-942c-480f5a6bc207', balance: '0' }
    Deleting a row...
    New account balances:
    { id: 'bc0f7136-7103-4dc4-88fc-102d5bbd312f', balance: '900' }
    { id: '18cc1b2d-be61-4a8d-942c-480f5a6bc207', balance: '0' }
    ~~~

## What's next?

{% include {{page.version.version}}/app/see-also-links.md %}
