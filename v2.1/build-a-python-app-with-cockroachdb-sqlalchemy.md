---
title: Build a Python App with CockroachDB
summary: Learn how to use CockroachDB from a simple Python application with the SQLAlchemy ORM.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button style="width: 28%" class="filter-button current">Use <strong>SQLAlchemy</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Python psycopg2 driver](http://initd.org/psycopg/docs/) and the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_success}}
For a more realistic use of SQLAlchemy with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Before you begin

1. [Install CockroachDB](install-cockroachdb.html).
2. Start up a [secure](secure-a-cluster.html) or [insecure](start-a-local-cluster.html) local cluster.
3. Choose the instructions that correspond to whether your cluster is secure or insecure:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="secure">Secure</button>
  <button class="filter-button" data-scope="insecure">Insecure</button>
</div>

## Step 1. Install the SQLAlchemy ORM

To install SQLAlchemy, as well as a [CockroachDB Python package](https://github.com/cockroachdb/cockroachdb-python) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ pip install sqlalchemy cockroachdb
~~~

For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

## Step 2. Create the `maxroach` user and `bank` database

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO maxroach;
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command.  The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ sh
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=certs/ca.key
~~~

## Step 3. Run the Python code

The following code uses the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) to map Python-specific objects to SQL operations. Specifically, `Base.metadata.create_all(engine)` creates an `accounts` table based on the Account class, `session.add_all([Account(),...
])` inserts rows into the table, and `session.query(Account)` selects from the table so that balances can be printed.

{{site.data.alerts.callout_info}}
The <a href="https://github.com/cockroachdb/cockroachdb-python">cockroachdb python package</a> installed earlier is triggered by the <code>cockroachdb://</code> prefix in the engine URL. Using <code>postgres://</code> to connect to your cluster will not work.
{{site.data.alerts.end}}

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/sqlalchemy-basic-sample.py" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include v2.1/app/sqlalchemy-basic-sample.py %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ python sqlalchemy-basic-sample.py
~~~

The output should be:

~~~ shell
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ sql
> USE bank;
> SHOW TABLES;
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
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

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 3. Run the Python code

The following code uses the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) to map Python-specific objects to SQL operations. Specifically, `Base.metadata.create_all(engine)` creates an `accounts` table based on the Account class, `session.add_all([Account(),...
])` inserts rows into the table, and `session.query(Account)` selects from the table so that balances can be printed.

{{site.data.alerts.callout_info}}
The <a href="https://github.com/cockroachdb/cockroachdb-python">cockroachdb python package</a> installed earlier is triggered by the <code>cockroachdb://</code> prefix in the engine URL. Using <code>postgres://</code> to connect to your cluster will not work.
{{site.data.alerts.end}}

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/app/insecure/sqlalchemy-basic-sample.py" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include v2.1/app/insecure/sqlalchemy-basic-sample.py %}
~~~

Then run the code:

{% include copy-clipboard.html %}
~~~ shell
$ python sqlalchemy-basic-sample.py
~~~

The output should be:

~~~ shell
1 1000
2 250
~~~

To verify that the table and rows were created successfully, you can again use the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ sql
> USE bank;
> SHOW TABLES;
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts;
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

Read more about using the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/), or check out a more realistic implementation of SQLAlchemy with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include v2.1/app/see-also-links.md %}
