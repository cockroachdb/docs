---
title: Change Data Capture Overview
summary: Stream data out of CockroachDB with efficient, distributed, row-level change subscriptions (changefeeds).
toc: true
---

Change data capture (CDC) provides efficient, distributed, row-level change feeds into a configurable sink for downstream processing such as reporting, caching, or full-text indexing.

## What is change data capture?

While CockroachDB is an excellent system of record, it also needs to coexist with other systems. For example, you might want to keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.

The main feature of CDC is the changefeed, which targets an allowlist of tables, called the "watched rows". There are two implementations of changefeeds:

| [Core changefeeds](#create-a-core-changefeed)   | [Enterprise changefeeds](#configure-a-changefeed-enterprise) |
--------------------------------------------------|-----------------------------------------------------------------|
| Useful for prototyping or quick testing. | Recommended for production use. |
| Available in all products. | Available in {{ site.data.products.dedicated }} or with an [Enterprise license](enterprise-licensing.html) in CockroachDB. |
| Streams indefinitely until underlying SQL connection is closed. | Maintains connection to configured sink. |
| Create with [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html). | Create with [`CREATE CHANGEFEED`](create-changefeed.html). |
| Watches one or multiple tables in a comma-separated list. Emits every change to a "watched" row as a record. | Watches one or multiple tables in a comma-separated list. Emits every change to a "watched" row as a record in a <br> configurable format (`JSON` or Avro) to a configurable sink  ([Kafka](https://kafka.apache.org/)). |
| [`CREATE`](#create-a-changefeed-core) changefeed and cancel by closing the connection. | Manage changefeed with [`CREATE`](#create), [`PAUSE`](#pause), [`RESUME`](#resume), and [`CANCEL`](#cancel), as well as [monitor](#monitor-a-changefeed) and [debug](#debug-a-changefeed). |

<!--NOTE New section here in follow-up PR:

## How changefeeds work

Brief, conceptual overview.
 -->
