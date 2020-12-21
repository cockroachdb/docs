---
title: Range Merges
summary: To help improve performance, CockroachDB can automatically merge small ranges of data together.
toc: true
---

To help improve your cluster's performance, CockroachDB can automatically merge small ranges of data together to form fewer, larger ranges. This can both improve query latency, as well as your cluster's survivability.

## Settings

### Enable/disable range merges

Use [`SET CLUSTER SETTING`](set-cluster-setting.html) to set `kv.range_merge.queue_enabled` to:

- `true` to enable range merges *(default)*
- `false` to disable range merges

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.range_merge.queue_enabled = true;
~~~

## How range merges work

### Overview

CockroachDB splits your cluster's data into many ranges (512 MiB by default), which are defined by the range of keys they contain. For example, your cluster might have a range for customers whose IDs are between `[1000, 2000)`. If that range grows beyond 512 MiB of data, the range is split into two smaller ranges.

However, as you delete data from your cluster, a range might contain far less data. Over the lifetime of a cluster, this could lead to a number of small ranges.

To reduce the number of small ranges, your cluster can have any range below a certain threshold (128 MiB by default) try to merge with its "right-hand neighbor", i.e. the range that starts where this range ends. Using our example above, this might be the range for customers whose IDs are between `[2000, 3000)`.

If the combined size of the small range and its neighbor is less than the maximum range size, the ranges merge into a single range. In our example, this would create a new range of keys `[1000, 3000)`.

{{site.data.alerts.callout_info}}

Ranges only attempt to merge with their right-hand neighbor. Ranges do not currently attempt to merge with their left-hand neighbor (i.e. the range that ends where this range begins).

{{site.data.alerts.end}}

### Why range merges improve performance

#### Query latency

Queries in CockroachDB must contact a replica of each range involved in the query. This creates the following issues for clusters with many small ranges:

- Queries incur a fixed overhead in terms of processing time for each range they must coordinate with.
- Having many small ranges can increase the number of machines your query must coordinate with. This exposes your query to a greater likelihood of running into issues like network latency or overloaded nodes.

By merging small ranges, CockroachDB can greatly reduce the number of ranges involved in queries and reduce their latency.

#### Survivability

CockroachDB automatically [rebalances](architecture/replication-layer.html) the distribution of ranges in your cluster whenever nodes come online or go offline.

During rebalancing, it's preferable to replicate a few larger ranges across nodes. It requires less coordination and often completes more quickly.

By merging ranges together, your cluster needs to rebalance fewer ranges, which ultimately improves your cluster's performance, especially in the face of availability events like node outages.
