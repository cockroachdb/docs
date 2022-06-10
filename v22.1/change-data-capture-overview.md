---
title: Change Data Capture Overview
summary: Stream data out of CockroachDB with efficient, distributed, row-level change subscriptions (changefeeds).
toc: true
docs_area: stream_data
key: stream-data-out-of-cockroachdb-using-changefeeds.html
---

Change data capture (CDC) provides efficient, distributed, row-level changefeeds into a configurable sink for downstream processing such as reporting, caching, or full-text indexing.

## What is change data capture?

While CockroachDB is an excellent system of record, it also needs to coexist with other systems. For example, you might want to keep your data mirrored in full-text indexes, analytics engines, or big data pipelines.

The main feature of CDC is the changefeed, which targets an allowlist of tables, called the "watched rows". There are two implementations of changefeeds:

| [Core changefeeds](changefeed-examples.html#create-a-core-changefeed)   | [{{ site.data.products.enterprise }} changefeeds](changefeed-examples.html) |
--------------------------------------------------|-----------------------------------------------------------------|
| Useful for prototyping or quick testing. | Recommended for production use. |
| Available in all products. | Available in {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in {{ site.data.products.core }} or {{ site.data.products.serverless }}. |
| Streams indefinitely until underlying SQL connection is closed. | Maintains connection to configured sink. |
| Create with [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html). | Create with [`CREATE CHANGEFEED`](create-changefeed.html). |
| Watches one or multiple tables in a comma-separated list. Emits every change to a "watched" row as a record. | Watches one or multiple tables in a comma-separated list. Emits every change to a "watched" row as a record in a <br> configurable format (`JSON` or Avro) to a [configurable sink](changefeed-sinks.html) (e.g., [Kafka](https://kafka.apache.org/)). |
| [`CREATE`](create-and-configure-changefeeds.html#create-a-changefeed-core) changefeed and cancel by closing the connection. | Manage changefeed with [`CREATE`](create-and-configure-changefeeds.html#create), [`PAUSE`](create-and-configure-changefeeds.html#pause), [`RESUME`](create-and-configure-changefeeds.html#resume), [`ALTER`](alter-changefeed.html), and [`CANCEL`](create-and-configure-changefeeds.html#cancel), as well as [monitor](monitor-and-debug-changefeeds.html#monitor-a-changefeed) and [debug](monitor-and-debug-changefeeds.html#debug-a-changefeed). |

See [Ordering Guarantees](use-changefeeds.html#ordering-guarantees) for detail on CockroachDB's at-least-once-delivery-guarantee as well as explanation on how rows are emitted.

## How does an Enterprise changefeed work?

When a changefeed is started on a node, that node becomes the aggregator node for the changefeed job (CRDB Node 2 in the diagram). The aggregator node acts as an administrator: keeping track of all other nodes during job execution and the changefeed work as it completes. In the unlikely event that the changefeed’s aggregator node were to fail during the job, the aggregator role will move to a different node and the changefeed will restart from the last checkpoint.

The changefeed job will run across nodes in the cluster to access changed data in the watched table. Typically, the [leaseholder](architecture/replication-layer.html#leases) for a particular range (or the range’s replica) determines which node emits the changefeed data.

As each node is working, it sends back checkpoint progress to the aggregator node that gathers this information to update the high-water mark timestamp. The high-water mark acts as a checkpoint for the changefeed’s job progress, and guarantees that all changes before (or at) the timestamp have been emitted. If restarted, the changefeed will send duplicate messages from the high-water mark timestamp. For more detail on when messages are emitted, see [Ordering Guarantees](use-changefeeds.html#ordering-guarantees).

<img src="{{ 'images/v21.2/changefeed-structure.png' | relative_url }}" alt="Changefeed process in a 3-node cluster" style="border:0px solid #eee;max-width:100%" />

With the [`resolved` option](create-changefeed.html#resolved-option) specified when a changefeed is started, the aggregator node will send the resolved timestamp (i.e., the high-water mark) to each endpoint in the sink. For example, when using [Kafka](changefeed-sinks.html#kafka) this will be sent as a message to each partition; for [cloud storage](changefeed-sinks.html#cloud-storage-sink), this will be emitted as a resolved timestamp file.

As rows are updated, added, and deleted in the targeted table(s), the node sends the row changes through the [rangefeed mechanism](use-changefeeds.html#enable-rangefeeds) to the changefeed encoder, which encodes these changes into the [final message format](use-changefeeds.html#responses). The message is emitted from the encoder to the sink—it can emit to any endpoint in the sink. In the diagram example, this means that the messages can emit to any Kafka Broker.

See the following for more detail on changefeed setup and use:

- [Enabling rangefeeds](use-changefeeds.html#enable-rangefeeds)
- [Changefeed Sinks](changefeed-sinks.html)
- [Changefeed Examples](changefeed-examples.html)

## Known limitations

{% include {{ page.version.version }}/known-limitations/cdc.md %}
