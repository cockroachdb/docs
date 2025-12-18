1. SSH to one of the `n2-standard-4` instances in the `us-west1-a` zone.

1. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

1. Run the [`cockroach start`]({% link "{{ page.version.version }}/cockroach-start.md" %}) command:

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

1. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

1. Run the [`cockroach start`]({% link "{{ page.version.version }}/cockroach-start.md" %}) command:

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
