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

## Step 4. Update the connection parameters

Open the `ormconfig.ts` file, and edit the ORM configuration parameters:

<section class="filter-content" markdown="1" data-scope="local">

- Replace the value for `port` with the port to your cluster.
- Replace the value for `username` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

- At the top of the file, uncomment the `import * as fs from "fs";` line.

    This line imports the `fs` Node module, which enables you to read in the CA cert that you downloaded from the {{ site.data.products.db }} Console.
- Replace the value for `host` with the name of the {{ site.data.products.serverless }} host (e.g., `host: 'free-tier.gcp-us-central1.cockroachlabs.cloud'`).
- Replace the value for `port` with the port to your cluster.
- Replace the value for `username` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.
- Replace the value for `database` with the database that you created earlier, suffixed with the name of the cluster (e.g., `database: '{cluster_name}.bank'`).
- Remove the `ssl: true` key-value pair.
- Remove the `extra` object and its contents.
- Uncomment the `ssl` object with the `ca` key-value pair, and edit the `fs.readFileSync('certs/cc-ca.crt').toString()` call to use the path to the `cc-ca.crt` file that you downloaded from the {{ site.data.products.db }} Console.

</section>

## Step 5. Run the code

Open a terminal window, and install the [Node.js pg driver](https://www.npmjs.com/package/pg):

{% include copy-clipboard.html %}
~~~ shell
$ npm install pg --save
~~~

Navigate to the top directory of the application project (e.g., `example-app-typescript-typeorm`), and initialize the project:

{% include copy-clipboard.html %}
~~~ shell
$ npm i
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
Printing balances from account 1.
Account { id: 1, balance: 1000 }
Inserting a new account into the database...
Saved a new account.
Printing balances from account 2.
Account { id: 2, balance: 250 }
Transferring 500 from account 1 to account 2.
Transfer complete.
Printing balances from account 1.
Account { id: 1, balance: 500 }
Printing balances from account 2.
Account { id: 2, balance: 750 }
~~~

## What's next?

Read more about using the [TypeORM](https://typeorm.io/#/).

{% include {{page.version.version}}/app/see-also-links.md %}
