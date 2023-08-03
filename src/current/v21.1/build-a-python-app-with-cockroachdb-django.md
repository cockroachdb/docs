---
title: Build a Python App with CockroachDB and Django
summary: Learn how to use CockroachDB from a simple Django application.
toc: true
twitter: false
referral_id: docs_hello_world_python_django
---

<div class="filters clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button class="filter-button page-level"><strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button class="filter-button page-level"><strong>SQLAlchemy</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-django.html"><button class="filter-button page-level current"><strong>Django</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-pony.html"><button class="filter-button page-level"><strong>PonyORM</strong></button></a>
    <a href="http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database"><button class="filter-button page-level"><strong>peewee</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB and the [Django](https://www.djangoproject.com/) framework.

CockroachDB supports Django versions 3.1+.

{{site.data.alerts.callout_info}}
The example code and instructions on this page use Python 3.9 and Django 3.1.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 2. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 3. Get the sample code

<section class="filter-content" markdown="1" data-scope="local">

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-python-django/
~~~

The project directory structure should look like this:

~~~
├── Dockerfile
├── README.md
├── cockroach_example
│   ├── cockroach_example
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── migrations
│   │   │   ├── 0001_initial.py
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── wsgi.py
│   └── manage.py
└── requirements.txt
~~~

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

1. Clone the code's GitHub repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ git clone https://github.com/cockroachlabs/example-app-python-django/
    ~~~

1. Create a new folder named `certs` at the top level of the `example-app-python-django` project, and then copy the root certificate that you downloaded for your cluster to the new folder.

    The project directory structure should look like this:

    ~~~
    ├── Dockerfile
    ├── README.md
    ├── certs
    │   └── root.crt
    ├── cockroach_example
    │   ├── cockroach_example
    │   │   ├── __init__.py
    │   │   ├── asgi.py
    │   │   ├── migrations
    │   │   │   ├── 0001_initial.py
    │   │   │   └── __init__.py
    │   │   ├── models.py
    │   │   ├── settings.py
    │   │   ├── urls.py
    │   │   ├── views.py
    │   │   └── wsgi.py
    │   └── manage.py
    └── requirements.txt
    ~~~

</section>

## Step 4. Install the application requirements

To use CockroachDB with Django, the following modules are required:

- [`django`](https://docs.djangoproject.com/en/3.1/topics/install/)
- [`psycopg2`](https://pypi.org/project/psycopg2/) (recommended for production environments) or [`psycopg2-binary`](https://pypi.org/project/psycopg2-binary/) (recommended for development and testing).
- [`django-cockroachdb`](https://github.com/cockroachdb/django-cockroachdb)

{{site.data.alerts.callout_info}}
The major version of `django-cockroachdb` must correspond to the major version of `django`. The minor release numbers do not need to match.
{{site.data.alerts.end}}

The `requirements.txt` file at the top level of the `example-app-python-django` project directory contains a list of the requirements needed to run this application:

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/requirements.txt %}
~~~

{{site.data.alerts.callout_info}}
The `requirements.txt` file also lists the `dj_database_url` module, which is not a strict requirement. The sample app uses this module to configure the database connection from a connection URL.
{{site.data.alerts.end}}

1. At the top level of the app's project directory, create and then activate a virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ virtualenv env
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ source env/bin/activate
    ~~~

1. Install the modules listed in `requirements.txt` to the virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pip install -r requirements.txt
    ~~~

## Step 5. Configure the database connection

The `cockroach_example/cockroach_example/settings.py` file defines database connection information for the application, in [the `DATABASES` dictionary](https://docs.djangoproject.com/en/3.2/ref/settings/#databases):

{% include_cached copy-clipboard.html %}
~~~ python
DATABASES = {}
DATABASES['default'] = dj_database_url.config(default=os.path.expandvars(
    os.environ['DATABASE_URL']), engine='django_cockroachdb')
~~~

Note that, rather than using [discrete connection parameters](connection-parameters.html), the sample `settings.py` passes a single variable (the `DATABASE_URL` environment variable) to the `dj_database_url` module.

Set the `DATABASE_URL` environment variable to the connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
$ export DATABASE_URL="<connection_string>"
~~~

<section class="filter-content" markdown="1" data-scope="local">

Where `<connection_string>` is the `sql` connection URL provided in the cluster's welcome text.

</section>

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

Where `<connection_string>` is the connection string provided in the **Connection info** window of the CockroachDB {{ site.data.products.cloud }} Console, but with the root certificate located in the local `certs` directory.

Note that you also need to provide a SQL user password in order to securely connect to a CockroachDB {{ site.data.products.cloud }} cluster. The connection string should have a placeholder for the password (`<ENTER-PASSWORD>`).

</section>

## Step 6. Build out the application

After you have configured the app's database connection, you can start building out the application.

### Models

Start by building some [models](https://docs.djangoproject.com/en/3.1/topics/db/models/), defined in a file called `models.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/models.py" download>download the file directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/models.py %}
~~~

In this file, we define some simple classes that map to the tables in the example database `bank`.

### Views

Next, build out some [class-based views](https://docs.djangoproject.com/en/3.1/topics/class-based-views/) for the application in a file called `views.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/views.py" download>download the file directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/views.py %}
~~~

This file defines the application's views as classes. Each view class corresponds to one of the table classes defined in `models.py`. The methods of these classes define read and write transactions on the tables in the database.

Importantly, the file defines a [transaction retry loop](transactions.html#transaction-retries) in the decorator function `retry_on_exception()`. This function decorates each view method, ensuring that transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level. For more information about how transactions (and retries) work, see [Transactions](transactions.html).

### URL routes

Lastly, define some [URL routes](https://docs.djangoproject.com/en/3.1/topics/http/urls/) in a file called `urls.py`. You can copy the sample code below and paste it into the existing `urls.py` file, or you can <a href="https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/urls.py" download>download the file directly</a> and replace the existing one.

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/urls.py %}
~~~

## Step 7. Initialize the database

1. In the top `cockroach_example` directory, use the [`manage.py` script](https://docs.djangoproject.com/en/3.1/ref/django-admin/) to create [Django migrations](https://docs.djangoproject.com/en/3.1/topics/migrations/) that initialize the database for the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 manage.py makemigrations cockroach_example
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 manage.py migrate
    ~~~

    This initializes the `bank` database with the tables defined in `models.py`, in addition to some other tables for the admin functionality included with Django's starter application.

1. To verify that the migration succeeded, open the terminal with the SQL shell to the temporary CockroachDB cluster, and issue the following statements:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > USE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES;
    ~~~

    ~~~
      schema_name |            table_name            | type  | estimated_row_count
    --------------+----------------------------------+-------+----------------------
      public      | auth_group                       | table |                   0
      public      | auth_group_permissions           | table |                   0
      public      | auth_permission                  | table |                  36
      public      | auth_user                        | table |                   0
      public      | auth_user_groups                 | table |                   0
      public      | auth_user_user_permissions       | table |                   0
      public      | cockroach_example_customers      | table |                   0
      public      | cockroach_example_orders         | table |                   0
      public      | cockroach_example_orders_product | table |                   0
      public      | cockroach_example_products       | table |                   0
      public      | django_admin_log                 | table |                   0
      public      | django_content_type              | table |                   9
      public      | django_migrations                | table |                   1
      public      | django_session                   | table |                   0
    (14 rows)
    ~~~

## Step 8. Run the app

1. In a different terminal, navigate to the top of the `cockroach_example` directory, and start the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python3 manage.py runserver 0.0.0.0:8000
    ~~~

    The output should look like this:

    ~~~
    ...
    Starting development server at http://0.0.0.0:8000/
    Quit the server with CONTROL-C.
    ~~~

    To perform simple reads and writes to the database, you can send HTTP requests to the application server listening at `http://0.0.0.0:8000/`.

1. In a new terminal, use `curl` to send a POST request to the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl --header "Content-Type: application/json" \
    --request POST \
    --data '{"name":"Carl"}' http://0.0.0.0:8000/customer/
    ~~~

    This request inserts a new row into the `cockroach_example_customers` table.

1. Send a GET request to read from the `cockroach_example_customers` table:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl http://0.0.0.0:8000/customer/
    ~~~

    ~~~
    [{"id": "bb7d6c4d-efb3-45f8-b790-9911aae7d8b2", "name": "Carl"}]
    ~~~

    You can also query the table directly in the [SQL shell](cockroach-sql.html) to see the changes:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.cockroach_example_customers;
    ~~~

    ~~~
                       id                  | name
    ---------------------------------------+-------
      bb7d6c4d-efb3-45f8-b790-9911aae7d8b2 | Carl
    (1 row)
    ~~~

1. Enter **Ctrl+C** to stop the application.

## What's next?

Read more about writing a [Django app](https://docs.djangoproject.com/en/3.1/intro/tutorial01/).

{% include {{page.version.version}}/app/see-also-links.md %}
