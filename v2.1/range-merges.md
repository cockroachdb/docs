---
title: Range Merges
summary: To help improve performance, CockroachDB can automatically merge small ranges of data together.
toc: true
---

To help improve your cluster's performance, CockroachDB can automatically merge small ranges of data together to form fewer, larger ranges.

{{site.data.alerts.callout_danger}}

In CockroachDB 2.1, range merges are an [experimental feature](experimental-features.html).

Only use this feature if your entire cluster is running CockroachDB 2.1.3 or newer.

{{site.data.alerts.end}}

## Settings

### Enable/disable range merges

Use [`SET CLUSTER SETTING`](set-cluster-setting.html) to set `kv.range_merge.queue_enabled` to:

- `true` to enable range merges
- `false` to disable range merges

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.range_merge.queue_enabled = true;
~~~

#### When to disable range merges

Disable (or do not use) range merges if you:

- Want to manually control range splits using [`SPLIT AT`](split-at.html)

- Use CockroachDB 2.1.2 or older

#### When to enable range merges

Range merges can provide performance improvements if you:

- Use CockroachDB 2.1.3 or newer

## How range merges work

### Overview

CockroachDB splits your cluster's data into many ranges (64MiB by default), which are defined by a range of keys they contain. For example, your cluster might contain a range that contains only customers whose ID is between `[1000, 2000)`. Once that range of keys constitutes more than 64MiB of data, the range is split into two 32MiB ranges.

However, as you delete data from your cluster, a range might contain far less data. Over the lifetime of a cluster, this could lead to a large number of small ranges.

To reduce the number of small ranges, your cluster can have any range below a certain threshold (16MiB by default) try to merge with its "neighbor", i.e. the range with the next-highest key. Using our example above, this might be the range whose keys are `[2000, 3000)`.

If the size of the small range and its neighbor is less than the maximum range size, the ranges merge into a single range. In our example, this would create a new range of keys `[1000, 3000)`.

{{site.data.alerts.callout_info}}

Ranges only attempt to merge with their right-hand neighbor (i.e. the range with the next-highest key). Ranges do not currently attempt to merge with left-hand neighbor (i.e. the range with the next-lowest key).

{{site.data.alerts.end}}

### Why range merges improve performance

#### Query latency

Queries in Cockroach must contact a replica of each range involved; the more ranges that are involved, the larger the number of machines you must contact. This exposes your query to a greater likelihood of running into issues like network latency or overloaded nodes.

By merging small ranges, CockroachDB can greatly reduce the number of ranges involved in queries.

#### Survivability

CockroachDB automatically [rebalances](architecture/replication-layer.html) the distribution of ranges in your cluster whenever nodes come or go offline. Replicating many small ranges across nodes has a worse performance profile than replicating a few larger ranges. 

By having fewer, larger ranges (enabled by range merges) expedites the process of rebalancing, places less load on your network and machine, and ultimately helps your cluster's ability to handle outages.
