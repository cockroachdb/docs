---
title: Build a Python App with CockroachDB and Django
summary: Learn how to use CockroachDB from a simple Django application.
toc: true
asciicast: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button style="width: 28%" class="filter-button">Use <strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button style="width: 28%" class="filter-button">Use <strong>SQLAlchemy</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-django.html"><button style="width: 28%" class="filter-button current">Use <strong>Django</strong></button></a>
</div>

This tutorial shows you how build a simple [Django](https://www.djangoproject.com/) application with CockroachDB.

We have tested the [django-cockroachdb](https://github.com/cockroachdb/django-cockroachdb) adapter enough to claim **alpha-level** support. If you encounter problems, please open an issue with details to help us make progress toward full support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/django-cockroachdb/issues/new) with details to help us make progress toward full support.

{{site.data.alerts.callout_info}}
The example code and instructions on this page use Python 3.
{{site.data.alerts.end}}

## Before you begin

1. [Install CockroachDB](install-cockroachdb.html).
2. Start up a [secure](secure-a-cluster.html) local cluster.

## Step 1. Install Django and the CockroachDB backend for Django

Install [Django](https://docs.djangoproject.com/en/3.0/topics/install/) and the [CockroachDB backend for Django](https://github.com/cockroachdb/django-cockroachdb):

{% include copy-clipboard.html %}
~~~ shell
$ python3 -m pip install django
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python3 -m pip install django-cockroachdb
~~~

## Step 2. Create the `django` user and database

Open a [SQL shell](use-the-built-in-sql-client.html) to the running CockroachDB cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --host=localhost:26257
~~~

In the SQL shell, issue the following statements to create the `django` user and `bank` database:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS django WITH PASSWORD 'password';
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Give the `django` user the necessary permissions:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO django;
~~~

Exit the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

## Step 3. Create a Django project

In the directory where you'd like to store your code, use the [`django-admin` command-line tool](https://docs.djangoproject.com/en/3.0/ref/django-admin/) to create an application project:

{% include copy-clipboard.html %}
~~~ shell
$ django-admin startproject myproject
~~~

This creates a new project directory called `myproject`. `myproject` contains the [`manage.py` script](https://docs.djangoproject.com/en/3.0/ref/django-admin/) and a subdirectory, also named `myproject`, that contains some `.py` files.

Open `myproject/myproject/settings.py`, and add `0.0.0.0` to the `ALLOWED_HOSTS` in your `settings.py` file, so that it reads as follows:

{% include copy-clipboard.html %}
~~~ python
ALLOWED_HOSTS = ['0.0.0.0']
~~~

In `myproject/myproject/settings.py`, add `myproject` to the list of `INSTALLED_APPS`, so that it reads as follows:

{% include copy-clipboard.html %}
~~~ python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'myproject'
]
~~~

The other installed applications listed are added to all starter Django applications by default.

In `myproject/myproject/settings.py`, change `DATABASES` to the following:

{% include copy-clipboard.html %}
~~~ python
DATABASES = {
    'default': {
        'ENGINE': 'django_cockroachdb',
        'NAME': 'bank',
        'USER': 'django',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '26257',
    }
}
~~~

## Step 3. Write the application logic

After you generate the initial Django project files, you need to build out the application with a few `.py` files in `myproject/myproject`.

### Models

Start by building some [models](https://docs.djangoproject.com/en/3.0/topics/db/models/), defined in a file called `models.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/django-basic-sample/models.py" download>download the file directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/django-basic-sample/models.py %}
~~~

In this file, we define some simple classes that map to the tables in the example database `bank`.

### Views

Next, build out some [class-based views](https://docs.djangoproject.com/en/3.0/topics/class-based-views/) for the application in a file called `views.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/django-basic-sample/views.py" download>download the file directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/django-basic-sample/views.py %}
~~~

This file defines the application's views as classes. Each view class corresponds to one of the table classes defined in `models.py`. The methods of these classes define read and write transactions on the tables in the database.

Importantly, the file defines a [transaction retry loop](transactions.html#transaction-retries) in the decorator function `retry_on_exception()`. This function decorates each view method, ensuring that transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level. For more information about how transactions (and retries) work, see [Transactions](transactions.html).

### URL routes

Lastly, define some [URL routes](https://docs.djangoproject.com/en/3.0/topics/http/urls/) in a file called `urls.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/django-basic-sample/urls.py" download>download the file directly</a>.

{% include copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/django-basic-sample/urls.py %}
~~~

## Step 4. Set up and run the Django app

In the top `myproject` directory, use the [`manage.py` script](https://docs.djangoproject.com/en/3.0/ref/django-admin/) to create [Django migrations](https://docs.djangoproject.com/en/3.0/topics/migrations/) that initialize the database for the application:

{% include copy-clipboard.html %}
~~~ shell
$ python3 manage.py makemigrations myproject
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python3 manage.py migrate
~~~

Open a [SQL shell](use-the-built-in-sql-client.html) to the running CockroachDB cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --host=localhost:26257
~~~

This initializes the `bank` database with the tables defined in `models.py`, in addition to some other tables for the admin functionality included with Django's starter application:

{% include copy-clipboard.html %}
~~~ sql
> USE bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
          table_name
+----------------------------+
  auth_group
  auth_group_permissions
  auth_permission
  auth_user
  auth_user_groups
  auth_user_user_permissions
  django_admin_log
  django_content_type
  django_migrations
  django_session
  myproject_customers
  myproject_orders
  myproject_orders_product
  myproject_products
(14 rows)
~~~

You can now start the app:

{% include copy-clipboard.html %}
~~~ shell
$ python3 manage.py runserver 0.0.0.0:8000
~~~

To perform a simple insert to the database, you can use `curl`. For example:

{% include copy-clipboard.html %}
~~~ shell
$ curl --header "Content-Type: application/json" \
--request POST \
--data '{"name":"Carl"}' http://0.0.0.0:8000/customer/
~~~

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
> SELECT * FROM myproject_customers;
~~~

~~~
          id         | name
+--------------------+------+
  523377322022797313 | Carl
(1 row)
~~~


## What's next?

Read more about writing a [Django app](https://docs.djangoproject.com/en/3.0/intro/tutorial01/).

{% include {{page.version.version}}/app/see-also-links.md %}
