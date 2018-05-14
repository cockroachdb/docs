For each additional node you want to add to the cluster, complete the following steps:

1. SSH to the machine where you want the node to run.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~

3. Copy the binary into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

4. Run the [`cockroach start`](start-a-node.html) command just like you did for the initial nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --host=<node4 address> \
    --locality=<key-value pairs> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257 \
    --background
    ~~~

5. Update your load balancer to recognize the new node.
