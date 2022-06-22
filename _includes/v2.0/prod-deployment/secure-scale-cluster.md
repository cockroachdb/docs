You can start the nodes manually or automate the process using [systemd](https://www.freedesktop.org/wiki/Software/systemd/).

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="manual">Manual</button>
  <button style="width: 15%" class="filter-button" data-scope="systemd">systemd</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="manual">

For each additional node you want to add to the cluster, complete the following steps:

1. SSH to the machine where you want the node to run.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

3. Copy the binary into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

4. Run the [`cockroach start`](start-a-node.html) command just like you did for the initial nodes:

    {% include_cached copy-clipboard.html %}
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

</section>

<section class="filter-content" markdown="1" data-scope="systemd">

For each additional node you want to add to the cluster, complete the following steps:

1. SSH to the machine where you want the node to run. Ensure you are logged in as the `root` user.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, and extract the binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

3. Copy the binary into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

4. Create the Cockroach directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir /var/lib/cockroach
    ~~~

5. Create a Unix user named `cockroach`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ useradd cockroach
    ~~~

6.  Move the `certs` directory to the `cockroach` directory.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv certs /var/lib/cockroach/
    ~~~

7.  Change the ownership of `Cockroach` directory to the user `cockroach`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ chown -R cockroach.cockroach /var/lib/cockroach
    ~~~

8.  Download the [sample configuration template](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/securecockroachdb.service):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/securecockroachdb.service
    ~~~

    Alternatively, you can create the file yourself and copy the script into it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    {% include {{ page.version.version }}/prod-deployment/securecockroachdb.service %}
    ~~~

    Save the file in the `/etc/systemd/system/` directory.

9.  Customize the sample configuration template for your deployment:

    Specify values for the following flags in the sample configuration template:

     Flag | Description
     -----|------------
     `--host` | Specifies the hostname or IP address to listen on for intra-cluster and client communication, as well as to identify the node in the Admin UI. If it is a hostname, it must be resolvable from all nodes, and if it is an IP address, it must be routable from all nodes.<br><br>If you want the node to listen on multiple interfaces, leave `--host` empty.<br><br>If you want the node to communicate with other nodes on an internal address (e.g., within a private network) while listening on all interfaces, leave `--host` empty and set the `--advertise-host` flag to the internal address.
     `--join` | Identifies the address and port of 3-5 of the initial nodes of the cluster.

10.  Repeat these steps for each additional node that you want in your cluster.

</section>
