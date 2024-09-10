---
title: Install a Driver or ORM Framework
summary: CockroachDB supports both native drivers and the PostgreSQL wire protocol, so you can use most available PostgreSQL client drivers and ORM frameworks.
toc: true
docs_area: develop
---

CockroachDB supports both native drivers and the PostgreSQL wire protocol, so most available PostgreSQL client drivers and ORM frameworks should work with CockroachDB. Choose a language for supported clients, and follow the installation steps. After you install a client library, you can [connect to the database]({% link {{ page.version.version }}/connect-to-the-database.md %}).

{{site.data.alerts.callout_info}}
Applications may encounter incompatibilities when using advanced or obscure features of a driver or ORM framework with **partial** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="js-ts">JavaScript/TypeScript</button>
  <button class="filter-button page-level" data-scope="python">Python</button>
  <button class="filter-button page-level" data-scope="go">Go</button>
  <button class="filter-button page-level" data-scope="java">Java</button>
  <button class="filter-button page-level" data-scope="ruby">Ruby</button>
  <button class="filter-button page-level" data-scope="c">C</button>
  <button class="filter-button page-level" data-scope="c-sharp">C# (.NET)</button>
  <button class="filter-button page-level" data-scope="rust">Rust</button>
</div>

<section class="filter-content" markdown="1" data-scope="js-ts">

## JavaScript Drivers

### pg

**Support level:** Full

To install the [Node.js pg driver](https://www.npmjs.com/package/pg):

{% include_cached copy-clipboard.html %}
~~~ shell
$ npm install pg
~~~

For a simple but complete example app, see [Build a Node.js App with CockroachDB and the Node.js pg Driver]({% link {{ page.version.version }}/build-a-nodejs-app-with-cockroachdb.md %}).

## JavaScript/TypeScript ORM frameworks

### Sequelize

**Support level:** Full

To install Sequelize and a [CockroachDB Node.js package](https://github.com/cockroachdb/sequelize-cockroachdb) that accounts for some minor differences between CockroachDB and PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~ shell
$ npm install sequelize sequelize-cockroachdb
~~~

For a simple but complete example app, see [Build a Node.js App with CockroachDB and Sequelize]({% link {{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-sequelize.md %}).

### Knex.js

**Support level:** Full

Install Knex.js as described in the [official documentation](https://knexjs.org/#Installation).

For a simple but complete example app, see [Build a Simple CRUD Node.js App with CockroachDB and Knex.js]({% link {{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-knexjs.md %}).

### TypeORM

**Support level:** Full

Install TypeORM as described in the [official documentation](https://typeorm.io/#/).

For a simple but complete example app, see [Build a TypeScript App with CockroachDB and TypeORM]({% link {{ page.version.version }}/build-a-typescript-app-with-cockroachdb.md %}).

### Prisma

**Support level:** Full

To install the [Prisma ORM](https://prisma.io/):

{% include_cached copy-clipboard.html %}
~~~ shell
$ npm install prisma
~~~

For a simple but complete example app, see [Build a Simple CRUD Node.js App with CockroachDB and Prisma]({% link {{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-prisma.md %}).

</section>

<section class="filter-content" markdown="1" data-scope="python">

## Python Drivers

### psycopg3

**Support level:** Full

To install the Python psycopg3 driver:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip3 install "psycopg[binary]"
~~~

For other ways to install psycopg3, see the [official documentation](https://www.psycopg.org/psycopg3/docs/basic/install.html).

For a simple but complete example app, see [Build a Python App with CockroachDB and psycopg3]({% link {{ page.version.version }}/build-a-python-app-with-cockroachdb-psycopg3.md %}).

### psycopg2

**Support level:** Full

To install the Python psycopg2 driver:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install psycopg2
~~~

For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

For a simple but complete example app, see [Build a Python App with CockroachDB and psycopg2]({% link {{ page.version.version }}/build-a-python-app-with-cockroachdb.md %}).

## Python ORM frameworks

### SQLAlchemy

**Support level:** Full

To install SQLAlchemy and a [CockroachDB Python package](https://github.com/cockroachdb/sqlalchemy-cockroachdb) that accounts for some differences between CockroachDB and PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install sqlalchemy sqlalchemy-cockroachdb psycopg2
~~~

{{site.data.alerts.callout_success}}
You can substitute psycopg2 for other alternatives that include the psycopg python package.
{{site.data.alerts.end}}

For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/intro.html#installation-guide).

For a simple but complete example app, see [Build a Python App with CockroachDB and SQLAlchemy]({% link {{ page.version.version }}/build-a-python-app-with-cockroachdb-sqlalchemy.md %}).

### Django

**Support level:** Full

CockroachDB supports Django versions 3.1+.

To install [Django](https://docs.djangoproject.com/en/4.0/topics/install/):

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install django==3.1.*
~~~

Before installing the [CockroachDB backend for Django](https://github.com/cockroachdb/django-cockroachdb), you must install one of the following psycopg2 prerequisites:

- [psycopg2](https://pypi.org/project/psycopg2/), which has some
  [prerequisites](https://www.psycopg.org/docs/install.html#prerequisites) of
  its own. This package is recommended for production environments.

- [psycopg2-binary](https://pypi.org/project/psycopg2-binary/). This package is recommended for development and testing.

After you install the psycopg2 prerequisite, you can install the CockroachDB Django backend:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install django-cockroachdb==3.1.*
~~~

{{site.data.alerts.callout_info}}
The major version of `django-cockroachdb` must correspond to the major version of `django`. The minor release numbers do not need to match.
{{site.data.alerts.end}}

For a simple but complete example app, see [Build a Python App with CockroachDB and Django]({% link {{ page.version.version }}/build-a-python-app-with-cockroachdb-django.md %}).

### peewee

**Support level:** Full

To install peewee:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pip install peewee
~~~

For instructions on using peewee with CockroachDB, see the [CockroachDatabase peewee extension documentation](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database).

</section>

<section class="filter-content" markdown="1" data-scope="go">

## Go Drivers

### pgx

**Support level:** Full

To install the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx):

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jackc/pgx
~~~

For a simple but complete example app, see [Build a Go App with CockroachDB and the Go pgx Driver]({% link {{ page.version.version }}/build-a-go-app-with-cockroachdb.md %}).

### pq

**Support level:** Full

To install the [Go pq driver](https://godoc.org/github.com/lib/pq):

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

For a simple but complete example app, see [Build a Go App with CockroachDB and the Go pq Driver]({% link {{ page.version.version }}/build-a-go-app-with-cockroachdb.md %}).

## Go ORM frameworks

### GORM

**Support level:** Full

To install [GORM](http://gorm.io):

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq # dependency
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jinzhu/gorm
~~~

For a simple but complete example app, see [Build a Go App with CockroachDB and GORM]({% link {{ page.version.version }}/build-a-go-app-with-cockroachdb-gorm.md %}).

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include {{page.version.version}}/app/java-version-note.md %}

{% include {{page.version.version}}/app/java-tls-note.md %}

## Java Drivers

### JDBC

**Support level:** Full

Download and set up the latest Java JDBC driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/setup/).

For a simple but complete example app, see [Build a Java App with CockroachDB and JDBC]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb.md %}).

## Java ORM frameworks

### Hibernate

**Support level:** Full

You can use [Gradle](https://gradle.org/install) or [Maven](https://maven.apache.org/install.html) to get all dependencies for your application, including Hibernate. Only Hibernate versions 5.4.19 and later support the Hibernate CockroachDB dialect.

If you are using Gradle, add the following to your `dependencies`:

~~~ groovy
implementation 'org.hibernate:hibernate-core:{version}.Final'
implementation 'org.postgresql:postgresql:{version}'
~~~

Where `{version}` is the latest stable version.

For a simple but complete example app that uses Gradle for dependency management, see [Build a Java App with CockroachDB and Hibernate]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb-hibernate.md %}).

If you are using Maven, add the following to your `<dependencies>`:

~~~ xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>{version}.Final</version>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
~~~

Where `{version}` is the latest stable version.

For a complete example app that uses Maven for dependency management, see [Build a Spring App with CockroachDB and Spring Data JPA (Hibernate)]({% link {{ page.version.version }}/build-a-spring-app-with-cockroachdb-jpa.md %}).

You will also need to specify the CockroachDB dialect in your [Hibernate configuration file](https://www.tutorialspoint.com/hibernate/hibernate_configuration.htm).

{% include {{page.version.version}}/app/hibernate-dialects-note.md %}

### jOOQ

**Support level:** Full

You can use [Gradle](https://gradle.org/install) or [Maven](https://maven.apache.org/install.html) to get all dependencies for your application, including jOOQ.

For a simple but complete example app that uses Maven for dependency management, see [Build a Java App with CockroachDB and jOOQ]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb-jooq.md %}).

</section>

<section class="filter-content" markdown="1" data-scope="ruby">

## Ruby Drivers

### pg

**Support level:** Full

To install the [Ruby pg driver](https://rubygems.org/gems/pg):

{% include_cached copy-clipboard.html %}
~~~ shell
$ gem install pg
~~~

For a simple but complete example app, see [Build a Ruby App with CockroachDB and the Ruby pg Driver]({% link {{ page.version.version }}/build-a-ruby-app-with-cockroachdb.md %}).

## Ruby ORM frameworks

### Active Record

**Support level:** Full

To install Active Record, the [pg driver](https://rubygems.org/gems/pg), and a [CockroachDB Ruby package](https://github.com/cockroachdb/activerecord-cockroachdb-adapter) that accounts for some minor differences between CockroachDB and PostgreSQL:

{% include_cached copy-clipboard.html %}
~~~ shell
$ gem install activerecord pg activerecord-cockroachdb-adapter
~~~

{{site.data.alerts.callout_info}}
The exact command above will vary depending on the desired version of Active Record. Specifically, version 6.0.x of Active Record requires version 6.0.x of the adapter and version 7.0.x of Active Record requires version 7.0.x of the adapter.
{{site.data.alerts.end}}

For a simple but complete example app, see [Build a Ruby App with CockroachDB and Active Record]({% link {{ page.version.version }}/build-a-ruby-app-with-cockroachdb-activerecord.md %}).

</section>

<section class="filter-content" markdown="1" data-scope="c">

## C Drivers

### libpq

**Support level:** Partial

Install the C libpq driver as described in the [official documentation](https://www.postgresql.org/docs/current/libpq.html).

</section>

<section class="filter-content" markdown="1" data-scope="c-sharp">

## C# Drivers

### Npgsql

**Support level:** Full

1. Create a .NET project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ dotnet new console -o cockroachdb-test-app
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd cockroachdb-test-app
    ~~~

    The `dotnet` command creates a new app of type `console`. The `-o` parameter creates a directory named `cockroachdb-test-app` where your app will be stored and populates it with the required files. The `cd cockroachdb-test-app` command puts you into the newly created app directory.

1. Install the latest version of the [Npgsql driver](https://www.nuget.org/packages/Npgsql/) into the .NET project using the built-in nuget package manager:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ dotnet add package Npgsql
    ~~~

For a simple but complete example app, see [Build a C# App with CockroachDB and the .NET Npgsql Driver]({% link {{ page.version.version }}/build-a-csharp-app-with-cockroachdb.md %}).

</section>

<section class="filter-content" markdown="1" data-scope="rust">

## Rust Drivers

### rust-postgres

**Support level:** Partial

Install the Rust-Postgres driver as described in the [official documentation](https://crates.io/crates/postgres).

For a simple but complete example app, see [Build a Rust App with CockroachDB and the Rust-Postgres Driver]({% link {{ page.version.version }}/build-a-rust-app-with-cockroachdb.md %}).

</section>

## What's next?

- [Connect to CockroachDB]({% link {{ page.version.version }}/connect-to-the-database.md %})
- [Design a Database Schema]({% link {{ page.version.version }}/schema-design-overview.md %})

You might also be interested in the following pages:

- [Third party database tools]({% link {{ page.version.version }}/third-party-database-tools.md %})
- [Connection parameters]({% link {{ page.version.version }}/connection-parameters.md %})
- [Transactions]({% link {{ page.version.version }}/transactions.md %})
- [Performance best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
