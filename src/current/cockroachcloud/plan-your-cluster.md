---
title: Plan a CockroachDB {{ site.data.products.standard }} Cluster [WIP]
summary: Plan your cluster's configuration.
toc: true
docs_area: deploy
cloud: true
---

{% include cockroachcloud/filter-tabs/plan-your-cluster.md %}

This page describes how resource usage, pricing, and cluster configurations work in CockroachDB {{ site.data.products.standard }}. For information on diagnosing and optimizing your resource consumption, see [Optimize your Resource Usage]({% link cockroachcloud/resource-usage.md %}).

# Capacity (Compute) resources

The *compute* resources available to Standard clusters are provisioned and scaled using a *provisioned capacity* model based on *vCPUs* as the unit of measurement. The amount of capacity required for a Standard cluster is entirely dependent on the scale and query profile of the workload, and may change over time as the workload evolves. Note that *storage capacity* in Standard is allocated as needed for the current data volume, so it is not covered here under capacity provisioning. See section [Estimating storage pricing for Standard clusters below](\#estimating-storage-pricing-for-standard-clusters).

It’s typical to roughly estimate the compute capacity needed for a workload before creating the Standard cluster and then easily adjust that capacity up or down based on observing the actual compute capacity consumed by the workload.

## Quick start: Provisioning and adjusting capacity
<a id="provisioned-capacity"></a>

Use this section as the easiest way to arrive at the right capacity for your CockroachDB {{ site.data.products.standard }} deployment. Because each workload is different, it is difficult to estimate the required capacity up front. So we recommend starting with a rough estimate and then using the easy scaling capability of Standard to adjust capacity based on workload performance as it evolves.

### Step 1: Estimating initial cluster compute capacity

Follow these steps to achieve a rough initial estimate of compute capacity provisioning for CockroachDB {{ site.data.products.standard }}:

1. **Expected workload maximum** \- Estimate the maximum expected long-term workload compute consumption as measured by the number of vCPUs consumed:  
   1. If your workload is already running on another form of CockroachDB, use the current total number of vCPUs (across all nodes and regions) as the initial configured value for the number of vCPUs in your Standard cluster.  
   2. If the workload has previously run on another DBMS, extrapolate from its historical vCPU consumption  
   3. [Talk to an expert](https://www.cockroachlabs.com/contact/).. Our engineers will work with you to understand the resource demands of your specific workload and help you estimate required capacity.

2. **Additional capacity buffer** \- Add additional capacity as a buffer to accommodate unanticipated load and mitigate risk of application degradation if provisioned capacity is exceeded. We recommend 40% buffer capacity on top of the expected workload max.

3. **For multi-region deployments** \- The provisioned capacity of your Standard cluster applies to the entire cluster regardless of the number of regions or regional topography. The provisioned capacity acts as an overall budget that can be drawn from by any region depending on its current compute demand, making it easier to operate multi-region deployments in CockroachDB {{ site.data.products.standard }}.

4. **Configure initial capacity and create the cluster** \- Once the initial estimate has been determined, configure the cluster's initial provisioned capacity during cluster creation via the [Console UI](http://cockroachlabs.cloud) or via the [CockroachDB Terraform provider](https://registry.terraform.io/providers/cockroachdb/cockroach/latest).

### Step 2: Altering provisioned capacity for existing clusters by scaling up or down

\<TODO\>

## Comprehensive guide: Understanding CockroachDB {{ site.data.products.standard }} capacity

We recommend using Quick start: Provisioning and adjusting capacity as the most straightforward and accurate way to arrive at the best initial Standard cluster capacity for your workload and maintain the right capacity as the workload evolves. 

The Quick start approach involves using a rough estimate initially, observing actual performance, and then making adjustments to refine the original estimate. If you want to pursue a more rigorous initial estimate in the context of evaluating whether Standard or Advanced is the right fit for your workload, the following sections are designed to help you.

### Standard and Advanced have equivalent performance *on average* but not for every workload

Standard and Advanced are designed to be as interchangeable as possible in terms of compute capacity and operational features. See the [feature comparison table](http://cockroachlabs.com/pricing) for detailed explanation of feature differences between the two products. While consistency across the two products is the goal, the two are based on different computational platforms and may differ considerably in terms of their compute requirements *depending on the workload*.

* **Equivalence *on average*** \- Standard vCPUs and Advanced vCPUs have equivalent compute performance averaged across all workloads  
* **Highly variable with workload** \- while equivalent on average, the vCPU performance comparison between Standard and Advanced varies significantly with the workload. There are two factors driving this variance:  
  * *Workloads are unpredictable* \- OLTP workloads are remarkably diverse in their resources utilization across industries and applications  
  * *Architectural differences* \- Standard and Advanced are built on different underlying CockroachDB deployment architectures that have different performance characteristics

### Standard vCPUs are priced at 60% of Advanced vCPUs

The pricing per-vCPUs does not depend in any way on the workload. Standard vCPUs are priced at 60% of the price of Advanced vCPUs, with some slight variations depending on the cloud provider and region. Since vCPUs are equivalent between Standard and Advanced on average, both plans require the same number of vCPUs on average, so total cluster cost for Standard is 60% of Advanced *on average*.

But workloads may vary significantly from the average, so the estimation challenge is one of predicting the actual number of vCPUs a workload may require, regardless of whether you’re considering Standard or Advanced.

### Comparing total cluster vCPU capacity cost between Standard and Advanced

Given that Standard vCPUs are priced at 60% of Advanced vCPUs, estimating the cost of a workload on Standard as compared to Advanced means estimating the difference in number of vCPUs required between the two plans. For some workloads, Standard requires higher vCPU capacity, for others Advanced, depending on the properties of the workload and how the different underlying CockroachDB deployment architectures provide resources to that workload.

### vCPU capacity ranges based on Cockroach Labs testing

In our internal testing, running a wide range of workloads on both Standard and Advanced, we’ve seen the following results:

Outcome: For 75% of all all tested workloads, the required Standard total cluster cost (in $ per month) is within 40% \- 70% of the total Advanced cluster cost (in $ per month).

The following histogram provides more detail on the test outcomes.  
![][image3]

## Examples and Benchmarks for vCPU Capacity

Comparing relative CPU utilization for several benchmarks. Understanding the results below:

### TPC-C

[TPC](https://www.tpc.org/tpcc/) is an industry standard performance benchmark for OLTP workloads.

|  | Standard vCPUs | Advanced vCPUs | vCPU ratio | Standard vCPU cost | Advanced vCPU cost | Standard price-perf savings |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TPC-C (150 warehouses) | 4.98 | 4.86 | 1.03 | $378 | $615 | 39%  |
| TPC-C (300 warehouses) | 6.51 | 6.51 | 1.00 | $495 | $825 | 40% |
|  |  |  |  |  |  |  |

TODO - remove original table

| TPC-C (150 warehouses) | 4.86 | 4.98 | $61.54 |
| :---- | ----: | ----: | ----: |
| TPC-C (300 warehouses) | 6.51 | 6.51 | $60.04 |
| TPC-C (600 warehouses) | 9.45 | 10.90 | $69.21 |
| TPC-E (500 customers) | 4.20 | 3.85 | $54.97 |
| TPC-H (query \#1) | 10.64 | 18.81 | $106.03 |
| TPC-H (query \#2) | 10.41 | 10.42 | $60.07 |
| TPC-H (query \#11) | 11.02 | 12.83 | $69.87 |
| TPC-H (query \#13) | 5.23 | 4.43 | $50.81 |

This table is \[WIP\]

|  | Advanced vCPU | Standard CPU | Standard Price |
| :---- | ----- | ----- | ----- |
| KV write-only (100 QPS) | 1.26 | 0.71 | $34.00 |
| KV write-only (200 QPS) | 1.68 | 1.13 | $40.37 |
| KV write-only (400 QPS) | 2.34 | 1.94 | $49.80 |
| KV write-only (800 QPS) | 3.35 | 3.12 | $55.95 |
| KV write-only (1600 QPS) | 4.79 | 4.67 | $58.48 |
| KV write-only (3200 QPS) | 6.86 | 7.50 | $65.56 |
| KV write-only (6400 QPS) | 9.49 | 12.05 | $76.20 |
| KV write-only (1 byte payload) | 6.89 | 7.80 | $67.96 |
| KV write-only (256 byte payload) | 6.96 | 7.90 | $68.08 |
| KV write-only (1K payload) | 7.11 | 8.77 | $74.01 |
| KV write-only (4K payload) | 5.80 | 6.53 | $67.58 |
| KV write-only (16K payload) | 6.03 | 5.96 | $59.26 |
| KV write-only (64K payload) | 6.30 | 6.81 | $64.84 |
| KV write-only (256K payload) | 7.46 | 6.74 | $54.22 |
| KV write-only (3 requests / batch) | 2.27 | 1.96 | $52.02 |
| KV write-only (6 requests / batch) | 2.36 | 2.27 | $57.85 |
| KV write-only (11 requests / batch) | 2.60 | 2.50 | $57.60 |
| KV write-only (22 requests / batch) | 2.82 | 2.95 | $62.87 |
| KV write-only (43 requests / batch) | 3.62 | 3.90 | $64.65 |
| KV write-only (84 requests / batch) | 5.47 | 5.03 | $55.15 |
| KV write-only (400 QPS, secondary index) | 3.84 | 3.85 | $60.17 |
| KV write-only (800 QPS, secondary index) | 5.71 | 5.97 | $62.81 |
| KV write-only (1600 QPS, secondary index) | 9.12 | 9.65 | $63.48 |
| KV write-only (3200 QPS, secondary index) | 14.82 | 16.20 | $65.58 |
| KV read-only (800 QPS) | 1.62 | 1.08 | $39.90 |
| KV read-only (1600 QPS) | 2.36 | 2.01 | $51.26 |
| KV read-only (3200 QPS) | 3.56 | 3.56 | $60.14 |
| KV read-only (6400 QPS) | 5.68 | 6.64 | $70.20 |
| KV read-only (1 byte payload) | 3.62 | 3.73 | $61.73 |
| KV read-only (256 byte payload) | 3.46 | 4.03 | $69.98 |
| KV read-only (1K payload) | 3.67 | 4.44 | $72.50 |
| KV read-only (4K payload) | 2.55 | 2.88 | $67.68 |
| KV read-only (16K payload) | 2.85 | 3.30 | $69.63 |
| KV read-only (64K payload) | 4.07 | 4.40 | $64.95 |
| KV read-only (256K payload) | 4.28 | 4.42 | $62.04 |
| KV read-only (8 requests / batch) | 2.18 | 1.78 | $48.90 |
| KV read-only (16 requests / batch) | 2.28 | 2.11 | $55.45 |
| KV read-only (32 requests / batch) | 2.64 | 2.62 | $59.48 |
| KV read-only (64 requests / batch) | 3.41 | 3.52 | $61.92 |
| TPC-C (150 warehouses) | 4.86 | 4.98 | $61.54 |
| TPC-C (300 warehouses) | 6.51 | 6.51 | $60.04 |
| TPC-C (600 warehouses) | 9.45 | 10.90 | $69.21 |
| TPC-E (500 customers) | 4.20 | 3.85 | $54.97 |
| TPC-H (query \#1) | 10.64 | 18.81 | $106.03 |
| TPC-H (query \#2) | 10.41 | 10.42 | $60.07 |
| TPC-H (query \#11) | 11.02 | 12.83 | $69.87 |
| TPC-H (query \#13) | 5.23 | 4.43 | $50.81 |
| MOVR | 3.1 | 2.92 | $55.99 |
| Bank | 4.9 | 4.67 | $57.03 |
| Ledger | 1.8 | 1.80 | $58.57 |
| YCSB (query A) | 4.8 | 5.34 | $67.28 |
| YCSB (query B) | 2.8 | 3.74 | $81.21 |
| YCSB (query C) | 2.4 | 3.28 | $80.75 |
| YCSB (query D) | 2.7 | 4.02 | $88.91 |
| YCSB (query E) | 5.8 | 6.19 | $64.14 |
| YCSB (query F) | 5.1 | 5.77 | $68.23 |
| Import (TPC-C 500 warehouses) | 20.7 | 19.00 | $55.05 |
| Import (TPC-H 3GB) | 11.8 | 6.81 | $34.65 |

# Estimating storage pricing for Standard clusters

WIP