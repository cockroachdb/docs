---
title: CockroachDB Performance Benchmarking
summary: TBD
toc: true
---
This page provides an overview of CockroachDB's performance on industry-standard benchmarks like TPC-C and Sysbench.

{{site.data.alerts.callout_success}}
If you are looking for specific information on optimizing SQL performance see this overview  on [SQL Performance Best Practices](performance-best-practices-overview.md) or see this [Performance Tuning Guide](performance-tuning.html). For guidance on deployment and data location techniques to minimize network latency, see [Topology Patterns](topology-patterns.html).
{{site.data.alerts.end}}

We’ve tested CockroachDB extensively in public and private clouds and observed predictable scale, throughput, latency, and concurrency at all cluster sizes.

**If you fail to achieve the performance profiles listed below, there is likely a problem in either the hardware, workload, or test design. We stand by these profile characteristics and provide reproduction steps for all published benchmarks.**

## Scale
###TPC-C
Cockroach Labs measures performance through many diverse tests, including the [industry-standard OLTP benchmark TPC-C](http://www.tpc.org/tpcc/), which simulates an e-commerce or retail company.

TPC-C is old, but it has withstood the test of time. Despite being created in 1992, it’s still the most mature and relevant industry standard measure for OLTP workloads. In its own words, TPC-C:

>“…involves a mix of five concurrent transactions of different types and complexity either executed on-line or queued for deferred execution. The database is comprised of nine types of tables with a wide range of record and population sizes. While the benchmark portrays the activity of a wholesale supplier, TPC-C is not limited to the activity of any particular business segment, but, rather represents any industry that must manage, sell, or distribute a product or service.”

As a result, TPC-C includes create, read, update, and delete (e.g., CRUD) queries, basic joins, and other SQL statements used to administer mission-critical transactional workloads. It includes detailed specifications for concurrency and workload contention. **TPC-C is the only objective comparison for evaluating OLTP performance.**

TPC-C measures the throughput and latency for processing sales through a customer warehouse using a “business throughput” metric called **tpmC** that measures the number of order transactions performed per minute throughout the system.

In fact, tpmC is a considerably more realistic metric than TPS or QPS alone because it summarizes multiple transactions per order and accounts for failed transactions. TPC-C also has several latency requirements that apply to median, p90, and max latencies.

Finally, TPC-C specifies restrictions on the maximum throughput achievable per warehouse. This is done to ensure that as a system becomes progressively more capable of throughput, it must also deal with progressively more data. This is how things work in the real world, and it makes little sense to say that your database can process a bazillion transactions per second if it’s processing the same data over and over again.

Because TPC-C is constrained to a maximum amount of throughput per warehouse, we often discuss TPC-C performance as the **maximum number of warehouses for which a database can maintain the maximum throughput.** For a full description of the benchmark, please consult the [official documentation](http://www.tpc.org/tpc_documents_current_versions/current_specifications.asp).

### TPC-C 50K
<img src="{{ 'images/v19.2/tpcc50k.png' | relative_url }}" alt="TPC-C 50,000" style="max-width:100%" />

~~~
                                      | CockroachDB       | Amazon Aurora   |
+-------------------------------------+-------------------+-----------------+
  Max Throughput                      | 631851 tpmC       | 12582 tpmC      |
  Max Warehouses with Max Efficiency  | 50000 Warehouses  | 1000 Warehouses |
  Max Number of Rows                  | 24.9B             | 0.499B          |
  Max Unreplicated Data               | 4TB               | 0.08TB          |
  Machine type                        | c5d.4xlarge       | r3.8xl          |
~~~   

CockroachDB can hit an incredible 631K tpmC with 50,000 warehouses! We achieved these results at 98% of the max possible efficiency for TPC-C 50k.

We compared our unofficial TPC-C results to Amazon Aurora RDS unofficial TPC-C results from AWS re:Invent 2017. We also used Aurora’s SIGMOD 2017 paper for additional information as to their test setup and load generator.

As such, based upon their last published metrics, CockroachDB is now 50 times more scalable than Amazon Aurora, supporting 25 billion rows and more than 4 terabytes of frequently accessed data.

Unlike Amazon Aurora, CockroachDB achieves this performance in `SERIALIZABLE` isolation, the strongest isolation mode in the SQL standard. Like many other databases, Aurora selectively degrades isolation levels for performance, leaving workloads susceptible to fraud and data loss.

To learn more about the comparison with Amazon Aurora [click here](https://www.cockroachlabs.com/blog/cockroachdb-2dot1-performance/).

To try this out for yourself on your laptop [visit this docs page](https://www.cockroachlabs.com/docs/v19.1/training/performance-benchmarking.html#main-content). Or, if you want to reproduce the full results of TPC-C [visit this page](https://www.cockroachlabs.com/guides/cockroachdb-performance/).

### Linear Scale
CockroachDB has **no theoretical limit** to scaling throughput or the number of nodes. Practically, we can provide near-linear performance passed more than 256 nodes.

Another way to measure scale is to compare what happens to throughput and latency as we increase the number of nodes. We ran a simple benchmark named KV 95 (95% point reads, 5% point writes, all uniformly distributed) on an increasing number of nodes to demonstrate that adding nodes increases throughput linearly while holding p50 and p99 latency constant.

<img src="{{ 'images/v19.2/linearscale.png' | relative_url }}" alt="CRDB Linear Scale" style="max-width:100%" />

This chart shows linear performance for CRDB as we scale out the number of nodes when running KV 95. We chose KV 95 for this chart because it is easier to see the relationship between the number throughput and the number of nodes. We used AWS C5D.4xlarge nodes to run these numbers. CockroachDB can scale horizontally (e.g., number of nodes) or vertically (e.g., size of CPU per node). We prefer benchmarks like TPC-C because they offer the complex reads and writes that we think reflect our customer's OLTP workloads.

##Sysbench
Sysbench is a popular tool that allows for basic throughput and latency testing. We prefer the more complex TPC-C, as discussed above, but believe Sysbench is a reasonable alternative for understanding basic throughput and latency across different databases. We will provide forthcoming instructions for how to benchmark using Sysbench. In the meantime, know that the numbers below were generated from a three-node cluster of AWS c5d.9xlarge VMs run across AWS’s us-east-1 region (availability zones a, b, and c) against Sysbench’s oltp_insert and oltp_point_select workloads.

###Throughput
We measure throughput as transactions per unit of time.

In the real world, applications generate transactional workloads which consist of a combination of reads and writes, possibly with concurrency and likely without all data being loaded into memory. If you see benchmark results quoted in QPS, take them with a grain of salt, because anything as simple as a “query” is unlikely to be representative of the workload you need to run in practice. For Sysbench, we can achieve 118,000 inserts per second on the oltp_insert workload and 336,000 reads per second on the oltp_point_select workload.


<img src="{{ 'images/v19.2/sysbench-throughput.png' | relative_url }}" alt="Sysbench Throughput" style="max-width:100%" />

### Latency
Latency, measured in milliseconds (ms), is usually distinguished as either read or write latencies depending upon the transaction.

It’s important to note that it is not sufficient to evaluate the median latency. We must also understand the distribution, including tail performance, because these latencies occur frequently in production applications. This means that we must look critically at 95th percentile (p95) and 99th percentile (p99) latencies. Unlike TPC-C, for Sysbench, latency is reported only in average ms. We achieve an average of 4.3 ms in the oltp_insert workload and 0.7 ms in the oltp_point_select workload.

<img src="{{ 'images/v19.2/sysbench-latency.png' | relative_url }}" alt="Sysbench Latency" style="max-width:100%" />

####1 ms reads
CockroachDB returns single-row **reads in 1 ms or less**. We provide a number of important optimizations for both single-region and multi-region read performance including Secondary Indexes and Follower Reads.

####2 ms writes
CockroachDB processes single-row **writes in 2 ms or less**, and supports a variety of SQL and operational tuning practices for optimizing query performance.

## Hardware
CockroachDB works well on commodity hardware. We are cloud-native and built to be cloud-agnostic. You can use CockroachDB with Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure, Digital Ocean, Rackspace, or any other provider. You can also use CockroachDB with private on-premise datacenters and we have many customers that even mix public and private clouds! You can find more information on hardware recommendations on our [Hardware page](https://www.cockroachlabs.com/docs/v19.1/recommended-production-settings.html#hardware).

CockroachDB creates a yearly cloud report focused on evaluating hardware performance. In November 2019, we will provide metrics on AWS, GCP, and Azure. In the meantime, you can read the [2018 Cloud Report](https://www.cockroachlabs.com/blog/2018_cloud_report/) that focuses on AWS and GCP.

## Workload Specific Performance
This document is about CockroachDB’s performance on benchmarks. For information about how to tune query performance, design your topology pattern, or otherwise improve performance on your workload, please consult our broader documentation on [SQL Performance Best Practices](performance-best-practices-overview.md), [Performance Tuning](performance-tuning.html), or for guidance on deployment and data location techniques to minimize network latency, see our [Topology Patterns Guide](topology-patterns.html).

## Known Limitations
CockroachDB has no theoretical limitations to scaling, throughput, latency, or concurrency other than the speed of light. Practically, we will be improving bottlenecks and addressing challenges over the next several releases. In the meantime, we want you to be aware of the following known limitations.

- CockroachDB is not yet suitable for heavy analytics / OLAP.
- CockroachDB has not yet been tested beyond 256 nodes, however, we know of no known limitations to horizontal scaling 
- While CockroachDB supports SERIAL and sequential keys they can create hotspots within CockroachDB. We recommend using UUIDs or other methods to avoid writing to sequential keys
- CockroachDB is optimized for good performance with rotational disk drives when using the durable memory storage engine. It is not recommended that you run with rotational HDDs when using the ssd storage engine.
