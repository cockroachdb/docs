---
title: Serverless Performance Benchmarking
summary: Learn more about CockroachCloud Serverless performance benchmarks
toc: true
---

This page describes {{ site.data.products.serverless }} performance benchmarking with a KV workload.

## Topology 

The host cluster used was an AWS 3-node cluster using r5.4xlarge (the same type used for production host clusters). We can't create GCP
clusters right now so can’t test there.

The workload client was cockroach workload run kv

The first parameter that was varied between runs was executing the client
remotely from the cluster (40 ms latency) vs executing it locally on the proxy pod

I also tried running the workload with different % of reads vs writes. I tried 0% reads, 95% reads and 100% reads.

Also varried the number of concurrent connections from the client to the server. I tried 1, 12 and 72.

Also tried the test against low trust (limit 0.3 vCPUs and 1.5GB mem) and high trust (limit 4 vCPUs and 8GB mem) pools to see the effect of the pod limits. The usage limits are not implemented yet so we can’t test.

The RU usage was determined by monitoring the metrics provided by each of the host cluster nodes. These get updated every 10 seconds.

## Results 

The first observation that came out of the test is that there is an idle RU consumption that is between 2 and 11 RUs/sec and varies slightly each period. Andy mentioned that this is a known problem that we will try to fix. I tried to adjust the numbers a bit based on that but it is hard to be exact.

The overall test results show a fairly stable cost of approx 1.15 RU per KV95 operation. Measured separately, a read costs 1.13 RU while a write costs 1.65 RU.
I tried adjusting the number slightly, accounting for the phantom continuous RU use. This only matters under light load were it is a bit more significant.

Running the workload client locally (on the proxy pod) against a low trust pod using 12 connections (the default) yields 717 KV95 operations/sec
which seems to be the maximum that a low trust pod can handle. So 12 connections gets the maximum ops/sec possible and increasing the connections doesn't increase the ops/sec further.
Same workload ran remotely (~40 ms latency) with 12 connections, yields only 318 ops/sec and requires several times more connections to get to the maximum of 709 ops/sec.

A high trust pod seems to be reaching a maximum of around 1080 KV95 ops/sec. Similarly to the low trust case, the remote workload only gets to 300 ops/sec with 12 connections and requires few times more to get to the maximum. Locally, 12 connections are close to saturating the pod and yield 960 KV95 ops/sec. The overall limitation in this case may be due to the KV limits set as host cluster settings per tenant.

<img src="{{ 'images/cockroachcloud/serverless-performance.png' | relative_url }}" alt="Serverless performance" style="max-width:100%" />