For each initial node of your cluster, complete the following steps:

{{site.data.alerts.callout_info}}After completing these steps, nodes will not yet be live. They will complete the startup process and join together to form a cluster as soon as the cluster is initialized in the next step.{{site.data.alerts.end}}

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
    ~~~
    $ cockroach start --insecure \
    --host=<node1 address> \
    --locality=<key-value pairs> \
    --cache=25% \
    --max-sql-memory=25% \
    --join=<node1 address>:26257,<node2 address>:26257,<node3 address>:26257 \
    --background
    ~~~

    This command primes the node to start, using the following flags:

    Flag | Description
    -----|------------
    `--insecure` | Indicates that the cluster is insecure, with no network encryption or authentication.
    `--host` | Specifies the hostname or IP address to listen on for intra-cluster and client communication, as well as to identify the node in the Admin UI. If it is a hostname, it must be resolvable from all nodes, and if it is an IP address, it must be routable from all nodes.<br><br>If you want the node to listen on multiple interfaces, leave `--host` empty.<br><br>If you want the node to communicate with other nodes on an internal address (e.g., within a private network) while listening on all interfaces, leave `--host` empty and set the `--advertise-host` flag to the internal address.
    `--locality` | Key-value pairs that describe the location of the node, e.g., country, region, datacenter, rack, etc. The key-value pairs should be ordered from most inclusive to least inclusive, and the keys and the order of key-value pairs must be the same on all nodes. For example:<br><br>`--locality=region=east,datacenter=us-east-1`<br>`--locality=region=west,datacenter=us-west-1`<br><br>When there is high latency between nodes, CockroachDB uses locality to move range leases closer to the current workload, reducing network round trips and improving read performance, also known as ["follow-the-workload"](demo-follow-the-workload.html). Locality is also a prerequisite for using the [table partitioning](partitioning.html) and [**Node Map**](enable-node-map.html) enterprise features.
    `--cache`<br>`--max-sql-memory` | Increases the node's cache and temporary SQL memory size to 25% of available system memory to improve read performance and increase capacity for in-memory SQL processing (see [Recommended Production Settings](recommended-production-settings.html) for more details).
    `--join` | Identifies the address and port of 3-5 of the initial nodes of the cluster.
    `--background` | Starts the node in the background so you gain control of the terminal to issue more commands.

	For other flags not explicitly set, the command uses default values. For example, the node stores data in `--store=cockroach-data`, binds internal and client communication to `--port=26257`, and binds Admin UI HTTP requests to `--http-port=8080`. To set these options manually, see [Start a Node](start-a-node.html).

5. Repeat these steps for each addition node that you want in your cluster.
