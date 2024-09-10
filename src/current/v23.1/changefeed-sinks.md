---
title: Changefeed Sinks
summary: Define a changefeed sink URI and configure specific sinks.
toc: true
docs_area: stream_data
---

{{ site.data.products.enterprise }} changefeeds emit messages to configurable downstream sinks. This page details the URIs, parameters, and configurations available for each changefeed sink.

CockroachDB supports the following sinks:

- [Kafka](#kafka)
- [Google Cloud Pub/Sub](#google-cloud-pub-sub)
- [Cloud Storage](#cloud-storage-sink) / HTTP
- [Webhook](#webhook-sink)

The [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) page provides detail on using the SQL statement and a complete list of the [query parameters]({% link {{ page.version.version }}/create-changefeed.md %}#query-parameters) and options available when setting up a changefeed.

For a step-by-step example connecting a changefeed to a sink, see the [Changefeed Examples]({% link {{ page.version.version }}/changefeed-examples.md %}) page.

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
`query_parameters` | The sink's [query parameters]({% link {{ page.version.version }}/create-changefeed.md %}#query-parameters).

{% include {{ page.version.version }}/cdc/sink-URI-external-connection.md %}

To set a different sink URI to an existing changefeed, use the [`sink` option]({% link {{ page.version.version }}/alter-changefeed.md %}#sink-example) with `ALTER CHANGEFEED`.

{% include {{ page.version.version }}/misc/note-egress-perimeter-cdc-backup.md %}

## Kafka

### Kafka sink connection

Example of a Kafka sink URI using `SCRAM-SHA-256` authentication:

~~~
'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SCRAM-SHA-256'
~~~

{% include_cached new-in.html version="v23.1" %} Example of a Kafka sink URI using `OAUTHBEARER` authentication:

~~~
'kafka://{kafka cluster address}:9093?topic_name={vehicles}&sasl_client_id={your client ID}&sasl_client_secret={your base64-encoded client secret}&sasl_enabled=true&sasl_mechanism=OAUTHBEARER&sasl_token_url={your token URL}'
~~~

{% include {{ page.version.version }}/cdc/oauth-description.md %}

To authenticate to Kafka with OAuth using Okta, see the [Connect to a Changefeed Kafka sink with OAuth Using Okta]({% link {{ page.version.version }}/connect-to-a-changefeed-kafka-sink-with-oauth-using-okta.md %}) tutorial.

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/cdc/kafka-vpc-limitation.md %}
{{site.data.alerts.end}}

<a name ="kafka-parameters"></a>The following table lists the available parameters for Kafka URIs:

URI Parameter      | Description
-------------------+------------------------------------------------------------------
`topic_name`       | The topic name to which messages will be sent. See the following section on [Topic Naming](#topic-naming) for detail on how topics are created.
`topic_prefix`     | Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.
`tls_enabled`      | If `true`, enable Transport Layer Security (TLS) on the connection to Kafka. This can be used with a `ca_cert` (see below). <br><br>**Default:** `false`
`ca_cert`          | The base64-encoded `ca_cert` file. Specify `ca_cert` for a Kafka sink. <br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`client_cert`      | The base64-encoded Privacy Enhanced Mail (PEM) certificate. This is used with `client_key`.
`client_key`       | The base64-encoded private key for the PEM certificate. This is used with `client_cert`.<br><br>{% include {{ page.version.version }}/cdc/client-key-encryption.md %}
<span class="version-tag">New in v23.1:</span> `sasl_client_id`   | Client ID for OAuth authentication from a third-party provider. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`.
<span class="version-tag">New in v23.1:</span> `sasl_client_secret` | Client secret for OAuth authentication from a third-party provider. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`. **Note:** You must [base64 encode](https://www.base64encode.org/) this value when passing it in as part of a sink URI.
`sasl_enabled`     | If `true`, the authentication protocol can be set to SCRAM or PLAIN using the `sasl_mechanism` parameter. You must have `tls_enabled` set to `true` to use SASL. <br><br> **Default:** `false`
<span class="version-tag">New in v23.1:</span> `sasl_grant_type` | Override the default OAuth client credentials grant type for other implementations. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`.
`sasl_mechanism`   | Can be set to [`OAUTHBEARER`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_oauth.html), [`SCRAM-SHA-256`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), [`SCRAM-SHA-512`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), or [`PLAIN`](https://docs.confluent.io/current/kafka/authentication_sasl/authentication_sasl_plain.html). A `sasl_user` and `sasl_password` are required. <br><br> **Default:** `PLAIN`
<span class="version-tag">New in v23.1:</span> `sasl_scopes` | A list of scopes that the OAuth token should have access for. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`.
<span class="version-tag">New in v23.1:</span> `sasl_token_url` | Client token URL for OAuth authentication from a third-party provider. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`. **Note:** You must [URL encode](https://www.urlencoder.org/) this value before passing in a URI.
`sasl_user`        | Your SASL username.
`sasl_password`    | Your SASL password
`insecure_tls_skip_verify` | If `true`, disable client-side validation of responses. Note that a CA certificate is still required; this parameter means that the client will not verify the certificate. **Warning:** Use this query parameter with caution, as it creates [MITM](https://wikipedia.org/wiki/Man-in-the-middle_attack) vulnerabilities unless combined with another method of authentication. <br><br>**Default:** `false`

{% include {{ page.version.version }}/cdc/options-table-note.md %}

### Topic naming

By default, a Kafka topic has the same name as the table on which a changefeed was created. If you create a changefeed on multiple tables, the changefeed will write to multiple topics corresponding to those table names. When you run `CREATE CHANGEFEED` to a Kafka sink, the output will display the job ID as well as the topic name(s) that the changefeed will emit to.

To modify the default topic naming, you can specify a [topic prefix]({% link {{ page.version.version }}/create-changefeed.md %}#topic-prefix-param), [an arbitrary topic name]({% link {{ page.version.version }}/create-changefeed.md %}#topic-name-param), or use the [`full_table_name` option]({% link {{ page.version.version }}/create-changefeed.md %}#full-table-option). Using the [`topic_name`]({% link {{ page.version.version }}/create-changefeed.md %}#topic-name-param) parameter, you can specify an arbitrary topic name and feed all tables into that topic.

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
kafka_sink_config='{"Flush": {"MaxMessages": 1, "Frequency": "1s"}, "Version": "0.8.2.0", "RequiredAcks": "ONE", "Compression": "GZIP" }'
~~~

<a name ="kafka-flush"></a>`"Flush"."MaxMessages"` and `"Flush"."Frequency"` are configurable batching parameters depending on latency and throughput needs. For example, if `"MaxMessages"` is set to 1000 and `"Frequency"` to 1 second, it will flush to Kafka either after 1 second or after 1000 messages are batched, whichever comes first. It's important to consider that if there are not many messages, then a `"1s"` frequency will add 1 second latency. However, if there is a larger influx of messages these will be flushed quicker.

Using the default values or not setting fields in `kafka_sink_config` will mean that changefeed messages emit immediately.

The configurable fields are as follows:

Field              | Type                | Description      | Default
-------------------+---------------------+------------------+-------------------
`Flush.MaxMessages` | [`INT`]({% link {{ page.version.version }}/int.md %})  | Sets the maximum number of messages the producer can send in a single broker request. Any messages beyond the configured limit will be blocked. Increasing this value allows all messages to be sent in a batch. | `1000`
`Flush.Messages`   | [`INT`]({% link {{ page.version.version }}/int.md %})   | Configure the number of messages the changefeed should batch before flushing. | `0`
`Flush.Bytes`      | [`INT`]({% link {{ page.version.version }}/int.md %})   | When the total byte size of all the messages in the batch reaches this amount, it should be flushed. | `0`
`Flush.Frequency`  | [Duration string](https://pkg.go.dev/time#ParseDuration) | When this amount of time has passed since the **first** received message in the batch without it flushing, it should be flushed. | `"0s"`
`"Version"`        | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Sets the appropriate Kafka cluster version, which can be used to connect to [Kafka versions < v1.0](https://docs.confluent.io/platform/current/installation/versions-interoperability.html) (`kafka_sink_config='{"Version": "0.8.2.0"}'`). | `"1.0.0.0"`
<a name="kafka-required-acks"></a>`"RequiredAcks"`  | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Specifies what a successful write to Kafka is. CockroachDB [guarantees at least once delivery of messages]({% link {{ page.version.version }}/changefeed-messages.md %}#ordering-and-delivery-guarantees) — this value defines the **delivery**. The possible values are: <br><br>`"ONE"`: a write to Kafka is successful once the leader node has committed and acknowledged the write. Note that this has the potential risk of dropped messages; if the leader node acknowledges before replicating to a quorum of other Kafka nodes, but then fails.<br><br>`"NONE"`: no Kafka brokers are required to acknowledge that they have committed the message. This will decrease latency and increase throughput, but comes at the cost of lower consistency.<br><br>`"ALL"`: a quorum must be reached (that is, most Kafka brokers have committed the message) before the leader can acknowledge. This is the highest consistency level. {% include {{ page.version.version }}/cdc/kafka-acks.md %} | `"ONE"`
<a name="kafka-compression"></a>`"Compression"` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Sets a compression protocol that the changefeed should use when emitting events. The possible values are: `"NONE"`, `"GZIP"`, `"SNAPPY"`, `"LZ4"`, `"ZSTD"`. | `"NONE"`

### Kafka sink messages

The following shows the [Avro]({% link {{ page.version.version }}/changefeed-messages.md %}#avro) messages for a changefeed emitting to Kafka:

~~~
{
    "after":{
       "users":{
          "name":{
             "string":"Michael Clark"
          },
          "address":{
             "string":"85957 Ashley Junctions"
          },
          "credit_card":{
             "string":"4144089313"
          },
          "id":{
             "string":"d84cf3b6-7029-4d4d-aa81-e5caa9cce09e"
          },
          "city":{
             "string":"seattle"
          }
       }
    },
    "updated":{
       "string":"1659643584586630201.0000000000"
    }
 }
 {
    "after":{
       "users":{
          "address":{
             "string":"17068 Christopher Isle"
          },
          "credit_card":{
             "string":"6664835435"
          },
          "id":{
             "string":"11b99275-92ce-4244-be61-4dae21973f87"
          },
          "city":{
             "string":"amsterdam"
          },
          "name":{
             "string":"John Soto"
          }
       }
    },
    "updated":{
       "string":"1659643585384406152.0000000000"
    }
 }
~~~

See the [Changefeed Examples]({% link {{ page.version.version }}/changefeed-examples.md %}) page and the [Stream a Changefeed to a Confluent Cloud Kafka Cluster]({% link {{ page.version.version }}/stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.md %}) tutorial for examples to set up a Kafka sink.

{% include {{ page.version.version }}/cdc/note-changefeed-message-page.md %}

## Google Cloud Pub/Sub

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Changefeeds can deliver messages to a Google Cloud Pub/Sub sink, which is integrated with Google Cloud Platform.

{% include_cached new-in.html version="v23.1" %} Enable the `changefeed.new_pubsub_sink_enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to improve the throughput of changefeeds emitting to Pub/Sub sinks. Enabling this setting also alters the message format to use capitalized top-level fields in changefeeds emitting JSON-encoded messages. Therefore, you may need to reconfigure downstream systems to parse the new message format before enabling this setting:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING changefeed.new_pubsub_sink_enabled = true;
~~~

For more details, refer to the [Pub/Sub sink messages](#pub-sub-sink-messages) section.

A Pub/Sub sink URI follows this example:

~~~
'gcpubsub://{project name}?region={region}&topic_name={topic name}&AUTH=specified&CREDENTIALS={base64-encoded credentials}'
~~~

<a name ="pub-sub-parameters"></a>

URI Parameter      | Description
-------------------+------------------------------------------------------------------
`project name`     | The [Google Cloud Project](https://cloud.google.com/resource-manager/docs/creating-managing-projects) name.
`region`           | (Optional) The single region to which all output will be sent. If you do not include `region`, then you must create your changefeed with the [`unordered`]({% link {{ page.version.version }}/create-changefeed.md %}#unordered) option.
`topic_name`       | (Optional) The topic name to which messages will be sent. See the following section on [Topic Naming](#topic-naming) for detail on how topics are created.
`AUTH`             | The authentication parameter can define either `specified` (default) or `implicit` authentication. To use `specified` authentication, pass your [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts) credentials with the URI. To use `implicit` authentication, configure these credentials via an environment variable. See [Use Cloud Storage for Bulk Operations]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) for examples of each of these.
`CREDENTIALS`      | (Required with `AUTH=specified`) The base64-encoded credentials of your Google [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts).
`ASSUME_ROLE` | The service account of the role to assume. Use in combination with `AUTH=implicit` or `specified`.

{% include {{ page.version.version }}/cdc/options-table-note.md %}

When using Pub/Sub as your downstream sink, consider the following:

- Pub/Sub sinks support `JSON` message format. You can use the [`format=csv`]({% link {{ page.version.version }}/create-changefeed.md %}#format) option in combination with [`initial_scan='only'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) for CSV-formatted messages.
- Use the [`unordered`]({% link {{ page.version.version }}/create-changefeed.md %}#unordered) option for multi-region Pub/Sub. Google Cloud's multi-region Pub/Sub will have lower latency when emitting from multiple regions, but Google Cloud Pub/Sub does not support message ordering for multi-region topics.
- Changefeeds connecting to a Pub/Sub sink do not support the `topic_prefix` option.

Ensure one of the following [Pub/Sub roles](https://cloud.google.com/iam/docs/understanding-roles#pub-sub-roles) are set in your Google Service Account at the [project level](https://cloud.google.com/resource-manager/docs/access-control-proj#using_predefined_roles):

- To create topics on changefeed creation, you must use the Pub/Sub Editor role, which contains the permissions to create a topic.
- If the topic the changefeed is writing to already exists, then you can use the more limited Pub/Sub Publisher role, which can only write to existing topics.

For more information, read about compatible changefeed [options]({% link {{ page.version.version }}/create-changefeed.md %}#options) and the [Create a changefeed connected to a Google Cloud Pub/Sub sink]({% link {{ page.version.version }}/changefeed-examples.md %}#create-a-changefeed-connected-to-a-google-cloud-pub-sub-sink) example.

{{site.data.alerts.callout_info}}
You can use [Google's Pub/Sub emulator](https://cloud.google.com/pubsub/docs/emulator), which allows you to run Pub/Sub locally for testing. CockroachDB uses the [Google Cloud SDK](https://cloud.google.com/sdk), which means that you can follow Google's instructions for [Setting environment variables](https://cloud.google.com/pubsub/docs/emulator#env) to run the Pub/Sub emulator.
{{site.data.alerts.end}}

### Pub/Sub topic naming

When running a `CREATE CHANGEFEED` statement to a Pub/Sub sink, consider the following regarding topic names:

- Changefeeds will try to create a topic automatically. When you do not specify the topic in the URI with the [`topic_name`](create-changefeed.html#topic-name-param) parameter, the changefeed will use the table name to create the topic name.
- If the topic already exists in your Pub/Sub sink, the changefeed will write to it.
- Changefeeds watching multiple tables will write to multiple topics corresponding to those table names.
- The [`full_table_name`]({% link {{ page.version.version }}/create-changefeed.md %}#full-table-option) option will create a topic using the fully qualified table name for each table the changefeed is watching.
- The output from `CREATE CHANGEFEED` will display the job ID as well as the topic name(s) to which the changefeed will emit.

You can manually create a topic in your Pub/Sub sink before starting the changefeed. Refer to the [Creating a changefeed to Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-examples.md %}#create-a-changefeed-connected-to-a-google-cloud-pub-sub-sink) example for more detail. To understand restrictions on user-specified topic names, refer to Google's documentation on [Guidelines to name a topic or subscription](https://cloud.google.com/pubsub/docs/admin#resource_names).

For a list of compatible parameters and options, refer to [Parameters]({% link {{ page.version.version }}/create-changefeed.md %}#parameters) on the `CREATE CHANGEFEED` page.

### Pub/Sub sink configuration

You can configure flushing, retry, and concurrency behavior of changefeeds running to a Pub/Sub sink with the following:

- If you have enabled [`changefeed.new_pubsub_sink_enabled`](#google-cloud-pub-sub), set the [`changefeed.sink_io_workers` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-changefeed-sink-io-workers) to configure the number of concurrent workers used by changefeeds in the cluster when sending requests to a Pub/Sub sink. When you set `changefeed.sink_io_workers`, it will not affect running changefeeds; [pause the changefeed]({% link {{ page.version.version }}/pause-job.md %}), set `changefeed.sink_io_workers`, and then [resume the changefeed]({% link {{ page.version.version }}/resume-job.md %}). Setting `changefeed.sink_io_workers` will also affect changefeeds emitting to [webhook sinks](#webhook-sink) when `changefeed.new_webhook_sink_enabled` is set to `true`.
- Set the `pubsub_sink_config` option to configure the changefeed flushing and retry behavior to your webhook sink. For details on the `pubsub_sink_config` option's configurable fields, refer to the following table and examples.

Field              | Type                | Description      | Default
-------------------+---------------------+------------------+-------------------
`Flush.Messages`   | [`INT`]({% link {{ page.version.version }}/int.md %})   | The batch is flushed and its messages are sent when it contains this many messages. | `0`
`Flush.Bytes`      | [`INT`]({% link {{ page.version.version }}/int.md %})   | The batch is flushed when the total byte sizes of all its messages reaches this threshold. | `0`
`Flush.Frequency`  | [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) | When this amount of time has passed since the **first** received message in the batch without it flushing, it should be flushed. | `"0s"`
`Retry.Max`        | [`INT`]({% link {{ page.version.version }}/int.md %}) | The maximum number of attempted batch emit retries after sending a message batch in a request fails. Specify either an integer greater than zero or the string `inf` to retry indefinitely. This only affects batch emit retries, not other causes of [duplicate messages]({% link {{ page.version.version }}/changefeed-messages.md %}#duplicate-messages). Note that setting this field will not prevent the whole changefeed job from retrying indefinitely. | `3`
`Retry.Backoff`    | [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) | How long the sink waits before retrying after the first failure. The backoff will double until it reaches the maximum retry time of 30 seconds.<br><br>For example, if `Retry.Max = 4` and `Retry.Backoff = 10s`, then the sink will try at most `4` retries, with `10s`, `20s`, `30s`, and `30s` backoff times.  | `"500ms"`

For example:

~~~
pubsub_sink_config = '{ "Flush": {"Messages": 100, "Frequency": "5s"}, "Retry": { "Max": 4, "Backoff": "10s"} }'
~~~

{% include {{ page.version.version }}/cdc/sink-configuration-detail.md %}

### Pub/Sub sink messages

{{site.data.alerts.callout_info}}
In CockroachDB v23.2 and later, changefeeds will have `changefeed.new_pubsub_sink_enabled` enabled by default.
{{site.data.alerts.end}}

When the `changefeed.new_pubsub_sink_enabled` cluster setting is enabled, changefeeds will have improved throughput and the changefeed JSON-encoded message format has top-level fields that are capitalized:

~~~
{Key: ..., Value: ..., Topic: ...}
~~~

{{site.data.alerts.callout_danger}}
Before enabling `changefeed.new_pubsub_sink_enabled`, you may need to reconfigure downstream systems to parse the new message format.
{{site.data.alerts.end}}

With `changefeed.new_pubsub_sink_enabled` set to `false`, changefeeds emit JSON messages with the top-level fields all lowercase:

~~~
{key: ..., value: ..., topic: ...}
~~~

If `changefeed.new_pubsub_sink_enabled` is set to `false`, changefeeds will not benefit from the improved throughput performance that this setting enables.

The following shows the default JSON messages for a changefeed created with `changefeed.new_pubsub_sink_enabled` set to `false`. These changefeed messages were emitted as part of the [Create a changefeed connected to a Google Cloud Pub/Sub sink]({% link {{ page.version.version }}/changefeed-examples.md %}#create-a-changefeed-connected-to-a-google-cloud-pub-sub-sink) example:

~~~
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────┬─────────────────────────────────────────────────────────┬────────────┬──────────────────┐
│                                                                                                                                 DATA                                                                                                                                 │    MESSAGE_ID    │                       ORDERING_KEY                      │ ATTRIBUTES │ DELIVERY_ATTEMPT │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼─────────────────────────────────────────────────────────┼────────────┼──────────────────┤
│ {"key":["boston","40ef7cfa-5e16-4bd3-9e14-2f23407a66df"],"value":{"after":{"address":"14980 Gentry Plains Apt. 64","city":"boston","credit_card":"2466765790","id":"40ef7cfa-5e16-4bd3-9e14-2f23407a66df","name":"Vickie Fitzpatrick"}},"topic":"movr-users"}         │ 4466153049158588 │ ["boston", "40ef7cfa-5e16-4bd3-9e14-2f23407a66df"]      │            │                  │
│ {"key":["los angeles","947ae147-ae14-4800-8000-00000000001d"],"value":{"after":{"address":"35627 Chelsey Tunnel Suite 94","city":"los angeles","credit_card":"2099932769","id":"947ae147-ae14-4800-8000-00000000001d","name":"Kenneth Barnes"}},"topic":"movr-users"} │ 4466144577818136 │ ["los angeles", "947ae147-ae14-4800-8000-00000000001d"] │            │                  │
│ {"key":["amsterdam","c28f5c28-f5c2-4000-8000-000000000026"],"value":{"after":{"address":"14729 Karen Radial","city":"amsterdam","credit_card":"5844236997","id":"c28f5c28-f5c2-4000-8000-000000000026","name":"Maria Weber"}},"topic":"movr-users"}                   │ 4466151194002912 │ ["amsterdam", "c28f5c28-f5c2-4000-8000-000000000026"]   │            │                  │
│ {"key":["new york","6c8ab772-584a-439d-b7b4-fda37767c74c"],"value":{"after":{"address":"34196 Roger Row Suite 6","city":"new york","credit_card":"3117945420","id":"6c8ab772-584a-439d-b7b4-fda37767c74c","name":"James Lang"}},"topic":"movr-users"}                 │ 4466147099992681 │ ["new york", "6c8ab772-584a-439d-b7b4-fda37767c74c"]    │            │                  │
│ {"key":["boston","c56dab0a-63e7-4fbb-a9af-54362c481c41"],"value":{"after":{"address":"83781 Ross Overpass","city":"boston","credit_card":"7044597874","id":"c56dab0a-63e7-4fbb-a9af-54362c481c41","name":"Mark Butler"}},"topic":"movr-users"}                        │ 4466150752442731 │ ["boston", "c56dab0a-63e7-4fbb-a9af-54362c481c41"]      │            │                  │
│ {"key":["amsterdam","f27e09d5-d7cd-4f88-8b65-abb910036f45"],"value":{"after":{"address":"77153 Donald Road Apt. 62","city":"amsterdam","credit_card":"7531160744","id":"f27e09d5-d7cd-4f88-8b65-abb910036f45","name":"Lisa Sandoval"}},"topic":"movr-users"}          │ 4466147182359256 │ ["amsterdam", "f27e09d5-d7cd-4f88-8b65-abb910036f45"]   │            │                  │
│ {"key":["new york","46d200c0-6924-4cc7-b3c9-3398997acb84"],"value":{"after":{"address":"92843 Carlos Grove","city":"new york","credit_card":"8822366402","id":"46d200c0-6924-4cc7-b3c9-3398997acb84","name":"Mackenzie Malone"}},"topic":"movr-users"}                │ 4466142864542016 │ ["new york", "46d200c0-6924-4cc7-b3c9-3398997acb84"]    │            │                  │
│ {"key":["boston","52ecbb26-0eab-4e0b-a160-90caa6a7d350"],"value":{"after":{"address":"95044 Eric Corner Suite 33","city":"boston","credit_card":"3982363300","id":"52ecbb26-0eab-4e0b-a160-90caa6a7d350","name":"Brett Porter"}},"topic":"movr-users"}                │ 4466152539161631 │ ["boston", "52ecbb26-0eab-4e0b-a160-90caa6a7d350"]      │            │                  │
│ {"key":["amsterdam","ae147ae1-47ae-4800-8000-000000000022"],"value":{"after":{"address":"88194 Angela Gardens Suite 94","city":"amsterdam","credit_card":"4443538758","id":"ae147ae1-47ae-4800-8000-000000000022","name":"Tyler Dalton"}},"topic":"movr-users"}       │ 4466151398997150 │ ["amsterdam", "ae147ae1-47ae-4800-8000-000000000022"]   │            │                  │
│ {"key":["paris","dc28f5c2-8f5c-4800-8000-00000000002b"],"value":{"after":{"address":"2058 Rodriguez Stream","city":"paris","credit_card":"9584502537","id":"dc28f5c2-8f5c-4800-8000-00000000002b","name":"Tony Ortiz"}},"topic":"movr-users"}                         │ 4466146372222914 │ ["paris", "dc28f5c2-8f5c-4800-8000-00000000002b"]       │            │                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────┴─────────────────────────────────────────────────────────┴────────────┴──────────────────┘
~~~

{% include {{ page.version.version }}/cdc/note-changefeed-message-page.md %}

## Cloud storage sink

Use a cloud storage sink to deliver changefeed data to OLAP or big data systems without requiring transport via Kafka.

Some considerations when using cloud storage sinks:

- Cloud storage sinks work with `JSON` and emit newline-delimited `JSON` files. You can use the [`format=csv`]({% link {{ page.version.version }}/create-changefeed.md %}#format) option in combination with [`initial_scan='only'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) for CSV-formatted messages.
- Cloud storage sinks can be configured to store emitted changefeed messages in one or more subdirectories organized by date. See [file partitioning](#partition-format) and the [General file format]({% link {{ page.version.version }}/create-changefeed.md %}#general-file-format) examples.
- The supported cloud schemes are: `s3`, `gs`, `azure`, `http`, and `https`.
- Both `http://` and `https://` are cloud storage sinks, **not** webhook sinks. It is necessary to prefix the scheme with `webhook-` for [webhook sinks](#webhook-sink).

You can authenticate to cloud storage sinks using `specified` or `implicit` authentication. CockroachDB also supports assume role authentication for Amazon S3 and Google Cloud Storage, which allows you to limit the control specific users have over your storage buckets. For detail and instructions on authenticating to cloud storage sinks, see [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).

Examples of supported cloud storage sink URIs:

### Amazon S3

~~~
's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
~~~

### Azure Blob Storage

~~~
'azure://{CONTAINER NAME}/{PATH}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}'
~~~

### Google Cloud Storage

~~~
'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
~~~

### HTTP

~~~
'http://localhost:8080/{PATH}'
~~~

### Cloud storage parameters

The following table lists the available parameters for cloud storage sink URIs:

URI Parameter      | Storage | Description
-------------------+------------------------+---------------------------
`AWS_ACCESS_KEY_ID` | AWS | The access key ID to your AWS account.
`AWS_SECRET_ACCESS_KEY` | AWS | The secret access key to your AWS account.
`ASSUME_ROLE`      | AWS S3, GCS | The [ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) (AWS) or [service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts) (GCS) of the role to assume. Use in combination with `AUTH=implicit` or `specified`.<br><br>AWS S3 only: Use `external_id` with `ASSUME_ROLE` to specify a third-party assigned external ID as part of the role. Refer to [Amazon S3 assume role]({% link {{ page.version.version }}/cloud-storage-authentication.md %}#set-up-amazon-s3-assume-role) for setup details.
`AUTH`             | AWS S3, Azure Blob Storage, GCS | The authentication parameter can define either `specified` (default) or `implicit` authentication. To use `specified` authentication, pass your account credentials with the URI. To use `implicit` authentication, configure these credentials via an environment variable. See [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) for examples of each of these.
`AZURE_ACCOUNT_NAME` | Azure Blob Storage | The name of your Azure account.
`AZURE_ACCOUNT_KEY` | Azure Blob Storage | The URL-encoded account key for your Azure account.
`AZURE_CLIENT_ID` | Azure Blob Storage | Application (client) ID for your [App Registration](https://learn.microsoft.com/azure/active-directory/develop/quickstart-register-app#register-an-application).
`AZURE_CLIENT_SECRET` | Azure Blob Storage | Client credentials secret generated for your App Registration.
`AZURE_ENVIRONMENT` | Azure Blob Storage | {% include {{ page.version.version }}/misc/azure-env-param.md %}
`AZURE_TENANT_ID`| Azure Blob Storage | Directory (tenant) ID for your App Registration.
`CREDENTIALS`      | GCS | (Required with `AUTH=specified`) The base64-encoded credentials of your Google [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts) credentials.
`file_size`        | All | The file will be flushed (i.e., written to the sink) when it exceeds the specified file size. This can be used with the [`WITH resolved` option]({% link {{ page.version.version }}/create-changefeed.md %}#options), which flushes on a specified cadence. <br><br>**Default:** `16MB`
<a name ="partition-format"></a>`partition_format` | All | Specify how changefeed [file paths]({% link {{ page.version.version }}/create-changefeed.md %}#general-file-format) are partitioned in cloud storage sinks. Use `partition_format` with the following values: <br><br><ul><li>`daily` is the default behavior that organizes directories by dates (`2022-05-18/`, `2022-05-19/`, etc.).</li><li>`hourly` will further organize directories by hour within each date directory (`2022-05-18/06`, `2022-05-18/07`, etc.).</li><li>`flat` will not partition the files at all.</ul><br>For example: `CREATE CHANGEFEED FOR TABLE users INTO 'gs://...?AUTH...&partition_format=hourly'` <br><br> **Default:** `daily`
`S3_STORAGE_CLASS` | AWS S3 | Specify the S3 storage class for files created by the changefeed. See [Create a changefeed with an S3 storage class]({% link {{ page.version.version }}/create-changefeed.md %}#create-a-changefeed-with-an-s3-storage-class) for the available classes and an example. <br><br>**Default:** `STANDARD`
`topic_prefix`     | All | Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 's3://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.

{% include {{ page.version.version }}/cdc/options-table-note.md %}

[Use Cloud Storage for Bulk Operations]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) provides more detail on authentication to cloud storage sinks.

### Cloud storage sink messages

The following shows the default JSON messages for a changefeed emitting to a cloud storage sink:

~~~
{
    "after":{
       "address":"51438 Janet Valleys",
       "city":"boston",
       "credit_card":"0904722368",
       "id":"33333333-3333-4400-8000-00000000000a",
       "name":"Daniel Hernandez MD"
    },
    "key":[
       "boston",
       "33333333-3333-4400-8000-00000000000a"
    ]
 }
 {
    "after":{
       "address":"15074 Richard Falls",
       "city":"boston",
       "credit_card":"0866384459",
       "id":"370117cf-d77d-4778-b0b9-01ac17c15a06",
       "name":"Cheyenne Morales"
    },
    "key":[
       "boston",
       "370117cf-d77d-4778-b0b9-01ac17c15a06"
    ]
 }
 {
    "after":{
       "address":"69687 Jessica Islands Apt. 68",
       "city":"boston",
       "credit_card":"6837062320",
       "id":"3851eb85-1eb8-4200-8000-00000000000b",
       "name":"Sarah Wang DDS"
    },
    "key":[
       "boston",
       "3851eb85-1eb8-4200-8000-00000000000b"
    ]
 }
. . .
~~~

{% include {{ page.version.version }}/cdc/note-changefeed-message-page.md %}

## Webhook sink

{% include {{ page.version.version }}/cdc/webhook-performance-setting.md %}

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
`insecure_tls_skip_verify` | If `true`, disable client-side validation of responses. Note that a CA certificate is still required; this parameter means that the client will not verify the certificate. **Warning:** Use this query parameter with caution, as it creates [MITM](https://wikipedia.org/wiki/Man-in-the-middle_attack) vulnerabilities unless combined with another method of authentication. <br><br>**Default:** `false`

{% include {{ page.version.version }}/cdc/options-table-note.md %}

The following are considerations when using the webhook sink:

* Only supports HTTPS. Use the [`insecure_tls_skip_verify`]({% link {{ page.version.version }}/create-changefeed.md %}#tls-skip-verify) parameter when testing to disable certificate verification; however, this still requires HTTPS and certificates.
* Supports JSON output format. You can use the [`format=csv`]({% link {{ page.version.version }}/create-changefeed.md %}#format) option in combination with [`initial_scan='only'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) for CSV-formatted messages.

### Webhook sink configuration

You can configure flushing, retry, and concurrency behavior of changefeeds running to a webhook sink with the following:

- If you have enabled `changefeed.new_webhook_sink_enabled`, set the [`changefeed.sink_io_workers` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-changefeed-sink-io-workers) to configure the number of concurrent workers used by changefeeds in the cluster when sending requests to a webhook sink. When you set `changefeed.sink_io_workers`, it will not affect running changefeeds; [pause the changefeed]({% link {{ page.version.version }}/pause-job.md %}), set `changefeed.sink_io_workers`, and then [resume the changefeed]({% link {{ page.version.version }}/resume-job.md %}). Setting `changefeed.sink_io_workers` will also affect changefeeds emitting to [Google Cloud Pub/Sub sinks](#google-cloud-pub-sub) when `changefeed.new_pubsub_sink_enabled` is set to `true`.
- Set the `webhook_sink_config` option to configure the changefeed flushing and retry behavior to your webhook sink. For details on the `webhook_sink_config` option's configurable fields, refer to the following table and examples.

Field              | Type                | Description      | Default
-------------------+---------------------+------------------+-------------------
`Flush.Messages`   | [`INT`]({% link {{ page.version.version }}/int.md %})   | The batch is flushed and its messages are sent when it contains this many messages. | `0`
`Flush.Bytes`      | [`INT`]({% link {{ page.version.version }}/int.md %})   | The batch is flushed when the total byte sizes of all its messages reaches this threshold. | `0`
`Flush.Frequency`  | [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) | When this amount of time has passed since the **first** received message in the batch without it flushing, it should be flushed. | `"0s"`
`Retry.Max`        | [`INT`]({% link {{ page.version.version }}/int.md %}) | The maximum number of attempted HTTP retries after sending a message batch in an HTTP request fails. Specify either an integer greater than zero or the string `inf` to retry indefinitely. This only affects HTTP retries, not other causes of [duplicate messages]({% link {{ page.version.version }}/changefeed-messages.md %}#duplicate-messages). Note that setting this field will not prevent the changefeed from retrying indefinitely. | `3`
`Retry.Backoff`    | [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) | How long the sink waits before retrying after the first failure. The backoff will double until it reaches the maximum retry time of 30 seconds.<br><br>For example, if `Retry.Max = 4` and `Retry.Backoff = 10s`, then the sink will try at most `4` retries, with `10s`, `20s`, `30s`, and `30s` backoff times.  | `"500ms"`

For example:

~~~
webhook_sink_config = '{ "Flush": {"Messages": 100, "Frequency": "5s"}, "Retry": { "Max": 4, "Backoff": "10s"} }'
~~~

{% include {{ page.version.version }}/cdc/sink-configuration-detail.md %}

### Webhook sink messages

The following shows the default JSON messages for a changefeed emitting to a webhook sink. These changefeed messages were emitted as part of the [Create a changefeed connected to a Webhook sink]({% link {{ page.version.version }}/changefeed-examples.md %}#create-a-changefeed-connected-to-a-webhook-sink) example:

~~~
"2021/08/24 14":"00":21
{
    "payload":[
       {
          "after":{
             "city":"rome",
             "creation_time":"2019-01-02T03:04:05",
             "current_location":"39141 Travis Curve Suite 87",
             "ext":{
                "brand":"Schwinn",
                "color":"red"
             },
             "id":"d7b18299-c0c4-4304-9ef7-05ae46fd5ee1",
             "dog_owner_id":"5d0c85b5-8866-47cf-a6bc-d032f198e48f",
             "status":"in_use",
             "type":"bike"
          },
          "key":[
             "rome",
             "d7b18299-c0c4-4304-9ef7-05ae46fd5ee1"
          ],
          "topic":"vehicles",
          "updated":"1629813621680097993.0000000000"
       }
    ],
    "length":1
 }

 "2021/08/24 14":"00":22
 {
    "payload":[
       {
          "after":{
             "city":"san francisco",
             "creation_time":"2019-01-02T03:04:05",
             "current_location":"84888 Wallace Wall",
             "ext":{
                "color":"black"
             },
             "id":"020cf7f4-6324-48a0-9f74-6c9010fb1ab4",
             "dog_owner_id":"b74ea421-fcaf-4d80-9dcc-d222d49bdc17",
             "status":"available",
             "type":"scooter"
          },
          "key":[
             "san francisco",
             "020cf7f4-6324-48a0-9f74-6c9010fb1ab4"
          ],
          "topic":"vehicles",
          "updated":"1629813621680097993.0000000000"
       }
    ],
    "length":1
 }
~~~

{% include {{ page.version.version }}/cdc/note-changefeed-message-page.md %}

## See also

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
