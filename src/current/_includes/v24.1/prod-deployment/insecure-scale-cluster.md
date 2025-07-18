You can start the nodes manually or automate the process using [systemd](https://www.freedesktop.org/wiki/Software/systemd/).

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="manual">Manual</button>
  <button style="width: 15%" class="filter-button" data-scope="systemd">systemd</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="manual">

For each additional node you want to add to the cluster, complete the following steps:

1. SSH to the machine where you want the node to run.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command, passing the new node's address as the `--advertise-addr` flag and pointing `--join` to the three existing nodes (also include `--locality` if you set it earlier).

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node4 address> \
    --join=<node1 address>,<node2 address>,<node3 address> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

1. Update your load balancer to recognize the new node.

</section>

<section class="filter-content" markdown="1" data-scope="systemd">

For each additional node you want to add to the cluster, complete the following steps:

1. SSH to the machine where you want the node to run. Ensure you are logged in as the `root` user.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Create the Cockroach directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir /var/lib/cockroach
    ~~~

1. Create a Unix user named `cockroach`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    useradd cockroach
    ~~~

1. Change the ownership of the `cockroach` directory to the user `cockroach`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    chown cockroach /var/lib/cockroach
    ~~~

1. Download the [sample configuration template](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/insecurecockroachdb.service):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -o insecurecockroachdb.service https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/prod-deployment/insecurecockroachdb.service
    ~~~

    Alternatively, you can create the file yourself and copy the script into it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    {% include {{ page.version.version }}/prod-deployment/insecurecockroachdb.service %}
    ~~~

    {{site.data.alerts.callout_info}}
    Previously, the sample configuration file set `TimeoutStopSec` to 60 seconds. This recommendation has been lengthened to 300 seconds, to give the `cockroach` process more time to stop gracefully.
    {{site.data.alerts.end}}

    Save the file in the `/etc/systemd/system/` directory

1. Customize the sample configuration template for your deployment:

    Specify values for the following flags in the sample configuration template:

    {% include {{ page.version.version }}/prod-deployment/advertise-addr-join.md %}

1. Repeat these steps for each additional node that you want in your cluster.

</section>
