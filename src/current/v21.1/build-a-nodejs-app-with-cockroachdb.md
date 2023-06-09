---
title: Build a Simple CRUD Node.js App with CockroachDB and the node-postgres Driver
summary: Learn how to use CockroachDB from a simple CRUD application that uses the node-postgres driver.
toc: true
twitter: false
referral_id: docs_hello_world_nodejs_pg
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>node-postgres</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button">Use <strong>Sequelize</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-knexjs.html"><button class="filter-button">Use <strong>Knex.js</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-prisma.html"><button class="filter-button">Use <strong>Prisma</strong></button></a>
    <a href="build-a-typescript-app-with-cockroachdb.html"><button class="filter-button">Use <strong>TypeORM</strong></button></a>
</div>

This tutorial shows you how build a simple Node.js application with CockroachDB and the [node-postgres driver](https://node-postgres.com/).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/app/sample-setup.md %}

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

{% include {{ page.version.version }}/app/init-bank-sample.md %}

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

    The program will prompt you for a connection string to the database:

    ~~~
    prompt: connectionString:
    ~~~

1. Enter the connection string to your running cluster.

    <section class="filter-content" markdown="1" data-scope="local">

    {{site.data.alerts.callout_success}}
    `postgresql://root@localhost:26257?sslmode=disable` should be the `sql` connection URL provided in the `cockroach` welcome text.
    {{site.data.alerts.end}}

    </section>

    <section class="filter-content" markdown="1" data-scope="cockroachcloud">

    {{site.data.alerts.callout_success}}
    Use the connection string provided in the **Connection info** window of the {{ site.data.products.db }} Console.
    {{site.data.alerts.end}}

    {{site.data.alerts.callout_info}}
    You need to provide a SQL user password in order to securely connect to a {{ site.data.products.db }} cluster. The connection string should have a placeholder for the password (`<ENTER-PASSWORD>`).
    {{site.data.alerts.end}}

    </section>

After entering the connection string, the program will execute.

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
