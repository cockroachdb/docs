CockroachDB replicates and distributes data for you behind-the-scenes and uses a [Gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) to enable each node to locate data across the cluster.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client, with the `--host` flag set to the address of any node:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach sql --insecure --host=<address of any node>
	~~~

2. Create an `insecurenodetest` database:

    {% include_cached copy-clipboard.html %}
	~~~ sql
	> CREATE DATABASE insecurenodetest;
	~~~

3. Use `\q` or `ctrl-d` to exit the SQL shell.

4. Launch the built-in SQL client, with the `--host` flag set to the address of a different node:

    {% include_cached copy-clipboard.html %}
	~~~ shell
	$ cockroach sql --insecure --host=<address of different node>
	~~~

5. View the cluster's databases, which will include `insecurenodetest`:

    {% include_cached copy-clipboard.html %}
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

6. Use `\q` or `ctrl-d` to exit the SQL shell.
