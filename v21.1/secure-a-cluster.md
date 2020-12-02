---
title: Start a Local Cluster (Secure)
summary: Run a secure multi-node CockroachDB cluster locally, using TLS certificates to encrypt network communication.
toc: true
asciicast: true
---

<div class="filters filters-big clearfix">
    <a href="secure-a-cluster.html"><button class="filter-button current"><strong>Secure</strong></button></a>
    <a href="start-a-local-cluster.html"><button class="filter-button">Insecure</button></a>
</div>

Once you've [installed CockroachDB](install-cockroachdb.html), it's simple to run a secure multi-node cluster locally, using [TLS certificates](cockroach-cert.html) to encrypt network communication.

{% include cockroachcloud/use-cockroachcloud-instead.md %}

## Before you begin

- Make sure you have already [installed CockroachDB](install-cockroachdb.html).
- For quick SQL testing or app development, consider [running a single-node cluster](cockroach-start-single-node.html) instead.
- Note that running multiple nodes on a single host is useful for testing CockroachDB, but it's not suitable for production. To run a physically distributed cluster, see [Manual Deployment](manual-deployment.html) or [Orchestrated Deployment](orchestration.html), and review the [Production Checklist](recommended-production-settings.html).

<!-- TODO: update the asciicast
Also, feel free to watch this process in action before going through the steps yourself. Note that you can copy commands directly from the video, and you can use **<** and **>** to go back and forward.

<asciinema-player class="asciinema-demo" src="asciicasts/secure-a-cluster.json" cols="107" speed="2" theme="monokai" poster="npt:0:52" title="Secure a Cluster"></asciinema-player>
-->

## Step 1. Generate certificates

You can use either [`cockroach cert`](cockroach-cert.html) commands or [`openssl` commands](create-security-certificates-openssl.html) to generate security certificates. This section features the `cockroach cert` commands.

1. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

2. Create the CA (Certificate Authority) certificate and key pair:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

3. Create the certificate and key pair for your nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    Because you're running a local cluster and all nodes use the same hostname (`localhost`), you only need a single node certificate. Note that this is different than running a production cluster, where you would need to generate a certificate and key for each node, issued to all common names and IP addresses you might use to refer to the node as well as to any load balancer instances.

4. Create a client certificate and key pair for the `root` user:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

## Step 2. Start the cluster

1. Use the [`cockroach start`](cockroach-start.html) command to start the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
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

2. Take a moment to understand the [flags](cockroach-start.html#flags) you used:
    - The `--certs-dir` directory points to the directory holding certificates and keys.
    - Since this is a purely local cluster, `--listen-addr=localhost:26257` and `--http-addr=localhost:8080` tell the node to listen only on `localhost`, with port `26257` used for internal and client traffic and port `8080` used for HTTP requests from the DB Console.
    - The `--store` flag indicates the location where the node's data and logs are stored.
    - The `--join` flag specifies the addresses and ports of the nodes that will initially comprise your cluster. You'll use this exact `--join` flag when starting other nodes as well.

        {% include {{ page.version.version }}/prod-deployment/join-flag-single-region.md %}
    - The `--background` flag starts the `cockroach` process in the background so you can continue using the same terminal for other operations.

3. Start two more nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    These commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags.

4. Use the [`cockroach init`](cockroach-init.html) command to perform a one-time initialization of the cluster, sending the request to any node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --certs-dir=certs --host=localhost:26257
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

    At this point, each node also prints helpful [startup details](cockroach-start.html#standard-output) to its log. For example, the following command retrieves node 1's startup details:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ grep 'node starting' node1/logs/cockroach.log -A 11
    ~~~

    The output will look something like this:

    ~~~
    CockroachDB node starting at {{page.release_info.start_time}}
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

1. Run the [`cockroach sql`](cockroach-sql.html) command against node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26257
    ~~~

2. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

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
      id | balance
    +----+---------+
       1 | 1000.50
    (1 row)
    ~~~

3. Now exit the SQL shell on node 1 and open a new shell on node 2:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26258
    ~~~

    {{site.data.alerts.callout_info}}
    In a real deployment, all nodes would likely use the default port `26257`, and so you wouldn't need to set the port portion of `--host`.
    {{site.data.alerts.end}}

4. Run the same `SELECT` query as before:

    {% include copy-clipboard.html %}
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

5. Now [create a user with a password](create-user.html#create-a-user-with-a-password), which you will need to [access the DB Console](#step-5-access-the-db-console):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER max WITH PASSWORD 'roach';
    ~~~

6. Exit the SQL shell on node 2:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Run a sample workload

CockroachDB also comes with a number of [built-in workloads](cockroach-workload.html) for simulating client traffic. Let's the workload based on CockroachDB's sample vehicle-sharing application, [MovR](movr.html).

1. Load the initial dataset:

    {% include copy-clipboard.html %}
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

2. Run the workload for 5 minutes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run movr \
    --duration=5m \
    'postgresql://root@localhost:26257?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt'
    ~~~

## Step 5. Access the DB Console

The CockroachDB [DB Console](ui-overview.html) gives you insight into the overall health of your cluster as well as the performance of the client workload.

1. On secure clusters, [certain pages of the DB Console](ui-overview.html#db-console-access) can only be accessed by `admin` users.

    Run the [`cockroach sql`](cockroach-sql.html) command against node 1:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26257
    ~~~

2.  Assign `max` to the `admin` role (you only need to do this once):

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT admin TO max;
    ~~~

3. Exit the SQL shell:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

4. Go to <a href="https://localhost:8080" data-proofer-ignore>https://localhost:8080</a>. Note that your browser will consider the CockroachDB-created certificate invalid; you'll need to click through a warning message to get to the UI.

    {% include {{ page.version.version }}/misc/chrome-localhost.md %}

5. Log in with the username and password you created earlier (`max`/`roach`).

6. On the [**Cluster Overview**](ui-cluster-overview-page.html), notice that three nodes are live, with an identical replica count on each node:

    <img src="{{ 'images/v21.1/ui_cluster_overview_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    This demonstrates CockroachDB's [automated replication](demo-data-replication.html) of data via the Raft consensus protocol.    

    {{site.data.alerts.callout_info}}
    Capacity metrics can be incorrect when running multiple nodes on a single machine. For more details, see this [limitation](known-limitations.html#available-capacity-metric-in-the-db-console).
    {{site.data.alerts.end}}

7. Click [**Metrics**](ui-overview-dashboard.html) to access a variety of time series dashboards, including graphs of SQL queries and service latency over time:

    <img src="{{ 'images/v21.1/ui_overview_dashboard_3_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

8. Use the [**Databases**](ui-databases-page.html), [**Statements**](ui-statements-page.html), and [**Jobs**](ui-jobs-page.html) pages to view details about your databases and tables, to assess the performance of specific queries, and to monitor the status of long-running operations like schema changes, respectively.

## Step 6. Simulate node failure

1. In a new terminal, run the [`cockroach quit`](cockroach-quit.html) command against a node to simulate a node failure:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=localhost:26259
    ~~~

2. Back in the DB Console, despite one node being "suspect", notice the continued SQL traffic:

    <img src="{{ 'images/v21.1/ui_overview_dashboard_1_suspect.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    This demonstrates CockroachDB's use of the Raft consensus protocol to [maintain availability and consistency in the face of failure](demo-fault-tolerance-and-recovery.html); as long as a majority of replicas remain online, the cluster and client traffic continue uninterrupted.

4. Restart node 3:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

## Step 7. Scale the cluster

Adding capacity is as simple as starting more nodes with `cockroach start`.

1. Start 2 more nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node4 \
    --listen-addr=localhost:26260 \
    --http-addr=localhost:8083 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    Again, these commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags.

2. Back on the **Cluster Overview** in the DB Console, you'll now see 5 nodes listed:

    <img src="{{ 'images/v21.1/ui_cluster_overview_5_nodes.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

    At first, the replica count will be lower for nodes 4 and 5. Very soon, however, you'll see those numbers even out across all nodes, indicating that data is being [automatically rebalanced](demo-replication-and-rebalancing.html) to utilize the additional capacity of the new nodes.

## Step 8. Stop the cluster

1. When you're done with your test cluster, use the [`cockroach quit`](cockroach-quit.html) command to gracefully shut down each node.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=localhost:26257
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=localhost:26258
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=localhost:26259
    ~~~

    {{site.data.alerts.callout_info}}
    For nodes 4 and 5, the shutdown process will take longer (about a minute each) and will eventually force the nodes to stop. This is because, with only 2 of 5 nodes left, a majority of replicas are not available, and so the cluster is no longer operational.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=localhost:26260
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --certs-dir=certs --host=localhost:26261
    ~~~

2. To restart the cluster at a later time, run the same `cockroach start` commands as earlier from the directory containing the nodes' data stores.  

    If you do not plan to restart the cluster, you may want to remove the nodes' data stores and the certificate directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4 node5 certs my-safe-directory
    ~~~

## What's next?

- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html) and the [built-in SQL client](cockroach-sql.html)
- [Install the client driver](install-client-drivers.html) for your preferred language
- [Build an app with CockroachDB](build-an-app-with-cockroachdb.html)
- Further explore CockroachDB capabilities like [fault tolerance and automated repair](demo-fault-tolerance-and-recovery.html), [geo-partitioning](demo-low-latency-multi-region-deployment.html), [serializable transactions](demo-serializable.html), and [JSON support](demo-json-support.html)
