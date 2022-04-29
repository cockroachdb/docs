---
title: Build a Simple CRUD Node.js App with CockroachDB and the node-postgres Driver
summary: Learn how to use CockroachDB from a simple CRUD application that uses the node-postgres driver.
toc: true
twitter: false
referral_id: docs_node_postgres
filter_category: crud_js
filter_html: Use <strong>node-postgres</strong>
filter_sort: 1
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple Node.js application with CockroachDB and the [node-postgres driver](https://node-postgres.com/).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-node-postgres
~~~

The project has the following directory structure:

~~~
├── README.md
├── app.js
├── dbinit.sql
└── package.json
~~~

The `dbinit.sql` file initializes the database schema that the application uses:

{% include_cached copy-clipboard.html %}
~~~ sql
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-node-postgres/main/dbinit.sql %}
~~~

The `app.js` file contains the code for `INSERT`, `SELECT`, `UPDATE`, and `DELETE` SQL operations:

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-node-postgres/main/app.js %}
~~~

All of the database operations are wrapped in a helper function named `retryTxn`. This function attempts to commit statements in the context of an explicit transaction. If a [retry error](transaction-retry-error-reference.html) is thrown, the wrapper will retry committing the transaction, with [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff), until the maximum number of retries is reached (by default, 15).

## Step 3. Initialize the database

1. Navigate to the `example-node-postgres` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd example-node-postgres
    ~~~
    
{% include {{ page.version.version }}/setup/init-bank-sample.md %}

## Step 4. Run the code

1. Install the app requirements:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

1. Run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ node app.js
    ~~~

    The app uses the connection string saved to the `DATABASE_URL` environment variable to connect to your cluster and execute the code.

    The output should look like this:

    ~~~
    Initializing accounts table...
    New account balances:
    { id: 'aa0e9b22-0c23-469b-a9e1-b2ace079f44c', balance: '1000' }
    { id: 'bf8b96da-2c38-4d55-89a0-b2b6ed63ff9e', balance: '0' }
    { id: 'e43d76d6-388e-4ee6-8b73-a063a63a2138', balance: '250' }
    Transferring funds...
    New account balances:
    { id: 'aa0e9b22-0c23-469b-a9e1-b2ace079f44c', balance: '900' }
    { id: 'bf8b96da-2c38-4d55-89a0-b2b6ed63ff9e', balance: '0' }
    { id: 'e43d76d6-388e-4ee6-8b73-a063a63a2138', balance: '350' }
    Deleting a row...
    New account balances:
    { id: 'aa0e9b22-0c23-469b-a9e1-b2ace079f44c', balance: '900' }
    { id: 'e43d76d6-388e-4ee6-8b73-a063a63a2138', balance: '350' }
    ~~~

## What's next?

Read more about using the [node-postgres driver](https://www.npmjs.com/package/pg).

{% include {{page.version.version}}/app/see-also-links.md %}
