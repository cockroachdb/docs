---
title: Operational FAQs
summary: Get answers to frequently asked questions about operating CockroachDB.
toc: false
---

<div id="toc"></div>

## Why is memory usage increasing despite lack of traffic?

If you start a CockroachDB node on your computer and let it run for hours or days, you might notice that its memory usage steadily grows for a while before plateauing at around 25% of your computer's total memory. This is expected behavior -- like most databases, CockroachDB caches the most recently accessed data in memory so that it can provide faster reads, and [its periodic writes of timeseries data](#background-increase-in-amount-of-data) causes that cache size to increase until it hits its configured limit. The cache size limit defaults to 25% of the machine's memory, but can be controlled by setting the `--cache` flag when running [`cockroach start`](start-a-node.html).

## Why is disk usage increasing despite lack of writes?

The timeseries data used to power the graphs in the admin UI is stored within the cluster and accumulates for 30 days before it starts getting truncated. As a result, for the first 30 days or so of a cluster's life you will see a steady increase in disk usage and the number of ranges in the cluster even if you aren't writing data to it yourself.

As of the 1.0 release, there is no way to change the number of days before timeseries data gets truncated. As a workaround, however, you can start each node with the `COCKROACH_METRICS_SAMPLE_INTERVAL` environment variable set higher than its default of `10s` to store fewer data points. For example, you could set it to `1m` to only collect data every 1 minute, which would result in storing 6x less timeseries data than the default setting.

## See Also

- [Product FAQs](frequently-asked-questions.html)
- [SQL FAQs](sql-faqs.html)
