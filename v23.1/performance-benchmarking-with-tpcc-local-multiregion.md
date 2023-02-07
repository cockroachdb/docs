---
title: Performance Benchmarking with TPC-C
summary: Learn how to run the TPC-C benchmark against CockroachDB
toc: true
toc_not_nested: true
docs_area: reference.benchmarking
---

This page shows you how to reproduce [CockroachDB TPC-C performance benchmarking results](performance.html#scale). Across all scales, CockroachDB can process tpmC (new order transactions per minute) at near maximum efficiency. Start by choosing the scale you're interested in:

{% include {{ page.version.version }}/filter-tabs/perf-bench-tpc-c.md %}

| Workload                 | Cluster size                                                | Warehouses | Data size |
|--------------------------+-------------------------------------------------------------+------------+-----------|
| Local                    | 3 nodes on your laptop                                      | 10         | 2 GB      |
| Local (multi-region)     | 9 in-memory nodes on your laptop using `cockroach demo`     | 10         | 2 GB      |
| Small                    | 3 nodes on `c5d.4xlarge` machines                           | 2500       | 200 GB    |
| Medium                   | 15 nodes on `c5d.4xlarge` machines                          | 13,000     | 1.04 TB   |
| Large                    | 81 nodes on `c5d.9xlarge` machines                          | 140,000    | 11.2 TB   |

## Before you begin

- TPC-C provides the most realistic and objective measure for OLTP performance at various scale factors. Before you get started, consider reviewing [what TPC-C is and how it is measured](performance.html#tpc-c).

- Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

In the terminal, use the [`cockroach demo`](cockroach-demo.html) command to start a simulated multi-region cluster with 9 nodes:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --global --nodes 9 --no-example-database --insecure
~~~

This simulated multi-region deployment will take advantage of CockroachDB's [multi-region SQL statements](multiregion-overview.html) to deliver improved ease of use and performance.

{{site.data.alerts.callout_info}}
You must use the IP address shown at the SQL prompt to run the following steps.

This is necessary because the demo cluster may use a randomly allocated local IP that is not the `127.0.0.1` shown here.
{{site.data.alerts.end}}

## Step 2. Import the TPC-C dataset

CockroachDB comes with a number of [built-in workloads](cockroach-workload.html) for simulating client traffic. This step features CockroachDB's version of the [TPC-C](http://www.tpc.org/tpcc/) workload.

In a second terminal window (call it terminal 2), use [`cockroach workload`](cockroach-workload.html) to load the initial schema and data:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach workload init tpcc \
--warehouses=10 \
--partitions=3 \
--survival-goal zone \
--regions=europe-west1,us-east1,us-west1 \
'postgresql://root@127.0.0.1:26257/tpcc?sslmode=disable'
~~~

This will load 2 GB of data for 10 "warehouses", and spread the data across all 3 regions with a [`ZONE` survival goal](multiregion-overview.html#surviving-zone-failures).

## Step 3. Run the benchmark

Run the workload for 10 "warehouses" of data for ten minutes. In order to spread the simulated workload across the 3 regions specified in the previous step, you will need to start each of the following commands from 3 different terminals:

In terminal 2:

{% include_cached copy-clipboard.html %}
~~~ sql
cockroach workload run tpcc \
--warehouses=10 \
--duration=10m \
--wait=true \
--partitions=3 \
--partition-affinity=0 \
--tolerate-errors \
--survival-goal zone \
--regions=europe-west1,us-east1,us-west1 \
'postgresql://root@127.0.0.1:26257/tpcc?sslmode=disable'
~~~

In terminal 3:

{% include_cached copy-clipboard.html %}
~~~ sql
cockroach workload run tpcc \
--warehouses=10 \
--duration=10m \
--wait=true \
--partitions=3 \
--partition-affinity=1 \
--tolerate-errors \
--survival-goal zone \
--regions=europe-west1,us-east1,us-west1 \
'postgresql://root@127.0.0.1:26260/tpcc?sslmode=disable'
~~~

In terminal 4:

{% include_cached copy-clipboard.html %}
~~~ sql
cockroach workload run tpcc \
--warehouses=10 \
--duration=10m \
--wait=true \
--partitions=3 \
--partition-affinity=2 \
--tolerate-errors \
--survival-goal zone \
--regions=europe-west1,us-east1,us-west1 \
'postgresql://root@127.0.0.1:26263/tpcc?sslmode=disable'
~~~

You'll see per-operation statistics every second:

~~~
Initializing 20 connections...
Initializing 100 workers and preparing statements...
_elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
    1.0s        0            0.0            0.0      0.0      0.0      0.0      0.0 delivery
    1.0s        0            0.0            0.0      0.0      0.0      0.0      0.0 newOrder
...
  105.0s        0            0.0            0.2      0.0      0.0      0.0      0.0 delivery
  105.0s        0            4.0            1.8     44.0     46.1     46.1     46.1 newOrder
  105.0s        0            0.0            0.2      0.0      0.0      0.0      0.0 orderStatus
  105.0s        0            1.0            2.0     14.7     14.7     14.7     14.7 payment
  105.0s        0            0.0            0.2      0.0      0.0      0.0      0.0 stockLevel
...
~~~

{{site.data.alerts.callout_success}}
For more `tpcc` options, use `cockroach workload run tpcc --help`. For details about other built-in load generators, use `cockroach workload run --help`.
{{site.data.alerts.end}}

## Step 4. Interpret the results

Once the `workload` has finished running, you'll see a final output line in each terminal window.

In terminal 2:

~~~
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  600.0s       36.5  33.2%    170.6     44.0    536.9    872.4   1543.5   3087.0
~~~

In terminal 3:

~~~
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  600.0s       36.5  28.4%    147.0     41.9    453.0    671.1   1342.2   1946.2
~~~

In terminal 4:

~~~
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  600.0s       36.5  28.4%    222.8     46.1    704.6   1140.9   1744.8   2952.8
~~~

You will also see some audit checks and latency statistics for each individual query in each terminal. Some of those checks might indicate that they were `SKIPPED` due to insufficient data since this is a small run on a small machine. For a more comprehensive test, run `workload` for a longer duration (e.g., two hours). The `tpmC` (new order transactions/minute) number is the headline number and `efc` ("efficiency") tells you how close CockroachDB gets to theoretical maximum `tpmC`.  In a perfect execution, the sum of efficiency across all partitions would be 100%.

## Step 5. Clean up

When you're done with your test cluster, switch back to terminal 1 where [`cockroach demo`](cockroach-demo.html) is still running and issue `\q` at the SQL prompt to gracefully shut down the demo cluster.

{% include_cached copy-clipboard.html %}
~~~ sql
\q
~~~
