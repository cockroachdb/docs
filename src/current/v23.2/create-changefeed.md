---
title: CREATE CHANGEFEED
summary: The CREATE CHANGEFEED statement creates a changefeed of row-level change subscriptions in a configurable format to a configurable sink.
toc: true
docs_area: reference.sql
---

The `CREATE CHANGEFEED` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates a new {{ site.data.products.enterprise }} changefeed, which targets an allowlist of tables called "watched rows".  Every change to a watched row is emitted as a record in a configurable format (`JSON` or Avro) to a configurable sink ([Kafka](https://kafka.apache.org/), [Google Cloud Pub/Sub](https://cloud.google.com/pubsub), a [cloud storage sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink), or a [webhook sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink)). You can [create](#examples), [pause](#pause-a-changefeed), [resume](#resume-a-paused-changefeed), [alter]({% link {{ page.version.version }}/alter-changefeed.md %}), or [cancel](#cancel-a-changefeed) an {{ site.data.products.enterprise }} changefeed.

To get started with changefeeds, refer to the [Create and Configure Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}) page for important usage considerations. For detail on how changefeeds emit messages, refer to the [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %}) page.

The [examples](#examples) on this page provide the foundational syntax of the `CREATE CHANGEFEED` statement. For examples on more specific use cases with changefeeds, refer to the following pages:

- [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %})
- [Changefeeds on Tables with Column Families]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %})
- [Export Data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %})

{% include {{ page.version.version }}/cdc/recommendation-monitoring-pts.md %}

## Required privileges

{% include {{ page.version.version }}/cdc/privilege-model.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_changefeed.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table (or tables in a comma separated list) to create a changefeed for.<br><br>**Note:** Before creating a changefeed, consider the number of changefeeds versus the number of tables to include in a single changefeed. Each scenario can have an impact on total memory usage or changefeed performance. Refer to [Create and Configure Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}) for more detail.
`sink` | The location of the configurable sink. The scheme of the URI indicates the type. For more information, refer to [Sink URI](#sink-uri).<br><br>**Note:** If you create a changefeed without a sink, your changefeed will run like a [basic changefeed]({% link {{ page.version.version }}/changefeed-for.md %}) sending messages to the SQL client. For more detail, refer to the [Create and Configure Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#create) page.
`option` / `value` | For a list of available options and their values, refer to [Options](#options).

### CDC query parameters

Change data capture queries allow you to define the change data emitted to your sink when you create a changefeed. See the [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %}) page for detail on the functionality, syntax, and use cases for changefeeds created with queries.

Parameter | Description
----------|------------
`sink` | The location of the configurable sink. The scheme of the URI indicates the type. For more information, see [Sink URI](#sink-uri).
`option` / `value` | For a list of available options and their values, see [Options](#options).
`target_list` | The columns to emit data from.
`changefeed_target_expr` | The target table for the changefeed.
`opt_where_clause` | An optional `WHERE` clause to apply filters to the table.

### Sink URI

This section provides example URIs for each of the sinks that CockroachDB changefeeds support. For more comprehensive detail of using and configuring each sink, refer to the [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page.

~~~
'{scheme}://{host}:{port}?{query_parameters}'
~~~

URI Component      | Description
-------------------+------------------------------------------------------------------
`scheme`           | The type of sink: [`kafka`](#kafka), [`gcpubsub`](#google-cloud-pub-sub), any [cloud storage sink](#cloud-storage), or [webhook sink](#webhook).
`host`             | The sink's hostname or IP address.
`port`             | The sink's port.
`query_parameters` | The sink's [query parameters](#query-parameters).

{% include {{ page.version.version }}/cdc/sink-URI-external-connection.md %}

#### Kafka

Example of a [Kafka sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) URI:

~~~
'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SCRAM-SHA-256'
~~~

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/cdc/kafka-vpc-limitation.md %}
{{site.data.alerts.end}}

#### Confluent Cloud

{% include_cached new-in.html version="v23.2" %} Example of a [Confluent Cloud sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) URI:

~~~
'confluent-cloud://pkc-lzvrd.us-west4.gcp.confluent.cloud:9092?api_key={API key}&api_secret={url-encoded API secret}'
~~~

#### Google Cloud Pub/Sub

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Example of a Google Cloud Pub/Sub sink URI:

~~~
'gcpubsub://{project name}?region={region}&topic_name={topic name}&AUTH=specified&CREDENTIALS={base64-encoded key}'
~~~

In CockroachDB v23.2 and later, the `changefeed.new_pubsub_sink_enabled` cluster setting is enabled by default, which provides improved throughput. For details on the changes to the message format, refer to [Pub/Sub sink messages]({% link {{ page.version.version }}/changefeed-sinks.md %}#pub-sub-sink-messages).

[Use Cloud Storage for Bulk Operations]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) explains the requirements for the authentication parameter with `specified` or `implicit`. Refer to [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub) for further consideration.

#### Cloud Storage

The following are example file URLs for each of the cloud storage schemes:

{% include {{ page.version.version }}/cdc/list-cloud-changefeed-uris.md %}

For detail on authentication to cloud storage, refer to the [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) page. Refer to [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink) for considerations when using cloud storage.

#### Webhook

Example of a webhook URI:

~~~
'webhook-https://{your-webhook-endpoint}?insecure_tls_skip_verify=true'
~~~

Refer to [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink) for specifics on webhook sink configuration.

### Query parameters

{% include {{ page.version.version }}/cdc/url-encoding.md %}

Query parameters include:

Parameter          | <div style="width:100px">Sink Type</div>      | <div style="width:75px">Type</div>  | Description
-------------------+-----------------------------------------------+-------------------------------------+------------------------------------------------------------
`ASSUME_ROLE` | [Amazon S3]({% link {{ page.version.version }}/changefeed-sinks.md %}) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | {% include {{ page.version.version }}/misc/assume-role-description.md %}
`AUTH` | [Amazon S3]({% link {{ page.version.version }}/changefeed-sinks.md %}), [Google Cloud Storage](#cloud-storage), [Google Cloud Pub/Sub](#google-cloud-pub-sub), [Azure Blob Storage](#cloud-storage) | The authentication parameter can define either `specified` (default) or `implicit` authentication. To use `specified` authentication, pass your [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts) credentials with the URI. To use `implicit` authentication, configure these credentials via an environment variable. Refer to the [Cloud Storage Authentication page]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) page for examples of each of these.
<span class="version-tag">New in v23.2:</span> `api_key` | [Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The API key created for the cluster in Confluent Cloud.
<span class="version-tag">New in v23.2:</span>`api_secret` | [Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The API key's secret generated in Confluent Cloud. **Note:** This must be [URL-encoded](https://www.urlencoder.org/) before passing into the connection string.
`ca_cert`          | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), [Confluent schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html) | [`STRING`]({% link {{ page.version.version }}/string.md %})            | The base64-encoded `ca_cert` file. Specify `ca_cert` for a Kafka sink, webhook sink, and/or a Confluent schema registry. <br><br>For usage with a Kafka sink, see [Kafka Sink URI]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka). <br><br> It's necessary to state `https` in the schema registry's address when passing `ca_cert`: <br>`confluent_schema_registry='https://schema_registry:8081?ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ'` <br> See [`confluent_schema_registry`](#confluent-registry) for more detail on using this option. <br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`client_cert`      | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), [Confluent schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html) | [`STRING`]({% link {{ page.version.version }}/string.md %})             | The base64-encoded Privacy Enhanced Mail (PEM) certificate. This is used with `client_key`.
`client_key`       | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), [Confluent schema registry](https://docs.confluent.io/platform/current/schema-registry/index.html) | [`STRING`]({% link {{ page.version.version }}/string.md %})             | The base64-encoded private key for the PEM certificate. This is used with `client_cert`.<br><br>{% include {{ page.version.version }}/cdc/client-key-encryption.md %}
<a name="file-size"></a>`file_size`        | [cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink)                  | [`STRING`]({% link {{ page.version.version }}/string.md %})             | The file will be flushed (i.e., written to the sink) when it exceeds the specified file size. This can be used with the [`WITH resolved` option](#options), which flushes on a specified cadence. When you change or increase `file_size`, ensure that you adjust the `changefeed.memory.per_changefeed_limit` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), which has a default of `512MiB`. Buffering messages can quickly reach this limit if you have increased the file size. Refer to [Advanced Changefeed Configuration]({% link {{ page.version.version }}/advanced-changefeed-configuration.md %}) for more detail. <br><br>**Default:** `16MB`
<a name="tls-skip-verify"></a>`insecure_tls_skip_verify` |  [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink)                    | [`BOOL`]({% link {{ page.version.version }}/bool.md %})                 | If `true`, disable client-side validation of responses. Note that a CA certificate is still required; this parameter means that the client will not verify the certificate. **Warning:** Use this query parameter with caution, as it creates [MITM](https://wikipedia.org/wiki/Man-in-the-middle_attack) vulnerabilities unless combined with another method of authentication. <br><br>**Default:** `false`
<a name="partition-format"></a>`partition_format` | [cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Specify how changefeed [file paths](#general-file-format) are partitioned in cloud storage sinks. Use `partition_format` with the following values: <ul><li>`daily` is the default behavior that organizes directories by dates (`2022-05-18/`, `2022-05-19/`, etc.).</li><li>`hourly` will further organize directories by hour within each date directory (`2022-05-18/06`, `2022-05-18/07`, etc.).</li><li>`flat` will not partition the files at all.</ul>For example: `CREATE CHANGEFEED FOR TABLE users INTO 'gs://...?AUTH...&partition_format=hourly'` <br><br> **Default:** `daily`
`S3_STORAGE_CLASS` | [Amazon S3 cloud storage sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#amazon-s3) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Specify the Amazon S3 storage class for files created by the changefeed. See [Create a changefeed with an S3 storage class](#create-a-changefeed-with-an-s3-storage-class) for the available classes and an example. <br><br>**Default:** `STANDARD`
`sasl_client_id`   | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Client ID for OAuth authentication from a third-party provider. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`.
`sasl_client_secret` | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Client secret for OAuth authentication from a third-party provider. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`. **Note:** You must [base64 encode](https://www.base64encode.org/) this value when passing it in as part of a sink URI.
`sasl_enabled`     | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) | [`BOOL`]({% link {{ page.version.version }}/bool.md %})                 | If `true`, the authentication protocol can be set to SCRAM or PLAIN using the `sasl_mechanism` parameter. You must have `tls_enabled` set to `true` to use SASL. For Confluent Cloud sinks, `sasl_enabled` must be set to `true` if specified.<br><br> **Default:** `false`
`sasl_grant_type` | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Override the default OAuth client credentials grant type for other implementations. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`.
`sasl_mechanism`   | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) | [`STRING`]({% link {{ page.version.version }}/string.md %})             | Can be set to [`OAUTHBEARER`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_oauth.html),  [`SCRAM-SHA-256`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), [`SCRAM-SHA-512`](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_scram.html), or [`PLAIN`](https://docs.confluent.io/current/kafka/authentication_sasl/authentication_sasl_plain.html). A `sasl_user` and `sasl_password` are required.<br><br>See the [Connect to a Changefeed Kafka sink with OAuth Using Okta](connect-to-a-changefeed-kafka-sink-with-oauth-using-okta.html) tutorial for detail setting up OAuth using Okta. <br><br> **Default:** `PLAIN`
`sasl_scopes` | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | A list of scopes that the OAuth token should have access for. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`.
`sasl_token_url` | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Client token URL for OAuth authentication from a third-party provider. **Note:** You must [URL encode](https://www.urlencoder.org/) this value before passing in a URI. This parameter is only applicable with `sasl_mechanism=OAUTHBEARER`.
`sasl_user`        | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Your SASL username.
`sasl_password`    | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka)                               | [`STRING`]({% link {{ page.version.version }}/string.md %})             | Your SASL password. **Note:** Passwords should be [URL encoded](https://wikipedia.org/wiki/Percent-encoding) since the value can contain characters that would cause authentication to fail.
`tls_enabled`      | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) | [`BOOL`]({% link {{ page.version.version }}/bool.md %})                 | If `true`, enable Transport Layer Security (TLS) on the connection to Kafka. This can be used with a `ca_cert` (see below). <br><br>**Default:** `false`
<a name="topic-name-param"></a>`topic_name`       | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud), [GC Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub) | [`STRING`]({% link {{ page.version.version }}/string.md %})             | Allows arbitrary topic naming for Kafka and GC Pub/Sub topics. See the [Kafka topic naming limitations]({% link {{ page.version.version }}/changefeed-sinks.md %}#topic-naming) or [GC Pub/Sub topic naming]({% link {{ page.version.version }}/changefeed-sinks.md %}#pub-sub-topic-naming) for detail on supported characters etc. <br><br>For example, `CREATE CHANGEFEED FOR foo,bar INTO 'kafka://sink?topic_name=all'` will emit all records to a topic named `all`. Note that schemas will still be registered separately. When using Kafka, this parameter can be combined with the [`topic_prefix` parameter](#topic-prefix-param) (this is not supported for GC Pub/Sub). <br><br>**Default:** table name.
<a name="topic-prefix-param"></a>`topic_prefix`     | [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [Confluent Cloud]({% link {{ page.version.version }}/changefeed-sinks.md %}#confluent-cloud) | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.

### Options

Option | Value | Description
-------|-------|------------
`avro_schema_prefix` | Schema prefix name | Provide a namespace for the schema of a table in addition to the default, the table name. This allows multiple databases or clusters to share the same schema registry when the same table name is present in multiple databases.<br><br>Example: `CREATE CHANGEFEED FOR foo WITH format=avro, confluent_schema_registry='registry_url', avro_schema_prefix='super'` will register subjects as `superfoo-key` and `superfoo-value` with the namespace `super`.
<a name="compression-opt"></a>`compression` | `gzip`, `zstd` |  Compress changefeed data files written to a [cloud storage sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink). For compression options when using a Kafka sink, see [Kafka sink configuration]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka-sink-configuration).
<a name="confluent-registry"></a>`confluent_schema_registry` | Schema Registry address | The [Schema Registry](https://docs.confluent.io/current/schema-registry/docs/index.html#sr) address is required to use `avro`.<br><br>{% include {{ page.version.version }}/cdc/schema-registry-timeout.md %}<br><br>{% include {{ page.version.version }}/cdc/confluent-cloud-sr-url.md %}<br><br>{% include {{ page.version.version }}/cdc/schema-registry-metric.md %}
<a name="cursor-option"></a>`cursor` | [Timestamp]({% link {{ page.version.version }}/as-of-system-time.md %}#parameters)  | Emit any changes after the given timestamp. `cursor` does not output the current state of the table first. When `cursor` is not specified, the changefeed starts by doing an initial scan of all the watched rows and emits the current value, then moves to emitting any changes that happen after the scan.<br><br>The changefeed will encounter an error if you specify a timestamp that is before the configured garbage collection window for the target table. (Refer to [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-variables).) With default garbage collection settings, this means you cannot create a changefeed that starts more than [the default MVCC garbage collection interval]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) in the past.<br><br>You can use `cursor` to [start a new changefeed where a previous changefeed ended.](#start-a-new-changefeed-where-another-ended)<br><br>Example: `cursor='1536242855577149065.0000000000'`
<a name="diff-opt"></a>`diff` | N/A |  Publish a [`before` field]({% link {{ page.version.version }}/changefeed-messages.md %}#wrapped-and-diff) with each message, which includes the value of the row before the update was applied. Changefeeds must use the `diff` option with the default [`wrapped` envelope](#envelope) to emit the `before` field.
<a name="end-time"></a>`end_time` | [Timestamp]({% link {{ page.version.version }}/as-of-system-time.md %}#parameters) | Indicate the timestamp up to which the changefeed will emit all events and then complete with a `successful` status. Provide a future timestamp to `end_time` in number of nanoseconds since the [Unix epoch](https://wikipedia.org/wiki/Unix_time). For example, `end_time="1655402400000000000"`. You cannot use `end_time` and [`initial_scan = 'only'`](#initial-scan) simultaneously.
<a name="envelope"></a>`envelope` | `wrapped` / `bare` / `key_only` / `row` | `wrapped` the default envelope structure for changefeed messages containing an array of the primary key, a top-level field for the type of message, and the current state of the row (or `null` for deleted rows).<br><br>`bare` removes the `after` key from the changefeed message and stores any metadata in a `crdb` field. When used with `avro` format, `record` will replace the `after` key. **Note:** This is the default envelope format for [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}). For an example, refer to [Filter columns]({% link {{ page.version.version }}/cdc-queries.md %}#filter-columns).<br><br>`key_only` emits only the key and no value, which is faster if you only need to know the key of the changed row. This envelope option is only supported for [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or sinkless changefeeds.<br><br>`row` emits the row without any additional metadata fields in the message. This envelope option is only supported in [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or sinkless changefeeds. `row` does not support [`avro` format](#format). <br><br>Refer to [Responses]({% link {{ page.version.version }}/changefeed-messages.md %}#responses) for more detail on message format.<br><br>Default: `envelope=wrapped`. Default for [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}): `envelope=bare`.
<a name="execution-locality"></a>`execution_locality` | Key-value pairs | Restricts the execution of a changefeed to nodes that match the defined locality filter requirements, e.g., `WITH execution_locality = 'region=us-west-1a,cloud=aws'`. <br><br>Refer to [Run a changefeed job by locality]({% link {{ page.version.version }}/changefeeds-in-multi-region-deployments.md %}#run-a-changefeed-job-by-locality) for usage and limitation details.
<a name="format"></a>`format` | `json` / `avro` / `csv` / `parquet` | Format of the emitted message. <br><br>`avro`: For mappings of CockroachDB types to Avro types, [refer to the table]({% link {{ page.version.version }}/changefeed-messages.md %}#avro-types) and detail on [Avro limitations]({% link {{ page.version.version }}/changefeed-messages.md %}#avro-limitations). **Note:** [`confluent_schema_registry`](#confluent-registry) is required with `format=avro`. <br><br>`csv`: You cannot combine `format=csv` with the [`diff`](#diff-opt) or [`resolved`](#resolved-option) options. Changefeeds use the same CSV format as the [`EXPORT`](export.html) statement. Refer to [Export data with changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %}) for details using these options to create a changefeed as an alternative to `EXPORT`. **Note:** [`initial_scan = 'only'`](#initial-scan) is required with `format=csv`. <br><br>`parquet`: Cloud storage is the only supported sink. The [`topic_in_value`](#topic-in-value) option is not compatible with `parquet` format.<br><br>Default: `format=json`.
<a name="full-table-option"></a>`full_table_name` | N/A | Use fully qualified table name in topics, subjects, schemas, and record output instead of the default table name. This can prevent unintended behavior when the same table name is present in multiple databases.<br><br>**Note:** This option cannot modify existing table names used as topics, subjects, etc., as part of an [`ALTER CHANGEFEED`]({% link {{ page.version.version }}/alter-changefeed.md %}) statement. To modify a topic, subject, etc., to use a fully qualified table name, create a new changefeed with this option. <br><br>Example: `CREATE CHANGEFEED FOR foo... WITH full_table_name` will create the topic name `defaultdb.public.foo` instead of `foo`.
<a name="gc-protect-expire"></a>`gc_protect_expires_after` | [Duration string](https://pkg.go.dev/time#ParseDuration) | Automatically expires protected timestamp records that are older than the defined duration. In the case where a changefeed job remains paused, `gc_protect_expires_after` will trigger the underlying protected timestamp record to expire and cancel the changefeed job to prevent accumulation of protected data.<br><br>Refer to [Protect Changefeed Data from Garbage Collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}) for more detail on protecting changefeed data.
<a name="initial-scan"></a>`initial_scan` | `yes`/`no`/`only` |  Control whether or not an initial scan will occur at the start time of a changefeed. Only one `initial_scan` option (`yes`, `no`, or `only`) can be used. If none of these are set, an initial scan will occur if there is no [`cursor`](#cursor-option), and will not occur if there is one. This preserves the behavior from previous releases. With `initial_scan = 'only'` set, the changefeed job will end with a successful status (`succeeded`) after the initial scan completes. You cannot specify `yes`, `no`, `only` simultaneously. <br><br>If used in conjunction with `cursor`, an initial scan will be performed at the cursor timestamp. If no `cursor` is specified, the initial scan is performed at `now()`. <br><br>Although the [`initial_scan` / `no_initial_scan`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) syntax from previous versions is still supported, you cannot combine the previous and current syntax.<br><br>Default: `initial_scan = 'yes'`
`kafka_sink_config` | [`STRING`]({% link {{ page.version.version }}/string.md %}) |  Set fields to configure the required level of message acknowledgement from the Kafka server, the version of the server, and batching parameters for Kafka sinks. Set the message file compression type. See [Kafka sink configuration]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka-sink-configuration) for more detail on configuring all the available fields for this option. <br><br>Example: `CREATE CHANGEFEED FOR table INTO 'kafka://localhost:9092' WITH kafka_sink_config='{"Flush": {"MaxMessages": 1, "Frequency": "1s"}, "RequiredAcks": "ONE"}'`
<a name="key-column"></a>`key_column` | `'column'` | Override the key used in [message metadata]({% link {{ page.version.version }}/changefeed-messages.md %}). This changes the key hashed to determine downstream partitions. In sinks that support partitioning by message, CockroachDB uses the [32-bit FNV-1a](https://wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function) hashing algorithm to determine which partition to send to.<br><br>**Note:** `key_column` does not preserve ordering of messages from CockroachDB to the downstream sink, therefore you must also include the [`unordered`](#unordered) option in your changefeed creation statement. It does not affect per-key [ordering guarantees]({% link {{ page.version.version }}/changefeed-messages.md %}#ordering-and-delivery-guarantees) or the output of [`key_in_value`](#key-in-value).<br><br>See the [Define a key to determine the changefeed sink partition](#define-a-key-to-determine-the-changefeed-sink-partition) example.
<a name="key-in-value"></a>`key_in_value` | N/A | Add a primary key array to the emitted message. This makes the [primary key]({% link {{ page.version.version }}/primary-key.md %}) of a deleted row recoverable in sinks where each message has a value but not a key (most have a key and value in each message). `key_in_value` is automatically used for [cloud storage sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink), [webhook sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), and [GC Pub/Sub sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub).
<a name="lagging-ranges-threshold"></a><span class="version-tag">New in v23.2:</span> `lagging_ranges_threshold` | [Duration string](https://pkg.go.dev/time#ParseDuration) | Set a duration from the present that determines the length of time a range is considered to be lagging behind, which will then track in the [`lagging_ranges`]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#lagging-ranges-metric) metric. Note that ranges undergoing an [initial scan](#initial-scan) for longer than the threshold duration are considered to be lagging. Starting a changefeed with an initial scan on a large table will likely increment the metric for each range in the table. As ranges complete the initial scan, the number of ranges lagging behind will decrease.<br><br>**Default:** `3m`
<a name="lagging-ranges-polling"></a><span class="version-tag">New in v23.2:</span> `lagging_ranges_polling_interval` | [Duration string](https://pkg.go.dev/time#ParseDuration) | Set the interval rate for when lagging ranges are checked and the `lagging_ranges` metric is updated. Polling adds latency to the `lagging_ranges` metric being updated. For example, if a range falls behind by 3 minutes, the metric may not update until an additional minute afterward.<br><br>**Default:** `1m`
`metrics_label` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Define a metrics label to which the metrics for one or multiple changefeeds increment. All changefeeds also have their metrics aggregated.<br><br>The maximum length of a label is 128 bytes. There is a limit of 1024 unique labels.<br><br>`WITH metrics_label=label_name` <br><br>For more detail on usage and considerations, see [Using changefeed metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
<a name="min-checkpoint-frequency"></a>`min_checkpoint_frequency` | [Duration string](https://pkg.go.dev/time#ParseDuration) | Controls how often a node's changefeed [aggregator]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}) will flush their progress to the [coordinating changefeed node]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}). A node's changefeed aggregator will wait at least the specified duration between sending progress updates for the ranges it is watching to the coordinator. This can help you control the flush frequency of higher latency sinks to achieve better throughput. However, more frequent checkpointing can increase CPU usage. If this is set to `0s`, a node will flush messages as long as the high-water mark has increased for the ranges that particular node is processing. If a changefeed is resumed, then `min_checkpoint_frequency` is the amount of time that changefeed will need to catch up. That is, it could emit [duplicate messages]({% link {{ page.version.version }}/changefeed-messages.md %}#duplicate-messages) during this time. <br><br>**Note:** [`resolved`](#resolved-option) messages will not be emitted more frequently than the configured `min_checkpoint_frequency` (but may be emitted less frequently). If you require `resolved` messages more frequently than `30s`, you must configure `min_checkpoint_frequency` to at least the desired `resolved` message frequency. For more details, refer to [Resolved message frequency]({% link {{ page.version.version }}/changefeed-messages.md %}#resolved-timestamp-frequency).<br><br>**Default:** `30s`
`mvcc_timestamp` | N/A |  Include the [MVCC]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) timestamp for each emitted row in a changefeed. With the `mvcc_timestamp` option, each emitted row will always contain its MVCC timestamp, even during the changefeed's initial backfill.
<a name="on-error"></a>`on_error` | `pause` / `fail` |  Use `on_error=pause` to pause the changefeed when encountering **non**-retryable errors. `on_error=pause` will pause the changefeed instead of sending it into a terminal failure state. **Note:** Retryable errors will continue to be retried with this option specified. <br><br>Use with [`protect_data_from_gc_on_pause`](#protect-pause) to protect changes from [garbage collection]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds).<br><br>If a changefeed with `on_error=pause` is running when a watched table is [truncated]({% link {{ page.version.version }}/truncate.md %}), the changefeed will pause but will not be able to resume reads from that table. Using [`ALTER CHANGEFEED`]({% link {{ page.version.version }}/alter-changefeed.md %}) to drop the table from the changefeed and then [resuming the job]({% link {{ page.version.version }}/resume-job.md %}) will work, but you cannot add the same table to the changefeed again. Instead, you will need to [create a new changefeed](#start-a-new-changefeed-where-another-ended) for that table.<br><br>Default: `on_error=fail`
<a name="protect-pause"></a>`protect_data_from_gc_on_pause` | N/A |  This option is deprecated as of v23.2 and will be removed in a future release.<br><br>When a [changefeed is paused]({% link {{ page.version.version }}/pause-job.md %}), ensure that the data needed to [resume the changefeed]({% link {{ page.version.version }}/resume-job.md %}) is not garbage collected. If `protect_data_from_gc_on_pause` is **unset**, pausing the changefeed will release the existing protected timestamp records. It is also important to note that pausing and adding `protect_data_from_gc_on_pause` to a changefeed will not protect data if the [garbage collection]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) window has already passed. <br><br>Use with [`on_error=pause`](#on-error) to protect changes from garbage collection when encountering non-retryable errors. <br><br>Refer to [Protect Changefeed Data from Garbage Collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}) for more detail on protecting changefeed data.<br><br>**Note:** If you use this option, changefeeds that are left paused for long periods of time can prevent garbage collection. Use with the [`gc_protect_expires_after`](#gc-protect-expire) option to set a limit for protected data and for how long a changefeed will remain paused.
`pubsub_sink_config` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Set fields to configure sink batching and retries. The schema is as follows:<br><br> `{ "Flush": { "Messages": ..., "Bytes": ..., "Frequency": ..., }, "Retry": {"Max": ..., "Backoff": ..., } }`. <br><br>**Note** that if either `Messages` or `Bytes` are nonzero, then a non-zero value for `Frequency` must be provided. <br><br>Refer to [Pub/Sub sink configuration]({% link {{ page.version.version }}/changefeed-sinks.md %}#pub-sub-sink-configuration) for more details on using this option.
<a name="resolved-option"></a>`resolved` | [Duration string](https://pkg.go.dev/time#ParseDuration) | Emit [resolved timestamps]({% link {{ page.version.version }}/changefeed-messages.md %}#resolved-messages) in a format dependent on the connected sink. Resolved timestamps do not emit until the changefeed job's progress has been checkpointed.<br><br>Set a minimum amount of time that the changefeed's high-water mark (overall resolved timestamp) must advance by before another resolved timestamp is emitted. Example: `resolved='10s'`. This option will **only** emit a resolved timestamp if the timestamp has advanced (and by at least the optional duration, if set). If a duration is unspecified, all resolved timestamps are emitted as the high-water mark advances.<br><br>**Note:** If you set `resolved` lower than `30s`, then you **must** also set [`min_checkpoint_frequency`](#min-checkpoint-frequency) to at minimum the same value as `resolved`, because `resolved` messages may be emitted less frequently than `min_checkpoint_frequency`, but cannot be emitted more frequently.<br><br>Refer to [Resolved messages]({% link {{ page.version.version }}/changefeed-messages.md %}#resolved-messages) for more detail.
<a name="schema-events"></a>`schema_change_events` | `default` / `column_changes` |  The type of schema change event that triggers the behavior specified by the `schema_change_policy` option:<ul><li>`default`: Include all [`ADD COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#add-column) events for columns that have a non-`NULL` [`DEFAULT` value]({% link {{ page.version.version }}/default-value.md %}) or are [computed]({% link {{ page.version.version }}/computed-columns.md %}), and all [`DROP COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#drop-column) events.</li><li>`column_changes`: Include all schema change events that add or remove any column.</li></ul>Default: `schema_change_events=default`
<a name="schema-policy"></a>`schema_change_policy` | `backfill` / `nobackfill` / `stop` |  The behavior to take when an event specified by the `schema_change_events` option occurs:<ul><li>`backfill`: When [schema changes with column backfill]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill) are finished, output all watched rows using the new schema.</li><li>`nobackfill`: For [schema changes with column backfill]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill), perform no logical backfills. The changefeed will not emit any messages about the schema change. However, if the schema change is executed inside an [explicit transaction]({% link {{ page.version.version }}/begin-transaction.md %}), CockroachDB will emit all rows in the table to the changefeed once the transaction commits.</li><li>`stop`: For [schema changes with column backfill]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill), wait for all data preceding the schema change to be resolved before exiting with an error indicating the timestamp at which the schema change occurred. An `error: schema change occurred at <timestamp>` will display in the `cockroach.log` file.</li></ul>Default: `schema_change_policy=backfill`
<a name="split-column-families"></a>`split_column_families` | N/A | Use this option to create a changefeed on a table with multiple [column families]({% link {{ page.version.version }}/column-families.md %}). The changefeed will emit messages for each of the table's column families. See [Changefeeds on tables with column families]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %}) for more usage detail.
<a name="topic-in-value"></a>`topic_in_value` | [`BOOL`]({% link {{ page.version.version }}/bool.md %}) |  Set to include the topic in each emitted row update. This option is automatically set for [webhook sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink). **Note:** `topic_in_value` is not compatible with changefeeds running in [`parquet` format](#format).
<a name="unordered"></a>`unordered` | N/A | Run a changefeed to [Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub) without specifying a region.<br><br>You must include the `unordered` option with [`key_column`](#key-column) in your changefeed creation statement.<br><br>You cannot use `unordered` with `resolved`, because resolved timestamps may not be correct in unordered mode.
<a name="updated-option"></a>`updated` | N/A | Include updated timestamps with each row.<br><br>If a `cursor` is provided, the "updated" timestamps will match the [MVCC]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) timestamps of the emitted rows, and there is no initial scan. If a `cursor` is not provided, the changefeed will perform an initial scan (as of the time the changefeed was created), and the "updated" timestamp for each change record emitted in the initial scan will be the timestamp of the initial scan. Similarly, when a [backfill is performed for a schema change]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill), the "updated" timestamp is set to the first timestamp for when the new schema is valid.
<a name="virtual-columns"></a>`virtual_columns` | `STRING` | Changefeeds omit [virtual computed columns]({% link {{ page.version.version }}/computed-columns.md %}) from emitted [messages]({% link {{ page.version.version }}/changefeed-messages.md %}) by default. To maintain the behavior of previous CockroachDB versions where the changefeed would emit [`NULL`]({% link {{ page.version.version }}/null-handling.md %}) values for virtual computed columns, set `virtual_columns = "null"` when you start a changefeed. <br><br>You may also define `virtual_columns = "omitted"`, though this is already the default behavior for v22.1+. If you do not set `"omitted"` on a table with virtual computed columns when you create a changefeed, you will receive a warning that changefeeds will filter out virtual computed values. <br><br>**Default:** `"omitted"`
`webhook_auth_header` | [`STRING`]({% link {{ page.version.version }}/string.md %}) |  Pass a value (password, token etc.) to the HTTP [Authorization header](https://developer.mozilla.org/docs/Web/HTTP/Headers/Authorization) with a webhook request for a "Basic" HTTP authentication scheme. <br><br> Example: With a username of "user" and password of "pwd", add a colon between "user:pwd" and then base64 encode, which results in "dXNlcjpwd2Q=". `WITH webhook_auth_header='Basic dXNlcjpwd2Q='`.
`webhook_client_timeout` | [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) |  If a response is not recorded from the sink within this timeframe, it will error and retry to connect. Note this must be a positive value. <br><br>**Default:** `"3s"`
`webhook_sink_config` | [`STRING`]({% link {{ page.version.version }}/string.md %}) |  Set fields to configure sink batching and retries. The schema is as follows:<br><br> `{ "Flush": { "Messages": ..., "Bytes": ..., "Frequency": ..., }, "Retry": {"Max": ..., "Backoff": ..., } }`. <br><br>**Note** that if either `Messages` or `Bytes` are nonzero, then a non-zero value for `Frequency` must be provided. <br><br>See [Webhook sink configuration]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink-configuration) for more details on using this option.

{{site.data.alerts.callout_info}}
 Using the `format=avro`, `envelope=key_only`, and `updated` options together is rejected. `envelope=key_only` prevents any rows with updated fields from being emitted, which makes the `updated` option meaningless.
{{site.data.alerts.end}}

## Files

The files emitted to a sink use the following naming conventions:

- [General file format](#general-file-format)
- [Resolved file format](#resolved-file-format)

{{site.data.alerts.callout_info}}
The timestamp format is `YYYYMMDDHHMMSSNNNNNNNNNLLLLLLLLLL`.
{{site.data.alerts.end}}

### General file format

~~~
/[date]/[timestamp]-[uniquer]-[topic]-[schema-id]
~~~

For example:

~~~
/2020-04-02/202004022058072107140000000000000-56087568dba1e6b8-1-72-00000000-test_table-1.ndjson
~~~

When emitting changefeed messages to a [cloud storage sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink), you can specify a partition format for your files using the [`partition_format`](#partition-format) query parameter. This will result in the following file path formats:

- `daily`: This is the default option and will follow the same pattern as the previous general file format.
- `hourly`: This will partition into an hourly directory as the changefeed emits messages, like the following:

    ~~~
    /2020-04-02/20/202004022058072107140000000000000-56087568dba1e6b8-1-72-00000000-test_table-1.ndjson
    ~~~

- `flat`: This will result in no file partitioning. The cloud storage path you specify when creating a changefeed will store all of the message files with no additional directories created.

### Resolved file format

~~~
/[date]/[timestamp].RESOLVED
~~~

For example:

~~~
/2020-04-04/202004042351304139680000000000000.RESOLVED
~~~

## Examples

Before running any of the examples in this section it is necessary to [enable the `kv.rangefeed.enabled` cluster setting]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds). If you are working on a CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster, this cluster setting is enabled by default.

The following examples show the syntax for managing changefeeds and starting changefeeds with different use cases and features. The [Options](#options) table on this page provides a list of all the available options. For information on sink-specific query parameters and configurations, refer to the [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page.

{% include {{ page.version.version }}/cdc/sink-URI-external-connection.md %}

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/changefeed-number-limit.md %}
{{site.data.alerts.end}}

### Create a changefeed connected to a sink

You can connect a changefeed to the following sinks:

- Kafka
- Cloud storage / HTTP
- Google Cloud Pub/Sub
- Webhook

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE table_name, table_name2, table_name3
  INTO 'scheme://host:port'
  WITH updated, resolved;
~~~

For guidance on the sink URI, refer to:

- The [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page for general detail on query parameters and sink configuration.
- The [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) page for instructions on setting up each supported cloud storage authentication.

### Create a changefeed that filters and transforms change data

[CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}) can filter and transform change data before emitting it to a sink or [a SQL client](#create-a-sinkless-changefeed).

You can adapt a changefeed with CDC queries by including `SELECT` and `WHERE` clauses in your `CREATE` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'scheme://host:port'
  WITH updated, resolved
  AS SELECT owner_id, status
  FROM vehicles
  WHERE status = 'lost';
~~~

CDC queries can only run on a single table per changefeed and require an {{ site.data.products.enterprise }} license.

### Create a sinkless changefeed

You can create a changefeed that will send messages to the SQL client rather than a sink:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE table_name, table_name2, table_name3
  WITH updated, resolved;
~~~

Sinkless changefeeds do not require an {{ site.data.products.enterprise }} license; however, a sinkless changefeed with CDC queries **does** require an {{ site.data.products.enterprise }} license.

To create a sinkless changefeed using CDC queries:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED WITH updated, resolved
  AS SELECT owner_id, status
  FROM vehicles
  WHERE status = 'lost';
~~~

### Use an external connection to specify a changefeed sink

[External connections]({% link {{ page.version.version }}/create-external-connection.md %}) provide a way to define a name for a sink, which you can use instead of the provider-specific URI.

{% include {{ page.version.version }}/cdc/ext-conn-cluster-setting.md %}

External connections support all changefeed sinks.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE EXTERNAL CONNECTION kafka_sink
  AS 'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert={certificate}&sasl_enabled=true&sasl_user={sasl user}&sasl_password={url-encoded password}&sasl_mechanism=SCRAM-SHA-256';
~~~

In the changefeed statement, you specify the external connection name:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE table_name INTO 'external://kafka_sink'
  WITH resolved;
~~~

### Disallow schema changes on tables to improve changefeed performance

{% include_cached new-in.html version="v23.2.1" %} Use the `schema_locked` [storage parameter]({% link {{ page.version.version }}/with-storage-parameter.md %}) to disallow [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}) on a watched table, which helps to decrease the latency between a write committing to a table and it emitting to the [changefeed's sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). You can lock the table before creating a changefeed or while a changefeed is running, which will enable the performance improvement for changefeeds watching the particular table.

Enable `schema_locked` on the watched table with the [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = true);
~~~

While `schema_locked` is enabled on a table, attempted schema changes on the table will be rejected and an error returned. If you need to run a schema change on the locked table, unlock the table with `schema_locked = false`, complete the schema change, and then lock the table again with `schema_locked = true`. The changefeed will run as normal while `schema_locked = false`, but it will not benefit from the performance optimization.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE watched_table SET (schema_locked = false);
~~~

### Manage a changefeed

 For {{ site.data.products.enterprise }} changefeeds, use [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) to check the status of your changefeed jobs:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CHANGEFEED JOBS;
~~~

Use the following SQL statements to pause, resume, or cancel a changefeed.

#### Pause a changefeed

{% include_cached copy-clipboard.html %}
~~~ sql
PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}).

#### Resume a paused changefeed

{% include_cached copy-clipboard.html %}
~~~ sql
RESUME JOB job_id;
~~~

For more information, see [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}).

#### Cancel a changefeed

{% include_cached copy-clipboard.html %}
~~~ sql
CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}).

#### Modify a changefeed

{% include {{ page.version.version }}/cdc/modify-changefeed.md %}

#### Configuring all changefeeds

{% include {{ page.version.version }}/cdc/configure-all-changefeed.md %}

### Start a new changefeed where another ended

In some situations, you may want to start a changefeed where a previously running changefeed ended. For example, a changefeed could encounter an error it cannot recover from, such as when a [`TRUNCATE` is performed]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#known-limitations), and you need to restart the changefeed.

1. Use [`SHOW CHANGEFEED JOB`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) to find the [high-water timestamp]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#monitor-a-changefeed) for the ended changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW CHANGEFEED JOB {job_id};
    ~~~
    ~~~
            job_id       | ... |      high_water_timestamp      | ...
    +--------------------+ ... +--------------------------------+ ...
      383870400694353921 | ... | 1537279405671006870.0000000000 | ...
    (1 row)
    ~~~

    {{site.data.alerts.callout_info}}
    If a changefeed has failed, you must restart the changefeed from a timestamp **after** the event that caused the failure.
    {{site.data.alerts.end}}

1. Use the `high_water_timestamp` to start the new changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE table_name, table_name2, table_name3
      INTO 'scheme//host:port'
      WITH cursor = '<high_water_timestamp>';
    ~~~

When you use the `cursor` option to start a changefeed, it will not perform an [initial scan](#initial-scan).

### Create a changefeed with an S3 storage class

To associate the changefeed message files with a [specific storage class]({% link {{ page.version.version }}/use-cloud-storage.md %}#amazon-s3-storage-classes) in your Amazon S3 bucket, use the `S3_STORAGE_CLASS` parameter with the class. For example, the following S3 connection URI specifies the `INTELLIGENT_TIERING` storage class:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE table_name
  INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&S3_STORAGE_CLASS=INTELLIGENT_TIERING'
  WITH resolved;
~~~

{% include {{ page.version.version }}/misc/storage-classes.md %}

### Define a key to determine the changefeed sink partition

With the [`key_column`](#key-column) option, you can define the key used in message metadata that determines the partition for the changefeed message at your [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). This option overrides the default [primary key]({% link {{ page.version.version }}/primary-key.md %}):

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE table_name
  INTO 'external://kafka-sink'
  WITH key_column='partition_column', unordered;
~~~

`key_column` does not preserve ordering of messages from CockroachDB to the downstream sink, therefore you **must** include the [`unordered`](#unordered) option. It does not affect per-key [ordering guarantees]({% link {{ page.version.version }}/changefeed-messages.md %}#ordering-and-delivery-guarantees) or the output of [`key_in_value`](#key-in-value).

## See also

- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [Changefeed Dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %})
- [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %})
