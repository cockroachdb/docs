On your local machine, complete the node startup process and have them join together as a cluster:

1. [Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}) on your local machine, if you haven't already.

1. Run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command, with the `--host` flag set to the address of any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=<address of any node on --join list>
    ~~~

    Each node then prints helpful details to the [standard output]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
