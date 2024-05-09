Changefeeds emitting to an Apache Pulsar sink do **not** support:

- [`resolved`]({% link {{ page.version.version }}/create-changefeed.md %}#resolved-option)
- [`updated`]({% link {{ page.version.version }}/create-changefeed.md %}#updated-option)
- [`mvcc_timestamp`]({% link {{ page.version.version }}/create-changefeed.md %}#mvcc-timestamp)
- [`format=avro`]({% link {{ page.version.version }}/create-changefeed.md %}#format)
- [`confluent_schema_registry`]({% link {{ page.version.version }}/create-changefeed.md %}#confluent-registry)
- [`topic_prefix`]({% link {{ page.version.version }}/create-changefeed.md %}#topic-prefix-param)
- Any batching configuration
- [Authentication query parameters]({% link {{ page.version.version }}/create-changefeed.md %}#query-parameters)
- [External connections]({% link {{ page.version.version }}/create-external-connection.md %})