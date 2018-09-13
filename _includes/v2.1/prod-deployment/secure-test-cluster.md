CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach sql --certs-dir=certs --host=<address of any node>:26257
	~~~

    This command requires the following flags:

    Flag | Description
    -----|------------
    `--certs-dir` | Specifies the directory where you placed the `ca.crt` file and the `client.root.crt` and `client.root.key` files for the `root` user.
    `--host` | Specifies the address and port of any node in the cluster.

2.  Create a `securenodetest` database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE securenodetest;
    ~~~

3. Use `\q` to exit the SQL shell.

4. Launch the built-in SQL client against a different node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=<address of different node>:26257
    ~~~

5. View the cluster's databases, which will include `securenodetest`:

    {% include copy-clipboard.html %}
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
