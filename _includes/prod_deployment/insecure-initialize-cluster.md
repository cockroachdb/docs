To complete the node startup process and have them join together as a cluster, SSH to any node and run the [`cockroach init`](initialize-a-cluster.html) command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach init --insecure --host=<address of any node>
~~~

Each node then prints helpful details to the [standard output](start-a-node.html#standard-output), such as the CockroachDB version, the URL for the admin UI, and the SQL URL for clients.
