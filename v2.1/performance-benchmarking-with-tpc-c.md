---
title: Performance Benchmarking with TPC-C
summary: Learn how to benchmark CockroachDB against TPC-C.
toc: true
---

This page walks you through [TPC-C](http://www.tpc.org/tpcc/) performance benchmarking on CockroachDB. It measures tpmC (new order transactions/minute) on two TPC-C datasets:

- 1,000 warehouses (for a total dataset size of 200GB) on 3 nodes
- 10,000 warehouses (for a total dataset size of 2TB) on 30 nodes

These two points on the spectrum show how CockroachDB scales from modest-sized production workloads to larger-scale deployments. This demonstrates how CockroachDB achieves high OLTP performance of over 128,000 tpmC on a TPC-C dataset over 2TB in size.

## Benchmark a small cluster

### Step 1. Start a 3-node cluster on Google Cloud Platform GCE

Follow steps 1-6 in the [GCE tutorial to deploy a 3-node CockroachDB cluster on Google Cloud](deploy-cockroachdb-on-google-cloud-platform.html), with the following changes:

- For the 3 CockroachDB nodes, use `n1-highcpu-16` VMs with [local SSD storage](https://cloud.google.com/compute/docs/disks/local-ssd).  

    For our TPC-C benchmarking, we use `n1-highcpu-16` machines. Currently, we believe this (or higher vCPU count machines) is the best configuration for CockroachDB under high traffic scenarios. We also attach a single local SSD to each virtual machine. Local SSDs are low latency disks attached to each VM, which maximizes performance. We chose this configuration because it best resembles what a bare metal deployment would look like, with machines directly connected to one physical disk each. We do not recommend using network-attached block storage.

- Configure the local SSDs to be more performant:

    ~~~ shell
    $ sudo umount /mnt/data1; sudo mount -o discard,defaults,nobarrier /dev/disk/by-id/google-local-ssd-0 /mnt/data1/; mount | grep /mnt/data1
    ~~~

- Skip step 4, for setting up Google's manage load balancing service. Instead, reserve a fourth VM for running the TPC-C benchmark.

{{site.data.alerts.callout_danger}}
This configuration is intended for performance benchmarking only. For production deployments, there are other important considerations, such as ensuring that data is balanced across at least three availability zones for resiliency. See the [Production Checklist](recommended-production-settings.html) for more details.
{{site.data.alerts.end}}

<!-- ## Roachprod directions for performance benchmarking a small cluster

Use roachprod to create cluster: `roachprod create lauren-tpcc --gce-machine-type "n1-highcpu-16" --local-ssd --nodes 4`

Download latest version of CockroachDB:

- `roachprod run lauren-tpcc 'wget https://binaries.cockroachdb.com/cockroach-v2.0.4.linux-amd64.tgz'`

- `roachprod run lauren-tpcc "curl https://binaries.cockroachdb.com/cockroach-v2.0.4.linux-amd64.tgz | tar -xvz; mv cockroach-v2.0.4.linux-amd64/cockroach cockroach"`

Configure SSD to be more performant: `roachprod run lauren-tpcc -- 'sudo umount /mnt/data1; sudo mount -o discard,defaults,nobarrier /dev/disk/by-id/google-local-ssd-0 /mnt/data1/; mount | grep /mnt/data1'`

Start the 3 nodes: `roachprod start lauren-tpcc:1-3`

Add license:

- `roachprod sql lauren-tpcc:1`
- Set CLUSTER SETTING enterprise.license = '<secret>'

Run sample workload and RESTORE TPC-C data: `roachprod run lauren-tpcc:4 "wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST && chmod a+x workload.LATEST"`

Tell workload to load dataset to cluster: `roachprod run lauren-tpcc:4 "./workload.LATEST fixtures load tpcc {pgurl:1} --warehouses=1000"` (this will take about an hour)

Check on progress by navigating to the Admin UI > Jobs dashboard: `roachprod adminurl lauren-tpcc:1`

Once RESTORE is complete, run the benchmark: `roachprod run lauren-tpcc:4 "./workload.LATEST run tpcc --ramp=30s --warehouses=1000 --duration=300s --split --scatter {pgurl:1-3}"`

Once the workload has finished running, you should see a final output line:

~~~ shell
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  298.8s    13149.8 102.3%    108.4    100.7    176.2    201.3    285.2    604.0
~~~ -->

### Step 2. Run a sample workload

CockroachDB offers a pre-built `workload` binary for Linux that includes several load generators for simulating client traffic against your cluster. This step features CockroachDB's version of the TPC-C workload.

1. SSH to VM 4, download `workload` and make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST | chmod 755 workload.LATEST
    ~~~

2. Rename and copy `workload` into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i workload.LATEST /usr/local/bin/workload
    ~~~

3. Start the TPC-C workload, pointing it at the IP address of a node and including any [connection parameters](connection-parameters.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ./workload.LATEST fixtures load tpcc \
    --warehouses=10000 \
    postgresql://root@<NODE 1 ADDRESS>:26257?sslmode=disable
    ~~~

    This command runs the TPC-C workload against the cluster. This will take about an hour and loads 1,000 "warehouses" of data.

    {{site.data.alerts.callout_success}}
    For more `tpcc` options, use `workload run tpcc --help`. For details about other load generators included in `workload`, use `workload run --help`.
    {{site.data.alerts.end}}

4. To monitor the load generator's progress, follow along with the process on the **Admin UI > Jobs** table.

     Open the [Admin UI](admin-ui-access-and-navigate.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup. Follow along with the process on the **Admin UI > Jobs** table.

### Step 3. Run the benchmark

Still on VM 4, run `workload` for five minutes:

{% include copy-clipboard.html %}
~~~ shell
$ ./workload.LATEST run tpcc \
--ramp=30s \
--warehouses=1000 \
--duration=300s \
--split \
--scatter \
"postgresql://root@<NODE 1 ADDRESS, NODE 2 ADDRESS, NODE 3 ADDRESS>:26257?sslmode=disable"
~~~

### Step 4. Interpret the results

Once the `workload` has finished running, you should see a final output line:

~~~ shell
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  298.9s    13154.0 102.3%     75.1     71.3    113.2    130.0    184.5    436.2
~~~

You will also see some audit checks and latency statistics for each individual query. For this run, some of those checks might indicate that they were `SKIPPED` due to insufficient data. For a more comprehensive test, run `workload` for a longer duration (e.g., two hours). The `tpmC` (new order transactions/minute) number is the headline number and `efc` ("efficiency") tells you how close CockroachDB gets to theoretical maximum `tpmC`.

The [TPC-C specification](http://www.tpc.org/tpc_documents_current_versions/pdf/tpc-c_v5.11.0.pdf) has p90 latency requirements in the order of seconds, but as you see here, CockroachDB far surpasses that requirement with p90 latencies in the hundreds of milliseconds.

## Benchmark a large cluster

The methodology for reproducing CockroachDB's 30-node, 10,000 warehouse TPC-C result is similar to that for the [3-node, 1,000 warehouse example](#benchmark-a-small-cluster). The only difference (besides the larger node count and dataset) is that you will use CockroachDB's [partitioning](partitioning.html) feature to ensure replicas for any given section of data are located on the same nodes that will be queried by the load generator for that section of data. Partitioning also helps distribute the workload evenly across the cluster.

### Before you start

Benchmarking a large cluster uses [partitioning](partitioning.html). You must have a valid enterprise license to use partitioning features. For details about requesting and setting a trial or full enterprise license, see [Enterprise Licensing](enterprise-licensing.html).

### Step 1. Start a 30-node cluster on Google Cloud Platform GCE

Follow steps 1-6 in the [GCE tutorial to deploy a 30-node CockroachDB cluster on Google Cloud](deploy-cockroachdb-on-google-cloud-platform.html), with the following changes:

- For the 30 CockroachDB nodes, use `n1-highcpu-16` VMs with [local SSD storage](https://cloud.google.com/compute/docs/disks/local-ssd).  

    For our TPC-C benchmarking, we use `n1-highcpu-16` machines. Currently, we believe this (or higher vCPU count machines) is the best configuration for CockroachDB under high traffic scenarios. We also attach a single local SSD to each virtual machine. Local SSDs are low latency disks attached to each VM, which maximizes performance. We chose this configuration because it best resembles what a bare metal deployment would look like, with machines directly connected to one physical disk each. We do not recommend using network-attached block storage.

- Configure the local SSDs to be more performant:

    ~~~ shell
    $ sudo umount /mnt/data1; sudo mount -o discard,defaults,nobarrier /dev/disk/by-id/google-local-ssd-0 /mnt/data1/; mount | grep /mnt/data1
    ~~~

- Skip step 4, for setting up Google's manage load balancing service. Instead, reserve a thirty-first VM for running the TPC-C benchmark.

- Add 10 racks, which are used later to partition the database. Each node will start with a [locality](start-a-node.html#locality) that includes an artificial "rack number" (e.g., `--locality=rack=1`) Use 10 racks for 30 nodes so that every tenth node is part of the same rack.

{{site.data.alerts.callout_danger}}
This configuration is intended for performance benchmarking only. For production deployments, there are other important considerations, such as ensuring that data is balanced across at least three availability zones for resiliency. See the [Production Checklist](recommended-production-settings.html) for more details.
{{site.data.alerts.end}}

### Step 2. Add an enterprise license

For this benchmark, you will use partitioning, which is an enterprise feature. For details about requesting and setting a trial or full enterprise license, see [Enterprise Licensing](enterprise-licensing.html).

To add an enterprise license to your cluster once it is started, [use the built-in SQL client](use-the-built-in-sql-client.html) locally as follows:

1. On your local machine, launch the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

2. Add your enterprise license:

    {% include copy-clipboard.html %}
    ~~~ shell
    > SET CLUSTER SETTING enterprise.license = '<secret>';
    ~~~

3. Exit the interactive shell, using `\q` or `ctrl-d`.

### Step 3. Run a sample workload

CockroachDB offers a pre-built `workload` binary for Linux that includes several load generators for simulating client traffic against your cluster. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

2. SSH to VM 31, download `workload` and make it executable:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST | chmod 755 workload.LATEST
    ~~~

3. Rename and copy `workload` into the `PATH`:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp -i workload.LATEST /usr/local/bin/workload
    ~~~

4. Start the TPC-C workload, pointing it at the IP address of a node and including any [connection parameters](connection-parameters.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    $  ./workload.LATEST fixtures load tpcc \
    --warehouses=100000 \
    postgresql://root@<NODE 1 ADDRESS>:26257?sslmode=disable
    ~~~

    This command runs the TPC-C workload against the cluster. This will take at about an hour and loads 10,000 "warehouses" of data.

    {{site.data.alerts.callout_success}}
    For more `tpcc` options, use `workload run tpcc --help`. For details about other load generators included in `workload`, use `workload run --help`.
    {{site.data.alerts.end}}

4. To monitor the load generator's progress, follow along with the process on the **Admin UI > Jobs** table.

     Open the [Admin UI](admin-ui-access-and-navigate.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

### Step 4. Increase the snapshot rate

To [increase the snapshot rate](cluster-settings.html), which helps speed up this large-scale data movement:

1. Still on VM 31, launch the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

2. Set the cluster setting to increase the snapshot rate:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING kv.snapshot_rebalance.max_rate='64MiB';
    ~~~

3. Exit the interactive shell, using `\q` or `ctrl-d`.

### Step 5. Partition the database

Next, [partition your database](partitioning.html) to divide all of the TPC-C tables and indexes into ten partitions, one per rack, and then use [zone configurations](configure-replication-zones.html) to pin those partitions to a particular rack.

1. Still on VM 31, start the partitioning:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ulimit -n 10000 && workload.LATEST run tpcc \
    --partitions=10 \
    --split \
    --scatter \
    --warehouses=10000 \
    --duration=1s \
    "postgresql://root@<NODE 1 ADDRESS>:26257?sslmode=disable"
    ~~~

    Partitioning will take at least 12 hours. It takes this long because all of the data (over 2TB replicated for TPC-C-10K) needs to be moved to the right locations.

2. To watch the progress, follow along with the process on the **Admin UI > Metrics > Queues > Replication Queue** graph. Change the timeframe to **Last 10 Min** to view a more granular graph.

    Open the [Admin UI](admin-ui-access-and-navigate.html) by pointing a browser to the address in the `admin` field in the standard output of any node on startup.

    Once the Replication Queue gets to `0` for all actions and stays there, the cluster should be finished rebalancing and is ready for testing.

### Step 6. Run the benchmark

In a new terminal window, run `workload` for five minutes:

~~~ shell
$ ulimit -n 10000 && ./workload.LATEST run tpcc \
--warehouses=10000 \
--duration=300s \
"postgresql://root@<NODE 1 ADDRESS, NODE 2 ADDRESS, [...], NODE 30 ADDRESS>:26257?sslmode=disable"
~~~

### Step 7. Interpret the results

Once the `workload` has finished running, you should see a final output line similar to the output in [Benchmark a small cluster](#benchmark-a-small-cluster). The `tpmC` should be about 10x higher, reflecting the increase in the number of warehouses:

~~~ shell
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  300.0s    12713.6  98.9%    357.8     75.5    159.4   2415.9   6710.9   9663.7
~~~

You will also see some audit checks and latency statistics for each individual query. For this run, some of those checks might indicate that they were `SKIPPED` due to insufficient data. For a more comprehensive test, run `workload` for a longer duration (e.g., two hours). The `tpmC` (new order transactions/minute) number is the headline number and `efc` ("efficiency") tells you how close CockroachDB gets to theoretical maximum `tpmC`.

The [TPC-C specification](http://www.tpc.org/tpc_documents_current_versions/pdf/tpc-c_v5.11.0.pdf) has p90 latency requirements in the order of seconds, but as you see here, CockroachDB far surpasses that requirement with p90 latencies in the hundreds of milliseconds.

<!-- ## Roachprod directions for performance benchmarking on a large cluster

Use roachprod to create cluster: `roachprod create lauren-tpcc --gce-machine-type "n1-highcpu-16" --local-ssd --nodes 31`

Note: Since partitioning will take ~12hrs, you should extend your test cluster's lifetime (if you're using roachprod): `roachprod extend lauren-tpcc --lifetime=30h`

Download latest version of CockroachDB:

- `roachprod run lauren-tpcc 'wget https://binaries.cockroachdb.com/cockroach-v2.0.4.linux-amd64.tgz'`

- `roachprod run lauren-tpcc "curl https://binaries.cockroachdb.com/cockroach-v2.0.4.linux-amd64.tgz | tar -xvz; mv cockroach-v2.0.4.linux-amd64/cockroach cockroach"`

Configure SSD to be more performant: `roachprod run lauren-tpcc -- 'sudo umount /mnt/data1; sudo mount -o discard,defaults,nobarrier /dev/disk/by-id/google-local-ssd-0 /mnt/data1/; mount | grep /mnt/data1'`

Start the 30 nodes: `roachprod start lauren-tpcc:1-30`

Add license:

- `roachprod sql lauren-tpcc:1 -- -e "SET CLUSTER SETTING enterprise.license = '<secret>';"`

Run sample workload and RESTORE TPC-C data: `roachprod run lauren-tpcc:31 "wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST && chmod a+x workload.LATEST"`

Tell workload to load dataset to cluster: `roachprod run lauren-tpcc:31 "./workload.LATEST fixtures load tpcc {pgurl:1} --warehouses=10000"` (this will take about an hour)

Check on progress by navigating to the Admin UI > Jobs dashboard: `roachprod adminurl lauren-tpcc:1`

Once RESTORE is complete, set the snapshot cluster setting: `roachprod sql lauren-tpcc:1 -- -e "SET CLUSTER SETTING kv.snapshot_rebalance.max_rate='64MiB';"`

Partition the database: `roachprod ssh lauren-tpcc:31 "ulimit -n 10000 && ./workload.LATEST run tpcc --partitions=10 --split --scatter --warehouses=10000 --duration=1s {pgurl:1-30}"`

This will take ~12hrs. Once the Replication Queue (Admin UI) gets to `0` and stays there, the cluster should be finished rebalancing and is ready for testing.

To check that each range is correctly partitioned, use `SHOW testing_ranges FROM TABLE tpcc.new_order;` This will show you a table with the `RANGE ID` and `REPLICAS`. Once the `REPLICAS` column sorts itself (e.g., Range 1,2,3 Range 4,5,6 etc.), partitioning is done.

Run the benchmark: `roachprod run lauren-tpcc:31 "ulimit -n 10000 && ./workload.LATEST run tpcc --warehouses=10000 --duration=300s {pgurl:1-30}"`

OR `roachprod run lauren-tpcc:31 "./workload.LATEST run tpcc --ramp=30s --warehouses=10000 --duration=300s --split --scatter {pgurl:1-3}"`

Once the workload has finished running, you should see a final output line.-->

## See also

- [Benchmarking CockroachDB 2.0: A Performance Report](https://www.cockroachlabs.com/guides/cockroachdb-performance/)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Deploy CockroachDB on Digital Ocean](deploy-cockroachdb-on-digital-ocean.html)
