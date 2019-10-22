CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client, with the `--host` flag set to the address of any node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=<address of load balancer>
    ~~~

2. Create an `insecurenodetest` database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE insecurenodetest;
    ~~~

3. View the cluster's databases, which will include `insecurenodetest`:

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
    | insecurenodetest   |
    | pg_catalog         |
    | system             |
    +--------------------+
    (5 rows)
    ~~~

4. Use `\q` to exit the SQL shell.
