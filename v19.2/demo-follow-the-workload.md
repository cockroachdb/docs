---
title: Follow-the-Workload
summary: CockroachDB can dynamically optimize read latency for the location from which most of the workload is originating.
toc: true
---

"Follow-the-workload" refers to CockroachDB's ability to dynamically optimize read latency for the location from which most of the workload is originating. This page explains how "follow-the-workload" works and walks you through a simple demonstration using a local cluster.

{{site.data.alerts.callout_info}}
In practice, follow-the-workload is most useful when a CockroachDB cluster is running across multiple regions, with high latency between them, but other patterns are often preferable. For more details, see [Multi-Region Topology Patterns](topology-patterns.html#multi-region-patterns).  
{{site.data.alerts.end}}

## Before you begin

### Basic concepts

To understand how "follow-the-workload" works, it's important to start with some basic concepts:

Concept | Description
--------|------------
**Range** | CockroachDB stores all user data (tables, indexes, etc.) and almost all system data in a giant sorted map of key-value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
**Replica** | CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
**Leaseholder** | For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.<br><br>Unlike writes, read requests access the leaseholder and send the results to the client without needing to coordinate with any of the other range replicas. This reduces the network round trips involved and is possible because the leaseholder is guaranteed to be up-to-date due to the fact that all write requests also go to the leaseholder.

### How it works

"Follow-the-workload" is based on the way **range leases** handle read requests. Read requests bypass the Raft consensus protocol, accessing the range replica that holds the range lease (the leaseholder) and sending the results to the client without needing to coordinate with any of the other range replicas. Bypassing Raft, and the network round trips involved, is possible because the leaseholder is guaranteed to be up-to-date due to the fact that all write requests also go to the leaseholder.

This increases the speed of reads, but it doesn't guarantee that the range lease will be anywhere close to the origin of requests. If requests are coming from the US West, for example, and the relevant range lease is on a node in the US East, the requests would likely enter a gateway node in the US West and then get routed to the node with the range lease in the US East.

However, you can cause the cluster to actively move range leases for even better read performance by starting each node with the [`--locality`](cockroach-start.html#locality) flag. With this flag specified, the cluster knows about the location of each node, so when there's high latency between nodes, the cluster will move active range leases to a node closer to the origin of the majority of the workload. This is especially helpful for applications with workloads that move around throughout the day (e.g., most of the traffic is in the US East in the morning and in the US West in the evening).

{{site.data.alerts.callout_success}}
To enable "follow-the-workload", you just need to start each node of the cluster with the `--locality` flag, as shown in the tutorial below. No additional user action is required.
{{site.data.alerts.end}}

### Example

In this example, let's imagine that lots of read requests are going to node 1, and that the requests are for data in range 3. Because range 3's lease is on node 3, the requests are routed to node 3, which returns the results to node 1. Node 1 then responds to the clients.

<img src="{{ 'images/v19.2/follow-workload-1.png' | relative_url }}" alt="Follow-the-workload example" style="max-width:100%" />

However, if the nodes were started with the [`--locality`](cockroach-start.html#locality) flag, after a short while, the cluster would move range 3's lease to node 1, which is closer to the origin of the workload, thus reducing the network round trips and increasing the speed of reads.

<img src="{{ 'images/v19.2/follow-workload-2.png' | relative_url }}" alt="Follow-the-workload example" style="max-width:100%" />

## Step 1. Install prerequisites

In this tutorial, you'll use CockroachDB, the `comcast` network tool to simulate network latency on your local workstation, and the `tpcc` workload built into CockroachDB to simulate client workloads. Before you begin, make sure these applications are installed:

- Install the latest version of [CockroachDB](install-cockroachdb.html).
- Install [Go](https://golang.org/doc/install) version 1.9 or higher. If you're on a Mac and using Homebrew, use `brew install go`. You can check your local version by running `go version`.
- Install the [`comcast`](https://github.com/tylertreat/comcast) network simulation tool: `go get github.com/tylertreat/comcast`

Also, to keep track of the data files and logs for your cluster, you may want to create a new directory (e.g., `mkdir follow-workload`) and start all your nodes in that directory.

## Step 2. Start the cluster

Use the [`cockroach start`](cockroach-start.html) command to start 3 nodes on your local workstation, using the [`--locality`](cockroach-start.html#locality) flag to pretend that each node is in a different region of the US.

1. Start a node in the "US West":

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us-west \
    --store=follow1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

2. Start a node in the "US Midwest":

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us-midwest \
    --store=follow2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

3. Start a node in the "US East":

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --locality=region=us-east \
    --store=follow3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

4. Use the [`cockroach init`](cockroach-init.html) command to perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init \
    --insecure \
    --host=localhost:26257
    ~~~

## Step 3. Simulate network latency

"Follow-the-workload" only kicks in when there's high latency between the nodes of the CockroachDB cluster. In this tutorial, you'll run 3 nodes on your local workstation, with each node pretending to be in a different region of the US. To simulate latency between the nodes, use the `comcast` tool that you installed earlier.

1. Start `comcast` as follows:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ comcast --device lo0 --latency 100
    ~~~

    For the `--device` flag, use `lo0` if you're on Mac or `lo` if you're on Linux. If neither works, run the `ifconfig` command and find the interface responsible for `127.0.0.1` in the output.

    This command causes a 100 millisecond delay for all requests on the loopback interface of your local workstation. It will only affect connections from the machine to itself, not to/from the Internet.

2. To verify the delay between nodes, check the **Network Latency** page of the Admin UI:

    <img src="{{ 'images/v19.2/follow-workload-network-latency.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

## Step 4. Simulate traffic in the US East

Now that the cluster is live, use CockroachDB's [built-in version the `tpcc` benchmark](cockroach-workload.html) to simulate multiple client connections to the node in the "US East".

1. Load the initial schema and data, pointing it at port `26259`, which is the port of the node with the `us-east` locality:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init tpcc \
    'postgresql://root@localhost:26259?sslmode=disable'
    ~~~

2. Let the workload run to completion.

## Step 5. Check the location of the range lease

The load generator created a `tpcc` database with several tables that map to underlying key-value ranges. Verify that the range lease for the `customer` table moved to the node in the "US East" as follows.

1. Run the [`cockroach node status`](cockroach-node.html) command against any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach node status --insecure --host=localhost:26259
    ~~~

    ~~~
      id |     address     |   sql_address   |                  build                  |            started_at            |            updated_at            |     locality      | is_available | is_live
    +----+-----------------+-----------------+-----------------------------------------+----------------------------------+----------------------------------+-------------------+--------------+---------+
       1 | localhost:26257 | localhost:26257 | v19.2.0-alpha.20190606-2491-gfe735c9a97 | 2019-09-28 03:14:20.566372+00:00 | 2019-09-28 03:18:41.866604+00:00 | region=us-west    | true         | true
       2 | localhost:26259 | localhost:26259 | v19.2.0-alpha.20190606-2491-gfe735c9a97 | 2019-09-28 03:14:21.353188+00:00 | 2019-09-28 03:18:38.165272+00:00 | region=us-east    | true         | true
       3 | localhost:26258 | localhost:26258 | v19.2.0-alpha.20190606-2491-gfe735c9a97 | 2019-09-28 03:14:21.862969+00:00 | 2019-09-28 03:18:38.577831+00:00 | region=us-midwest | true         | true
    (3 rows)
    ~~~

2. In the response, note the ID of the node running on port `26259` (in this case, node 2).

3. Connect the [built-in SQL shell](cockroach-sql.html) to any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost:26259
    ~~~

4. Check where the range lease is for the `tpcc.customer` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW RANGES FROM TABLE tpcc.customer;
    ~~~

    ~~~
      start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                replica_localities
    +-----------+---------+----------+---------------+--------------+-----------------------+----------+---------------------------------------------------+
      NULL      | NULL    |       28 |     19.194141 |            2 | region=us-east        | {1,2,3}  | {region=us-west,region=us-east,region=us-midwest}
    (1 row)
    ~~~

    `lease_holder` and `replicas` indicate the node IDs. As you can see, the lease for the range holding the `customer` table's data is on node 2, which is the same ID as the node on port `26259`.

5. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 6. Simulate traffic in the US West

1. Run the [`cockroach workload run tpcc`](cockroach-workload.html) command to generate more load, this time pointing it at port `26257`, which is the port of the node with the `us-west` locality:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run tpcc \
    --duration=5m \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second.

2. Let the workload run to completion. This is necessary since the system will still "remember" the earlier requests to the other locality.

    {{site.data.alerts.callout_info}}
    The latency numbers printed by the workload will be over 200 milliseconds because the 100 millisecond delay in each direction (200ms round-trip) caused by the `comcast` tool also applies to the traffic going from the `tpcc` process to the `cockroach` process. If you were to set up more advanced rules that excluded the `tpcc` process's traffic or to run this on a real network with real network delay, these numbers would be down in the single-digit milliseconds.
    {{site.data.alerts.end}}

## Step 7. Check the location of the range lease

Verify that the range lease for the `customer` table moved to the node in the "US West" as follows.

1. Connect the [built-in SQL shell](cockroach-sql.html) to any node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost:26257
    ~~~

2. Check where the range lease is for the `tpcc.customer` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW RANGES FROM TABLE tpcc.customer;
    ~~~

    ~~~
      start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                replica_localities
    +-----------+---------+----------+---------------+--------------+-----------------------+----------+---------------------------------------------------+
      NULL      | NULL    |       28 |     19.194141 |            1 | region=us-west        | {1,2,3}  | {region=us-west,region=us-east,region=us-midwest}
    (1 row)
    ~~~

    As you can see, the lease for the range holding the `customer` table's data is now on node 1, which is the same ID as the node on port `26257`.

## Step 8. Clean up

1. Once you're done with this tutorial, you will not want a 100 millisecond delay for all requests on your local workstation, so stop the `comcast` tool:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ comcast --device lo0 --stop
    ~~~

2. Use the [`cockroach quit`](cockroach-quit.html) command to gracefully shut down each node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26257
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26258
    ~~~

    {{site.data.alerts.callout_info}}
    For the last node, the shutdown process will take longer (about a minute each) and will eventually force the node to stop. This is because, with only 1 of 3 nodes left, a majority of replicas are not available, and so the cluster is no longer operational.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26259
    ~~~

3. To restart the cluster at a later time, run the same `cockroach start` commands as earlier from the directory containing the nodes' data stores.  

    If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf follow1 follow2 follow3
    ~~~

## What's next?

Explore other core CockroachDB benefits and features:

{% include {{ page.version.version }}/misc/explore-benefits-see-also.md %}
