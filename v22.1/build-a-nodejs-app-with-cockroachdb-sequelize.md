---
title: Build a Node.js App with CockroachDB and Sequelize
summary: Learn how to use CockroachDB from a simple Node.js application with the Sequelize ORM.
toc: true
twitter: false
referral_id: docs_node_sequelize
filter_category: crud_js
filter_html: Use <strong>Sequelize</strong>
filter_sort: 2
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple Node.js application with CockroachDB and the [Sequelize](https://sequelize.org/) ORM.

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}

## Step 2. Get the code

Clone the sample code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-node-sequelize
~~~

The sample code uses Sequelize to map Node.js-specific objects to some read and write SQL operations.

## Step 3. Run the code

To start the app:

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

1. Install the app dependencies:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd example-app-node-sequelize
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ node app.js
    ~~~

    The output should look similar to the following:

    ~~~ shell
    Executing (default): SELECT version() AS version
    Executing (default): DROP TABLE IF EXISTS "accounts" CASCADE;
    Executing (default): SELECT crdb_internal.increment_feature_counter(concat('Sequelize ', '6.17'))
    Executing (default): SELECT crdb_internal.increment_feature_counter(concat('sequelize-cockroachdb ', '6.0.5'))
    Executing (default): CREATE TABLE IF NOT EXISTS "accounts" ("id" INTEGER , "balance" INTEGER, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
    Executing (default): SELECT i.relname AS name, ix.indisprimary AS primary, ix.indisunique AS unique, ix.indkey AS indkey, array_agg(a.attnum) as column_indexes, array_agg(a.attname) AS column_names, pg_get_indexdef(ix.indexrelid) AS definition FROM pg_class t, pg_class i, pg_index ix, pg_attribute a WHERE t.oid = ix.indrelid AND i.oid = ix.indexrelid AND a.attrelid = t.oid AND t.relkind = 'r' and t.relname = 'accounts' GROUP BY i.relname, ix.indexrelid, ix.indisprimary, ix.indisunique, ix.indkey ORDER BY i.relname;
    Executing (default): INSERT INTO "accounts" ("id","balance","createdAt","updatedAt") VALUES (1,1000,'2022-03-30 19:56:34.483 +00:00','2022-03-30 19:56:34.483 +00:00'),(2,250,'2022-03-30 19:56:34.483 +00:00','2022-03-30 19:56:34.483 +00:00') RETURNING "id","balance","createdAt","updatedAt";
    Executing (default): SELECT "id", "balance", "createdAt", "updatedAt" FROM "accounts" AS "accounts";
    1 1000
    2 250
    ~~~

## What's next?

Read more about using the [Sequelize ORM](https://sequelize.org/), or check out a more realistic implementation of Sequelize with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
