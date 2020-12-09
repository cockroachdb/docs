---
title: Build a Python App with CockroachDB and PonyORM
summary: Learn how to use CockroachDB from a simple Python application with PonyORM.
toc: true
twitter: false
---

<div class="filters clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button class="filter-button page-level"><strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button class="filter-button page-level"><strong>SQLAlchemy</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-django.html"><button class="filter-button page-level"><strong>Django</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-pony.html"><button class="filter-button page-level current"><strong>PonyORM</strong></button></a>
    <a href="http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database"><button class="filter-button page-level"><strong>peewee</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB and [PonyORM](https://ponyorm.org/).

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

{{site.data.alerts.callout_info}}
The example code on this page uses Python 3.
{{site.data.alerts.end}}


## Step 1. Install PonyORM

To install PonyORM run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ python -m pip install pony
~~~

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/create-maxroach-user-and-bank-database.md %}

## Step 3. Generate a certificate for the `maxroach` user

Create a client certificate and key for the `maxroach` user by running the following command. The code samples will run as this user.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client maxroach --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

## Step 4. Run the Python code

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Python code

</section>

The code below uses PonyORM to map Python objects and methods to SQL operations. When you run the code as a script, it performs the following operations:

1. Reads existing account IDs from the `bank` database.
2. Creates additional accounts with randomly generated IDs, and then adds a bit of money to each new account.
3. Chooses two accounts at random and takes half of the money from the first account and deposits it into the second.

<section class="filter-content" markdown="1" data-scope="secure">

Copy the code below to a file or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/pony-basic-sample.py">download it directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/pony-basic-sample.py %}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

Copy the code below to a file or
<a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/insecure/pony-basic-sample.py">download it directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/insecure/pony-basic-sample.py %}
~~~

</section>

Run the code:

{% include copy-clipboard.html %}
~~~ shell
$ python pony-basic-sample.py
~~~

To verify that the table and rows were created successfully, open a new terminal, and start a new session with the built-in SQL client:

<section class="filter-content" markdown="1" data-scope="secure">

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --database=bank
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --database=bank
~~~

</section>

Issue the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT COUNT(*) FROM accounts;
~~~

~~~
 count
-------
   100
(1 row)
~~~

## Best practices

Pony ORM provides the [retry option](transactions.html#client-side-intervention) for the `db_session` decorator. If Pony detects that the optimistic checks do not pass, it restarts the decorated function automatically.
The `retry` parameter can only be specified in the `db_session` decorator and not the context manager. For more information, see [PonyORM documentation](https://docs.ponyorm.org/api_reference.html?highlight=retry#transactions-db-session).
