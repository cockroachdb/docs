---
title: Client Connection Reference
summary: How to connect to a CockroachDB cluster from different tools
toc: true
---

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="serverless">{{ site.data.products.serverless-plan }}</button>
  <button class="filter-button page-level" data-scope="dedicated">{{ site.data.products.dedicated }}</button>
  <button class="filter-button page-level" data-scope="core">{{ site.data.products.core }}</button>
</div>

This page documents the required connection configuration for each [fully-supported, third-party tool](third-party-database-tools.html).

For a list of all supported cluster connection parameters, see the [`cockroach` Connection Parameters](connection-parameters.html).

<div class="filters clearfix">
<button class="filter-button page-level" data-scope="js-ts">JavaScript/TypeScript</button>
  <button class="filter-button page-level" data-scope="python">Python</button>
  <button class="filter-button page-level" data-scope="go">Go</button>
  <button class="filter-button page-level" data-scope="java">Java</button>
  <button class="filter-button page-level" data-scope="ruby">Ruby</button>
</div>

<section class="filter-content" markdown="1" data-scope="js-ts">

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="node-postgres">node-postgres</button>
  <button class="filter-button page-level" data-scope="sequelize">Sequelize</button>
  <button class="filter-button page-level" data-scope="typeorm">TypeORM</button>
</div>

<section class="filter-content" markdown="1" data-scope="node-postgres">

## Connect with node-postgres

To connect to CockroachDB with [node-postgres](https://node-postgres.com), create a new [`Client`](https://node-postgres.com/api/client) object with a connection string.

For example:

{% include copy-clipboard.html %}
~~~ js
const { Client } = require('pg')

const connectionString = '<connection-string>'
const client = new Client({
  connectionString,
})

client.connect()
~~~

node-postgres accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=verify-full&options=--cluster%3D<routing-id>
~~~

For more information about connecting with node-postgres, see the [official node-postgres documentation](https://node-postgres.com/features/connecting).

</section>

<section class="filter-content" markdown="1" data-scope="sequelize">

To connect to CockroachDB with [Sequelize](https://sequelize.org), create a `Sequelize` object with the [CockroachDB Sequelize adapter](https://github.com/cockroachdb/sequelize-cockroachdb).

For example:

{% include copy-clipboard.html %}
~~~ js
const Sequelize = require("sequelize-cockroachdb");

const sequelize = new Sequelize('<connection-string>')
~~~

Sequelize versions 6.10 and later accept the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=verify-full&options=--cluster%3D<routing-id>
~~~

For Sequelize versions 6.9 and earlier, use the following format:

~~~
postgresql://<username>:<password>@<host>:<port>/<routing-id>.<database>?ssl=true
~~~

{{site.data.alerts.callout_info}}
To connect to CockroachDB with Sequelize, you must install the [CockroachDB Sequelize adapter](https://github.com/cockroachdb/sequelize-cockroachdb).
{{site.data.alerts.end}}

For more information about connecting with Sequelize, see the [official Sequelize documentation](https://sequelize.org/master/index.html).

</section>

<section class="filter-content" markdown="1" data-scope="typeorm">

To connect to CockroachDB with [TypeORM](https://typeorm.io), update your project's `ormconfig` file with the required connection properties.

For example, suppose that you have a file named `ormconfig.json` in the project's root directory:

{% include copy-clipboard.html %}
~~~ json
{
    "type": "cockroachdb",
    "url": "<connection-string>",
    "ssl": true,
    "extra": {
      "options": "--cluster=<routing-id>"
    },
}
~~~

TypeORM accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://<username>:<password>@<host>:<port>/<database>
~~~

You can then call `createConnection` without any parameters:

{% include copy-clipboard.html %}
~~~ ts
import {createConnection} from "typeorm";

// createConnection method will automatically read connection options
// from your ormconfig file or environment variables
const connection = await createConnection();
~~~

`createConnection` will use the properties set in `ormconfig.json` to connect to your cluster.

TypeORM supports `ormconfig` in the following formats: `.json`, `.js`, `.ts`, `.env`, `.yml` and `.xml`.

For more information about connecting with TypeORM, see the [official TypeORM documentation](https://typeorm.io/#/connection).

</section>

### Connection parameters

Parameter | Description
----------|------------
`<username>`  | The [SQL user](authorization.html#sql-users) connecting to the cluster.
`<password>`  | The password for the SQL user connecting to the cluster.
`<host>`  | The host on which the CockroachDB node is running.
`<port>`  | The port at which the CockroachDB node is listening.
`<database>`  | The name of the (existing) database.
`<routing-id>`  | The routing ID of the CockroachDB cluster.

</section>

<section class="filter-content" markdown="1" data-scope="python">

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="psycopg">Psycopg2</button>
  <button class="filter-button page-level" data-scope="sqlalchemy">SQLAlchemy</button>
  <button class="filter-button page-level" data-scope="django">Django</button>
</div>

{{site.data.alerts.callout_info}}
To connect to a {{ site.data.products.serverless-plan }} cluster from a Python application, you must have a valid CA certificate located at <code>~/.postgresql/root.crt</code>.<br>For instructions on downloading a CA certificate from the {{ site.data.products.db }} Console, see <a href="https://www.cockroachlabs.com/docs/v21.2/cockroachcloud/connect-to-a-serverless-cluster.html">Connect to a {{ site.data.products.serverless-plan }} Cluster</a>.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="psycopg">

## Connect with Psycopg2

To connect to CockroachDB with [Psycopg2](https://www.psycopg.org), pass a connection string to the [`psycopg2.connect` function](https://www.psycopg.org/docs/connection.html).

For example:

{% include copy-clipboard.html %}
~~~ python
import psycopg2

conn = psycopg2.connect('{connection-string}')
~~~

Psycopg2 accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&options=--cluster%3D{routing-id}
~~~

For more information about connecting with Psycopg, see the [official Psycopg documentation](https://www.psycopg.org/docs).

</section>

<section class="filter-content" markdown="1" data-scope="sqlalchemy">

## Connect with SQLAlchemy

To connect to CockroachDB with [SQLAlchemy](http://docs.sqlalchemy.org/en/latest), [create an `Engine` object](https://docs.sqlalchemy.org/en/14/core/engines.html) by passing the connection string to the `create_engine` function.

For example:

{% include copy-clipboard.html %}
~~~ python
from sqlalchemy import create_engine

engine = create_engine('{connection-string}')
engine.connect()
~~~

SQLAlchemy accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
cockroachdb://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&options=--cluster%3D{routing-id}
~~~

{{site.data.alerts.callout_info}}
To connect to CockroachDB with SQLAlchemy, you must install the [CockroachDB SQLAlchemy adapter](https://github.com/cockroachdb/sqlalchemy-cockroachdb).
{{site.data.alerts.end}}

For more information about connecting with SQLAlchemy, see the [official SQLAlchemy documentation](https://docs.sqlalchemy.org/en/14/core/engines_connections.html).

</section>

<section class="filter-content" markdown="1" data-scope="django">

## Connect with Django

To connect to CockroachDB from a [Django](https://www.djangoproject.com) application, update the `DATABASES` property in the project's `settings.py` file.

Django accepts the following format for CockroachDB connection information:

{% include copy-clipboard.html %}
~~~
## settings.py

...

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

...
~~~

{{site.data.alerts.callout_info}}
To connect to CockroachDB with Django, you must install the [CockroachDB Django adapter](https://github.com/cockroachdb/django-cockroachdb).
{{site.data.alerts.end}}

For more information about connecting with Django, see the [official Django documentation](https://docs.djangoproject.com/en/3.0).

</section>

### Connection parameters

Parameter | Description
----------|------------
`{username}`  | The [SQL user](authorization.html#sql-users) connecting to the cluster.
`{password}`  | The password for the SQL user connecting to the cluster.
`{host}`  | The host on which the CockroachDB node is running.
`{port}`  | The port at which the CockroachDB node is listening.
`{database}`  | The name of the (existing) database.
`{routing-id}`  | The routing ID of the CockroachDB cluster.

</section>

<section class="filter-content" markdown="1" data-scope="go">

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="pgx">pgx</button>
  <button class="filter-button page-level" data-scope="pq">pq</button>
  <button class="filter-button page-level" data-scope="gorm">GORM</button>
</div>

<section class="filter-content" markdown="1" data-scope="pgx">

## Connect with pgx

To connect to CockroachDB with [pgx](https://github.com/jackc/pgx), use the `pgx.Connect` function.

For example:

{% include copy-clipboard.html %}
~~~ go
package main

import (
  "context"

  "github.com/jackc/pgx/v4"
)

func main() {
  conn, err := pgx.Connect(context.Background(), "{connection-string}")
  if err != nil {
    log.Fatal(err)
  }
  defer conn.Close(context.Background())
}
~~~

pgx accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&options=--cluster%3D{routing-id}
~~~

For more information about connecting with pgx, see the [official pgx documentation](https://pkg.go.dev/github.com/jackc/pgx).

</section>

<section class="filter-content" markdown="1" data-scope="pq">

## Connect with pq

To connect to CockroachDB with [pq](https://godoc.org/github.com/lib/pq), use the [`sql.Open` function](https://go.dev/doc/tutorial/database-access).

For example:

{% include copy-clipboard.html %}
~~~ go
package main

import (
	"database/sql"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "{connection-string}"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

}
~~~

pq accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&options=--cluster%3D{routing-id}
~~~

For more information about connecting with pq, see the [official pq documentation](https://pkg.go.dev/github.com/lib/pq).

</section>

<section class="filter-content" markdown="1" data-scope="gorm">

## Connect with GORM

To connect to CockroachDB with [GORM](http://gorm.io), use the `gorm.Open` function, with the GORM `postgres` driver.

For example:

{% include copy-clipboard.html %}
~~~ go
import (
  "gorm.io/driver/postgres"
  "gorm.io/gorm"
)

dsn := "{connection-string}"
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
~~~

GORM accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&options=--cluster%3D{routing-id}
~~~

For more information about connecting with GORM, see the [official GORM documentation](https://gorm.io/docs).

</section>

### Connection parameters

Parameter | Description
----------|------------
`{username}`  | The [SQL user](authorization.html#sql-users) connecting to the cluster.
`{password}`  | The password for the SQL user connecting to the cluster.
`{host}`  | The host on which the CockroachDB node is running.
`{port}`  | The port at which the CockroachDB node is listening.
`{database}`  | The name of the (existing) database.
`{routing-id}`  | The routing ID of the CockroachDB cluster.

</section>

<section class="filter-content" markdown="1" data-scope="java">

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="jdbc">JDBC</button>
  <button class="filter-button page-level" data-scope="hibernate">Hibernate</button>
</div>


<section class="filter-content" markdown="1" data-scope="jdbc">

## Connect with JDBC

To connect to CockroachDB with the [JDBC](https://jdbc.postgresql.org) driver, create a `DataSource` object ([`PGSimpleDataSource` or `PGPoolingDataSource`](https://jdbc.postgresql.org/documentation/head/ds-ds.html)), and set the connection string with the `setUrl` class method.

For example:

{% include copy-clipboard.html %}
~~~ java
import java.io.*;
import org.postgresql.ds.PGSimpleDataSource;

PGSimpleDataSource ds = new PGSimpleDataSource();
ds.setUrl("{connection-string}");
~~~

JDBC accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
jdbc:postgresql://{host}:{port}/{database}?user={username}&password={password}&sslmode=verify-full&sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory&options=--cluster%3D{routing-id}
~~~

For more information about connecting with JDBC, see the [official JDBC documentation](https://jdbc.postgresql.org/documentation/head/index.html).

</section>

<section class="filter-content" markdown="1" data-scope="hibernate">

## Connect with Hibernate

To connect to CockroachDB with [Hibernate](https://hibernate.org/orm) ORM, update the project's `hibernate.cfg.xml` file.

{% include copy-clipboard.html %}
~~~ xml
...
<hibernate-configuration>
    <session-factory>

        <!-- Database connection settings -->
        <property name="hibernate.connection.driver_class">org.postgresql.Driver</property>
        <property name="hibernate.dialect">org.hibernate.dialect.CockroachDB201Dialect</property>
        <property name="hibernate.connection.url">{connection-string}</property>

        ...
    </session-factory>
</hibernate-configuration>
~~~

Hibernate accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
jdbc:postgresql://{host}:{port}/{database}?user={username}&amp;password={password}&amp;sslmode=verify-full&amp;sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory&amp;options=--cluster%3D{routing-id}
~~~

{{site.data.alerts.callout_info}}
To connect to CockroachDB with Hibernate, you must specify the [CockroachDB Hibernate dialect](https://www.cockroachlabs.com/docs/v21.2/install-client-drivers?filters=java#hibernate) in your Hibernate configuration file.
{{site.data.alerts.end}}

For more information about connecting with Hibernate, see the [official Hibernate documentation](https://hibernate.org/orm/documentation).

</section>

### Connection parameters

Parameter | Description
----------|------------
`{host}`  | The host on which the CockroachDB node is running.
`{port}`  | The port at which the CockroachDB node is listening.
`{database}`  | The name of the (existing) database.
`{username}`  | The [SQL user](authorization.html#sql-users) connecting to the cluster.
`{password}`  | The password for the SQL user connecting to the cluster.
`{routing-id}`  | The routing ID of the CockroachDB cluster.

</section>

<section class="filter-content" markdown="1" data-scope="ruby">

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="ruby-pg">pg</button>
  <button class="filter-button page-level" data-scope="activerecord">ActiveRecord</button>
</div>

{{site.data.alerts.callout_info}}
To connect to a {{ site.data.products.serverless-plan }} cluster from a Ruby application, you must have a valid CA certificate located at <code>~/.postgresql/root.crt</code>.<br>For instructions on downloading a CA certificate from the {{ site.data.products.db }} Console, see <a href="https://www.cockroachlabs.com/docs/v21.2/cockroachcloud/connect-to-a-serverless-cluster.html">Connect to a {{ site.data.products.serverless-plan }} Cluster</a>.
{{site.data.alerts.end}}

<section class="filter-content" markdown="1" data-scope="ruby-pg">

## Connect with pg

To connect to CockroachDB with the [Ruby pg](https://rubygems.org/gems/pg) driver, use the `PG.connect` function.

For example:

{% include copy-clipboard.html %}
~~~ ruby
#!/usr/bin/env ruby

require 'pg'

conn = PG.connect('{connection-string}')
~~~

pg accepts the following format for CockroachDB connection strings:

{% include copy-clipboard.html %}
~~~
postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&options=--cluster%3D{routing-id}
~~~

For more information about connecting with pg, see the [official pg documentation](https://www.rubydoc.info/gems/pg).

</section>

<section class="filter-content" markdown="1" data-scope="activerecord">

## Connect with ActiveRecord

To connect to CockroachDB with [ActiveRecord](https://github.com/rails/rails/tree/main/activerecord) from a Rails app, update the database configuration in `config/database.yml`:

~~~ yaml
default: &default
  adapter: cockroachdb
  url: postgresql://{username}:{password}@{host}:{port}/{database}?sslmode=verify-full&options=--cluster%3D{routing-id}

...
~~~

{{site.data.alerts.callout_info}}
To connect to CockroachDB with ActiveRecord, you must install the [ActiveRecord CockroachDB adapter](https://rubygems.org/gems/activerecord-cockroachdb-adapter).
{{site.data.alerts.end}}

For more information about connecting with ActiveRecord, see the [official ActiveRecord documentation](https://guides.rubyonrails.org/active_record_querying.html).

</section>

### Connection parameters

Parameter | Description
----------|------------
`{username}`  | The [SQL user](authorization.html#sql-users) connecting to the cluster.
`{password}`  | The password for the SQL user connecting to the cluster.
`{host}`  | The host on which the CockroachDB node is running.
`{port}`  | The port at which the CockroachDB node is listening.
`{database}`  | The name of the (existing) database.
`{routing-id}`  | The routing ID of the CockroachDB cluster.

</section>

## See also

- [Connection Pooling](connection-pooling.html)
- [`cockroach` Connection Parameters](connection-parameters.html)
- [Example Apps](example-apps.html)

