Now that a load balancer is running, it can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to the load balancer, which will then redirect the connection to a CockroachDB node.

To test this, install CockroachDB locally and use the [built-in SQL client](use-the-built-in-sql-client.html) as follows:

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if it's not there already.

2. Launch the built-in SQL client, with the `--host` flag set to the address of the load balancer:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach sql --insecure \
	--host=<load balancer address> \
	--port=26257
	~~~

3. View the cluster's databases:

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

	As you can see, the load balancer redirected the query to one of the CockroachDB nodes.

4. Use the `node_id` [session variable](show-vars.html) to check which node you were redirected to:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW node_id;
    ~~~

	~~~
	+---------+
	| node_id |
	+---------+
	|       3 |
	+---------+
	(1 row)
	~~~

5. Use **CTRL + D**, **CTRL + C**, or `\q` to exit the SQL shell.
