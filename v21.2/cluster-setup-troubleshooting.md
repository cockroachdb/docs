---
title: Troubleshoot Cluster Setup
summary: Learn how to troubleshoot issues with starting CockroachDB clusters
toc: true
docs_area: manage
---

If you're having trouble starting or scaling your cluster, this page will help you troubleshoot the issue.

To use this guide, it's important to understand some of CockroachDB's terminology:

  - A **Cluster** acts as a single logical database, but is actually made up of many cooperating nodes.
  - **Nodes** are single instances of the `cockroach` binary running on a machine. It's possible (though atypical) to have multiple nodes running on a single machine.

## Cannot run a single-node CockroachDB cluster

Try running:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start-single-node --insecure --logtostderr
~~~

If the process exits prematurely, check for the following:

#### An existing storage directory

When starting a node, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit `cockroach`, and then tried to start another cluster using the same directory. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot start.

**Solution:** Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

-   Choose a different directory to store the CockroachDB data:  
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --store=<new directory> --insecure
    ~~~
-   Remove the existing directory and start the node again:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -r cockroach-data/
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --insecure --logtostderr
    ~~~

#### Toolchain incompatibility

The components of the toolchain might have some incompatibilities that need to be resolved. For example, a few months ago, there was an incompatibility between Xcode 8.3 and Go 1.8 that caused any Go binaries created with that toolchain combination to crash immediately.

#### Incompatible CPU

If the `cockroach` process had exit status `132 (SIGILL)`, it attempted to use an instruction that is not supported by your CPU. Non-release builds of CockroachDB may not be able to run on older hardware platforms than the one used to build them. Release builds should run on any x86-64 CPU.

#### Default ports already in use

Other services may be running on port 26257 or 8080 (CockroachDB's default `--listen-addr` port and `--http-addr` port respectively). You can either stop those services or start your node with different ports, specified in the [`--listen-addr` and `--http-addr` flags](cockroach-start.html#networking).

  If you change the port, you will need to include the `--port=<specified port>` flag in each subsequent cockroach command or change the `COCKROACH_PORT` environment variable.

#### Single-node networking issues

Networking issues might prevent the node from communicating with itself on its hostname. You can control the hostname CockroachDB uses with the [`--listen-addr` flag](cockroach-start.html#networking).

  If you change the host, you will need to include `--host=<specified host>` in each subsequent cockroach command.

#### CockroachDB process hangs when trying to start a node in the background

See [Why is my process hanging when I try to start it in the background?](operational-faqs.html#why-is-my-process-hanging-when-i-try-to-start-nodes-with-the-background-flag)

## Cannot run SQL statements using built-in SQL client

If the CockroachDB node appeared to [start successfully](start-a-local-cluster.html), in a separate terminal run:

{% include_cached copy-clipboard.html %}
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

#### Store directory already exists

~~~
ERROR: could not cleanup temporary directories from record file: could not lock temporary directory /Users/amruta/go/src/github.com/cockroachdb/cockroach/cockroach-data/cockroach-temp301343769, may still be in use: IO error: While lock file: /Users/amruta/go/src/github.com/cockroachdb/cockroach/cockroach-data/cockroach-temp301343769/TEMP_DIR.LOCK: Resource temporarily unavailable
~~~

**Explanation:** When starting a new node on the same machine, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server and then tried to start another cluster using the same directory.

**Solution:** Choose a different directory to store the CockroachDB data.

#### Port already in use

~~~
ERROR: cockroach server exited with error: consider changing the port via --listen-addr: listen tcp 127.0.0.1:26257: bind: address already in use
~~~

**Solution:** Change the `--port`, `--http-port` flags for each new node that you want to run on the same machine.

## Cannot join a node to an existing CockroachDB cluster

#### Store directory already exists

When joining a node to a cluster, you might receive one of the following errors:

~~~
no resolvers found; use --join to specify a connected node

node belongs to cluster {"cluster hash"} but is attempting to connect to a gossip network for cluster {"another cluster hash"}
~~~

**Explanation:** When starting a node, the directory you choose to store the data in also contains metadata identifying the cluster the data came from. This causes conflicts when you've already started a node on the server, have quit the `cockroach` process, and then tried to join another cluster. Because the existing directory's cluster ID doesn't match the new cluster ID, the node cannot join it.  

**Solution:** Disassociate the node from the existing directory where you've stored CockroachDB data. For example, you can do either of the following:

-   Choose a different directory to store the CockroachDB data:  
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --store=<new directory> --join=<cluster host> <other flags>
    ~~~
-   Remove the existing directory and start a node joining the cluster again:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -r cockroach-data/
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start --join=<cluster host>:26257 <other flags>  
    ~~~

#### Incorrect `--join` address

If you try to add another node to the cluster, but the `--join` address is not pointing at any of the existing nodes, then the process will never complete, and you'll see a continuous stream of warnings like this:

~~~
W180817 17:01:56.506968 886 vendor/google.golang.org/grpc/clientconn.go:942 Failed to dial localhost:20000: grpc: the connection is closing; please retry.  
W180817 17:01:56.510430 914 vendor/google.golang.org/grpc/clientconn.go:1293 grpc: addrConn.createTransport failed to connect to {localhost:20000 0 <nil>}. Err :connection error: desc = "transport: Error while dialing dial tcp [::1]:20000: connect: connection refused". Reconnecting…
~~~

**Explanation:** These warnings tell you that the node cannot establish a connection with the address specified in the `--join` flag. Without a connection to the cluster, the node cannot join.

**Solution:** To successfully join the node to the cluster, start the node again, but this time include a correct `--join` address.

## Client connection issues

If a client cannot connect to the cluster, check basic network connectivity (`ping`), port connectivity (`telnet`), and certificate validity.

#### Networking issues

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

#### Network partition

If the DB Console lists any dead nodes on the [**Cluster Overview** page](ui-cluster-overview-page.html), then you might have a network partition.

**Explanation:** A network partition prevents nodes from communicating with each other in one or both directions. This can be due to a configuration problem with the network, such as when allowlisted IP addresses or hostnames change after a node is torn down and rebuilt. In a symmetric partition, node communication is broken in both directions. In an asymmetric partition, node communication works in one direction but not the other.

The effect of a network partition depends on which nodes are partitioned, where the ranges are located, and to a large extent, whether [localities](cockroach-start.html#locality) are defined. If localities are not defined, a partition that cuts off at least (n-1)/2 nodes will cause data unavailability.

**Solution:**

To identify a network partition:

1.  Access the [Network Latency](ui-network-latency-page.html) page of the DB Console.
2.  In the **Latencies** table, check for nodes with [no connections](ui-network-latency-page.html#no-connections). This indicates that a node cannot communicate with another node, and might indicate a network partition.

## Authentication issues

#### Missing certificate

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

#### Certification expiration

If you’re running a secure cluster, be sure to monitor your certificate expiration. If one of the inter-node certificates expires, nodes will no longer be able to communicate which can look like a network partition.

To check the certificate expiration date:

1. [Access the DB Console](ui-overview.html#db-console-access).
2. Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page.
3. Scroll down to the **Even More Advanced Debugging** section. Click **All Nodes**. The **Node Diagnostics** page appears. Click the certificates for each node and check the expiration date for each certificate in the Valid Until field.

#### Client password not set

While connecting to a secure cluster as a user, CockroachDB first checks if the client certificate exists in the `cert` directory. If the client certificate doesn’t exist, it prompts for a password. If password is not set and you press Enter, the connection attempt fails, and the following error is printed to `stderr`:

~~~
Error: pq: invalid password  
Failed running "sql"
~~~

**Solution:** To successfully connect to the cluster, you must first either generate a client certificate or create a password for the user.

#### Cannot create new connections to cluster for up to 40 seconds after a node dies

When a node [dies abruptly and/or loses its network connection to the cluster](#node-liveness-issues), the following behavior can occur:

1. For a period of up to 40 seconds, clients trying to connect with [username and password authentication](authentication.html#client-authentication) cannot create new connections to any of the remaining nodes in the cluster.
1. Applications start timing out when trying to connect to the cluster during this window.

The reason this happens is as follows:

- Username and password information is stored in a system range.
- Since all system ranges are located [near the beginning of the keyspace](architecture/distribution-layer.html#monolithic-sorted-map-structure), the system range containing the username/password info can sometimes be colocated with another system range that is used to determine [node liveness](#node-liveness-issues).
- If the username/password info and the node liveness record are stored together as described above, it can take extra time for the lease on this range to be transferred to another node. Normally, lease transfers take about 10 seconds, but in this case it may require multiple rounds of consensus to determine that the node in question is actually dead (the node liveness record check may be retried several times before failing).

For more information about how lease transfers work when a node dies, see [How leases are transferred from a dead node](architecture/replication-layer.html#how-leases-are-transferred-from-a-dead-node).

The solution is to add connection retry logic to your application.

## Clock sync issues

#### Node clocks are not properly synchronized

See the following FAQs:

- [What happens when node clocks are not properly synchronized](operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized)
- [How can I tell how well node clocks are synchronized](operational-faqs.html#how-can-i-tell-how-well-node-clocks-are-synchronized)

## Capacity planning issues

You may encounter the following issues when your cluster nears 100% resource capacity:

-   Running CPU at close to 100% utilization with high run queue will result in poor performance.
-   Running RAM at close to 100% utilization triggers Linux OOM and/or swapping that will result in poor performance or stability issues.
-   Running storage at 100% capacity causes writes to fail, which in turn can cause various processes to stop.
-   Running storage at 100% utilization read/write causes poor service time and [node shutdown](operational-faqs.html#what-happens-when-a-node-runs-out-of-disk-space).
-   Running network at 100% utilization causes response between databases and client to be poor.

**Solution:** [Access the DB Console](ui-overview.html#db-console-access) and navigate to **Metrics > Hardware** dashboard to monitor the following metrics:

Check that adequate capacity was available for the incident:

Type | Time Series | What to look for
--------|--------|--------|
RAM capacity | Memory Usage | Any non-zero value
CPU capacity | CPU Percent | Consistent non-zero values
Disk capacity | Available Disk Capacity | Any non-zero value
Disk I/O | Disk Ops In Progress | Zero or occasional single-digit values
Network capacity | Network Bytes Received<br/>Network Bytes Sent | Any non-zero value

{{site.data.alerts.callout_info}}
For minimum provisioning guidelines, see [Basic hardware recommendations](recommended-production-settings.html#basic-hardware-recommendations).
{{site.data.alerts.end}}

Check for resources that are running out of capacity:

Type | Time Series | What to look for
--------|--------|--------|
RAM capacity | Memory Usage | Consistently more than 80%
CPU capacity | CPU Percent | Consistently less than 20% in idle (i.e., 80% busy)
Disk capacity | Available Disk Capacity | Consistently less than 20% of the [store](cockroach-start.html#store) size
Disk I/O | Disk Ops In Progress | Consistent double-digit values
Network capacity | Network Bytes Received<br/>Network Bytes Sent | Consistently more than 50% capacity for both

## Storage issues

#### Disks filling up

Like any database system, if you run out of disk space the system will no longer be able to accept writes. Additionally, a CockroachDB node needs a small amount of disk space (a few GiBs to be safe) to perform basic maintenance functionality. For more information about this issue, see:

- [What happens when a node runs out of disk space?](operational-faqs.html#what-happens-when-a-node-runs-out-of-disk-space)
- [Why is memory usage increasing despite lack of traffic?](operational-faqs.html#why-is-memory-usage-increasing-despite-lack-of-traffic)
- [Why is disk usage increasing despite lack of writes?](operational-faqs.html#why-is-disk-usage-increasing-despite-lack-of-writes)
- [Can I reduce or disable the storage of timeseries data?](operational-faqs.html#can-i-reduce-or-disable-the-storage-of-time-series-data)

###### Automatic ballast files

{% include_cached new-in.html version="v21.2" %} CockroachDB automatically creates an emergency ballast file at [node startup](cockroach-start.html). This feature is **on** by default. Note that the [`cockroach debug ballast`](cockroach-debug-ballast.html) command is still available but deprecated.

The ballast file defaults to 1% of total disk capacity or 1 GiB, whichever is smaller. The size of the ballast file may be configured using [the `--store` flag to `cockroach start`](cockroach-start.html#flags-store) with a [`ballast-size` field](cockroach-start.html#fields-ballast-size); this field accepts the same value formats as the `size` field.

In order for the ballast file to be automatically created, the following conditions must be met:

- Available disk space is at least four times the configured ballast file size.
- Available disk space on the store after creating the ballast file is at least 10 GiB.

During node startup, if available disk space on at least one store is less than or equal to half the ballast file size, the process will exit immediately with the exit code 10, signifying 'Disk Full'.

To allow the node to start, you can manually remove the `EMERGENCY_BALLAST` file, which is located in the store's `cockroach-data/auxiliary` directory as shown below:

~~~
cockroach-data
├── ...
├── auxiliary
│   └── EMERGENCY_BALLAST
...
~~~

Removing the ballast file will give you a chance to remedy the disk space exhaustion; it will automatically be recreated when there is sufficient disk space.

{{site.data.alerts.callout_info}}
Different filesystems may treat the ballast file differently. Make sure to test that the file exists, and that space for the file is actually being reserved by the filesystem. For a list of supported filesystems, see the [Production Checklist](recommended-production-settings.html#storage).
{{site.data.alerts.end}}

#### Disk stalls

A _disk stall_ is any disk operation that does not terminate in a reasonable amount of time. This usually manifests as write-related system calls such as [`fsync(2)`](https://man7.org/linux/man-pages/man2/fdatasync.2.html) (aka `fdatasync`) taking a lot longer than expected (e.g., more than 60 seconds). The mitigation in almost all cases is to [restart the node](cockroach-start.html) with the stalled disk. CockroachDB's internal disk stall monitoring will attempt to shut down a node when it sees a disk stall that lasts longer than 60 seconds. At that point the node should be restarted by your [orchestration system](recommended-production-settings.html#orchestration-kubernetes).

Symptoms of disk stalls include:

- Bad cluster write performance, usually in the form of a substantial drop in QPS for a given workload.
- [Node liveness issues](#node-liveness-issues).
- Writes on one node come to a halt. This can happen because in rare cases, a node may be able to perform liveness checks (which involve writing to disk) even though it cannot write other data to disk due to one or more slow/stalled calls to `fsync`. Because the node is passing its liveness checks, it is able to hang onto its leases even though it cannot make progress on the ranges for which it is the leaseholder. This wedged node has a ripple effect on the rest of the cluster such that all processing of the ranges whose leaseholders are on that node basically grinds to a halt. As mentioned above, CockroachDB's disk stall detection will attempt to shut down the node when it detects this state.

Causes of disk stalls include:

- Disk operations have slowed due to underprovisioned IOPS. Make sure you are deploying with our [recommended production settings for storage](recommended-production-settings.html#storage) and [monitoring disk IOPS](common-issues-to-monitor.html#disk-iops).
- Actual hardware-level storage issues that result in slow `fsync` performance.
- In rare cases, operating-system-level configuration of subsystems such as SELinux can slow down system calls such as `fsync` enough to affect storage engine performance.

CockroachDB's built-in disk stall detection works as follows:

- Every 10 seconds, the CockroachDB storage engine checks the [_write-ahead log_](https://en.wikipedia.org/wiki/Write-ahead_logging), or _WAL_. If data has not been synced to disk (via `fsync`) within that interval, the log message `disk stall detected: unable to write to %s within %s %s warning log entry` is written to the [`STORAGE` logging channel](logging.html#storage). If this state continues for 60 seconds or more (configurable with the `COCKROACH_ENGINE_MAX_SYNC_DURATION` environment variable), the `cockroach` process is terminated.

- Every time the storage engine writes to the main [`cockroach.log` file](logging.html#dev), the engine waits 30 seconds for the write to succeed (configurable with the `COCKROACH_LOG_MAX_SYNC_DURATION` environment variable). If the write to the log fails, the `cockroach` process is terminated and the following message is written to stderr / `cockroach.log`:

    - `disk stall detected: unable to sync log files within %s`

- During [node liveness heartbeats](#node-liveness-issues), the [storage engine](architecture/storage-layer.html) writes to disk as part of the node liveness heartbeat process.

## CPU issues

#### CPU is insufficient for the workload

Issues with CPU most commonly arise when there is insufficient CPU to support the scale of the workload. If the concurrency of your workload significantly exceeds your provisioned CPU, you will encounter a [degradation in SQL response time](common-issues-to-monitor.html#service-latency). This is the most common symptom of CPU starvation.

Because compaction requires significant CPU to run concurrent worker threads, a lack of CPU resources will eventually cause compaction to fall behind. This leads to [read amplification](architecture/storage-layer.html#read-amplification) and inversion of the log-structured merge (LSM) trees on the [storage layer](architecture/storage-layer.html).

If these issues remain unresolved, affected nodes will miss their liveness heartbeats, causing the cluster to lose nodes and eventually become unresponsive.

**Solution:** To diagnose and resolve an excessive workload concurrency issue:

- [Check for high CPU usage.](common-issues-to-monitor.html#cpu-usage)

- [Check your workload concurrency](common-issues-to-monitor.html#workload-concurrency) and compare it to your provisioned CPU.

  - {% include {{ page.version.version }}/prod-deployment/resolution-excessive-concurrency.md %}

- [Check LSM health](common-issues-to-monitor.html#lsm-health), which can be affected over time by CPU starvation.

  - {% include {{ page.version.version }}/prod-deployment/resolution-inverted-lsm.md %}

## Memory issues

#### Suspected memory leak

A CockroachDB node will grow to consume all of the memory allocated for its `--cache`, [even if your cluster is idle](operational-faqs.html#why-is-memory-usage-increasing-despite-lack-of-traffic). The default cache size is 25% of physical memory, which can be substantial, depending on your machine configuration. For more information, see [Cache and SQL memory size](recommended-production-settings.html#cache-and-sql-memory-size).

CockroachDB memory usage has the following components:

- **Go allocated memory**: Memory allocated by the Go runtime to support query processing and various caches maintained in Go by CockroachDB.
- **CGo allocated memory**: Memory allocated by the C/C++ libraries linked into CockroachDB and primarily concerns the block caches for the [Pebble storage engine](cockroach-start.html#storage-engine)). This is the allocation specified with `--cache`. The size of CGo allocated memory is usually very close to the configured `--cache` size.
- **Overhead**: The RSS (resident set size) minus Go/CGo allocated memory.

If Go allocated memory is larger than a few hundred megabytes, you might have encountered a memory leak. Go comes with a built-in heap profiler which is already enabled on your CockroachDB process. See this [excellent blog post](https://blog.golang.org/profiling-go-programs) on profiling Go programs.

**Solution:** To determine Go and CGo allocated memory:

1. [Access the DB Console](ui-overview.html#db-console-access).

1. Navigate to **Metrics > Runtime** dashboard, and check the **Memory Usage** graph.

1. On hovering over the graph, the values for the following metrics are displayed:

    Metric | Description
    --------|----
    RSS | Total memory in use by CockroachDB.
    Go Allocated | Memory allocated by the Go layer.
    Go Total | Total memory managed by the Go layer.
    CGo Allocated | Memory allocated by the C layer.
    CGo Total | Total memory managed by the C layer.

    {% include {{ page.version.version }}/prod-deployment/healthy-crdb-memory.md %}

    If you observe any of the following, [file an issue](file-an-issue.html):
      - CGo Allocated is larger than the configured `--cache` size.
      - RSS minus Go Total and CGo Total is larger than 100 MiB.
      - Go Total or CGo Total fluctuates or grows steadily over time.

#### Out-of-memory (OOM) crash

When a node exits without logging an error message, the operating system has likely stopped the node due to insufficient memory.

CockroachDB attempts to restart nodes after they crash. Nodes that frequently restart following an abrupt process exit may point to an underlying memory issue.

**Solution:** If you [observe nodes restarting after sudden crashes](common-issues-to-monitor.html#node-process-restarts):

- [Confirm that the node restarts are caused by OOM crashes.](common-issues-to-monitor.html#verify-oom-errors)

  - {% include {{ page.version.version }}/prod-deployment/resolution-oom-crash.md %}

- [Check whether SQL queries may be responsible.](common-issues-to-monitor.html#sql-memory-usage)


## Decommissioning issues

#### Decommissioning process hangs indefinitely

**Explanation:** Before decommissioning a node, you need to make sure other nodes are available to take over the range replicas from the node. If no other nodes are available, the decommission process will hang indefinitely.

**Solution:** Confirm that there are enough nodes with sufficient storage space to take over the replicas from the node you want to remove.

## Replication issues

#### DB Console shows under-replicated/unavailable ranges

When a CockroachDB node dies (or is partitioned) the under-replicated range count will briefly spike while the system recovers.

**Explanation:** CockroachDB uses consensus replication and requires a quorum of the replicas to be available in order to allow both writes and reads to the range. The number of failures that can be tolerated is equal to (Replication factor - 1)/2. Thus CockroachDB requires (n-1)/2 nodes to achieve quorum. For example, with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on.

-   Under-replicated Ranges: When a cluster is first initialized, the few default starting ranges will only have a single replica, but as soon as other nodes are available, they will replicate to them until they've reached their desired replication factor. If a range does not have enough replicas, the range is said to be "under-replicated".

-   Unavailable Ranges: If a majority of a range's replicas are on nodes that are unavailable, then the entire range is unavailable and will be unable to process queries.

**Solution:**

To identify under-replicated/unavailable ranges:

1.  [Access the DB Console](ui-overview.html#db-console-access).

2.  On the **Cluster Overview** page, check the **Replication Status**. If the **Under-replicated ranges** or **Unavailable ranges** count is non-zero, then you have under-replicated or unavailable ranges in your cluster.

3. Check for a network partition: Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page. On the Advanced Debugging page, click **Network Latency**. In the **Latencies** table, check if any cells are marked as "X". If yes, it indicates that the nodes cannot communicate with those nodes, and might indicate a network partition. If there's no partition, and there's still no upreplication after 5 mins, then [file an issue](file-an-issue.html).

**Add nodes to the cluster:**

On the DB Console’s Cluster Overview page, check if any nodes are down. If the number of nodes down is less than (n-1)/2, then that is most probably the cause of the under-replicated/unavailable ranges. Add nodes to the cluster such that the cluster has the required number of nodes to replicate ranges properly.

If you still see under-replicated/unavailable ranges on the Cluster Overview page, investigate further:

1.  [Access the DB Console](ui-overview.html#db-console-access)
2.  Click the gear icon on the left-hand navigation bar to access the **Advanced Debugging** page.
2.  Click **Problem Ranges**.
3.  In the **Connections** table, identify the node with the under-replicated/unavailable ranges and click the node ID in the Node column.
4.  To view the **Range Report** for a range, click on the range number in the **Under-replicated (or slow)** table or **Unavailable** table.
5. On the Range Report page, scroll down to the **Simulated Allocator Output** section. The table contains an error message which explains the reason for the under-replicated range. Follow the guidance in the message to resolve the issue. If you need help understanding the error or the guidance, [file an issue](file-an-issue.html). Please be sure to include the full Range Report and error message when you submit the issue.

## Node liveness issues

"Node liveness" refers to whether a node in your cluster has been determined to be "dead" or "alive" by the rest of the cluster. This is achieved using checks that ensure that each node connected to the cluster is updating its liveness record. This information is shared with the rest of the cluster using an internal gossip protocol.

Common reasons for node liveness issues include:

- Heavy I/O load on the node. Because each node needs to update a liveness record on disk, maxing out disk bandwidth can cause liveness heartbeats to be missed. See also: [Capacity planning issues](#capacity-planning-issues).
- A [disk stall](#disk-stalls). This will cause node liveness issues for the same reasons as listed above.
- [Insufficient CPU for the workload](#cpu-is-insufficient-for-the-workload). This can eventually cause nodes to miss their liveness heartbeats and become unresponsive.
- [Networking issues](#networking-issues) with the node.

The [DB Console][db_console] provides several ways to check for node liveness issues in your cluster:

- [Check node heartbeat latency](common-issues-to-monitor.html#node-heartbeat-latency)
- [Check command commit latency](common-issues-to-monitor.html#command-commit-latency)

{{site.data.alerts.callout_info}}
For more information about how node liveness works, see [Replication Layer](architecture/replication-layer.html#epoch-based-leases-table-data).
{{site.data.alerts.end}}

#### Impact of node failure is greater than 10 seconds

When the cluster needs to access a range on a leaseholder node that is dead, that range's [lease must be transferred to a healthy node](architecture/replication-layer.html#how-leases-are-transferred-from-a-dead-node). In theory, this process should take no more than 9 seconds for liveness expiration plus the cost of several network roundtrips.

In production, lease transfer upon node failure can take longer than expected. In {{ page.version.version }}, this is observed in the following scenarios:

- **The leaseholder node for the liveness range fails.** The liveness range is a system range that [stores the liveness record](architecture/replication-layer.html#epoch-based-leases-table-data) for each node on the cluster. If a node fails and is also the leaseholder for the liveness range, operations cannot proceed until the liveness range is transferred to a new leaseholder and the liveness record is made available to other nodes. This can cause momentary cluster unavailability.

- **Network or DNS issues cause connection issues between nodes.** If there is no live server for the IP address or DNS lookup, connection attempts to a node will not return an immediate error, but will hang until timing out. This can cause unavailability and prevent a speedy movement of leases and recovery. CockroachDB avoids contacting unresponsive nodes or DNS during certain performance-critical operations, and the connection issue should generally resolve in 10-30 seconds. However, an attempt to contact an unresponsive node could still occur in other scenarios that are not yet addressed.

- **A node's disk stalls.** A [disk stall](#disk-stalls) on a node can cause write operations to stall indefinitely, causes the node's heartbeats to fail since the storage engine cannot write to disk as part of the heartbeat, and may cause read requests to fail if they are waiting for a conflicting write to complete. Lease acquisition from this node can stall indefinitely until the node is shut down or recovered. Pebble detects most stalls and will terminate the `cockroach` process after 60 seconds, but there are gaps in its detection. In **v21.2.13, v22.1.2, and later**, each lease acquisition attempt on an unresponsive node times out after 6 seconds. However, CockroachDB can still appear to stall as these timeouts are occurring.

**Otherwise unresponsive nodes.** A node can be made unresponsive by internal deadlock due to faulty code, resource exhaustion, OS/hardware issues, and other arbitrary failures. This can cause leases to become stuck in certain cases, such as when a response from the previous leaseholder is needed in order to move the lease.

**Solution:** If you are experiencing intermittent network or connectivity issues, first [shut down the affected nodes](node-shutdown.html) temporarily so that nodes phasing in and out do not cause disruption.

If a node has become unresponsive without returning an error, [shut down the node](node-shutdown.html) so that network requests immediately become hard errors rather than stalling.

If you are running a version of CockroachDB that is affected by an issue described here, [upgrade to a version](upgrade-cockroach-version.html) that contains the fix for the issue.

## Partial availability issues

If your cluster is in a partially-available state due to a recent node or network failure, the internal logging table `system.eventlog` might be unavailable. This can cause the logging of [notable events](eventlog.html) (e.g., the execution of SQL statements) to the `system.eventlog` table to fail to complete, contributing to cluster unavailability. If this occurs, you can set the [cluster setting](cluster-settings.html) `server.eventlog.enabled` to `false` to disable writing notable log events to this table, which may help to recover your cluster.

Even with `server.eventlog.enabled` set to `false`, notable log events are still sent to configured [log sinks](configure-logs.html#configure-log-sinks) as usual.

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
- [Chatting with our developers on Slack](https://cockroachdb.slack.com)

<!-- Reference Links -->

[db_console]: ui-overview.html
