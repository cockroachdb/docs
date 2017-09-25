CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. SSH to any node.

2. Launch the built-in SQL client and create an `insecurenodetest` database:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach sql --insecure --host=<address of this node>
	~~~

    {% include copy-clipboard.html %}
	~~~ sql
	> CREATE DATABASE insecurenodetest;
	~~~

3. In another terminal window, SSH to another node.

4. Launch the built-in SQL client:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach sql --insecure --host=<address of this node>
	~~~

5. View the cluster's databases, which will include `insecurenodetest`:

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

6. Use **CTRL + D**, **CTRL + C**, or `\q` to exit the SQL shell.
