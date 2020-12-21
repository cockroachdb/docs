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
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

4. Run the [`cockroach start`](cockroach-start.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node1 address> \
    --join=<node1 address>,<node2 address>,<node3 address> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

    This command primes the node to start, using the following flags:

    Flag | Description
    -----|------------
    `--insecure` | Indicates that the cluster is insecure, with no network encryption or authentication.
    `--advertise-addr` | Specifies the IP address/hostname and port to tell other nodes to use. The port number can be omitted, in which case it defaults to `26257`.<br><br>This value must route to an IP address the node is listening on (with `--listen-addr` unspecified, the node listens on all IP addresses).<br><br>In some networking scenarios, you may need to use `--advertise-addr` and/or `--listen-addr` differently. For more details, see [Networking](recommended-production-settings.html#networking).
    `--join` | Identifies the address of 3-5 of the initial nodes of the cluster. These addresses should match the addresses that the target nodes are advertising.
    `--cache`<br>`--max-sql-memory` | Increases the node's cache size to 25% of available system memory to improve read performance. The capacity for in-memory SQL processing defaults to 25% of system memory but can be raised, if necessary, to increase the number of simultaneous client connections allowed by the node as well as the node's capacity for in-memory processing of rows when using `ORDER BY`, `GROUP BY`, `DISTINCT`, joins, and window functions. For more details, see [Cache and SQL Memory Size](recommended-production-settings.html#cache-and-sql-memory-size).
    `--background` | Starts the node in the background so you gain control of the terminal to issue more commands.

    When deploying across multiple datacenters, or when there is otherwise high latency between nodes, it is recommended to set `--locality` as well. It is also required to use certain enterprise features. For more details, see [Locality](cockroach-start.html#locality).

	  For other flags not explicitly set, the command uses default values. For example, the node stores data in `--store=cockroach-data` and binds DB Console HTTP requests to `--http-addr=localhost:8080`. To set these options manually, see [Start a Node](cockroach-start.html).

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
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
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

8. In the sample configuration template, specify values for the following flags:

    {% include {{ page.version.version }}/prod-deployment/advertise-addr-join.md %}

    When deploying across multiple datacenters, or when there is otherwise high latency between nodes, it is recommended to set `--locality` as well. It is also required to use certain enterprise features. For more details, see [Locality](cockroach-start.html#locality).

    For other flags not explicitly set, the command uses default values. For example, the node stores data in `--store=cockroach-data` and binds DB Console HTTP requests to `--http-port=8080`. To set these options manually, see [Start a Node](cockroach-start.html).

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
