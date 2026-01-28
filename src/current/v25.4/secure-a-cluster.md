---
title: Deploy a Local Cluster from Binary (Secure)
summary: Run a secure multi-node CockroachDB cluster locally, using TLS certificates to encrypt network communication.
toc: true
docs_area: deploy
---

{% include {{ page.version.version }}/filter-tabs/start-a-cluster.md %}

Once you've [installed CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}), it's simple to run a secure multi-node cluster locally, using [TLS certificates]({% link {{ page.version.version }}/cockroach-cert.md %}) to encrypt network communication.

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

- Make sure you have already [installed CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}).
- For quick SQL testing or app development, consider [running a single-node cluster]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) instead.
- Note that running multiple nodes on a single host is useful for testing CockroachDB, but it's not suitable for production. To run a physically distributed cluster, see [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %}) or [Orchestrated Deployment]({% link {{ page.version.version }}/kubernetes-overview.md %}), and review the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}).

## Step 1. Generate certificates

You can use either [`cockroach cert`]({% link {{ page.version.version }}/cockroach-cert.md %}) commands or [`openssl` commands]({% link {{ page.version.version }}/create-security-certificates-openssl.md %}) to generate security certificates. This section features the `cockroach cert` commands.

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA (Certificate Authority) certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create the certificate and key pair for your nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    Because you're running a local cluster and all nodes use the same hostname (`localhost`), you only need a single node certificate. Note that this is different than running a production cluster, where you would need to generate a certificate and key for each node, issued to all common names and IP addresses you might use to refer to the node as well as to any load balancer instances.

1. Create a client certificate and key pair for the `root` user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

## Step 2. Start the cluster

1. Use the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command to start the first node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    You'll see a message like the following:

    ~~~
    *
    * INFO: initial startup completed.
    * Node will now attempt to join a running cluster, or wait for `cockroach init`.
    * Client connections will be accepted after this completes successfully.
    * Check the log file(s) for progress.
    *
    ~~~

1. Take a moment to understand the [flags]({% link {{ page.version.version }}/cockroach-start.md %}#flags) you used:
    - The `--certs-dir` directory points to the directory holding certificates and keys.
    - Since this is a purely local cluster, `--listen-addr=localhost:26257` and `--http-addr=localhost:8080` tell the node to listen only on `localhost`, with port `26257` used for internal and client traffic and port `8080` used for HTTP requests from the DB Console.
    - The `--store` flag indicates the location where the node's data and logs are stored.
    - The `--join` flag specifies the addresses and ports of the nodes that will initially comprise your cluster. You'll use this exact `--join` flag when starting other nodes as well.

        {% include {{ page.version.version }}/prod-deployment/join-flag-single-region.md %}

1. In separate terminal windows, start two more nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    These commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags.

1. Use the [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command to perform a one-time initialization of the cluster, sending the request to any node on the `--join` list:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --certs-dir=certs --host=localhost:26257
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

    At this point, each node also prints helpful [startup details]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output) to its log. For example, the following command retrieves node 1's startup details:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ grep 'node starting' node1/logs/cockroach.log -A 11
    ~~~

    The output will look something like this:

    ~~~
    CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
    build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}} (go1.12.6)
    webui:               https://localhost:8080
    sql:                 postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt
    RPC client flags:    cockroach <client cmd> --host=localhost:26257 --certs-dir=certs
    logs:                /Users/<username>/node1/logs
    temp dir:            /Users/<username>/node1/cockroach-temp966687937
    external I/O path:   /Users/<username>/node1/extern
    store[0]:            path=/Users/<username>/node1
    status:              initialized new cluster
    clusterID:           b2537de3-166f-42c4-aae1-742e094b8349
    nodeID:              1
    ~~~

## Step 3. Use the built-in SQL client

Now that your cluster is live, you can use any node as a SQL gateway. To test this out, let's use CockroachDB's built-in SQL client.

1. Run the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) command against node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26257
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

1. Now exit the SQL shell on node 1 and open a new shell on node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26258
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

1. Now [create a user with a password]({% link {{ page.version.version }}/create-user.md %}#create-a-user-with-a-password), which you will need to [access the DB Console](#step-5-access-the-db-console):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER max WITH PASSWORD 'roach';
    ~~~

1. Exit the SQL shell on node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Run a sample workload

CockroachDB also comes with a number of [built-in workloads]({% link {{ page.version.version }}/cockroach-workload.md %}) for simulating client traffic. Let's run the workload based on CockroachDB's sample vehicle-sharing application, [MovR]({% link {{ page.version.version }}/movr.md %}).

1. Load the initial dataset:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr \
    'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
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
    'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
    ~~~

## Step 5. Access the DB Console

The CockroachDB [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) gives you insight into the overall health of your cluster as well as the performance of the client workload.

1. On secure clusters, [certain pages of the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) can only be accessed by `admin` users.

    Run the [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}) command against node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26257
    ~~~

1.  Assign `max` to the `admin` role (you only need to do this once):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT admin TO max;
    ~~~

1. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

1. Go to <a href="https://localhost:8080" data-proofer-ignore>https://localhost:8080</a>. Note that your browser will consider the CockroachDB-created certificate invalid; you'll need to click through a warning message to get to the UI.

    {% include {{ page.version.version }}/misc/chrome-localhost.md %}

1. Log in with the username and password you created earlier (`max`/`roach`).

1. On the [**Cluster Overview**]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}), notice that three nodes are live, with an identical replica count on each node:

    <img src="{{ 'images/v25.4/ui_cluster_overview_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    This demonstrates CockroachDB's [automated replication]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) of data via the Raft consensus protocol.

    {{site.data.alerts.callout_info}}
    Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation]({% link {{ page.version.version }}/known-limitations.md %}#available-capacity-metric-in-the-db-console).
    {{site.data.alerts.end}}

1. Click [**Metrics**]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) to access a variety of time series dashboards, including graphs of SQL queries and service latency over time:

    <img src="{{ 'images/v25.4/ui_overview_dashboard_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. Use the [**Databases**]({% link {{ page.version.version }}/ui-databases-page.md %}), [**Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}), and [**Jobs**]({% link {{ page.version.version }}/ui-jobs-page.md %}) pages to view details about your databases and tables, to assess the performance of specific queries, and to monitor the status of long-running operations like schema changes, respectively.

## Step 6. Simulate node maintenance

1. In a new terminal, gracefully shut down a node. This is normally done prior to node maintenance:

    Get the process IDs of the nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501  4482     1   0  2:41PM ttys000    0:09.78 cockroach start --certs-dir=certs --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
      501  4497     1   0  2:41PM ttys000    0:08.54 cockroach start --certs-dir=certs --store=node2 --listen-addr=localhost:26258 --http-addr=localhost:8081 --join=localhost:26257,localhost:26258,localhost:26259
      501  4503     1   0  2:41PM ttys000    0:08.54 cockroach start --certs-dir=certs --store=node3 --listen-addr=localhost:26259 --http-addr=localhost:8082 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    Gracefully shut down node 3, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4503
    ~~~

1. Back in the DB Console, despite one node being "suspect", notice the continued SQL traffic:

    <img src="{{ 'images/v25.4/ui_overview_dashboard_1_suspect.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

1. Restart node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

## Step 7. Scale the cluster

Adding capacity is as simple as starting more nodes with `cockroach start`.

1. In separate terminal windows, start 2 more nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node4 \
    --listen-addr=localhost:26260 \
    --http-addr=localhost:8083 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    Again, these commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags.

1. Back on the **Cluster Overview** in the DB Console, you'll now see 5 nodes listed:

    <img src="{{ 'images/v25.4/ui_cluster_overview_5_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    At first, the replica count will be lower for nodes 4 and 5. Very soon, however, you'll see those numbers even out across all nodes, indicating that data is being [automatically rebalanced]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}) to utilize the additional capacity of the new nodes.

## Step 8. Stop the cluster

1. When you're done with your test cluster, stop the nodes.

    Get the process IDs of the nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501  4482     1   0  2:41PM ttys000    0:09.78 cockroach start --certs-dir=certs --store=node1 --listen-addr=localhost:26257 --http-addr=localhost:8080 --join=localhost:26257,localhost:26258,localhost:26259
      501  4497     1   0  2:41PM ttys000    0:08.54 cockroach start --certs-dir=certs --store=node2 --listen-addr=localhost:26258 --http-addr=localhost:8081 --join=localhost:26257,localhost:26258,localhost:26259
      501  4503     1   0  2:41PM ttys000    0:08.54 cockroach start --certs-dir=certs --store=node3 --listen-addr=localhost:26259 --http-addr=localhost:8082 --join=localhost:26257,localhost:26258,localhost:26259
      501  4510     1   0  2:42PM ttys000    0:08.46 cockroach start --certs-dir=certs --store=node4 --listen-addr=localhost:26260 --http-addr=localhost:8083 --join=localhost:26257,localhost:26258,localhost:26259
      501  4622     1   0  2:43PM ttys000    0:02.51 cockroach start --certs-dir=certs --store=node5 --listen-addr=localhost:26261 --http-addr=localhost:8084 --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    Gracefully shut down each node, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4482
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4497
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4503
    ~~~

    {{site.data.alerts.callout_info}}
    For `node4` and `node5`, the shutdown process will take longer (about a minute each) and will eventually force the nodes to stop. Because only two of the five nodes are now running, the cluster has lost quorum and is no longer operational.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4510
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 4622
    ~~~

1. To restart the cluster at a later time, run the same `cockroach start` commands as earlier from the directory containing the nodes' data stores.

1. If you do not plan to restart the cluster, you may want to remove the nodes' data stores and the certificate directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 certs my-safe-directory
    ~~~

## What's next?

- [Install the client driver]({% link {{ page.version.version }}/install-client-drivers.md %}) for your preferred language
- Learn more about [CockroachDB SQL]({% link {{ page.version.version }}/learn-cockroachdb-sql.md %}) and the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %})
- Further explore CockroachDB capabilities like [fault tolerance and automated repair]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}), [multi-region performance]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %}), [serializable transactions]({% link {{ page.version.version }}/demo-serializable.md %}), and [JSON support]({% link {{ page.version.version }}/demo-json-support.md %})

You might also be interested in the following pages:

- [CockroachDB SQL client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [Example Apps]({% link {{ page.version.version }}/example-apps.md %})
