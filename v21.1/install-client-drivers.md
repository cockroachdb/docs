---
title: Install a Driver or ORM Framework
summary: CockroachDB supports both native drivers and the PostgreSQL wire protocol, so you can use most available PostgreSQL client drivers and ORM frameworks.
toc: true
---

CockroachDB supports both native drivers and the PostgreSQL wire protocol, so most available PostgreSQL client drivers and ORM frameworks should work with CockroachDB. Choose a language for supported clients and installation steps. After you install a client library, you can [connect to the database](connect-to-the-database.html).

{{site.data.alerts.callout_info}}
Applications may encounter incompatibilities when using advanced or obscure features of a driver or ORM framework with **beta-level** support. If you encounter problems, please [open an issue](https://github.com/cockroachdb/cockroach/issues/new) with details to help us make progress toward full support.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="python">Python</button>
  <button class="filter-button page-level" data-scope="java">Java</button>
  <button class="filter-button page-level" data-scope="go">Go</button>
  <button class="filter-button page-level" data-scope="ruby">Ruby</button>
  <button class="filter-button page-level" data-scope="node">Node.js</button>
  <button class="filter-button page-level" data-scope="c">C</button>
  <button class="filter-button page-level" data-scope="c++">C++</button>
  <button class="filter-button page-level" data-scope="c-sharp">C# (.NET)</button>
  <button class="filter-button page-level" data-scope="clojure">Clojure</button>
  <button class="filter-button page-level" data-scope="php">PHP</button>
  <button class="filter-button page-level" data-scope="typescript">TypeScript</button>
</div>

<section class="filter-content" markdown="1" data-scope="python">

## Python Drivers

### psycopg2

**Support level:** Full

To install the Python psycopg2 driver:

{% include copy-clipboard.html %}
~~~ shell
$ pip install psycopg2
~~~

For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

For a simple but complete "Hello World" example app, see [Build a Python App with CockroachDB and psycopg2](build-a-python-app-with-cockroachdb.html).

## Python ORM frameworks

### SQLAlchemy

**Support level:** Full

To install SQLAlchemy and a [CockroachDB Python package](https://github.com/cockroachdb/sqlalchemy-cockroachdb) that accounts for some differences between CockroachDB and PostgreSQL:

{% include copy-clipboard.html %}
~~~ shell
$ pip install sqlalchemy sqlalchemy-cockroachdb psycopg2
~~~

{{site.data.alerts.callout_success}}
You can substitute psycopg2 for other alternatives that include the psycopg python package.
{{site.data.alerts.end}}

For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

For a simple but complete "Hello World" example app, see [Build a Python App with CockroachDB and SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html).

### Django

**Support level:** Full

CockroachDB supports Django versions 2.2 and 3.0.

To install [Django](https://docs.djangoproject.com/en/3.0/topics/install/):

{% include copy-clipboard.html %}
~~~ shell
$ pip install django==3.0.*
~~~

Before installing the [CockroachDB backend for Django](https://github.com/cockroachdb/django-cockroachdb), you must install one of the following psycopg2 prerequisites:

- [psycopg2](https://pypi.org/project/psycopg2/), which has some
  [prerequisites](https://www.psycopg.org/docs/install.html#prerequisites) of
  its own. This package is recommended for production environments.

- [psycopg2-binary](https://pypi.org/project/psycopg2-binary/). This package is recommended for development and testing.

After you install the psycopg2 prerequisite, you can install the CockroachDB Django backend:

{% include copy-clipboard.html %}
~~~ shell
$ pip install django-cockroachdb==3.0.*
~~~

{{site.data.alerts.callout_info}}
The major version of `django-cockroachdb` must correspond to the major version of `django`. The minor release numbers do not need to match.
{{site.data.alerts.end}}

For a simple but complete "Hello World" example app, see [Build a Python App with CockroachDB and Django](build-a-python-app-with-cockroachdb-django.html).

### PonyORM

**Support level:** Full

To install PonyORM:

{% include copy-clipboard.html %}
~~~ shell
$ pip install pony
~~~

For a simple but complete "Hello World" example app, see [Build a Python App with CockroachDB and PonyORM](build-a-python-app-with-cockroachdb-pony.html).

### peewee

**Support level:** Full

To install peewee:

{% include copy-clipboard.html %}
~~~ shell
$ pip install peewee
~~~

For instructions on using peewee with CockroachDB, see the [CockroachDatabase peewee extension documentation](http://docs.peewee-orm.com/en/latest/peewee/playhouse.html#cockroach-database).

</section>

<section class="filter-content" markdown="1" data-scope="java">

{% include {{page.version.version}}/app/java-version-note.md %}

{% include {{page.version.version}}/app/java-tls-note.md %}

## Java Drivers

### JDBC

**Support level:** Full

Download and set up the Java JDBC driver as described in the [official documentation](https://jdbc.postgresql.org/documentation/head/setup.html). We recommend using the PostgreSQL JDBC 42.2.9 driver.

For a simple but complete "Hello World" example app, see [Build a Java App with CockroachDB and JDBC](build-a-java-app-with-cockroachdb.html).

## Java ORM frameworks

### Hibernate

**Support level:** Full

You can use [Gradle](https://gradle.org/install) or [Maven](https://maven.apache.org/install.html) to get all dependencies for your application, including Hibernate. Only Hibernate versions 5.4.19 and later support the Hibernate CockroachDB dialect.

If you are using Gradle, add the following to your `dependencies`:

~~~ groovy
implementation 'org.hibernate:hibernate-core:5.4.19.Final'
implementation 'org.postgresql:postgresql:42.2.9'
~~~

For a simple but complete "Hello World" example app that uses Gradle for dependency management, see [Build a Java App with CockroachDB and Hibernate](build-a-java-app-with-cockroachdb-hibernate.html).

If you are using Maven, add the following to your `<dependencies>`:

~~~ xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>5.4.19.Final</version>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
~~~

For a complete example app that uses Maven for dependency management, see [Build a Spring App with CockroachDB and Spring Data JPA (Hibernate)](build-a-spring-app-with-cockroachdb-jpa.html).

You will also need to specify the CockroachDB dialect in your [Hibernate configuration file](https://www.tutorialspoint.com/hibernate/hibernate_configuration.htm). Versions of the Hibernate CockroachDB dialect correspond to the version of CockroachDB installed on your machine. For example, `org.hibernate.dialect.CockroachDB201Dialect` corresponds to CockroachDB v20.1 and later, and `org.hibernate.dialect.CockroachDB192Dialect` corresponds to CockroachDB v19.2 and later.

All dialect versions are forward-compatible (e.g. CockroachDB v20.1 is compatible with `CockroachDB192Dialect`), as long as your application is not affected by any backward-incompatible changes listed in your CockroachDB version's [release notes](../releases/index.html). In the event of a CockroachDB version upgrade, using a previous version of the CockroachDB dialect will not break an application, but, to enable all features available in your version of CockroachDB, we recommend keeping the dialect version in sync with the installed version of CockroachDB.

Not all versions of CockroachDB have a corresponding dialect yet. Use the dialect number that is closest to your installed version of CockroachDB. For example, use `CockroachDB201Dialect` when using CockroachDB v21.1.

### jOOQ

**Support level:** Full

You can use [Gradle](https://gradle.org/install) or [Maven](https://maven.apache.org/install.html) to get all dependencies for your application, including jOOQ.

For a simple but complete "Hello World" example app that uses Maven for dependency management, see [Build a Java App with CockroachDB and jOOQ](build-a-java-app-with-cockroachdb-jooq.html).

</section>

<section class="filter-content" markdown="1" data-scope="go">

## Go Drivers

### pgx

**Support level:** Full

To install the [Go pgx driver](https://pkg.go.dev/github.com/jackc/pgx):

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jackc/pgx
~~~

For a simple but complete "Hello World" example app, see [Build a Go App with CockroachDB and the Go pgx Driver](build-a-go-app-with-cockroachdb.html).

### pq

**Support level:** Full

To install the [Go pq driver](https://godoc.org/github.com/lib/pq):

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

For a simple but complete "Hello World" example app, see [Build a Go App with CockroachDB and the Go pq Driver](build-a-go-app-with-cockroachdb.html).

## Go ORM frameworks

### GORM

**Support level:** Full

To install [GORM](http://gorm.io):

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq # dependency
~~~

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/jinzhu/gorm
~~~

For a simple but complete "Hello World" example app, see [Build a Go App with CockroachDB and GORM](build-a-go-app-with-cockroachdb-gorm.html).

</section>

<section class="filter-content" markdown="1" data-scope="ruby">

## Ruby Drivers

### pg

**Support level:** Full

To install the [Ruby pg driver](https://rubygems.org/gems/pg):

{% include copy-clipboard.html %}
~~~ shell
$ gem install pg
~~~

For a simple but complete "Hello World" example app, see [Build a Ruby App with CockroachDB and the Ruby pg Driver](build-a-ruby-app-with-cockroachdb.html).

## Ruby ORM frameworks

### ActiveRecord

**Support level:** Full (5.2), Beta (6.0)

To install ActiveRecord, the [pg driver](https://rubygems.org/gems/pg), and a [CockroachDB Ruby package](https://github.com/cockroachdb/activerecord-cockroachdb-adapter) that accounts for some minor differences between CockroachDB and PostgreSQL:

{% include copy-clipboard.html %}
~~~ shell
$ gem install activerecord pg activerecord-cockroachdb-adapter
~~~

{{site.data.alerts.callout_info}}
The exact command above will vary depending on the desired version of ActiveRecord. Specifically, version 5.1.x of ActiveRecord requires version 0.2.x of the adapter; version 5.2.x of ActiveRecord requires version 5.2.x of the adapter; version 6.0.x of ActiveRecord requires version 6.0.0betax of the adapter.
{{site.data.alerts.end}}

For a simple but complete "Hello World" example app, see [Build a Ruby App with CockroachDB and ActiveRecord](build-a-ruby-app-with-cockroachdb-activerecord.html).

</section>

<section class="filter-content" markdown="1" data-scope="node">

## Node.js Drivers

### pg

**Support level:** Beta

To install the [Node.js pg driver](https://www.npmjs.com/package/pg):

{% include copy-clipboard.html %}
~~~ shell
$ npm install pg
~~~

Some apps might also requires [`async`](https://www.npmjs.com/package/async):

{% include copy-clipboard.html %}
~~~ shell
$ npm install async
~~~

For a simple but complete "Hello World" example app, see [Build a Node.js App with CockroachDB and the Node.js pg Driver](build-a-nodejs-app-with-cockroachdb.html).

## Node.js ORM frameworks

### Sequelize

**Support level:** Beta

To install Sequelize and a [CockroachDB Node.js package](https://github.com/cockroachdb/sequelize-cockroachdb) that accounts for some minor differences between CockroachDB and PostgreSQL:

{% include copy-clipboard.html %}
~~~ shell
$ npm install sequelize sequelize-cockroachdb
~~~

For a simple but complete "Hello World" example app, see [Build a Node.js App with CockroachDB and Sequelize](build-a-nodejs-app-with-cockroachdb-sequelize.html).

</section>

<section class="filter-content" markdown="1" data-scope="c">

## C Drivers

### libpq

**Support level:** Beta

Install the C libpq driver as described in the [official documentation](https://www.postgresql.org/docs/current/libpq.html).

</section>

<section class="filter-content" markdown="1" data-scope="c++">

## C++ Drivers

### libpqxx

**Support level:** Beta

Install the C++ libpqxx driver as described in the [official documentation](https://github.com/jtv/libpqxx).

{{site.data.alerts.callout_info}}
If you are running macOS, you need to install version 4.0.1 or higher of the libpqxx driver.
{{site.data.alerts.end}}

For a simple but complete "Hello World" example app, see [Build a C++ App with CockroachDB and libpqxx](build-a-c++-app-with-cockroachdb.html).

</section>

<section class="filter-content" markdown="1" data-scope="c-sharp">

## C# Drivers

### Npgsql

**Support level:** Beta

1. Create a .NET project:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dotnet new console -o cockroachdb-test-app
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd cockroachdb-test-app
    ~~~

    The `dotnet` command creates a new app of type `console`. The `-o` parameter creates a directory named `cockroachdb-test-app` where your app will be stored and populates it with the required files. The `cd cockroachdb-test-app` command puts you into the newly created app directory.

2. Install the latest version of the [Npgsql driver](https://www.nuget.org/packages/Npgsql/) into the .NET project using the built-in nuget package manager:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ dotnet add package Npgsql
    ~~~

For a simple but complete "Hello World" example app, see [Build a C# App with CockroachDB and the .NET Npgsql Driver](build-a-csharp-app-with-cockroachdb.html).

</section>

<section class="filter-content" markdown="1" data-scope="clojure">

## Clojure Drivers

### leiningen

**Support level:** Beta

Install the Clojure `lein` utility as described in its [official documentation](https://leiningen.org/).

For a simple but complete "Hello World" example app, see [Build a Closure App with CockroachDB and java.jdbc](build-a-clojure-app-with-cockroachdb.html).

</section>

<section class="filter-content" markdown="1" data-scope="php">

## PHP Drivers

### php-pgsql

**Support level:** Beta

Install the php-pgsql driver as described in the [official documentation](http://php.net/manual/en/book.pgsql.php).

For a simple but complete "Hello World" example app, see [Build a PHP App with CockroachDB and the PHP pgsql Driver](build-a-php-app-with-cockroachdb.html).

</section>

<section class="filter-content" markdown="1" data-scope="rust">

## Rust Drivers

### postgres

**Support level:** Beta

Install the Rust Postgres driver as described in the [official documentation](https://crates.io/crates/postgres/).

For a simple but complete "Hello World" example app, see [Build a Rust App with CockroachDB and the Rust Postgres Driver](build-a-rust-app-with-cockroachdb.html).

</section>

<section class="filter-content" markdown="1" data-scope="typescript">

## TypeScript ORM frameworks

### TypeORM

**Support level:** Beta

Install TypeORM as described in the [official documentation](https://typeorm.io/#/).

</section>

## See also

- [Third party database tools](third-party-database-tools.html)
- [Connection parameters](connection-parameters.html)
- [Transactions](transactions.html)
- [Performance best practices](performance-best-practices-overview.html)
