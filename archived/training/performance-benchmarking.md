---
title: Performance Benchmarking with TPC-C
summary: Learn how to benchmark CockroachDB against TPC-C.
toc: true
toc_not_nested: true
sidebar_data: sidebar-data-training.json
---

This lab walks you through [TPC-C](http://www.tpc.org/tpcc/) performance benchmarking on CockroachDB. It measures tpmC (new order transactions/minute) on a TPC-C dataset of 10 warehouses (for a total dataset size of 2GB) on 3 nodes.

{{site.data.alerts.callout_info}}
For training purposes, the dataset used in this lab is small. For instructions on how to benchmark with a larger dataset, see [Performance Benchmarking with TPC-C](../performance-benchmarking-with-tpc-c-1k-warehouses.html).
{{site.data.alerts.end}}

## Before you begin

In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

## Step 1. Start a 3-node cluster

Start and initialize a cluster like you did in previous modules.

{{site.data.alerts.callout_info}}
To simplify the process of running multiple nodes on your local computer, you'll start them in the [background](../cockroach-start.html#general) instead of in separate terminals.
{{site.data.alerts.end}}

1. In a new terminal, start node 1:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node1 \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259,localhost:26260 \
    --background
    ~~~~

2. Perform a one-time initialization of the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach init --insecure --host=localhost:26257
    ~~~

3. Start node 2:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259,localhost:26260 \
    --background
    ~~~

4. Start node 3:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259,localhost:26260 \
    --background
    ~~~

5. Start node 4, which will be used to run the TPC-C benchmark:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node4 \
    --listen-addr=localhost:26260 \
    --http-addr=localhost:8083 \
    --join=localhost:26257,localhost:26258,localhost:26259,localhost:26260 \
    --background
    ~~~

{{site.data.alerts.callout_danger}}
This configuration is intended for training and performance benchmarking only. For production deployments, there are other important considerations, such as ensuring that data is balanced across at least three availability zones for resiliency. See the [Production Checklist](../recommended-production-settings.html) for more details.
{{site.data.alerts.end}}

## Step 3. Load data for the benchmark

CockroachDB comes with built-in load generators for simulating different types of client workloads, printing out per-operation statistics every second and totals after a specific duration or max number of operations. This step features CockroachDB's version of the TPC-C workload.

On the fourth node, use `cockroach workload` to load the initial schema and data:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach workload init tpcc \
--warehouses=10 \
'postgresql://root@localhost:26260?sslmode=disable'
~~~

This will take about ten minutes to load.

{{site.data.alerts.callout_success}}
For more `tpcc` options, use `workload run tpcc --help`. For details about other load generators included in `workload`, use `workload run --help`.
{{site.data.alerts.end}}

## Step 4. Run the benchmark

Run the workload for ten "warehouses" of data for five minutes (300 seconds):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach workload run tpcc \
--warehouses=10 \
--ramp=30s \
--duration=300s \
--split \
--scatter \
'postgresql://root@localhost:26260?sslmode=disable'
~~~

## Step 5. Interpret the results

Once the `workload` has finished running, you should see a final output line:

~~~ shell
_elapsed_______tpmC____efc__avg(ms)__p50(ms)__p90(ms)__p95(ms)__p99(ms)_pMax(ms)
  300.0s      120.8  93.9%     52.9     48.2     75.5     96.5    134.2    243.3
~~~

You will also see some audit checks and latency statistics for each individual query. For this run, some of those checks might indicate that they were `SKIPPED` due to insufficient data. For a more comprehensive test, run `workload` for a longer duration (e.g., two hours). The `tpmC` (new order transactions/minute) number is the headline number and `efc` ("efficiency") tells you how close CockroachDB gets to theoretical maximum `tpmC`.

The [TPC-C specification](http://www.tpc.org/tpc_documents_current_versions/pdf/tpc-c_v5.11.0.pdf) has p90 latency requirements in the order of seconds, but as you see here, CockroachDB far surpasses that requirement with p90 latencies in the hundreds of milliseconds.

## Step 6. Clean up

In the next module, you'll start with a fresh cluster, so take a moment to clean things up.

1. Exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

2. Stop all CockroachDB nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ pkill -9 cockroach
    ~~~

    This simplified shutdown process is only appropriate for a lab/evaluation scenario.

3. Remove the nodes' data directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf node1 node2 node3 node4
    ~~~

## What's next?

[Data Import](data-import.html)
