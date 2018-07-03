You can start the nodes manually or automate the process using [systemd](https://www.freedesktop.org/wiki/Software/systemd/).

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="manual">Manual</button>
  <button style="width: 15%" class="filter-button" data-scope="systemd">systemd</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="manual">

For each initial node of your cluster, complete the following steps:

{{site.data.alerts.callout_info}}
After completing these steps, nodes will not yet be live. They will complete the startup process and join together to form a cluster as soon as the cluster is initialized in the next step.
{{site.data.alerts.end}}

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

4. Run the [`cockroach start`](start-a-node.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure \
    --join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257 \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

    This command primes the node to start, using the following flags:

    Flag | Description
    -----|------------
    `--insecure` | Indicates that the cluster is insecure, with no network encryption or authentication.
    `--join` | Identifies the address and port of 3-5 of the initial nodes of the cluster.
    `--cache`<br>`--max-sql-memory` | Increases the node's cache and temporary SQL memory size to 25% of available system memory to improve read performance and increase capacity for in-memory SQL processing (see [Recommended Production Settings](recommended-production-settings.html) for more details).
    `--background` | Starts the node in the background so you gain control of the terminal to issue more commands.

    In some cases, you may need to set the following flags as well:

    Flag | Description
    -----|------------
    `--host`<br>`--advertise-host` | These flags control the interfaces for communication from and with other nodes and clients. It is recommended to start by leaving both of these flags out, as shown above; this has the node listen on all of its interfaces and communicate with other nodes on `os.Hostname()`. If this does not work, consider the following approaches:<br><br>To have the node listen and communicate on a specific interface, set `--host` to the IP IP address or hostname and leave `--advertise-host` out.<br><br>To have the node listen on all of its interfaces but communicate with other nodes on a specific interface, leave `--host` out and set `--advertise-host` to the IP address or hostname. This approach is often necessary when nodes are running within a private network.<br><br>Note that when using a hostname, it must be resolvable from all nodes, and when using an IP address, it must be routable from all nodes.
    `--locality` | This flag specifies key-value pairs that describe the location of the node, e.g., country, region, datacenter, rack, etc.<br><br>It is recommended to set `--locality` when deploying across multiple datacenters or when there is otherwise high latency between nodes. It is also required to use certain enterprise features. For more details, see [Locality](start-a-node.html#locality).

	  For other flags not explicitly set, the command uses default values. For example, the node stores data in `--store=cockroach-data`, binds internal and client communication to `--port=26257`, and binds Admin UI HTTP requests to `--http-port=8080`. To set these options manually, see [Start a Node](start-a-node.html).

5. Repeat these steps for each additional node that you want in your cluster.

</section>

<section class="filter-content" markdown="1" data-scope="systemd">

For each initial node of your cluster, complete the following steps:

{{site.data.alerts.callout_info}}After completing these steps, nodes will not yet be live. They will complete the startup process and join together to form a cluster as soon as the cluster is initialized in the next step.{{site.data.alerts.end}}

1. SSH to the machine where you want the node to run. Ensure you are logged in as the `root` user.

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

4. Create the Cockroach directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir /var/lib/cockroach
    ~~~

5. Create a Unix user named `cockroach`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ useradd cockroach
    ~~~

6. Change the ownership of `Cockroach` directory to the user `cockroach`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ chown cockroach /var/lib/cockroach
    ~~~

7. Download the [sample configuration template](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/insecurecockroachdb.service) and save the file in the `/etc/systemd/system/` directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/insecurecockroachdb.service
    ~~~

    Alternatively, you can create the file yourself and copy the script into it:

    {% include copy-clipboard.html %}
    ~~~ shell
    {% include {{ page.version.version }}/prod-deployment/insecurecockroachdb.service %}
    ~~~

8. Customize the sample configuration template for your deployment:

     Specify values for the following flags in the sample configuration template:

     Flag | Description
     -----|------------
     `--join` | Identifies the address and port of 3-5 of the initial nodes of the cluster.
     `--host` | Specifies the hostname or IP address to listen on for intra-cluster and client communication, as well as to identify the node in the Admin UI. If it is a hostname, it must be resolvable from all nodes, and if it is an IP address, it must be routable from all nodes.<br><br>If you want the node to listen on multiple interfaces, leave `--host` empty.<br><br>If you want the node to communicate with other nodes on an internal address (e.g., within a private network) while listening on all interfaces, leave `--host` empty and set the `--advertise-host` flag to the internal address.

9. Start the CockroachDB cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ systemctl start insecurecockroachdb
    ~~~

10. Repeat these steps for each additional node that you want in your cluster.

{{site.data.alerts.callout_info}}
`systemd` handles node restarts in case of node failure. To stop a node without `systemd` restarting it, run `systemctl stop insecurecockroachdb`
{{site.data.alerts.end}}

</section>
