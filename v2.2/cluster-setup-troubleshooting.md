---
title: Troubleshoot Cluster Setup
summary: Learn how to troubleshoot issues with starting CockroachDB clusters
toc: true
---

If you're having trouble starting or scaling your cluster, this page will help you troubleshoot the issue.

To use this guide, it's important to understand some of CockroachDB's terminology:

  - A **Cluster** acts as a single logical database, but is actually made up of many cooperating nodes.
  - **Nodes** are single instances of the `cockroach` binary running on a machine. It's possible (though atypical) to have multiple nodes running on a single machine.

## Cannot run a single-node CockroachDB cluster

Try running:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --logtostderr
~~~

If the process exits prematurely, check for the following:

### An existing storage directory

When starting a node, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit cockroach, and then tried to start another cluster using the same directory. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot start.

**Solution:** Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

-   Choose a different directory to store the CockroachDB data:  
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --store=<new directory> --insecure
    ~~~
-   Remove the existing directory and start the node again:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -r cockroach-data/
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --insecure --logtostderr
    ~~~

### Toolchain incompatibility

The components of the toolchain might have some incompatibilities that need to be resolved. For example, a few months ago, there was an incompatibility between Xcode 8.3 and Go 1.8 that caused any Go binaries created with that toolchain combination to crash immediately.

### Incompatible CPU

If the cockroach process had exit status `132 (SIGILL)`, it attempted to use an instruction that is not supported by your CPU. Non-release builds of CockroachDB may not be able to run on older hardware platforms than the one used to build them. Release builds should run on any x86-64 CPU.

### Default ports already in use

Other services running on port 26257 or 8080 (CockroachDB's default `--listen-addr` port and `--http-addr` port respectively). You can either stop those services or start your node with different ports, specified in the `[--listen-addr` and `--http-addr](https://www.cockroachlabs.com/docs/dev/start-a-node.html#networking)` flags.

  If you change the port, you will need to include the `--port=<specified port>` flag in each subsequent cockroach command or change the `COCKROACH_PORT` environment variable.

### Networking issues

Networking issues might prevent the node from communicating with itself on its hostname. You can control the hostname CockroachDB uses with the `[--listen-addr` flag](https://www.cockroachlabs.com/docs/dev/start-a-node.html#networking).

  If you change the host, you will need to include `--host=<specified host>` in each subsequent cockroach command.

### CockroachDB process hangs when trying to start a node in the background

See [https://www.cockroachlabs.com/docs/dev/operational-faqs.html#why-is-my-process-hanging-when-i-try-to-start-it-in-the-background](https://www.cockroachlabs.com/docs/dev/operational-faqs.html#why-is-my-process-hanging-when-i-try-to-start-it-in-the-background)

## Cannot run SQL statements using built-in SQL client

If the Cockroach node appeared to [start ok](https://www.cockroachlabs.com/docs/start-a-local-cluster.html), in a separate terminal run:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e "show databases"
~~~

You should see a list of the built-in databases:

~~~
+--------------------+
| Database           |
+--------------------+
| crdb_internal      |
| information_schema |
| pg_catalog         |
| system             |
+--------------------+
(4 rows)
~~~

If you’re not seeing the output above, check for the following:

-   `connection refused` error, which indicates you have not included some flag that you used to start the node. We have additional troubleshooting steps for this error [here](https://www.cockroachlabs.com/docs/dev/common-errors.html#connection-refused).
-   The node crashed. To ascertain if the node crashed, run `ps` to look for the `cockroach` process. If you cannot locate the cockroach process (i.e., it crashed), [file an issue](https://www.cockroachlabs.com/docs/dev/file-an-issue.html).

## Cannot run a multi-node CockroachDB cluster on the same machine

If you are trying to run all nodes on the same machine, you might get the following errors:

### Store directory already exists

~~~
ERROR: could not cleanup temporary directories from record file: could not lock temporary directory /Users/amruta/go/src/github.com/cockroachdb/cockroach/cockroach-data/cockroach-temp301343769, may still be in use: IO error: While lock file: /Users/amruta/go/src/github.com/cockroachdb/cockroach/cockroach-data/cockroach-temp301343769/TEMP_DIR.LOCK: Resource temporarily unavailable
~~~

**Explanation:** When starting a new node on the same machine, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server and then tried to start another cluster using the same directory.

**Solution:** Choose a different directory to store the CockroachDB data.

### Port already in use

~~~
ERROR: cockroach server exited with error: consider changing the port via --listen-addr: listen tcp 127.0.0.1:26257: bind: address already in use
~~~

**Solution:** Change the `--port`, `--http-port` flags for each new node that you want to run on the same machine.

## Cannot join a node to an existing CockroachDB cluster

### Store directory already exists

When joining a node to a cluster, you might receive one of the following errors:

~~~
no resolvers found; use --join to specify a connected node

node belongs to cluster {"cluster hash"} but is attempting to connect to a gossip network for cluster {"another cluster hash"}
~~~

**Explanation:** When starting a node, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit cockroach, and then tried to join another cluster. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot join it.  

**Solution:** Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

-   Choose a different directory to store the CockroachDB data:  
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --store=<new directory> --join=<cluster host> <other flags>
    ~~~
-   Remove the existing directory and start a node joining the cluster again:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -r cockroach-data/
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --join=<cluster host>:26257 <other flags>  
    ~~~

### Incorrect `--join` address

If you try to add another node to the cluster, but the `--join` address is not pointing at any of the existing nodes, then the process will never complete, and you'll see a continuous stream of warnings like this:

~~~
W180817 17:01:56.506968 886 vendor/google.golang.org/grpc/clientconn.go:942 Failed to dial localhost:20000: grpc: the connection is closing; please retry.  
W180817 17:01:56.510430 914 vendor/google.golang.org/grpc/clientconn.go:1293 grpc: addrConn.createTransport failed to connect to {localhost:20000 0 <nil>}. Err :connection error: desc = "transport: Error while dialing dial tcp [::1]:20000: connect: connection refused". Reconnecting…
~~~

**Explanation:** These warnings tell you that the node cannot establish a connection with the address specified in the `--join` flag. Without a connection to the cluster, the node cannot join.

**Solution:** To successfully join the node to the cluster, start the node again, but this time include a correct `--join` address.

### Missing `--join` address

If you try to add another node to the cluster, but the `--join` address is missing entirely, which causes the new node to start its own separate cluster.

The startup process succeeds but, because a `--join` address wasn't specified, the node initializes itself as a new cluster instead of joining the existing cluster. You can see this in the `status` field printed to `stdout`:

~~~
CockroachDB node starting at 2018-02-08 16:30:26.690638 +0000 UTC (took 0.2s)  
build: CCL v2.2.0-alpha.20181217 @ 2018/01/08 17:30:06 (go1.8.3)  
admin: https://localhost:8085  
sql: postgresql://root@localhost:26262?sslcert=certs%2Fclient.root.crt&sslkey=certs%2Fclient.root.key&sslmode=verify-full&sslrootcert=certs%2Fca.crt  
logs: /Users/jesseseldess/cockroachdb-training/cockroach-v2.2.0-alpha.20181217.darwin-10.9-amd64/node6/logs  
store[0]: path=/Users/jesseseldess/cockroachdb-training/cockroach-v2.2.0-alpha.20181217.darwin-10.9-amd64/node6  
status: initialized new cluster  
clusterID: cfcd80ee-9005-4975-9ae9-9c36d9aaa57e  
nodeID: 1
~~~

Now if you try to start the node again, but this time include a correct `--join` address, the startup process fails because the cluster notices that the node's cluster ID does not match the cluster ID of the nodes it is trying to join to:

~~~
W180815 17:21:00.316845 237 gossip/client.go:123 [n1] failed to start gossip client to localhost:26258: initial connection heartbeat failed: rpc error: code = Unknown desc = client cluster ID "9a6ed934-50e8-472a-9d55-c6ecf9130984" doesn't match server cluster ID "ab6960bb-bb61-4e6f-9190-992f219102c6"
~~~

**Solution:** To successfully join the node to the cluster, you need to remove the node's data directory, which is where its incorrect cluster ID is stored, and start the node again.

## Client connection issues

If a client cannot connect to the cluster, check basic network connectivity (ping), port connectivity (telnet), and certificate validity.

### Networking issues

Most networking-related issues are caused by one of two issues:

-   Firewall rules, which require your network administrator to investigate
-   Inaccessible hostnames on your nodes, which can be controlled with the `--listen-addr` and `--advertise-addr` flags on [`cockroach start`](https://www.cockroachlabs.com/docs/dev/start-a-node.html#networking)


**Solution:**

To check your networking setup:

1.  Use `ping`. Every machine you are using as a Cockroach node should be able to ping every other machine, using the hostnames or IP addresses used in the `--join` flags (and the `--advertise-host` flag if you are using it).

2.  If the machines are all pingable, check if you can connect to the appropriate ports. With your Cockroach nodes still running, log in to each node and use `telnet` or` nc` to verify machine to machine connectivity on the desired port. For instance, if you are running Cockroach on the default port of 26257, run either:
  -   telnet <other-machine> 26257
  -   nc <other-machine> 26257

  Both telnet and nc will exit immediately if a connection cannot be established. If you are running in a firewalled environment, the firewall might be blocking traffic to the desired ports even though it is letting ping packets through.

To efficiently troubleshoot the issue, it's important to understand where and why it's occurring. We recommend checking the following network-related issues:

-   By default, CockroachDB advertises itself to other nodes using its hostname. If your environment doesn't support DNS or the hostname is not resolvable, your nodes cannot connect to one another. In these cases, you can:
  -   Change the hostname each node uses to advertises itself with `--advertise-addr`
  -   Set `--listen-addr=<node's IP address>` if the IP is a valid interface on the machine
-   Every node in the cluster should be able to ping each other node on the hostnames or IP addresses you use in the `--join`, `--listen-addr`, or `--advertise-addr` flags.
-   Every node should be able to connect to other nodes on the port you're using for CockroachDB (26257 by default) through telnet or nc:
  -   telnet <other node host> 26257
  -   nc <other node host> 26257

Again, firewalls or hostname issues can cause any of these steps to fail.

### Network partition

If the Admin UI lists live nodes in the **Dead Nodes** table, then you might have a network partition.

**Explanation:** <What is a network partition?>

The effect of a network partition depends on which nodes are partitioned and where the ranges are located. It depends on a large extent on whether localities have been defined.

A partition is a lot like an outage, where all nodes in a smaller partition are down. If you don’t provide localities, a partition that cuts off at least (n-1)/2 nodes will cause data unavailability.

**Solution:**

To identify a network partition:

1.  Access the Admin UI.
2.  Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page.
3.  On the Advanced Debugging page, click **Network Latency**.
4.  In the **Latencies** table, check if any cells are marked as “X”. If yes, it indicates that the nodes cannot communicate with those nodes, and might indicate a network partition.

<Is there another solution that involves setting localities?>

## CockroachDB authentication issues

### Missing certificate

If  you try to add a node to a secure cluster without providing the node's security certificate, you will get the following error:

~~~
problem with CA certificate: not found  
*  
* ERROR: cannot load certificates.  
* Check your certificate settings, set --certs-dir, or use --insecure for insecure clusters.  
*  
* problem with CA certificate: not found  
*  
Failed running "start"
~~~

**Explanation:** The error tells you that because the cluster is secure, it requires the new node to provide its security certificate in order to join.

**Solution:** To successfully join the node to the cluster, start the node again, but this time include the `--certs-dir` flag

### Certification expiration

If you’re running a secure cluster, be sure to monitor your certificate expiration. If one of the inter-node certificates expires, nodes will no longer be able to communicate which can look like a network partition.

To check the certificate expiration date:

1. Access the Admin UI.
2. Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page.
3. Scroll down to the **Even More Advanced Debugging** section. Click **All Nodes**. The **Node Diagnostics** page appears. Click the certificates for each node and check the expiration date for each certificate in the Valid Until field.

### Client password not set

While connecting to a secure cluster as a user, CockroachDB first checks if the client certificate exists in the `cert` directory. If the client certificate doesn’t exist, it prompts for a password. If password is not set and you press Enter, the connection attempt fails, and the following error is printed to stderr:

~~~
Error: pq: invalid password  
Failed running "sql"
~~~

**Solution:** To successfully connect to the cluster, you must first either generate a client certificate or create a password for the user.

## Clock sync issues

### Node clocks are not properly synchronized

[https://www.cockroachlabs.com/docs/dev/operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized](https://www.cockroachlabs.com/docs/dev/operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized)

How can I tell how well node clocks are synchronized?

[https://www.cockroachlabs.com/docs/dev/operational-faqs.html#how-can-i-tell-how-well-node-clocks-are-synchronized](https://www.cockroachlabs.com/docs/dev/operational-faqs.html#how-can-i-tell-how-well-node-clocks-are-synchronized)

## Capacity planning issues

Possible issues:

-   Running CPU at close to 100% utilization with high run queue will result in poor performance.
-   Running RAM at close to 100% utilization triggers Linux OOM and / or swapping that will result in poor performance of stability issues.
-   Running storage at 100% capacity causes writes to fail causing various processes to stop.
-   Running storage at 100% utilization read/write will causes poor service time.
-   Running network at 100% utilization causes response between databases and client to be poor.

**Solution:** Access the Admin UI and navigate to **Metrics > Hardware** dashboard to monitor the following metrics:

First, check adequate capacity was available for the incident for the following components.

Type | Time Series | What to look for
--------|--------|--------|
File system storage capacity | ?? | File system at 99%
Storage IOPS / bandwidth capacity | Disk IOPS in Progress | Consistent non-zero values
RAM capacity | Memory Usage | Any non-zero value
CPU capacity | CPU Percent | Consistent non-zero values
Network capacity | Network Bytes Received<br/>Network Bytes Sent | Any non-zero value

Check Near Out of Capacity Conditions:

Type | Time Series | What to look for
--------|--------|--------|
Storage bandwidth capacity | ?? | Consistently more than 80% or unusually high values
Storage IOPS capacity | Disk IOPS in Progress | Consistently more than 1ms or unusually high values
RAM capacity | Memory Usage | Consistently more than 80%
CPU capacity | CPU Percent | Consistently less than 20% in idle (ie:80% busy)
Network capacity | Network Bytes Received<br/>Network Bytes Sent | Consistently more than 50% capacity for both

## Memory issues

### Disks filling up

Like any database system, if you run out of disk space the system will no longer be able to accept writes. Additionally, a Cockroach node needs a small amount of disk space (a few GBs to be safe) to perform basic maintenance functionality. For more information about this issue, see:

- [https://www.cockroachlabs.com/docs/dev/operational-faqs.html#why-is-memory-usage-increasing-despite-lack-of-traffic](https://www.cockroachlabs.com/docs/dev/operational-faqs.html#why-is-memory-usage-increasing-despite-lack-of-traffic)
-   [https://www.cockroachlabs.com/docs/dev/operational-faqs.html#why-is-disk-usage-increasing-despite-lack-of-writes](https://www.cockroachlabs.com/docs/dev/operational-faqs.html#why-is-disk-usage-increasing-despite-lack-of-writes)
-   [https://www.cockroachlabs.com/docs/dev/operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data](https://www.cockroachlabs.com/docs/dev/operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data)

### Suspected memory leak

A CockroachDB node will grow to consume all of the memory allocated for its `cache`. The default size for the cache is ¼ of physical memory which can be substantial depending on your machine configuration. This growth will occur even if your cluster is otherwise idle due to the internal metrics that a Cockroach cluster tracks. See the `--cache` flag in `cockroach start`.

Cockroach memory usage has 3 components:

-   Go allocated memory: Memory allocated by the Go runtime to support query processing and various caches maintained in Go by CockroachDB. These caches are generally small in comparison to the RocksDB cache size. If Go allocated memory is larger than a few hundred megabytes, something concerning is going on.
-   CGo allocated memory: Memory allocated by the C/C++ libraries linked into Cockroach and primarily concerns RocksDB and the RocksDB block cache. This is the “cache” mentioned in the note above. The size of CGo allocated memory is usually very close to the configured cache size.
-   Overhead (the process resident set size minus Go/CGo allocated memory)

If Go allocated memory is larger than a few hundred megabytes, you might have encountered a memory leak. Go comes with a built-in heap profiler which is already enabled on your Cockroach process. See this [excellent blog post](https://blog.golang.org/profiling-go-programs) on profiling Go programs.

**Solution:** To determine Go/CGo allocated memory:

1. Access the Admin UI.

2. Navigate to **Metrics > Runtime** dashboard, and check the **Memory Usage** graph.

3. On hovering over the graph, the values for the following metrics are displayed:

  Metric | Description
  --------|----
  RSS | Total memory in use by CockroachDB.
  Go Allocated | Memory allocated by the Go layer.
  Go Total | Total memory managed by the Go layer.
  CGo Allocated | Memory allocated by the C layer.
  CGo Total | Total memory managed by the C layer.

  -   If CGo allocated memory is larger than the configured `cache` size, file an issue.
  -   If the resident set size (RSS) minus Go/CGo total memory is larger than 100 megabytes, file an issue.

## Decommissioning issues

### Decommissioning process hangs indefinitely

**Explanation:** Before decommissioning a node, you need to make sure other nodes are available to take over the range replicas from the node. If no other nodes are available, the decommission process will hang indefinitely.

**Solution:** Confirm that there are enough nodes to take over the replicas from the node you want to remove.

### Decommissioned nodes displayed in UI forever

By design, decommissioned nodes are displayed in the Admin UI forever. We retain the list of decommissioned nodes for the following reasons:

-   Decommissioning is not entirely free, so showing those decommissioned nodes in the UI reminds you of the baggage your cluster will have to carry around forever.
-   It also explains to future administrations why your node IDs have gaps (e.g., why the nodes are numbered n1, n2, and n8).

You can follow the discussion here: [https://github.com/cockroachdb/cockroach/issues/24636](https://github.com/cockroachdb/cockroach/issues/24636)

## Replication issues

### Admin UI shows under-replicated/unavailable ranges

An under-replicated range is one in which the number of “up to date” replicas is below the desired replication. An unavailable range is one in which the number of “up to date” replicas is below quorum. When a Cockroach node dies (or is partitioned) the under-replicated range count will briefly spike while the system recovers.

**Explanation:** Cockroach uses consensus replication and requires a quorum of the replicas to be available in order to allow both writes and reads to the range. The number of failures that can be tolerated is equal to (Replication factor - 1)/2. Thus CockroachDB requires (n-1)/2 nodes to achieve quorum. is For example, with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on.

-   Under-replicated Ranges: When a cluster is first initialized, the few default starting ranges will only have a single replica, but as soon as other nodes are available, they will replicate to them until they've reached their desired replication factor. If a range does not have enough replicas, the range is said to be "under-replicated".

-   Unavailable Ranges: If a majority of a range's replicas are on nodes that are unavailable, then the entire range is unavailable and will be unable to process queries.

**Solution:**

To identify under-replicated/unavailable ranges:

1.  Access the Admin UI.

2.  On the **Cluster Overview** page, check the **Replication Status**. If the **Under-replicated ranges** or **Unavailable ranges** count is non-zero, then you have under-replicated or unavailable ranges in your cluster.

**Add nodes to the cluster:**

On the Admin UI’s Cluster Overview page, check if any nodes are down. If the number of nodes down is less than (n-1)/2, then that is most probably the cause of the under-replicated/unavailable ranges. Add nodes to the cluster such that the cluster has the required number of nodes to replicate ranges properly.

If you still under-replicated/unavailable ranges on the Cluster Overview page, investigate further:

1.  On the Admin UI, click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page.
2.  On the Advanced Debugging page, click **Problem Ranges**.
3.  In the **Connections** table, identify the node with the under-replicated/unavailable ranges and click the node ID in the Node column.
4.  To view the **Range Report** for a range, click on the range number in the **Under-replicated (or slow)** table or **Unavailable** table.
5. On the Range Report page, scroll down to the **Simulated Allocator Output** section. The table contains an error message which explains the reason for the under-replicated range. Follow the guidance in the message to resolve the issue. If you need help understanding the error or the guidance, file an issue.

## Something else?

If we do not have a solution here, you can try using our other [support resources](support-resources.html), including:

- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on Gitter](https://gitter.im/cockroachdb/cockroach) (To open Gitter without leaving these docs, click **Help** in the lower-right corner of any page.)
