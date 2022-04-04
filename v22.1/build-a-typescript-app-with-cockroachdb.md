---
title: Build a TypeScript App with CockroachDB and TypeORM
summary: Learn how to use CockroachDB with the TypeORM framework.
toc: true
twitter: false
referral_id: docs_typescript_typeorm
filter_category: crud_js
filter_html: Use <strong>TypeORM</strong>
filter_sort: 5
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how run a simple application built with [TypeORM](https://typeorm.io/#/).

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Get the code

Clone [the code's GitHub repository](https://github.com/cockroachlabs/example-app-typescript-typeorm).

## Step 4. Configure your CockroachDB connection

<section class="filter-content" markdown="1" data-scope="local">

1. Open the `datasource.ts` file, and comment out the `extra` and `options` configuration properties.

1. In the `datasource.ts` file, replace `ssl: true` with `ssl: { rejectUnauthorized: false }`.

    {{site.data.alerts.callout_danger}}
    Only use `ssl: { rejectUnauthorized: false }` in development, for insecure connections.
    {{site.data.alerts.end}}

1. Set the `DATABASE_URL` environment variable to the connection string provided in the `cockroach demo` welcome text.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

1. Open the `datasource.ts` file, and edit the `--cluster=<routing-id>` configuration property to specify the routing ID to your serverless cluster.

1. Set the `DATABASE_URL` environment variable to a CockroachDB connection string compatible with TypeORM.

    TypeORM accepts the following format for {{ site.data.products.serverless }} connection strings:

    {% include copy-clipboard.html %}
    ~~~
    postgresql://<username>:<password>@<host>:<port>/<database>
    ~~~

</section>

## Step 5. Run the code

Open a terminal window, and install the application dependencies:

{% include copy-clipboard.html %}
~~~ shell
$ npm install
~~~

Start the application:

{% include copy-clipboard.html %}
~~~ shell
$ npm start
~~~

You should see the following output in your terminal:

~~~
Inserting a new account into the database...
Saved a new account.
Printing balances from account 1db0f34a-55e8-42e7-adf1-49e76010b763.
[
  Account { id: '1db0f34a-55e8-42e7-adf1-49e76010b763', balance: 1000 }
]
Inserting a new account into the database...
Saved a new account.
Printing balances from account 4e26653a-3821-48c8-a481-47eb73b3e4cc.
[
  Account { id: '4e26653a-3821-48c8-a481-47eb73b3e4cc', balance: 250 }
]
Transferring 500 from account 1db0f34a-55e8-42e7-adf1-49e76010b763 to account 4e26653a-3821-48c8-a481-47eb73b3e4cc.
Transfer complete.
Printing balances from account 1db0f34a-55e8-42e7-adf1-49e76010b763.
[
  Account { id: '1db0f34a-55e8-42e7-adf1-49e76010b763', balance: 1000 }
]
Printing balances from account 4e26653a-3821-48c8-a481-47eb73b3e4cc.
[
  Account { id: '4e26653a-3821-48c8-a481-47eb73b3e4cc', balance: 250 }
]
~~~

## What's next?

Read more about using the [TypeORM](https://typeorm.io/#/).

{% include {{page.version.version}}/app/see-also-links.md %}
