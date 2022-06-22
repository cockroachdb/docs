---
title: Cluster Startup and Scaling
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vReMGQvxlD5A84On802gukVFgoSuL4gJKl0JX2xy9aQenikBOmO12W08566QaKVJzD5c6VkoYlWUPKI/embed?start=false&loop=false" frameborder="0" width="756" height="454" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

<style>
  #toc ul:before {
    content: "Hands-on Lab"
  }
</style>

## Step 1. Install CockroachDB

1. Download the CockroachDB archive for your OS, and extract the binary:

    <div class="filters clearfix">
      <button style="width: 15%" class="filter-button" data-scope="mac">Mac</button>
      <button style="width: 15%" class="filter-button" data-scope="linux">Linux</button>
    </div>
    <p></p>

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz \
    | tar -xz
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~
    </div>

2. Move the binary into your `$PATH` so you can execute from any shell:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach \
    /usr/local/bin/
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mv cockroach-{{ page.release_info.version }}.linux-amd64/cockroach \
    /usr/local/bin/
    ~~~
    </div>

    {{site.data.alerts.callout_info}}
    If you get a permissions error, prefix the command with `sudo`.
    {{site.data.alerts.end}}

3. Clean up the directory where you unpacked the binary:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf cockroach-{{ page.release_info.version }}.darwin-10.9-amd64
    ~~~
    </div>

    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf cockroach-{{ page.release_info.version }}.linux-amd64
    ~~~
    </div>

    You can also execute the `cockroach` binary directly from its download
    location, but the rest of training documentation assumes you have the
    binary in your `PATH`.

## Step 2. Start a node

Use the [`cockroach start`](../cockroach-start.html) command to start a node:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node1 \
--listen-addr=localhost:26257 \
--http-addr=localhost:8080 \
--join=localhost:26257,localhost:26258,localhost:26259 \
--background
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
* Check out how to secure your cluster: https://www.cockroachlabs.com/docs/v19.2/secure-a-cluster.html
*
*
* INFO: initial startup completed, will now wait for `cockroach init`
* or a join to a running cluster to start accepting clients.
* Check the log file(s) for progress.
*
~~~

## Step 3. Understand the flags you used

Before moving on, take a moment to understand the flags you used with the `cockroach start` command:

Flag | Description
-----|------------
`--insecure` | Indicates that the node will communicate without encryption.<br><br>You'll start all other nodes with this flag, as well as all other `cockroach` commands you'll use against the cluster.<br><br>Without this flag, `cockroach` expects to be able to find security certificates to encrypt its communication. More about these in a later module.
`--store` | The location where the node stores its data and logs.<br><br>Since you'll be running all nodes on your computer, you need to specify a unique storage location for each node. In contrast, in a real deployment, with one node per machine, it's fine to let `cockroach` use its default storage location (`cockroach-data`).
`--listen-addr`<br>`--http-addr` | The IP address/hostname and port to listen on for connections from other nodes and clients and for Admin UI HTTP request, respectively.<br><br>Again, since you'll be running all nodes on your computer, you need to specify unique ports for each node. In contrast, in a real deployment, with one node per machine, it's fine to let `cockroach` use its default TPC port (`26257`) and HTTP port (`8080`).
`--join` | The addresses and ports of all of your initial nodes.<br><br>You'll use this exact `--join` flag when starting all other nodes.
`--background` | The node will run in the background.

{{site.data.alerts.callout_success}}
You can run `cockroach start --help` to get help on this command directly in your terminal and `cockroach --help` to get help on other commands.
{{site.data.alerts.end}}

## Step 4. Start two more nodes

Start two more nodes, using the same `cockroach start` command as earlier but with unique `--store`, `--listen-addr`, and `--http-addr` flags for each new node.

1. Start the second node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start the third node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

## Step 5. Initialize the cluster

1. Use the [`cockroach init`](../cockroach-init.html) command to perform a one-time initialization of the cluster, sending the request to any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

    You'll see the following message:

    ~~~
    Cluster successfully initialized
    ~~~

2. Look at the startup details in the server log:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ grep 'node starting' node1/logs/cockroach.log -A 11
    ~~~

    The output will look something like this:

    ~~~
    CockroachDB node starting at 2019-10-01 20:14:55.358954 +0000 UTC (took 27.9s)
    build:               CCL {{page.release_info.version}} @ 2019/09/25 15:18:08 (go1.12.6)
    webui:               http://localhost:8080
    sql:                 postgresql://root@localhost:26257?sslmode=disable
    client flags:        cockroach <client cmd> --host=localhost:26257 --insecure
    logs:                /Users/<username>/cockroachdb-training/node1/logs
    temp dir:            /Users/<username>/cockroachdb-training/node1/cockroach-temp462678173
    external I/O path:   /Users/<username>/cockroachdb-training/node1/extern
    store[0]:            path=/Users/<username>/cockroachdb-training/node1
    status:              initialized new cluster
    clusterID:           fdc056a4-0cc0-4b29-b435-60e1db239f82
    nodeID:              1
    ~~~

    Field | Description
    ------|------------
    `build` | The version of CockroachDB you are running.
    `webui` | The URL for accessing the Admin UI.
    `sql` | The connection URL for your client.
    `client flags` | The flags to use when connecting to the node via [`cockroach` client commands](../cockroach-commands.html).
    `logs` | The directory containing debug log data.
    `temp dir` | The temporary store directory of the node.
    `external I/O path` | The external IO directory with which the local file access paths are prefixed while performing [backup](../backup.html) and [restore](../restore.html) operations using local node directories or NFS drives.
    `store[n]` | The directory containing store data, where `[n]` is the index of the store, e.g., `store[0]` for the first store, `store[1]` for the second store.
    `status` | Whether the node is the first in the cluster (`initialized new cluster`), joined an existing cluster for the first time (`initialized new node, joined pre-existing cluster`), or rejoined an existing cluster (`restarted pre-existing node`).
    `clusterID` | The ID of the cluster.
    `nodeID` | The ID of the node.

## Step 6. Verify that the cluster is live

1. Use the [`cockroach node status`](../cockroach-node.html) command to check that all 3 nodes are part of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --insecure --host=localhost:26257
    ~~~

    ~~~
    id |     address     |   sql_address   |                  build                  |            started_at            |            updated_at            | locality | is_available | is_live
    +----+-----------------+-----------------+-----------------------------------------+----------------------------------+----------------------------------+----------+--------------+---------+
       1 | localhost:26257 | localhost:26257 | v19.2.0 | 2019-10-01 20:14:55.249457+00:00 | 2019-10-01 20:16:07.283866+00:00 |          | true         | true
       2 | localhost:26258 | localhost:26258 | v19.2.0 | 2019-10-01 20:14:55.445079+00:00 | 2019-10-01 20:16:02.972943+00:00 |          | true         | true
       3 | localhost:26259 | localhost:26259 | v19.2.0 | 2019-10-01 20:14:55.857631+00:00 | 2019-10-01 20:16:03.389338+00:00 |          | true         | true
    (3 rows)
    ~~~

2. Use the [`cockroach sql`](../cockroach-sql.html) command to query the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    --insecure \
    --host=localhost:26257 \
    --execute="SHOW DATABASES;"
    ~~~

    ~~~
      database_name
    +---------------+
      defaultdb
      postgres
      system
    (3 rows)
    ~~~

    You just queried the node listening on `26257`, but every other node is a SQL gateway to the cluster as well. We'll learn more about CockroachDB SQL and the built-in SQL client in a later module.

## Step 7. Look at the current state of replication

1. To understand replication in CockroachDB, it's important to review a few concepts from the architecture:

    Concept | Description
    --------|------------
    **Range** | CockroachDB stores all user data (tables, indexes, etc.) and almost all system data in a giant sorted map of key-value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.<br><br>From a SQL perspective, a table and its secondary indexes initially map to a single range, where each key-value pair in the range represents a single row in the table (also called the primary index because the table is sorted by the primary key) or a single row in a secondary index. As soon as a range reaches 512 MiB in size, it splits into two ranges. This process continues as the table and its indexes continue growing.
    **Replica** | CockroachDB replicates each range 3 times by default and stores each replica on a different node.<br><br>In a later module, you'll learn how to control replication.

2. With those concepts in mind, open the Admin UI at <a href="http://localhost:8080" data-proofer-ignore>http://localhost:8080</a> and view the **Node List**:

    <img src="{{ 'images/v20.1/training-1.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

    Note that the **Replicas** count is the same on all three nodes. This indicates:
    - There are this many initial "ranges" of data in the cluster. These are all internal "system" ranges since you haven't added any table data yet.
    - Each range has been replicated 3 times (according to the CockroachDB default).
    - For each range, each replica is stored on different nodes.

## Step 8. Scale the cluster

Adding more nodes to your cluster is even easier than starting the cluster. Just like before, you use the `cockroach start` command with unique `--store`, `--listen-addr`, and `--http-addr` flags for each new node. But this time, you do not have to follow-up with the `cockroach init` command or any other commands.

1. Start the fourth node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
    --insecure \
    --store=node4 \
    --listen-addr=localhost:26260 \
    --http-addr=localhost:8083 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~~

2. Start the fifth node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
    --insecure \
    --store=node5 \
    --listen-addr=localhost:26261 \
    --http-addr=localhost:8084 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    As soon as you run these commands, the nodes join the cluster. There's no need to run the `cockroach init` command or any other commands.

## Step 9. Watch data rebalance across all 5 nodes

Go back to the **Live Nodes** list in the Admin UI and watch how the **Replicas** are automatically rebalanced to utilize the additional capacity of the new nodes:

<img src="{{ 'images/v20.1/training-2.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

Another way to observe this is to click **Metrics** in the upper left and scroll down to the **Replicas per Node** graph:

<img src="{{ 'images/v20.1/training-3.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## What's next?

[Fault Tolerance and Automated Repair](fault-tolerance-and-automated-repair.html)
