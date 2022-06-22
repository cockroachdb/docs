You can start the nodes manually or automate the process using [systemd](https://www.freedesktop.org/wiki/Software/systemd/).

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="manual">Manual</button>
  <button style="width: 15%" class="filter-button" data-scope="systemd">systemd</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="manual">

For each initial node of your cluster, complete the following steps:

{{site.data.alerts.callout_info}}After completing these steps, nodes will not yet be live. They will complete the startup process and join together to form a cluster as soon as the cluster is initialized in the next step.{{site.data.alerts.end}}

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

4. Run the [`cockroach start`](start-a-node.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --host=<node1 address> \
    --locality=<key-value pairs> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257 \
    --background
    ~~~

    This command primes the node to start, using the following flags:

    Flag | Description
    -----|------------
    `--certs-dir` | Specifies the directory where you placed the `ca.crt` file and the `node.crt` and `node.key` files for the node.
    `--host` | Specifies the hostname or IP address to listen on for intra-cluster and client communication, as well as to identify the node in the Admin UI. If it is a hostname, it must be resolvable from all nodes, and if it is an IP address, it must be routable from all nodes.<br><br>If you want the node to listen on multiple interfaces, leave `--host` out.<br><br>If you want the node to communicate with other nodes on an internal address (e.g., within a private network) while listening on all interfaces, leave `--host` out and set the `--advertise-host` flag to the internal address.
    `--locality` | Key-value pairs that describe the location of the node, e.g., country, region, datacenter, rack, etc. It is recommended to set `--locality` when deploying across multiple datacenters or when there is otherwise high latency between nodes. It is also required to use certain enterprise features. For more details, see [Locality](start-a-node.html#locality).
    `--cache`<br>`--max-sql-memory` | Increases the node's cache and temporary SQL memory size to 25% of available system memory to improve read performance and increase capacity for in-memory SQL processing (see [Recommended Production Settings](recommended-production-settings.html) for more details).
    `--join` | Identifies the address and port of 3-5 of the initial nodes of the cluster.
    `--background` | Starts the node in the background so you gain control of the terminal to issue more commands.

	For other flags not explicitly set, the command uses default values. For example, the node stores data in `--store=cockroach-data`, binds internal and client communication to `--port=26257`, and binds Admin UI HTTP requests to `--http-port=8080`. To set these options manually, see [Start a Node](start-a-node.html).

5. Repeat these steps for each additional node that you want in your cluster.

</section>

<section class="filter-content" markdown="1" data-scope="systemd">

For each initial node of your cluster, complete the following steps:

{{site.data.alerts.callout_info}}After completing these steps, nodes will not yet be live. They will complete the startup process and join together to form a cluster as soon as the cluster is initialized in the next step.{{site.data.alerts.end}}

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
     `--join` | Identifies the address and port of 3-5 of the initial nodes of the cluster.
     `--host` | Specifies the hostname or IP address to listen on for intra-cluster and client communication, as well as to identify the node in the Admin UI. If it is a hostname, it must be resolvable from all nodes, and if it is an IP address, it must be routable from all nodes.<br><br>If you want the node to listen on multiple interfaces, leave `--host` empty.<br><br>If you want the node to communicate with other nodes on an internal address (e.g., within a private network) while listening on all interfaces, leave `--host` empty and set the `--advertise-host` flag to the internal address.

10.  Start the CockroachDB cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ systemctl start securecockroachdb
    ~~~

11.  Repeat these steps for each additional node that you want in your cluster.

{{site.data.alerts.callout_info}}
`systemd` handles node restarts in case of node failure. To stop a node without `systemd` restarting it, run <code>systemctl stop securecockroachdb</code>
{{site.data.alerts.end}}

</section>
