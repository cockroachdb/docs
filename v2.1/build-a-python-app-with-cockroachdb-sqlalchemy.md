---
title: Build a Python App with CockroachDB
summary: Learn how to use CockroachDB from a simple Python application with SQLAlchemy.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button style="width: 28%" class="filter-button current">Use <strong>SQLAlchemy</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB using [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/).

We have tested the [psycopg2 driver](http://initd.org/psycopg/docs/) and [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) enough to claim **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

{{site.data.alerts.callout_danger}}
**Upgrading from CockroachDB 2.0 to 2.1?** If you used SQLAlchemy with your 2.0 cluster, you must [upgrade the adapter to the latest release](https://github.com/cockroachdb/sqlalchemy-cockroachdb) before upgrading to CockroachDB 2.1.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
The example code on this page uses Python 3.
{{site.data.alerts.end}}

## Step 1. Install SQLAlchemy

To install SQLAlchemy, as well as a [CockroachDB Python package](https://github.com/cockroachdb/sqlalchemy-cockroachdb) that accounts for some differences between CockroachDB and PostgreSQL, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install sqlalchemy sqlalchemy-cockroachdb psycopg2
~~~

{{site.data.alerts.callout_success}}
You can substitute psycopg2 for other alternatives that include the psycopg python package.
{{site.data.alerts.end}}

For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Python code

The code below uses [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) to map Python objects and methods to SQL operations.

You can run this script as many times as you want; on each run, the script will create some new accounts and shuffle money around between randomly selected accounts.

Specifically, the script:

1. Reads in existing account IDs (if any) from the `bank` database.
2. Creates additional accounts with randomly generated IDs. Then, it adds a bit of money to each new account.
3. Chooses two accounts at random and takes half of the money from the first and deposits it into the second.

It does all of the above using the practices we recommend for using SQLAlchemy with CockroachDB, which are listed in the [Best practices](#best-practices) section below.

{{site.data.alerts.callout_info}}
You must use the `cockroachdb://` prefix in the URL passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb) dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
{{site.data.alerts.end}}

Copy the code below or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/sqlalchemy-basic-sample.py">download it directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/sqlalchemy-basic-sample.py %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python3 sqlalchemy-basic-sample.py
~~~

The output should look something like the following:

~~~ shell
2018-12-06 15:59:58,999 INFO sqlalchemy.engine.base.Engine select current_schema()
2018-12-06 15:59:58,999 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine SELECT CAST('test plain returns' AS VARCHAR(60)) AS anon_1
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine SELECT CAST('test unicode returns' AS VARCHAR(60)) AS anon_1
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,002 INFO sqlalchemy.engine.base.Engine select version()
2018-12-06 15:59:59,002 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,003 INFO sqlalchemy.engine.base.Engine SELECT table_name FROM information_schema.tables WHERE table_schema=%s
2018-12-06 15:59:59,004 INFO sqlalchemy.engine.base.Engine ('public',)
2018-12-06 15:59:59,005 INFO sqlalchemy.engine.base.Engine SELECT id from accounts;
2018-12-06 15:59:59,005 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,008 INFO sqlalchemy.engine.base.Engine BEGIN (implicit)
2018-12-06 15:59:59,008 INFO sqlalchemy.engine.base.Engine SAVEPOINT cockroach_restart
2018-12-06 15:59:59,008 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,083 INFO sqlalchemy.engine.base.Engine INSERT INTO accounts (id, balance) VALUES (%(id)s, %(balance)s)
2018-12-06 15:59:59,083 INFO sqlalchemy.engine.base.Engine ({'id': 298865, 'balance': 208217}, {'id': 506738, 'balance': 962549}, {'id': 514698, 'balance': 986327}, {'id': 587747, 'balance': 210406}, {'id': 50148, 'balance': 347976}, {'id': 854295, 'balance': 420086}, {'id': 785757, 'balance': 364836}, {'id': 406247, 'balance': 787016}  ... displaying 10 of 100 total bound parameter sets ...  {'id': 591336, 'balance': 542066}, {'id': 33728, 'balance': 526531})
2018-12-06 15:59:59,201 INFO sqlalchemy.engine.base.Engine RELEASE SAVEPOINT cockroach_restart
2018-12-06 15:59:59,201 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,205 INFO sqlalchemy.engine.base.Engine COMMIT
2018-12-06 15:59:59,206 INFO sqlalchemy.engine.base.Engine BEGIN (implicit)
2018-12-06 15:59:59,206 INFO sqlalchemy.engine.base.Engine SAVEPOINT cockroach_restart
2018-12-06 15:59:59,206 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,207 INFO sqlalchemy.engine.base.Engine SELECT accounts.id AS accounts_id, accounts.balance AS accounts_balance
FROM accounts
WHERE accounts.id = %(id_1)s
2018-12-06 15:59:59,207 INFO sqlalchemy.engine.base.Engine {'id_1': 769626}
2018-12-06 15:59:59,209 INFO sqlalchemy.engine.base.Engine UPDATE accounts SET balance=%(balance)s WHERE accounts.id = %(accounts_id)s
2018-12-06 15:59:59,209 INFO sqlalchemy.engine.base.Engine {'balance': 470580, 'accounts_id': 769626}
2018-12-06 15:59:59,212 INFO sqlalchemy.engine.base.Engine UPDATE accounts SET balance=(accounts.balance + %(balance_1)s) WHERE accounts.id = %(id_1)s
2018-12-06 15:59:59,247 INFO sqlalchemy.engine.base.Engine {'balance_1': 470580, 'id_1': 158447}
2018-12-06 15:59:59,249 INFO sqlalchemy.engine.base.Engine RELEASE SAVEPOINT cockroach_restart
2018-12-06 15:59:59,250 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,251 INFO sqlalchemy.engine.base.Engine COMMIT
~~~

To verify that the table and rows were created successfully, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank
~~~

Then, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT COUNT(*) FROM accounts;
~~~

~~~
 count
-------
   100
(1 row)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Python code

The code below uses [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) to map Python objects and methods to SQL operations.

You can run this script as many times as you want; on each run, it will create some new accounts and shuffle money around between randomly selected accounts.

Specifically, it:

1. Reads in existing account IDs (if any) from the `bank` database.
2. Creates additional accounts with randomly generated IDs. Then, it adds a bit of money to each new account.
3. Chooses two accounts at random and takes half of the money from the first and deposits it into the second.

It does all of the above using the practices we recommend for using SQLAlchemy with CockroachDB, which are listed in the [Best practices](#best-practices) section below.

{{site.data.alerts.callout_info}}
You must use the `cockroachdb://` prefix in the URL passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb) dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
{{site.data.alerts.end}}

Copy the code below or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/sqlalchemy-basic-sample.py">download it directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/sqlalchemy-basic-sample.py %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python3 sqlalchemy-basic-sample.py
~~~

The output should look something like the following:

~~~ shell
2018-12-06 15:59:58,999 INFO sqlalchemy.engine.base.Engine select current_schema()
2018-12-06 15:59:58,999 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine SELECT CAST('test plain returns' AS VARCHAR(60)) AS anon_1
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine SELECT CAST('test unicode returns' AS VARCHAR(60)) AS anon_1
2018-12-06 15:59:59,001 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,002 INFO sqlalchemy.engine.base.Engine select version()
2018-12-06 15:59:59,002 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,003 INFO sqlalchemy.engine.base.Engine SELECT table_name FROM information_schema.tables WHERE table_schema=%s
2018-12-06 15:59:59,004 INFO sqlalchemy.engine.base.Engine ('public',)
2018-12-06 15:59:59,005 INFO sqlalchemy.engine.base.Engine SELECT id from accounts;
2018-12-06 15:59:59,005 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,008 INFO sqlalchemy.engine.base.Engine BEGIN (implicit)
2018-12-06 15:59:59,008 INFO sqlalchemy.engine.base.Engine SAVEPOINT cockroach_restart
2018-12-06 15:59:59,008 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,083 INFO sqlalchemy.engine.base.Engine INSERT INTO accounts (id, balance) VALUES (%(id)s, %(balance)s)
2018-12-06 15:59:59,083 INFO sqlalchemy.engine.base.Engine ({'id': 298865, 'balance': 208217}, {'id': 506738, 'balance': 962549}, {'id': 514698, 'balance': 986327}, {'id': 587747, 'balance': 210406}, {'id': 50148, 'balance': 347976}, {'id': 854295, 'balance': 420086}, {'id': 785757, 'balance': 364836}, {'id': 406247, 'balance': 787016}  ... displaying 10 of 100 total bound parameter sets ...  {'id': 591336, 'balance': 542066}, {'id': 33728, 'balance': 526531})
2018-12-06 15:59:59,201 INFO sqlalchemy.engine.base.Engine RELEASE SAVEPOINT cockroach_restart
2018-12-06 15:59:59,201 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,205 INFO sqlalchemy.engine.base.Engine COMMIT
2018-12-06 15:59:59,206 INFO sqlalchemy.engine.base.Engine BEGIN (implicit)
2018-12-06 15:59:59,206 INFO sqlalchemy.engine.base.Engine SAVEPOINT cockroach_restart
2018-12-06 15:59:59,206 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,207 INFO sqlalchemy.engine.base.Engine SELECT accounts.id AS accounts_id, accounts.balance AS accounts_balance
FROM accounts
WHERE accounts.id = %(id_1)s
2018-12-06 15:59:59,207 INFO sqlalchemy.engine.base.Engine {'id_1': 769626}
2018-12-06 15:59:59,209 INFO sqlalchemy.engine.base.Engine UPDATE accounts SET balance=%(balance)s WHERE accounts.id = %(accounts_id)s
2018-12-06 15:59:59,209 INFO sqlalchemy.engine.base.Engine {'balance': 470580, 'accounts_id': 769626}
2018-12-06 15:59:59,212 INFO sqlalchemy.engine.base.Engine UPDATE accounts SET balance=(accounts.balance + %(balance_1)s) WHERE accounts.id = %(id_1)s
2018-12-06 15:59:59,247 INFO sqlalchemy.engine.base.Engine {'balance_1': 470580, 'id_1': 158447}
2018-12-06 15:59:59,249 INFO sqlalchemy.engine.base.Engine RELEASE SAVEPOINT cockroach_restart
2018-12-06 15:59:59,250 INFO sqlalchemy.engine.base.Engine {}
2018-12-06 15:59:59,251 INFO sqlalchemy.engine.base.Engine COMMIT
~~~

To verify that the table and rows were created successfully, start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

Then, issue the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT COUNT(*) FROM accounts;
~~~

~~~
 count
-------
   100
(1 row)
~~~

</section>

## Best practices

### Use the `run_transaction` function

We strongly recommend using the [`sqlalchemy_cockroachdb.run_transaction()`](https://github.com/cockroachdb/sqlalchemy-cockroachdb/blob/master/sqlalchemy_cockroachdb/transaction.py) function as shown in the code samples on this page. This abstracts the details of [transaction retries](transactions.html#transaction-retries) away from your application code. Transaction retries are more frequent in CockroachDB than in some other databases because we use [optimistic concurrency control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) rather than locking. Because of this, a CockroachDB transaction may have to be tried more than once before it can commit. This is part of how we ensure that our transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level.

In addition to the above, using `run_transaction` has the following benefits:

- Because it must be passed a [sqlalchemy.orm.session.sessionmaker](https://docs.sqlalchemy.org/en/latest/orm/session_api.html#session-and-sessionmaker) object (*not* a [session][session]), it ensures that a new session is created exclusively for use by the callback, which protects you from accidentally reusing objects via any sessions created outside the transaction.
- It abstracts away the [client-side transaction retry logic](transactions.html#client-side-intervention) from your application, which keeps your application code portable across different databases. For example, the sample code given on this page works identically when run against Postgres (modulo changes to the prefix and port number in the connection string).


For more information about how transactions (and retries) work, see [Transactions](transactions.html).

### Avoid mutations of session and/or transaction state inside `run_transaction()`

In general, this is in line with the recommendations of the [SQLAlchemy FAQs](https://docs.sqlalchemy.org/en/latest/orm/session_basics.html#session-frequently-asked-questions), which state (with emphasis added by the original author) that

> As a general rule, the application should manage the lifecycle of the session *externally* to functions that deal with specific data. This is a fundamental separation of concerns which keeps data-specific operations agnostic of the context in which they access and manipulate that data.

and

> Keep the lifecycle of the session (and usually the transaction) **separate and external**.

In keeping with the above recommendations from the official docs, we **strongly recommend** avoiding any explicit mutations of the transaction state inside the callback passed to `run_transaction`, since that will lead to breakage. Specifically, do not make calls to the following functions from inside `run_transaction`:

- [`sqlalchemy.orm.Session.commit()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=commit#sqlalchemy.orm.session.Session.commit) (or other variants of `commit()`): This is not necessary because `cockroachdb.sqlalchemy.run_transaction` handles the savepoint/commit logic for you.
- [`sqlalchemy.orm.Session.rollback()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=rollback#sqlalchemy.orm.session.Session.rollback) (or other variants of `rollback()`): This is not necessary because `cockroachdb.sqlalchemy.run_transaction` handles the commit/rollback logic for you.
- [`Session.flush()`][session.flush]: This will not work as expected with CockroachDB because CockroachDB does not support nested transactions, which are necessary for `Session.flush()` to work properly. If the call to `Session.flush()` encounters an error and aborts, it will try to rollback. This will not be allowed by the currently-executing CockroachDB transaction created by `run_transaction()`, and will result in an error message like the following: `sqlalchemy.orm.exc.DetachedInstanceError: Instance <FooModel at 0x12345678> is not bound to a Session; attribute refresh operation cannot proceed (Background on this error at: http://sqlalche.me/e/bhk3)`.

### Break up large transactions into smaller units of work

If you see an error message like `transaction is too large to complete; try splitting into pieces`, you are trying to commit too much data in a single transaction. As described in our [Cluster Settings](cluster-settings.html) docs, the size limit for transactions is defined by the `kv.transaction.max_intents_bytes` setting, which defaults to 256 KiB. Although this setting can be changed by an admin, we strongly recommend against it in most cases.

Instead, we recommend breaking your transaction into smaller units of work (or "chunks"). A pattern that works for inserting large numbers of objects using `run_transaction` to handle retries automatically for you is shown below.

~~~ python
{% include {{page.version.version}}/app/sqlalchemy-large-txns.py %}
~~~

### Use `IMPORT` to read in large data sets

If you are trying to get a large data set into CockroachDB all at once (a bulk import), avoid writing client-side code that uses an ORM and use the [`IMPORT`](import.html) statement instead. It is much faster and more efficient than making a series of [`INSERT`s](insert.html) and [`UPDATE`s](update.html) such as are generated by calls to [`session.bulk_save_objects()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=bulk_save_object#sqlalchemy.orm.session.Session.bulk_save_objects).

For more information about importing data from Postgres, see [Migrate from Postgres](migrate-from-postgres.html).

For more information about importing data from MySQL, see [Migrate from MySQL](migrate-from-mysql.html).

### Prefer the query builder

In general, we recommend using the query-builder APIs of SQLAlchemy (e.g., [`Engine.execute()`](https://docs.sqlalchemy.org/en/latest/core/connections.html?highlight=execute#sqlalchemy.engine.Engine.execute)) in your application over the [Session][session]/ORM APIs if at all possible. That way, you know exactly what SQL is being generated and sent to CockroachDB, which has the following benefits:

- It's easier to debug your SQL queries and make sure they are working as expected.
- You can more easily tune SQL query performance by issuing different statements, creating and/or using different indexes, etc. For more information, see [SQL Performance Best Practices](performance-best-practices-overview.html).

## See also

- The [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) docs
- [Transactions](transactions.html)

{% include {{page.version.version}}/app/see-also-links.md %}

<!-- Reference Links -->

[session.flush]: https://docs.sqlalchemy.org/en/latest/orm/session_api.html#sqlalchemy.orm.session.Session.flush
[session]: https://docs.sqlalchemy.org/en/latest/orm/session.html
