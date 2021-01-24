---
title: Connect to a CockroachCloud Free Cluster
summary: Learn how to connect and start interacting with your free cluster.
toc: true
---

<div class="filters clearfix">
    <a href="connect-to-your-cluster.html"><button class="filter-button page-level"><strong>CockroachCloud</strong></button></a>
    <a href="connect-to-a-free-cluster.html"><button class="filter-button page-level current"><strong>CockroachCloud Free</strong></button></a>
</div>

This page shows you how to connect to your CockroachCloud Free (beta) cluster.

{% include cockroachcloud/limited-availability.md %}

## Before you start

- These steps assume you have already [created a free cluster](create-a-free-cluster.html).
- _(Optional)_ [Create a new SQL user](user-authorization.html#create-a-sql-user).

## Step 1. Select a connection method

1. In the top right corner of the CockroachCloud Console, click the **Connect** button.

    The **Connection info** modal displays on the **Step 2. Connect > CockroachDB client** subtab.

1. _(Optional)_ To configure your connection information, click **Go Back**:
    - Select the **SQL User** you want to connect with.
    - Select the **Database** you want to connect to.
    - Click **Next**.

1. Select a connection method (the instructions below will adjust accordingly):

    <div class="filters clearfix">
        <button class="filter-button page-level" data-scope="cockroachdb-client">CockroachDB client</button>
        <button class="filter-button page-level" data-scope="your-app">Your app</button>
        <button class="filter-button page-level" data-scope="your-tool">Your tool</button>
    </div>
<p></p>

## Step 2. Connect to your cluster

<section class="filter-content" markdown="1" data-scope="cockroachdb-client">

To connect to your cluster with the [built-in SQL client](../v20.2/cockroach-sql.html):

1. Click the name of the `cc-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `cc-ca.crt` file to the `certs` directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv <path>/<to>/cc-ca.crt <path>/<to>/certs
    ~~~

    For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv Users/maxroach/Downloads/cc-ca.crt Users/maxroach/certs
    ~~~    

1. If you have not done so already, [download the CockroachDB binary](../stable/install-cockroachdb.html).
1. Copy the [`cockroach sql`](../v20.2/cockroach-sql.html) command and connection string provided, which will be used in the next step (and to connect to your cluster in the future).
1. In your terminal, enter the copied `cockroach sql` command and connection string to start the [built-in SQL client](../v20.2/cockroach-sql.html).

    Be sure to replace the `<your_certs_ directory>` placeholder with the path to the `certs` directory you created earlier.

1. Enter the SQL user's password and hit enter.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}

    You are now connected to the built-in SQL client, and can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html).
</section>

<section class="filter-content" markdown="1" data-scope="your-app">
To connect to your cluster with your application:

1. Click the name of the `cc-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `cc-ca.crt` file to the `certs` directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv <path>/<to>/cc-ca.crt <path>/<to>/certs
    ~~~

    For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv Users/maxroach/Downloads/cc-ca.crt Users/maxroach/certs
    ~~~    

1. Copy the connection string provided, which will be used to connect your application to CockroachCloud Free (beta).
1. Add your copied connection string to your application code.

    Be sure to replace the `<your_certs_ directory>` placeholder with the path to the `certs` directory you created earlier.

    {{site.data.alerts.callout_info}}
    If you forget your SQL user's password, a Console Admin can change the password on the **SQL Users** page.
    {{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="your-tool">
To connect to your cluster with your tool:

Use the connection parameters provided to connect to the cluster using a PostgreSQL-compatible driver or ORM. The following language-specific versions assume that you have installed the relevant [client drivers](../stable/install-client-drivers.html):

- [Python](#python)
- [Go](#go)
- [JavaScript](#javascript)
- [Java](#java)

For code samples in other languages, see [Build an App with CockroachDB](https://www.cockroachlabs.com/docs/v20.2/build-an-app-with-cockroachdb.html).

### Python

Start by choosing the [Python psycopg2 driver](http://initd.org/psycopg/docs/) or SQLAlchemy [ORM](https://docs.sqlalchemy.org/en/latest/):

- [psycopg2 driver](#psycopg2-driver)
- [SQLAlchemy ORM](#sqlalchemy-orm)

#### psycopg2 driver

{% include copy-clipboard.html %}
~~~ python
# Import the driver.
import psycopg2

# Connect to the database.
conn = psycopg2.connect(
    user='<username>',
    password='<password>',
    host='<host>',
    port=26257,
    database='<database_name>',
    sslmode='verify-full',
    sslrootcert='<path to the CA certificate>'
)

~~~

#### SQLAlchemy ORM

{{site.data.alerts.callout_info}}
You must replace the `postgres://` prefix with `cockroachdb://` in the connection string passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/sqlalchemy-cockroachdb) dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ python

# Create an engine to communicate with the database. The "cockroachdb://" prefix
# for the engine URL indicates that we are connecting to CockroachDB.
engine = create_engine('cockroachdb://<username>:<password>@<host>:26257/<database>?sslmode=verify-full&sslrootcert=<absolute path to CA certificate>')

~~~

### Go

Start by choosing the [Go pq driver](https://godoc.org/github.com/lib/pq) or [GORM ORM](http://gorm.io/):

- [Go pq driver](#go-pq-driver)
- [GORM](#gorm)

#### Go pq driver

{% include copy-clipboard.html %}
~~~ go
  //Connect to the database.
	db, err := sql.Open(
		"postgres",
		"postgresql://<username>:<password>@<host>:26257/<database>?sslmode=verify-full&sslrootcert=<absolute path to CA certificate>",
	)
	if err != nil {
		log.Fatal("error connecting to the database: ", err)
	}

~~~

#### GORM

{% include copy-clipboard.html %}
~~~ go

  // Connect to the database.
    const addr = "postgresql://<username>:<password>@<host>:26257/<database>?sslmode=verify-full&sslrootcert=<absolute path to CA certificate>"
    db, err := gorm.Open("postgres", addr)
    if err != nil {
        log.Fatal(err)
    }
~~~

### JavaScript

Start by choosing the [Node.js pg driver](https://www.npmjs.com/package/pg) or [Sequelize ORM](https://sequelize.readthedocs.io/en/v3/):

- [Node.js pg driver](#node-js-pg-driver)
- [Sequelize ORM](#sequelize-orm)

**Node.js pg driver**

{% include copy-clipboard.html %}
~~~ js
var fs = require('fs');
var pg = require('pg');

// Connect to the database.
var config = {
    user: '<username>',
    password: '<password>',
    host: '<host>',
    database: '<database_name>',
    port: 26257,
    ssl: {
        ca: fs.readFileSync('<path to the CA certificate>')
            .toString()
    }
};

var pool = new pg.Pool(config);

pool.connect(function (err, client, done) {
    // Your code goes here.
    // For more information, see the 'node-postgres' docs:
    // https://node-postgres.com
}
~~~

#### Sequelize ORM

{% include copy-clipboard.html %}
~~~ js
// Connect to CockroachDB through Sequelize.
var sequelize = new Sequelize('<database_name>', '<username>', '<password>', {
    host: '<host>',
    dialect: 'postgres',
    port: 26257,
    logging: false,
    dialectOptions: {
        ssl: {
            ca: fs.readFileSync('<path to the CA certificate>')
                .toString()
        }
    }
});
~~~

### Java

Start by choosing the [Java JBDC driver](https://jdbc.postgresql.org/) or [Hibernate ORM](http://hibernate.org/):

- [Java JBDC driver](#java-jbdc-driver)
- [Hibernate ORM](#hibernate-orm)

#### Java JBDC driver

{% include copy-clipboard.html %}
~~~ java

// Configure the database connection.
        PGSimpleDataSource ds = new PGSimpleDataSource();
        ds.setServerName("<host>");
        ds.setPortNumber(26257);
        ds.setDatabaseName("<database_name>");
        ds.setUser("<username>");
        ds.setPassword("<password>");
        ds.setSsl(true);
        ds.setSslMode("verify-full");
        ds.setSslCert("<path to the CA certificate>");
~~~

#### Hibernate ORM

{% include copy-clipboard.html %}
~~~ java

    //Database connection settings
        <property name="hibernate.connection.driver_class">org.postgresql.Driver</property>
         <property name="hibernate.dialect">org.hibernate.dialect.PostgreSQL95Dialect</property>
        <property name="hibernate.connection.url"><![CDATA[jdbc:postgresql://<username>:<password>@<host>:26257/<database>?sslmode=verify-full&sslrootcert=<absolute path to CA certificate]]></property>
        <property name="hibernate.connection.username">username</property>
~~~

</section>

## What's next

- [Build a "Hello, World" app](build-a-python-app-with-cockroachdb-django.html)
- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachCloud](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
