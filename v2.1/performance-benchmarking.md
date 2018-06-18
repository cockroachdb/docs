---
title: Performance Benchmarking
summary: Learn how to benchmark CockroachDB against TPC-C.
toc: false
---

This page walks you through TPC-C performance benchmarking CockroachDB. It measures tpmC on two TPC-C datasets:

- 1,000 warehouses (for a total dataset size of 200GB) on three nodes
- 10,000 warehouses (for a total dataset size of 2TB) on thirty nodes

These two points on the spectrum show how CockroachDB scales from modest sized production workloads to larger scale deployments. This demonstrates how CockroachDB achieves high OLTP performance over 128,000 tpmC on a TPC-C dataset over 2TB in size.

<div id="toc"></div>

## Before you begin

- Download [roachprod](https://github.com/cockroachdb/roachprod), CockroachDB's orchestration tool for quickly spinning up virtual machines on Google Compute Engine and running CockroachDB:

    `go get -u github.com/cockroachdb/roachprod`

    While the following tutorial uses `roachprod`, you can adapt the instructions to any cloud or on-premise cluster.

- Set up the Google Cloud command line tool, [gcloud](https://cloud.google.com/sdk/install). Set up a Google Cloud project, and set your `GCE_PROJECT` environment variable to your chosen project.

## Benchmark a small cluster

### Step 1. Create a 4-node cluster

Create a 4-node cluster (i.e., 3 for the database, 1 for the load generator). For this tutorial, we'll name our cluster `lauren-tpcc`:

{% include copy-clipboard.html %}
~~~ shell
$ roachprod create lauren-tpcc --gce-machine-type "n1-highcpu-16" --local-ssd --nodes 4
~~~

For our TPC-C benchmarking, we use `n1-highcpu-16` machines. Currently, we believe this (or higher vCPU count machines) is the best configuration for CockroachDB under high traffic scenarios. We also attach a single local SSD to each virtual machine. Local SSDs are low latency disks attached to each VM, as opposed to networked block storage, which maximizes performance.

We chose this configuration because it best resembles what a bare metal deployment would look like, with machines directly connected to one physical disk each (as opposed to network- attached replicated block storage).

{{site.data.alerts.callout_danger}}
If you are following this deployment for production in the cloud, ensure that you spread your nodes across at least three availability zones and set the CockroachDB zone configuration to spread replicas across zones. Local SSDs on Cloud VMs can lose data if the VM is lost, so it is important that CockroachDB can automatically recover from the loss of any single zone’s disks. `roachprod` does not spread VMs across availability zones, but your production deployment should.
{{site.data.alerts.end}}

### Step 2. Download the latest version of CockroachDB on all nodes

{% include copy-clipboard.html %}
~~~ shell
$ roachprod run lauren-tpcc 'wget https://binaries.cockroachdb.com/cockroach-v2.1.0-alpha.20180604.linux-amd64.tgz'
~~~

{% include copy-clipboard.html %}
~~~ shell

$ roachprod run lauren-tpcc "curl https://binaries.cockroachdb.com/cockroach-v2.1.0-alpha.20180604.linux-amd64.tgz | tar -xvz; mv cockroach-v2.1.0-alpha.20180604.linux-amd64/cockroach cockroach"
~~~

### Step 3. Set up the cluster for production use (Optional)

At this point, your VMs need to be modified for optimal production performance.

{{site.data.alerts.callout_danger}}
This tutorial's settings have been chosen to mimic an enterprise bare-metal deployment as much as possible and are **not safe** unless you are running on battery-backed enterprise SSDs that guarantee write durability even under the event of power loss.

If you are using this deployment on a public cloud, you should configure your machines to span three availability zones, and [set the CockroachDB zone configuration](configure-replication-zones.html) to spread replicas across all zones.
{{site.data.alerts.end}}

### Step 4. Start the cluster

Now, log into your cluster. `roachprod` makes this easy, with the following command:

{% include copy-clipboard.html %}
~~~ shell
$ roachprod run lauren-tpcc -- 'sudo umount /mnt/data1; sudo mount -o discard,defaults,nobarrier /dev/disk/by-id/google-local-ssd-0 /mnt/data1/; mount | grep /mnt/data1'
~~~

Start your three nodes:

{% include copy-clipboard.html %}
~~~ shell
$ roachprod start lauren-tpcc:1-3
~~~

### Step 5. Add an enterprise license

Benchmarking is greatly sped up by using the enterprise [`RESTORE`](restore.html) feature, rather than creating the fixtures manually. You can obtain an [enterprise evaluation 30-day license](https://www.cockroachlabs.com/pricing/start-trial/) and do an enterprise restore of the TPC-C dataset. To configure the cluster with your credentials:

1. Open the CockroachDB SQL shell and enter the following:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ roachprod sql lauren-tpcc:1
    ~~~

2. Add your enterprise license:

    {% include copy-clipboard.html %}
    ~~~ shell
    > Set CLUSTER SETTING enterprise.license = '<secret>'
    ~~~

3. Exit the interactive shell, using `\q` or `ctrl-d`.

### Step 4. Run a sample workload and `RESTORE` the TPC-C dataset

CockroachDB offers a pre-built workload binary for Linux that includes several load generators for simulating client traffic against your cluster. This step features CockroachDB's version of the TPC-C workload.

1. Download the most recent version of CockroachDB `workload` tool on the load generator node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ roachprod run lauren-tpcc:4 "wget https://edge-binaries.cockroachdb.com/cockroach/workload.LATEST && chmod a+x workload.LATEST"
    ~~~

2. Tell `workload` to load the dataset into your `roachprod` cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ roachprod run lauren-tpcc:4 "./workload.LATEST fixtures load tpcc {pgurl:1} --warehouses=1000"
    ~~~

    This will take about one hour.

3. Follow along with the process on the Admin UI > **Jobs** table. To get the Admin UI URL, open a new terminal window and enter:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ roachprod adminurl lauren-tpcc:1
    ~~~

4. In the Admin UI, navigate to the **Jobs** dashboard. TPC-C has nine tables and you will see estimates for each table's completion time to fully `RESTORE`.


### Step 5. Run the benchmark

Once the `RESTORE` is complete, run the load generator for five minutes in a new terminal window:

~~~ shell
$ roachprod run lauren-tpcc:4 "./workload.LATEST run tpcc --ramp=30s --warehouses=1000 --duration=300s --split --scatter {pgurl:1-3}"
~~~

This command runs the benchmark using all three CockroachDB nodes as gateways. In production, you can hide this behind a [load balancer](deploy-cockroachdb-on-digital-ocean.html#step-3-set-up-load-balancing). Note that if you only use a subset (or one) of the machines, your data will still be replicated across the cluster and remain durable in the event of the loss of a machine. You will not, however, get optimal performance, as all queries will go through the specified subset of the machines.

### Step 6. Interpret the results

Once the `workload` has finished running, you should see a final output line:

~~~ shell
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  298.8s    13149.8 102.3%    108.4    100.7    176.2    201.3    285.2    604.0
~~~

You will also see some audit checks and latency statistics for each individual query. For this run, some of those checks might indicate that they were `SKIPPED` due to insufficient data. For a more comprehensive test, run `workload` for a longer duration (e.g., two hours). The `tpmC` number is the headline number and `efc`, or "efficiency," tells you how close CockroachDB gets to theoretical maximum `tpmC`.

The TPC-C specification has p90 latency requirements on the order of seconds, but as you see here, CockroachDB far surpasses that requirement with p90 latencies in the hundreds of milliseconds.


## See also

- [Benchmarking CockroachDB 2.0: A Performance Report](https://www.cockroachlabs.com/guides/cockroachdb-performance/)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Deploy CockroachDB on Digital Ocean](deploy-cockroachdb-on-digital-ocean.html)
