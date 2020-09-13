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

If you start a CockroachDB node on your computer and let it run for hours or days, you might notice that its memory usage steadily grows for a while before plateauing at around 25% of your computer's total memory. This is expected behavior -- like most databases, CockroachDB caches the most recently accessed data in memory so that it can provide faster reads, and [its periodic writes of timeseries data](#why-is-disk-usage-increasing-despite-lack-of-writes) cause that cache size to increase until it hits its configured limit. The cache size limit defaults to 25% of the machine's memory, but can be controlled by setting the `--cache` flag when running [`cockroach start`](start-a-node.html).

## Why is disk usage increasing despite lack of writes?

The timeseries data used to power the graphs in the admin UI is stored within the cluster and accumulates for 30 days before it starts getting truncated. As a result, for the first 30 days or so of a cluster's life you will see a steady increase in disk usage and the number of ranges in the cluster even if you aren't writing data to it yourself.

As of the 1.0 release, there is no way to change the number of days before timeseries data gets truncated. As a workaround, however, you can start each node with the `COCKROACH_METRICS_SAMPLE_INTERVAL` environment variable set higher than its default of `10s` to store fewer data points. For example, you could set it to `1m` to only collect data every 1 minute, which would result in storing 6x less timeseries data than the default setting.

## Why does CockroachDB collect anonymized cluster usage details by default?

Collecting information about CockroachDB's real world usage helps us prioritize the development of product features. We choose our default as "opt-in" to strengthen the information we receive from our collection efforts, but we also make a careful effort to send only anonymous, aggregate usage statistics. See [Diagnostics Reporting](diagnostics-reporting.html) for a detailed look at what information is sent and how to opt-out.

## What happens when node clocks are not properly synchronized?

CockroachDB needs moderately accurate time to preserve data consistency, so it's important to run [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

By default, CockroachDB's maximum allowed clock offset is 500ms. When a node detects that its clock offset, relative to other nodes, is half or more of the maximum allowed, it spontaneously shuts down. While [serializable consistency](https://en.wikipedia.org/wiki/Serializability) is maintained regardless of clock skew, skew outside the configured clock offset bounds can result in violations of single-key linearizability between causally dependent transactions. With NTP or other clock synchronization software running on each node, there's very little risk of ever exceeding the maximum offset and encountering such anomalies, and even on well-functioning hardware not running synchronization software, slow clock drift is most common, which CockroachDB handles safely.

The one rare case to note is when a node's clock suddenly jumps beyond the maximum offset before the node detects it. Although extremely unlikely, this could occur, for example, when running CockroachDB inside a VM and the VM hypervisor decides to migrate the VM to different hardware with a different time. In this case, there can be a small window of time between when the node's clock becomes unsynchronized and when the node spontaneously shuts down. During this window, it would be possible for a client to read stale data and write data derived from stale reads.

## See Also

- [Product FAQs](frequently-asked-questions.html)
- [SQL FAQs](sql-faqs.html)
