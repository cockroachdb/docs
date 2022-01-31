---
title: Load-Based Splitting
summary: To optimize your cluster's performance, CockroachDB can split frequently accessed keys into their own ranges.
toc: true
---

To optimize your cluster's performance, CockroachDB can split frequently accessed keys into smaller ranges. In conjunction with [load-based rebalancing](architecture/replication-layer.html#load-based-replica-rebalancing), load-based splitting distributes load evenly across your cluster.

## Settings

### Enable/disable load-based splitting

Use [`SET CLUSTER SETTING`](set-cluster-setting.html) to set `kv.range_split.by_load_enabled` to:

- `true` to enable load-based splitting _(default)_
- `false` to disable load-based splitting

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.range_split.by_load_enabled = true;
~~~

#### When to enable load-based splitting

Load-based splitting is on by default and beneficial in almost all situations.

#### When to disable load-based splitting

You might want to disable load-based splitting when troubleshooting range-related issues under the guidance of our developers.

### Control load-based splitting threshold

Use [`SET CLUSTER SETTING`](set-cluster-setting.html) to set `kv.range_split.load_qps_threshold` to the queries-per-second (QPS) at which you want to consider splitting a range (defaults to `2500`):

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.range_split.load_qps_threshold = 2000;
~~~

#### When to modify the load-based splitting threshold

Some workloads might find splitting ranges more aggressively (i.e., a lower QPS threshold) can improve performance.

On the other hand, some workloads with very large machines might want to increase the QPS threshold to split more conservatively.

## How load-based splitting works

Whenever a range exceeds the cluster's setting for `kv.range_split.load_qps_threshold`, the range becomes eligible for load-based splitting.

At that point, we begin gathering per-key metrics to determine whether or not a split would benefit the cluster's performance based on the following heuristics:

- **Balance factor:** If we perform a split, would there be a balance of load on both sides of the split? For example, if 99% of the traffic is for a single key, splitting it apart from the others in the range will not have a substantial impact on performance. However, if 60% of the queries are for a single key, it is likely to benefit the cluster to move the key to its own range.

- **Split crossing:** If we perform a split, how many queries would have to cross this new range boundary? Because involving multiple ranges in a query incurs greater overhead than a single range, splitting a range could actually degrade performance. For example, if the range is involved in many `SELECT COUNT(*)...` operations, splitting the range in two could negatively impact performance.

### Determining a split point

Using the per-key metrics gathered once a node exceeds the `kv.range_split.load_qps_threshold` value, we estimate a good place to perform a split by determining the total operations over the first set of keys that exceed the `kv.range_split.load_qps_threshold`.

For example, if the operations on a single key exceed the `kv.range_split.load_qps_threshold` value, it's a good candidate to split the range at that point.

Another example is that if the range has equal access among all keys, whose total operation exceeds `kv.range_split.load_qps_threshold`. By splitting the range at the first set of keys whose total operations exceed the threshold, we can reduce the load on the node. If the "other" range still exceeds the threshold, it will eventually be split again.

In both of these examples, the split would only occur if the balance factor and split crossing heuristics determined the split would produce better results.

## Why load-based splitting works

CockroachDB creates a relatively even distribution of leaseholders throughout your cluster. ([Leaseholders](architecture/replication-layer.html#leases) are a single replica of a range that both serve reads and coordinate writes operations.)

However, without load-based splitting this distribution is created without considering the load present on any set of keys. This means that even with an equitable distribution of leases throughout the cluster, some leases will generate more traffic for the node that houses them than others. Because each node can only provide so much throughput, a single node can become a bottleneck for providing access to a subset of data in your cluster.

However, by leveraging load-based splitting, the cluster can understand load on a per-range basis and split up ranges that generate a significant amount of load into multiple ranges, and therefore multiple leaseholders. This lets the cluster express its load as a function of leases; so the roughly equal distribution of leases also generates a roughly equal distribution of traffic, preventing individual nodes from becoming bottlenecks for your cluster.

This benefit is further amplified by [load-based rebalancing](architecture/replication-layer.html#load-based-replica-rebalancing), which ensures that all nodes contain replicas with a roughly equal load. By evenly distributing load throughout your cluster, it's easier to prevent bottlenecks from arising, as well as simplifying hardware forecasting.

## See also

- [`SET CLUSTER SETTING`](set-cluster-setting.html)
