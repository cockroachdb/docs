---
title: Performance Benchmarking with TPC-C
summary: Learn how to benchmark CockroachDB against TPC-C 13k on 3 nodes on your laptop
toc: true
toc_not_nested: true
redirect_from:
- performance-benchmarking-with-tpc-c-10-warehouses.html
---

This page shows you how to reproduce [CockroachDB's TPC-C performance benchmarking results](performance.html#scale) on commodity AWS hardware. Across all scales, CockroachDB can process tpmC (new order transactions per minute) at near maximum efficiency. Start by choosing the scale you're interested in:

<div class="filters filters-big clearfix">
  <button class="filter-button current"><strong>Local</strong></button>
  <a href="performance-benchmarking-with-tpcc-small.html"><button class="filter-button">Small</button></a>
  <a href="performance-benchmarking-with-tpcc-medium.html"><button class="filter-button">Medium</button></a>
  <a href="performance-benchmarking-with-tpcc-large.html"><button class="filter-button">Large</button></a>
</div>

| Workload | Cluster size                       | Warehouses | Data size |
|----------+------------------------------------+------------+-----------|
| Local    | 3 nodes on your laptop             | 10         | 2 GB      |
| Small    | 3 nodes on `c5d.4xlarge` machines  | 2500       | 200 GB    |
| Medium   | 15 nodes on `c5d.4xlarge` machines | 13,000     | 1.04 TB   |
| Large    | 81 nodes on `c5d.9xlarge` machines | 140,000    | 11.2 TB   |

## Before you begin

- TPC-C provides the most realistic and objective measure for OLTP performance at various scale factors. Before you get started, consider reviewing [what TPC-C is and how it is measured](performance.html#tpc-c).

- Make sure you have already [installed CockroachDB](install-cockroachdb.html).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

1. Use the [`cockroach start`](cockroach-start.html) command to start 3 nodes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=tpcc-local1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=tpcc-local2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=tpcc-local3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259 \
    --background
    ~~~

2. Use the [`cockroach init`](cockroach-init.html) command to perform a one-time initialization of the cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach init \
    --insecure \
    --host=localhost:26257
    ~~~

## Step 2. Import the TPC-C dataset

CockroachDB comes with built-in load generators for simulating different types of client workloads, printing out per-operation statistics every second and totals after a specific duration or max number of operations. This step features CockroachDB's version of the TPC-C workload.

Use [`cockroach workload`](cockroach-workload.html) to load the initial schema and data:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach workload init tpcc \
--warehouses=10 \
'postgresql://root@localhost:26257?sslmode=disable'
~~~

This will take about ten minutes to load, after which you'll see the following output:

~~~
I191024 03:41:34.308865 1 workload/workloadsql/dataload.go:135  imported warehouse (0s, 10 rows)
I191024 03:41:34.353839 1 workload/workloadsql/dataload.go:135  imported district (0s, 100 rows)
I191024 03:42:00.865733 1 workload/workloadsql/dataload.go:135  imported customer (27s, 300000 rows)
I191024 03:42:13.233536 1 workload/workloadsql/dataload.go:135  imported history (12s, 300000 rows)
I191024 03:42:20.893806 1 workload/workloadsql/dataload.go:135  imported order (8s, 300000 rows)
I191024 03:42:21.716409 1 workload/workloadsql/dataload.go:135  imported new_order (1s, 90000 rows)
I191024 03:42:23.483713 1 workload/workloadsql/dataload.go:135  imported item (2s, 100000 rows)
I191024 03:43:37.660918 1 workload/workloadsql/dataload.go:135  imported stock (1m14s, 1000000 rows)
I191024 03:46:51.682670 1 workload/workloadsql/dataload.go:135  imported order_line (3m14s, 3001222 rows)
~~~

## Step 3. Run the benchmark

Run the workload for ten "warehouses" of data for ten minutes:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach workload run tpcc \
--warehouses=10 \
--ramp=3m \
--duration=10m \
'postgresql://root@localhost:26257?sslmode=disable'
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

Once the `workload` has finished running, you'll see a final output line:

~~~
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  300.0s      121.6  94.6%     41.0     39.8     54.5     71.3     96.5    130.0
~~~

You will also see some audit checks and latency statistics for each individual query. For this run, some of those checks might indicate that they were `SKIPPED` due to insufficient data. For a more comprehensive test, run `workload` for a longer duration (e.g., two hours). The `tpmC` (new order transactions/minute) number is the headline number and `efc` ("efficiency") tells you how close CockroachDB gets to theoretical maximum `tpmC`.

The [TPC-C specification](http://www.tpc.org/tpc_documents_current_versions/pdf/tpc-c_v5.11.0.pdf) has p90 latency requirements in the order of seconds, but as you see here, CockroachDB far surpasses that requirement with p90 latencies in the tens of milliseconds.

## Step 5. Clean up

1. When you're done with your test cluster, use the [`cockroach quit`](cockroach-quit.html) command to gracefully shut down each node.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26257
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26258
    ~~~

    {{site.data.alerts.callout_info}}
    For the last node, the shutdown process will take longer (about a minute each) and will eventually force the node to stop. This is because, with only 1 of 3 nodes left, all ranges no longer have a majority of replicas available, and so the cluster is no longer operational.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach quit --insecure --host=localhost:26259
    ~~~

2. To restart the cluster at a later time, run the same `cockroach start` commands as earlier from the directory containing the nodes' data stores.  

    If you do not plan to restart the cluster, you may want to remove the nodes' data stores:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -rf tpcc-local1 tpcc-local2 tpcc-local3
    ~~~
