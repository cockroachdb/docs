CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client:

    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=<address of any node>
    ~~~

2.  Create a `securenodetest` database:

    ~~~ sql
    > CREATE DATABASE securenodetest;
    ~~~

3. Use `\q` to exit the SQL shell.

4. Launch the built-in SQL client against a different node:

    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=<address of different node>
    ~~~

5. View the cluster's databases, which will include `securenodetest`:

    ~~~ sql
    > SHOW DATABASES;
    ~~~

    ~~~
    +--------------------+
    |      Database      |
    +--------------------+
    | crdb_internal      |
    | information_schema |
    | securenodetest     |
    | pg_catalog         |
    | system             |
    +--------------------+
    (5 rows)
    ~~~

6. Use `\q` to exit the SQL shell.
