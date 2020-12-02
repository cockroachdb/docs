---
title: CREATE CHANGEFEED
summary: The CREATE CHANGEFEED statement creates a new enterprise changefeed, which provides row-level change subscriptions in a configurable format to a configurable sink.
toc: true
---

{{site.data.alerts.callout_info}}
`CREATE CHANGEFEED` is an [enterprise-only](enterprise-licensing.html) feature. For the core version, see [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html).
{{site.data.alerts.end}}

The `CREATE CHANGEFEED` [statement](sql-statements.html) creates a new enterprise changefeed, which targets an allowlist of tables, called "watched rows".  Every change to a watched row is emitted as a record in a configurable format (`JSON` or Avro) to a configurable sink ([Kafka](https://kafka.apache.org/) or a [cloud storage sink](#cloud-storage-sink)). You can [create](#create-a-changefeed-connected-to-kafka), [pause](#pause-a-changefeed), [resume](#resume-a-paused-changefeed), or [cancel](#cancel-a-changefeed) an enterprise changefeed.

For more information, see [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html).

## Required privileges

To create a changefeed, the user must be a member of the `admin` role or have the [`CREATECHANGEFEED`](create-user.html#create-a-user-that-can-control-changefeeds) parameter set.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_changefeed.html %}
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
'[scheme]://[host]:[port]?[query_parameters]'
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
'kafka://broker.address.com:9092?topic_prefix=bar_&tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user=petee&sasl_password=bones'
~~~

#### Cloud storage sink

Use a cloud storage sink to deliver changefeed data to OLAP or big data systems without requiring transport via Kafka.

{{site.data.alerts.callout_info}}
Currently, cloud storage sinks only work with `JSON` and emits newline-delimited `JSON` files.
{{site.data.alerts.end}}

For more information on the sink URL structure, see [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html).

#### Query parameters

Query parameters include:

Parameter          | <div style="width:100px">Sink Type</div>     | Description
-------------------+----------------------------------------------+-------------------------------------------------------------------
`topic_prefix`     | [Kafka](#kafka), [cloud](#cloud-storage-sink) | Type: [`STRING`](string.html) <br><br>Adds a prefix to all topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.
`tls_enabled=true` | [Kafka](#kafka)                               | Type: [`BOOL`](bool.html) <br><br>If `true`, enable Transport Layer Security (TLS) on the connection to Kafka. This can be used with a `ca_cert` (see below).
`ca_cert`          | [Kafka](#kafka)                               | Type: [`STRING`](string.html) <br><br>The base64-encoded `ca_cert` file.<br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`client_cert`      | [Kafka](#kafka)                               | Type: [`STRING`](string.html) <br><br>The base64-encoded Privacy Enhanced Mail (PEM) certificate. This is used with `client_key`.
`client_key`       | [Kafka](#kafka)                               | Type: [`STRING`](string.html) <br><br>The base64-encoded private key for the PEM certificate. This is used with `client_cert`.
`sasl_enabled`     | [Kafka](#kafka)                               | Type: [`BOOL`](bool.html) <br><br>If `true`, [use SASL/PLAIN to authenticate](https://docs.confluent.io/current/kafka/authentication_sasl/authentication_sasl_plain.html). This requires a `sasl_user` and `sasl_password` (see below).
`sasl_user`        | [Kafka](#kafka)                               | Type: [`STRING`](string.html) <br><br>Your SASL username.
`sasl_password`    | [Kafka](#kafka)                               | Type: [`STRING`](string.html) <br><br>Your SASL password.
`file_size`        | [cloud](#cloud-storage-sink)                  | Type: [`STRING`](string.html) <br><br>The file will be flushed (i.e., written to the sink) when it exceeds the specified file size. This can be used with the [`WITH resolved` option](#options), which flushes on a specified cadence. <br><br>**Default:** `16MB`

### Options

Option | Value | Description
-------|-------|------------
`updated` | N/A | Include updated timestamps with each row.<br><br>If a `cursor` is provided, the "updated" timestamps will match the [MVCC](architecture/storage-layer.html#mvcc) timestamps of the emitted rows, and there is no initial scan. If a `cursor` is not provided, the changefeed will perform an initial scan (as of the time the changefeed was created), and the "updated" timestamp for each change record emitted in the initial scan will be the timestamp of the initial scan. Similarly, when a [backfill is performed for a schema change](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), the "updated" timestamp is set to the first timestamp for when the new schema is valid.
`resolved` | [`INTERVAL`](interval.html) | Periodically emit [resolved timestamps](stream-data-out-of-cockroachdb-using-changefeeds.html#resolved-def) to the changefeed. Optionally, set a minimum duration between emitting resolved timestamps. If unspecified, all resolved timestamps are emitted.<br><br>Example: `resolved='10s'`
`envelope` | `key_only` / `wrapped` | Use `key_only` to emit only the key and no value, which is faster if you only want to know when the key changes.<br><br>Default: `envelope=wrapped`
`cursor` | [Timestamp](as-of-system-time.html#parameters)  | Emit any changes after the given timestamp, but does not output the current state of the table first. If `cursor` is not specified, the changefeed starts by doing an initial scan of all the watched rows and emits the current value, then moves to emitting any changes that happen after the scan.<br><br>When starting a changefeed at a specific `cursor`, the `cursor` cannot be before the configured garbage collection window (see [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables)) for the table you're trying to follow; otherwise, the changefeed will error. With default garbage collection settings, this means you cannot create a changefeed that starts more than 25 hours in the past.<br><br>`cursor` can be used to [start a new changefeed where a previous changefeed ended.](#start-a-new-changefeed-where-another-ended)<br><br>Example: `CURSOR='1536242855577149065.0000000000'`
`format` | `json` / `experimental_avro` | Format of the emitted record. Currently, support for [Avro is limited and experimental](#avro-limitations). For mappings of CockroachDB types to Avro types, [see the table below](#avro-types). <br><br>Default: `format=json`.
`confluent_schema_registry` | Schema Registry address | The [Schema Registry](https://docs.confluent.io/current/schema-registry/docs/index.html#sr) address is required to use `experimental_avro`.
`key_in_value` | N/A | Make the [primary key](primary-key.html) of a deleted row recoverable in sinks where each message has a value but not a key (most have a key and value in each message). `key_in_value` is automatically used for these sinks (currently only [cloud storage sinks](#cloud-storage-sink)).
`diff` | N/A |  Publish a `before` field with each message, which includes the value of the row before the update was applied.
`compression` | `gzip` |  Compress changefeed data files written to a [cloud storage sink](#cloud-storage-sink). Currently, only [Gzip](https://www.gnu.org/software/gzip/) is supported for compression.
`protect_data_from_gc_on_pause` | N/A |  When a [changefeed is paused](pause-job.html), ensure that the data needed to [resume the changefeed](resume-job.html) is not garbage collected.<br><br>Note: If you use this option, changefeeds left paused can prevent garbage collection for long periods of time.
`schema_change_events` | `default` / `column_changes` |  The type of schema change event that triggers the behavior specified by the `schema_change_policy` option:<ul><li>`default`: Include all [`ADD COLUMN`](add-column.html) events for columns that have a non-`NULL` [`DEFAULT` value](default-value.html) or are [computed](computed-columns.html), and all [`DROP COLUMN`](drop-column.html) events.</li><li>`column_changes`: Include all all schema change events that add or remove any column.</li></ul><br>Default: `schema_change_events=default`
`schema_change_policy` | `backfill` / `nobackfill` / `stop` |  The behavior to take when an event specified by the `schema_change_events` option occurs:<ul><li>`backfill`: When [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill) are finished, output all watched rows using the new schema.</li><li>`nobackfill`: For [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), perform no logical backfills.</li><li>`stop`: [schema changes with column backfill](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill), wait for all data preceding the schema change to be resolved before exiting with an error indicating the timestamp at which the schema change occurred. An `error: schema change occurred at <timestamp>` will display in the `cockroach.log` file.</li></ul><br>Default: `schema_change_policy=backfill`
`initial_scan` / `no_initial_scan` | N/A |  Control whether or not an initial scan will occur at the start time of a changefeed. `initial_scan` and `no_initial_scan` cannot be used simultaneously. If neither `initial_scan` nor `no_initial_scan` is specified, an initial scan will occur if there is no `cursor`, and will not occur if there is one. This preserves the behavior from previous releases.<br><br>Default: `initial_scan` <br>If used in conjunction with `cursor`, an initial scan will be performed at the cursor timestamp. If no `cursor` is specified, the initial scan is performed at `now()`.

{{site.data.alerts.callout_info}}
 Using the `format=experimental_avro`, `envelope=key_only`, and `updated` options together is rejected. `envelope=key_only` prevents any rows with updated fields from being emitted, which makes the `updated` option meaningless.
{{site.data.alerts.end}}

#### Avro limitations

Currently, support for Avro is limited and experimental. Below is a list of unsupported SQL types and values for Avro changefeeds:

- [Decimals](decimal.html) must have precision specified.
- [Decimals](decimal.html) with `NaN` or infinite values cannot be written in Avro.

    {{site.data.alerts.callout_info}}
    To avoid `NaN` or infinite values, add a [`CHECK` constraint](check.html) to prevent these values from being inserted into decimal columns.
    {{site.data.alerts.end}}

- [`TIME`, `DATE`, `INTERVAL`](https://github.com/cockroachdb/cockroach/issues/32472), [`UUID`, `INET`](https://github.com/cockroachdb/cockroach/issues/34417), [`ARRAY`](https://github.com/cockroachdb/cockroach/issues/34420), [`JSONB`](https://github.com/cockroachdb/cockroach/issues/34421), `BIT`, and collated `STRING` are not supported in Avro yet.

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
