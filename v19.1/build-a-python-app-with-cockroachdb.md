---
title: Build a Python App with CockroachDB
summary: Learn how to use CockroachDB from a simple Python application with the psycopg2 driver.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button current">Use <strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button style="width: 28%" class="filter-button">Use <strong>SQLAlchemy</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB using a PostgreSQL-compatible driver or ORM.

We have tested the [Python psycopg2 driver](http://initd.org/psycopg/docs/) and the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) enough to claim **beta-level** support, so those are featured here. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install the psycopg2 driver

To install the Python psycopg2 driver, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install psycopg2
~~~

For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

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

Now that you have a database and a user, you'll run the code shown below to:

- Create an `accounts` table and insert some rows.
- Transfer funds between two accounts inside a [transaction](transactions.html). To ensure that we [handle transaction retry errors](transactions.html#client-side-intervention), we write an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another retry error, it sleeps for a longer interval, implementing [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff).
- Finally, we delete the accounts from the table before exiting so we can re-run the example code.

{{site.data.alerts.callout_success}}
To clone a version of the code below that connects to insecure clusters, run the command below. Note that you will need to edit the connection string to use the certificates that you generated when you set up your secure cluster.

`git clone https://github.com/cockroachlabs/hello-world-python-psycopg2/`
{{site.data.alerts.end}}

Copy the code or <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v19.1/app/basic-sample.py" download>download it directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/basic-sample.py %}
~~~

Then run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python basic-sample.py
~~~

The output should show the account balances before and after the funds transfer:

~~~
Balances at Wed Aug  7 12:11:23 2019
['1', '1000']
['2', '250']
Balances at Wed Aug  7 12:11:23 2019
['1', '900']
['2', '350']
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `maxroach` user and `bank` database

{% include {{page.version.version}}/app/insecure/create-maxroach-user-and-bank-database.md %}

## Step 3. Run the Python code

Now that you have a database and a user, you'll run the code shown below to:

- Create an `accounts` table and insert some rows.
- Transfer funds between two accounts inside a [transaction](transactions.html). To ensure that we [handle transaction retry errors](transactions.html#client-side-intervention), we write an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another retry error, it sleeps for a longer interval, implementing [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff).
- Finally, we delete the accounts from the table before exiting so we can re-run the example code.

To get the code below, clone the `hello-world-python-psycopg2` repo to your machine:

{% include_cached copy-clipboard.html %}
~~~ shell
git clone https://github.com/cockroachlabs/hello-world-python-psycopg2/
~~~

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/insecure/basic-sample.py %}
~~~

Change to the directory where you cloned the repo and run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python example.py
~~~

The output should show the account balances before and after the funds transfer:

~~~
Balances at Wed Jul 24 15:58:40 2019
['1', '1000']
['2', '250']
Balances at Wed Jul 24 15:58:40 2019
['1', '900']
['2', '350']
~~~

</section>

## What's next?

Read more about using the [Python psycopg2 driver](http://initd.org/psycopg/docs/).

{% include {{page.version.version}}/app/see-also-links.md %}
