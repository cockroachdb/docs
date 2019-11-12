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

    <img src="{{ 'images/v19.1/cockroachcloud/networking.png' | relative_url }}" alt="Networking page" style="border:1px solid #eee;max-width:100%" />

2. Check if the current network has been authorized. If not, proceed with the following steps.

3. Click the **Add Network** button in the top right corner.

    The **Add Network** modal displays.

    <img src="{{ 'images/v19.1/cockroachcloud/add-network-modal.png' | relative_url }}" alt="Add network" style="border:1px solid #eee;max-width:100%" />

4. (Optional) Enter a descriptive name for the network.

5. From the **Network** dropdown, select:

         - **New Network** to authorize your application server’s network or application server’s network. Enter the public IPv4 address of the machine in the **Network** field.

         - **Current Network** to auto-populate your local machine's IP address.

         - **Public (Insecure)** to allow all networks, use `0.0.0.0/0`. Use this with caution as your cluster will be vulnerable to denial-of-service and brute force password attacks.

      {{site.data.alerts.callout_info}}
      IPv6 addresses are currently not supported.
      {{site.data.alerts.end}}

      If you need to add a range of IP addresses, use the CIDR (Classless Inter-Domain Routing) notation.

      The CIDR notation is constructed from an IP address (e.g., `192.168.15.161`), a slash (`/`), and a number (e.g., `32`). The number is the count of leading 1-bits in the network identifier. In the example above, the IP address is 32-bits and the number is `32`, so the full IP address is also the network identifier. For more information, see Digital Ocean's [Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).

6. Select whether the network can connect to the cluster's **UI**, **SQL** client, or both.

    The **UI** refers to the cluster's Admin UI, where you can observe your cluster's health and performance. For more information, see [Admin UI Overview](admin-ui-overview.html).

7. Click **Save**.

## Step 2. Create a SQL user

{% include {{ page.version.version }}/cockroachcloud-ask-admin.md %}

1. Navigate to your cluster's **SQL Users** page.

    <img src="{{ 'images/v19.1/cockroachcloud/sql-users.png' | relative_url }}" alt="SQL users" style="border:1px solid #eee;max-width:100%" />

2. Click the **Add User** button in the top right corner.

    The **Add User** modal displays.

    <img src="{{ 'images/v19.1/cockroachcloud/add-user-modal.png' | relative_url }}" alt="Add user" style="border:1px solid #eee;max-width:100%" />

3. Enter a **Username**.
4. Enter and confirm the **Password**.
5. Click **Create**.

    Currently, all new users are created with Admin privileges. For more information and to change the default settings, see [Granting privileges](cockroachcloud-authorization.html#granting-privileges) and [Using roles](cockroachcloud-authorization.html#using-roles).

## Step 3. Generate the connection string

On the machine from which you want to connect to your cluster:

1. In the top right corner of the Console, click the **Connect** button.

    The **Connect** modal displays.

    <img src="{{ 'images/v19.1/cockroachcloud/connect-modal.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:100%" />    

2. From the **User** dropdown, select the SQL user you created in [Step 2. Create a SQL user](#step-2-create-a-sql-user).
3. From the **Region** dropdown, select the region closest to where your client or application is running.
4. From the **Database** dropdown, select the dabatase you want to connect to.

    The default database is `defaultdb`. For more information, see [Default databases](show-databases.html#default-databases).

5. Click **Continue**.

    The **Connect** tab is displayed.

    <img src="{{ 'images/v19.1/cockroachcloud/connect-tab.png' | relative_url }}" alt="Connect to cluster" style="border:1px solid #eee;max-width:100%" />

6. Select a connection option:

           - The **Parameters** tab is displayed by default. You can use the parameters to connect to the cluster using a Postgres driver such as the [psycopg2 driver](#psycopg2-driver).

           - Click **Connection String** to view the application connection string. You can use the application connection string to connect to the cluster using a Postgres ORM such as the [SQLAlchemy ORM](#sqlalchemy-orm).

              You will need to replace the `<password>` and `<certs_dir>` placeholders with your SQL username's password and the path to your `certs` directory, respectively.

           - Click **CockroachDB Client** to view the client connection string. You can use the client connection string to access the [built-in SQL client](#use-the-cockroachdb-sql-client).

    You will need to replace the `<certs_dir>` placeholder with  the path to your `certs` directory.

7. Click the name of the **ca.crt** file to download the CA certificate.

8. Create a `certs` directory and move the `ca.crt` file to the `certs` directory. The `ca.crt` file must be available on every machine from which you want to connect the cluster and referenced in connection strings.

## Step 4. Connect to the cluster

### Use the CockroachDB SQL client

The CockroachDB binary comes with a built-in SQL client for executing SQL statements from an interactive shell or directly from the command line. The CockroachDB SQL client is the best tool for executing one-off queries and performing DDL and DML operations.

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
    $ cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

3. Use the `cockroach sql` command to open an interactive SQL shell, replacing placeholders in the [client connection string](#step-3-generate-the-connection-string) with the correct username, password, and path to the `ca.cert`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=certs/ca.crt'
    ~~~

    You can add the `--execute` flag to run specific SQL statements directly from the command-line:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=certs/ca.crt' \
    --execute="CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);"
    ~~~

4. Execute some [CockroachDB SQL](learn-cockroachdb-sql.html).

{{site.data.alerts.callout_success}}
For more details about the built-in SQL client, and many examples of how to use it, see the [`cockroach sql`](use-the-built-in-sql-client.html) documentation.
{{site.data.alerts.end}}

### Use a Postgres driver or ORM

These steps show you how to connect simple Python test applications to your CockroachCloud cluster with the [psycopg2 driver](http://initd.org/psycopg/docs/) or the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/). For code samples in other languages, see [Build an App with CockroachDB](build-an-app-with-cockroachdb.html).

Start by choosing the Python driver or ORM:

- [psycopg2 driver](#psycopg2-driver)
- [SQLAlchemy ORM](#sqlalchemy-orm)

#### psycopg2 driver

On the machine where you want to run your application:

1. Install the Python psycopg2 driver:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pip install psycopg2
    ~~~

    For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

2. Run code to execute basic SQL statements, creating a table, inserting some rows, and reading and printing the rows.

    1. Create a `basic-sample.py` file and copy the code into it, replacing placeholders in the connection parameters with the [connection details](#step-3-generate-the-connection-string) and the appropriate SQL user and password:

        {{site.data.alerts.callout_info}}
        For `host`, be sure to use the load balancer hostname for the region closest to your client. Load balancer hostnames are identified in the initial confirmation details you received from Cockroach Labs.
        {{site.data.alerts.end}}

        {% include copy-clipboard.html %}
        ~~~ python
        # Import the driver.
        import psycopg2

        # Connect to the database.
        conn = psycopg2.connect(
            user='<username>',
            password='<password>',
            host='<load balancer host>',
            port=26257,
            database='<database>',
            sslmode='require',
            sslrootcert='certs/ca.crt'
        )

        # Make each statement commit immediately.
        conn.set_session(autocommit=True)

        # Open a cursor to perform database operations.
        cur = conn.cursor()

        # Create an "accounts" table.
        cur.execute("CREATE TABLE IF NOT EXISTS accounts (id INT PRIMARY KEY, balance INT)")

        # Insert two rows into the "accounts" table.
        cur.execute("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 250)")

        # Print out the balances.
        cur.execute("SELECT id, balance FROM accounts")
        rows = cur.fetchall()
        print('Initial balances:')
        for row in rows:
            print([str(cell) for cell in row])

        # Close the database connection.
        cur.close()
        conn.close()
        ~~~

    2. Run the code:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ python basic-sample.py
        ~~~

        The output should be:

        ~~~
        Initial balances:
        ['1', '1000']
        ['2', '250']
        ~~~

3. Now run code to connect to your cluster, this time executing a batch of statements as an [atomic transaction](transactions.html) to transfer funds from one account to another, where all included statements are either committed or aborted.

    1. Create a `txn-sample.py` file and copy the code into it, replacing placeholders in the [connection parameters](#step-3-generate-the-connection-string) and the appropriate SQL user and password:

        {{site.data.alerts.callout_info}}
        For `host`, be sure to use the load balancer hostname for the region closest to your client. Load balancer hostnames are identified in the initial confirmation details you received from Cockroach Labs.
        {{site.data.alerts.end}}

        {{site.data.alerts.callout_info}}
        CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.
        {{site.data.alerts.end}}

        {% include copy-clipboard.html %}
        ~~~ python
        # Import the driver.
        import psycopg2
        import psycopg2.errorcodes

        # Connect to the cluster.
        conn = psycopg2.connect(
            user='<username>',
            password='<password>',
            host='<load balancer host>',
            port=26257,
            database='<database>',
            sslmode='require',
            sslrootcert='certs/ca.crt'
        )

        def onestmt(conn, sql):
            with conn.cursor() as cur:
                cur.execute(sql)


        # Wrapper for a transaction.
        # This automatically re-calls "op" with the open transaction as an argument
        # as long as the database server asks for the transaction to be retried.
        def run_transaction(conn, op):
            with conn:
                onestmt(conn, "SAVEPOINT cockroach_restart")
                while True:
                    try:
                        # Attempt the work.
                        op(conn)

                        # If we reach this point, commit.
                        onestmt(conn, "RELEASE SAVEPOINT cockroach_restart")
                        break

                    except psycopg2.OperationalError as e:
                        if e.pgcode != psycopg2.errorcodes.SERIALIZATION_FAILURE:
                            # A non-retryable error; report this up the call stack.
                            raise e
                        # Signal the database that we'll retry.
                        onestmt(conn, "ROLLBACK TO SAVEPOINT cockroach_restart")


        # The transaction we want to run.
        def transfer_funds(txn, frm, to, amount):
            with txn.cursor() as cur:

                # Check the current balance.
                cur.execute("SELECT balance FROM accounts WHERE id = " + str(frm))
                from_balance = cur.fetchone()[0]
                if from_balance < amount:
                    raise "Insufficient funds"

                # Perform the transfer.
                cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s",
                            (amount, frm))
                cur.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s",
                            (amount, to))


        # Execute the transaction.
        run_transaction(conn, lambda conn: transfer_funds(conn, 3, 4, 100))


        with conn:
            with conn.cursor() as cur:
                # Check account balances.
                cur.execute("SELECT id, balance FROM accounts")
                rows = cur.fetchall()
                print('Balances after transfer:')
                for row in rows:
                    print([str(cell) for cell in row])

        # Close communication with the database.
        conn.close()
        ~~~

    2. Run the code:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ python txn-sample.py
        ~~~

        The output should be:

        ~~~
        Balances after transfer:
        ['3', '900']
        ['4', '350']
        ~~~

#### SQLAlchemy ORM

On the machine where you want to run your application:

1. Install the SQLAlchemy ORM as well as a [CockroachDB Python package](https://github.com/cockroachdb/cockroachdb-python) that accounts for some minor differences between CockroachDB and PostgreSQL:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pip install sqlalchemy cockroachdb
    ~~~

    For other ways to install SQLAlchemy, see the [official documentation](http://docs.sqlalchemy.org/en/latest/intro.html#installation-guide).

2. Run code to execute basic SQL statements.

    In the following code, the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/) maps Python-specific objects to SQL operations. Specifically, `Base.metadata.create_all(engine)` creates an `accounts` table based on the `Account` class, `session.add_all([Account(),...])` inserts rows into the table, and `session.query(Account)` selects from the table so that balances can be printed.

    {{site.data.alerts.callout_info}}
    The [CockroachDB Python package](https://github.com/cockroachdb/cockroachdb-python) installed earlier is triggered by the `cockroachdb://` prefix in the engine URL. Using `postgres://` to connect to your cluster will not work.
    {{site.data.alerts.end}}

    1. Create a `sqlalchemy-basic-sample.py` file and copy the code into it, replacing placeholders in the connection parameters with the [application connection string](#step-3-generate-the-connection-string):

        {% include copy-clipboard.html %}
        ~~~ python
        from __future__ import print_function
        from sqlalchemy import create_engine, Column, Integer
        from sqlalchemy.ext.declarative import declarative_base
        from sqlalchemy.orm import sessionmaker

        Base = declarative_base()

        # The Account class corresponds to the "accounts" database table.
        class Account(Base):
            __tablename__ = 'accounts'
            id = Column(Integer, primary_key=True)
            balance = Column(Integer)

        # Create an engine to communicate with the database. The "cockroachdb://" prefix
        # for the engine URL indicates that we are connecting to CockroachDB.
        engine = create_engine('cockroachdb://<username>:<password>@<load balancer host>:26257/<database>',
                               connect_args = {
                                   'sslmode' : 'require',
                                   'sslrootcert': 'certs/ca.crt'
                               })
        Session = sessionmaker(bind=engine)

        # Automatically create the "accounts" table based on the Account class.
        Base.metadata.create_all(engine)

        # Insert two rows into the "accounts" table.
        session = Session()
        session.add_all([
            Account(id=1, balance=1000),
            Account(id=2, balance=250),
        ])
        session.commit()

        # Print out the balances.
        for account in session.query(Account):
            print(account.id, account.balance)

        ~~~

    2. Run the code:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ python sqlalchemy-basic-sample.py
        ~~~

        The output should be:

        ~~~ shell
        1 1000
        2 250
        ~~~
