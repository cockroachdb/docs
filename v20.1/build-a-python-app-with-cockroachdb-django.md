---
title: Build a Python App with CockroachDB and Django
summary: Learn how to use CockroachDB from a simple Django application.
toc: true
asciicast: true
twitter: false
---

This tutorial shows you how build a simple Python Django application with CockroachDB.

We have tested the [django-cockroachdb](https://github.com/cockroachdb/django-cockroachdb) adapter enough to claim **alpha-level** support. If you encounter problems, please open an issue with details to help us make progress toward full support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/django-cockroachdb/issues/new) with details to help us make progress toward full support.

## Before you begin

{% include {{page.version.version}}/app/before-you-begin.md %}

## Step 1. Install Django and Django-cockroachdb

To install the Django and the Django-cockroachdb backend, run the following commands:

{% include copy-clipboard.html %}
~~~ shell
$ pip install django
~~~

{% include copy-clipboard.html %}
~~~ shell
$ pip install django-cockroachdb
~~~

## Step 2. Create the `django` user and database

Start the [built-in SQL client](use-the-built-in-sql-client.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

In the SQL shell, issue the following statements to create the `django` user and `bank` database:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS django WITH PASSWORD 'XXXXXX';
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

## Step 3. Create your Django project

In the directory where you'd like to store your code, issue the following statement to create your project:

{% include copy-clipboard.html %}
~~~ shell
$ django-admin startproject myproject
~~~

This creates a new project in a directory called `myproject`. Open this directory in your IDE of choice. Open `settings.py` and change `DATABASES` to the following:

{% include copy-clipboard.html %}
~~~ python
DATABASES = {
    'default': {
        'ENGINE': 'django_cockroachdb',
        'NAME': 'bank',
        'USER': 'django',
        'PASSWORD': 'XXXXXX',
        'HOST': 'localhost',
        'PORT': '26257',
    }
}
~~~

## Step 3. Set up and run your Django app

Then, in the same directory, use the `manage.py` script to set up your database for Django:

{% include copy-clipboard.html %}
~~~ shell
$ python3 manage.py makemigrations
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python3 manage.py migrate
~~~

{% include copy-clipboard.html %}
~~~ shell
$ python3 manage.py createsuperuser
~~~

This will prompt you to create a user to be an admin for your app. Once, you have done that, you are ready to start your app:

{% include copy-clipboard.html %}
~~~ shell
$ python3 manage.py runserver 0.0.0.0:8000
~~~

Now you can access the admin section of your Django app. You can also inspect the database and see that the admin structure has been created:

~~~ shell
> \dt
          table_name
------------------------------
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
(10 rows)
~~~

## What's next?

Read more about writing a [Django app](https://docs.djangoproject.com/en/3.0/intro/tutorial01/).

{% include {{page.version.version}}/app/see-also-links.md %}
