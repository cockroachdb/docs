---
title: Build a Python App with CockroachDB
summary: Learn how to use CockroachDB from a simple Python application with the SQLAlchemy ORM.
toc: false
twitter: true
---

<div class="filters filters-big clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button style="width: 28%" class="filter-button current">Use <strong>SQLAlchemy</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB using a PostgreSQL-compatible driver or ORM. We've tested and can recommend the [Python psycopg2 driver](http://initd.org/psycopg/docs/) and the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/), so those are featured here.

{{site.data.alerts.callout_success}}For a more realistic use of SQLAlchemy with CockroachDB, see our <a href="https://github.com/cockroachdb/examples-orms"><code>examples-orms</code></a> repository.{{site.data.alerts.end}}

<div id="toc"></div>

## Before You Begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Install the SQLAlchemy ORM

To install SQLAlchemy, as well as a [CockroachDB Python package](https://github.com/cockroachdb/cockroachdb-python) that accounts for some minor differences between CockroachDB and PostgreSQL, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ pip install sqlalchemy cockroachdb
~~~

For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

{% include app/common-steps.md %}

## Step 5. Run the Python code

The following code uses the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) to map Python-specific objects to SQL operations. Specifically, `Base.metadata.create_all(engine)` creates an `accounts` table based on the Account class, `session.add_all([Account(),...
])` inserts rows into the table, and `session.query(Account)` selects from the table so that balances can be printed. Also note that the [cockroachdb python package](https://github.com/cockroachdb/cockroachdb-python) installed earlier is triggered by the `cockroachdb://` prefix in the engine URL.

Copy the code or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/app/sqlalchemy-basic-sample.py" download>download it directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include app/sqlalchemy-basic-sample.py %}
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
~~~ shell
$ cockroach sql --insecure -e 'SHOW TABLES' --database=bank
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

## What's Next?

Read more about using the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/), or check out a more realistic implementation of SQLAlchemy with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

You might also be interested in using a local cluster to explore the following core CockroachDB features:

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Automatic Cloud Migration](demo-automatic-cloud-migration.html)
