---
title: Build a TypeScript App with CockroachDB and TypeORM
summary: Learn how to use CockroachDB with the TypeORM framework.
toc: true
twitter: false
referral_id: docs_hello_world_typescript_typeorm
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button">Use <strong>pg</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button">Use <strong>Sequelize</strong></button></a>
    <a href="build-a-typescript-app-with-cockroachdb.html"><button class="filter-button current">Use <strong>TypeORM</strong></button></a>
</div>

This tutorial shows you how run a simple application built with [TypeORM](https://typeorm.io/#/).

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Get the code

1. Clone [the code's GitHub repository](https://github.com/cockroachlabs/example-app-typescript-typeorm):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ git clone git@github.com:cockroachlabs/example-app-typescript-typeorm.git
    ~~~

1. Navigate to the repo directory and install the application dependencies:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd example-app-typescript-typeorm
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

## Step 4. Configure your CockroachDB connection

<section class="filter-content" markdown="1" data-scope="local">

1. Open the `datasource.ts` file, and comment out the `ssl: true`, `extra` and `options` configuration properties.

1. In the `datasource.ts` file, uncomment `ssl: { rejectUnauthorized: false }`.

    {{site.data.alerts.callout_danger}}
    Only use `ssl: { rejectUnauthorized: false }` in development, for insecure connections.
    {{site.data.alerts.end}}

    The `DataSource` configuration should look similar to the following:

    ~~~ ts
    export const AppDataSource = new DataSource({
        type: "cockroachdb",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // For insecure connections only
        /* ssl: true,
        extra: {
            options: "--cluster=<routing-id>"
        }, */
        synchronize: true,
        logging: false,
        entities: ["src/entity/**/*.ts"],
        migrations: ["src/migration/**/*.ts"],
        subscribers: ["src/subscriber/**/*.ts"],
    })
    ~~~

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
