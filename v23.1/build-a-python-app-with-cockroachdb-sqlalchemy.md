---
title: Build a Simple CRUD Python App with CockroachDB and SQLAlchemy
summary: Learn how to use CockroachDB from a simple Python application with SQLAlchemy.
toc: true
twitter: false
referral_id: docs_python_sqlalchemy
docs_area: get_started
---

{% include {{ page.version.version }}/filter-tabs/crud-python.md %}

{% include cockroach_u_pydev.md %}

This tutorial shows you how build a simple CRUD Python application with CockroachDB and the [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) ORM.

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-certs.md %}

## Step 2. Get the code

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
├── models.py
└── requirements.txt
~~~

The `requirements.txt` file includes the required libraries to connect to CockroachDB with SQLAlchemy, including the [`sqlalchemy-cockroachdb` Python package](https://github.com/cockroachdb/sqlalchemy-cockroachdb), which accounts for some differences between CockroachDB and PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-sqlalchemy/master/requirements.txt %}
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

## Step 3. Install the application requirements

This tutorial uses [`virtualenv`](https://virtualenv.pypa.io) for dependency management.

1. Install `virtualenv`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pip install virtualenv
    ~~~

1. At the top level of the app's project directory, create and then activate a virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ virtualenv env
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ source env/bin/activate
    ~~~

1. Install the required modules to the virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pip install -r requirements.txt
    ~~~

## Step 4. Initialize the database

{% include {{ page.version.version }}/setup/init-bank-sample.md %}

## Step 5. Run the code

`main.py` uses the connection string saved to the `DATABASE_URL` environment variable to connect to your cluster and execute the code.

{{site.data.alerts.callout_info}}
The example application uses the general connection string, which begins with `postgresql://` but modifies it so it uses the `cockroachdb://` prefix. It does this so SQLAlchemy will use the CockroachDB SQLAlchemy adapter. 

{% include_cached copy-clipboard.html %}
~~~ python
db_uri = os.environ['DATABASE_URL'].replace("postgresql://", "cockroachdb://")
~~~
{{site.data.alerts.end}}

Run the app:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python main.py
~~~

The application will connect to CockroachDB, and then perform some simple row inserts, updates, and deletes.

The output should look something like the following:

~~~
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
> SELECT COUNT(*) FROM accounts;
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
- It abstracts away the [client-side transaction retry logic](transaction-retry-error-reference.html#client-side-retry-handling) from your application, which keeps your application code portable across different databases. For example, the sample code given on this page works identically when run against PostgreSQL (modulo changes to the prefix and port number in the connection string).

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

For more information about importing data from PostgreSQL, see [Migrate from PostgreSQL](migrate-from-postgres.html).

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
