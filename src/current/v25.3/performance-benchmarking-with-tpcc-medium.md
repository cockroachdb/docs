---
title: Performance Benchmarking with TPC-C
summary: Benchmark CockroachDB against TPC-C with 15 nodes on `c5d.4xlarge` machines
toc: true
toc_not_nested: true
key: performance-benchmarking-with-tpc-c-10k-warehouses.html
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

1. [Create 16 VM instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/LaunchingAndUsingInstances.html), 15 for CockroachDB nodes and 1 for the TPC-C workload.
    - Create all instances in the same region and the same security group.
    - Use the `c5d.4xlarge` machine type.
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

1. Run the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>,<node2 internal address>,<node3 internal address> \
    --cache=.25 \
    --locality=rack=0
    ~~~

    Each node will start with a [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) that includes an artificial "rack number" (e.g., `--locality=rack=0`). Use 5 racks for 15 nodes so that 3 nodes will be assigned to each rack.

1. Repeat steps 1 - 3 for the other 14 VMs for CockroachDB nodes. Each time, be sure to:
    - Adjust the `--advertise-addr` flag.
    - Set the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag to the appropriate "rack number".

1. On any of the VMs with the `cockroach` binary, run the one-time [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) command to join the first nodes into a cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach init --insecure --host=<address of any node on --join list>
    ~~~

## Step 3. Configure the cluster

You'll be importing a large TPC-C data set. To speed that up, you can tweak some cluster settings. You'll also need to enable the Enterprise license you requested earlier.

1. SSH to any VM with the `cockroach` binary.

1. Launch the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=<address of any node>
    ~~~

1. Adjust some [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING rocksdb.ingest_backpressure.l0_file_count_threshold = 100;
    SET CLUSTER SETTING schemachanger.backfiller.max_buffer_size = '5 GiB';
    SET CLUSTER SETTING kv.snapshot_rebalance.max_rate = '128 MiB';
    SET CLUSTER SETTING rocksdb.min_wal_sync_interval = '500us';
    SET CLUSTER SETTING kv.range_merge.queue_enabled = false;
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
    --partitions=5 \
    --warehouses=13000 \
    'postgres://root@<address of any CockroachDB node>:26257?sslmode=disable'
    ~~~

    This will load 1.04 TB of data for 13,000 "warehouses". This can take around 1 hour to complete.

    You can monitor progress on the **Jobs** screen of the DB Console. Open the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

## Step 5. Allow the cluster to rebalance

Next, [partition your database]({% link {{ page.version.version }}/partitioning.md %}) to divide all of the TPC-C tables and indexes into 5 partitions, one per rack, and then use [zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) to pin those partitions to a particular rack.

1. Still on the same VM, briefly run TPC-C to let the cluster balance and the leases settle. Bump the file descriptor limits with `ulimit` to the high value shown in the following snippet, since the workload generators create a lot of database connections.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 100000 && cockroach workload run tpcc \
    --partitions=5 \
    --warehouses=13000 \
    --duration=1m \
    --ramp=1ms \
    'postgres://root@<address of any CockroachDB node>:26257?sslmode=disable'
    ~~~

1. Wait for range rebalancing to finish.

    This will likely take 10s of minutes. To watch the progress, go to the **Metrics > Queues > Replication Queue** graph in the DB Console. Once the **Replication Queue** gets to `0` for all actions and stays there, you can move on to the next step.

## Step 6. Run the benchmark

1. Back on the VM with the `workload` binary, create an `addrs` file containing connection strings to all 15 CockroachDB nodes:

    ~~~
    postgres://root@<node 1 internal address>:26257?sslmode=disable postgres://root@<node 2 internal address>:26257?sslmode=disable postgres://root@<node 3 internal address>:26257?sslmode=disable postgres://root@<node 4 internal address>:26257?sslmode=disable ...
    ~~~

1. Run TPC-C for 30 minutes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 100000 && cockroach workload run tpcc \
    --partitions=5 \
    --warehouses=13000 \
    --ramp=1m \
    --duration=30m \
    $(cat addrs)
    ~~~

## Step 7. Interpret the results

Once the workload has finished running, you will see a result similar to the following. The efficiency and latency can be combined to determine whether this was a passing run. You should expect to see an efficiency number above 95%, well above the required minimum of 85%, and p95 latencies well below the required maximum of 10 seconds.

~~~
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
 1800.0s   160420.0  96.0%    303.1    285.2    570.4    671.1    939.5   4160.7
~~~

## See also

- [Performance Overview]({% link {{ page.version.version }}/performance.md %})

- Hardware

    CockroachDB works well on commodity hardware in public cloud, private cloud, on-prem, and hybrid environments. For hardware recommendations, see our [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware).

- Performance tuning

    For guidance on tuning a real workload's performance, see [SQL Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}), and for guidance on techniques to minimize network latency in multi-region or global clusters, see [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).
