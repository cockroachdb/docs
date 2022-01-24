---
title: Build a Simple CRUD Node.js App with CockroachDB and Prisma Client
summary: Learn how to use CockroachDB from a simple CRUD application that uses the Prisma Client ORM.
toc: true
twitter: false
referral_id: docs_node_prisma
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
├── README.md
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

{{site.data.alerts.callout_info}}
In [production](recommended-production-settings.html#transaction-retries), we recommend implementing [client-side transaction retries](transactions.html#client-side-intervention) for all database operations.
{{site.data.alerts.end}}

## Step 3. Initialize the database

{{site.data.alerts.callout_info}}
CockroachDB does not support Prisma Migrate. We recommend executing DDL SQL statements to initialize your database schema separately. After the database schema is initialized, you can load existing tables into your Prisma schema with the Prisma Client, as demonstrated [here](https://www.prisma.io/docs/concepts/components/introspection).
{{site.data.alerts.end}}

To initialize the example database schema in CockroachDB, use the [`cockroach sql`](cockroach-sql.html) command to execute the SQL statements in the `dbinit.sql` file:

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url "<connection-string>" --file dbinit.sql
~~~

Where `<connection-string>` is the connection string you obtained earlier from the {{ site.data.products.db }} Console.

</div>

<div class="filter-content" markdown="1" data-scope="local">

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url "postgresql://root@localhost:26257?sslmode=disable" --file dbinit.sql
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
    $ npm install
    ~~~

1. Load the database schema from the cluster into your Prisma schema file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma db pull
    ~~~

1. Initialize Prisma Client:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma generate
    ~~~

## Step 5. Run the code

Run the application code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ node index.js
~~~

~~~
Customer rows inserted. { count: 10 }
Account rows inserted. { count: 10 }
Initial Account row values:
 [
  {
    id: '1961432f-f93e-4568-b2a5-ba08f73afde5',
    customer_id: '079daee3-ecf2-4a0f-980b-4c3ea4c8b6a3',
    balance: 914n
  },
  {
    id: '4ccd7eea-eb47-4aa9-9819-30b5aae58bf8',
    customer_id: 'c0eeb465-ab60-4f02-9bf3-3451578d400d',
    balance: 176n
  },
  {
    id: '53ed4f7d-72ee-4390-9487-9bf318357c77',
    customer_id: 'a4c9e26e-f9d8-4c1b-ac20-1aa8611b134f',
    balance: 54n
  },
  {
    id: '79a1f1b2-4050-4329-bf52-5df53fec749e',
    customer_id: '392c7d15-5ab2-4149-9eee-8a3a44b36e9d',
    balance: 482n
  },
  {
    id: '7e30f1e0-e873-4565-9ea3-3079a48a4886',
    customer_id: '12cb3406-264a-417c-b0e6-86593e60dc18',
    balance: 478n
  },
  {
    id: '94f461d5-3985-46c1-98f4-1896f15f0a16',
    customer_id: 'e4c909a4-6683-429d-9831-dfcf792f4fb0',
    balance: 240n
  },
  {
    id: 'a0c081f5-fb15-47cc-8dbb-85c6f15677d2',
    customer_id: '91ece5f2-df03-4023-b112-2b4d5677981b',
    balance: 520n
  },
  {
    id: 'a45b7c41-2f62-4620-be69-57d5d61186e4',
    customer_id: 'c1824327-d6a1-4916-a666-ea157ef2a409',
    balance: 50n
  },
  {
    id: 'dbe0dec5-257b-42ff-9d36-1b5a57e1a4ac',
    customer_id: '6739eb2f-bcb1-4074-aab4-5860b04d227d',
    balance: 468n
  },
  {
    id: 'ebc520b4-8df0-4e2f-8426-104594f6341c',
    customer_id: 'f83e02cb-77cf-4347-9e0c-28cad65fac34',
    balance: 336n
  }
]
Account rows updated. { count: 8 }
Updated Account row values:
 [
  {
    id: '1961432f-f93e-4568-b2a5-ba08f73afde5',
    customer_id: '079daee3-ecf2-4a0f-980b-4c3ea4c8b6a3',
    balance: 909n
  },
  {
    id: '4ccd7eea-eb47-4aa9-9819-30b5aae58bf8',
    customer_id: 'c0eeb465-ab60-4f02-9bf3-3451578d400d',
    balance: 171n
  },
  {
    id: '53ed4f7d-72ee-4390-9487-9bf318357c77',
    customer_id: 'a4c9e26e-f9d8-4c1b-ac20-1aa8611b134f',
    balance: 54n
  },
  {
    id: '79a1f1b2-4050-4329-bf52-5df53fec749e',
    customer_id: '392c7d15-5ab2-4149-9eee-8a3a44b36e9d',
    balance: 477n
  },
  {
    id: '7e30f1e0-e873-4565-9ea3-3079a48a4886',
    customer_id: '12cb3406-264a-417c-b0e6-86593e60dc18',
    balance: 473n
  },
  {
    id: '94f461d5-3985-46c1-98f4-1896f15f0a16',
    customer_id: 'e4c909a4-6683-429d-9831-dfcf792f4fb0',
    balance: 235n
  },
  {
    id: 'a0c081f5-fb15-47cc-8dbb-85c6f15677d2',
    customer_id: '91ece5f2-df03-4023-b112-2b4d5677981b',
    balance: 515n
  },
  {
    id: 'a45b7c41-2f62-4620-be69-57d5d61186e4',
    customer_id: 'c1824327-d6a1-4916-a666-ea157ef2a409',
    balance: 50n
  },
  {
    id: 'dbe0dec5-257b-42ff-9d36-1b5a57e1a4ac',
    customer_id: '6739eb2f-bcb1-4074-aab4-5860b04d227d',
    balance: 463n
  },
  {
    id: 'ebc520b4-8df0-4e2f-8426-104594f6341c',
    customer_id: 'f83e02cb-77cf-4347-9e0c-28cad65fac34',
    balance: 331n
  }
]
All Customer rows deleted. { count: 10 }
~~~

## What's next?

Read more about using [Prisma Client](https://www.prisma.io/docs/).

{% include {{page.version.version}}/app/see-also-links.md %}
