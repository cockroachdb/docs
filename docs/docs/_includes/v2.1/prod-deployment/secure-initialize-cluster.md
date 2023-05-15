On your local machine, run the [`cockroach init`](initialize-a-cluster.html) command to complete the node startup process and have them join together as a cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --certs-dir=certs --host=<address of any node>
~~~

After running this command, each node prints helpful details to the [standard output](start-a-node.html#standard-output), such as the CockroachDB version, the URL for the admin UI, and the SQL URL for clients.
