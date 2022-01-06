---
title: Build a Simple CRUD Node.js App with CockroachDB and Prisma Client
summary: Learn how to use CockroachDB from a simple CRUD application that uses the Prisma Client ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button">Use <strong>node-postgres</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button">Use <strong>Sequelize</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-knexjs.html"><button class="filter-button">Use <strong>KnexJS</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-prisma.html"><button class="filter-button current">Use <strong>Prisma</strong></button></a>
    <a href="build-a-typescript-app-with-cockroachdb.html"><button class="filter-button">Use <strong>TypeORM</strong></button></a>
</div>

This tutorial shows you how build a simple Node.js application with CockroachDB and [Prisma Client](https://www.prisma.io).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/app/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-node-prisma
~~~

The project has the following directory structure:

~~~
├── dbinit.sql
├── index.js
├── package.json
└── prisma
    └── schema.prisma
~~~

The `dbinit.sql` file initializes the database schema that the application uses:

{% include_cached copy-clipboard.html %}
~~~ sql
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-node-prisma/main/dbinit.sql %}
~~~

The `index.js` file contains the code for `INSERT`, `SELECT`, `UPDATE`, and `DELETE` SQL operations:

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-node-prisma/main/index.js %}
~~~

All of the database operations are wrapped in a helper function named `retryTxn`. This function attempts to commit statements in the context of an explicit transaction. If a [retry error](transaction-retry-error-reference.html) is thrown, the wrapper will retry committing the transaction, with [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff), until the maximum number of retries is reached (by default, 15).

## Step 3. Initialize the database

{{site.data.alerts.callout_info}}
CockroachDB does not support Prisma Migrate. We recommend executing DDL SQL statements to initialize your database schema separately. After the database schema is initialized, you can load existing tables into your Prisma schema with the Prisma Client, as demonstrated [here](https://www.prisma.io/docs/concepts/components/introspection).
{{site.data.alerts.end}}

To initialize the example database schema, use the [`cockroach sql`](cockroach-sql.html) command to execute the SQL statements in the `dbinit.sql` file:

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ shell
cat dbinit.sql | cockroach sql --url "<connection-string>"
~~~

Where `<connection-string>` is the connection string you obtained earlier from the {{ site.data.products.db }} Console.

</div>

<div class="filter-content" markdown="1" data-scope="local">

{% include_cached copy-clipboard.html %}
~~~ shell
cat dbinit.sql | cockroach sql --url "postgresql://root@localhost:26257?sslmode=disable"
~~~

{{site.data.alerts.callout_info}}
`postgresql://root@localhost:26257?sslmode=disable` is the `sql` connection string you obtained earlier from the `cockroach` welcome text.
{{site.data.alerts.end}}

</div>

## Step 4. Configure the project

1. Update the `DATABASE_URL` environment variable in the project's `.env` file with a valid connection string to your cluster:

    <div class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~
    DATABASE_URL="<connection-string>"
    ~~~

    Where `<connection-string>` is the connection string you obtained earlier from the {{ site.data.products.db }} Console.

    </div>

    <div class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~
    DATABASE_URL="postgresql://root@localhost:26257?sslmode=disable"
    ~~~

    </div>

1. Install the app requirements:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install prisma uuid --save-dev @prisma/client
    ~~~

1. Load the database schema from the cluster into your Prisma schema file.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma db pull
    ~~~

1. Initialize Prisma Client.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma generate
    ~~~

## Step 5. Run the code

Run the application code.

{% include_cached copy-clipboard.html %}
~~~ shell
$ node index.js
~~~

~~~
Initial account values:
 [
  { id: '081d2b77-1229-4e5b-883e-5d9bd7d369d1', balance: 681n },
  { id: '5c1f7f62-348d-4f75-a5c1-baab7cc2275f', balance: 73n },
  { id: '714f0f18-98c1-4bb3-a44a-08f11f792934', balance: 792n },
  { id: 'df83aeb9-3146-4afc-aef7-1a7094252189', balance: 174n },
  { id: 'eaf21411-6761-4493-9eea-cce690cf9eff', balance: 106n }
]
Updated account values:
 [
  { id: '081d2b77-1229-4e5b-883e-5d9bd7d369d1', balance: 676n },
  { id: '5c1f7f62-348d-4f75-a5c1-baab7cc2275f', balance: 73n },
  { id: '714f0f18-98c1-4bb3-a44a-08f11f792934', balance: 787n },
  { id: 'df83aeb9-3146-4afc-aef7-1a7094252189', balance: 169n },
  { id: 'eaf21411-6761-4493-9eea-cce690cf9eff', balance: 101n }
]
Account rows deleted. { count: 5 }
~~~

## What's next?

Read more about using the [Prisma ORM](https://www.prisma.io/docs/).

{% include {{page.version.version}}/app/see-also-links.md %}
