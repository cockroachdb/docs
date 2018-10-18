---
title: Connect to Your Managed Cluster
summary:
toc: true
build_for: managed
---

Once your Managed CockroachDB cluster is available and you've received your [connection details](managed-sign-up-for-a-cluster.html#connection-details), you can start interacting with your cluster using the CockroachDB SQL client or a Postgres-compatible driver or ORM.

## Before you begin

1. On the machine from which you want to connect to the cluster, create a `certs` directory, and put the `ca.crt` file that you received from Cockroach Labs in the directory.

    Any client connecting to the cluster will need access to the `ca.crt` file.

2. If you haven't already, ask Cockroach Labs to whitelist the public IP address of the machine. Otherwise, connections from this machine will be rejected.

## Use the CockroachDB SQL client

The CockroachDB binary comes with a built-in SQL client for executing SQL statements from an interactive shell or directly from the command line. The CockroachDB SQL client is the best tool for executing one-off queries and performing DDL and DML operations.

On the machine where you want to run the CockroachDB SQL client:

1. <a href="https://www.cockroachlabs.com/docs/{{ page.version.version }}/install-cockroachdb.html" target="&#95;blank">Download the CockroachDB binary</a>:

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
    $ cp -i {{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i {{ page.release_info.version }}..linux-amd64/cockroach /usr/local/bin
    ~~~
    </section>

3. Use the `cockroach sql` command to open an interactive SQL shell, replacing placeholders in the connection string with the [connection details](managed-sign-up-for-a-cluster.html#connection-details) you received from Cockroach Labs:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=certs-dir/ca.crt'
    ~~~

    You can add the `--execute` flag to run specific SQL statements directly from the command-line:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --url='postgres://<username>:<password>@<global host>:26257/<database>?sslmode=verify-full&sslrootcert=certs-dir/ca.crt' \
    --execute="CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL);"
    ~~~

4. Execute some <a href="https://www.cockroachlabs.com/docs/{{ page.version.version }}/learn-cockroachdb-sql.html" target="&#95;blank">CockroachDB SQL</a>.

{{site.data.alerts.callout_success}}
For more details about the built-in SQL client, and many examples of how to use it, see the <a href="https://www.cockroachlabs.com/docs/{{ page.version.version }}/use-the-built-in-sql-client.html" target="&#95;blank">`cockroach sql`</a> documentation.
{{site.data.alerts.end}}

## Use a Postgres driver or ORM

These steps show you how to connect a simple Python test application to you Managed CockroachDB cluster with the [psycopg2 driver](http://initd.org/psycopg/docs/) or the [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/latest/). For code samples in other languages, see <a href="https://www.cockroachlabs.com/docs/{{ page.version.version }}/build-an-app-with-cockroachdb.html" target="&#95;blank">Build an App with CockroachDB</a>.

Start by choosing the Python driver or ORM:

- [psycopg2](#psycopg2-driver)
- [SQLAlchemy](#sqlalchemy-orm)

### psycopg2 driver

On the machine where you want to run your application:

1. Install the Python psycopg2 driver:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ pip install psycopg2
    ~~~

    For other ways to install psycopg2, see the [official documentation](http://initd.org/psycopg/docs/install.html).

2. Use the following code to connect to your cluster and execute basic SQL statements, creating a table, inserting some rows, and reading and printing the rows.

    Create a `basic-sample.py` file and copy the following code into it, replacing placeholders in the connection parameters with the [connection details](managed-sign-up-for-a-cluster.html#connection-details) you received from Cockroach Labs:

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

3. Run the code:

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

4. Now use the following code to again connect to your cluster, but this time executing a batch of statements as an <a href="https://www.cockroachlabs.com/docs/{{ page.version.version }}/build-an-app-with-cockroachdb.html" target="&#95;blank">atomic transaction</a> to transfer funds from one account to another, where all included statements are either committed or aborted.

    Create a `txn-sample.py` file and copy the following code into it, replacing placeholders in the connection parameters with the [connection details](managed-sign-up-for-a-cluster.html#connection-details) you received from Cockroach Labs:

    {{site.data.alerts.callout_info}}
    With the default `SERIALIZABLE` isolation level, CockroachDB may require the <a href="https://www.cockroachlabs.com/docs/{{ page.version.version }}/transactions.html#transaction-retries" target="&#95;blank">client to retry a transaction</a> in case of read/write contention. CockroachDB provides a generic **retry function** that runs inside a transaction and retries it as needed. You can copy and paste the retry function from here into your code.{{site.data.alerts.end}}

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
    run_transaction(conn, lambda conn: transfer_funds(conn, 1, 2, 100))


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

5. Run the code:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ python txn-sample.py
    ~~~

    The output should be:

    ~~~
    Balances after transfer:
    ['1', '900']
    ['2', '350']
    ~~~

### SQLAlchemy ORM
