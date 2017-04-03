---
title: Build a Node.js App with CockroachDB
summary: Learn how to use CockroachDB from a simple Node.js application with the Sequelize ORM.
toc: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button">Use <strong>pg</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button current">Use <strong>Sequelize</strong></button></a>
</div>

This tutorial shows you how build a simple Node.js application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Node.js pg driver](https://www.npmjs.com/package/pg) and the [Sequelize ORM](http://docs.sequelizejs.com/en/v3/), so those are featured here.

{{site.data.alerts.callout_success}}For a more realistic use of Sequelize with CockroachDB, see our <a href="https://github.com/cockroachdb/examples-orms"><code>examples-orms</code></a> repository.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the Sequelize ORM

To install Sequelize, as well as a [CockroachDB Node.js package](https://github.com/cockroachdb/sequelize-cockroachdb) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

~~~ shell
$ npm install sequelize sequelize-cockroachdb
~~~

{% include app/common-steps.md %}

## Step 5. Run the Node.js code

The following code uses the [Sequelize](http://docs.sequelizejs.com/en/v3/) ORM to map Node.js-specific objects to SQL operations. Specifically, `Account.sync({force: true})` creates an `accounts` table based on the Account model (or drops and recreates the table if it already exists), `Account.bulkCreate([...])` inserts rows into the table, and `Account.findAll()` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/gh-pages/_includes/app/sequelize-basic-sample.js" download>download it directly</a>.

~~~ js
{% include app/sequelize-basic-sample.js %}
~~~

Then run the code:

~~~ shell
$ node sequelize-basic-sample.js
~~~

The output should be:

~~~ shell
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

~~~ shell
$ cockroach sql -e 'SHOW TABLES' --database=bank
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

~~~ shell
$ cockroach sql -e 'SELECT id, balance FROM accounts' --database=bank
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |    1000 |
|  2 |     250 |
+----+---------+
(2 rows)
~~~

## What's Next?

Read more about using the [Sequelize ORM](http://docs.sequelizejs.com/en/v3/), or check out a more realistic implementation of Sequelize with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
