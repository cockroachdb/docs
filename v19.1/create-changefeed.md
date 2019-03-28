---
title: CREATE CHANGEFEED
summary: The CREATE CHANGEFEED statement creates a new changefeed, which provides row-level change subscriptions.
toc: true
---

The `CREATE CHANGEFEED` [statement](sql-statements.html) creates a new changefeed, which provides row-level change subscriptions.

Changefeeds target a whitelist of tables, called the "watched rows." Every change to a watched row is emitted as a record in a configurable format (`JSON`) to a configurable sink ([Kafka](https://kafka.apache.org/)).

For more information, see [Change Data Capture](change-data-capture.html).

{{site.data.alerts.callout_info}}
`CREATE CHANGEFEED` is an [enterprise-only](enterprise-licensing.html) feature. For the core version, see [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html).
{{site.data.alerts.end}}

## Required privileges

Changefeeds can only be created by superusers, i.e., [members of the `admin` role](create-and-manage-users.html). The admin role exists by default with `root` as the member.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_changefeed.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table (or tables in a comma separated list) to create a changefeed for.
`sink` | The location of the configurable sink. The scheme of the URI indicates the type; currently, only `kafka`. For more information, see [Kafka query parameters](#kafka-query-parameters) below.
`option` / `value` | For a list of available options and their values, see [Options](#options) below.

<!-- `IF NOT EXISTS` | Create a new changefeed only if a changefeed of the same name does not already exist; if one does exist, do not return an error.
`name` | The name of the changefeed to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers). -->

### Kafka query parameters

The sink URI scheme for Kafka follows the basic format of:

~~~
'kafka://[host]:[port][?query_parameters]'
~~~

For example:

~~~
'kafka://broker.address.com:9092?tls_enabled=true&ca_cert=LS0tLS1CRUdJTiBDRVJUSUZ&sasl_enabled=true&sasl_user=petee&sasl_password=bones'
~~~

Query parameters include:

Parameter | Value | Description
----------+-------+---------------
`topic_prefix` | [`STRING`](string.html) | Adds a prefix to all of the topic names.<br><br>For example, `CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://...?topic_prefix=bar_'` would emit rows under the topic `bar_foo` instead of `foo`.
`tls_enabled=true` | [`BOOL`](bool.html) | If `true`, use a Transport Layer Security (TLS) connection. This can be used with a `ca_cert` (see below).
`ca_cert` | [`STRING`](string.html) | The base64-encoded `ca_cert` file.<br><br>Note: To encode your `ca.cert`, run `base64 -w 0 ca.cert`.
`sasl_enabled` | [`BOOL`](bool.html) | If `true`, use Simple Authentication and Security Layer (SASL) to authenticate. This requires a `sasl_user` and `sasl_password` (see below).
`sasl_user` | [`STRING`](string.html) | Your SASL username.
`sasl_password` | [`STRING`](string.html) | Your SASL password.

### Options

Option | Value | Description
-------|-------|------------
`updated` | N/A | Include updated timestamps with each row.<br><br>If a `cursor` is provided, the "updated" timestamps will match the [MVCC](../v19.1/architecture/storage-layer.html#mvcc) timestamps of the emitted rows, and there is no initial scan.. If a `cursor` is not provided, the changefeed will perform an initial scan (as of the time the changefeed was created), and the "updated" timestamp for each change record emitted in the initial scan will be the timestamp of the initial scan. Similarly, when a [backfill is performed for a schema change](change-data-capture.html#schema-changes-with-column-backfill), the "updated" timestamp is set to the first timestamp for when the new schema is valid.
`resolved` | [`INTERVAL`](interval.html) | Periodically emit resolved timestamps to the changefeed. Optionally, set a minimum duration between emitting resolved timestamps. If unspecified, all resolved timestamps are emitted.<br><br>Example: `resolved='10s'`
`envelope` | `key_only` / `wrapped` | Use `key_only` to emit only the key and no value, which is faster if you only want to know when the key changes.<br><br>Default: `envelope=wrapped`
`cursor` | [Timestamp](as-of-system-time.html#parameters)  | Emits any changes after the given timestamp, but does not output the current state of the table first. If `cursor` is not specified, the changefeed starts by doing an initial scan of all the watched rows and emits the current value, then moves to emitting any changes that happen after the scan.<br><br>When starting a changefeed at a specific `cursor`, the `cursor` cannot be before the configured garbage collection window (see [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables)) for the table you're trying to follow; otherwise, the changefeed will error. By default, you cannot create a changefeed that starts more than 25 hours in the past.<br><br>`cursor` can be used to [start a new changefeed where a previous changefeed ended.](#start-a-new-changefeed-where-another-ended)<br><br>Example: `CURSOR=1536242855577149065.0000000000`
`format` | `json` / `experimental_avro` | Format of the emitted record. Currently, support for [Avro is limited and experimental](#avro-limitations). For mappings of CockroachDB types to Avro types, [see the table below](#avro-types). <br><br>Default: `format=json`.
`confluent_schema_registry` | Schema Registry address | The [Schema Registry](https://docs.confluent.io/current/schema-registry/docs/index.html#sr) address is required to use `experimental_avro`.

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

The messages (i.e., keys and values) emitted to a Kafka topic are composed of the following:

- **Key**: Always composed of the table's `PRIMARY KEY` field (e.g., `[1]` or `{"id":1}`).
- **Value**:
    - For [`INSERT`](insert.html) and [`UPDATE`](update.html), the current state of the row inserted or updated.
    - For [`DELETE`](delete.html), `null`.

For example:

Statement                                      | Response
-----------------------------------------------+-----------------------------------------------------------------------
`INSERT INTO office_dogs VALUES (1, 'Petee');` | JSON: `[1]	{"after": {"id": 1, "name": "Petee"}}` </br>Avro: `{"id":1}    {"id":1,"name":{"string":"Petee"}}`
`DELETE FROM office_dogs WHERE name = 'Petee'` | JSON: `[1]	{"after": null}` </br>Avro: `{"id":1}    {null}`

## Examples

### Create a changefeed

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name INTO 'kafka://host:port' WITH updated, resolved;
~~~
~~~
+--------------------+
|       job_id       |
+--------------------+
| 360645287206223873 |
+--------------------+
(1 row)
~~~

For more information on how to create a changefeed connected to Kafka, see [Change Data Capture](change-data-capture.html#create-a-changefeed-connected-to-kafka).

### Create a changefeed with Avro

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE name INTO 'kafka://host:port' WITH format = experimental_avro, confluent_schema_registry = <schema_registry_address>;
~~~
~~~
+--------------------+
|       job_id       |
+--------------------+
| 360645287206223873 |
+--------------------+
(1 row)
~~~

For more information on how to create a changefeed that emits an [Avro](https://avro.apache.org/docs/1.8.2/spec.html) record, see [Change Data Capture](change-data-capture.html#create-a-changefeed-in-avro-connected-to-kafka).

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

Find the [high-water timestamp](change-data-capture.html#monitor-a-changefeed) for the ended changefeed:

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
> CREATE CHANGEFEED FOR TABLE name INTO 'kafka//host:port' WITH cursor = <high_water_timestamp>;
~~~

Note that because the cursor is provided, the initial scan is not performed.

## See also

- [Change Data Capture](change-data-capture.html)
- [Other SQL Statements](sql-statements.html)
