---
title: Operational FAQs
summary: Get answers to frequently asked questions about operating CockroachDB.
toc: true
---


## Why is my process hanging when I try to start it in the background?

The first question that needs to be asked is whether or not you have previously
run a multi-node cluster using the same data directory. If you haven't, then you
should check out our [Cluster Setup Troubleshooting
docs](cluster-setup-troubleshooting.html). If you have previously started and
stopped a multi-node cluster and are now trying to bring it back up, you're in
the right place.

In order to keep your data consistent, CockroachDB only works when at least a
majority of its nodes are running. This means that if only one node of a three
node cluster is running, that one node will not be able to do anything. The
`--background` flag of [`cockroach start`](start-a-node.html) causes the start
command to wait until the node has fully initialized and is able to start
serving queries.

Together, these two facts mean that the `--background` flag will cause
`cockroach start` to hang until a majority of nodes are running. In order to
restart your cluster, you should either use multiple terminals so that you can
start multiple nodes at once or start each node in the background using your
shell's functionality (e.g., `cockroach start &`) instead of the `--background`
flag.

## Why is memory usage increasing despite lack of traffic?

Like most databases, CockroachDB caches the most recently accessed data in memory so that it can provide faster reads, and [its periodic writes of timeseries data](#why-is-disk-usage-increasing-despite-lack-of-writes) cause that cache size to increase until it hits its configured limit. For information about manually controlling the cache size, see [Recommended Production Settings](recommended-production-settings.html#cache-and-sql-memory-size-changed-in-v1-1).

## Why is disk usage increasing despite lack of writes?

The timeseries data used to power the graphs in the admin UI is stored within the cluster and accumulates for 30 days before it starts getting truncated. As a result, for the first 30 days or so of a cluster's life you will see a steady increase in disk usage and the number of ranges in the cluster even if you aren't writing data to it yourself.

As of the 1.0 release, there is no way to change the number of days before timeseries data gets truncated. As a workaround, however, you can start each node with the `COCKROACH_METRICS_SAMPLE_INTERVAL` environment variable set higher than its default of `10s` to store fewer data points. For example, you could set it to `1m` to only collect data every 1 minute, which would result in storing 6x less timeseries data than the default setting.

## Why does CockroachDB collect anonymized cluster usage details by default?

Collecting information about CockroachDB's real world usage helps us prioritize the development of product features. We choose our default as "opt-in" to strengthen the information we receive from our collection efforts, but we also make a careful effort to send only anonymous, aggregate usage statistics. See [Diagnostics Reporting](diagnostics-reporting.html) for a detailed look at what information is sent and how to opt-out.

## What happens when node clocks are not properly synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-effects.html %}

## How can I tell how well node clocks are synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-monitoring.html %}

## See Also

- [Product FAQs](frequently-asked-questions.html)
- [SQL FAQs](sql-faqs.html)
