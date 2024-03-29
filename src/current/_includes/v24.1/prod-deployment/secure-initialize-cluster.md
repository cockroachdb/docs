On your local machine, run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command to complete the node startup process and have them join together as a cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init --certs-dir=certs --host=<address of any node on --join list>
~~~

After running this command, each node prints helpful details to the [standard output]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
