---
title: Build a Node.js App with CockroachDB and Sequelize
summary: Learn how to use CockroachDB from a simple Node.js application with the Sequelize ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-nodejs-app-with-cockroachdb.html"><button class="filter-button">Use <strong>pg</strong></button></a>
    <a href="build-a-nodejs-app-with-cockroachdb-sequelize.html"><button class="filter-button current">Use <strong>Sequelize</strong></button></a>
</div>

This tutorial shows you how build a simple Node.js application with CockroachDB and the Sequelize ORM.

We have tested the [Sequelize ORM](https://sequelize.readthedocs.io/en/v3/) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_success}}
For a more realistic use of Sequelize with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms)repository.
{{site.data.alerts.end}}

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the Sequelize ORM

To install Sequelize, as well as a [CockroachDB Node.js package](https://github.com/cockroachdb/sequelize-cockroachdb) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ npm install sequelize sequelize-cockroachdb
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Node.js code

The following code uses the [Sequelize](https://sequelize.readthedocs.io/en/v3/) ORM to map Node.js-specific objects to SQL operations. Specifically, `Account.sync({force: true})` creates an `accounts` table based on the Account model (or drops and recreates the table if it already exists), `Account.bulkCreate([...])` inserts rows into the table, and `Account.findAll()` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/sequelize-basic-sample.js" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ js
{% include {{ page.version.version }}/app/sequelize-basic-sample.js %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ node sequelize-basic-sample.js
~~~

The output should be:

~~~ shell
1 1000
2 250
~~~

To verify that funds were transferred from one account to another, start the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=/tmp/certs -e 'SELECT id, balance FROM accounts' --database=bank
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

</section>

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Node.js code

The following code uses the [Sequelize](https://sequelize.readthedocs.io/en/v3/) ORM to map Node.js-specific objects to SQL operations. Specifically, `Account.sync({force: true})` creates an `accounts` table based on the Account model (or drops and recreates the table if it already exists), `Account.bulkCreate([...])` inserts rows into the table, and `Account.findAll()` selects from the table so that balances can be printed.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/app/insecure/sequelize-basic-sample.js" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ js
{% include {{ page.version.version }}/app/insecure/sequelize-basic-sample.js %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ node sequelize-basic-sample.js
~~~

The output should be:

~~~ shell
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SHOW TABLES' --database=bank
~~~

~~~
+------------+
| table_name |
+------------+
| accounts   |
+------------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e 'SELECT id, balance FROM accounts' --database=bank
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

</section>

## What's next?

Read more about using the [Sequelize ORM](https://sequelize.readthedocs.io/en/v3/), or check out a more realistic implementation of Sequelize with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
