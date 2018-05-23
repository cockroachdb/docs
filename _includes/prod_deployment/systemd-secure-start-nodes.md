For each initial node of your cluster, complete the following steps:

{{site.data.alerts.callout_info}}After completing these steps, nodes will not yet be live. They will complete the startup process and join together to form a cluster as soon as the cluster is initialized in the next step.{{site.data.alerts.end}}

1. SSH to the machine where you want the node to run. Ensure you are logged in as the root user.

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

6.  Move the `certs` directory to the `cockroach` directory.

    {% include copy-clipboard.html %}
    ~~~ shell
    mv certs /var/lib/cockroach/
    ~~~

7.  Change the ownership of `Cockroach` directory to the user `cockroach`:

    {% include copy-clipboard.html %}
    ~~~ shell
    chown -R cockroach.cockroach /var/lib/cockroach
    ~~~

8.  Download the [sample configuration template](/_includes/prod_deployment/securecockroachdb.service), or create the file     yourself and copy the script into it:

    {% include copy-clipboard.html %}
    ~~~ shell
    {% include prod_deployment/securecockroachdb.service %}
    ~~~

    Save the file in the `/etc/systemd/system/` directory.

9.  Customize the sample configuration template for your deployment:

    Specify values for the following flags in the sample configuration template:

     Flag | Description
     -----|------------
     `--host` | Specifies the hostname or IP address to listen on for intra-cluster and client communication, as well as to identify the node in the Admin UI. If it is a hostname, it must be resolvable from all nodes, and if it is an IP address, it must be routable from all nodes.<br><br>If you want the node to listen on multiple interfaces, leave `--host` empty.<br><br>If you want the node to communicate with other nodes on an internal address (e.g., within a private network) while listening on all interfaces, leave `--host` empty and set the `--advertise-host` flag to the internal address.
     `--join` | Identifies the address and port of 3-5 of the initial nodes of the cluster.

10.  Start the CockroachDB cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    systemctl start securecockroachdb
    ~~~

11.  Repeat these steps for each addition node that you want in your cluster.

{{site.data.alerts.callout_info}}To stop a node, run <code>systemctl stop securecockroachdb</code>{{site.data.alerts.end}}
