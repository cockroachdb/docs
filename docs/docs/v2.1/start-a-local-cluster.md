---
title: Start a Local Cluster (Insecure)
summary: Run an insecure multi-node CockroachDB cluster locally with each node listening on a different port.
toc: true
toc_not_nested: true
---

<div class="filters filters-big clearfix">
    <a href="start-a-local-cluster.html"><button class="filter-button current"><strong>Insecure</strong></button></a>
    <a href="secure-a-cluster.html"><button class="filter-button">Secure</button></a>
</div>

Once you’ve [installed CockroachDB](install-cockroachdb.html), it’s simple to start an insecure multi-node cluster locally.

{{site.data.alerts.callout_info}}
Running multiple nodes on a single host is useful for testing out CockroachDB, but it's not recommended for production deployments. To run a physically distributed cluster in production, see [Manual Deployment](manual-deployment.html) or [Orchestrated Deployment](orchestration.html). Also be sure to review the [Production Checklist](recommended-production-settings.html).
{{site.data.alerts.end}}


## Before you begin

Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Start the first node

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --listen-addr=localhost
~~~

~~~
CockroachDB node starting at 2018-09-13 01:25:57.878119479 +0000 UTC (took 0.3s)
build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}}
webui:               http://localhost:8080
sql:                 postgresql://root@localhost:26257?sslmode=disable
client flags:        cockroach <client cmd> --host=localhost:26257 --insecure
logs:                cockroach/cockroach-data/logs
temp dir:            cockroach-data/cockroach-temp998550693
external I/O path:   cockroach-data/extern
store[0]:            path=cockroach-data
status:              initialized new cluster
clusterID:           2711b3fa-43b3-4353-9a23-20c9fb3372aa
nodeID:              1
~~~

This command starts a node in insecure mode, accepting most [`cockroach start`](start-a-node.html) defaults.

- The `--insecure` flag makes communication unencrypted.
- Since this is a purely local cluster, `--listen-addr=localhost` tells the node to listen only on `localhost`, with default ports used for internal and client traffic (`26257`) and for HTTP requests from the Admin UI (`8080`).
- Node data is stored in the `cockroach-data` directory.
- The [standard output](start-a-node.html#standard-output) gives you helpful details such as the CockroachDB version, the URL for the Admin UI, and the SQL URL for clients.

## Step 2. Add nodes to the cluster

At this point, your cluster is live and operational. With just one node, you can already connect a SQL client and start building out your database. In real deployments, however, you'll always want 3 or more nodes to take advantage of CockroachDB's [automatic replication](demo-data-replication.html), [rebalancing](demo-automatic-rebalancing.html), and [fault tolerance](demo-fault-tolerance-and-recovery.html) capabilities. This step helps you simulate a real deployment locally.

In a new terminal, add the second node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node2 \
--listen-addr=localhost:26258 \
--http-addr=localhost:8081 \
--join=localhost:26257
~~~

In a new terminal, add the third node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node3 \
--listen-addr=localhost:26259 \
--http-addr=localhost:8082 \
--join=localhost:26257
~~~

The main difference in these commands is that you use the `--join` flag to connect the new nodes to the cluster, specifying the address and port of the first node, in this case `localhost:26257`. Since you're running all nodes on the same machine, you also set the `--store`, `--listen-addr`, and `--http-addr` flags to locations and ports not used by other nodes, but in a real deployment, with each node on a different machine, the defaults would suffice.

## Step 3. Test the cluster

Now that you've scaled to 3 nodes, you can use any node as a SQL gateway to the cluster. To demonstrate this, open a new terminal and connect the [built-in SQL client](use-the-built-in-sql-client.html) to node 1:

{{site.data.alerts.callout_info}}
The SQL client is built into the `cockroach` binary, so nothing extra is needed.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26257
~~~

Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO bank.accounts VALUES (1, 1000.50);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

Exit the SQL shell on node 1:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

Then connect the SQL shell to node 2, this time specifying the node's non-default port:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26258
~~~

{{site.data.alerts.callout_info}}
In a real deployment, all nodes would likely use the default port `26257`, and so you wouldn't need to set the port portion of `--host`.
{{site.data.alerts.end}}

Now run the same `SELECT` query:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

As you can see, node 1 and node 2 behaved identically as SQL gateways.

Exit the SQL shell on node 2:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

## Step 4. Monitor the cluster

Access the [Admin UI](admin-ui-overview.html) for your cluster by pointing a browser to `http://localhost:8080`, or to the address in the `admin` field in the standard output of any node on startup. Then click **Metrics** on the left-hand navigation bar.

<img src="{{ 'images/v2.1/admin_ui_overview_dashboard.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

As mentioned earlier, CockroachDB automatically replicates your data behind-the-scenes. To verify that data written in the previous step was replicated successfully, scroll down to the **Replicas per Node** graph and hover over the line:

<img src="{{ 'images/v2.1/admin_ui_replicas_per_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

The replica count on each node is identical, indicating that all data in the cluster was replicated 3 times (the default).

{{site.data.alerts.callout_info}}
Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation](known-limitations.html#available-capacity-metric-in-the-admin-ui).
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For more insight into how CockroachDB automatically replicates and rebalances data, and tolerates and recovers from failures, see our [replication](demo-data-replication.html), [rebalancing](demo-automatic-rebalancing.html), [fault tolerance](demo-fault-tolerance-and-recovery.html) demos.
{{site.data.alerts.end}}

## Step 5.  Stop the cluster

Once you're done with your test cluster, switch to the terminal running the first node and press **CTRL-C** to stop the node.

At this point, with 2 nodes still online, the cluster remains operational because a majority of replicas are available. To verify that the cluster has tolerated this "failure", connect the built-in SQL shell to nodes 2 or 3. You can do this in the same terminal or in a new terminal.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26258
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

Exit the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

Now stop nodes 2 and 3 by switching to their terminals and pressing **CTRL-C**.

{{site.data.alerts.callout_success}}
For node 3, the shutdown process will take longer (about a minute) and will eventually force stop the node. This is because, with only 1 of 3 nodes left, a majority of replicas are not available, and so the cluster is no longer operational. To speed up the process, press **CTRL-C** a second time.
{{site.data.alerts.end}}

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

{% include copy-clipboard.html %}
~~~ shell
$ rm -rf cockroach-data node2 node3
~~~

## Step 6. Restart the cluster

If you decide to use the cluster for further testing, you'll need to restart at least 2 of your 3 nodes from the directories containing the nodes' data stores.

Restart the first node from the parent directory of `cockroach-data/`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--listen-addr=localhost
~~~

{{site.data.alerts.callout_info}}
With only 1 node back online, the cluster will not yet be operational, so you will not see a response to the above command until after you restart the second node.
{{site.data.alerts.end}}

In a new terminal, restart the second node from the parent directory of `node2/`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node2 \
--listen-addr=localhost:26258 \
--http-addr=localhost:8081 \
--join=localhost:26257
~~~

In a new terminal, restart the third node from the parent directory of `node3/`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node3 \
--listen-addr=localhost:26259 \
--http-addr=localhost:8082 \
--join=localhost:26257
~~~

## What's next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](use-the-built-in-sql-client.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](build-an-app-with-cockroachdb.html)
- [Explore core CockroachDB features](demo-data-replication.html) like automatic replication, rebalancing, fault tolerance, and cloud migration.
