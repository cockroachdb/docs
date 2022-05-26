---
title: Changefeed Sinks
summary: Define a changefeed sink URI and configure specific sinks.
toc: true
docs_area: stream_data
---

{{ site.data.products.enterprise }} changefeeds emit messages to configurable downstream sinks. CockroachDB supports the following sinks:

- [Kafka](#kafka)
- [Cloud Storage](#cloud-storage-sink)
- [Webhook](#webhook-sink)

See [`CREATE CHANGEFEED`](create-changefeed.html) for more detail on the [query parameters](create-changefeed.html#query-parameters) available when setting up a changefeed.

## Sink URI

The sink URI follows the basic format of:

~~~
'{scheme}://{host}:{port}?{query_parameters}'
~~~

URI Component      | Description
-------------------+------------------------------------------------------------------
`scheme`           | The type of sink: [`kafka`](#kafka), any [cloud storage sink](#cloud-storage-sink), or [webhook sink](#webhook-sink).
`host`             | The sink's hostname or IP address.
`port`             | The sink's port.
`query_parameters` | The sink's [query parameters](create-changefeed.html#query-parameters).

## Kafka

Example of a Kafka sink URI:

~~~
'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SASL-SCRAM-SHA-256'
~~~

### Topic naming

By default, a Kafka topic has the same name as the table on which a changefeed was created. If a changefeed was created on multiple tables, the changefeed will write to multiple topics corresponding to those table names.

To modify the default topic naming, you can specify a [topic prefix](create-changefeed.html#topic-prefix-param), [an arbitrary topic name](create-changefeed.html#topic-name-param), or use the [`full_table_name` option](create-changefeed.html#full-table-option). Using the [`topic_name`](create-changefeed.html#topic-name-param) parameter, you can specify an arbitrary topic name and feed all tables into that topic.

You can either manually create a topic in your Kafka cluster before starting the changefeed, or the topic will be automatically created when the changefeed connects to your Kafka cluster.

{{site.data.alerts.callout_info}}
You must have the Kafka cluster setting [`auto.create.topics.enable`](https://kafka.apache.org/documentation/#brokerconfigs_auto.create.topics.enable) set to `true` for automatic topic creation. This will create the topic when the changefeed sends its first message. If you create the consumer before that, you will also need the Kafka consumer configuration [`allow.auto.create.topics`](https://kafka.apache.org/documentation/#consumerconfigs_allow.auto.create.topics) to be set to `true`.
{{site.data.alerts.end}}

Kafka has the following topic limitations:

- [Legal characters](https://github.com/apache/kafka/blob/0.10.2/core/src/main/scala/kafka/common/Topic.scala#L29) are numbers, letters, and `[._-]`.
- The maximum character length of a topic name is 249.
- Topics with a period (`.`) and underscore (`_`) can collide on internal Kafka data structures, so you should use either but not both.
- Characters not accepted by Kafka will be automatically encoded as unicode characters by CockroachDB.

### Kafka sink configuration

{% include_cached new-in.html version=v21.2 %} The `kafka_sink_config` option allows configuration of a changefeed's message delivery, Kafka server version, and batching parameters.

{{site.data.alerts.callout_danger}}
Each of the following settings have significant impact on a changefeed's behavior, such as latency. For example, it is possible to configure batching parameters to be very high, which would negatively impact changefeed latency. As a result it would take a long time to see messages coming through to the sink. Also, large batches may be rejected by the Kafka server unless it's separately configured to accept a high [`max.message.bytes`](https://kafka.apache.org/documentation/#brokerconfigs_message.max.bytes).
{{site.data.alerts.end}}

~~~
kafka_sink_config='{"Flush": {"MaxMessages": 1, "Frequency": "1s"}, "Version": "0.8.2.0", "RequiredAcks": "ONE" }'
~~~

The configurable fields include:

<a name ="kafka-flush"></a>

* `"Flush"."MaxMessages"` and `"Flush"."Frequency"`: These are configurable batching parameters depending on latency and throughput needs. For example, if `"MaxMessages"` is set to 1000 and `"Frequency"` to 1 second, it will flush to Kafka either after 1 second or after 1000 messages are batched, whichever comes first. It's important to consider that if there are not many messages, then a `"1s"` frequency will add 1 second latency. However, if there is a larger influx of messages these will be flushed quicker.
  * `"MaxMessages"`: sets the maximum number of messages the producer will send in a single broker request. Increasing this value allows all messages to be sent in a batch. Default: `1`. Type: `INT`.
  * `"Frequency"`: sets the maximum time that messages will be batched. Default: `"0s"`. Type: `INTERVAL`.

* `"Version"`: sets the appropriate Kafka cluster version, which can be used to connect to [Kafka versions < v1.0](https://docs.confluent.io/platform/current/installation/versions-interoperability.html) (`kafka_sink_config='{"Version": "0.8.2.0"}'`). Default: `"1.0.0.0"` Type: `STRING`.

<a name="kafka-required-acks"></a>

* `"RequiredAcks"`: specifies what a successful write to Kafka is. CockroachDB [guarantees at least once delivery of messages](use-changefeeds.html#ordering-guarantees) — this value defines the _delivery_. Type: `STRING`. The possible values are:
  * `"ONE"`: a write to Kafka is successful once the leader node has committed and acknowledged the write. Note that this has the potential risk of dropped messages; if the leader node acknowledges before replicating to a quorum of other Kafka nodes, but then fails. **This is the default value.**
  * `"NONE"`: no Kafka brokers are required to acknowledge that they have committed the message. This will decrease latency and increase throughput, but comes at the cost of lower consistency.
  * `"ALL"`: a quorum must be reached (that is, most Kafka brokers have committed the message) before the leader can acknowledge. This is the highest consistency level.

## Cloud storage sink

Use a cloud storage sink to deliver changefeed data to OLAP or big data systems without requiring transport via Kafka.

Some considerations when using cloud storage sinks:

- Cloud storage sinks only work with `JSON` and emit newline-delimited `JSON` files.
- The supported cloud schemes are: `s3`, `gs`, `azure`, `http`, and `https`.
- Both `http://` and `https://` are cloud storage sinks, **not** webhook sinks. It is necessary to prefix the scheme with `webhook-` for [webhook sinks](#webhook-sink).

Examples of supported cloud storage sink URIs:

### Amazon S3

~~~
's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
~~~

### Azure Storage

~~~
'azure://{CONTAINER NAME}/{PATH}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}'
~~~

### Google Cloud Storage

~~~
'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
~~~

[Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html#authentication) provides more detail on authentication to cloud storage sinks.

## Webhook sink

{{site.data.alerts.callout_info}}
The webhook sink is currently in **beta**. For more information, read about its usage considerations, available [parameters](create-changefeed.html#parameters), and [options](create-changefeed.html#options) below.
{{site.data.alerts.end}}

{% include_cached new-in.html version=v21.2 %} Use a webhook sink to deliver changefeed messages to an arbitrary HTTP endpoint.

Example of a webhook sink URL:

~~~
'webhook-https://{your-webhook-endpoint}?insecure_tls_skip_verify=true'
~~~

The following are considerations when using the webhook sink:

* Only supports HTTPS. Use the [`insecure_tls_skip_verify`](create-changefeed.html#tls-skip-verify) parameter when testing to disable certificate verification; however, this still requires HTTPS and certificates.
* Only supports JSON output format.
* There is no concurrency configurability.

### Webhook sink configuration

{% include_cached new-in.html version=v21.2 %} The `webhook_sink_config` option allows the changefeed flushing and retry behavior of your webhook sink to be configured.

The following details the configurable fields:

Field              | Type                | Description      | Default
-------------------+---------------------+------------------+-------------------
`Flush.Messages`   | [`INT`](int.html)   | When the batch reaches this configured size, it should be flushed (batch sent). | `0`
`Flush.Bytes`      | [`INT`](int.html)   | When the total byte size of all the messages in the batch reaches this amount, it should be flushed. | `0`
`Flush.Frequency`  | [`INTERVAL`](interval.html) | When this amount of time has passed since the **first** received message in the batch without it flushing, it should be flushed. | `"0s"`
`Retry.Max`        | [`INT`](int.html) or [`STRING`](string.html) | The maximum amount of time the sink will retry a single HTTP request to send a batch. This value must be positive (> 0). If infinite retries are desired, use `inf`. | `"0s"`
`Retry.Backoff`    | [`INTERVAL`](interval.html) | The initial backoff the sink will wait after the first failure. The backoff will double (exponential backoff strategy), until the max is hit. | `"500ms"`

{{site.data.alerts.callout_danger}}
Setting either `Messages` or `Bytes` with a non-zero value without setting `Frequency`, will cause the sink to assume `Frequency` has an infinity value. If either `Messages` or `Bytes` have a non-zero value, then a non-zero value for `Frequency` **must** be provided. This configuration is invalid and will cause an error, since the messages could sit in a batch indefinitely if the other conditions do not trigger.
{{site.data.alerts.end}}

Some complexities to consider when setting `Flush` fields for batching:

- When all batching parameters are zero (`"Messages"`, `"Bytes"`, and `"Frequency"`) the sink will interpret this configuration as "send batch every time." This would be the same as not providing any configuration at all:

~~~
{
  "Flush": {
    "Messages": 0,
    "Bytes": 0,
    "Frequency": "0s"
  }
}
~~~

- If one or more fields are set as non-zero values, any fields with a zero value the sink will interpret as infinity. For example, in the following configuration, the sink will send a batch whenever the size reaches 100 messages, **or**, when 5 seconds has passed since the batch was populated with its first message. `Bytes` defaults to `0` in this case, so a batch will never trigger due to a configured byte size:

~~~
{
  "Flush": {
    "Messages": 100,
    "Frequency": "5s"
  }
}
~~~

## See also

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
