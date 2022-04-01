---
title: CREATE CHANGEFEED
summary: The CREATE CHANGEFEED statement creates a changefeed of row-level change subscriptions in a configurable format to a configurable sink.
toc: true
---

{{site.data.alerts.callout_info}}
`CREATE CHANGEFEED` is an [Enterprise-only](enterprise-licensing.html) feature. For the core version, see [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html).
{{site.data.alerts.end}}

The `CREATE CHANGEFEED` [statement](sql-statements.html) creates a new Enterprise changefeed, which targets an allowlist of tables, called "watched rows".  Every change to a watched row is emitted as a record in a configurable format (`JSON` or Avro) to a configurable sink ([Kafka](https://kafka.apache.org/) or a [cloud storage sink](#cloud-storage-sink)). You can [create](#create-a-changefeed-connected-to-kafka), [pause](#pause-a-changefeed), [resume](#resume-a-paused-changefeed), or [cancel](#cancel-a-changefeed) an Enterprise changefeed.

For more information, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html).

## Required privileges

To create a changefeed, the user must be a member of the `admin` role or have the [`CREATECHANGEFEED`](create-user.html#create-a-user-that-can-control-changefeeds) parameter set.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/create_changefeed.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table (or tables in a comma separated list) to create a changefeed for.<br><br>**Note:** Changefeeds do not share internal buffers, so each running changefeed will increase total memory usage. To watch multiple tables, we recommend creating a changefeed with a comma-separated list of tables.
`sink` | The location of the configurable sink. The scheme of the URI indicates the type. For more information, see [Sink URI](#sink-uri) below.
`option` / `value` | For a list of available options and their values, see [Options](#options) below.

<!-- `IF NOT EXISTS` | Create a new changefeed only if a changefeed of the same name does not already exist; if one does exist, do not return an error.
`name` | The name of the changefeed to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers). -->

### Sink URI

The sink URI follows the basic format of:

~~~
'{scheme}://{host}:{port}?{query_parameters}'
~~~

URI Component      | Description
-------------------+------------------------------------------------------------------
`scheme`           | The type of sink: [`kafka`](#kafka) or any [cloud storage sink](#cloud-storage-sink).
`host`             | The sink's hostname or IP address.
`port`             | The sink's port.
`query_parameters` | The sink's [query parameters](#query-parameters).

#### Kafka

Example of a Kafka sink URI:

~~~
'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SASL-SCRAM-SHA-256'
~~~

#### Cloud storage sink

Use a cloud storage sink to deliver changefeed data to OLAP or big data systems without requiring transport via Kafka.

{{site.data.alerts.callout_info}}
Currently, cloud storage sinks only work with `JSON` and emits newline-delimited `JSON` files.
{{site.data.alerts.end}}

Example of a cloud storage sink URI:

~~~
`experimental-s3://acme-co/employees?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456`
~~~

Cloud storage sink URIs must be pre-pended with `experimental-` when working with changefeeds. For more information on the sink URI structure, see [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html#example-file-urls).

#### Query parameters

{% include {{ page.version.version }}/cdc/url-encoding.md %}

Query parameters include:

Parameter          | <div style="width:100px">Sink Type</div>      | <div style="width:75px">Type</div>  | Description
-------------------+-----------------------------------------------+-------------------------------------+------------------------------------------------------------
`topic_prefix`     | [Kafka](#kafka), [cloud](#cloud-storage-sink) | [`STRING`](string.html)             | Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.
`tls_enabled`      | [Kafka](#kafka)                               | [`BOOL`](bool.html)                 | If `true`, enable Transport Layer Security (TLS) on the connection to Kafka. This can be used with a `ca_cert` (see below). <br><br>**Default:** `false`
`ca_cert`          | [Kafka](#kafka)                               | [`STRING`](string.html)             | The base64-encoded `ca_cert` file.<br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`client_cert`      | [Kafka](#kafka)                               | [`STRING`](string.html)             | The base64-encoded Privacy Enhanced Mail (PEM) certificate. This is used with `client_key`.
`client_key`       | [Kafka](#kafka)                               | [`STRING`](string.html)             | The base64-encoded private key for the PEM certificate. This is used with `client_cert`.
`sasl_enabled`     | [Kafka](#kafka)                               | [`BOOL`](bool.html)                 | If `true`, the authentication protocol can be set to SCRAM or PLAIN using the `sasl_mechanism` parameter. You must have `tls_enabled` set to `true` to use SASL. <br><br> **Default:** `false`
`sasl_mechanism`   | [Kafka](#kafka)                               | [`STRING`](string.html)             | Can be set to [`SASL-SCRAM-SHA-256`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), [`SASL-SCRAM-SHA-512`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), or [`SASL-PLAIN`](https://docs.confluent.io/current/kafka/authentication_sasl/authentication_sasl_plain.html). A `sasl_user` and `sasl_password` are required. <br><br> **Default:** `SASL-PLAIN`
`sasl_user`        | [Kafka](#kafka)                               | [`STRING`](string.html)             | Your SASL username.
`sasl_password`    | [Kafka](#kafka)                               | [`STRING`](string.html)             | Your SASL password. **Note:** Passwords should be [URL encoded](https://en.wikipedia.org/wiki/Percent-encoding) since the value can contain characters that would cause authentication to fail.
<a name="file-size"></a>`file_size`        | [cloud](#cloud-storage-sink)                  | [`STRING`](string.html)             | The file will be flushed (i.e., written to the sink) when it exceeds the specified file size. This can be used with the [`WITH resolved` option](#options), which flushes on a specified cadence. <br><br>**Default:** `16MB`
`insecure_tls_skip_verify` |  [Kafka](#kafka)                      | [`BOOL`](bool.html)                 | If `true`, disable client-side validation of responses. **Warning:** Use this query parameter with caution, as it creates [MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) vulnerabilities unless combined with another method of authentication. <br><br>**Default:** `false`

### Options

Option | Value | Description
-------|-------|------------
`updated` | N/A | Include updated timestamps with each row.<br><br>If a `cursor` is provided, the "updated" timestamps will match the [MVCC](architecture/storage-layer.html#mvcc) timestamps of the emitted rows, and there is no initial scan. If a `cursor` is not provided, the changefeed will perform an initial scan (as of the time the changefeed was created), and the "updated" timestamp for each change record emitted in the initial scan will be the timestamp of the initial scan. Similarly, when a [backfill is performed for a schema change](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), the "updated" timestamp is set to the first timestamp for when the new schema is valid.
<a name="resolved-option"></a>`resolved` | [`INTERVAL`](interval.html) | Emits [resolved timestamp](stream-data-out-of-cockroachdb-using-changefeeds.html#resolved-def) events per changefeed in a format dependent on the connected sink. Resolved timestamp events do not emit until all ranges in the changefeed have progressed to a specific point in time. <br><br>Set an optional minimal duration between emitting resolved timestamps. Example: `resolved='10s'`. This option will **only** emit a resolved timestamp event if the timestamp has advanced and at least the optional duration has elapsed. If unspecified, all resolved timestamps are emitted as the high-water mark advances.
`envelope` | `key_only` / `wrapped` | Use `key_only` to emit only the key and no value, which is faster if you only want to know when the key changes.<br><br>Default: `envelope=wrapped`
`cursor` | [Timestamp](as-of-system-time.html#parameters)  | Emit any changes after the given timestamp, but does not output the current state of the table first. If `cursor` is not specified, the changefeed starts by doing an initial scan of all the watched rows and emits the current value, then moves to emitting any changes that happen after the scan.<br><br>When starting a changefeed at a specific `cursor`, the `cursor` cannot be before the configured garbage collection window (see [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables)) for the table you're trying to follow; otherwise, the changefeed will error. With default garbage collection settings, this means you cannot create a changefeed that starts more than 25 hours in the past.<br><br>`cursor` can be used to [start a new changefeed where a previous changefeed ended.](#start-a-new-changefeed-where-another-ended)<br><br>Example: `CURSOR='1536242855577149065.0000000000'`
<a name="format"></a>`format` | `json` / `experimental_avro` | Format of the emitted record. Currently, support for [Avro is limited and experimental](#avro-limitations). For mappings of CockroachDB types to Avro types, [see the table below](#avro-types). <br><br>Default: `format=json`.
`confluent_schema_registry` | Schema Registry address | The [Schema Registry](https://docs.confluent.io/current/schema-registry/docs/index.html#sr) address is required to use `experimental_avro`.
`key_in_value` | N/A | Make the [primary key](primary-key.html) of a deleted row recoverable in sinks where each message has a value but not a key (most have a key and value in each message). `key_in_value` is automatically used for these sinks (currently only [cloud storage sinks](#cloud-storage-sink)).
<a name="diff-opt"></a>`diff` | N/A |  Publish a `before` field with each message, which includes the value of the row before the update was applied.
<a name="compression-opt"></a>`compression` | `gzip` |  Compress changefeed data files written to a [cloud storage sink](#cloud-storage-sink). Currently, only [Gzip](https://www.gnu.org/software/gzip/) is supported for compression.
<a name="protect-pause"></a>`protect_data_from_gc_on_pause` | N/A |  When a [changefeed is paused](pause-job.html), ensure that the data needed to [resume the changefeed](resume-job.html) is not garbage collected.<br><br>Note: If you use this option, changefeeds left paused can prevent garbage collection for long periods of time.
<a name="schema-events"></a>`schema_change_events` | `default` / `column_changes` |  The type of schema change event that triggers the behavior specified by the `schema_change_policy` option:<ul><li>`default`: Include all [`ADD COLUMN`](add-column.html) events for columns that have a non-`NULL` [`DEFAULT` value](default-value.html) or are [computed](computed-columns.html), and all [`DROP COLUMN`](drop-column.html) events.</li><li>`column_changes`: Include all schema change events that add or remove any column.</li></ul><br>Default: `schema_change_events=default`
<a name="schema-policy"></a>`schema_change_policy` | `backfill` / `nobackfill` / `stop` |  The behavior to take when an event specified by the `schema_change_events` option occurs:<ul><li>`backfill`: When [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill) are finished, output all watched rows using the new schema.</li><li>`nobackfill`: For [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), perform no logical backfills. The changefeed will still emit any duplicate records for the table being altered, but will not emit the new schema records.</li><li>`stop`: [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), wait for all data preceding the schema change to be resolved before exiting with an error indicating the timestamp at which the schema change occurred. An `error: schema change occurred at <timestamp>` will display in the `cockroach.log` file.</li></ul><br>Default: `schema_change_policy=backfill`
`initial_scan` / `no_initial_scan` | N/A |  Control whether or not an initial scan will occur at the start time of a changefeed. `initial_scan` and `no_initial_scan` cannot be used simultaneously. If neither `initial_scan` nor `no_initial_scan` is specified, an initial scan will occur if there is no `cursor`, and will not occur if there is one. This preserves the behavior from previous releases.<br><br>Default: `initial_scan` <br>If used in conjunction with `cursor`, an initial scan will be performed at the cursor timestamp. If no `cursor` is specified, the initial scan is performed at `now()`.
`full_table_name` | N/A | <span class="version-tag"> New in v21.1: </span> Use fully-qualified table name in topics, subjects, schemas, and record output instead of the default table name. This can prevent unintended behavior when the same table name is present in multiple databases. <br><br>Example: `CREATE CHANGEFEED FOR foo... WITH full_table_name` will create the topic name `defaultdb.public.foo` instead of `foo`.
`avro_schema_prefix` | Schema prefix name               | <span class="version-tag"> New in v21.1: </span> Provide a namespace for the schema of a table in addition to the default, the table name. This allows multiple databases or clusters to share the same schema registry when the same table name is present in multiple databases.<br><br>Example: `CREATE CHANGEFEED FOR foo WITH format=avro, confluent_schema_registry='registry_url', avro_schema_prefix='super'` will register subjects as `superfoo-key` and `superfoo-value` with the namespace `super`.
`kafka_sink_config` | [`STRING`](string.html) | Set fields to configure the required level of message acknowledgement from the Kafka server, the version of the server, and batching parameters for Kafka sinks. See [Advanced Configuration](#kafka-sink-configuration) for more detail on configuring all the available fields for this option. <br><br>Example: `CREATE CHANGEFEED FOR table INTO 'kafka://localhost:9092' WITH kafka_sink_config='{"Flush": {"MaxMessages": 1, "Frequency": "1s"}, "RequiredAcks": "ONE"}'`

{{site.data.alerts.callout_info}}
 Using the `format=experimental_avro`, `envelope=key_only`, and `updated` options together is rejected. `envelope=key_only` prevents any rows with updated fields from being emitted, which makes the `updated` option meaningless.
{{site.data.alerts.end}}

#### Avro limitations

Currently, support for Avro is limited and experimental.

Below are clarifications for particular SQL types and values for Avro changefeeds:

  - [Decimals](decimal.html) must have precision specified.
  - [`BIT`](bit.html) and [`VARBIT`](bit.html) types are encoded as arrays of 64-bit integers.

  {% include {{ page.version.version }}/cdc/avro-bit-varbit.md %}

#### Avro types

Below is a mapping of CockroachDB types to Avro types:

CockroachDB Type | Avro Type | Avro Logical Type
-----------------+-----------+---------------------
[`INT`](int.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BOOL`](bool.html) | [`BOOLEAN`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`FLOAT`](float.html) | [`DOUBLE`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`STRING`](string.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`DATE`](date.html) | [`INT`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`DATE`](https://avro.apache.org/docs/1.8.1/spec.html#Date)
[`TIME`](time.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`TIMESTAMP`](timestamp.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`TIMESTAMPTZ`](timestamp.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`DECIMAL`](decimal.html) | [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`DECIMAL`](https://avro.apache.org/docs/1.8.1/spec.html#Decimal)
[`UUID`](uuid.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INET`](inet.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`JSONB`](jsonb.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`ENUMS`](enum.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INTERVAL`](interval.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`ARRAY`](array.html) | [`ARRAY`](https://avro.apache.org/docs/1.8.1/spec.html#schema_complex) |
[`BIT`](bit.html) | Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`VARBIT`](bit.html)| Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`COLLATE`](collate.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |

#### Topic Naming

By default, a Kafka topic has the same name as the table that a changefeed was created on. If a changefeed was created on multiple tables, the changefeed will write to multiple topics corresponding to those table names. You can specify a [topic prefix](#query-parameters) or use the [`full_table_name` option](#options) to modify this.

You can either manually create a topic in your Kafka cluster before starting the changefeed, or the topic will be automatically created when the changefeed connects to your Kafka cluster.

{{site.data.alerts.callout_info}}
You must have the Kafka cluster setting [`auto.create.topics.enable`](https://kafka.apache.org/documentation/#brokerconfigs_auto.create.topics.enable) set to `true` for automatic topic creation. This will create the topic when the changefeed sends its first message. If you create the consumer before that, you will also need the Kafka consumer configuration [`allow.auto.create.topics`](https://kafka.apache.org/documentation/#consumerconfigs_allow.auto.create.topics) to be set to `true`.
{{site.data.alerts.end}}

Kafka has the following topic limitations:

- [Legal characters](https://github.com/apache/kafka/blob/0.10.2/core/src/main/scala/kafka/common/Topic.scala#L29) are numbers, letters, and `[._-]`.
- The maximum character length of a topic name is 249.
- Topics with a period (`.`) and underscore (`_`) can collide on internal Kafka data structures, so you should use either but not both.
- Characters not accepted by Kafka will be automatically encoded as unicode characters by CockroachDB.

## Advanced changefeed configuration

{{site.data.alerts.callout_danger}}
The configurations and settings explained in these sections will have significant impact on a changefeed's behavior.
{{site.data.alerts.end}}

The following sections describe settings, configurations, and details to tune changefeeds for particular use cases:

* [High durability delivery](#tuning-for-high-durability-delivery)
* [High throughput](#tuning-for-high-throughput)
* [Kafka sinks](#kafka-sink-configuration)

### Tuning for high durability delivery

When designing a system that relies on high durability of message delivery — that is, not missing any message acknowledgement at the downstream sink — consider the following settings and configuration. Before tuning these settings we recommend reading details on our [changefeed at-least-once-delivery guarantee](stream-data-out-of-cockroachdb-using-changefeeds.html#ordering-guarantees).

* Increase the number of seconds before [garbage collection](architecture/storage-layer.html#garbage-collection) with the [`gc.ttlseconds`](configure-replication-zones.html#gc-ttlseconds) setting to provide a higher recoverability window for data if a changefeed fails. For example, if a sink is unavailable, changes are queued until the sink is available again. While the sink is unavailable, changes will be retried until the garbage collection window is reached and then the data is removed.
  * You can also use the [`protect_data_from_gc_on_pause`](#protect-pause) option to protect the changes from garbage collection.
* Determine what a successful write to Kafka is with the [`kafka_sink_config: {"RequiredAcks": "ALL"}`](#kafka-required-acks) option, which provides the highest consistency level.
* Set the [`changefeed.memory.per_changefeed_limit`](cluster-settings.html) cluster setting to a higher limit to give more memory for buffering per single changefeed. Increasing this limit is useful to avoid errors in situations where the sink is unreachable and the memory buffer fills up.
* Use [Kafka](#kafka) or [cloud storage](#cloud-storage-sink) sinks when tuning for high durability in changefeeds.
* Ensure that data is ingested downstream in its new format after a schema change by using the [`schema_change_events`](#schema-events) and [`schema_schange_policy`](#schema-policy) options. For example, setting `schema_change_events=column_changes` and `schema_change_policy=stop` will trigger an error to the `cockroach.log` file on a [schema change](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill) and the changefeed to fail.

### Tuning for high throughput

When designing a system that needs to emit a lot of changefeed messages, whether it be steady traffic or a burst in traffic, consider the following settings and configuration:

* Set the [`resolved`](#resolved-option) option to a higher duration (e.g. 10 minutes or more) to reduce emitted messages.
* Batch messages to your sink. See the [`Flush`](#kafka-flush) parameter for the `kafka_sink_config` option. When using cloud storage sinks, use the [`file_size`](#file-size) parameter to flush a file when it exceeds the specified size.
* Set the [`changefeed.memory.per_changefeed_limit`](cluster-settings.html) cluster setting to a higher limit to give more memory for buffering for a changefeed. This is useful in situations of heavy traffic to avoid an error due to the memory buffer overfilling.
* Use `avro` as the emitted message [format](#format) option with Kafka sinks; JSON encoding can potentially create a slowdown.
* Use the [`compression` option](#compression-opt) in cloud storage sinks with JSON to compress the changefeed data files.
* Increase the [`changefeed.backfill.concurrent_scan_requests` setting](cluster-settings.html), which controls the number of concurrent scan requests per node issued during a backfill event. The default behavior, when this setting is at `0`, is that the number of scan requests will be 3 times the number of nodes in the cluster (to a maximum of 100). While increasing this number will allow for higher throughput, it **will increase the cluster load overall**, including CPU and IO usage.

### Kafka Sink Configuration

The `kafka_sink_config` option allows configuration of a changefeed's message delivery, Kafka server version, and batching parameters.

{{site.data.alerts.callout_danger}}
Each of the following settings have significant impact on a changefeed's behavior, such as latency. For example, it is possible to configure batching parameters to be very high, which would negatively impact changefeed latency. As a result it would take a long time to see messages coming through to the sink. Also, large batches may be rejected by the Kafka server unless it's separately configured to accept a high [`max.message.bytes`](https://kafka.apache.org/documentation/#brokerconfigs_message.max.bytes).
{{site.data.alerts.end}}

~~~
kafka_sink_config='{"Flush": {"MaxMessages": 1, "Frequency": "1s"}, "Version": "0.8.2.0", "RequiredAcks": "ONE" }'
~~~

The configurable fields include:

<a name ="kafka-flush"></a>

* `"Flush"."MaxMessages"` and `"Flush"."Frequency"`: These are configurable batching parameters depending on latency and throughput needs. For example, if `"MaxMessages"` is set to 1000 and `"Frequency"` to 1 second, it will flush to Kafka either after 1 second or after 1000 messages are batched, whichever comes first. It's important to consider that if there are not many messages then a `"1s"` frequency will add 1 second latency. However, if there is a larger influx of messages these will be flushed quicker.
  * `"MaxMessages"`: sets the maximum number of messages the producer will send in a single broker request. Increasing this value allows all messages to be sent in a batch. Default: `1`. Type: `INT`.
  * `"Frequency"`: sets the maximum time that messages will be batched. Default: `"0s"`. Type: `INTERVAL`.

* `"Version"`: sets the appropriate Kafka cluster version, which can be used to connect to [Kafka versions < v1.0](https://docs.confluent.io/platform/current/installation/versions-interoperability.html) (`kafka_sink_config='{"Version": "0.8.2.0"}'`). Default: `"1.0.0.0"` Type: `STRING`.

<a name="kafka-required-acks"></a>

* `"RequiredAcks"`: specifies what a successful write to Kafka is. CockroachDB [guarantees at least once delivery of messages](stream-data-out-of-cockroachdb-using-changefeeds.html#ordering-guarantees) — this value defines the _delivery_. Type: `STRING`. The possible values are:
  * `"ONE"`: a write to Kafka is successful once the leader node has committed and acknowledged the write. Note that this has the potential risk of dropped messages; if the leader node acknowledges before replicating to a quorum of other Kafka nodes, but then fails. **This is the default value.**
  * `"NONE"`: no Kafka brokers are required to acknowledge that they have committed the message. This will decrease latency and increase throughput, but comes at the cost of lower consistency.
  * `"ALL"`: a quorum must be reached (that is, most Kafka brokers have committed the message) before the leader can acknowledge. This is the highest consistency level.

## Responses

### Messages

The messages (i.e., keys and values) emitted to a sink are specific to the [`envelope`](#options). The default format is `wrapped`, and the output messages are composed of the following:

- **Key**: An array always composed of the row's `PRIMARY KEY` field(s) (e.g., `[1]` for `JSON` or `{"id":{"long":1}}` for Avro).
- **Value**:
    - One of three possible top-level fields:
        - `after`, which contains the state of the row after the update (or `null`' for `DELETE`s).
        - `updated`, which contains the updated timestamp.
        - `resolved`, which is emitted for records representing resolved timestamps. These records do not include an "after" value since they only function as checkpoints.
    - For [`INSERT`](insert.html) and [`UPDATE`](update.html), the current state of the row inserted or updated.
    - For [`DELETE`](delete.html), `null`.

For example:

Statement                                      | Response
-----------------------------------------------+-----------------------------------------------------------------------
`INSERT INTO office_dogs VALUES (1, 'Petee');` | JSON: `[1]	{"after": {"id": 1, "name": "Petee"}}` </br>Avro: `{"id":{"long":1}}	{"after":{"office_dogs":{"id":{"long":1},"name":{"string":"Petee"}}}}`
`DELETE FROM office_dogs WHERE name = 'Petee'` | JSON: `[1]	{"after": null}` </br>Avro: `{"id":{"long":1}}	{"after":null}`

### Files

The files emitted to a sink use the following naming conventions:

- [General file format](#general-file-format)
- [Resolved file format](#resolved-file-format)

{{site.data.alerts.callout_info}}
The timestamp format is `YYYYMMDDHHMMSSNNNNNNNNNLLLLLLLLLL`.
{{site.data.alerts.end}}

#### General file format

~~~
/[date]/[timestamp]-[uniquer]-[topic]-[schema-id]
~~~

For example:

~~~
/2020-04-02/202004022058072107140000000000000-56087568dba1e6b8-1-72-00000000-test_table-1.ndjson
~~~

#### Resolved file format

~~~
/[date]/[timestamp].RESOLVED
~~~

For example:

~~~
/2020-04-04/202004042351304139680000000000000.RESOLVED
~~~

## Examples

### Create a changefeed connected to Kafka

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'kafka://host:port'
  WITH updated, resolved;
~~~
~~~
+--------------------+
|       job_id       |
+--------------------+
| 360645287206223873 |
+--------------------+
(1 row)
~~~

For more information on how to create a changefeed connected to Kafka, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-kafka).

### Create a changefeed connected to Kafka using Avro

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'kafka://host:port'
  WITH format = experimental_avro, confluent_schema_registry = <schema_registry_address>;
~~~
~~~
+--------------------+
|       job_id       |
+--------------------+
| 360645287206223873 |
+--------------------+
(1 row)
~~~

For more information on how to create a changefeed that emits an [Avro](https://avro.apache.org/docs/1.8.2/spec.html) record, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-kafka-using-avro).

### Create a changefeed connected to a cloud storage sink

{{site.data.alerts.callout_danger}}
**This is an experimental feature.** The interface and output are subject to change.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'experimental-scheme://host?parameters'
  WITH updated, resolved;
~~~
~~~
+--------------------+
|       job_id       |
+--------------------+
| 360645287206223873 |
+--------------------+
(1 row)
~~~

For more information on how to create a changefeed connected to a cloud storage sink, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-a-cloud-storage-sink).

### Manage a changefeed

Use the following SQL statements to pause, resume, and cancel a changefeed.

{{site.data.alerts.callout_info}}
Changefeed-specific SQL statements (e.g., `CANCEL CHANGEFEED`) will be added in the future.
{{site.data.alerts.end}}

#### Pause a changefeed

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

#### Resume a paused changefeed

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOB job_id;
~~~

For more information, see [`RESUME JOB`](resume-job.html).

#### Cancel a changefeed

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

#### Configuring all changefeeds

{% include {{ page.version.version }}/cdc/configure-all-changefeed.md %}

### Start a new changefeed where another ended

Find the [high-water timestamp](stream-data-out-of-cockroachdb-using-changefeeds.html#monitor-a-changefeed) for the ended changefeed:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.jobs WHERE job_id = <job_id>;
~~~
~~~
        job_id       |  job_type  | ... |      high_water_timestamp      | error | coordinator_id
+--------------------+------------+ ... +--------------------------------+-------+----------------+
  383870400694353921 | CHANGEFEED | ... | 1537279405671006870.0000000000 |       |              1
(1 row)
~~~

Use the `high_water_timestamp` to start the new changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'kafka//host:port'
  WITH cursor = '<high_water_timestamp>';
~~~

Note that because the cursor is provided, the initial scan is not performed.

## See also

- [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html)
- [Other SQL Statements](sql-statements.html)
- [Changefeed Dashboard](ui-cdc-dashboard.html)
