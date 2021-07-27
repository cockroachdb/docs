---
title: Build a Simple CRUD Python App with CockroachDB and SQLAlchemy
summary: Learn how to use CockroachDB from a simple Python application with SQLAlchemy.
toc: true
twitter: false
referral_id: docs_hello_world_python_sqlalchemy
---

<div class="filters clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button class="filter-button page-level"><strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button class="filter-button page-level current"><strong>SQLAlchemy</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-django.html"><button class="filter-button page-level"><strong>Django</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-pony.html"><button class="filter-button page-level"><strong>PonyORM</strong></button></a>
    <a href="http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database"><button class="filter-button page-level"><strong>peewee</strong></button></a>
</div>

{% include cockroach_u_pydev.md %}

This tutorial shows you how build a simple CRUD Python application with CockroachDB and the [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) ORM.

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

## Step 2. Start CockroachDB

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="cockroachcloud">Use CockroachCloud</button>
  <button class="filter-button page-level" data-scope="local">Use a Local Cluster</button>
</div>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Create a free cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

### Set up your cluster connection

1. Navigate to the cluster's **SQL Users** page, and create a new user, with a new password.

1. Navigate to the **Cluster Overview page**, select **Connect**, and, under the **Connection String** tab, download the cluster certificate.

1. Take note of the connection string provided. You'll use it to connect to the database later in this tutorial.

</section>

<section class="filter-content" markdown="1" data-scope="local">

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. Run the [`cockroach demo`](cockroach-demo.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach demo \
    --empty
    ~~~

    This starts a temporary, in-memory cluster and opens an interactive SQL shell to the cluster. Any changes to the database will not persist after the cluster is stopped.
1. Take note of the `(sql/tcp)` connection string in the SQL shell welcome text:

    ~~~
    # Connection parameters:
    #   (console) http://127.0.0.1:49584
    #   (sql)     postgres://root:admin@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo180485299&port=26257
    #   (sql/tcp) postgres://root:admin@127.0.0.1:49586?sslmode=require
    ~~~

    You'll use this connection string to connect to the database later in this tutorial.

</section>

## Step 3. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-python-sqlalchemy/
~~~

The project has the following directory structure:

~~~
├── README.md
├── dbinit.sql
├── main.py
└── models.py
~~~

The `dbinit.sql` file initializes the database schema that the application uses:

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-sqlalchemy/master/dbinit.sql %}
~~~

The `models.py` uses SQLAlchemy to map the `Accounts` table to a Python object:

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-sqlalchemy/master/models.py %}
~~~

The `main.py` uses SQLAlchemy to map Python methods to SQL operations:

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-sqlalchemy/master/main.py %}
~~~

`main.py` also executes the `main` method of the program.

## Step 4. Run the code

To run the app, pass the connection string for your cluster to `main.py`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python3 main.py '<connection_string>'
~~~

<section class="filter-content" markdown="1" data-scope="local">

Where `<connection_string>` is the `(sql/tcp)` connection URL provided in the demo cluster's SQL shell welcome text.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Where `<connection_string>` is the connection string provided in the **Connection info** window of the CockroachCloud Console.

Note that you need to provide a SQL user password in order to securely connect to a CockroachCloud cluster. The connection string should have a placeholder for the password (`<ENTER-PASSWORD>`).

</section>

The application will format the connection string to fit the CockroachDB SQLAlchemy dialect requirements. It will then initialize the database with the DDL SQL statements in the `dbinit.sql`. After the table is initialized, the app performs some simple row inserts, updates, and deletes.

The output should look something like the following:

~~~
Initializing the bank database...
SET

Time: 0ms

DROP DATABASE

Time: 29ms

CREATE DATABASE

Time: 7ms

SET

Time: 7ms

CREATE TABLE

Time: 3ms

Database initialized.
Creating new accounts...
Created new account with id 3a8b74c8-6a05-4247-9c60-24b46e3a88fd and balance 248835.
Created new account with id c3985926-5b77-4c6d-a73d-7c0d4b2a51e7 and balance 781972.
...
Created new account with id 7b41386c-11d3-465e-a2a0-56e0dcd2e7db and balance 984387.
Random account balances:
Account 7ad14d02-217f-48ca-a53c-2c3a2528a0d9: 800795
Account 4040aeba-7194-4f29-b8e5-a27ed4c7a297: 149861
Transferring 400397 from account 7ad14d02-217f-48ca-a53c-2c3a2528a0d9 to account 4040aeba-7194-4f29-b8e5-a27ed4c7a297...
Transfer complete.
New balances:
Account 7ad14d02-217f-48ca-a53c-2c3a2528a0d9: 400398
Account 4040aeba-7194-4f29-b8e5-a27ed4c7a297: 550258
Deleting existing accounts...
Deleted account 41247e24-6210-4032-b622-c10b3c7222de.
Deleted account 502450e4-6daa-4ced-869c-4dff62dc52de.
Deleted account 6ff06ef0-423a-4b08-8b87-48af2221bc18.
Deleted account a1acb134-950c-4882-9ac7-6d6fbdaaaee1.
Deleted account e4f33c55-7230-4080-b5ac-5dde8a7ae41d.
~~~

In a SQL shell connected to the cluster, you can verify that the rows were inserted, updated, and deleted successfully:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT COUNT(*) FROM bank.accounts;
~~~

~~~
  count
---------
     95
(1 row)
~~~

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
{% include {{page.version.version}}/app/python/sqlalchemy/sqlalchemy-large-txns.py %}
~~~

### Use `IMPORT` to read in large data sets

If you are trying to get a large data set into CockroachDB all at once (a bulk import), avoid writing client-side code that uses an ORM and use the [`IMPORT`](import.html) statement instead. It is much faster and more efficient than making a series of [`INSERT`s](insert.html) and [`UPDATE`s](update.html) such as are generated by calls to [`session.bulk_save_objects()`](https://docs.sqlalchemy.org/en/latest/orm/session_api.html?highlight=bulk_save_object#sqlalchemy.orm.session.Session.bulk_save_objects).

For more information about importing data from Postgres, see [Migrate from Postgres](migrate-from-postgres.html).

For more information about importing data from MySQL, see [Migrate from MySQL](migrate-from-mysql.html).

### Prefer the query builder

In general, we recommend using the query-builder APIs of SQLAlchemy (e.g., [`Engine.execute()`](https://docs.sqlalchemy.org/en/latest/core/connections.html?highlight=execute#sqlalchemy.engine.Engine.execute)) in your application over the [Session][session]/ORM APIs if at all possible. That way, you know exactly what SQL is being generated and sent to CockroachDB, which has the following benefits:

- It's easier to debug your SQL queries and make sure they are working as expected.
- You can more easily tune SQL query performance by issuing different statements, creating and/or using different indexes, etc. For more information, see [SQL Performance Best Practices](performance-best-practices-overview.html).

### Joins without foreign keys

SQLAlchemy relies on the existence of [foreign keys](foreign-key.html) to generate [`JOIN` expressions](joins.html) from your application code. If you remove foreign keys from your schema, SQLAlchemy will not generate joins for you. As a workaround, you can [create a "custom foreign condition" by adding a `relationship` field to your table objects](https://stackoverflow.com/questions/37806625/sqlalchemy-create-relations-but-without-foreign-key-constraint-in-db), or do the equivalent work in your application.

## See also

- The [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) docs
- [Transactions](transactions.html)

{% include {{page.version.version}}/app/see-also-links.md %}

<!-- Reference Links -->

[session.flush]: https://docs.sqlalchemy.org/en/latest/orm/session_api.html#sqlalchemy.orm.session.Session.flush
[session]: https://docs.sqlalchemy.org/en/latest/orm/session.html
