---
title: Connect to Your CockroachCloud Cluster
summary: Learn how to connect and start interacting with your cluster.
toc: true
build_for: [cockroachcloud]
---

This page shows you how to connect to your CockroachCloud cluster.

## Step 1. Authorize your network

CockroachCloud requires you to authorize the networks that can access the cluster to prevent denial-of-service and brute force password attacks:

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.

Use the Console to authorize networks:

1. Navigate to your cluster's **Networking** page.

    The **Networking** page displays a list of authorized networks (i.e., an IP network whitelist) that can access the cluster.

    <img src="{{ 'images/v19.2/cockroachcloud/networking.png' | relative_url }}" alt="Networking page" style="border:1px solid #eee;max-width:100%" />

2. Check if the current network has been authorized. If not, proceed with the following steps.

3. Click the **Add Network** button in the top right corner.

    The **Add Network** modal displays.

    <img src="{{ 'images/v19.2/cockroachcloud/add-network-modal.png' | relative_url }}" alt="Add network" style="border:1px solid #eee;max-width:50%" />

4. (Optional) Enter a descriptive name for the network.

5. From the **Network** dropdown, select:
   - **New Network** to authorize your application server’s network or application server’s network. Enter the public IPv4 address of the machine in the **Network** field.
   - **Current Network** to auto-populate your local machine's IP address.
   - **Public (Insecure)** to allow all networks, use `0.0.0.0/0`. Use this with caution as your cluster will be vulnerable to denial-of-service and brute force password attacks.

     {{site.data.alerts.callout_info}}
     IPv6 addresses are currently not supported.
     {{site.data.alerts.end}}

     To add a range of IP addresses, use the CIDR (Classless Inter-Domain Routing) notation. The CIDR notation is constructed from an IP address (e.g., `192.168.15.161`), a slash (`/`), and a number (e.g., `32`). The number is the count of leading 1-bits in the network identifier. In the example above, the IP address is 32-bits and the number is `32`, so the full IP address is also the network identifier. For more information, see Digital Ocean's [Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).

6. Select whether the network can connect to the cluster's **UI**, **SQL** client, or both.

    The **UI** refers to the cluster's Admin UI, where you can observe your cluster's health and performance. For more information, see [Admin UI Overview](admin-ui-overview.html).

7. Click **Save**.

## Step 2. Create a SQL user

{% include {{ page.version.version }}/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page.

    <img src="{{ 'images/v19.2/cockroachcloud/sql-users.png' | relative_url }}" alt="SQL users" style="border:1px solid #eee;max-width:100%" />

2. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

    <img src="{{ 'images/v19.2/cockroachcloud/add-user-modal.png' | relative_url }}" alt="Add user" style="border:1px solid #eee;max-width:50%" />

3. Enter a **Username**.
4. Enter and confirm the **Password**.
5. Click **Create**.

    Currently, all new users are created with Admin privileges. For more information and to change the default settings, see [Granting privileges](cockroachcloud-authorization.html#granting-privileges) and [Using roles](cockroachcloud-authorization.html#using-roles).

## Step 3. Select a connection method

1. In the top right corner of the Console, click the **Connect** button.

    The **Connect** modal displays.

    <img src="{{ 'images/v19.2/cockroachcloud/connect-modal.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:50%" />    

2. From the **User** dropdown, select the SQL user you created in [Step 2. Create a SQL user](#step-2-create-a-sql-user).
3. From the **Region** dropdown, select the region closest to where your client or application is running.
4. From the **Database** dropdown, select the dabatase you want to connect to.

    The default database is `defaultdb`. For more information, see [Default databases](show-databases.html#default-databases).

5. Click **Continue**.

    The **Connect** tab is displayed.

    <img src="{{ 'images/v19.2/cockroachcloud/connect-tab.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:50%" />

6. Select a connection method:

    You can connect to your cluster using the in-built SQL client or using a Postgres-compatible ORM or driver.

    To connect to your cluster using the [in-built SQL client](#use-the-cockroachdb-sql-client), use the command displayed on the **CockroachDB Client** tab.

    To connect to your cluster [using a Postgres ORM or driver](#use-a-postgres-driver-or-orm), use either the **Connection String** or the **Parameters** as required by your ORM or driver.

7. Click the name of the **ca.crt** file to download the CA certificate.

8. Create a `certs` directory and move the `ca.crt` file to the `certs` directory. The `ca.crt` file must be available on every machine from which you want to connect the cluster and referenced in connection string.

    You will need to replace the `<certs_dir>` placeholders with the path to your certs directory in the CockroachDB client command or the connection string.

## Step 4. Connect to your cluster

### Use the CockroachDB SQL client

The CockroachDB binary comes with a built-in SQL client for executing SQL statements from an interactive shell or directly from the command line. The CockroachDB SQL client is the best tool for executing one-off queries and performing DDL and DML operations.

On the machine where you want to run the CockroachDB SQL client:

1. [Download the CockroachDB binary](install-cockroachdb.html):

    For Mac:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~

    For Linux:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

2. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:

    For Mac:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~

    For Linux:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Use the `cockroach sql` command to open an interactive SQL shell, replacing placeholders in the [client connection method](#step-3-select-a-connection-method) with the correct username, password, and path to the `ca.cert`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>'
    ~~~

    You can add the `--execute` flag to run specific SQL statements directly from the command-line:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=<path to the CA certificate>' \
    --execute="CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);"
    ~~~

4. Execute some [CockroachDB SQL](learn-cockroachdb-sql.html).

{{site.data.alerts.callout_success}}
For more details about the built-in SQL client, and many examples of how to use it, see the [`cockroach sql`](cockroach-sql.html) documentation.
{{site.data.alerts.end}}

### Use a Postgres driver or ORM

You can use the connection string or parameters to connect to the cluster using a PostgreSQL-compatible driver or ORM. The following language-specific versions assume that you have installed the relevant [client drivers](install-client-drivers.html).

For code samples in other languages, see [Build an App with CockroachDB](https://www.cockroachlabs.com/docs/v19.2/build-an-app-with-cockroachdb.html).

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="python">Python</button>
  <button style="width: 15%" class="filter-button" data-scope="go">Go</button>
  <button style="width: 15%" class="filter-button" data-scope="java">Java</button>
  <button style="width: 15%" class="filter-button" data-scope="js">Node.js</button>
</div>

<section class="filter-content" markdown="1" data-scope="python">

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
You must replace the `postgres://` prefix with `cockroachdb://` in the connection string passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/cockroachdb-python%22) dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ python

# Create an engine to communicate with the database. The "cockroachdb://" prefix
# for the engine URL indicates that we are connecting to CockroachDB.
engine = create_engine('cockroachdb://<username>:<password>@<host>:26257/<database>?sslmode=verify-full&sslrootcert=<absolute path to CA certificate>')

~~~

</section>

<section class="filter-content" markdown="1" data-scope="go">

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

</section>

<section class="filter-content" markdown="1" data-scope="js">

Start by choosing the [Node.js pg driver](https://www.npmjs.com/package/pg) or [Sequelize ORM](https://sequelize.readthedocs.io/en/v3/):

- [Node.js pg driver](#node-js-pg-driver)
- [Sequelize ORM](#sequelize-orm)

#### Node.js pg driver

{% include copy-clipboard.html %}
~~~ js

// Connect to the database.
var config = {
    user: '<username>',
    password: '<password>'
    host: '<host>',
    database: '<database_name>',
    port: 26257,
    ssl: {
        ca: fs.readFileSync('<path to the CA certificate>')
            .toString()
    }
};

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

</section>

<section class="filter-content" markdown="1" data-scope="java">

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

- [Deploy a Python To-Do App with Flask, Kubernetes, and CockroachCloud](deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud.html)
