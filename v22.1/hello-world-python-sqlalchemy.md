---
title: Build a Hello World App with CockroachDB and SQLAlchemy
summary: Learn how to use CockroachDB from a Hello World Python application with SQLAlchemy.
toc: true
twitter: false
referral_id: docs_hello_world_python_sqlalchemy
docs_area: get_started
---

This tutorial shows you how build a simple Hello World Python application with CockroachDB and the [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) ORM.

## Step 1. Install SQLAlchemy

To install SQLAlchemy, as well as a [CockroachDB Python package](https://github.com/cockroachdb/sqlalchemy-cockroachdb) that accounts for some differences between CockroachDB and PostgreSQL, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ pip install sqlalchemy sqlalchemy-cockroachdb psycopg2
~~~

{{site.data.alerts.callout_success}}
You can substitute psycopg2 for other alternatives that include the psycopg python package.
{{site.data.alerts.end}}

For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

## Step 2. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 3. Get the code

Clone the code's GitHub repo:

{% include copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-python-sqlalchemy/
~~~

The `main.py` file contains all of the code for the sample Hello World app:

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-python-sqlalchemy/main/main.py %}
~~~

The `main` method of this program does the following:

1. Attempts to connect to a running cluster, given a connection string.
2. Prints a message to the terminal about the connection status.

## Step 4. Run the code

To run the app:

{% include copy-clipboard.html %}
~~~ shell
$ python3 main.py
~~~

The terminal will prompt you for a connection string.

<section class="filter-content" markdown="1" data-scope="local">

Copy and paste the connection string provided in the `(sql)` connection string from SQL shell welcome text, and replace the `postgres` prefix with `cockroachdb`.

For example:

~~~
Enter your node's connection string:
cockroachdb://demo:demo4276@127.0.0.1:26257?sslmode=require
~~~

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Copy and paste the connection string from the {{ site.data.products.db }} Console, and replace the `postgres` prefix with `cockroachdb`. Make sure that the right username, password, and certificate are specified as well.

For example:

~~~
Enter your node's connection string:
cockroachdb://<username>:<password>@<globalhost>:26257/<routing-id>.bank?sslmode=verify-full&sslrootcert=<certs_directory>/cc-ca.crt
~~~

Where you update the connection string as follows:

- Replace `<username>` and `<password>` with a SQL username and password.
- Replace `<globalhost>` with the name of the {{ site.data.products.serverless }} host (e.g., `free-tier.gcp-us-central1.cockroachlabs.cloud`).
- Replace `<routing-id>` with your cluster's routing ID (e.g., `funky-skunk-123`). The routing ID identifies your tenant cluster on a [multi-tenant host](../cockroachcloud/architecture.html#architecture).
- Replace `<certs_directory>` with the path to the `cc-ca.crt` file that you downloaded from the {{ site.data.products.db }} Console.

</section>

{{site.data.alerts.callout_success}}
You must use the `cockroachdb://` prefix in the URL passed to `sqlalchemy.create_engine` to make sure the CockroachDB dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
{{site.data.alerts.end}}

After entering the connection string, the program will execute.

The output should look like this:

~~~
Hey! You successfully connected to your CockroachDB cluster.
~~~


## See also

- [Build a Simple CRUD Python App with CockroachDB and SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html)
- The [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/) docs
- [Transactions](transactions.html)

{% include {{page.version.version}}/app/see-also-links.md %}

<!-- Reference Links -->

[session.flush]: https://docs.sqlalchemy.org/en/latest/orm/session_api.html#sqlalchemy.orm.session.Session.flush
[session]: https://docs.sqlalchemy.org/en/latest/orm/session.html
