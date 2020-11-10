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
$ cockroach start-single-node --insecure --logtostderr
~~~

If the process exits prematurely, check for the following:

### An existing storage directory

When starting a node, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit `cockroach`, and then tried to start another cluster using the same directory. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot start.

**Solution:** Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

-   Choose a different directory to store the CockroachDB data:  
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --store=<new directory> --insecure
    ~~~
-   Remove the existing directory and start the node again:
    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -r cockroach-data/
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --insecure --logtostderr
    ~~~

### Toolchain incompatibility

The components of the toolchain might have some incompatibilities that need to be resolved. For example, a few months ago, there was an incompatibility between Xcode 8.3 and Go 1.8 that caused any Go binaries created with that toolchain combination to crash immediately.

### Incompatible CPU

If the `cockroach` process had exit status `132 (SIGILL)`, it attempted to use an instruction that is not supported by your CPU. Non-release builds of CockroachDB may not be able to run on older hardware platforms than the one used to build them. Release builds should run on any x86-64 CPU.

### Default ports already in use

Other services may be running on port 26257 or 8080 (CockroachDB's default `--listen-addr` port and `--http-addr` port respectively). You can either stop those services or start your node with different ports, specified in the [`--listen-addr` and `--http-addr` flags](cockroach-start.html#networking).

  If you change the port, you will need to include the `--port=<specified port>` flag in each subsequent cockroach command or change the `COCKROACH_PORT` environment variable.

### Single-node networking issues

Networking issues might prevent the node from communicating with itself on its hostname. You can control the hostname CockroachDB uses with the [`--listen-addr` flag](cockroach-start.html#networking).

  If you change the host, you will need to include `--host=<specified host>` in each subsequent cockroach command.

### CockroachDB process hangs when trying to start a node in the background

See [Why is my process hanging when I try to start it in the background?](operational-faqs.html#why-is-my-process-hanging-when-i-try-to-start-it-in-the-background)

## Cannot run SQL statements using built-in SQL client

If the CockroachDB node appeared to [start successfully](start-a-local-cluster.html), in a separate terminal run:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure -e "show databases"
~~~

You should see a list of the built-in databases:

~~~
  database_name
+---------------+
  defaultdb
  postgres
  system
(3 rows)
~~~

If you’re not seeing the output above, check for the following:

-   `connection refused` error, which indicates you have not included some flag that you used to start the node. We have additional troubleshooting steps for this error [here](common-errors.html#connection-refused).
-   The node crashed. To ascertain if the node crashed, run `ps | grep cockroach` to look for the `cockroach` process. If you cannot locate the `cockroach` process (i.e., it crashed), [file an issue](file-an-issue.html), including the logs from your node and any errors you received.

## Cannot run a multi-node CockroachDB cluster on the same machine

{{site.data.alerts.callout_info}}
Running multiple nodes on a single host is useful for testing out CockroachDB, but it's not recommended for production deployments. To run a physically distributed cluster in production, see [Manual Deployment](manual-deployment.html) or [Orchestrated Deployment](orchestration.html). Also be sure to review the [Production Checklist](recommended-production-settings.html).
{{site.data.alerts.end}}

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

**Explanation:** When starting a node, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit the `cockroach` process, and then tried to join another cluster. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot join it.  

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

## Client connection issues

If a client cannot connect to the cluster, check basic network connectivity (`ping`), port connectivity (`telnet`), and certificate validity.

### Networking issues

Most networking-related issues are caused by one of two issues:

-   Firewall rules, which require your network administrator to investigate
-   Inaccessible hostnames on your nodes, which can be controlled with the `--listen-addr` and `--advertise-addr` flags on [`cockroach start`](cockroach-start.html#networking)


**Solution:**

To check your networking setup:

1.  Use `ping`. Every machine you are using as a CockroachDB node should be able to ping every other machine, using the hostnames or IP addresses used in the `--join` flags (and the `--advertise-host` flag if you are using it).

2.  If the machines are all pingable, check if you can connect to the appropriate ports. With your CockroachDB nodes still running, log in to each node and use `telnet` or` nc` to verify machine to machine connectivity on the desired port. For instance, if you are running CockroachDB on the default port of 26257, run either:
  -   `telnet <other-machine> 26257`
  -   `nc <other-machine> 26257`

  Both `telnet` and `nc` will exit immediately if a connection cannot be established. If you are running in a firewalled environment, the firewall might be blocking traffic to the desired ports even though it is letting ping packets through.

To efficiently troubleshoot the issue, it's important to understand where and why it's occurring. We recommend checking the following network-related issues:

-   By default, CockroachDB advertises itself to other nodes using its hostname. If your environment doesn't support DNS or the hostname is not resolvable, your nodes cannot connect to one another. In these cases, you can:
  -   Change the hostname each node uses to advertises itself with `--advertise-addr`
  -   Set `--listen-addr=<node's IP address>` if the IP is a valid interface on the machine
-   Every node in the cluster should be able to ping each other node on the hostnames or IP addresses you use in the `--join`, `--listen-addr`, or `--advertise-addr` flags.
-   Every node should be able to connect to other nodes on the port you're using for CockroachDB (26257 by default) through `telnet` or `nc`:
  -   `telnet <other node host> 26257`
  -   `nc <other node host> 26257`

Again, firewalls or hostname issues can cause any of these steps to fail.

### Network partition

If the DB Console lists any dead nodes on the [**Cluster Overview** page](ui-cluster-overview-page.html), then you might have a network partition.

**Explanation:** A network partition prevents nodes from communicating with each other in one or both directions. This can be due to a configuration problem with the network, such as when allowlisted IP addresses or hostnames change after a node is torn down and rebuilt. In a symmetric partition, node communication is broken in both directions. In an asymmetric partition, node communication works in one direction but not the other.

The effect of a network partition depends on which nodes are partitioned, where the ranges are located, and to a large extent, whether [localities](cockroach-start.html#locality) are defined. If localities are not defined, a partition that cuts off at least (n-1)/2 nodes will cause data unavailability.

**Solution:**

To identify a network partition:

1.  Access the [Network Latency](ui-network-latency-page.html) page of the DB Console.
2.  In the **Latencies** table, check for nodes with [no connections](ui-network-latency-page.html#no-connections). This indicates that a node cannot communicate with another node, and might indicate a network partition.

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

1. [Access the DB Console](ui-overview.html#db-console-access).
2. Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page.
3. Scroll down to the **Even More Advanced Debugging** section. Click **All Nodes**. The **Node Diagnostics** page appears. Click the certificates for each node and check the expiration date for each certificate in the Valid Until field.

### Client password not set

While connecting to a secure cluster as a user, CockroachDB first checks if the client certificate exists in the `cert` directory. If the client certificate doesn’t exist, it prompts for a password. If password is not set and you press Enter, the connection attempt fails, and the following error is printed to `stderr`:

~~~
Error: pq: invalid password  
Failed running "sql"
~~~

**Solution:** To successfully connect to the cluster, you must first either generate a client certificate or create a password for the user.

## Clock sync issues

### Node clocks are not properly synchronized

See the following FAQs:

- [What happens when node clocks are not properly synchronized](operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized)
- [How can I tell how well node clocks are synchronized](operational-faqs.html#how-can-i-tell-how-well-node-clocks-are-synchronized)

## Capacity planning issues

Following are some of the possible issues you might have while planning capacity for your cluster:

-   Running CPU at close to 100% utilization with high run queue will result in poor performance.
-   Running RAM at close to 100% utilization triggers Linux OOM and/or swapping that will result in poor performance or stability issues.
-   Running storage at 100% capacity causes writes to fail, which in turn can cause various processes to stop.
-   Running storage at 100% utilization read/write will causes poor service time.
-   Running network at 100% utilization causes response between databases and client to be poor.

**Solution:** [Access the DB Console](ui-overview.html#db-console-access) and navigate to **Metrics > Hardware** dashboard to monitor the following metrics:

First, check adequate capacity was available for the incident for the following components.

Type | Time Series | What to look for
--------|--------|--------|
RAM capacity | Memory Usage | Any non-zero value
CPU capacity | CPU Percent | Consistent non-zero values
Network capacity | Network Bytes Received<br/>Network Bytes Sent | Any non-zero value

Check Near Out of Capacity Conditions:

Type | Time Series | What to look for
--------|--------|--------|
RAM capacity | Memory Usage | Consistently more than 80%
CPU capacity | CPU Percent | Consistently less than 20% in idle (ie:80% busy)
Network capacity | Network Bytes Received<br/>Network Bytes Sent | Consistently more than 50% capacity for both

## Storage issues

### Disks filling up

Like any database system, if you run out of disk space the system will no longer be able to accept writes. Additionally, a CockroachDB node needs a small amount of disk space (a few GBs to be safe) to perform basic maintenance functionality. For more information about this issue, see:

- [Why is memory usage increasing despite lack of traffic?](operational-faqs.html#why-is-memory-usage-increasing-despite-lack-of-traffic)
- [Why is disk usage increasing despite lack of writes?](operational-faqs.html#why-is-disk-usage-increasing-despite-lack-of-writes)
-  [Can I reduce or disable the storage of timeseries data?](operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data)

## Memory issues

### Suspected memory leak

A CockroachDB node will grow to consume all of the memory allocated for its `cache`. The default size for the cache is ¼ of physical memory which can be substantial depending on your machine configuration. This growth will occur even if your cluster is otherwise idle due to the internal metrics that a CockroachDB cluster tracks. See the `--cache` flag in [`cockroach start`](cockroach-start.html#general).

CockroachDB memory usage has 3 components:

-   **Go allocated memory**: Memory allocated by the Go runtime to support query processing and various caches maintained in Go by CockroachDB. These caches are generally small in comparison to the RocksDB cache size. If Go allocated memory is larger than a few hundred megabytes, something concerning is going on.
-   **CGo allocated memory**: Memory allocated by the C/C++ libraries linked into CockroachDB and primarily concerns the block caches for the storage engine (this is true for both [Pebble (the default engine) and RocksDB](cockroach-start.html#storage-engine)). This is the “cache” mentioned in the note above. The size of CGo allocated memory is usually very close to the configured cache size.
-   **Overhead**: The process resident set size minus Go/CGo allocated memory.

If Go allocated memory is larger than a few hundred megabytes, you might have encountered a memory leak. Go comes with a built-in heap profiler which is already enabled on your CockroachDB process. See this [excellent blog post](https://blog.golang.org/profiling-go-programs) on profiling Go programs.

**Solution:** To determine Go/CGo allocated memory:

1. [Access the DB Console](ui-overview.html#db-console-access).

2. Navigate to **Metrics > Runtime** dashboard, and check the **Memory Usage** graph.

3. On hovering over the graph, the values for the following metrics are displayed:

  Metric | Description
  --------|----
  RSS | Total memory in use by CockroachDB.
  Go Allocated | Memory allocated by the Go layer.
  Go Total | Total memory managed by the Go layer.
  CGo Allocated | Memory allocated by the C layer.
  CGo Total | Total memory managed by the C layer.

  -   If CGo allocated memory is larger than the configured `cache` size, [file an issue](file-an-issue.html).
  -   If the resident set size (RSS) minus Go/CGo total memory is larger than 100 megabytes, [file an issue](file-an-issue.html).

### Node crashes because of insufficient memory

Often when a node exits without a trace or logging any form of error message, we’ve found that it is the operating system stopping it suddenly due to low memory. So if you're seeing node crashes where the logs just end abruptly, it's probably because the node is running out of memory. On most Unix systems, you can verify if the `cockroach` process was stopped because the node ran out of memory by running:

~~~ shell
$ sudo dmesg | grep -iC 3 "cockroach"
~~~

If the command returns the following message, then you know the node crashed due to insufficient memory:

~~~ shell
$ host kernel: Out of Memory: Killed process <process_id> (cockroach).
~~~

To rectify the issue, you can either run the cockroachdb process on another node with sufficient memory, or [reduce the cockroachdb memory usage](cockroach-start.html#flags).

## Decommissioning issues

### Decommissioning process hangs indefinitely

**Explanation:** Before decommissioning a node, you need to make sure other nodes are available to take over the range replicas from the node. If no other nodes are available, the decommission process will hang indefinitely.

**Solution:** Confirm that there are enough nodes with sufficient storage space to take over the replicas from the node you want to remove.

### Decommissioned nodes displayed in UI forever

By design, decommissioned nodes are displayed in the DB Console forever. We retain the list of decommissioned nodes for the following reasons:

-   Decommissioning is not entirely free, so showing those decommissioned nodes in the UI reminds you of the baggage your cluster will have to carry around forever.
-   It also explains to future administrations why your node IDs have gaps (e.g., why the nodes are numbered n1, n2, and n8).

You can follow the discussion here: [https://github.com/cockroachdb/cockroach/issues/24636](https://github.com/cockroachdb/cockroach/issues/24636)

## Replication issues

### DB Console shows under-replicated/unavailable ranges

When a CockroachDB node dies (or is partitioned) the under-replicated range count will briefly spike while the system recovers.

**Explanation:** CockroachDB uses consensus replication and requires a quorum of the replicas to be available in order to allow both writes and reads to the range. The number of failures that can be tolerated is equal to (Replication factor - 1)/2. Thus CockroachDB requires (n-1)/2 nodes to achieve quorum. For example, with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on.

-   Under-replicated Ranges: When a cluster is first initialized, the few default starting ranges will only have a single replica, but as soon as other nodes are available, they will replicate to them until they've reached their desired replication factor. If a range does not have enough replicas, the range is said to be "under-replicated".

-   Unavailable Ranges: If a majority of a range's replicas are on nodes that are unavailable, then the entire range is unavailable and will be unable to process queries.

**Solution:**

To identify under-replicated/unavailable ranges:

1.  [Access the DB Console](ui-overview.html#db-console-access).

2.  On the **Cluster Overview** page, check the **Replication Status**. If the **Under-replicated ranges** or **Unavailable ranges** count is non-zero, then you have under-replicated or unavailable ranges in your cluster.

3. Check for a network partition: Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page. On the Advanced Debugging page, click **Network Latency**. In the **Latencies** table, check if any cells are marked as “X”. If yes, it indicates that the nodes cannot communicate with those nodes, and might indicate a network partition. If there's no partition, and there's still no upreplication after 5 mins, then [file an issue](file-an-issue.html).

**Add nodes to the cluster:**

On the DB Console’s Cluster Overview page, check if any nodes are down. If the number of nodes down is less than (n-1)/2, then that is most probably the cause of the under-replicated/unavailable ranges. Add nodes to the cluster such that the cluster has the required number of nodes to replicate ranges properly.

If you still see under-replicated/unavailable ranges on the Cluster Overview page, investigate further:

1.  [Access the DB Console](ui-overview.html#db-console-access)
2.  Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page.
2.  Click **Problem Ranges**.
3.  In the **Connections** table, identify the node with the under-replicated/unavailable ranges and click the node ID in the Node column.
4.  To view the **Range Report** for a range, click on the range number in the **Under-replicated (or slow)** table or **Unavailable** table.
5. On the Range Report page, scroll down to the **Simulated Allocator Output** section. The table contains an error message which explains the reason for the under-replicated range. Follow the guidance in the message to resolve the issue. If you need help understanding the error or the guidance, [file an issue](file-an-issue.html). Please be sure to include the full range report and error message when you submit the issue.

## Node liveness issues

"Node liveness" refers to whether a node in your cluster has been determined to be "dead" or "alive" by the rest of the cluster. This is achieved using checks that ensure that each node connected to the cluster is updating its liveness record. This information is shared with the rest of the cluster using an internal gossip protocol.

Common reasons for node liveness issues include:

- Heavy I/O load on the node. Because each node needs to update a liveness record on disk, maxing out disk bandwidth can cause liveness heartbeats to be missed. See also: [Capacity planning issues](#capacity-planning-issues).
- Outright I/O failure due to a disk stall. This will cause node liveness issues for the same reasons as listed above.
- Any [Networking issues](#networking-issues) with the node.

The [DB Console][db_console] provides several ways to check for node liveness issues in your cluster:

- [Check node heartbeat latency](#check-node-heartbeat-latency)
- [Check node liveness record last update](#check-node-liveness-record-last-update)
- [Check command commit latency](#check-command-commit-latency)

{{site.data.alerts.callout_info}}
For more information about how node liveness works, see [the architecture documentation on the replication layer](architecture/replication-layer.html#epoch-based-leases-table-data).
{{site.data.alerts.end}}

### Check node heartbeat latency

To check node heartbeat latency:

1. In the [DB Console][db_console], select the **Metrics** tab from the left-hand side of the page.

2. From the metrics page, select **Dashboard: Distributed** from the dropdown at the top of the page.

3. Scroll down the metrics page to find the **Node Heartbeat Latency: 99th percentile** and **Node Heartbeat Latency: 90th percentile** graphs.

**Expected values for a healthy cluster**: Less than 100ms in addition to the network latency between nodes in the cluster.

### Check node liveness record last update

To see when a node last updated its liveness record:

1. Go to the **Node Diagnostics** page of the [DB Console][db_console], which lives at:

    <https://yourcluster.yourdomain/#/reports/nodes>

2. On the Node Diagnostics page, you will see a table listing information about the nodes in your cluster.  To see when a node last updated its liveness record, check the **Updated at** field at the bottom of that node's column.

**Expected values for a healthy cluster**: When you load this page, the **Updated at** field should be within 4.5 seconds of the current time.  If it's higher than that, you will see errors [in the logs](debug-and-error-logs.html).

### Check command commit latency

A good signal of I/O load is the **Command Commit Latency** in the **Storage** section of the dashboards. This dashboard measures how quickly [Raft commands](architecture/replication-layer.html) are being committed by nodes in the cluster.

To view command commit latency:

1. In the [DB Console][db_console], select the **Metrics** tab from the left-hand side of the page.

2. From the Metrics page, select **Dashboard: Storage** from the dropdown at the top of the page.

3. Scroll down the metrics page to find the **Command Commit Latency: 90th percentile** and **Command Commit Latency: 99th percentile** graphs.

**Expected values for a healthy cluster**: On SSDs, this should be between 1 and 100 milliseconds.  On HDDs, this should be no more than 1 second.  Note that we [strongly recommend running CockroachDB on SSDs](recommended-production-settings.html#storage).

## Check for under-replicated or unavailable data

To see if any data is under-replicated or unavailable in your cluster, use the `system.replication_stats` report as described in [Replication Reports](query-replication-reports.html).

## Check for replication zone constraint violations

To see if any of your cluster's [data placement constraints](configure-replication-zones.html#replication-constraints) are being violated, use the `system.replication_constraint_stats` report as described in [Replication Reports](query-replication-reports.html).

## Check for critical localities

To see which of your [localities](cockroach-start.html#locality) (if any) are critical, use the `system.replication_critical_localities` report as described in [Replication Reports](query-replication-reports.html). A locality is "critical" for a range if all of the nodes in that locality becoming [unreachable](#node-liveness-issues) would cause the range to become unavailable. In other words, the locality contains a majority of the range's replicas.

## Something else?

If we do not have a solution here, you can try using our other [support resources](support-resources.html), including:

- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [Chatting with our developers on  Slack](https://cockroachdb.slack.com)

<!-- Reference Links -->

[db_console]: ui-overview.html
