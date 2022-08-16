---
title: Build a Simple CRUD Node.js App with CockroachDB and Prisma
summary: Learn how to use CockroachDB from a simple CRUD application that uses the Prisma ORM.
toc: true
twitter: false
referral_id: docs_node_prisma
docs_area: get_started
---

{% include {{ page.version.version }}/filter-tabs/crud-js.md %}

This tutorial shows you how build a simple Node.js application with CockroachDB and [Prisma](https://www.prisma.io).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}

## Step 2. Get the code

1. Clone the code's GitHub repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ git clone https://github.com/cockroachlabs/example-app-node-prisma
    ~~~

1. Install the application dependencies:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd example-app-node-prisma
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

## Step 3. Initialize the database

1. Create a `.env` file for your project, and set the `DATABASE_URL` environment variable to a valid connection string to your cluster.

    <div class="filter-content" markdown="1" data-scope="cockroachcloud">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo "DATABASE_URL=<connection-string>" >> .env
    ~~~

    Where `<connection-string>` is the connection string you obtained earlier from the {{ site.data.products.db }} Console.

    </div>

    <div class="filter-content" markdown="1" data-scope="local">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo "DATABASE_URL=postgresql://root@localhost:26257?sslmode=disable" >> .env
    ~~~

    {{site.data.alerts.callout_info}}
    `postgresql://root@localhost:26257?sslmode=disable` is the `sql` connection string you obtained earlier from the `cockroach` welcome text.
    {{site.data.alerts.end}}

    </div>

    Prisma loads the variables defined in `.env` to the project environment. By default, Prisma uses the `DATABASE_URL` environment variable as the connection string to the database.

1. Run [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) to initialize the database with the schema defined in `prisma/prisma.schema`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ node_modules/.bin/prisma migrate dev --name init
    ~~~

    You should see the following output:

    ~~~
    Your database is now in sync with your schema.

    ✔ Generated Prisma Client (3.12.0 | library) to ./node_modules/@prisma/client in 73ms
    ~~~

    This command also initializes [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client) to communicate with your CockroachDB cluster, based on the configuration in the `prisma/schema.prisma` file.

## Step 4. Run the code

The `index.js` file contains the code for `INSERT`, `SELECT`, `UPDATE`, and `DELETE` SQL operations:

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-node-prisma/main/index.js %}
~~~

{{site.data.alerts.callout_info}}
In [production](recommended-production-settings.html#transaction-retries), we recommend implementing [client-side transaction retries](transactions.html#client-side-intervention) for all database operations.
{{site.data.alerts.end}}

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
