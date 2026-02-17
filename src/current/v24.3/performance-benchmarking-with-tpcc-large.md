---
title: Performance Benchmarking with TPC-C
summary: Learn how to benchmark CockroachDB against TPC-C with 81 nodes on `c5d.9xlarge` machines
toc: true
toc_not_nested: true
key: performance-benchmarking-with-tpc-c-100k-warehouses.html
docs_area: reference.benchmarking
---

This page shows you how to reproduce [CockroachDB TPC-C performance benchmarking results]({% link {{ page.version.version }}/performance.md %}#scale). Across all scales, CockroachDB can process tpmC (new order transactions per minute) at near maximum efficiency. Start by choosing the scale you're interested in:

{% include {{ page.version.version }}/filter-tabs/perf-bench-tpc-c.md %}

| Workload             | Cluster size                                            | Warehouses | Data size |
|----------------------+---------------------------------------------------------+------------+-----------|
| Local                | 3 nodes on your laptop                                  |         10 | 2 GB      |
| Local (multi-region) | 9 in-memory nodes on your laptop using `cockroach demo` |         10 | 2 GB      |
| Small                | 3 nodes on `c5d.4xlarge` machines                       |       2500 | 200 GB    |
| Medium               | 15 nodes on `c5d.4xlarge` machines                      |     13,000 | 1.04 TB   |
| Large                | 81 nodes on `c5d.9xlarge` machines                      |    140,000 | 11.2 TB   |

## Before you begin

- [Review TPC-C concepts](#review-tpc-c-concepts)
- [Request a trial license](#request-a-trial-license)

### Review TPC-C concepts

TPC-C provides the most realistic and objective measure for OLTP performance at various scale factors. Before you get started, consider reviewing [what TPC-C is and how it is measured]({% link {{ page.version.version }}/performance.md %}#tpc-c).

### Request a trial license

Reproducing these TPC-C results involves using CockroachDB's [partitioning]({% link {{ page.version.version }}/partitioning.md %}) feature to ensure replicas for any given section of data are located on the same nodes that will be queried by the load generator for that section of data. Partitioning helps distribute the workload evenly across the cluster.

The partitioning feature requires an Enterprise license, so [request a 30-day trial license](https://www.cockroachlabs.com/get-cockroachdb/enterprise/) before you get started.

You should receive your trial license via email within a few minutes. You'll enable your license once your cluster is up-and-running.

## Step 1. Set up the environment

- [Provision VMs](#provision-vms)
- [Configure your network](#configure-your-network)

### Provision VMs

1. [Create 86 VM instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/LaunchingAndUsingInstances.html), 81 for CockroachDB nodes and 5 for the TPC-C workload.
    - Create all instances in the same region and the same security group.
    - Use the `c5d.9xlarge` machine type.
    - Use [local SSD instance store volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html#instance-store-volumes). Local SSDs are low latency disks attached to each VM, which maximizes performance. This configuration best resembles what a bare metal deployment would look like, with machines directly connected to one physical disk each. We do not recommend using network-attached block storage.

1. Note the internal IP address of each instance. You'll need these addresses when starting the CockroachDB nodes.

{{site.data.alerts.callout_danger}}
This configuration is intended for performance benchmarking only. For production deployments, there are other important considerations, such as security, load balancing, and data location techniques to minimize network latency. For more details, see the [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}).
{{site.data.alerts.end}}

### Configure your network

CockroachDB requires TCP communication on two ports:

- `26257` for inter-node communication (i.e., working as a cluster) and for the TPC-C workload to connect to nodes
- `8080` for exposing your DB Console

[Create inbound rules](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html#adding-security-group-rule) for your security group:

#### Inter-node and TPCC-to-node communication

 Field | Recommended Value
-------|-------------------
 Type | Custom TCP Rule
 Protocol | TCP
 Port Range | **26257**
 Source | The name of your security group (e.g., *sg-07ab277a*)

#### DB Console

 Field | Recommended Value
-------|-------------------
 Type | Custom TCP Rule
 Protocol | TCP
 Port Range | **8080**
 Source | Your network's IP ranges

## Step 2. Start CockroachDB

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

1. SSH to the first VM where you want to run a CockroachDB node.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Start CockroachDB using the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>,<node2 internal address>,<node3 internal address> \
    --cache=.25 \
    --locality=rack=0
    ~~~

    Each node will start with a [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) that includes an artificial "rack number" (e.g., `--locality=rack=0`). Use 81 racks for 81 nodes so that 1 node will be assigned to each rack.

1. Repeat these steps for the other 80 VMs for CockroachDB nodes. Each time, be sure to:
    - Adjust the `--advertise-addr` flag.
    - Set the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag to the appropriate "rack number".

1. On any of the VMs with the `cockroach` binary, run the one-time [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command to join the first nodes into a cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach init --insecure --host=<address of any node on --join list>
    ~~~

## Step 3. Configure the cluster

You'll be importing a large TPC-C data set. To speed that up, you can temporarily disable replication and tweak some cluster settings. You'll also need to enable the Enterprise license you requested earlier.

1. SSH to any VM with the `cockroach` binary.

1. Launch the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=<address of any node>
    ~~~

1. Adjust some [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.dist_sender.concurrency_limit = 2016;
    SET CLUSTER SETTING kv.snapshot_rebalance.max_rate = '256 MiB';
    SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
    SET CLUSTER SETTING schemachanger.backfiller.max_buffer_size = '5 GiB';
    SET CLUSTER SETTING rocksdb.min_wal_sync_interval = '500us';
    SET CLUSTER SETTING kv.range_merge.queue_enabled = false
    ~~~

1. Change the default [GC TTL]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) to the following value:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER RANGE default CONFIGURE ZONE USING gc.ttlseconds = 600;
    ~~~

1. Enable the trial license you requested earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<your organization>';
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<your license key>';
    ~~~

1. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Import the TPC-C dataset

CockroachDB comes with a number of [built-in workloads]({% link {{ page.version.version }}/cockroach-workload.md %}) for simulating client traffic. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

1. SSH to the VM where you want to run TPC-C.

1. [Install CockroachDB for Linux]({% link {{ page.version.version }}/install-cockroachdb-linux.md %}).

1. Import the TPC-C dataset:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload fixtures import tpcc \
    --partitions=81 \
    --warehouses=140000 \
    --replicate-static-columns \
    --partition-strategy=leases \
    'postgres://root@<address of any CockroachDB node>:26257?sslmode=disable'
    ~~~

    This will load 11.2 TB of data for 140,000 "warehouses". This can take up to 8 hours to complete.

    You can monitor progress on the **Jobs** screen of the DB Console. Open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

## Step 5. Partition the database

1. [Partition your database]({% link {{ page.version.version }}/partitioning.md %}) to divide all of the TPC-C tables and indexes into 81 partitions, one per rack, and then use [zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) to pin those partitions to a particular rack.

1. Wait for up-replication and partitioning to finish.  You will know when they have finished because both the number of *lease transfers* and *snapshots* will go down to `0` and stay there.  This will likely take 10s of minutes.
    - To monitor the number of lease transfers, open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), select the **Replication** dashboard, hover over the **Range Operations** graph, and check the **Lease Transfers** data point.
    - To check the number of snapshots, open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}), select the **Replication** dashboard, and hover over the **Snapshots** graph.

    <img src="/docs/images/{{ page.version.version }}/tpcc-large-replication-dashboard.png" alt="TPC-C 140k replication and partitioning dashboards" style="border:1px solid #eee;max-width:100%" />

## Step 7. Allocate partitions

Before running the benchmark, it's important to allocate partitions to workload binaries properly to ensure that the cluster is balanced.

1. Create an `addrs` file containing connection strings to all 81 CockroachDB nodes:

    ~~~
    postgres://root@<node 1 internal address>:26257?sslmode=disable postgres://root@<node 2 internal address>:26257?sslmode=disable postgres://root@<node 3 internal address>:26257?sslmode=disable postgres://root@<node 4 internal address>:26257?sslmode=disable ...
    ~~~

1. Upload the `addrs` file to the 5 VMs with the `workload` binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp addrs <username>@<workload instance 1 address>:.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp addrs <username>@<workload instance 2 address>:.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp addrs <username>@<workload instance 3 address>:.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp addrs <username>@<workload instance 4 address>:.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp addrs <username>@<workload instance 5 address>:.
    ~~~

1. SSH to each VM with `workload` and allocate partitions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ulimit -n 500000 && cockroach workload run tpcc --partitions=81 \
    --warehouses=140000 \
    --partition-affinity=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 \
    --ramp=30m \
    --duration=1ms \
    --histograms=workload1.histogram.ndjson \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ulimit -n 500000 && cockroach workload run tpcc \
    --partitions 81 \
    --warehouses 140000 \
    --partition-affinity=17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32 \
    --ramp=30m \
    --duration=1ms \
    --histograms=workload2.histogram.ndjson \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ulimit -n 500000 && cockroach workload run tpcc \
    --partitions=81 \
    --warehouses=140000 \
    --partition-affinity=33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48 \
    --ramp=30m \
    --duration=1ms \
    --histograms=workload3.histogram.ndjson \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ulimit -n 500000 && cockroach workload run tpcc \
    --partitions=81 \
    --warehouses=140000 \
    --partition-affinity=49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64 \
    --ramp=30m \
    --duration=1ms \
    --histograms=workload4.histogram.ndjson \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ulimit -n 500000 && cockroach workload run tpcc \
    --partitions=81 \
    --warehouses=140000 \
    --partition-affinity=65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80 \
    --ramp=30m \
    --duration=1ms \
    --histograms=workload5.histogram.ndjson \
    $(cat addrs)
    ~~~

## Step 8. Run the benchmark

Once the allocations finish, run TPC-C for 30 minutes on each VM with `workload`:

{{site.data.alerts.callout_info}}
It is critical to run the benchmark from the workload nodes in parallel, so start them as simultaneously as possible.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
ulimit -n 500000 && cockroach workload run tpcc \
--partitions=81 \
--warehouses=140000 \
--partition-affinity=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16 \
--ramp=4m \
--duration=30m \
--histograms=workload1.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
ulimit -n 500000 && cockroach workload run tpcc \
--partitions=81 \
--warehouses=140000 \
--partition-affinity=17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32 \
--ramp=4m \
--duration=30m \
--histograms=workload2.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
ulimit -n 500000 && cockroach workload run tpcc \
--partitions=81 \
--warehouses=140000 \
--partition-affinity=33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48 \
--ramp=4m \
--duration=30m \
--histograms=workload3.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
ulimit -n 500000 && cockroach workload run tpcc \
--partitions=81 \
--warehouses=140000 \
--partition-affinity=49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64 \
--ramp=4m \
--duration=30m \
--histograms=workload4.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
ulimit -n 500000 && cockroach workload run tpcc \
--partition=81 \
--warehouses=140000 \
--partition-affinity=65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80 \
--ramp=4m \
--duration=30m \
--histograms=workload5.histogram.ndjson \
$(cat addrs)
~~~

## Step 9. Interpret the results

1. Collect the result files from each VM with `workload`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp <username>@<workload instance 1 address>:workload1.histogram.ndjson .
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp <username>@<workload instance 2 address>:workload2.histogram.ndjson .
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp <username>@<workload instance 3 address>:workload3.histogram.ndjson .
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp <username>@<workload instance 4 address>:workload4.histogram.ndjson .
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp <username>@<workload instance 5 address>:workload5.histogram.ndjson .
    ~~~

1. Upload the result files to one of the VMs with the `workload` binary:

    {{site.data.alerts.callout_info}}
    The following commands assume you're uploading to the VM with the `workload1.histogram.ndjson` file.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp workload2.histogram.ndjson <username>@<workload instance 2 address>:.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp workload3.histogram.ndjson <username>@<workload instance 3 address>:.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp workload4.histogram.ndjson <username>@<workload instance 4 address>:.
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp workload5.histogram.ndjson <username>@<workload instance 5 address>:.
    ~~~

1. SSH to the VM where you uploaded the results files.

1. Run the `workload debug tpcc-merge-results` command to synthesize the results:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach workload debug tpcc-merge-results \
    --warehouses=140000 \
    workload*.histogram.ndjson
    ~~~

    You'll should see results similar to the following, with **1.68M tpmC with 140,000 warehouses, resulting in an efficiency score of 95%**:

    ~~~
    Duration: 30m1., Warehouses: 140000, Efficiency: 95.45, tpmC: 1684437.21
    _elapsed___ops/sec(cum)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
    1801.1s 	 2824.0     302.0   1140.9   2415.9   9126.8  55834.6 delivery
    1801.1s		28074.0     402.7   1409.3   2684.4   9126.8  45097.2 newOrder
    1801.1s 	 2826.0       6.8     62.9    125.8   4160.7  33286.0 orderStatus
    1801.1s 	28237.4     251.7   1006.6   2415.9  15032.4 103079.2 payment
    1801.1s 	 2823.5      39.8    469.8    906.0   5905.6  38654.7 stockLevel
    ~~~

## See also

- [Performance Overview]({% link {{ page.version.version }}/performance.md %})

- Hardware

    CockroachDB works well on commodity hardware in public cloud, private cloud, on-prem, and hybrid environments. For hardware recommendations, see our [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware).

- Performance tuning

    For guidance on tuning a real workload's performance, see [SQL Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}), and for guidance on techniques to minimize network latency in multi-region or global clusters, see [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).
