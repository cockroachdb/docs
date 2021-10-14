---
title: CREATE CHANGEFEED
summary: The CREATE CHANGEFEED statement creates a changefeed of row-level change subscriptions in a configurable format to a configurable sink.
toc: true
---

{{site.data.alerts.callout_info}}
`CREATE CHANGEFEED` is an [{{ site.data.products.enterprise }}-only](enterprise-licensing.html) feature. For the core version, see [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html).
{{site.data.alerts.end}}

The `CREATE CHANGEFEED` [statement](sql-statements.html) creates a new {{ site.data.products.enterprise }} changefeed, which targets an allowlist of tables called "watched rows".  Every change to a watched row is emitted as a record in a configurable format (`JSON` or Avro) to a configurable sink ([Kafka](https://kafka.apache.org/), a [cloud storage sink](#cloud-storage-sink), or a [webhook sink](#webhook-sink)). You can [create](#create-a-changefeed-connected-to-kafka), [pause](#pause-a-changefeed), [resume](#resume-a-paused-changefeed), or [cancel](#cancel-a-changefeed) an {{ site.data.products.enterprise }} changefeed.

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
`scheme`           | The type of sink: [`kafka`](#kafka), any [cloud storage sink](#cloud-storage-sink), or [webhook sink](#webhook-sink).
`host`             | The sink's hostname or IP address.
`port`             | The sink's port.
`query_parameters` | The sink's [query parameters](#query-parameters).

#### Kafka

Example of a Kafka sink URI:

~~~
'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user=petee&sasl_password=bones&sasl_mechanism=SASL-SCRAM-SHA-256'
~~~

#### Cloud storage sink

Use a cloud storage sink to deliver changefeed data to OLAP or big data systems without requiring transport via Kafka.

Example of a cloud storage sink URI with Amazon S3:

~~~
's3://acme-co/employees?AWS_ACCESS_KEY_ID=123&AWS_SECRET_ACCESS_KEY=456'
~~~

Some considerations when using cloud storage sinks:

- Cloud storage sinks only work with `JSON` and emit newline-delimited `JSON` files.
- The supported cloud schemes are: `s3`, `gs`, `azure`, `http`, and `https`.
- Both `http://` and `https://` are cloud storage sinks, **not** webhook sinks. It is necessary to prefix the scheme with `webhook-` for [webhook sinks](#webhook-sink).

[Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html#example-file-urls) provides more detail on sink URI structure and authentication to cloud storage sinks.

#### Webhook sink

{{site.data.alerts.callout_info}}
The webhook sink is currently in **beta**. For more information, read about its usage considerations available [parameters](../v21.2/create-changefeed.html#parameters), and [options](../v21.2/create-changefeed.html#options) below.
{{site.data.alerts.end}}

<span class="version-tag">New in v21.2:</span> Use a webhook sink to deliver changefeed messages to an arbitrary HTTP endpoint.

Example of a webhook sink URL:

~~~
'webhook-https://{your-webhook-endpoint}?insecure_tls_skip_verify=true'
~~~

The following are considerations when using the webhook sink:

* Only supports HTTPS. Use the [`insecure_tls_skip_verify`](#tls-skip-verify) parameter when testing to disable certificate verification; however, this still requires HTTPS and certificates.
* Only supports JSON output format.
* There is no concurrency configurability.

#### Query parameters

{% include {{ page.version.version }}/cdc/url-encoding.md %}

Query parameters include:

Parameter          | <div style="width:100px">Sink Type</div>      | <div style="width:75px">Type</div>  | Description
-------------------+-----------------------------------------------+-------------------------------------+------------------------------------------------------------
<span class="version-tag"> New in v21.2: </span> <a name="topic-name-param"></a>`topic_name`       | [Kafka](#kafka)                               | [`STRING`](string.html)             | Allows arbitrary topic naming for Kafka topics. See the [Kafka topic naming limitations](#topic-naming) for detail on supported characters etc. <br><br>For example, `CREATE CHANGEFEED FOR foo,bar INTO 'kafka://sink?topic_name=all'` will emit all records to a topic named `all`. Note that schemas will still be registered separately. Can be combined with the [`topic_prefix` option](#topic-prefix-param). <br><br>**Default:** table name.
<a name="topic-prefix-param"></a>`topic_prefix`     | [Kafka](#kafka), [cloud](#cloud-storage-sink) | [`STRING`](string.html)             | Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.
`tls_enabled`      | [Kafka](#kafka)                               | [`BOOL`](bool.html)                 | If `true`, enable Transport Layer Security (TLS) on the connection to Kafka. This can be used with a `ca_cert` (see below). <br><br>**Default:** `false`
`ca_cert`          | [Kafka](#kafka), [webhook](#webhook-sink), ([Confluent schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html)) | [`STRING`](string.html)            | The base64-encoded `ca_cert` file. Specify `ca_cert` for a Kafka sink, webhook sink, and/or a Confluent schema registry. <br><br>For usage with a Kafka sink, see [Kafka Sink URI](#kafka). <br><br> It's necessary to state `https` in the schema registry's address when passing `ca_cert`: <br>`confluent_schema_registry='https://schema_registry:8081?ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ'` <br> See [`confluent_schema_registry`](#confluent-registry) for more detail on using this option. <br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`client_cert`      | [Kafka](#kafka)                               | [`STRING`](string.html)             | The base64-encoded Privacy Enhanced Mail (PEM) certificate. This is used with `client_key`.
`client_key`       | [Kafka](#kafka)                               | [`STRING`](string.html)             | The base64-encoded private key for the PEM certificate. This is used with `client_cert`.
`sasl_enabled`     | [Kafka](#kafka)                               | [`BOOL`](bool.html)                 | If `true`, the authentication protocol can be set to SCRAM or PLAIN using the `sasl_mechanism` parameter. You must have `tls_enabled` set to `true` to use SASL. <br><br> **Default:** `false`
`sasl_mechanism`   | [Kafka](#kafka)                               | [`STRING`](string.html)             | Can be set to [`SASL-SCRAM-SHA-256`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), [`SASL-SCRAM-SHA-512`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), or [`SASL-PLAIN`](https://docs.confluent.io/current/kafka/authentication_sasl/authentication_sasl_plain.html). A `sasl_user` and `sasl_password` are required. <br><br> **Default:** `SASL-PLAIN`
`sasl_user`        | [Kafka](#kafka)                               | [`STRING`](string.html)             | Your SASL username.
`sasl_password`    | [Kafka](#kafka)                               | [`STRING`](string.html)             | Your SASL password.
`file_size`        | [cloud](#cloud-storage-sink)                  | [`STRING`](string.html)             | The file will be flushed (i.e., written to the sink) when it exceeds the specified file size. This can be used with the [`WITH resolved` option](#options), which flushes on a specified cadence. <br><br>**Default:** `16MB`
<a name="tls-skip-verify"></a>`insecure_tls_skip_verify` |  [Kafka](#kafka), [webhook](#webhook-sink)                    | [`BOOL`](bool.html)                 | If `true`, disable client-side validation of responses. Note that a CA certificate is still required; this parameter means that the client will not verify the certificate. **Warning:** Use this query parameter with caution, as it creates [MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) vulnerabilities unless combined with another method of authentication. <br><br>**Default:** `false`

### Options

Option | Value | Description
-------|-------|------------
`updated` | N/A | Include updated timestamps with each row.<br><br>If a `cursor` is provided, the "updated" timestamps will match the [MVCC](architecture/storage-layer.html#mvcc) timestamps of the emitted rows, and there is no initial scan. If a `cursor` is not provided, the changefeed will perform an initial scan (as of the time the changefeed was created), and the "updated" timestamp for each change record emitted in the initial scan will be the timestamp of the initial scan. Similarly, when a [backfill is performed for a schema change](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), the "updated" timestamp is set to the first timestamp for when the new schema is valid.
<a name="resolved-option"></a>`resolved` | [`INTERVAL`](interval.html) | Emits [resolved timestamp](stream-data-out-of-cockroachdb-using-changefeeds.html#resolved-def) events per changefeed in a format dependent on the connected sink. Resolved timestamp events do not emit until all ranges in the changefeed have progressed to a specific point in time. <br><br>Set an optional minimal duration between emitting resolved timestamps. Example: `resolved='10s'`. This option will **only** emit a resolved timestamp event if the timestamp has advanced and at least the optional duration has elapsed. If unspecified, all resolved timestamps are emitted as the high-water mark advances.
`envelope` | `key_only` / `wrapped` | Use `key_only` to emit only the key and no value, which is faster if you only want to know when the key changes.<br><br>Default: `envelope=wrapped`
`cursor` | [Timestamp](as-of-system-time.html#parameters)  | Emit any changes after the given timestamp, but does not output the current state of the table first. If `cursor` is not specified, the changefeed starts by doing an initial scan of all the watched rows and emits the current value, then moves to emitting any changes that happen after the scan.<br><br>When starting a changefeed at a specific `cursor`, the `cursor` cannot be before the configured garbage collection window (see [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables)) for the table you're trying to follow; otherwise, the changefeed will error. With default garbage collection settings, this means you cannot create a changefeed that starts more than 25 hours in the past.<br><br>`cursor` can be used to [start a new changefeed where a previous changefeed ended.](#start-a-new-changefeed-where-another-ended)<br><br>Example: `CURSOR='1536242855577149065.0000000000'`
`format` | `json` / `avro` | Format of the emitted record. For mappings of CockroachDB types to Avro types, [see the table](#avro-types) and detail on [Avro limitations](#avro-limitations) below. <br><br>Default: `format=json`.
<a name="confluent-registry"></a>`confluent_schema_registry` | Schema Registry address | The [Schema Registry](https://docs.confluent.io/current/schema-registry/docs/index.html#sr) address is required to use `avro`.
`key_in_value` | N/A | Make the [primary key](primary-key.html) of a deleted row recoverable in sinks where each message has a value but not a key (most have a key and value in each message). `key_in_value` is automatically used for [cloud storage sinks](#cloud-storage-sink) and [webhook sinks](#webhook-sink).
`diff` | N/A |  Publish a `before` field with each message, which includes the value of the row before the update was applied.
`compression` | `gzip` |  Compress changefeed data files written to a [cloud storage sink](#cloud-storage-sink). Currently, only [Gzip](https://www.gnu.org/software/gzip/) is supported for compression.
`on_error` | `pause` / `fail` | <span class="version-tag">New in v21.2:</span> Use `on_error` to pause the changefeed instead of sending it into a terminal failure state in situations such as when a changefeed cannot connect to a downstream sink for an extended period of time. Use with [`protect_data_from_gc_on_pause`](#protect-pause) to protect changes from [garbage collection](configure-replication-zones.html#gc-ttlseconds). <br><br>Default: `on_error=fail`
<a name="protect-pause"></a>`protect_data_from_gc_on_pause` | N/A |  When a [changefeed is paused](pause-job.html), ensure that the data needed to [resume the changefeed](resume-job.html) is not garbage collected.<br><br>Note: If you use this option, changefeeds left paused can prevent garbage collection for long periods of time.
`schema_change_events` | `default` / `column_changes` |  The type of schema change event that triggers the behavior specified by the `schema_change_policy` option:<ul><li>`default`: Include all [`ADD COLUMN`](add-column.html) events for columns that have a non-`NULL` [`DEFAULT` value](default-value.html) or are [computed](computed-columns.html), and all [`DROP COLUMN`](drop-column.html) events.</li><li>`column_changes`: Include all all schema change events that add or remove any column.</li></ul><br>Default: `schema_change_events=default`
`schema_change_policy` | `backfill` / `nobackfill` / `stop` |  The behavior to take when an event specified by the `schema_change_events` option occurs:<ul><li>`backfill`: When [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill) are finished, output all watched rows using the new schema.</li><li>`nobackfill`: For [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), perform no logical backfills.</li><li>`stop`: [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), wait for all data preceding the schema change to be resolved before exiting with an error indicating the timestamp at which the schema change occurred. An `error: schema change occurred at <timestamp>` will display in the `cockroach.log` file.</li></ul><br>Default: `schema_change_policy=backfill`
`initial_scan` / `no_initial_scan` | N/A |  Control whether or not an initial scan will occur at the start time of a changefeed. `initial_scan` and `no_initial_scan` cannot be used simultaneously. If neither `initial_scan` nor `no_initial_scan` is specified, an initial scan will occur if there is no `cursor`, and will not occur if there is one. This preserves the behavior from previous releases.<br><br>Default: `initial_scan` <br>If used in conjunction with `cursor`, an initial scan will be performed at the cursor timestamp. If no `cursor` is specified, the initial scan is performed at `now()`.
<a name="full-table-option"></a>`full_table_name` | N/A | Use fully-qualified table name in topics, subjects, schemas, and record output instead of the default table name. This can prevent unintended behavior when the same table name is present in multiple databases. <br><br>Example: `CREATE CHANGEFEED FOR foo... WITH full_table_name` will create the topic name `defaultdb.public.foo` instead of `foo`.
`avro_schema_prefix` | Schema prefix name               | Provide a namespace for the schema of a table in addition to the default, the table name. This allows multiple databases or clusters to share the same schema registry when the same table name is present in multiple databases.<br><br>Example: `CREATE CHANGEFEED FOR foo WITH format=avro, confluent_schema_registry='registry_url', avro_schema_prefix='super'` will register subjects as `superfoo-key` and `superfoo-value` with the namespace `super`.
`webhook_client_timeout` | [`INTERVAL`](interval.html)          | <span class="version-tag">New in v21.2:</span> If a response is not recorded from the sink within this timeframe, it will error and retry to connect. Note this must be a positive value. <br><br>**Default:** `"3s"`
`webhook_auth_header`    | [`STRING`](string.html)            | <span class="version-tag">New in v21.2:</span> Pass a value (password, token etc.) to the HTTP [Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) with a webhook request for a "Basic" HTTP authentication scheme. <br><br> Example: With a username of "user" and password of "pwd", add a colon between "user:pwd" and then base64 encode, which results in "dXNlcjpwd2Q=". `WITH webhook_auth_header='Basic dXNlcjpwd2Q='`.
`topic_in_value`         | [`BOOL`](bool.html)              | <span class="version-tag">New in v21.2:</span> Set to include the topic in each emitted row update. Note this is automatically set for [webhook sinks](#webhook-sink).
`webhook_sink_config`    | [`STRING`](string.html)          | <span class="version-tag">New in v21.2:</span> Set fields to configure sink batching and retries. The schema is as follows:<br><br> `{ "Flush": { "Messages": ..., "Bytes": ..., "Frequency": ..., }, "Retry": {"Max": ..., "Backoff": ..., } }`. <br><br>**Note** that if either `Messages` or `Bytes` are nonzero, then a non-zero value for `Frequency` must be provided. <br><br>See the [Webhook sink configuration section](#webhook-sink-configuration) for more details on using this option.

{{site.data.alerts.callout_info}}
 Using the `format=avro`, `envelope=key_only`, and `updated` options together is rejected. `envelope=key_only` prevents any rows with updated fields from being emitted, which makes the `updated` option meaningless.
{{site.data.alerts.end}}

#### Webhook sink configuration

<span class="version-tag">New in v21.2:</span> The `webhook_sink_config` option allows the changefeed flushing and retry behavior of your webhook sink to be configured.

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


#### Avro limitations

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
[`DECIMAL`](decimal.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive), [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`DECIMAL`](https://avro.apache.org/docs/1.8.1/spec.html#Decimal)
[`UUID`](uuid.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INET`](inet.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`JSONB`](jsonb.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`ENUMS`](enum.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INTERVAL`](interval.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`ARRAY`](array.html) | [`ARRAY`](https://avro.apache.org/docs/1.8.1/spec.html#schema_complex) |
[`BIT`](bit.html) | Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`VARBIT`](bit.html)| Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`COLLATE`](collate.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |

{{site.data.alerts.callout_info}}
The `DECIMAL` type is a union between Avro `STRING` and Avro `DECIMAL` types.
{{site.data.alerts.end}}

#### Topic Naming

By default, a Kafka topic has the same name as the table that a changefeed was created on. If a changefeed was created on multiple tables, the changefeed will write to multiple topics corresponding to those table names.

To modify the default topic naming, you can specify a [topic prefix](#topic-prefix-param), [an arbitrary topic name](#topic-name-param), or use the [`full_table_name` option](#full-table-option). Using the [`topic_name`](#topic-name-param) parameter, you can specify an arbitrary topic name and feed all tables into that topic.

You can either manually create a topic in your Kafka cluster before starting the changefeed, or the topic will be automatically created when the changefeed connects to your Kafka cluster.

{{site.data.alerts.callout_info}}
You must have the Kafka cluster setting [`auto.create.topics.enable`](https://kafka.apache.org/documentation/#brokerconfigs_auto.create.topics.enable) set to `true` for automatic topic creation. This will create the topic when the changefeed sends its first message. If you create the consumer before that, you will also need the Kafka consumer configuration [`allow.auto.create.topics`](https://kafka.apache.org/documentation/#consumerconfigs_allow.auto.create.topics) to be set to `true`.
{{site.data.alerts.end}}

Kafka has the following topic limitations:

- [Legal characters](https://github.com/apache/kafka/blob/0.10.2/core/src/main/scala/kafka/common/Topic.scala#L29) are numbers, letters, and `[._-]`.
- The maximum character length of a topic name is 249.
- Topics with a period (`.`) and underscore (`_`) can collide on internal Kafka data structures, so you should use either but not both.
- Characters not accepted by Kafka will be automatically encoded as unicode characters by CockroachDB.

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

For webhook sinks, the response format comes as a batch of changefeed messages with a `payload` and `length`. Batching is done with a per-key guarantee, which means that the messages with the same key are considered for the same batch. Note that batches are only collected for row updates and not [resolved timestamps](#resolved-option):

~~~
{"payload": [{"after" : {"a" : 1, "b" : "a"}, "key": [1], "topic": "foo"}, {"after": {"a": 1, "b": "b"}, "key": [1], "topic": "foo" }], "length":2}
~~~

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

{{site.data.alerts.callout_info}}
Currently, [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) connected to [Kafka versions < v1.0](https://docs.confluent.io/platform/current/installation/versions-interoperability.html) are not supported in CockroachDB v21.1 and later.
{{site.data.alerts.end}}

For more information on how to create a changefeed connected to Kafka, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html#create-a-changefeed-connected-to-kafka).

### Create a changefeed connected to Kafka using Avro

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'kafka://host:port'
  WITH format = avro, confluent_schema_registry = <schema_registry_address>;
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'scheme://host?parameters'
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

### Create a changefeed connected to a webhook sink

{% include {{ page.version.version }}/cdc/webhook-beta.md %}

{% include copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE name, name2, name3
  INTO 'webhook-https://{your-webhook-endpoint}?insecure_tls_skip_verify=true'
  WITH updated;
~~~

~~~
+---------------------+
|      job_id         |
----------------------+
| 687842491801632769  |
+---------------------+
(1 row)
~~~

### Manage a changefeed

<span class="version-tag">New in v21.2:</span> For enterprise changefeeds, use [`SHOW CHANGEFEED JOBS`](show-jobs.html) to check the status of your changefeed jobs:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CHANGEFEED JOBS;
~~~

Use the following SQL statements to pause, resume, or cancel a changefeed.

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
