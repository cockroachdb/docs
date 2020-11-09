#### Start the nodes

1. SSH to the first `n1-standard-4` instance.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

3. Run the [`cockroach start`](cockroach-start.html) command:

    {% include copy-clipboard.html %}
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

4. Repeat steps 1 - 3 for the other two `n1-standard-4` instances. Be sure to adjust the `--advertise-addr` flag each time.

#### Initialize the cluster

1. SSH to the fourth instance, the one not running a CockroachDB node.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

3. Copy the binary into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

4. Run the [`cockroach init`](cockroach-init.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init {{page.certs}} --host=<address of any node>
    ~~~

    Each node then prints helpful details to the [standard output](cockroach-start.html#standard-output), such as the CockroachDB version, the URL for the DB Console, and the SQL URL for clients.
