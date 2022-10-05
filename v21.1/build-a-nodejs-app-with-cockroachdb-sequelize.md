---
title: Build a Node.js App with CockroachDB and Sequelize
summary: Learn how to use CockroachDB from a simple Node.js application with the Sequelize ORM.
toc: true
twitter: false
referral_id: docs_hello_world_nodejs_sequelize
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button">Use <strong>node-postgres</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button current">Use <strong>Sequelize</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-knexjs.html"><button class="filter-button">Use <strong>Knex.js</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-prisma.html"><button class="filter-button">Use <strong>Prisma</strong></button></a>
    <a href="build-a-typescript-app-with-cockroachdb.html"><button class="filter-button">Use <strong>TypeORM</strong></button></a>
</div>

This tutorial shows you how build a simple Node.js application with CockroachDB and the Sequelize ORM.

We have tested the [Sequelize ORM](https://sequelize.org/) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_success}}
For a more realistic use of Sequelize with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms)repository.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Install the Sequelize ORM

To install Sequelize, as well as a [CockroachDB Node.js package](https://github.com/cockroachdb/sequelize-cockroachdb) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ npm install sequelize sequelize-cockroachdb
~~~

## Step 4. Get the code

<a href="https://raw.githubusercontent.com/cockroachlabs/example-app-node-sequelize/main/app.js">Download the sample code directly</a>, or clone [the code's GitHub repository](https://github.com/cockroachlabs/example-app-node-sequelize).

## Step 5. Update the connection parameters

Open `app.js`, and edit the connection configuration parameters:

<section class="filter-content" markdown="1" data-scope="local">

- Replace the value for `username` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.
- Replace the value for `port` with the port to your cluster.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

- At the top of the file, uncomment the `const fs = require('fs');` line.

    This line imports the `fs` Node module, which enables you to read in the CA cert that you downloaded from the {{ site.data.products.db }} Console.
- Replace the value for `username` with the user you created earlier.
- Replace the value for `password` with the password you created for your user.
- Replace the value for `host` with the name of the {{ site.data.products.db }} Free host (e.g., `host: 'free-tier.gcp-us-central1.cockroachlabs.cloud'`).
- Replace the value for `port` with the port to your cluster.
- Replace the value for `database` with the database that you created earlier, suffixed with the name of the cluster (e.g., `database: '{cluster_name}.bank'`).
- Remove the `rejectUnauthorized` key-value pair.
- Uncomment the `ca` key-value pair, and edit the `fs.readFileSync('certs/ca.crt').toString()` call to use the path to the `cc-ca.crt` file that you downloaded from the {{ site.data.products.db }} Console.

</section>

## Step 6. Run the code

The following code uses the [Sequelize](https://sequelize.org/) ORM to map Node.js-specific objects to SQL operations. Specifically, `Account.sync({force: true})` creates an `accounts` table based on the Account model (or drops and recreates the table if it already exists), `Account.bulkCreate([...])` inserts rows into the table, and `Account.findAll()` selects from the table so that balances can be printed.

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-node-sequelize/main/app.js %}
~~~

To run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ node app.js
~~~

The output should be:

~~~ shell
1 1000
2 250
~~~

## What's next?

Read more about using the [Sequelize ORM](https://sequelize.org/), or check out a more realistic implementation of Sequelize with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
