---
title: Performance Benchmarking with TPC-C
summary: Benchmark CockroachDB against TPC-C 1k on AWS
toc: true
toc_not_nested: true
---

This page shows you how to reproduce [CockroachDB's TPC-C performance benchmarking results](performance.html#scale) on commodity AWS hardware. Across all scales, CockroachDB can process tpmC (new order transactions per minute) at near maximum efficiency. Start by choosing the scale you're interested in:

<div class="filters filters-big clearfix">
  <a href="performance-benchmarking-with-tpc-c-10-warehouses.html"><button class="filter-button">10</button></a>
  <button class="filter-button current"><strong>1000</strong></button>
  <a href="performance-benchmarking-with-tpc-c-10k-warehouses.html"><button class="filter-button">10,000</button></a>
  <a href="performance-benchmarking-with-tpc-c-100k-warehouses.html"><button class="filter-button">100,000</button></a>
</div>

Warehouses | Data size | Cluster size
-----------|-----------|-------------
10 | 2GB | 3 nodes on your laptop
1000 | 80GB | 3 nodes on `c5d.4xlarge` machines
10,000 | 800GB | 15 nodes on `c5d.4xlarge` machines
100,000 | 8TB | 81 nodes on `c5d.9xlarge` machines

## Before you begin

### Review TPC-C concepts

TPC-C provides the most realistic and objective measure for OLTP performance at various scale factors. Before you get started, consider reviewing [what TPC-C is and how it is measured](performance.html#tpc-c).

## Step 1. Set up the environment

- [Provision VMs](#provision-vms)
- [Configure your network](#configure-your-network)

### Provision VMs

1. [Create 4 VM instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/LaunchingAndUsingInstances.html), 3 for CockroachDB nodes and 1 for the TPC-C workload.
    - Create all instances in the same region and the same security group.
    - Use the `c5d.4xlarge` machine type.
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

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz \
    | tar -xz
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~

    If you get a permissions error, prefix the command with `sudo`.

3. Run the [`cockroach start`](cockroach-start.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --advertise-addr=<node1 internal address> \
    --join=<node1 internal address>,<node2 internal address>,<node3 internal address> \
    --cache=.25 \
    --max-sql-memory=.25 \
    --background
    ~~~

4. Repeat steps 1 - 3 for the other 2 VMs for CockroachDB nodes. Each time, be sure to adjust the `--advertise-addr` flag.

5. On any of the VMs with the `cockroach` binary, run the one-time [`cockroach init`](cockroach-init.html) command to join the first nodes into a cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=<address of any node>
    ~~~

## Step 3. Import the TPC-C dataset

CockroachDB offers a pre-built `workload` binary for Linux that includes the TPC-C benchmark. You'll need to put this binary on the VM for importing the dataset and running TPC-C.

1. SSH to the VM where you want to run TPC-C.

2. Download the `workload` binary for Linux and make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST -O workload; chmod 755 workload
    ~~~

3. Import the TPC-C dataset:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./workload fixtures import tpcc \
    --warehouses 1000 \
    "postgres://root@<address of any CockroachDB node>:26257?sslmode=disable"
    ~~~

    This will load 80GB of data for 1000 "warehouses". This can take a while to complete.

    You can monitor progress on the **Jobs** screen of the Admin UI. Open the [Admin UI](admin-ui-access-and-navigate.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

## Step 4. Run the benchmark

1. Still on the VM with the `workload` binary, create an `addrs` file containing connection strings to the 3 CockroachDB nodes:

    ~~~
    postgres://root@<node 1 internal address>:26257?sslmode=disable postgres://root@<node 2 internal address>:26257?sslmode=disable postgres://root@<node 3 internal address>:26257?sslmode=disable
    ~~~

2. Run TPC-C for 30 minutes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./workload run tpcc \
    --warehouses 1000 \
    --ramp 1m \
    --duration 30m \
    $(cat addrs)
    ~~~

## Step 5. Interpret the results

Once the `workload` has finished running, you will see a final result similar to the following. The efficiency and latency can be combined to determine whether this was a passing run. You should expect to see an efficiency number above 95%, well above the required minimum of 85%, and p95 latencies well below the required maximum of 10 seconds.

~~~
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
 1800.0s    12474.4  97.0%     24.6     21.0     39.8     52.4     79.7    302.0
~~~

## See also

- [Performance Overview](performance.html)

- Hardware

    CockroachDB works well on commodity hardware in public cloud, private cloud, on-prem, and hybrid environments. For hardware recommendations, see our [Production Checklist](recommended-production-settings.html#hardware).

    Also note that CockroachDB creates a yearly cloud report focused on evaluating hardware performance. In November 2019, we will provide metrics on AWS, GCP, and Azure. In the meantime, you can read the [2018 Cloud Report](https://www.cockroachlabs.com/blog/2018_cloud_report/) that focuses on AWS and GCP.

- Performance Tuning

    For guidance on tuning a real workload's performance, see [SQL Best Practices](performance-best-practices-overview.html), and for guidance on data location techniques to minimize network latency, see [Topology Patterns](topology-patterns.html).  
