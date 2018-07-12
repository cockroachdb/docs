---
title: Cluster Startup and Scaling
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
redirect_from: /training/cluster-startup-and-scaling.html
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vReMGQvxlD5A84On802gukVFgoSuL4gJKl0JX2xy9aQenikBOmO12W08566QaKVJzD5c6VkoYlWUPKI/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Step 1. Create a training directory

To make it easier to keep track of all the files for this training, create a new directory and `cd` into it:

{% include copy-clipboard.html %}
~~~ shell
$ mkdir cockroachdb-training
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cd cockroachdb-training
~~~

{{site.data.alerts.callout_info}}From this point on, you'll start nodes and run all other commands from inside the <code>cockroachdb-training</code> directory.{{site.data.alerts.end}}

## Step 2. Install CockroachDB

1. Download the CockroachDB archive for your OS, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xJ
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget -qO- https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar  xvz
    ~~~
    </div>

2. Move the binary into the parent `cockroachdb-training` directory:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach . \
    ; rm -rf cockroach-{{ page.release_info.version }}.darwin-10.9-amd64
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-{{ page.release_info.version }}.linux-amd64/cockroach . \
    ; rm -rf cockroach-{{ page.release_info.version }}
    ~~~
    </div>

## Step 3. Start a node

Use the [`cockroach start`](../start-a-node.html) command to start a node:

{% include copy-clipboard.html %}
~~~ shell
$ ./cockroach start \
--insecure \
--store=node1 \
--host=localhost \
--port=26257 \
--http-port=8080 \
--join=localhost:26257,localhost:26258,localhost:26259
~~~

You'll see the following message:

~~~
*
* WARNING: RUNNING IN INSECURE MODE!
*
* - Your cluster is open for any client that can access localhost.
* - Any user, even root, can log in without providing a password.
* - Any user, connecting as root, can read or write any data in your cluster.
* - There is no network encryption nor authentication, and thus no confidentiality.
*
* Check out how to secure your cluster: https://www.cockroachlabs.com/docs/stable/secure-a-cluster.html
*
~~~

This output will expand in a few steps once the cluster has been initialized.

## Step 4. Understand the flags you used

Before moving on, take a moment to understand the flags you used with the `cockroach start` command:

Flag | Description
-----|------------
`--insecure` | Indicates that the node will communicate without encryption.<br><br>You'll start all other nodes with this flag, as well as all other `cockroach` commands you'll use against the cluster.<br><br>Without this flag, `cockroach` expects to be able to find security certificates to encrypt its communication. More about these in a later module.
`--store` | The location where the node stores its data and logs.<br><br>Since you'll be running all nodes on your computer, you need to specify a unique storage location for each node.<br><br>In a real deployment, with one node per machine, it's fine to let `cockroach` use the its default storage location (`cockroach-data`).
`--host` | The hostname or IP address for communication with other nodes and clients.<br><br>In this training, since you'll use a purely local cluster, `--host=localhost` tells the node to listens only on `localhost`.
`--port` | The TCP port for communication with other nodes and clients.<br><br>Since you'll be running all nodes on your computer, you need to specify a unique port for each node.<br><br>In a real deployment, with one node per machine, it's fine to let `cockroach` use its default port (`26257`).
`--http-port` | The HTTP port for accessing the Admin UI.<br><br>Again, since you'll be running all nodes on your computer, you need to specify a unique HTTP port for each node.<br><br>In a real deployment, with one node per machine, it's fine to let `cockroach` use its default HTTP port (`8080`).
`--join` | The addresses and TCP ports of all of your initial nodes.<br><br>You'll use this exact `--join` flag when starting all other nodes.

{{site.data.alerts.callout_success}}You can run <code>./cockroach start --help</code> to get help on this command directly in your terminal and <code>./cockroach --help</code> to get help on other commands.{{site.data.alerts.end}}

## Step 5. Start two more nodes

Start two more nodes, using the same `cockroach start` command as earlier but with unique `--store`, `--port`, and `--http-port` flags for each new node.

1. In another terminal, start the second node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node2 \
    --host=localhost \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In another terminal, start the third node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node3 \
    --host=localhost \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

## Step 6. Initialize the cluster

1. In another terminal, use the [`cockroach init`](../initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach init --insecure
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

2. Go back to the terminal where you started one of the nodes and look at the additional details that were printed to `stdout`:

    ~~~
    CockroachDB node starting at 2018-02-02 05:08:22.841392 +0000 UTC
    build:      CCL {{page.release_info.version}} @ 2018/01/08 17:30:06 (go1.8.3)
    admin:      http://localhost:8080
    sql:        postgresql://root@localhost:26257?sslmode=disable
    logs:       /Users/jesseseldess/cockroachdb-training/node1/logs
    store[0]:   path=/Users/jesseseldess/cockroachdb-training/node1
    status:     initialized new cluster
    clusterID:  930527b8-327b-4e13-99dd-640db40a2844
    nodeID:     1
    ~~~

    Field | Description
    ------|------------
    `build` | The version of CockroachDB you are running.
    `admin` | The URL for accessing the Admin UI.
    `sql` | The connection URL for clients.
    `logs` | The directory containing debug log data.
    `store[n]` | The directory containing the node's data.
    `status` | Whether the node is the first in the cluster (`initialized new cluster`), joined an existing cluster for the first time (`initialized new node, joined pre-existing cluster`), or rejoined an existing cluster (`restarted pre-existing node`).
    `clusterID` | The ID of the cluster.
    `nodeID` | The ID of the node.

## Step 7. Verify that the cluster is live

1. Use the [`cockroach node status`](../view-node-details.html) command to check that all 3 nodes are part of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach node status --insecure
    ~~~

    ~~~
    +----+-----------------+--------+---------------------+---------------------+
    | id |     address     | build  |     updated_at      |     started_at      |
    +----+-----------------+--------+---------------------+---------------------+
    |  1 | localhost:26257 | {{page.release_info.version}} | 2018-02-02 16:48:27 | 2018-02-02 16:48:17 |
    |  2 | localhost:26259 | {{page.release_info.version}} | 2018-02-02 16:48:27 | 2018-02-02 16:48:17 |
    |  3 | localhost:26258 | {{page.release_info.version}} | 2018-02-02 16:48:27 | 2018-02-02 16:48:17 |
    +----+-----------------+--------+---------------------+---------------------+
    (3 rows)
    ~~~

2. Use the [`cockroach sql`](../use-the-built-in-sql-client.html) command to query the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach sql \
    --insecure \
    --port=26257 \
    --execute="SHOW DATABASES;"
    ~~~

    ~~~
    +----------+
    | Database |
    +----------+
    | system   |
    +----------+
    (1 row)
    ~~~

    You just queried the node listening on `26257`, but every other node is a SQL gateway to the cluster as well. We'll learn more about CockroachDB SQL and the built-in SQL client in a later module.

## Step 8. Look at the current state of replication

1. To understand replication in CockroachDB, it's important to review a few concepts from the architecture:

    Concept | Description
    --------|------------
    **Range** | CockroachDB stores all user data and almost all system data in a giant sorted map of key-value pairs.<br><br>This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
    **Range Replica** | CockroachDB replicates each range 3 times by default and stores each replica on a different node.<br><br>In a later module, you'll learn how to control replication.

2. With those concepts in mind, open the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a> and view the **Node List**:

    <img src="{{ 'images/v2.0/training-1.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    Note that the **Replicas** count is **20** on all three nodes. This indicates:
    - There are 20 initial "ranges" of data in the cluster. These are all internal "system" ranges since you haven't added any table data yet.
    - Each range has been replicated 3 times (according to the CockroachDB default).
    - For each range, each replica is stored on different nodes.

## Step 9. Scale the cluster

Adding more nodes to your cluster is even easier than starting the cluster. Just like before, you use the `cockroach start` command with unique `--store`, `--port`, and `--http-port` flags for each new node. But this time, you don't have to follow-up with the `cockroach init` command or any other commands.

1. In another terminal, start the fourth node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node4 \
    --host=localhost \
    --port=26260 \
    --http-port=8083 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~~

2. In another terminal, start the fifth node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./cockroach start \
    --insecure \
    --store=node5 \
    --host=localhost \
    --port=26261 \
    --http-port=8084 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    As soon as you run these commands, the nodes join the cluster. There's no need to run the `cockroach init` command or any other commands.

## Step 10. Watch data rebalance across all 5 nodes

Go back to the **Live Nodes** list in the Admin UI and watch how the **Replicas** are automatically rebalanced to utilize the additional capacity of the new nodes:

<img src="{{ 'images/v2.0/training-2.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Another way to observe this is to click **Metrics** in the upper left and scroll down to the **Replicas per Node** graph:

<img src="{{ 'images/v2.0/training-3.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## What's Next?

- [Fault Tolerance and Automated Repair](fault-tolerance-and-automated-repair.html)
