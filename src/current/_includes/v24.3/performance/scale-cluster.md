1. SSH to one of the `n2-standard-4` instances in the `us-west1-a` zone.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    {{page.certs}} \
    --advertise-host=<node internal address> \
    --join=<same as earlier> \
    --locality=cloud=gce,region=us-west1,zone=us-west1-a \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

1. Repeat steps 1 - 3 for the other two `n2-standard-4` instances in the `us-west1-a` zone.

1. SSH to one of the `n2-standard-4` instances in the `us-west2-a` zone.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    {{page.certs}} \
    --advertise-host=<node1 internal address> \
    --join=<same as earlier> \
    --locality=cloud=gce,region=us-west2,zone=us-west2-a \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

1. Repeat steps 5 - 7 for the other two `n2-standard-4` instances in the `us-west2-a` zone.
