---
title: Build a Python App with CockroachDB and Django
summary: Learn how to use CockroachDB from a simple Django application.
toc: true
twitter: false
referral_id: docs_python_django
docs_area: get_started
---

{% include {{ page.version.version }}/filter-tabs/crud-python.md %}

This tutorial shows you how build a simple Python application with CockroachDB and the [Django](https://www.djangoproject.com/) framework.

CockroachDB supports Django versions 3.1+.

{{site.data.alerts.callout_info}}
The example code and instructions on this page use Python 3.9 and Django 3.1.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup-parameters-certs.md %}

## Step 2. Get the sample code

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

## Step 3. Install the application requirements

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

1. Install the modules listed in `requirements.txt` to the virtual environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pip install -r requirements.txt
    ~~~

## Step 4. Build out the application

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Configure the database connection

Open `cockroach_example/cockroach_example/settings.py`, and configure [the `DATABASES` dictionary](https://docs.djangoproject.com/en/3.2/ref/settings/#databases) to connect to your cluster using the connection information that you retrieved from the {{ site.data.products.db }} Console.

{% include_cached copy-clipboard.html %}
~~~ python
DATABASES = {
    'default': {
        'ENGINE': 'django_cockroachdb',
        'NAME': '{database}',
        'USER': '{username}',
        'PASSWORD': '{password}',
        'HOST': '{host}',
        'PORT': '{port}',
        'OPTIONS': {
            'sslmode': 'verify-full',
            'options': '--cluster={routing-id}'
        },
    },
}
~~~

For more information about configuration a Django connection to {{ site.data.products.serverless }}, see [Connect to a CockroachDB Cluster](https://www.cockroachlabs.com/docs/stable/connect-to-the-database.html?filters=python&filters=django).

After you have configured the app's database connection, you can start building out the application.

</section>

### Models

Start by building some [models](https://docs.djangoproject.com/en/3.1/topics/db/models/), defined in a file called `models.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/models.py" download>download the file directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-python-django/master/cockroach_example/cockroach_example/models.py %}
~~~

In this file, we define some simple classes that map to the tables in the cluster.

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

## Step 5. Initialize the database

In the top `cockroach_example` directory, use the [`manage.py` script](https://docs.djangoproject.com/en/3.1/ref/django-admin/) to create [Django migrations](https://docs.djangoproject.com/en/3.1/topics/migrations/) that initialize the database for the application:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python manage.py makemigrations cockroach_example
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ python manage.py migrate
~~~

This initializes the tables defined in `models.py`, in addition to some other tables for the admin functionality included with Django's starter application.

## Step 6. Run the app

1. In a different terminal, navigate to the top of the `cockroach_example` directory, and start the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ python manage.py runserver 0.0.0.0:8000
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
    > SELECT * FROM cockroach_example_customers;
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
