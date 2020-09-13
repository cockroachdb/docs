On your local machine, complete the node startup process and have them join together as a cluster:

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if you haven't already.

2. Run the [`cockroach init`](cockroach-init.html) command, with the `--host` flag set to the address of any node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=<address of any node>
    ~~~

    Each node then prints helpful details to the [standard output](cockroach-start.html#standard-output), such as the CockroachDB version, the URL for the admin UI, and the SQL URL for clients.
