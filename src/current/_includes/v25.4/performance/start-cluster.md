#### Start the nodes

1. SSH to the first `n2-standard-4` instance.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    {{page.certs}} \
    --advertise-host=<node1 internal address> \
    --join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \
    --locality=cloud=gce,region=us-east1,zone=us-east1-b \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

1. Repeat steps 1 - 3 for the other two `n2-standard-4` instances. Be sure to adjust the `--advertise-addr` flag each time.

#### Initialize the cluster

1. SSH to the fourth instance, the one not running a CockroachDB node.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Run the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init {{page.certs}} --host=<address of any node>
    ~~~

    Each node then prints helpful details to the [standard output]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
