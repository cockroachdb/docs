---
title: Deploy a Local Cluster from Binary (Insecure)
summary: Run an insecure multi-node CockroachDB cluster locally with each node listening on a different port.
toc: true
toc_not_nested: true
docs_area: deploy
---

{% include {{ page.version.version }}/filter-tabs/start-a-cluster.md %}

Once you've [installed CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}), it's simple to run an insecure multi-node cluster locally.

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

- Make sure you have already [installed CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}).
- For quick SQL testing or app development, consider [running a single-node cluster]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) instead.
- Running multiple nodes on a single host is useful for testing CockroachDB, but it's not suitable for production. To run a physically distributed cluster, refer to [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %}) or [Orchestrated Deployment]({% link {{ page.version.version }}/kubernetes-overview.md %}), and review the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}).

{{site.data.alerts.callout_danger}}
Reusing a previously initialized store when starting a new cluster is not recommended. If the store is incompatible with either the new CockroachDB binary or the new cluster configuration, this can lead to panics or other problems when starting a cluster. Instead, either move or delete the previous store directory before starting the `cockroach` process. An example of an incompatible configuration is if the new cluster is started with the `--start-single-node` flag, which disables replication, when the cluster configuration in the store has replication enabled.

The store directory is `cockroach-data/` in the same directory as the `cockroach` command by default, or the location passed to the `--store` flag otherwise. For details about configuring the store location, refer to [cockroach start]({% link {{ page.version.version }}/cockroach-start.md %}#store).
{{site.data.alerts.end}}

## Step 1. Start the cluster

This section shows how to start a cluster interactively. In production, operators usually use a process manager like `systemd` to start and manage the `cockroach` process on each node. Refer to [Deploy CockroachDB On-Premises]({% link {{page.version.version}}/deploy-cockroachdb-on-premises.md %}?filters=systemd).

1. Use the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command to start the `node1` in the foreground:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {{site.data.alerts.callout_info}}
    The `--background` flag is not recommended. If you decide to start nodes in the background, you must also pass the `--pid-file` argument. To stop a `cockroach` process running in the background, extract the process ID from the PID file and pass it to the command to [stop the node](#step-7-stop-the-cluster).

    In production, operators usually use a process manager like `systemd` to start and manage the `cockroach` process on each node. Refer to [Deploy CockroachDB On-Premises]({% link {{ page.version.version }}/deploy-cockroachdb-on-premises.md %}?filters=systemd).
    {{site.data.alerts.end}}

    You'll see a message like the following:

    ~~~
    *
    * WARNING: RUNNING IN INSECURE MODE!
    *
    * - Your cluster is open for any client that can access localhost.
    * - Any user, even root, can log in without providing a password.
    * - Any user, connecting as root, can read or write any data in your cluster.
    * - There is no network encryption nor authentication, and thus no confidentiality.
    *
    * Check out how to secure your cluster: https://www.cockroachlabs.com/docs/{{ page.version.version }}/secure-a-cluster.html
    *
    *
    * INFO: initial startup completed.
    * Node will now attempt to join a running cluster, or wait for `cockroach init`.
    * Client connections will be accepted after this completes successfully.
    * Check the log file(s) for progress.
    *
    ~~~

1. Take a moment to understand the [flags]({% link {{ page.version.version }}/cockroach-start.md %}#flags) you used:
    - The `--insecure` flag makes communication unencrypted.
    - Since this is a purely local cluster, `--listen-addr=localhost:26257` and `--http-addr=localhost:8080` tell the node to listen only on `localhost`, with port `26257` used for internal and client traffic and port `8080` used for HTTP requests from the DB Console.
    - The `--store` flag indicates the location where the node's data and logs are stored.
    - The `--join` flag specifies the addresses and ports of the nodes that will initially comprise your cluster. You'll use this exact `--join` flag when starting other nodes as well.

        {% include {{ page.version.version }}/prod-deployment/join-flag-single-region.md %}

1. In new terminal windows, start `node2` and `node3`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    These commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags.

1. Use the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command to perform a one-time initialization of the cluster, sending the request to any node on the `--join` list:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

    At this point, each node also prints helpful [startup details]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output) to its log, and to `STDOUT` in the terminal window where the node was started. For example, the following command retrieves `node1`'s startup details:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ grep 'node starting' node1/logs/cockroach.log -A 11
    ~~~

    The output will look something like this:

    ~~~
    CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
    build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}} (go1.12.6)
    webui:               http://localhost:8080
    sql:                 postgresql://root@localhost:26257?sslmode=disable
    RPC client flags:    cockroach <client cmd> --host=localhost:26257 --insecure
    logs:                /Users/<username>/node1/logs
    temp dir:            /Users/<username>/node1/cockroach-temp242232154
    external I/O path:   /Users/<username>/node1/extern
    store[0]:            path=/Users/<username>/node1
    status:              initialized new cluster
    clusterID:           8a681a16-9623-4fc1-a537-77e9255daafd
    nodeID:              1
    ~~~

## Step 2. Use the built-in SQL client

Now that your cluster is live, you can use any node as a SQL gateway. To test this out, let's use CockroachDB's built-in SQL client.

1. In a new terminal, run the [cockroach sql]({% link {{ page.version.version }}/cockroach-sql.md %}) command and connect to `node1`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost:26257
    ~~~

    To exit the SQL shell at any time, you can use the `\q` command:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

1. Run some basic [CockroachDB SQL statements]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

1. In a new terminal window, open a new SQL shell and connect to `node2`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost:26258
    ~~~

    {{site.data.alerts.callout_info}}
    In a real deployment, all nodes would likely use the default port `26257`, and so you wouldn't need to set the port portion of `--host`.
    {{site.data.alerts.end}}

1. Run the same `SELECT` query as before:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

    As you can see, node 1 and node 2 behaved identically as SQL gateways.

1. Exit all SQL shell sessions by issuing the `\q` command in the terminals where they are running:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 3. Run a sample workload

CockroachDB also comes with a number of [built-in workloads]({% link {{ page.version.version }}/cockroach-workload.md %}) for simulating client traffic. Let's run the workload based on CockroachDB's sample vehicle-sharing application, [MovR]({% link {{ page.version.version }}/movr.md %}).

1. Load the initial dataset:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    ~~~
    I190926 16:50:35.663708 1 workload/workloadsql/dataload.go:135  imported users (0s, 50 rows)
    I190926 16:50:35.682583 1 workload/workloadsql/dataload.go:135  imported vehicles (0s, 15 rows)
    I190926 16:50:35.769572 1 workload/workloadsql/dataload.go:135  imported rides (0s, 500 rows)
    I190926 16:50:35.836619 1 workload/workloadsql/dataload.go:135  imported vehicle_location_histories (0s, 1000 rows)
    I190926 16:50:35.915498 1 workload/workloadsql/dataload.go:135  imported promo_codes (0s, 1000 rows)
    ~~~

1. Run the workload for 5 minutes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run movr \
    --duration=5m \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

## Step 4. Access the DB Console

The CockroachDB [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) gives you insight into the overall health of your cluster as well as the performance of the client workload.

1. Go to <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a>.

1. On the [**Cluster Overview**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}), notice that three nodes are live, with an identical replica count on each node:

    <img src="/docs/images/{{ page.version.version }}/ui_cluster_overview_3_nodes.png" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    This demonstrates CockroachDB's [automated replication]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) of data via the Raft consensus protocol.

    {{site.data.alerts.callout_info}}
    Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation]({% link {{ page.version.version }}/known-limitations.md %}#available-capacity-metric-in-the-db-console).
    {{site.data.alerts.end}}

1. Click [**Metrics**]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) to access a variety of time series dashboards, including graphs of SQL queries and service latency over time:

    <img src="/docs/images/{{ page.version.version }}/ui_overview_dashboard_3_nodes.png" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. Use the [**Databases**]({% link {{ page.version.version }}/ui-databases-page.md %}), [**Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}), and [**Jobs**]({% link {{ page.version.version }}/ui-jobs-page.md %}) pages to view details about your databases and tables, to assess the performance of specific queries, and to monitor the status of long-running operations like schema changes, respectively.

## Step 5. Simulate node maintenance

1. In a new terminal, gracefully shut down a node. This is normally done prior to node maintenance:

    Get the process IDs of the nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501  4482     1   0  2:41PM ttys000    0:09.78 cockroach start --insecure --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
      501  4497     1   0  2:41PM ttys000    0:08.54 cockroach start --insecure --store=node2 --listen-addr=localhost:26258 --http-addr=localhost:8081 --join=localhost:26257,localhost:26258,localhost:26259
      501  4503     1   0  2:41PM ttys000    0:08.54 cockroach start --insecure --store=node3 --listen-addr=localhost:26259 --http-addr=localhost:8082 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    Gracefully shut down `node3`, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4503
    ~~~

1. In the DB Console, despite one node being "suspect", notice the continued SQL traffic:

    <img src="/docs/images/{{ page.version.version }}/ui_overview_dashboard_1_suspect.png" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. Go to the terminal window for `node3` and restart it:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

## Step 6. Scale the cluster

Adding capacity is as simple as starting more nodes with `cockroach start`.

1. In new terminal windows, start two more nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node4 \
    --listen-addr=localhost:26260 \
    --http-addr=localhost:8083 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    Again, these commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags.

1. In the DB Console **Cluster Overview** page, confirm that the cluster now has five nodes.

    <img src="/docs/images/{{ page.version.version }}/ui_cluster_overview_5_nodes.png" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    At first, the replica count will be lower for `node4` and `node5`. Very soon, however, you'll see those numbers even out across all nodes, indicating that data is being [automatically rebalanced]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) to utilize the additional capacity of the new nodes.

## Step 7. Stop the cluster

1. When you're done with your test cluster, stop the nodes.

    Get the process IDs of the nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501  4482     1   0  2:41PM ttys000    0:09.78 cockroach start --insecure --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
      501  4497     1   0  2:41PM ttys000    0:08.54 cockroach start --insecure --store=node2 --listen-addr=localhost:26258 --http-addr=localhost:8081 --join=localhost:26257,localhost:26258,localhost:26259
      501  4503     1   0  2:41PM ttys000    0:08.54 cockroach start --insecure --store=node3 --listen-addr=localhost:26259 --http-addr=localhost:8082 --join=localhost:26257,localhost:26258,localhost:26259
      501  4510     1   0  2:42PM ttys000    0:08.46 cockroach start --insecure --store=node4 --listen-addr=localhost:26260 --http-addr=localhost:8083 --join=localhost:26257,localhost:26258,localhost:26259
      501  4622     1   0  2:43PM ttys000    0:02.51 cockroach start --insecure --store=node5 --listen-addr=localhost:26261 --http-addr=localhost:8084 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    Gracefully shut down each node by sending the `SIGTERM` signal to the `cockroach` process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4482
    ~~~

    Repeat this command for each node.

    {{site.data.alerts.callout_info}}
    For `node4` and `node5`, the shutdown process will take longer (about a minute each) and will eventually force the nodes to stop. Because only two of the five nodes are now running, the cluster has lost quorum and is no longer operational.
    {{site.data.alerts.end}}


1. To restart the cluster at a later time, run the same `cockroach start` commands as earlier from the directory containing the nodes' data stores.

1. If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5
    ~~~

## What's next?

- [Create a CockroachDB Cloud account](https://cockroachlabs.cloud/signup?experience=enterprise) where you can [generate and manage licenses]({% link {{ page.version.version }}/licensing-faqs.md %}) for CockroachDB installations
- [Install the client driver]({% link {{ page.version.version }}/install-client-drivers.md %}) for your preferred language
- Learn more about [CockroachDB SQL]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %}) and the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [Build an app with CockroachDB]({% link {{ page.version.version }}/example-apps.md %})
- Further explore CockroachDB capabilities like [fault tolerance and automated repair]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}), [multi-region performance]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %}), [serializable transactions]({% link {{ page.version.version }}/demo-serializable.md %}), and [JSON support]({% link {{ page.version.version }}/demo-json-support.md %})
