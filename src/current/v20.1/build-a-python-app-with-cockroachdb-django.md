---
title: Build a Python App with CockroachDB and Django
summary: Learn how to use CockroachDB from a simple Django application.
toc: true
twitter: false
---

<div class="filters filters-big clearfix">
    <a href="build-a-python-app-with-cockroachdb.html"><button style="width: 22%" class="filter-button">Use <strong>psycopg2</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-sqlalchemy.html"><button style="width: 22%" class="filter-button">Use <strong>SQLAlchemy</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-django.html"><button style="width: 22%" class="filter-button current">Use <strong>Django</strong></button></a>
    <a href="build-a-python-app-with-cockroachdb-pony.html"><button style="width: 22%" class="filter-button">Use <strong>PonyORM</strong></button></a>
    <a href="http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database"><button style="width: 22%" class="filter-button">Use <strong>peewee</strong></button></a>
</div>

This tutorial shows you how build a simple Python application with CockroachDB and the [Django](https://www.djangoproject.com/) framework.

CockroachDB supports Django versions 2.2 and 3.0.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

{{site.data.alerts.callout_info}}
The example code and instructions on this page use Python 3 and Django 3.0.
{{site.data.alerts.end}}

## Step 1. Install Django and the CockroachDB backend for Django

Install [Django](https://docs.djangoproject.com/en/3.0/topics/install/):

{% include_cached copy-clipboard.html %}
~~~ shell
$ python -m pip install django==3.0.*
~~~

Before installing the [CockroachDB backend for Django](https://github.com/cockroachdb/django-cockroachdb), you must install one of the following psycopg2 prerequisites:

- [psycopg2](https://pypi.org/project/psycopg2/), which has some [prerequisites](https://www.psycopg.org/docs/install.html#prerequisites) of its own. This package is recommended for production environments.

- [psycopg2-binary](https://pypi.org/project/psycopg2-binary/). This package is recommended for development and testing.

After you install the psycopg2 prerequisite, install the CockroachDB Django backend:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python -m pip install django-cockroachdb==3.0.*
~~~

{{site.data.alerts.callout_info}}
The major version of `django-cockroachdb` must correspond to the major version of `django`. The minor release numbers do not need to match.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="secure">

## Step 2. Create the `django` user and `bank` database and generate certificates

Open a [SQL shell](cockroach-sql.html) to the running CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --host=localhost:26257
~~~

In the SQL shell, issue the following statements to create the `django` user and `bank` database:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS django;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Give the `django` user the necessary permissions:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO django;
~~~

Exit the SQL shell:

{% include_cached copy-clipboard.html %}
~~~ sql
> \q
~~~

Create a certificate and key for the `django` user by running the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client django --certs-dir=certs --ca-key=my-safe-directory/ca.key
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

## Step 2. Create the `django` user and `bank` database

Open a [SQL shell](cockroach-sql.html) to the running CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26257
~~~

In the SQL shell, issue the following statements to create the `django` user and `bank` database:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS django;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Give the `django` user the necessary permissions:

{% include_cached copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO django;
~~~

Exit the SQL shell:

{% include_cached copy-clipboard.html %}
~~~ sql
> \q
~~~

</section>

## Step 3. Create a Django project

In the directory where you'd like to store your code, use the [`django-admin` command-line tool](https://docs.djangoproject.com/en/3.0/ref/django-admin/) to create an application project:

{% include_cached copy-clipboard.html %}
~~~ shell
$ django-admin startproject myproject
~~~

This creates a new project directory called `myproject`. `myproject` contains the [`manage.py` script](https://docs.djangoproject.com/en/3.0/ref/django-admin/) and a subdirectory, also named `myproject`, that contains some `.py` files.

Open `myproject/myproject/settings.py`, and add `0.0.0.0` to the `ALLOWED_HOSTS` in your `settings.py` file, so that it reads as follows:

{% include_cached copy-clipboard.html %}
~~~ python
ALLOWED_HOSTS = ['0.0.0.0']
~~~

In `myproject/myproject/settings.py`, add `myproject` to the list of `INSTALLED_APPS`, so that it reads as follows:

{% include_cached copy-clipboard.html %}
~~~ python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'myproject',
]
~~~

The other installed applications listed are added to all starter Django applications by default.

In `myproject/myproject/settings.py`, change `DATABASES` to the following:

<section class="filter-content" markdown="1" data-scope="secure">

{% include_cached copy-clipboard.html %}
~~~ python
DATABASES = {
    'default': {
        'ENGINE': 'django_cockroachdb',
        'NAME': 'bank',
        'USER': 'django',
        'HOST': 'localhost',
        'PORT': '26257',
        'OPTIONS': {
            'sslmode': 'require',
            'sslrootcert': '<path>/certs/ca.crt',
            'sslcert': '<path>/certs/client.django.crt',
            'sslkey': '<path>/certs/client.django.key',
        },
    },
}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

{% include_cached copy-clipboard.html %}
~~~ python
DATABASES = {
    'default': {
        'ENGINE': 'django_cockroachdb',
        'NAME': 'bank',
        'USER': 'django',
        'HOST': 'localhost',
        'PORT': '26257',
    }
}
~~~

</section>

## Step 4. Write the application logic

After you generate the initial Django project files, you need to build out the application with a few `.py` files in `myproject/myproject`.

<section class="filter-content" markdown="1" data-scope="secure">

### Models

Start by building some [models](https://docs.djangoproject.com/en/3.0/topics/db/models/), defined in a file called `models.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/django-basic-sample/models.py" download>download the file directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/django-basic-sample/models.py %}
~~~

In this file, we define some simple classes that map to the tables in the example database `bank`.

### Views

Next, build out some [class-based views](https://docs.djangoproject.com/en/3.0/topics/class-based-views/) for the application in a file called `views.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/django-basic-sample/views.py" download>download the file directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/django-basic-sample/views.py %}
~~~

This file defines the application's views as classes. Each view class corresponds to one of the table classes defined in `models.py`. The methods of these classes define read and write transactions on the tables in the database.

Importantly, the file defines a [transaction retry loop](transactions.html#transaction-retries) in the decorator function `retry_on_exception()`. This function decorates each view method, ensuring that transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level. For more information about how transactions (and retries) work, see [Transactions](transactions.html).

### URL routes

Lastly, define some [URL routes](https://docs.djangoproject.com/en/3.0/topics/http/urls/) in a file called `urls.py`. The `django-admin` command-line tool generated this file when you created the Django project, so it should already exist in `myproject/myproject`.  You can copy the sample code below and paste it into the existing `urls.py` file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/django-basic-sample/urls.py" download>download the file directly</a> and replace the existing one.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/django-basic-sample/urls.py %}
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

### Models

Start by building some [models](https://docs.djangoproject.com/en/3.0/topics/db/models/), defined in a file called `models.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/insecure/django-basic-sample/models.py" download>download the file directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/insecure/django-basic-sample/models.py %}
~~~

In this file, we define some simple classes that map to the tables in the example database `bank`.

### Views

Next, build out some [class-based views](https://docs.djangoproject.com/en/3.0/topics/class-based-views/) for the application in a file called `views.py`. You can copy the sample code below and paste it into a new file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/insecure/django-basic-sample/views.py" download>download the file directly</a>.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/insecure/django-basic-sample/views.py %}
~~~

This file defines the application's views as classes. Each view class corresponds to one of the table classes defined in `models.py`. The methods of these classes define read and write transactions on the tables in the database.

Importantly, the file defines a [transaction retry loop](transactions.html#transaction-retries) in the decorator function `retry_on_exception()`. This function decorates each view method, ensuring that transaction ordering guarantees meet the ANSI [SERIALIZABLE](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Serializable) isolation level. For more information about how transactions (and retries) work, see [Transactions](transactions.html).

### URL routes

Lastly, define some [URL routes](https://docs.djangoproject.com/en/3.0/topics/http/urls/) in a file called `urls.py`. The `django-admin` command-line tool generated this file when you created the Django project, so it should already exist in `myproject/myproject`.  You can copy the sample code below and paste it into the existing `urls.py` file, or you can <a href="https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{page.version.version}}/app/insecure/django-basic-sample/urls.py" download>download the file directly</a> and replace the existing one.

{% include_cached copy-clipboard.html %}
~~~ python
{% include {{page.version.version}}/app/insecure/django-basic-sample/urls.py %}
~~~

</section>

## Step 5. Set up and run the Django app

In the top `myproject` directory, use the [`manage.py` script](https://docs.djangoproject.com/en/3.0/ref/django-admin/) to create [Django migrations](https://docs.djangoproject.com/en/3.0/topics/migrations/) that initialize the database for the application:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python manage.py makemigrations myproject
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ python manage.py migrate
~~~

This initializes the `bank` database with the tables defined in `models.py`, in addition to some other tables for the admin functionality included with Django's starter application.

<section class="filter-content" markdown="1" data-scope="secure">

To verify that the migration succeeded, open a [SQL shell](cockroach-sql.html) to the running CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --host=localhost:26257
~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">

To verify that the migration succeeded, open a [SQL shell](cockroach-sql.html) to the running CockroachDB cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26257
~~~

</section>

{% include_cached copy-clipboard.html %}
~~~ sql
> USE bank;
~~~

{% include_cached copy-clipboard.html %}
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

In a new terminal, navigate to the top of the `myproject` directory, and start the app:

{% include_cached copy-clipboard.html %}
~~~ shell
$ python manage.py runserver 0.0.0.0:8000
~~~

To perform simple reads and writes to the database, you can send HTTP requests to the application.

For example, in a new terminal, you can use `curl` to send a POST request to the application that inserts a new row into the `customers` table:

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl --header "Content-Type: application/json" \
--request POST \
--data '{"name":"Carl"}' http://0.0.0.0:8000/customer/
~~~

You can then send a GET request to read from that table:

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl http://0.0.0.0:8000/customer/
~~~

~~~
[{"id": 523377322022797313, "name": "Carl"}]
~~~

You can also query the tables directly in the SQL shell to see the changes:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM myproject_customers;
~~~

~~~
          id         | name
---------------------+-------
  523377322022797313 | Carl
(1 row)
~~~


## What's next?

Read more about writing a [Django app](https://docs.djangoproject.com/en/3.0/intro/tutorial01/).

{% include {{page.version.version}}/app/see-also-links.md %}
