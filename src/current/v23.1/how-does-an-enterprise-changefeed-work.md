---
title: How Does an Enterprise Changefeed Work?
summary: Stream data out of CockroachDB with efficient, distributed, row-level change subscriptions (changefeeds).
toc: true
docs_area: stream_data
---

When an {{ site.data.products.enterprise }} changefeed is started on a node, that node becomes the _coordinator_ for the changefeed job (**Node 2** in the diagram). The coordinator node acts as an administrator: keeping track of all other nodes during job execution and the changefeed work as it completes. The changefeed job will run across all nodes in the cluster to access changed data in the watched table. Typically, the [leaseholder]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) for a particular range (or the range’s replica) determines which node emits the changefeed data.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/work-distribution-setting.md %}
{{site.data.alerts.end}}

Each node uses its _aggregator processors_ to send back checkpoint progress to the coordinator, which gathers this information to update the _high-water mark timestamp_. The high-water mark acts as a checkpoint for the changefeed’s job progress, and guarantees that all changes before (or at) the timestamp have been emitted. In the unlikely event that the changefeed’s coordinating node were to fail during the job, that role will move to a different node and the changefeed will restart from the last checkpoint. If restarted, the changefeed may [re-emit messages]({% link {{ page.version.version }}/changefeed-messages.md %}#duplicate-messages) starting at the high-water mark time to the current time. Refer to [Ordering Guarantees]({% link {{ page.version.version }}/changefeed-messages.md %}#ordering-and-delivery-guarantees) for detail on CockroachDB's at-least-once-delivery-guarantee and how per-key message ordering is applied.

<img src="/docs/images/{{ page.version.version }}/changefeed-structure.png" alt="Changefeed process in a 3-node cluster" style="border:0px solid #eee;max-width:100%" />

With [`resolved`]({% link {{ page.version.version }}/create-changefeed.md %}#resolved-option) specified when a changefeed is started, the coordinator will send the resolved timestamp (i.e., the high-water mark) to each endpoint in the sink. For example, when using [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) this will be sent as a message to each partition; for [cloud storage]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink), this will be emitted as a resolved timestamp file.

As rows are updated, added, and deleted in the targeted table(s), the node sends the row changes through the [rangefeed mechanism]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) to the changefeed encoder, which encodes these changes into the [final message format]({% link {{ page.version.version }}/changefeed-messages.md %}#responses). The message is emitted from the encoder to the sink—it can emit to any endpoint in the sink. In the diagram example, this means that the messages can emit to any Kafka Broker.

{{site.data.alerts.callout_info}}
When you create a changefeed using [change data capture queries]({% link {{ page.version.version }}/cdc-queries.md %}), the [optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) will evaluate and optimize the query before the job sends the selected row changes to the changefeed encoder. The optimizer can restrict the rows a changefeed job considers during table scans, initial scans, and catch-up scans, which can make these more efficient using CDC queries.
{{site.data.alerts.end}}

If you are running changefeeds from a [multi-region]({% link {{ page.version.version }}/multiregion-overview.md %}) cluster, you may want to define which nodes take part in running the changefeed job. You can use the [`execution_locality` option]({% link {{ page.version.version }}/changefeeds-in-multi-region-deployments.md %}#run-a-changefeed-job-by-locality) with key-value pairs to specify the locality requirements nodes must meet. See [Job coordination using the execution locality option]({% link {{ page.version.version }}/changefeeds-in-multi-region-deployments.md %}#job-coordination-using-the-execution-locality-option) for detail on how a changefeed job works with this option.

See the following for more detail on changefeed setup and use:

- [Enable rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds)
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [Changefeed Examples]({% link {{ page.version.version }}/changefeed-examples.md %})