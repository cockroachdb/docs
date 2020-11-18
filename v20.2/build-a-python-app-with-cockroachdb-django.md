---
title: Build a Python App with CockroachDB and Django
summary: Learn how to use CockroachDB from a simple Django application.
toc: true
twitter: false
---

<div class="filters clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button class="filter-button page-level"><strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button class="filter-button page-level"><strong>SQLAlchemy</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-django.html"><button class="filter-button page-level current"><strong>Django</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-pony.html"><button class="filter-button page-level"><strong>PonyORM</strong></button></a>
    <a href="http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database"><button class="filter-button page-level"><strong>peewee</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB and the [Django](https://www.djangoproject.com/) framework.

CockroachDB supports Django versions 2.2, 3.0, and 3.1.

{{site.data.alerts.callout_info}}
The example code and instructions on this page use Python 3 and Django 3.1.
{{site.data.alerts.end}}

## Step 1. Install Django and the CockroachDB backend for Django

Install [Django](https://docs.djangoproject.com/en/3.1/topics/install/):

{% include copy-clipboard.html %}
~~~ shell
$ python -m pip install django>=3.1.*
~~~

Before installing the [CockroachDB backend for Django](https://github.com/cockroachdb/django-cockroachdb), you must install one of the following psycopg2 prerequisites:

- [psycopg2](https://pypi.org/project/psycopg2/), which has some [prerequisites](https://www.psycopg.org/docs/install.html#prerequisites) of its own. This package is recommended for production environments.

- [psycopg2-binary](https://pypi.org/project/psycopg2-binary/). This package is recommended for development and testing.

After you install the psycopg2 prerequisite, install the CockroachDB Django backend:

{% include copy-clipboard.html %}
~~~ shell
$ python -m pip install django-cockroachdb>=3.1.*
~~~

{{site.data.alerts.callout_info}}
The major version of `django-cockroachdb` must correspond to the major version of `django`. The minor release numbers do not need to match.
{{site.data.alerts.end}}

## Step 2. Start CockroachDB

{% include {{page.version.version}}/app/start-cockroachdb.md %}

## Step 3. Create a database

{% include {{page.version.version}}/app/create-a-database.md %}

## Step 4. Create a Django project

In the directory where you'd like to store your code, use the [`django-admin` command-line tool](https://docs.djangoproject.com/en/3.1/ref/django-admin/) to create an application project:

{% include copy-clipboard.html %}
~~~ shell
$ django-admin startproject cockroach_example
~~~

This creates a new project directory called `cockroach_example`. `cockroach_example` contains the [`manage.py` script](https://docs.djangoproject.com/en/3.1/ref/django-admin/) and a subdirectory, also named `cockroach_example`, that contains some `.py` files.

Open `cockroach_example/cockroach_example/settings.py`, and add `0.0.0.0` to the `ALLOWED_HOSTS`, so that it reads as follows:

{% include copy-clipboard.html %}
~~~ python
ALLOWED_HOSTS = ['0.0.0.0']
~~~

Then add `cockroach_example` to the list of `INSTALLED_APPS`, so that it reads as follows:

{% include copy-clipboard.html %}
~~~ python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cockroach_example',
]
~~~

Next, change `DATABASES` to reads as follows:

{% include copy-clipboard.html %}
~~~ python
DATABASES = {
    'default': {
        'ENGINE' : 'django_cockroachdb',
        'NAME' : 'bank',
        'USER' : '<user>',
        'PASSWORD': '<password>',
        'HOST' : 'localhost',
        'PORT' : <port>,
    }
}
~~~

Where:

- `<user>` is the username that you created earlier.
- `<password>` is the password that you created for the `<user>`.
- `<port>` is the port listed in the `(sql/tcp)` connection string in the SQL shell welcome text. For example, for the connection string `(sql/tcp) postgres://root:admin@127.0.0.1:61011?sslmode=require`, the port is `61011`.

## Step 5. Write the application logic

After you generate the initial Django project files and edit the project's configuration settings, you need to build out the application with a few `.py` files in `cockroach_example/cockroach_example`.

### Models

Start by building some [models](https://docs.djangoproject.com/en/3.1/topics/db/models/), defined in a file called `models.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/examples-orms/master/python/django/cockroach_example/models.py" download>download the file directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachdb/examples-orms/master/python/django/cockroach_example/models.py %}
~~~

In this file, we define some simple classes that map to the tables in the example database `bank`.

### Views

Next, build out some [class-based views](https://docs.djangoproject.com/en/3.1/topics/class-based-views/) for the application in a file called `views.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/examples-orms/master/python/django/cockroach_example/views.py" download>download the file directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachdb/examples-orms/master/python/django/cockroach_example/views.py %}
~~~

This file defines the application's views as classes. Each view class corresponds to one of the table classes defined in `models.py`. The methods of these classes define read and write transactions on the tables in the database.

Importantly, the file defines a [transaction retry loop](transactions.html#transaction-retries) in the decorator function `retry_on_exception()`. This function decorates each view method, ensuring that transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level. For more information about how transactions (and retries) work, see [Transactions](transactions.html).

### URL routes

Lastly, define some [URL routes](https://docs.djangoproject.com/en/3.1/topics/http/urls/) in a file called `urls.py`. The `django-admin` command-line tool generated this file when you created the Django project, so it should already exist in `cockroach_example/cockroach_example`. You can copy the sample code below and paste it into the existing `urls.py` file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/examples-orms/master/python/django/cockroach_example/urls.py" download>download the file directly</a> and replace the existing one.

{% include copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachdb/examples-orms/master/python/django/cockroach_example/urls.py %}
~~~

## Step 6. Set up and run the Django app

In the top `cockroach_example` directory, use the [`manage.py` script](https://docs.djangoproject.com/en/3.1/ref/django-admin/) to create [Django migrations](https://docs.djangoproject.com/en/3.1/topics/migrations/) that initialize the database for the application:

{% include copy-clipboard.html %}
~~~ shell
$ python manage.py makemigrations cockroach_example
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python manage.py migrate
~~~

This initializes the `bank` database with the tables defined in `models.py`, in addition to some other tables for the admin functionality included with Django's starter application.

To verify that the migration succeeded, open the terminal with the SQL shell to the temporary CockroachDB cluster, and issue the following statements:

{% include copy-clipboard.html %}
~~~ sql
> USE bank;
~~~

{% include copy-clipboard.html %}
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

In a different terminal, navigate to the top of the `cockroach_example` directory, and start the app:

{% include copy-clipboard.html %}
~~~ shell
$ python manage.py runserver 0.0.0.0:8000
~~~

To perform simple reads and writes to the database, you can send HTTP requests to the application.

For example, in a new terminal, you can use `curl` to send a POST request to the application that inserts a new row into the `customers` table:

{% include copy-clipboard.html %}
~~~ shell
$ curl --header "Content-Type: application/json" \
--request POST \
--data '{"name":"Carl"}' http://0.0.0.0:8000/customer/
~~~

You can then send a GET request to read from that table:

{% include copy-clipboard.html %}
~~~ shell
$ curl http://0.0.0.0:8000/customer/
~~~

~~~
[{"id": 523377322022797313, "name": "Carl"}]
~~~

You can also query the tables directly in the SQL shell to see the changes:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM cockroach_example_customers;
~~~

~~~
          id         | name
---------------------+-------
  523377322022797313 | Carl
(1 row)
~~~

## What's next?

Read more about writing a [Django app](https://docs.djangoproject.com/en/3.1/intro/tutorial01/).

{% include {{page.version.version}}/app/see-also-links.md %}
