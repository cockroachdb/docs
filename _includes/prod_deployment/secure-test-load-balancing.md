Now that a load balancer is running, it can serve as the client gateway to the cluster. Instead of connecting directly to a CockroachDB node, clients can connect to the load balancer server, which will then redirect the connection to a CockroachDB node.

To test this, use the [built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach sql \
	--certs-dir=certs \
	--host=<load balancer address>
	~~~

    This command requires the following flags:

    Flag | Description
    -----|------------
    `--certs-dir` | Specifies the directory where you placed the `ca.crt` file and the `client.root.crt` and `client.root.key` files for the `root` user.
    `--host` | Specifies the address of any node in the cluster.

2. View the cluster's databases:

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

	As you can see, the load balancer redirected the query to one of the CockroachDB nodes.

3. Check which node you were redirected to:

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

    The `node_id` [session variable](show-vars.html) used above is an alias for the following query, which you can use as well:

    {% include copy-clipboard.html %}
	~~~ sql
	> SELECT node_id FROM crdb_internal.node_build_info LIMIT 1;
	~~~

4. Use **CTRL + D**, **CTRL + C**, or `\q` to exit the SQL shell.
