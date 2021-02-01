---
title: Build a Python App with CockroachDB and psycopg2
summary: Learn how to use CockroachDB from a simple Python application with the psycopg2 driver.
toc: true
twitter: false
---

<div class="filters clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button class="filter-button page-level current"><strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button class="filter-button page-level"><strong>SQLAlchemy</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-django.html"><button class="filter-button page-level"><strong>Django</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-pony.html"><button class="filter-button page-level"><strong>PonyORM</strong></button></a>
    <a href="http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database"><button class="filter-button page-level"><strong>peewee</strong></button></a>
</div>

{% include cockroach_u_pydev.md %}

This tutorial shows you how build a simple Python application with CockroachDB and the psycopg2 driver. For the CockroachDB back-end, you'll use a temporary local cluster.

<div class=" clearfix">
  <a class="btn btn-outline-primary" href="../tutorials/build-a-python-app-with-cockroachdb-interactive.html" target="_blank">Run this in your browser &rarr;</a>
</div>

## Step 1. Install the psycopg2 driver

To install the Python psycopg2 driver, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ pip install psycopg2-binary
~~~

For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

## Step 2. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 3. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 4. Run the Python code

Now that you have a database, you'll run the code shown below to:

- Create an accounts table and insert some rows.
- Transfer funds between two accounts inside a [transaction](transactions.html).
- Delete the accounts from the table before exiting so you can re-run the example code.

To [handle transaction retry errors](error-handling-and-troubleshooting.html#transaction-retry-errors), the code uses an application-level retry loop that, in case of error, sleeps before trying the funds transfer again. If it encounters another retry error, it sleeps for a longer interval, implementing [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff).

### Get the code

Download the [`example.py`](https://raw.githubusercontent.com/cockroachlabs/hello-world-python-psycopg2/master/example.py) file, or create the file yourself and copy the code into it.

If you prefer, you can also clone a version of the code:

{% include copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-python-psycopg2/
~~~

{% include copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-python-psycopg2/master/example.py %}
~~~

### Run the code

The Python code is a command-line utility that accepts the connection string to CockroachDB as a command-line argument:

<section class="filter-content" markdown="1" data-scope="local">

{% include copy-clipboard.html %}
~~~ shell
$ python3 example.py \
"postgresql://<username>:<password>@<hostname>:<port>/bank?sslmode=require"
~~~

Before running the command, update the connection string as follows:

- Replace `<username>` and `<password>` with the SQL username and password that you created earlier.
- Replace `<hostname>` and `<port>` with the hostname and port in the `(sql/tcp)` connection string from SQL shell welcome text.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% include copy-clipboard.html %}
~~~ shell
$ python3 example.py \
"postgres://<username>:<password>@<globalhost>:26257/<cluster-name>.bank?sslmode=verify-full&sslrootcert=<certs_directory>/cc-ca.crt"
~~~

Before running the command, update the connection string that you copied [earlier](#set-up-your-cluster-connection) from the **Connection info** dialog as follows:

- Replace `<username>` and `<password>` with the SQL username and password that you created earlier.
- Replace `<globalhost>` with the name of the CockroachCloud Free (beta) host (e.g., `free-tier.gcp-us-central1.cockroachlabs.cloud`).
- Replace `<cluster-name>` with the name of your cluster.
- Replace `<certs_directory>` with the path to the `cc-ca.crt` file that you downloaded from the CockroachCloud Console.

{{site.data.alerts.callout_info}}
If you are using the connection string that you [copied from the **Connection info** dialog](#set-up-your-cluster-connection), your username, password, and cluster name will be pre-populated.
{{site.data.alerts.end}}

</section>

The output should show the account balances before and after the funds transfer:

~~~
Balances at Fri Oct 30 18:27:00 2020:
(1, 1000)
(2, 250)
Balances at Fri Oct 30 18:27:00 2020:
(1, 900)
(2, 350)
~~~

## What's next?

Read more about using the [Python psycopg2 driver](http://initd.org/psycopg/docs/).

{% include {{page.version.version}}/app/see-also-links.md %}
