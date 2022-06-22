---
title: Performance Benchmarking with TPC-C
summary: Learn how to benchmark CockroachDB against TPC-C 100k.
toc: true
toc_not_nested: true
---

This page shows you how to reproduce [CockroachDB's TPC-C performance benchmarking results](performance.html#scale) on commodity AWS hardware. Across all scales, CockroachDB can process tpmC (new order transactions per minute) at near maximum efficiency. Start by choosing the scale you're interested in:

<div class="filters filters-big clearfix">
  <a href="performance-benchmarking-with-tpc-c-10-warehouses.html"><button class="filter-button">10</button></a>
  <a href="performance-benchmarking-with-tpc-c-1k-warehouses.html"><button class="filter-button">1000</button></a>
  <a href="performance-benchmarking-with-tpc-c-10k-warehouses.html"><button class="filter-button">10,000</button></a>
  <button class="filter-button current"><strong>100,000</strong></button>
</div>

Warehouses | Data size | Cluster size
-----------|-----------|-------------
10 | 2GB | 3 nodes on your laptop
1000 | 80GB | 3 nodes on `c5d.4xlarge` machines
10,000 | 800GB | 15 nodes on `c5d.4xlarge` machines
100,000 | 8TB | 81 nodes on `c5d.9xlarge` machines

## Before you begin

- [Review TPC-C concepts](#review-tpc-c-concepts)
- [Request a trial license](#request-a-trial-license)

### Review TPC-C concepts

TPC-C provides the most realistic and objective measure for OLTP performance at various scale factors. Before you get started, consider reviewing [what TPC-C is and how it is measured](performance.html#tpc-c).

### Request a trial license

Reproducing CockroachDB's 100,000 warehouse TPC-C results involves using CockroachDB's [partitioning](partitioning.html) feature to ensure replicas for any given section of data are located on the same nodes that will be queried by the load generator for that section of data. Partitioning helps distribute the workload evenly across the cluster.

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

2. Note the internal IP address of each instance. You'll need these addresses when starting the CockroachDB nodes.

{{site.data.alerts.callout_danger}}
This configuration is intended for performance benchmarking only. For production deployments, there are other important considerations, such as security, load balancing, and data location techniques to minimize network latency. For more details, see the [Production Checklist](recommended-production-settings.html).
{{site.data.alerts.end}}

### Configure your network

CockroachDB requires TCP communication on two ports:

- `26257` for inter-node communication (i.e., working as a cluster) and for the TPC-C workload to connect to nodes
- `8080` for exposing your Admin UI

[Create inbound rules](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html#adding-security-group-rule) for your security group:

#### Inter-node and TPCC-to-node communication

 Field | Recommended Value
-------|-------------------
 Type | Custom TCP Rule
 Protocol | TCP
 Port Range | **26257**
 Source | The name of your security group (e.g., *sg-07ab277a*)

#### Admin UI

 Field | Recommended Value
-------|-------------------
 Type | Custom TCP Rule
 Protocol | TCP
 Port Range | **8080**
 Source | Your network's IP ranges

## Step 2. Start CockroachDB

1. SSH to the first VM where you want to run a CockroachDB node.

2. Download the [CockroachDB archive](https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz) for Linux, extract the binary, and copy it into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

3. Run the [`cockroach start`](cockroach-start.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>,<node2 internal address>,<node3 internal address> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --locality=rack=0 \
    --background
    ~~~

    Each node will start with a [locality](cockroach-start.html#locality) that includes an artificial "rack number" (e.g., `--locality=rack=0`). Use 27 racks for 81 nodes so that 3 nodes will be assigned to each rack.

4. Repeat steps 1 - 3 for the other 80 VMs for CockroachDB nodes. Each time, be sure to:
    - Adjust the `--advertise-addr` flag.
    - Set the [`--locality`](cockroach-start.html#locality) flag to the appropriate "rack number", as described above.

5. On any of the VMs with the `cockroach` binary, run the one-time [`cockroach init`](cockroach-init.html) command to join the first nodes into a cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=<address of any node>
    ~~~

## Step 3. Configure the cluster

You'll be importing a large TPC-C data set. To speed that up, you can temporarily disable replication and tweak some cluster settings. You'll also need to enable the enterprise license you requested earlier.

1. SSH to any VM with the `cockroach` binary.

2. Launch the [built-in SQL shell](cockroach-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=<address of any node>
    ~~~

3. Disable replication:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER RANGE default CONFIGURE ZONE USING num_replicas = 1;
    ~~~

4. Adjust some [cluster settings](cluster-settings.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING rocksdb.ingest_backpressure.l0_file_count_threshold = 100;
    SET CLUSTER SETTING rocksdb.ingest_backpressure.pending_compaction_threshold = '5 GiB';
    SET CLUSTER SETTING schemachanger.backfiller.max_buffer_size = '5 GiB';
    SET CLUSTER SETTING kv.snapshot_rebalance.max_rate = '128 MiB';
    SET CLUSTER SETTING rocksdb.min_wal_sync_interval = '500us';
    ~~~

5. Enable the trial license you requested earlier:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<your organization>';
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<your license key>';
    ~~~

6. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Import the TPC-C dataset

CockroachDB offers a pre-built `workload` binary for Linux that includes the TPC-C benchmark. You'll need to put the binary on the VMs for importing the dataset and running TPC-C.

1. SSH to one of the VMs where you want to run TPC-C.

2. Download the `workload` binary for Linux and make it executable:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST -O workload; chmod 755 workload
    ~~~

3. Repeat steps 1 and 2 for the other 4 VMs where you'll run TPC-C.

4. On one of the VMs with the `workload` binary, import the TPC-C dataset:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./workload fixtures import tpcc \
    --warehouses 100000 \
    "postgres://root@<address of any CockroachDB node>:26257?sslmode=disable"
    ~~~

    This will load 8TB of data for 100,000 "warehouses". This can take around 6 hours to complete.

    You can monitor progress on the **Jobs** screen of the Admin UI. Open the [Admin UI](admin-ui-overview.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

## Step 5. Partition the database

Next, [partition your database](partitioning.html) to divide all of the TPC-C tables and indexes into 27 partitions, one per rack, and then use [zone configurations](configure-replication-zones.html) to pin those partitions to a particular rack.

1. Re-enable 3-way replication:

    1. SSH to any VM with the `cockroach` binary.

    2. Launch the [built-in SQL shell](cockroach-sql.html):

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ cockroach sql --insecure --host=<address of any node>
        ~~~

    3. Enable replication:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > ALTER RANGE default CONFIGURE ZONE USING num_replicas = 3;
        ~~~

    4. Exit the SQL shell:

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        > \q
        ~~~

2. On one of the VMs with the `workload` binary, briefly run TPC-C to set up partitioning:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 200500 && ./workload run tpcc \
    --partitions 27 \
    --warehouses 100000 \
    --duration 1m \
    --ramp 1ms \
    "postgres://root@<address of any CockroachDB node>:26257?sslmode=disable"
    ~~~

3. Wait for up-replication and partitioning to finish.

    This will likely take 10s of minutes. To watch the progress, go to the **Metrics > Queues > Replication Queue** graph in the Admin UI. Once the **Replication Queue** gets to `0` for all actions and stays there, you can move on to the next step.

## Step 6. Re-start CockroachDB

At the moment, running TPC-C against CockroachDB at this scale requires customizations that are not in the latest official release, so you'll need to stop the cluster, put a new binary with [these patches](https://github.com/cockroachdb/cockroach/commit/8af8c9e4a6399ee7672cac1e65b70a211cd63172) on the 81 VMs for CockroachDB, and then restart the cluster.

1. SSH to the first VM where CockroachDB is running.

2. Stop the `cockroach` process:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure
    ~~~

3. Rename the old binary:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ i="$(which cockroach)"; mv "$i" "$i"_old
    ~~~

4. Download the new binary, rename it, and copy it into the `PATH`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/cockroach.linux-gnu-amd64.9582884c143639d3acc85a7ba1a829fb5a5ae9dd ; chmod 755 cockroach.linux-gnu-amd64.9582884c143639d3acc85a7ba1a829fb5a5ae9dd
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach.linux-gnu-amd64.9582884c143639d3acc85a7ba1a829fb5a5ae9dd /usr/local/bin/cockroach
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

5. Re-start the node, using the same [`cockroach start`](cockroach-start.html) command you used the first time you started the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>,<node2 internal address>,<node3 internal address> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --locality=rack=0 \
    --background
    ~~~

6. Repeat steps 1 - 5 for the other 80 VMs for CockroachDB nodes. Each time, be sure to use the `cockroach start` command you used the first time you started the node.

## Step 7. Allocate partitions

Before running the benchmark, it's important to allocate partitions to workload binaries properly to ensure that the cluster is balanced.

1. Create an `addrs` file containing connection strings to all 81 CockroachDB nodes:

    ~~~
    postgres://root@<node 1 internal address>:26257?sslmode=disable postgres://root@<node 2 internal address>:26257?sslmode=disable postgres://root@<node 3 internal address>:26257?sslmode=disable postgres://root@<node 4 internal address>:26257?sslmode=disable ...
    ~~~

2. Upload the `addrs` file to the 5 VMs with the `workload` binary:

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

3. SSH to each VM with `workload` and allocate partitions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 200500 && ./workload run tpcc \
    --partitions 27 \
    --warehouses 100000 \
    --partition-affinity 0,5,10,15,20,25 \
    --ramp 30m \
    --duration 1ms \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 200500 && ./workload run tpcc \
    --partitions 27 \
    --warehouses 100000 \
    --partition-affinity 1,6,11,16,21,26 \
    --ramp 30m \
    --duration 1ms \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 200500 && ./workload run tpcc \
    --partitions 27 \
    --warehouses 100000 \
    --partition-affinity 2,7,12,17,22 \
    --ramp 30m \
    --duration 1ms \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 200500 && ./workload run tpcc \
    --partitions 27 \
    --warehouses 100000 \
    --partition-affinity 3,8,13,18,23 \
    --ramp 30m \
    --duration 1ms \
    $(cat addrs)
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 200500 && ./workload run tpcc \
    --partitions 27 \
    --warehouses 100000 \
    --partition-affinity 4,9,14,19,24 \
    --ramp 30m \
    --duration 1ms \
    $(cat addrs)
    ~~~

## Step 8. Run the benchmark

Once the allocations finish, run TPC-C for 30 minutes on each VM with `workload`:

{{site.data.alerts.callout_info}}
It is critical to run the benchmark from the workload nodes in parallel, so start them as simultaneously as possible.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
$ ulimit -n 200500 && ./workload run tpcc \
--partitions 27 \
--warehouses 100000 \
--partition-affinity 0,5,10,15,20,25 \
--ramp 1m \
--duration 30m \
--histograms workload1.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ulimit -n 200500 && ./workload run tpcc \
--partitions 27 \
--warehouses 100000 \
--partition-affinity 1,6,11,16,21,26 \
--ramp 1m \
--duration 30m \
--histograms workload2.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ulimit -n 200500 && ./workload run tpcc \
--partitions 27 \
--warehouses 100000 \
--partition-affinity 2,7,12,17,22 \
--ramp 1m \
--duration 30m \
--histograms workload3.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ulimit -n 200500 && ./workload run tpcc \
--partitions 27 \
--warehouses 100000 \
--partition-affinity 3,8,13,18,23 \
--ramp 1m \
--duration 30m \
--histograms workload4.histogram.ndjson \
$(cat addrs)
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ ulimit -n 200500 && ./workload run tpcc \
--partitions 27 \
--warehouses 100000 \
--partition-affinity 4,9,14,19,24 \
--ramp 1m \
--duration 30m \
--histograms workload5.histogram.ndjson \
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

2. Upload the result files to one of the VMs with the `workload` binary:

    {{site.data.alerts.callout_info}}
    The commands below assume you're uploading to the VM with the `workload1.histogram.ndjson` file.
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

3. SSH to the VM where you uploaded the results files.

4. Run the `workload debug tpcc-merge-results` command to synthesize the results:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ./workload debug tpcc-merge-results \
    --warehouses 100000 \
    workload*.histogram.ndjson
    ~~~

    You'll should see results similar to the following, with **1.2M tpmC, a nearly perfect score**:

    ~~~
    Duration: 1h0m0, Warehouses: 100000, Efficiency: 98.81, tpmC: 1245461.78
    _elapsed___ops/sec(cum)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
     3600.1s     	2082.1	151.0	369.1	453.0	637.5   5100.3 delivery
     3600.1s    	20757.7	167.8	402.7	486.5	671.1   8321.5 newOrder
     3600.1s     	2083.2  9.4 	62.9 	92.3	159.4   1073.7 orderStatus
     3600.1s    	20829.5	100.7	251.7	318.8	469.8   7516.2 payment
     3600.1s     	2082.8 	29.4	100.7	142.6	234.9 103079.2 stockLevel
    ~~~

## See also

- [Performance Overview](performance.html)

- Hardware

    CockroachDB works well on commodity hardware in public cloud, private cloud, on-prem, and hybrid environments. For hardware recommendations, see our [Production Checklist](recommended-production-settings.html#hardware).

    Also note that CockroachDB creates a yearly cloud report focused on evaluating hardware performance. For more information, see the [2020 Cloud Report](https://www.cockroachlabs.com/blog/2020-cloud-report/).

- Performance Tuning

    For guidance on tuning a real workload's performance, see [SQL Best Practices](performance-best-practices-overview.html), and for guidance on data location techniques to minimize network latency, see [Topology Patterns](topology-patterns.html).  
