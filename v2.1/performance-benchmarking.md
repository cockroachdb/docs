---
title: Performance Benchmarking
summary: Learn how to benchmark CockroachDB against TPC-C.
toc: false
---

This page walks you through TPC-C performance benchmarking on CockroachDB. It measures `tpmC` (new order transactions/minute) on two TPC-C datasets:

- 1,000 warehouses (for a total dataset size of 200GB) on 3 nodes
- 10,000 warehouses (for a total dataset size of 2TB) on 30 nodes _(Coming soon)_

These two points on the spectrum show how CockroachDB scales from modest sized production workloads to larger scale deployments.
<!--
This demonstrates how CockroachDB achieves high OLTP performance of over 128,000 tpmC on a TPC-C dataset over 2TB in size. -->

<div id="toc"></div>

## Benchmark a small cluster

### Step 1. Start a cluster on Google Cloud Platform GCE

Follow steps 1-7 in the [GCE tutorial to deploy a 3-node CockroachDB cluster on Google Cloud](deploy-cockroachdb-on-google-cloud-platform.html).

- For the 3 CockroachDB nodes, use the `n1-highcpu-16` VMs with [Local SSD](https://cloud.google.com/compute/docs/disks/local-ssd).
    For our TPC-C benchmarking, we use `n1-highcpu-16` machines. Currently, we believe this (or higher vCPU count machines) is the best configuration for CockroachDB under high traffic scenarios. We also attach a single local SSD to each virtual machine. Local SSDs are low latency disks attached to each VM, as opposed to networked block storage, which maximizes performance. We chose this configuration because it best resembles what a bare metal deployment would look like, with machines directly connected to one physical disk each (as opposed to network- attached replicated block storage).

- Skip step 4, for setting up Google's manage load balancing service. Instead, reserve a fourth VM for read and write testing and load balancing.

{{site.data.alerts.callout_danger}}
If you are following this deployment for production in the cloud, ensure that you spread your nodes across at least three availability zones and [set the CockroachDB zone configuration](configure-replication-zones.html) to spread replicas across zones. Local SSDs on Cloud VMs can lose data if the VM is lost, so it is important that CockroachDB can automatically recover from the loss of any single zone’s disks. This demo does not spread VMs across availability zones, but your production deployment should.
{{site.data.alerts.end}}

### Step 2. Run a sample workload

CockroachDB offers a pre-built `workload` binary for Linux that includes several load generators for simulating client traffic against your cluster. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

1. Download `workload` and make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST | chmod 755 workload.LATEST
    ~~~

2. Rename and copy `workload` into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i workload.LATEST /usr/local/bin/workload
    ~~~

3. Start the TPC-C workload, pointing it at the IP address of the load balancer and the location of the `ca.crt`, `client.root.crt`, and `client.root.key` files:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ workload fixtures load tpcc \
    --warehouses=1000 \
    "postgresql://root@<IP ADDRESS OF LOAD BALANCER:26257/tpcc?sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

    This command runs the TPC-C workload against the cluster. This will take about an hour and loads 1,000 "warehouses" of data.

    {{site.data.alerts.callout_success}}
    For more `tpcc` options, use `workload run tpcc --help`. For details about other load generators included in `workload`, use `workload run --help`.
    {{site.data.alerts.end}}

4. To monitor the load generator's progress, follow along with the process on the **Admin UI > Jobs** table.

     Open the [Admin UI](admin-ui-access-and-navigate.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup. Follow along with the process on the **Admin UI > Jobs** table.

### Step 3. Run the benchmark

In a new terminal window, run `workload` for five minutes:

~~~ shell
$ workload run tpcc \
--ramp=30s \
--warehouses=1000 \
--duration=300s \
--split \
--scatter \
"postgresql://root@<IP ADDRESS OF LOAD BALANCER:26257/tpcc?sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
~~~

Note that if you only direct load at a subset (or one) of the machines, your data will still be replicated across the cluster and remain durable in the event of the loss of a machine. You will not, however, get optimal performance, as all queries will go through the specified subset of the machines.

### Step 4. Interpret the results

Once the `workload` has finished running, you should see a final output line:

~~~ shell
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  298.9s    13154.0 102.3%     75.1     71.3    113.2    130.0    184.5    436.2
~~~

You will also see some audit checks and latency statistics for each individual query. For this run, some of those checks might indicate that they were `SKIPPED` due to insufficient data. For a more comprehensive test, run `workload` for a longer duration (e.g., two hours). The `tpmC` number is the headline number and `efc`(i.e, "efficiency"), tells you how close CockroachDB gets to theoretical maximum `tpmC`.

The TPC-C specification has p90 latency requirements on the order of seconds, but as you see here, CockroachDB far surpasses that requirement with p90 latencies in the hundreds of milliseconds.

{{site.data.alerts.callout_info}}
Instructions on how to reproduce our 30-node, 10,000 warehouse TPC-C results are coming soon.
{{site.data.alerts.end}}


<!-- ## Benchmark a large cluster

The methodology for reproducing CockroachDB's 30-node, 10,000 warehouse TPC-C result is very similar to that for the 3-node, 1,000 warehouse example. The only difference (besides the larger node count and dataset) is that you will use CockroachDB's [partitioning](partitioning.html) feature to ensure replicas for any given slice of data are usually located on the same nodes that will be queried by the load generator for that slice of data.

### Before you begin

- You must have a valid enterprise license to use [partitioning](partitioning.html) features. For details about requesting and setting a trial or full enterprise license, see [Enterprise Licensing](enterprise-licensing.html).
- Follow steps 1-7 in [Deploy CockroachDB on Google Cloud](deploy-cockroachdb-on-google-cloud-platform.html) to create a cluster with the following settings:
    - 30-node cluster (30 for the database, 1 for the load generator)
    - `n1-highcpu-16` machine type on [Local SSD](https://cloud.google.com/compute/docs/disks/local-ssd)
    - 10 racks, which are used later to partition the database. Each node will start with a [locality](start-a-node.html#locality) that includes an artificial "rack number." Use 10 racks for 30 nodes so that every tenth node is part of the same rack.

### Add an enterprise license

For this benchmark, you will use partitioning, which is an enterprise feature. For details about requesting and setting a trial or full enterprise license, see [Enterprise Licensing](enterprise-licensing.html).

To add an enterprise license to your cluster once it is started, [use the built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=<address of any node>
    ~~~

2. Add your enterprise license:

    {% include copy-clipboard.html %}
    ~~~ shell
    > Set CLUSTER SETTING enterprise.license = '<secret>'
    ~~~

3. Exit the interactive shell, using `\q` or `ctrl-d`.

### Run a sample workload

CockroachDB offers a pre-built `workload` binary for Linux that includes several load generators for simulating client traffic against your cluster. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

2. Download `workload` and make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST | chmod 755 workload.LATEST
    ~~~

3. Rename and copy `workload` into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i workload.LATEST /usr/local/bin/workload
    ~~~

4. Start the TPC-C workload, pointing it at the IP address of the load balancer and the location of the `ca.crt`, `client.root.crt`, and `client.root.key` files:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ workload fixtures load tpcc \
    --warehouses=10000 \
    "postgresql://root@<IP ADDRESS OF LOAD BALANCER:26257/tpcc?sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

    This command runs the TPC-C workload against the cluster. This will take at about an hour and loads 10,000 "warehouses" of data.

    {{site.data.alerts.callout_success}}
    For more `tpcc` options, use `workload run tpcc --help`. For details about other load generators included in `workload`, use `workload run --help`.
    {{site.data.alerts.end}}

4. To monitor the load generator's progress, follow along with the process on the **Admin UI > Jobs** table.

     Open the [Admin UI](admin-ui-access-and-navigate.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

### Step 2. Partition the database

Next, partition your database. This uses CockroachDB's [partitioning feature](partitioning.html) to split all of the TPC-C tables and indexes into 10 partitions, one per rack, and then uses zone configurations to pin those partitions to a particular rack.

1. On your local machine, launch the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=<address of any node>
    ~~~

2. Set a cluster setting increase the snapshot rate, which helps speed up this large-scale data movement:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.snapshot_rebalance.max_rate='64MiB';
    ~~~

3. Exit the interactive shell, using `\q` or `ctrl-d`.

4. Start the partitioning:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ workload.LATEST run tpcc \
    --partitions=10 \
    --split \
    --scatter \
    --warehouses=10000 \
    --duration=1s \
    "postgresql://root@<IP ADDRESS OF LOAD BALANCER:26257/tpcc?sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
    ~~~

    Partitioning will take at least 12 hours. It's slow because all of the data (over 2TB replicated for TPC-C-10K) needs to be moved around to the right locations.

5. To watch the progress, follow along with the process on the **Admin UI > Metrics > Queues > Replication Queue** graph.

    Open the [Admin UI](admin-ui-access-and-navigate.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

    Once the queue gets to `0` and stays there, the cluster should be finished rebalancing and is ready for testing.

### Step 3. Run the benchmark

In a new terminal window, run `workload` for five minutes:

~~~ shell
$ workload run tpcc \
--ramp=30s \
--warehouses=10000 \
--duration=300s \
--split \
--scatter \
"postgresql://root@<IP ADDRESS OF LOAD BALANCER:26257/tpcc?sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key"
~~~

### Step 4. Interpret the results

Once the `workload` has finished running, you should see a final output line similar to the output in [Benchmark a small cluster](#benchmark-a-small-cluster). The `tpmC` should be about 10x higher, reflecting the increase in the number of warehouses. -->

## See also

- [Benchmarking CockroachDB 2.0: A Performance Report](https://www.cockroachlabs.com/guides/cockroachdb-performance/)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Deploy CockroachDB on Digital Ocean](deploy-cockroachdb-on-digital-ocean.html)
