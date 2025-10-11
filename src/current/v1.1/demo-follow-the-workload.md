---
title: Follow-the-Workload
summary: CockroachDB can dynamically optimize read latency for the location from which most of the workload is originating.
toc: true
---

"Follow-the-workload" refers to CockroachDB's ability to dynamically optimize read latency for the location from which most of the workload is originating. This page explains how "follow-the-workload" works and walks you through a simple demonstration using a local cluster.


## Overview

### Basic Terms

To understand how "follow-the-workload" works, it's important to start with some basic terms:

Term | Description
-----|------------
**Range** | CockroachDB stores all user data and almost all system data in a giant sorted map of key-value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
**Range Replica** | CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
**Range Lease** | For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.

### How It Works

"Follow-the-workload" is based on the way **range leases** handle read requests. Read requests bypass the Raft consensus protocol, accessing the range replica that holds the range lease (the leaseholder) and sending the results to the client without needing to coordinate with any of the other range replicas. Bypassing Raft, and the network round trips involved, is possible because the leaseholder is guaranteed to be up-to-date due to the fact that all write requests also go to the leaseholder.

This increases the speed of reads, but it doesn't guarantee that the range lease will be anywhere close to the origin of requests. If requests are coming from the US West, for example, and the relevant range lease is on a node in the US East, the requests would likely enter a gateway node in the US West and then get routed to the node with the range lease in the US East.

However, you can cause the cluster to actively move range leases for even better read performance by starting each node with the [`--locality`](start-a-node.html#locality) flag. With this flag specified, the cluster knows about the location of each node, so when there's high latency between nodes, the cluster will move active range leases to a node closer to the origin of the majority of the workload. This is especially helpful for applications with workloads that move around throughout the day (e.g., most of the traffic is in the US East in the morning and in the US West in the evening).

{{site.data.alerts.callout_success}}To enable "follow-the-workload", you just need to start each node of the cluster with the <code>--locality</code> flag, as shown in the tutorial below. No additional user action is required.{{site.data.alerts.end}}

### Example

In this example, let's imagine that lots of read requests are going to node 1, and that the requests are for data in range 3. Because range 3's lease is on node 3, the requests are routed to node 3, which returns the results to node 1. Node 1 then responds to the clients.

<img src="{{ 'images/v1.1/follow-workload-1.png' | relative_url }}" alt="Follow-the-workload example" style="max-width:100%" />

However, if the nodes were started with the [`--locality`](start-a-node.html#locality) flag, after a short while, the cluster would move range 3's lease to node 1, which is closer to the origin of the workload, thus reducing the network round trips and increasing the speed of reads.

<img src="{{ 'images/v1.1/follow-workload-2.png' | relative_url }}" alt="Follow-the-workload example" style="max-width:100%" />

## Tutorial

### Step 1. Install prerequisites

In this tutorial, you'll use CockroachDB, the `comcast` network tool to simulate network latency on your local workstation, and the `kv` load generator to simulate client workloads. Before you begin, make sure these applications are installed:

- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install [Go](https://golang.org/doc/install) version 1.9 or higher. If you're on a Mac and using Homebrew, use `brew install go`. You can check your local version by running `go version`.
- Install the [`comcast`](https://github.com/tylertreat/comcast) network simulation tool: `go get github.com/tylertreat/comcast`
- Install the [`kv`](https://github.com/cockroachdb/loadgen/tree/master/kv) load generator: `go get github.com/cockroachdb/loadgen/kv`

Also, to keep track of the data files and logs for your cluster, you may want to create a new directory (e.g., `mkdir follow-workload`) and start all your nodes in that directory.

### Step 2. Start simulating network latency

"Follow-the-workload" only kicks in when there's high latency between the nodes of the CockroachDB cluster. In this tutorial, you'll run 3 nodes on your local workstation, with each node pretending to be in a different region of the US. To simulate latency between the nodes, use the `comcast` tool that you installed earlier.

In a new terminal, start `comcast` as follows:

{% include_cached copy-clipboard.html %}
~~~ shell
$ comcast --device lo0 --latency 100
~~~

For the `--device` flag, use `lo0` if you're on Mac or `lo` if you're on Linux. If neither works, run the `ifconfig` command and find the interface responsible for `127.0.0.1` in the output.

This command causes a 100 millisecond delay for all requests on the loopback interface of your local workstation. It will only affect connections from the machine to itself, not to/from the Internet.

### Step 3. Start the cluster

Use the [`cockroach start`](start-a-node.html) command to start 3 nodes on your local workstation, using the [`--locality`](start-a-node.html#locality) flag to pretend that each node is in a different region of the US.

1. In a new terminal, start a node in the "US West":

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us-west \
    --host=localhost \
    --store=follow1 \
    --port=26257 \
    --http-port=8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

2. In a new terminal, start a node in the "US Midwest":

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us-midwest \
    --host=localhost \
    --store=follow2 \
    --port=26258 \
    --http-port=8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

3. In a new terminal, start a node in the "US East":

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us-east \
    --host=localhost \
    --store=follow3 \
    --port=26259 \
    --http-port=8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

### Step 4. Initialize the cluster

In a new terminal, use the [`cockroach init`](initialize-a-cluster.html) command to perform a one-time initialization of the cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach init \
--insecure \
--host=localhost \
--port=26257
~~~

### Step 5. Simulate traffic in the US East

Now that the cluster is live, use the `kv` load generator that you installed earlier to simulate multiple client connections to the node in the "US East".

1. In a new terminal, start `kv`, pointing it at port `26259`, which is the port of the node with the `us-east` locality:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kv -duration 1m -concurrency 32 -read-percent 100 -max-rate 100 'postgresql://root@localhost:26259?sslmode=disable'
    ~~~

    This command initiates 32 concurrent read-only workloads for 1 minute but limits the entire `kv` process to 100 operations per second (since you're running everything on a single machine). While `kv` is running, it will print some stats to the terminal:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p95(ms)__p99(ms)_pMax(ms)
          1s        0           23.0           23.0    838.9    838.9    838.9
          2s        0          111.0           66.9    805.3    838.9    838.9
          3s        0          100.0           78.0    209.7    209.7    209.7
          4s        0           99.9           83.5    209.7    209.7    209.7
          5s        0          100.0           86.8    209.7    209.7    209.7
    ...
    ~~~

    {{site.data.alerts.callout_info}}The latency numbers printed are over 200 milliseconds because the 100 millisecond delay in each direction (200ms round-trip) caused by the <code>comcast</code> tool also applies to the traffic going from the <code>kv</code> process to the <code>cockroach</code> process. If you were to set up more advanced rules that excluded the <code>kv</code> process's traffic or to run this on a real network with real network delay, these numbers would be down in the single-digit milliseconds.{{site.data.alerts.end}}

2. Let the load generator run to completion.

### Step 6. Check the location of the range lease

The load generator created a `kv` table that maps to an underlying key-value range. Verify that the range's lease moved to the node in the "US East" as follows.

1. In a new terminal, run the [`cockroach node status`](view-node-details.html) command against any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --insecure --port=26257
    ~~~

    ~~~
    +----+-----------------+--------+---------------------+---------------------+
    | id |     address     | build  |     updated_at      |     started_at      |
    +----+-----------------+--------+---------------------+---------------------+
    |  1 | localhost:26257 | v1.1.2 | 2017-11-18 05:22:34 | 2017-11-18 05:21:24 |
    |  2 | localhost:26258 | v1.1.2 | 2017-11-18 05:22:36 | 2017-11-18 05:21:26 |
    |  3 | localhost:26259 | v1.1.2 | 2017-11-18 05:22:36 | 2017-11-18 05:21:26 |
    +----+-----------------+--------+---------------------+---------------------+
    (3 rows)
    ~~~

2. In the response, note the ID of the node running on port `26259`.

3. In the same terminal, connect the [built-in SQL shell](use-the-built-in-sql-client.html) to any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --port=26257
    ~~~

4. Check where the range lease is for the `kv` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW TESTING_RANGES FROM TABLE test.kv;
    ~~~

    ~~~
    +-----------+---------+----------+--------------+
    | Start Key | End Key | Replicas | Lease Holder |
    +-----------+---------+----------+--------------+
    | NULL      | NULL    | {1,2,3}  |            3 |
    +-----------+---------+----------+--------------+
    (1 row)
    ~~~

    `Replicas` and `Lease Holder` indicate the node IDs. As you can see, the lease for the range holding the `kv` table's data is on node 3, which is the same ID as the node on port `26259`.

### Step 7. Simulate traffic in the US West

1. In the same terminal, start `kv`, pointing it at port `26257`, which is the port of the node with the `us-west` locality:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kv -duration 7m -concurrency 32 -read-percent 100 -max-rate 100 'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    This time, the command runs for a little longer, 7 minutes instead of 1 minute. This is necessary since the system will still "remember" the earlier requests to the other locality.

2. Let the load generator run to completion.

### Step 8. Check the location of the range lease

Verify that the range's lease moved to the node in the "US West" as follows.

1. In a same terminal, run the [`cockroach node status`](view-node-details.html) command against any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --insecure --port=26257
    ~~~

    ~~~
    +----+-----------------+--------+---------------------+---------------------+
    | id |     address     | build  |     updated_at      |     started_at      |
    +----+-----------------+--------+---------------------+---------------------+
    |  1 | localhost:26257 | v1.1.2 | 2017-11-18 05:06:21 | 2017-11-18 04:56:41 |
    |  2 | localhost:26258 | v1.1.2 | 2017-11-18 05:06:21 | 2017-11-18 04:56:41 |
    |  3 | localhost:26259 | v1.1.2 | 2017-11-18 05:06:22 | 2017-11-18 04:56:42 |
    +----+-----------------+--------+---------------------+---------------------+
    (3 rows)
    ~~~

2. In the response, note the ID of the node running on port `26257`.

3. Connect the [built-in SQL shell](use-the-built-in-sql-client.html) to any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --port=26257
    ~~~

4. Check where the range lease is for the `kv` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW TESTING_RANGES FROM TABLE test.kv;
    ~~~

    ~~~
    +-----------+---------+----------+--------------+
    | Start Key | End Key | Replicas | Lease Holder |
    +-----------+---------+----------+--------------+
    | NULL      | NULL    | {1,2,3}  |            1 |
    +-----------+---------+----------+--------------+
    (1 row)
    ~~~

    As you can see, the lease for the range holding the `kv` table's data is now on node 1, which is the same ID as the node on port `26257`.

### Step 9. Stop the cluster

Once you're done with your cluster, press **CTRL-C** in each node's terminal.

{{site.data.alerts.callout_success}}For the last node, the shutdown process will take longer (about a minute) and will eventually force stop the node. This is because, with only 1 node still online, a majority of replicas are no longer available (2 of 3), and so the cluster is not operational. To speed up the process, press <strong>CTRL-C</strong> a second time.{{site.data.alerts.end}}

If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

{% include_cached copy-clipboard.html %}
~~~ shell
$ rm -rf follow1 follow2 follow3
~~~

### Step 10. Stop simulating network latency

Once you're done with this tutorial, you will not want a 100 millisecond delay for all requests on your local workstation, so stop the `comcast` tool:

{% include_cached copy-clipboard.html %}
~~~ shell
$ comcast --device lo0 --stop
~~~

## What's Next?

Use a local cluster to explore these other core CockroachDB benefits

- [Data Replication](demo-data-replication.html)
- [Fault Tolerance & Recovery](demo-fault-tolerance-and-recovery.html)
- [Automatic Rebalancing](demo-automatic-rebalancing.html)
- [Cross-Cloud Migration](demo-automatic-cloud-migration.html)
- [Orchestration](orchestrate-a-local-cluster-with-kubernetes-insecure.html)
