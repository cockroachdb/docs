---
title: Build a Python App with Managed CockroachDB
summary: Learn how to build an application with Managed CockroachDB using SQLAlchemy.
toc: true
build_for: [managed]
---

This tutorial shows you how build a [sample To-Do app](https://github.com/cockroachdb/examples-python/tree/master/flask-sqlalchemy) application with Managed CockroachDB using [SQLAlchemy](https://docs.sqlalchemy.org/en/latest/).

## Step 1: Authorize your local workstation's network

Before you connect to your Managed CockroachDB cluster, you need to authorize your network (i.e., whitelist the public IP address of the machine). Otherwise, connections from this machine will be rejected.

Once you are [logged in](managed-sign-up-for-a-cluster.html#sign-in), you can use the Console to authorize your network:

1. Navigate to your cluster's [Networking](managed-networking-page.html) page.
2. Click the **Add Network** button in the top right corner.

    The **Add Network** modal displays.

    <img src="{{ 'images/v19.1/managed/add-network-modal.png' | relative_url }}" alt="Add network" style="border:1px solid #eee;max-width:100%" />

3. Enter the public IP address of the machine in the **Network** field.

    The IP address should be written in Classless Inter-Domain Routing (CIDR) notation. For example:

    ~~~
    192.168.15.161/32
    ~~~

    The CIDR notation is constructed from an IP address (e.g., `192.168.15.161`), a slash (`/`), and a number (e.g., `32`). The number is the count of leading 1-bits in the network identifier. For the example above, the IP address is 32-bits and the number is `32`, so the full IP address is also the network identifier. For more information see Digital Ocean's [Understanding IP Addresses, Subnets,and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).

    You can use `0.0.0.0/0`, which allows all networks. Use this with caution; anybody who uses your password will be able to access the database, and your cluster will be more exposed if there's ever a security bug. The firewall is an extra layer of defense.

4. Select what the network can connect to: the cluster's **UI**, **SQL** client, or both.

    The **UI** refers to the cluster's Admin UI, where you can observe your cluster's health and performance. For more information, see [Admin UI Overview](admin-ui-overview.html).

5. Click **Save**.

## Step 2: Create a SQL user

1. Navigate to your cluster's **SQL Users** page.
2. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

    <img src="{{ 'images/v19.1/managed/add-user-modal.png' | relative_url }}" alt="Add user" style="border:1px solid #eee;max-width:100%" />

3. In the **Username** field, enter `maxroach`.
4. In the **Password** field, enter `Q7gc8rEdS`.
5. Click **Create**.

    Currently, all new users are created with full privileges. For more information and to change the default settings, see [Granting privileges](managed-authorization.html#granting-privileges) and [Using roles](managed-authorization.html#using-roles).

## Step 3: Generate the CockroachDB client connection string

On the machine where you want to run your application:

1. In the top right corner of the Console, click the **Connect** button.

    The **Connect** modal displays.

    <img src="{{ 'images/v19.1/managed/connect-modal.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:100%" />

3. From the **User** dropdown, select `maxroach`.
4. Select a **Region** to connect to.
5. From the **Database** dropdown, select `defaultdb`.
6. On the **Connect from Shell** tab, click **Copy connection string**.

    This is how you will access the built-in SQL client later. You will need to replace the `<certs_dir>` placeholders with the path to your `certs` directory.

7. Click the **Download ca.crt** button.
8. Create a `certs` directory on your local workstation and move the `ca.crt` file to the `certs` directory.

## Step 4: Create the Managed CockroachDB database

On the machine where you want to run the CockroachDB SQL client:

1. [Download the CockroachDB binary](install-cockroachdb.html):

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~
    </section>

2. Copy the binary into the `PATH` so it's easy to run the SQL client from any location:

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin
    ~~~
    </section>

3. Use the connection string generated in Step 3 to connect to CockroachDB's built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --url 'postgres://maxroach@<region>.<cluster_name>:26257/defaultdb?sslmode=verify-full&sslrootcert=<certs_dir>/<ca.crt>'
    ~~~

2. Create a database `todos`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > create database todos;
    ~~~

3. Use database `todos`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > USE todos;
    ~~~

3. Create a table `todos`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE todos (
  	todo_id INT8 NOT NULL DEFAULT unique_rowid(),
  	title VARCHAR(60) NULL,
  	text VARCHAR NULL,
  	done BOOL NULL,
  	pub_date TIMESTAMP NULL,
  	CONSTRAINT "primary" PRIMARY KEY (todo_id ASC),
  	FAMILY "primary" (todo_id, title, text, done, pub_date)
    );
    ~~~

## Step 5: Configure the sample Python app

1. In a new tab, install SQLAlchemy:

    To install SQLAlchemy, as well as a [CockroachDB Python package](https://github.com/cockroachdb/cockroachdb-python) that accounts for some differences between CockroachDB and PostgreSQL, run the following command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pip install sqlalchemy cockroachdb
    ~~~

    For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

2. Clone the `examples-python` repository to your local machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ git clone https://github.com/cockroachdb/examples-python
    ~~~

3. Navigate to the flask-alchemy folder:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cd examples-python/flask-sqlalchemy
    ~~~

## Step 6. Generate the application connection string

  1. In the top right corner of the Console, click the **Connect** button.

      The **Connect** modal displays.

        <img src="{{ 'images/v19.1/managed/connect-modal.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:100%" />

  2. From the **User** dropdown, select `maxroach`.
  3. Select a **Region** to connect to.
  4. From the **Database** dropdown, select `todos`.
  5. On the **Connect Your App** tab, click **Copy connection string**.

      You will need to replace the `<password>` and `<certs_dir>` placeholders with your SQL username's password and the absolute path to your `certs` directory, respectively.

## Step 7. Connect the application to the database

  1. Go back to the `flask-alchemy` folder.
  2. In the `hello.cfg` file, replace the value for the `SQLALCHEMY_DATABASE_URI` with the application connection string you generated in Step 6.

  {% include copy-clipboard.html %}
  ~~~
  SQLALCHEMY_DATABASE_URI = 'cockroachdb://maxroach:Q7gc8rEdS@<region>.<cluster_name>:26257/todos?sslmode=verify-full&sslrootcert=<absolute path to CA certificate>'
  ~~~

  {{site.data.alerts.callout_info}}
  You must use the `cockroachdb://` prefix in the URL passed to [`sqlalchemy.create_engine`](https://docs.sqlalchemy.org/en/latest/core/engines.html?highlight=create_engine#sqlalchemy.create_engine) to make sure the [`cockroachdb`](https://github.com/cockroachdb/cockroachdb-python") dialect is used. Using the `postgres://` URL prefix to connect to your CockroachDB cluster will not work.
  {{site.data.alerts.end}}

## Step 8. Test the application

  1. Run the `hello.py` code:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python hello.py
    ~~~

    The application should run at [http://localhost:80](http://localhost:80)

  2. Enter a new to-do item.

  3. Verify if the user interface reflects the new to-do item added to the database.
