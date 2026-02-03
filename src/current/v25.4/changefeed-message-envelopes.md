---
title: Changefeed Message Envelope
summary: Learn how to configure the changefeed message envelope.
toc: true
---

In CockroachDB, the changefeed _envelope_ is the structure of each [message]({% link {{ page.version.version }}/changefeed-messages.md %}) emitted to the [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). Changefeeds package _events_, triggered by an update to a row in a [watched table]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table), into messages according to the configured envelope. By default, changefeed messages use the [`wrapped` envelope](#wrapped), which includes the primary key of the changed row and a top-level field indicating the value of the row after the change event.​ 

You can use changefeed [options](#option-reference) to customize message contents in order to integrate with your downstream requirements. For example, the [previous state of the row](#audit-changes-in-data), the [origin cluster's metadata](#preserve-the-origin-of-data), or the [schema of the event payload](#add-envelope-schema-fields) in the message. Envelope configuration also allows you to prioritize change event metadata versus changefeed throughput.

The possible envelope fields support use cases such as:

- [Auditing](#audit-changes-in-data) changes in data.
- Enabling [full-fidelity changefeed messages](#enable-full-fidelity-message-envelopes).
- Routing events based on [operation type](#route-events-based-on-operation-type).
- Automatically [generating or synchronizing schemas](#add-envelope-schema-fields) in downstream consumers.

This page covers:

- [Use case](#use-cases) examples.
- Reference lists:
    - The [options](#option-reference) to configure the envelope.
    - The supported envelope [fields](#field-reference).

{{site.data.alerts.callout_info}}
You can also specify the _format_ of changefeed messages, such as Avro. For more details, refer to [Message formats]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats).
{{site.data.alerts.end}}

## Use cases

The use case examples in the following sections emit to a Kafka sink. Review the [Options](#option-reference) table for option sink support.

Each example uses the following table schema:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name STRING NOT NULL,
    description STRING NULL,
    price DECIMAL(10,2) NOT NULL,
    in_stock BOOL NULL DEFAULT true,
    category STRING NULL,
    created_at TIMESTAMP NULL DEFAULT current_timestamp():::TIMESTAMP,
    CONSTRAINT products_pkey PRIMARY KEY (id ASC)
);
~~~

{{site.data.alerts.callout_info}}
The values that the `envelope` option accepts are compatible with different [changefeed sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}), and the structure of the message will vary depending on the sink and [message format]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats).
{{site.data.alerts.end}}

### Audit changes in data

You can include both the previous and updated states of a row in the message envelope to support use cases like auditing or applying change-based logic in downstream systems. Use the [`diff`](#diff-option) option with [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) to include the previous state of the row:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE products INTO 'kafka://localhost:9092' WITH diff;
~~~

The `diff` option adds the [`"before"`](#before) field to the envelope containing the state of the row before the change:

~~~json
{
  "after": {
    "category": "Home & Kitchen",
    "created_at": "2025-04-01T17:55:46.812942",
    "description": "Adjustable LED desk lamp with touch controls",
    "id": "32856ed8-34d3-45a3-a449-412bdeaa277c",
    "in_stock": true,
    "name": "LED Desk Lamp",
    "price": 26.30
  },
  "before": {
    "category": "Home & Kitchen",
    "created_at": "2025-04-01T17:55:46.812942",
    "description": "Adjustable LED desk lamp with touch controls",
    "id": "32856ed8-34d3-45a3-a449-412bdeaa277c",
    "in_stock": true,
    "name": "LED Desk Lamp",
    "price": 22.30
  }
}
~~~

For an insert into the table, the `"before"` field contains `null`:

~~~json
{
  "after": {
    "category": "Electronics",
    "created_at": "2025-04-23T13:48:40.981735",
    "description": "Over-ear headphones with active noise cancellation",
    "id": "3d8f4ca4-36e9-43b2-b057-d691624a4cba",
    "in_stock": true,
    "name": "Noise Cancelling Headphones",
    "price": 129.50
  },
  "before": null
}
~~~

### Route events based on operation type

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

You may want to route change events in a table based on the operation type (insert, update, delete), which can be useful for correctly applying or handling changes in a downstream system or replication pipeline. Use the [`envelope=enriched`](#enriched) option with [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) to include the [`"op"`](#op) field in the envelope:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE products INTO 'external://kafka:9092' WITH envelope=enriched;
~~~
~~~json
{
  "after": {
    "category": "Home & Kitchen",
    "created_at": "2025-04-01T17:55:46.812942",
    "description": "Adjustable LED desk lamp with touch controls",
    "id": "32856ed8-34d3-45a3-a449-412bdeaa277c",
    "in_stock": true,
    "name": "LED Desk Lamp",
    "price": 22.30
  },
  "op": "c",
  "ts_ns": 1743792394409866000
}
~~~

The `"op"` field can contain:

- `"c"` for [inserts]({% link {{ page.version.version }}/insert.md %}).
- `"u"` for [updates]({% link {{ page.version.version }}/update.md %}).
- `"d"` for [deletes]({% link {{ page.version.version }}/delete.md %}).

The [`"ts_ns"`](#ts_ns) timestamp, included in the envelope when you specify only the [`envelope=enriched`](#enriched) option, is the time the message was processed by the changefeed job. If you require timestamps to order messages based on the change event's commit time, then you must specify `envelope=enriched, enriched_properties=source, updated` when you create the changefeed, which will include `"ts_hlc"` and `"ts_ns"` in the [`"source"`](#source) field.

### Add envelope schema fields

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

Adding the schema of the event payload to the message envelope allows you to:

- Handle schema changes in downstream processing systems that require field types.
- Detect and adapt to changes in the table schema over time.
- Correctly parse and cast the data to deserialize into a different format.
- Automatically generate or synchronize schemas in downstream systems.
- Verify critical fields are present and set up alerts based on this.

It is important to consider that adding the schema of the event payload can increase the size of each message significantly, which can have an impact on changefeed throughput.

Use the [`envelope=enriched, enriched_properties=schema`](#enriched-properties-option) options with [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) to include the `"schema"` top-level field and the [schema fields and types](#schema):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE products INTO 'external://kafka:9092' WITH envelope=enriched, enriched_properties=schema;
~~~
~~~json
{
  "payload": {
    "after": {
      "category": "Home & Kitchen",
      "created_at": "2025-04-01T17:55:46.812942",
      "description": "Ceramic mug with 350ml capacity",
      "id": "8320b051-3ff7-4aa8-9708-78142fde7e31",
      "in_stock": true,
      "name": "Coffee Mug",
      "price": 12.50
    },
    "op": "c",
    "ts_ns": 1745353048801146000
  },
  "schema": {
    "fields": [
      {
        "field": "after",
        "fields": [
          {
            "field": "id",
            "optional": false,
            "type": "string"
          },
          {
            "field": "name",
            "optional": false,
            "type": "string"
          },
          {
            "field": "description",
            "optional": true,
            "type": "string"
          },
          {
            "field": "price",
            "name": "decimal",
            "optional": false,
            "parameters": {
              "precision": "10",
              "scale": "2"
            },
            "type": "float64"
          },
          {
            "field": "in_stock",
            "optional": true,
            "type": "boolean"
          },
          {
            "field": "category",
            "optional": true,
            "type": "string"
          },
          {
            "field": "created_at",
            "name": "timestamp",
            "optional": true,
            "type": "string"
          }
        ],
        "name": "products.after.value",
        "optional": false,
        "type": "struct"
      },
      {
        "field": "ts_ns",
        "optional": false,
        "type": "int64"
      },
      {
        "field": "op",
        "optional": false,
        "type": "string"
      }
    ],
    "name": "cockroachdb.envelope",
    "optional": false,
    "type": "struct"
  }
}
~~~

### Preserve the origin of data

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

When you have multiple changefeeds running from your cluster, or your CockroachDB cluster is part of a multi-architecture system, it is useful to have metadata on the origin of changefeed data in the message envelope.

Use the [`envelope=enriched, enriched_properties=source`](#enriched-properties-option) options with [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) to include the [`"source"`](#source) top-level field that contains metadata for the origin cluster and the changefeed job:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE products INTO 'kafka://localhost:9092' WITH envelope=enriched, enriched_properties=source;
~~~
~~~json
{
  "after": {
    "category": "Electronics",
    "created_at": "2025-04-24T14:59:28.96273",
    "description": "Portable speaker with Bluetooth 5.0",
    "id": "58390d92-2472-43e1-86bc-1642395e8dad",
    "in_stock": true,
    "name": "Bluetooth Speaker",
    "price": 45.00
  },
  "op": "c",
  "source": {
    "changefeed_sink": "kafka",
    "cluster_id": "38269e9c-9823-4568-875e-000000000000",
    "cluster_name": "",
    "database_name": "test",
    "db_version": "v25.2.0-beta.2",
    "job_id": "1066457644516704257",
    "node_id": "2",
    "node_name": "localhost",
    "origin": "cockroachdb",
    "primary_keys": [
      "id"
    ],
    "schema_name": "public",
    "source_node_locality": "",
    "table_name": "products"
  },
  "ts_ns": 1745527444910044000
}
~~~

### Enable full-fidelity message envelopes

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

A _full-fidelity_ changefeed message envelope ensures complete information about every change event in the [watched tables]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table)—including the before and after state of a row, timestamps, and rich metadata like source and schema information. This type of configured envelope allows downstream consumers to replay, audit, debug, or analyze changes with no loss of context.

It is important to consider that a full-fidelity envelope increases the size of each message significantly, which can have an impact on changefeed throughput.

Use the [`mvcc_timestamp`](#mvcc-timestamp-option), [`envelope=enriched, enriched_properties='source,schema'`](#enriched-properties-option), [`diff`](#diff-option), [`updated`](#updated-option), and [`key_in_value`](#key-in-value-option) (for Kafka) options with [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) to create a full-fidelity envelope:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE products INTO 'kafka://localhost:9092' WITH envelope=enriched, enriched_properties='source,schema', diff, mvcc_timestamp, updated, key_in_value;
~~~
~~~json
{
  "payload": {
    "after": {
      "category": "Home & Kitchen",
      "created_at": "2025-04-30T20:02:35.40316",
      "description": "Ceramic mug with 350ml capacity",
      "id": "98879aa0-72bc-4b12-a128-325a4753162e",
      "in_stock": true,
      "name": "Coffee Mug",
      "price": 12.50
    },
    "before": {
      "category": "Home & Kitchen",
      "created_at": "2025-04-30T20:02:35.40316",
      "description": "Ceramic mug with 350ml capacity",
      "id": "98879aa0-72bc-4b12-a128-325a4753162e",
      "in_stock": true,
      "name": "Coffee Mug",
      "price": 12.50
    },
    "key": {
      "id": "98879aa0-72bc-4b12-a128-325a4753162e"
    },
    "op": "u",
    "source": {
      "changefeed_sink": "kafka",
      "cluster_id": "585e6512-ea54-490a-8f1d-50c8d182a2e6",
      "cluster_name": "",
      "database_name": "test",
      "db_version": "v25.2.0-beta.2",
      "job_id": "1072079179268751361",
      "mvcc_timestamp": "1747243394200039000.0000000000",
      "node_id": "1",
      "node_name": "localhost",
      "origin": "cockroachdb",
      "primary_keys": ["id"],
      "schema_name": "public",
      "source_node_locality": "",
      "table_name": "products",
      "ts_hlc": "1747243394200039000.0000000000",
      "ts_ns": 1747243394200039000
    },
    "ts_ns": 1747243394886231000
  },
  "schema": {
    "fields": [
      {
        "field": "before",
        "fields": [
          { "field": "id", "optional": false, "type": "string" },
          { "field": "name", "optional": false, "type": "string" },
          { "field": "description", "optional": true, "type": "string" },
          {
            "field": "price",
            "name": "decimal",
            "optional": false,
            "parameters": { "precision": "10", "scale": "2" },
            "type": "float64"
          },
          { "field": "in_stock", "optional": true, "type": "boolean" },
          { "field": "category", "optional": true, "type": "string" },
          {
            "field": "created_at",
            "name": "timestamp",
            "optional": true,
            "type": "string"
          }
        ],
        "name": "products.before.value",
        "optional": true,
        "type": "struct"
      },
      {
        "field": "after",
        "fields": [
          { "field": "id", "optional": false, "type": "string" },
          { "field": "name", "optional": false, "type": "string" },
          { "field": "description", "optional": true, "type": "string" },
          {
            "field": "price",
            "name": "decimal",
            "optional": false,
            "parameters": { "precision": "10", "scale": "2" },
            "type": "float64"
          },
          { "field": "in_stock", "optional": true, "type": "boolean" },
          { "field": "category", "optional": true, "type": "string" },
          {
            "field": "created_at",
            "name": "timestamp",
            "optional": true,
            "type": "string"
          }
        ],
        "name": "products.after.value",
        "optional": false,
        "type": "struct"
      },
      {
        "field": "source",
        "fields": [
          { "field": "ts_ns", "optional": true, "type": "int64" },
          { "field": "database_name", "optional": false, "type": "string" },
          { "field": "cluster_name", "optional": false, "type": "string" },
          { "field": "cluster_id", "optional": false, "type": "string" },
          { "field": "node_name", "optional": false, "type": "string" },
          { "field": "mvcc_timestamp", "optional": true, "type": "string" },
          { "field": "origin", "optional": false, "type": "string" },
          { "field": "db_version", "optional": false, "type": "string" },
          { "field": "source_node_locality", "optional": false, "type": "string" },
          { "field": "table_name", "optional": false, "type": "string" },
          { "field": "changefeed_sink", "optional": false, "type": "string" },
          { "field": "job_id", "optional": false, "type": "string" },
          { "field": "node_id", "optional": false, "type": "string" },
          { "field": "ts_hlc", "optional": true, "type": "string" },
          { "field": "schema_name", "optional": false, "type": "string" },
          {
            "field": "primary_keys",
            "items": { "optional": false, "type": "string" },
            "optional": false,
            "type": "array"
          }
        ],
        "name": "cockroachdb.source",
        "optional": true,
        "type": "struct"
      },
      {
        "field": "key",
        "fields": [
          { "field": "id", "optional": false, "type": "string" }
        ],
        "name": "products.key",
        "optional": false,
        "type": "struct"
      },
      { "field": "ts_ns", "optional": false, "type": "int64" },
      { "field": "op", "optional": false, "type": "string" }
    ],
    "name": "cockroachdb.envelope",
    "optional": false,
    "type": "struct"
  }
}
~~~

## Option reference

For a full list of options that modify the message envelope, refer to the following table:

Option | Description | Sink support
-------+-------------+-------------+-------------
<a id="diff-option"></a>`diff` | Include a [`"before"`](#before) field in each message, showing the state of the row before the change. Supported with [`wrapped`](#wrapped-option) or [`enriched`](#enriched-option) envelopes. | All
<a id="enriched-properties-option"></a>`enriched_properties` (**Preview**) | (Only applicable when [`envelope=enriched`](#enriched-option) is set) Specify the type of metadata included in the message payload. Values:  `source`, `schema`. | Kafka, Pub/Sub, webhook, sinkless
<a id="bare-option"></a>`envelope=bare` | Emit an envelope without the `"after"` wrapper. The row's column data is at the top level of the message. Metadata that would typically be separate will be under a [`"__crdb__"`](#__crdb__) field. Provides a more compact structure to the envelope. `bare` is the default envelope when using [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}). When `bare` is used with the Avro format, `"record"` will replace the `"after"` keyword. | All
<a id="enriched-option"></a>`envelope=enriched` (**Preview**) | Extend the envelope with [additional metadata fields](#field-reference). With `enriched_properties`, includes a [`"source"`](#source) field and/or a [`"schema"`](#schema) field with extra context. Supported in JSON, Avro, and protobuf [message formats]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats). | Kafka, Pub/Sub, webhook, sinkless
<a id="key-only-option"></a>`envelope=key_only` | [Send only the primary key](#key_only) of the changed row and no value payload, which is more efficient if only the key of the changed row is needed. Not compatible with the `updated` option. | Kafka, sinkless
`envelope=row`  | Emit the row data without any additional metadata field in the envelope. Not supported in Avro format or with the [`diff`](#diff-option) option. | Kafka, sinkless
<a id="wrapped-option"></a>`envelope=wrapped` (default) | Produce changefeed messages in a wrapped structure with metadata and row data. [`wrapped`](#wrapped) includes an [`"after"`](#after) field, and optionally a [`"before"`](#before) field if [`diff`](#diff-option) is used. **Note:** Envelopes contain a primary key when your changefeed is emitting to a sink that does not have a message key as part of its protocol. By default, messages emitting to Kafka sinks do not have the primary key field. Use the [`key_in_value`](#key-in-value-option) option to include a primary key array field in messages emitted to [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka). | All
<a id="full-table-name-option"></a>`full_table_name` | Use the [fully qualified table name]({% link {{ page.version.version }}/sql-name-resolution.md %}) (`database.schema.table`) in topics, subjects, schemas, and record output instead of the default table name. Including the full table name prevents unintended behavior when the same table name is present in multiple databases. | All
<a id="key-in-value-option"></a>`key_in_value` | Add a primary key array to the emitted message in Kafka sinks. This makes the primary key of a deleted row recoverable in sinks where each message has a value, but not a key. `key_in_value` is on by default in cloud storage and webhook sinks. To only emit the primary key of the changed row in Kafka sinks, use [`envelope=key_only`](#key_only). | Kafka
<a id="mvcc-timestamp-option"></a>`mvcc_timestamp` | Emit the [MVCC]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) timestamp for each change event. The message envelope contains the MVCC timestamp of the changed row, even during the changefeed's initial scan. Provides a precise database commit timestamp, which is useful for debugging or strict ordering. | All
<a id="resolved-option"></a>`resolved` | Emit `resolved` timestamps in a format depending on the connected sink. **Note:** The `resolved` timestamp is emitted as a separate message, and has its own envelope containing a `resolved` key and a timestamp value as a string. For more details on the `resolved` options, refer to [Resolved messages]({% link {{ page.version.version }}/changefeed-messages.md %}#resolved-messages). | All
<a id="updated-option"></a>`updated` | Add an [`"updated"`](#updated) timestamp field to each message, showing the commit time of the change. When the changefeed runs an initial scan or a [schema change backfill]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill), the `"updated"` field will reflect the time of the scan or backfill, not the MVCC timestamp. If you use `updated` with `envelope=enriched`, you must also specify [`enriched_properties=source`](#enriched-properties-option), and then the `"updated"` field will be replaced with `"ts_ns"` and `"ts_hlc"` in the [`"source"`](#source) fields. **Note:** `envelope=enriched` with the `updated` option will not produce a change event commit timestamp in the message—to include the timestamp, use `updated` with `envelope=enriched, enriched_properties=source, updated`. | All

### `envelope` option examples

#### `wrapped`

`wrapped` is the default envelope structure for changefeed messages. This envelope contains an array of the primary key (or the key as part of the message metadata), a top-level field for the type of message, and the current state of the row (or `NULL` for [deleted rows]({% link {{ page.version.version }}/changefeed-messages.md %}#delete-messages)).

By default, messages emitted to Kafka sinks do not have the primary key array field. If you would like messages emitted to Kafka sinks to contain a primary key array field, you can use the [`key_in_value`]({% link {{ page.version.version }}/create-changefeed.md %}#key-in-value) option. Refer to the following message outputs for examples of this.

Cloud storage sink:

~~~sql
CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://cloud';
~~~
~~~
{"after": {"city": "seattle", "creation_time": "2019-01-02T03:04:05", "current_location": "86359 Jeffrey Ranch", "ext": {"color": "yellow"}, "id": "68ee1f95-3137-48e2-8ce3-34ac2d18c7c8", "owner_id": "570a3d70-a3d7-4c00-8000-000000000011", "status": "in_use", "type": "scooter"}, "key": ["seattle", "68ee1f95-3137-48e2-8ce3-34ac2d18c7c8"]}
~~~

Kafka sink:

Default when `envelope=wrapped` or `envelope` is not specified:

~~~sql
CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://kafka';
~~~
~~~
{"after": {"city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "24315 Elizabeth Mountains", "ext": {"color": "yellow"}, "id": "dadc1c0b-30f0-4c8b-bd16-046c8612bbea", "owner_id": "034075b6-5380-4996-a267-5a129781f4d3", "status": "in_use", "type": "scooter"}}
~~~

Kafka sink message with `key_in_value` provided:

~~~sql
CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://kafka' WITH key_in_value, envelope=wrapped;
~~~
~~~
{"after": {"city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "46227 Jeremy Haven Suite 92", "ext": {"brand": "Schwinn", "color": "red"}, "id": "298cc7a0-de6b-4659-ae57-eaa2de9d99c3", "owner_id": "beda1202-63f7-41d2-aa35-ee3a835679d1", "status": "in_use", "type": "bike"}, "key": ["washington dc", "298cc7a0-de6b-4659-ae57-eaa2de9d99c3"]}
~~~

#### `enriched`

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

[`enriched`](#enriched-option) introduces additional metadata to the envelope, which is further configurable with the [`enriched_properties`](#enriched-properties-option) option. This envelope option is supported for [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), [Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub), and sinkless changefeeds.

To add the operation type and the processing timestamp of the change event to the envelope, use `envelope=enriched`:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE products INTO 'external://kafka' WITH envelope=enriched;
~~~
~~~
{"after": {"category": "Electronics", "created_at": "2025-04-24T14:59:28.96273", "description": "Ergonomic wireless mouse with USB receiver", "id": "cb1a3e43-dccf-422f-a27d-ea027c233682", "in_stock": true, "name": "Wireless Mouse", "price": 29.99}, "op": "c", "ts_ns": 1745525261013511000}
~~~

To order messages when using `envelope=enriched`, you must also use `enriched_properties='source'` with the `updated` option in order to include the [`"ts_hlc"` and `"ts_ns"`](#source) commit timestamps in the `"source"` field:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE products INTO 'kafka://localhost:9092' WITH envelope=enriched,enriched_properties=source, updated;
~~~
~~~json
{
	"after": {
		"category": "Home & Kitchen",
		"created_at": "2025-04-30T20:02:35.40316",
		"description": "Adjustable LED desk lamp with touch controls",
		"id": "4b36388a-f7e6-4b95-9f78-3aee9e2060d6",
		"in_stock": true,
		"name": "LED Desk Lamp",
		"price": 22.30
	},
	"op": "c",
	"source": {
		"changefeed_sink": "kafka",
		"cluster_id": "585e6512-ea54-490a-8f1d-50c8d182a2e6",
		"cluster_name": "",
		"database_name": "test",
		"db_version": "v25.2.0-beta.2",
		"job_id": "1068153948173991937",
		"node_id": "1",
		"node_name": "localhost",
		"origin": "cockroachdb",
		"primary_keys": [
			"id"
		],
		"schema_name": "public",
		"source_node_locality": "",
		"table_name": "products",
		"ts_hlc": "1746045115619002000.0000000000",
		"ts_ns": 1746045115619002000
	},
	"ts_ns": 1746045115679811000
}
~~~

To add the origin of the change data and the schema of the payload, use the `envelope=enriched` and `enriched_properties='source,schema'`:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE products INTO 'external://kafka' WITH envelope=enriched, enriched_properties='source,schema';
~~~
~~~json
{
	"payload": {
		"after": {
			"category": "Electronics",
			"created_at": "2025-04-24T14:59:28.96273",
			"description": "Ergonomic wireless mouse with USB receiver",
			"id": "cb1a3e43-dccf-422f-a27d-ea027c233682",
			"in_stock": true,
			"name": "Wireless Mouse",
			"price": 29.99
		},
		"op": "c",
		"source": {
			"changefeed_sink": "kafka",
			"cluster_id": "38269e9c-9823-4568-875e-d867e12156f2",
			"cluster_name": "",
			"database_name": "test",
			"db_version": "v25.2.0-beta.2",
			"job_id": "1066452286961614849",
			"node_id": "2",
			"node_name": "localhost",
			"origin": "cockroachdb",
			"primary_keys": [
				"id"
			],
			"schema_name": "public",
			"source_node_locality": "",
			"table_name": "products"
		},
		"ts_ns": 1745525809913428000
	},
	"schema": {
		"fields": [
			{
				"field": "after",
				"fields": [
					{ "field": "id", "optional": false, "type": "string" },
					{ "field": "name", "optional": false, "type": "string" },
					{ "field": "description", "optional": true, "type": "string" },
					{
						"field": "price",
						"name": "decimal",
						"optional": false,
						"parameters": {
							"precision": "10",
							"scale": "2"
						},
						"type": "float64"
					},
					{ "field": "in_stock", "optional": true, "type": "boolean" },
					{ "field": "category", "optional": true, "type": "string" },
					{
						"field": "created_at",
						"name": "timestamp",
						"optional": true,
						"type": "string"
					}
				],
				"name": "products.after.value",
				"optional": false,
				"type": "struct"
			},
			{
				"field": "source",
				"fields": [
					{ "field": "mvcc_timestamp", "optional": true, "type": "string" },
					{ "field": "ts_ns", "optional": true, "type": "int64" },
					{ "field": "ts_hlc", "optional": true, "type": "string" },
					{ "field": "table_name", "optional": false, "type": "string" },
					{ "field": "origin", "optional": false, "type": "string" },
					{ "field": "cluster_id", "optional": false, "type": "string" },
					{ "field": "node_id", "optional": false, "type": "string" },
					{ "field": "changefeed_sink", "optional": false, "type": "string" },
					{ "field": "schema_name", "optional": false, "type": "string" },
					{ "field": "node_name", "optional": false, "type": "string" },
					{ "field": "database_name", "optional": false, "type": "string" },
					{ "field": "source_node_locality", "optional": false, "type": "string" },
					{
						"field": "primary_keys",
						"items": {
							"optional": false,
							"type": "string"
						},
						"optional": false,
						"type": "array"
					},
					{ "field": "job_id", "optional": false, "type": "string" },
					{ "field": "db_version", "optional": false, "type": "string" },
					{ "field": "cluster_name", "optional": false, "type": "string" }
				],
				"name": "cockroachdb.source",
				"optional": true,
				"type": "struct"
			},
			{ "field": "ts_ns", "optional": false, "type": "int64" },
			{ "field": "op", "optional": false, "type": "string" }
		],
		"name": "cockroachdb.envelope",
		"optional": false,
		"type": "struct"
	}
}
~~~

#### `bare`

`bare` removes the `after` key from the changefeed message and stores any metadata in a `crdb` field. When used with [`avro`]({% link {{ page.version.version }}/changefeed-messages.md %}#avro) format, `record` will replace the `after` key.

Cloud storage sink:

~~~sql
CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://cloud' WITH envelope=bare;
~~~
~~~
{"__crdb__": {"key": ["washington dc", "cd48e501-e86d-4019-9923-2fc9a964b264"]}, "city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "87247 Diane Park", "ext": {"brand": "Fuji", "color": "yellow"}, "id": "cd48e501-e86d-4019-9923-2fc9a964b264", "owner_id": "a616ce61-ade4-43d2-9aab-0e3b24a9aa9a", "status": "available", "type": "bike"}
~~~

{% include {{ page.version.version }}/cdc/bare-envelope-cdc-queries.md %}

In CDC queries:

A changefeed containing a `SELECT` clause without any additional options:

~~~sql
CREATE CHANGEFEED INTO 'external://kafka' AS SELECT city, type FROM movr.vehicles;
~~~
~~~
{"city": "los angeles", "type": "skateboard"}
~~~

A changefeed containing a `SELECT` clause with the [`topic_in_value`]({% link {{ page.version.version }}/create-changefeed.md %}#topic-in-value) option specified:

~~~sql
CREATE CHANGEFEED INTO 'external://kafka' WITH topic_in_value AS SELECT city, type FROM movr.vehicles;
~~~
~~~
{"__crdb__": {"topic": "vehicles"}, "city": "los angeles", "type": "skateboard"}
~~~

#### `key_only`

`key_only` emits only the key and no value, which is faster if you only need to know the key of the changed row. This envelope option is only supported for [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or sinkless changefeeds.

Kafka sink:

~~~sql
CREATE CHANGEFEED FOR TABLE users INTO 'external://kafka' WITH envelope=key_only;
~~~
~~~
["boston", "22222222-2222-4200-8000-000000000002"]
~~~

{{site.data.alerts.callout_info}}
It is necessary to set up a [Kafka consumer](https://docs.confluent.io/platform/current/clients/consumer.html) to display the key because the key is part of the metadata in Kafka messages, rather than in its own field. When you start a Kafka consumer, you can use `--property print.key=true` to have the key print in the changefeed message.
{{site.data.alerts.end}}

Sinkless changefeeds:

~~~sql
CREATE CHANGEFEED FOR TABLE users WITH envelope=key_only;
~~~
~~~
{"key":"[\"seattle\", \"fff726cc-13b3-475f-ad92-a21cafee5d3f\"]","table":"users","value":""}
~~~

#### `row`

`row` emits the row without any additional metadata fields in the message. This envelope option is only supported for [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or sinkless changefeeds. `row` does not support [`avro`]({% link {{ page.version.version }}/changefeed-messages.md %}#avro) format—if you are using `avro`, refer to the [`bare`](#bare) envelope option.

Kafka sink:

~~~sql
CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://kafka' WITH envelope=row;
~~~
~~~
{"city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "85551 Moore Mountains Apt. 47", "ext": {"color": "red"}, "id": "d3b37607-1e9f-4e25-b772-efb9374b08e3", "owner_id": "4f26b516-f13f-4136-83e1-2ea1ae151c20", "status": "available", "type": "skateboard"}
~~~

## Field reference

CockroachDB provides multiple changefeed envelopes, each supported by different [sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) and [use cases](#use-cases). For the [changefeed options](#option-reference) to enable each field, refer to the following descriptions:

### `"payload"`

The top-level `"payload"` field is present in envelopes for changefeeds emitting to a [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink) sink and contains all of the change event data. The messages emit as a batch with a `"payload"` wrapper around the change event data and a `"length"` field for the number of messages in the batch:

~~~
{"payload": [{"after" : {"a" : 1, "b" : "a"}, "key": [1], "topic": "foo"}, {"after": {"a": 1, "b": "b"}, "key": [1], "topic": "foo" }], "length":2}
~~~

#### `"payload"` with enriched envelope

When the [`envelope=enriched, enriched_properties=schema`](#enriched-properties-option) envelope options are specified, the envelope will include a `payload` field that wraps the entire message except for the [`"schema"`](#schema) fields.

As a result, when you emit messages to a webhook sink with `envelope=enriched, enriched_properties=schema`, you will receive messages with two `"payload"` fields, similar to the following structure:

~~~json
{
  "payload": [
    {
      "payload": {
        "after": {
          "category": "Home & Kitchen",
          "created_at": "2025-04-30T20:02:35.40316",
          "description": "Adjustable LED desk lamp with touch controls",
          "id": "4b36388a-f7e6-4b95-9f78-3aee9e2060d6",
          "in_stock": true,
          "name": "LED Desk Lamp",
          "price": 22.30
        },
        "before": null,
        "key": {
          "id": "4b36388a-f7e6-4b95-9f78-3aee9e2060d6"
        },
        "op": "c",
        "source": {
				// ... Metadata source fields
        },
        "ts_ns": 1747245104106528000
      },
      "schema": {
        "fields": [
// ...
~~~

#### `"after"` 

The state of the row after the change. This contains the column names and values after an [`INSERT`]({% link {{ page.version.version }}/insert.md %}) or [`UPDATE`]({% link {{ page.version.version }}/update.md %}). For [`DELETE`]({% link {{ page.version.version }}/delete.md %}) operations, `"after"` will be `NULL`. In the default [`wrapped`](#wrapped) envelope, every message for an `INSERT` or `UPDATE` has an `"after"` field with the new data. In a [`row`](#row) envelope, the whole message is the state of the row without the `"after"` wrapper, and in the [`key_only`](#key_only) envelope there is no `"after"` field because only the key is sent.

#### `"before"` 

The state of the row before the change. This field appears only if the [`diff`](#diff-option) option is enabled on a `wrapped` (or `enriched`) envelope. For updates, `"before"` is the previous values of the row before the update. For deletes, `"before"` is the last state of the row. For inserts, `"before"` will be `NULL` (the row had no prior state). This field is useful for [auditing changes](#audit-changes-in-data) or computing differences. (Not applicable to envelopes like [`row`](#row) or [`key_only`](#key_only), which do not support the `"before"` or `"after"` fields.)

#### `"key"` 

- For non-`enriched` envelopes: An array composed of the row's `PRIMARY KEY` field(s) (e.g., `[1]` for JSON or `{"id":{"long":1}}` for Avro). For Kafka sinks, the primary key array field is by default off. If you would like messages emitted to Kafka sinks to contain a primary key array, you can use the [`key_in_value`]({% link {{ page.version.version }}/create-changefeed.md %}#key-in-value) option.
- For `enriched` envelopes: The primary key of the row as an object, e.g, `{"id": 1}`. 

#### `"updated"` 

A timestamp indicating when the change was committed. This field appears if the [`updated`](#updated-option) option is enabled. It is formatted as a string timestamp. The `updated` timestamp corresponds to the transaction commit time for that change. If the changefeed was started with a [`cursor`]({% link {{ page.version.version }}/create-changefeed.md %}#cursor) (at a specific past timestamp), the updated times will align with the MVCC timestamps of each row version.

#### `"op"`

The type of change operation. `"c"` for `INSERT`, `"u"` for `UPDATE`, `"d"` for `DELETE`. This field emits if [`envelope=enriched`](#enriched-option) is enabled.

If you're using [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}) to [filter only for the type of change operation]({% link {{ page.version.version }}/cdc-queries.md %}#cdc-query-function-support), we recommend using the `envelope=enriched` option instead for this metadata.

#### `"source"` 

Metadata about the source of the change event. This is included when using [`envelope=enriched`](#enriched-option) with [`enriched_properties='source'`](#enriched-properties-option) (or `'source,schema'`). The `"source"` field includes the following fields about the cluster running the changefeed:

- `"changefeed_sink"`: The [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) type receiving the changefeed (e.g., `"kafka"`, `"sinkless buffer"`).
- `"cluster_id"`: The [unique ID]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output).
- `"cluster_name"`: The name, [if configured]({% link {{ page.version.version }}/cockroach-start.md %}#flags-cluster-name).
- `"database_name"`: The name of the database.
- `"db_version"`: The CockroachDB version.
- `"job_id"`: The changefeed's [job]({% link {{ page.version.version }}/show-jobs.md %}) ID.
- `"mvcc_timestamp"`: The [MVCC timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) of the change, as a string. This is CockroachDB’s timestamp for the version (a decimal number representing logical time). It is included if the [`mvcc_timestamp`](#mvcc-timestamp-option) option is set. Unlike [`"updated"`](#updated), which might be omitted for initial scans, `"mvcc_timestamp"` is always present on each message when enabled, including backfill events. This field is mainly used for low-level debugging or when exact internal timestamps are needed. (`"mvcc_timestamp"` will be a top-level field when the changefeed is not using the [`enriched`](#enriched) envelope.)
- `"node_id"`: The ID of the node that emitted the changefeed message.
- `"node_name"`: The name of the node that emitted the changefeed message.
- `"origin"`: The identifier for the changefeed's origin, always `cockroachdb`.
- `"primary_keys"`: An array of [primary key]({% link {{ page.version.version }}/primary-key.md %}) column name(s) for the changed row.
- `"schema_name"`: The schema name of the changed table.
- `"source_node_locality"`: The [locality]({% link {{ page.version.version }}/cockroach-start.md %}#standard-output) of the node that emitted the changefeed messages, e.g., `"cloud=gce,region=us-east1,zone=us-east1-b"`.
- `"table_name"`: The name of the table that changed.
- `"ts_hlc"`: A timestamp indicating when the change was committed. Included instead of `"updated"` when the [`enriched_properties=source`](#enriched-properties-option) and [`updated`](#updated-option) options are included at changefeed creation.
- `"ts_ns"`: A timestamp indicating when the change was committed. Included instead of `"updated"` when the [`enriched_properties=source`](#enriched-properties-option) and [`updated`](#updated-option) options are included at changefeed creation.

#### `"ts_ns"` 

The processing time of the event by the changefeed job. This field emits if [`envelope=enriched`](#enriched-option) is enabled.

When you're comparing changes for ordering, it is important to ignore this top-level [`ts_ns` field]. Instead, if you require timestamps to order messages based on the change event's commit time, then you must specify `envelope=enriched, enriched_properties=source, updated` when you create the changefeed, which will include `"ts_hlc"` and `"ts_ns"` in the [`"source"`](#source) field. 

#### `table`: 

The name of the table that generated the change. This field appears in certain contexts:

- In sinkless changefeeds (those created with [`EXPERIMENTAL CHANGEFEED FOR`]({% link {{ page.version.version }}/changefeed-for.md %}) or `CREATE CHANGEFEED ... WITH sinkless`), the output includes a `"table"` field for each row change, because a single sinkless feed could cover multiple tables.
- In the [`enriched`](#enriched) envelope, the [fully qualified table name]({% link {{ page.version.version }}/sql-name-resolution.md %}) is typically part of the [`"source"`](#source) field (as `"database_name"`, `"schema_name"`, `"table_name"` sub-fields), rather than a separate top-level `"table"` field.

{{site.data.alerts.callout_info}}
When a changefeed targets a table with multiple column families, the family name is appended to the table name as part of the topic. Refer to [Tables with columns families in changefeeds]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %}#message-format) for guidance.
{{site.data.alerts.end}}

#### `__crdb__`

A field used by the [`bare`](#bare) envelope to carry CockroachDB metadata that would otherwise be top level. When `envelope=bare`, the message’s top level is the row data, so CockroachDB inserts any needed metadata (primary key, topic, timestamps, etc.) under a nested `"__crdb__"` object. For example:

~~~json
{
"__crdb__": {"key": [101]},
"id": 101,
"customer_id": 1,
"total": 50.00,
"status": "new"
}
~~~

Here `"__crdb__": {"key": [101]}` holds the primary key for the row, while the rest of the object are the row’s columns at the top level. Other metadata like [`"updated"`](#updated) timestamps or [`resolved`](#resolved-option) timestamps would also appear inside `__crdb__`, if present. This field is specific to the `bare` envelope or other cases (like custom [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}) with `SELECT`) where metadata needs to be attached without interfering with the selected row data.

### `"schema"` 

The schema and type of each payload field. This is included when using [`envelope=enriched`](#enriched-option) with [`enriched_properties='schema'`](#enriched-properties-option). The `"schema"` field provides information needed to interpret the data. The following are present for each schema present in the envelope, depending on the configured options:

- `"field"`: The name of field.
- `"type"`: The type of the field. If `"type"` is an `array`, then the `"items"` field defines the data type of the array elements.
- `"optional"`: This is a boolean field that defines whether a field may be absent in the `"payload"` section of the envelope depending on the configuration.
- `"name"`: The name of the described schema.

## See more

- For more details on the file naming format for cloud storage sinks, refer to [changefeed files]({% link {{ page.version.version }}/create-changefeed.md %}#files).