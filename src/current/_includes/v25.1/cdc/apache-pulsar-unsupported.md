Changefeeds emitting to an Apache Pulsar sink do **not** support:

- [`format=avro`]({{ page.version.version }}/create-changefeed.md#format)
- [`confluent_schema_registry`]({{ page.version.version }}/create-changefeed.md#confluent-schema-registry)
- [`topic_prefix`]({{ page.version.version }}/create-changefeed.md#topic-prefix)
- Any batching configuration
- [Authentication query parameters]({{ page.version.version }}/create-changefeed.md#query-parameters)
- [External connections]({{ page.version.version }}/create-external-connection.md)