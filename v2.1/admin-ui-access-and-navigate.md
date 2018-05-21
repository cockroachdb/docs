---
title: Access and Navigate the CockroachDB Admin UI
summary: Learn how to access and navigate the Admin UI.
toc: false
---

<div id="toc"></div>

## Access the Admin UI

By default, CockroachDB allows all users to access and view the Admin UI. For added security, you can choose to enable user authentication so that only authorized users can access and view the Admin UI.

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="with-user-auth"><strong>Enable user authentication</strong></button>
  <button class="filter-button" data-scope="without-user-auth"><strong>Ignore user authentication</strong></button>
</div>

<section class="filter-content" markdown="1" data-scope="with-user-auth">

You can enable user authentication only for secure clusters. To enable user authentication:

### Step 1. Create security certificates

You can use either `cockroach cert` commands or [`openssl` commands](create-security-certificates-openssl.html) to generate security certificates. This section features the `cockroach cert` commands.

~~~ shell
# Create a certs directory and safe directory for the CA key.
# If using the default certificate directory (`${HOME}/.cockroach-certs`), make sure it is empty.
$ mkdir certs
$ mkdir my-safe-directory

# Create the CA key pair:
$ cockroach cert create-ca \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key

# Create a client key pair for the root user:
$ cockroach cert create-client \
root \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key

# Create a key pair for the nodes:
$ cockroach cert create-node \
localhost \
$(hostname) \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

- The first command makes a new directory for the certificates.
- The second command creates the Certificate Authority (CA) certificate and key: `ca.crt` and `ca.key`.
- The third command creates the client certificate and key, in this case for the `root` user: `client.root.crt` and `client.root.key`. These files will be used to secure communication between the built-in SQL shell and the cluster (see step 4).
- The fourth command creates the node certificate and key: `node.crt` and `node.key`. These files will be used to secure communication between nodes. Typically, you would generate these separately for each node since each node has unique addresses; in this case, however, since all nodes will be running locally, you need to generate only one node certificate and key.

### Step 2. Set the environment variable for user authentication and start the first node

~~~ shell
$ COCKROACH_EXPERIMENTAL_REQUIRE_WEB_LOGIN=TRUE \
  ./cockroach start --host=<node1 hostname> --certs-dir=certs
~~~

### Step 3. Add nodes to the cluster

In a new terminal, add the second node:

~~~ shell
$ cockroach start \
--certs-dir=certs \
--store=node2 \
--host=<node2 hostname \
--join=<node1 hostname>:26257
~~~

In a new terminal, add the third node:

~~~ shell
$ cockroach start \
--certs-dir=certs \
--store=node3 \
--host=<node3 hostname \
--join=<node1 hostname>:26257
~~~

### Step 4. Initialize the cluster

Run the [`cockroach init`](initialize-a-cluster.html) command with the `--certs-dir` flag set to the directory containing the `ca.crt` file and the files for the root user, and with the `--host` flag set to the address of any node:

~~~ shell
$ cockroach init --certs-dir=certs --host=<address of any node>
~~~

### Step 5. Create a user with a password

Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

~~~ sql
> CREATE USER <username> WITH PASSWORD '<password>';
~~~

For secure clusters, you must also [create their client certificates](create-security-certificates.html).


### Step 6. Access the Admin UI using the user credentials
You can access the Admin UI from any node in the cluster.

By default, you can access it via HTTP on port `8080` of the hostname or IP address you configured using the `--host` flag while [starting the node](https://www.cockroachlabs.com/docs/stable/start-a-node.html#general). For example, `https://<any node host>:8080`.

You can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html). For example, if you set both a custom port and hostname, `https://<http-host value>:<http-port value>`.

On accessing the Admin UI, the Login screen is displayed. Enter the username and password for the user created in Step 5.

</section>

<section class="filter-content" markdown="1" data-scope="without-user-auth">

You can access the Admin UI from any node in the cluster.

By default, you can access it via HTTP on port `8080` of the hostname or IP address you configured using the `--host` flag while [starting the node](https://www.cockroachlabs.com/docs/stable/start-a-node.html#general). For example, `http://<any node host>:8080`. If you are running a secure cluster, use `https://<any node host>:8080`.

You can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html). For example, if you set both a custom port and hostname, `http://<http-host value>:<http-port value>`. For a secure cluster, `https://<http-host value>:<http-port value>`.

For additional guidance on accessing the Admin UI in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

</section>

## Navigate the Admin UI

The left-hand navigation bar allows you to navigate to the [Cluster Overview page](admin-ui-access-and-navigate.html), [Cluster metrics dashboards](admin-ui-overview.html), [Databases page](admin-ui-databases-page.html), and [Jobs page](admin-ui-jobs-page.html).

The main panel displays changes for each page:

Page | Main Panel Component
-----------|------------
Cluster Overview | <ul><li>[Cluster Overview panel](admin-ui-access-and-navigate.html#cluster-overview-panel)</li><li>[Node List](admin-ui-access-and-navigate.html#node-list). [Enterprise users](enterprise-licensing.html) can enable and switch to the [Node Map](admin-ui-access-and-navigate.html#node-map-enterprise) view. </li></ul>
Cluster Metrics | <ul><li>[Time Series graphs](admin-ui-access-and-navigate.html#time-series-graphs)</li><li>[Summary Panel](admin-ui-access-and-navigate.html#summary-panel)</li><li>[Events List](admin-ui-access-and-navigate.html#events-panel)</li></ul>
Databases | Information about the tables and grants in your [databases](admin-ui-databases-page.html).
Jobs | Information about all currently active schema changes and backup/restore [jobs](admin-ui-jobs-page.html).

### Cluster Overview Panel

<img src="{{ 'images/v2.1/admin-ui-cluster-overview-panel.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

The **Cluster Overview** panel provides the following metrics:

Metric | Description
--------|----
Capacity Usage | <ul><li>The storage capacity used as a percentage of total storage capacity allocated across all nodes.</li><li>The current capacity usage.</li></ul>
Node Status | <ul><li>The number of [live nodes](admin-ui-access-and-navigate.html#live-nodes) in the cluster.</li><li>The number of suspect nodes in the cluster. A node is considered a suspect node if it's liveness status is unavailable or the node is in the process of decommissioning.</li><li>The number of [dead nodes](admin-ui-access-and-navigate.html#dead-nodes) in the cluster.</li>
Replication Status | <ul><li>The total number of ranges in the cluster.</li><li>The number of [under-replicated ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li><li>The number of [unavailable ranges](admin-ui-replication-dashboard.html#review-of-cockroachdb-terminology) in the cluster. A non-zero number indicates an unstable cluster.</li>

### Node List

The **Node List** is the default view on the **Overview** page.
<img src="{{ 'images/v2.1/admin-ui-node-list.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

#### Live Nodes
Live nodes are nodes that are online and responding. They are marked with a green dot. If a node is removed or dies, the dot turns yellow to indicate that it is not responding. If the node remains unresponsive for a certain amount of time (5 minutes by default), the node turns red and is moved to the [**Dead Nodes**](#dead-nodes) section, indicating that it is no longer expected to come back.

The following details are shown for each live node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Uptime | How long the node has been running.
Used Capacity | The used capacity for the node.
Replicas | The number of replicas on the node.
Mem Usage | The memory usage for the node.
Version | The build tag of the CockroachDB version installed on the node.
Logs | Click **Logs** to see the logs for the node.

#### Dead Nodes

Nodes are considered dead once they have not responded for a certain amount of time (5 minutes by default). At this point, the automated repair process starts, wherein CockroachDB automatically rebalances replicas from the dead node, using the unaffected replicas as sources. See [Stop a Node](stop-a-node.html#how-it-works) for more information.

The following details are shown for each dead node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Down Since | How long the node has been down.

#### Decommissioned Nodes

<span class="version-tag">New in v1.1:</span> Nodes that have been decommissioned for permanent removal from the cluster are listed in the **Decommissioned Nodes** table.

When you decommission a node, CockroachDB lets the node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node so that it can be safely shut down. See [Remove Nodes](remove-nodes.html) for more information.

### Node Map (Enterprise)

<span class="version-tag">New in v2.0:</span> The **Node Map** is an [enterprise-only](enterprise-licensing.html) feature that gives you a visual representation of the geographical configuration of your cluster.

<img src="{{ 'images/v2.1/admin-ui-node-map.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

The Node Map consists of the following components:

**Region component**

<img src="{{ 'images/v2.1/admin-ui-region-component.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

**Node component**

<img src="{{ 'images/v2.1/admin-ui-node-components.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:90%" />

For guidance on enabling and using the node map, see [Enable Node Map](enable-node-map.html).

### Time Series Graphs

The **Cluster Metrics** dashboards display the time series graphs that are useful to visualize and monitor data trends. To access the time series graphs, click **Metrics** on the left-hand navigation bar.

You can hover over each graph to see actual point-in-time values.

<img src="{{ 'images/v2.1/admin_ui_hovering.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}By default, CockroachDB stores timeseries metrics for the last 30 days, but you can reduce the interval for timeseries storage. Alternately, if you are exclusively using a third-party tool such as <a href="monitor-cockroachdb-with-prometheus.html">Prometheus</a> for timeseries monitoring, you can disable timeseries storage entirely. For more details, see this <a href="operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data-new-in-v2-0">FAQ</a>.
{{site.data.alerts.end}}

#### Change time range

You can change the time range by clicking on the time window.
<img src="{{ 'images/v2.1/admin-ui-time-range.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}The Admin UI shows time in UTC, even if you set a different time zone for your cluster. {{site.data.alerts.end}}

#### View metrics for a single node

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/v2.1/admin-ui-single-node.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Summary Panel

The **Cluster Metrics** dashboards display the **Summary** panel of key metrics. To view the **Summary** panel, click **Metrics** on the left-hand navigation bar.

<img src="{{ 'images/v2.1/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The **Summary** panel provides the following metrics:

Metric | Description
--------|----
Total Nodes | The total number of nodes in the cluster. <a href='admin-ui-access-and-navigate.html#decommissioned-nodes'>Decommissioned nodes</a> are not included in the Total Nodes count. <br><br>You can further drill down into the nodes details by clicking on [**View nodes list**](#node-list).
Dead Nodes | The number of [dead nodes](admin-ui-access-and-navigate.html#dead-nodes) in the cluster.
Capacity Used | The storage capacity used as a percentage of total storage capacity allocated across all nodes.
Unavailable Ranges | The number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster.
Queries per second | The number of SQL queries executed per second.
P50 Latency | The 50th percentile of service latency. Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.
P99 Latency | The 99th percentile of service latency.

{{site.data.alerts.callout_info}}
{% include available-capacity-metric.md %}
{{site.data.alerts.end}}

### Events Panel

The **Cluster Metrics** dashboards display the **Events** panel that lists the 10 most recent events logged for the all nodes across the cluster. To view the **Events** panel, click **Metrics** on the left-hand navigation bar. To see the list of all events, click **View all events** in the **Events** panel.

<img src="{{ 'images/v2.1/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:100%" />

The following types of events are listed:

- Database created
- Database dropped
- Table created
- Table dropped
- Table altered
- Index created
- Index dropped
- View created
- View dropped
- Schema change reversed
- Schema change finished
- Node joined
- Node decommissioned
- Node restarted
- Cluster setting changed
