---
title: Changefeed Sinks
summary: Define a changefeed sink URI and configure specific sinks.
toc: true
docs_area: stream_data
---

{{ site.data.products.enterprise }} changefeeds emit messages to configurable downstream sinks. CockroachDB supports the following sinks:

- [Kafka](#kafka)
- [Google Cloud Pub/Sub](#google-cloud-pub-sub)
- [Cloud Storage](#cloud-storage-sink)
- [Webhook](#webhook-sink)

See [`CREATE CHANGEFEED`](create-changefeed.html) for more detail on the [query parameters](create-changefeed.html#query-parameters) available when setting up a changefeed.

For a step-by-step example connecting a changefeed to a sink, see the [Changefeed Examples](changefeed-examples.html) page.

## Sink URI

The sink URI follows the basic format of:

~~~
'{scheme}://{host}:{port}?{query_parameters}'
~~~

URI Component      | Description
-------------------+------------------------------------------------------------------
`scheme`           | The type of sink: [`kafka`](#kafka), [`gcpubsub`](#google-cloud-pub-sub), any [cloud storage sink](#cloud-storage-sink), or [webhook sink](#webhook-sink).
`host`             | The sink's hostname or IP address.
`port`             | The sink's port.
`query_parameters` | The sink's [query parameters](create-changefeed.html#query-parameters).

To set a different sink URI to an existing changefeed, use the [`sink` option](alter-changefeed.html#sink-example) with `ALTER CHANGEFEED`.

## Kafka

Example of a Kafka sink URI:

~~~
'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SASL-SCRAM-SHA-256'
~~~

<a name ="kafka-parameters"></a>The following table lists the available parameters for Kafka URIs:

URI Parameter      | Description
-------------------+------------------------------------------------------------------
`topic_name`       | The topic name to which messages will be sent. See the following section on [Topic Naming](#topic-naming) for detail on how topics are created.
`topic_prefix`     | Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.
`tls_enabled`      | If `true`, enable Transport Layer Security (TLS) on the connection to Kafka. This can be used with a `ca_cert` (see below). <br><br>**Default:** `false`
`ca_cert`          | The base64-encoded `ca_cert` file. Specify `ca_cert` for a Kafka sink. <br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`client_cert`      | The base64-encoded Privacy Enhanced Mail (PEM) certificate. This is used with `client_key`.
`client_key`       | The base64-encoded private key for the PEM certificate. This is used with `client_cert`.<br><br>{% include {{ page.version.version }}/cdc/client-key-encryption.md %}
`sasl_enabled`     | If `true`, the authentication protocol can be set to SCRAM or PLAIN using the `sasl_mechanism` parameter. You must have `tls_enabled` set to `true` to use SASL. <br><br> **Default:** `false`
`sasl_mechanism`   | Can be set to [`SASL-SCRAM-SHA-256`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), [`SASL-SCRAM-SHA-512`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), or [`SASL-PLAIN`](https://docs.confluent.io/current/kafka/authentication_sasl/authentication_sasl_plain.html). A `sasl_user` and `sasl_password` are required. <br><br> **Default:** `SASL-PLAIN`
`sasl_user`        | Your SASL username.
`sasl_password`    | Your SASL password
`insecure_tls_skip_verify` | If `true`, disable client-side validation of responses. Note that a CA certificate is still required; this parameter means that the client will not verify the certificate. **Warning:** Use this query parameter with caution, as it creates [MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) vulnerabilities unless combined with another method of authentication. <br><br>**Default:** `false`

{% include {{ page.version.version }}/cdc/options-table-note.md %}

### Topic naming

By default, a Kafka topic has the same name as the table on which a changefeed was created. If you create a changefeed on multiple tables, the changefeed will write to multiple topics corresponding to those table names. When you run `CREATE CHANGEFEED` to a Kafka sink, the output will display the job ID as well as the topic name(s) that the changefeed will emit to.

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

 The `kafka_sink_config` option allows configuration of a changefeed's message delivery, Kafka server version, and batching parameters.

{{site.data.alerts.callout_danger}}
Each of the following settings have significant impact on a changefeed's behavior, such as latency. For example, it is possible to configure batching parameters to be very high, which would negatively impact changefeed latency. As a result it would take a long time to see messages coming through to the sink. Also, large batches may be rejected by the Kafka server unless it's separately configured to accept a high [`max.message.bytes`](https://kafka.apache.org/documentation/#brokerconfigs_message.max.bytes).
{{site.data.alerts.end}}

~~~
kafka_sink_config='{"Flush": {"MaxMessages": 1, "Frequency": "1s"}, "Version": "0.8.2.0", "RequiredAcks": "ONE" }'
~~~

<a name ="kafka-flush"></a>`"Flush"."MaxMessages"` and `"Flush"."Frequency"` are configurable batching parameters depending on latency and throughput needs. For example, if `"MaxMessages"` is set to 1000 and `"Frequency"` to 1 second, it will flush to Kafka either after 1 second or after 1000 messages are batched, whichever comes first. It's important to consider that if there are not many messages, then a `"1s"` frequency will add 1 second latency. However, if there is a larger influx of messages these will be flushed quicker.

Using the default values or not setting fields in `kafka_sink_config` will mean that changefeed messages emit immediately.

The configurable fields are as follows:

Field              | Type                | Description      | Default
-------------------+---------------------+------------------+-------------------
`Flush.MaxMessages` | [`INT`](int.html)  | Sets the maximum number of messages the producer can send in a single broker request. Any messages beyond the configured limit will be blocked. Increasing this value allows all messages to be sent in a batch. | `1`
`Flush.Messages`   | [`INT`](int.html)   | Configure the number of messages the changefeed should batch before flushing. | `0`
`Flush.Bytes`      | [`INT`](int.html)   | When the total byte size of all the messages in the batch reaches this amount, it should be flushed. | `0`
`Flush.Frequency`  | [`INTERVAL`](interval.html) | When this amount of time has passed since the **first** received message in the batch without it flushing, it should be flushed. | `"0s"`
`"Version"`        | [`STRING`](string.html) | Sets the appropriate Kafka cluster version, which can be used to connect to [Kafka versions < v1.0](https://docs.confluent.io/platform/current/installation/versions-interoperability.html) (`kafka_sink_config='{"Version": "0.8.2.0"}'`). | `"1.0.0.0"`
<a name="kafka-required-acks"></a>`"RequiredAcks"`  | [`STRING`](string.html) | Specifies what a successful write to Kafka is. CockroachDB [guarantees at least once delivery of messages](changefeed-messages.html#ordering-guarantees) — this value defines the **delivery**. The possible values are: <br><br>`"ONE"`: a write to Kafka is successful once the leader node has committed and acknowledged the write. Note that this has the potential risk of dropped messages; if the leader node acknowledges before replicating to a quorum of other Kafka nodes, but then fails.<br><br>`"NONE"`: no Kafka brokers are required to acknowledge that they have committed the message. This will decrease latency and increase throughput, but comes at the cost of lower consistency.<br><br>`"ALL"`: a quorum must be reached (that is, most Kafka brokers have committed the message) before the leader can acknowledge. This is the highest consistency level. | `"ONE"`

## Google Cloud Pub/Sub

{{site.data.alerts.callout_info}}
The Google Cloud Pub/Sub sink is currently in **beta**. For more information, read about compatible changefeed [options](create-changefeed.html#options) and the [Create a changefeed connected to a Google Cloud Pub/Sub sink](changefeed-examples.html#create-a-changefeed-connected-to-a-google-cloud-pub-sub-sink) example.
{{site.data.alerts.end}}

Changefeeds can deliver messages to a Google Cloud Pub/Sub sink, which is integrated with Google Cloud Platform.

A Pub/Sub sink URI follows this example:

~~~
'gcpubsub://{project name}?region={region}&topic_name={topic name}&AUTH=specified&CREDENTIALS={base64-encoded key}'
~~~

<a name ="pub-sub-parameters"></a>

URI Parameter      | Description
-------------------+------------------------------------------------------------------
`project name`     | The [Google Cloud Project](https://cloud.google.com/resource-manager/docs/creating-managing-projects) name.
`region`           | (Required) The single region to which all output will be sent.
`topic_name`       | (Optional) The topic name to which messages will be sent. See the following section on [Topic Naming](#topic-naming) for detail on how topics are created.
`AUTH`             | The authentication parameter can define either `specified` (default) or `implicit` authentication. To use `specified` authentication, pass your [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts) credentials with the URI. To use `implicit` authentication, configure these credentials via an environment variable. See [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html#authentication) for examples of each of these.
`CREDENTIALS`      | (Required with `AUTH=specified`) The base64-encoded credentials of your Google [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts) credentials.

{% include {{ page.version.version }}/cdc/options-table-note.md %}

When using Pub/Sub as your downstream sink, consider the following:

- It only supports `JSON` message format.
- Your Google Service Account must have the [Pub/Sub Editor](https://cloud.google.com/iam/docs/understanding-roles#pub-sub-roles) role assigned at the [project level](https://cloud.google.com/resource-manager/docs/access-control-proj#using_predefined_roles).
- You must specify the `region` parameter in the URI to maintain [ordering guarantees](changefeed-messages.html#ordering-guarantees). Unordered messages are not supported, see [Known Limitations](change-data-capture-overview.html#known-limitations) for more information.
- Changefeeds connecting to a Pub/Sub sink do not support the `topic_prefix` option.

### Pub/Sub topic naming

When running a `CREATE CHANGEFEED` statement to Pub/Sub, it will try to create a topic automatically. When you do not specify the topic in the URI with the [`topic_name`](create-changefeed.html#topic-name-param) parameter, the changefeed will use the table name to create the topic name. If the topic already exists in your Pub/Sub sink, the changefeed will write to it. You can also use the [`full_table_name`](create-changefeed.html#full-table-option) option to create a topic using the fully qualified table name. 

The output from `CREATE CHANGEFEED` will display the job ID as well as the topic name(s) that the changefeed will emit to.

You can manually create a topic in your Pub/Sub sink before starting the changefeed. See the [Creating a changefeed to Google Cloud Pub/Sub](changefeed-examples.html#create-a-changefeed-connected-to-a-google-cloud-pub-sub-sink) example for more detail. To understand restrictions on user-specified topic names, see Google's documentation on [Guidelines to name a topic or subscription](https://cloud.google.com/pubsub/docs/admin#resource_names).

For a list of compatible parameters and options, see [Parameters](create-changefeed.html#parameters) on the `CREATE CHANGEFEED` page.

## Cloud storage sink

Use a cloud storage sink to deliver changefeed data to OLAP or big data systems without requiring transport via Kafka.

Some considerations when using cloud storage sinks:

- Cloud storage sinks only work with `JSON` and emit newline-delimited `JSON` files.
- Cloud storage sinks can be configured to store emitted changefeed messages in one or more subdirectories organized by date. See [file partitioning](#partition-format) and the [General file format](create-changefeed.html#general-file-format) examples.
- The supported cloud schemes are: `s3`, `gs`, `azure`, `http`, and `https`.
- Both `http://` and `https://` are cloud storage sinks, **not** webhook sinks. It is necessary to prefix the scheme with `webhook-` for [webhook sinks](#webhook-sink).

You can authenticate to cloud storage sinks using `specified` or `implicit` authentication. CockroachDB also supports assume role authentication, which allows you to limit the control specific users have over your storage buckets. For detail and instructions on authenticating to cloud storage sinks, see [Use Cloud Storage for Bulk Operations — Authentication](use-cloud-storage-for-bulk-operations.html#authentication). 

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

### Cloud storage parameters

The following table lists the available parameters for cloud storage sink URIs:

URI Parameter      | Description
-------------------+------------------------------------------------------------------
`file_size`        | The file will be flushed (i.e., written to the sink) when it exceeds the specified file size. This can be used with the [`WITH resolved` option](create-changefeed.html#options), which flushes on a specified cadence. <br><br>**Default:** `16MB`
<a name ="partition-format"></a>`partition_format` | Specify how changefeed [file paths](create-changefeed.html#general-file-format) are partitioned in cloud storage sinks. Use `partition_format` with the following values: <br><br><ul><li>`daily` is the default behavior that organizes directories by dates (`2022-05-18/`, `2022-05-19/`, etc.).</li><li>`hourly` will further organize directories by hour within each date directory (`2022-05-18/06`, `2022-05-18/07`, etc.).</li><li>`flat` will not partition the files at all.</ul><br>For example: `CREATE CHANGEFEED FOR TABLE users INTO 'gs://...?AUTH...&partition_format=hourly'` <br><br> **Default:** `daily`
`S3_storage_class` | Specify the **Amazon S3** storage class for files created by the changefeed. See [Create a changefeed with an S3 storage class](create-changefeed.html#create-a-changefeed-with-an-s3-storage-class) for the available classes and an example. <br><br>**Default:** `STANDARD`
`topic_prefix`     | Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 's3://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.

{% include {{ page.version.version }}/cdc/options-table-note.md %}

[Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html#authentication) provides more detail on authentication to cloud storage sinks.

## Webhook sink

{{site.data.alerts.callout_info}}
The webhook sink is currently in **beta**. The following section provides usage considerations.
{{site.data.alerts.end}}

Use a webhook sink to deliver changefeed messages to an arbitrary HTTP endpoint.

Example of a webhook sink URL:

~~~
'webhook-https://{your-webhook-endpoint}?insecure_tls_skip_verify=true'
~~~

<a name ="webhook-parameters"></a>The following table lists the parameters you can use in your webhook URI:

URI Parameter      | Description
-------------------+------------------------------------------------------------------
`ca_cert`          | The base64-encoded `ca_cert` file. Specify `ca_cert` for a webhook sink. <br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`client_cert`      | The base64-encoded Privacy Enhanced Mail (PEM) certificate. This is used with `client_key`.
`client_key`       | The base64-encoded private key for the PEM certificate. This is used with `client_cert`.<br><br>{% include {{ page.version.version }}/cdc/client-key-encryption.md %}
`insecure_tls_skip_verify` | If `true`, disable client-side validation of responses. Note that a CA certificate is still required; this parameter means that the client will not verify the certificate. **Warning:** Use this query parameter with caution, as it creates [MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) vulnerabilities unless combined with another method of authentication. <br><br>**Default:** `false`

{% include {{ page.version.version }}/cdc/options-table-note.md %}

The following are considerations when using the webhook sink:

* Only supports HTTPS. Use the [`insecure_tls_skip_verify`](create-changefeed.html#tls-skip-verify) parameter when testing to disable certificate verification; however, this still requires HTTPS and certificates.
* Only supports JSON output format.
* There is no concurrency configurability.

### Webhook sink configuration

 The `webhook_sink_config` option allows the changefeed flushing and retry behavior of your webhook sink to be configured.

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
