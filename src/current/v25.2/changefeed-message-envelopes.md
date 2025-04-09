---
title: Changefeed Message Envelope
summary: Learn how to configure the changefeed message envelope.
toc: true
---

In CockroachDB changefeeds, the _envelope_ is the structure of each [_message_]({% link {{ page.version.version }}/changefeed-messages.md %}). Changefeeds package _events_, triggered by an update to a row in a [watched table]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table), into messages according to the configured envelope. By default, changefeed messages use the `wrapped` envelope, which includes the primary key of the changed row and a top-level field indicating the value of the row after the change event (an `"after"` field with the new row values, or `NULL` for deletes).​ 

You can use changefeed options to customize message contents in order to integrate with your downstream requirements. For example, the previous state of the row, the information of the cluster that the message is coming from, or the schema of the event payload in the message.

The possible envelope fields support use cases such as:

- Enabling full-fidelity changefeed messages.
- Routing events based on operation type.
- Automatically generating or synchronizing schemas in downstream consumers.

This page covers:

- [Overview](#overview) for a brief summary of the CockroachDB envelope fields.
- [Use case](#use-cases) examples
- Reference lists:
    - The [options](#option-reference) to configure the envelope.
    - The supported envelope [fields](#field-reference).

{{site.data.alerts.callout_info}}
You can also specify the _format_ of changefeed messages, such as Avro. For more details, refer to [Message formats]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats).
{{site.data.alerts.end}}

## Overview

The envelope of a changefeed message depends on the following:

- The [configured envelope and changefeed options](#option-reference)
- The [sink]({% link {{ page.version.version }}/changefeed-sinks.md %})
- The [message format]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats)

The envelope can contain any of the outlined fields. For more details, refer to the complete reference lists that explain each [envelope field](#field-reference) and [configurable option](#option-reference) to build a changefeed's envelope structure.

The payload containing the change event's table data and metadata for the event. You can optionally include the state of the row before and after the change event and operation, origin, and timestamp information about the change:

~~~json
{
  "payload": { 
    "after": { 
      "col_a": "new_value",
      // ... other columns ...
    },
    "before": { 
      "col_a": "old_value",
      // ... other columns ...
    },
    "op": "c", 
    "source": {
      // ... Metadata source fields
    },
    "ts_ns": 1745527444910044000
// ...
~~~

The schema definition of the payload:

~~~json
// ...
  },
  "schema": {
    "type": "struct",
    "name": "cockroachdb.envelope",  // Schema identifier
    "optional": false,
    "fields": [
      {
        "field": "before",
        "type": "struct",
        "optional": true,
        "fields": [
          // Schema for row before change (same as the table schema)
        ]
      },
      {
        "field": "after",
        "type": "struct",
        "optional": true,
        "fields": [
          // Schema for row after change (same as the table schema)
        ]
      },
      {
        "field": "op",
        "type": "string",
        "optional": false  // Operation type
      },
// ... Schema definition of additional fields source, ts_ns ...
~~~

## Use cases

The use case examples in the following sections emit to a Kafka sink. Use the [Options](#option-reference) table for the options supported by different sinks.

Each example uses the following table schema:

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
The values that the `envelope` option accepts are compatible with different [changefeed sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}), and the structure of the message will vary depending on the sink.
{{site.data.alerts.end}}

### Enable full fidelity message envelopes

{% include_cached new-in.html version="v25.2" %} A _full fidelity_ changefeed message envelope ensures complete information about every change event in the [watched tables]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table)—including the before and after state of a row, timestamps, and rich metadata like source and schema information. This type of configured envelope allows downstream consumers to replay, audit, debug, or analyze changes with no loss of context.

Use the `mvcc_timestamp`, `envelope=enriched, enriched_properties='source,schema'`, and `diff` options with `CREATE CHANGEFEED` to create a full-fidelity envelope:

~~~sql
CREATE CHANGEFEED FOR TABLE products INTO 'kafka://localhost:9092' WITH envelope=enriched, enriched_properties='source,schema', diff, mvcc_timestamp;
~~~
~~~json
{
  "payload": {
    "after": {
      "category": "Electronics",
      "created_at": "2025-04-24T14:59:28.96273",
      "description": "Portable speaker with Bluetooth 5.0",
      "id": "58390d92-2472-43e1-86bc-1642395e8dad",
      "in_stock": true,
      "name": "Bluetooth Speaker",
      "price": 45.00
    },
    "before": null,
    "op": "c",
    "source": {
      "changefeed_sink": "kafka",
      "cluster_id": "38269e9c-9823-4568-875e-000000000000",
      "cluster_name": "",
      "database_name": "test",
      "db_version": "v25.2.0-beta.2",
      "job_id": "1066445522313740289",
      "mvcc_timestamp": "1745506768962755000.0000000000",
      "node_id": "2",
      "node_name": "localhost",
      "origin": "cockroachdb",
      "primary_keys": ["id"],
      "schema_name": "public",
      "source_node_locality": "",
      "table_name": "products"
    },
    "ts_ns": 1745523745569419000
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
            "items": { "optional": false, "type": "string" },
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

### Route events based on operation type

{% include_cached new-in.html version="v25.2" %} You may want to route change events in a table based on the operation type (insert, update, delete), which can be useful for correctly applying or handling a change in a downstream system or replication pipeline. Use the `envelope=enriched` option with `CREATE CHANGEFEED` to include the `op` field in the envelope:

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

The `op` field can contain:

- `c` for inserts.
- `u` for updates.
- `d` for deletes.

### Add envelope schema fields

{% include_cached new-in.html version="v25.2" %} Adding the schema of the event payload to the message envelope allows you to:

- Handle schema changes in downstream processing systems that require field types.
- Detect and adapt to changes in the table schema over time.
- Correctly parse and cast the data to deserialize into a different format.
- Automatically generate or synchronize schemas in downstream systems.
- Verify critical fields are present and set up alerts based on this.

Use the `envelope=enriched, enriched_properties=schema` options with `CREATE CHANGEFEED` to include the `schema` top-level field and the schema fields and types:

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

{% include_cached new-in.html version="v25.2" %} When you have multiple changefeeds running from your cluster, or your CockroachDB cluster is part of a multi-architecture system, it is useful to have metadata on the origin of changefeed data in the message envelope.

Use the `envelope=enriched, enriched_properties=source` options with `CREATE CHANGEFEED` to include the `source` top-level field that contains metadata for the origin cluster and the changefeed job:

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

For a sinkless changefeed,

~~~sql
CREATE CHANGEFEED FOR TABLE products WITH envelope=enriched, enriched_properties=source;
~~~
~~~
{"key":"{\"id\": \"df8f23a0-f490-4e0e-a1d0-2d1f8bd5ddea\"}","table":"products","value":"{\"after\": {\"category\": \"Home \u0026 Kitchen\", \"created_at\": \"2025-04-24T14:59:28.96273\", \"description\": \"Premium ceramic mug with 400ml capacity and matte finish\", \"id\": \"df8f23a0-f490-4e0e-a1d0-2d1f8bd5ddea\", \"in_stock\": true, \"name\": \"Coffee Mug\", \"price\": 14.99}, \"op\": \"c\", \"source\": {\"changefeed_sink\": \"sinkless buffer\", \"cluster_id\": \"38269e9c-9823-4568-875e-d867e12156f2\", \"cluster_name\": \"\", \"database_name\": \"test\", \"db_version\": \"v25.2.0-beta.2\", \"job_id\": \"0\", \"node_id\": \"1\", \"node_name\": \"localhost\", \"origin\": \"cockroachdb\", \"primary_keys\": [\"id\"], \"schema_name\": \"public\", \"source_node_locality\": \"\", \"table_name\": \"products\"}, \"ts_ns\": 1745527520674943000}"}
~~~

### Audit changes in data

You can include both the previous and updated states of a row in the message envelope to support use cases like auditing or applying change-based logic in downstream systems. Use the `diff` option with `CREATE CHANGEFEED` to include the previous state of the row:

~~~sql
CREATE CHANGEFEED FOR TABLE products INTO 'kafka://localhost:9092' WITH diff;
~~~

The `diff` option adds the `before` field to the envelope containing the state of the row before the change:

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

For an insert into the table, the `before` field contains `null`:

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

## Option reference

For a full list of options that modify the message envelope, refer to the following table:

Option | Description | Sink support
-------+-------------+-------------+-------------
`diff` | Include a `"before"` field in each message, showing the state of the row before the change. Supported with `wrapped` or `enriched` envelopes. | All
<span class="version-tag">New in v25.2:</span> `enriched_properties` | (Only applicable when `envelope=enriched` is set) Specify the type of metadata included in the message payload. Values:  `source`, `schema`. | Kafka, Pub/Sub, webhook, sinkless
`envelope=bare` | Emit an envelope without the `"after"` wrapper. The row's column data is at the top level of the message. Metadata that would typically be separate will be under a `"__crdb__"` field. Provides a more compact structure to the envelope. `bare` is the default envelope when using [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}). When `bare` is used with the Avro format, `record` will replace the `after` keyword. | All
<span class="version-tag">New in v25.2:</span> `envelope=enriched` | Extend the envelope with additional metadata fields. With `enriched_properties`, includes a `"source"` field and/or a `"schema"` field with extra context. | Kafka, Pub/Sub, webhook, sinkless
`envelope=key_only` | Send only the primary key of the changed row and no value payload, which is more efficient if only the key of the changed row is needed. Not compatible with the `updated` option. | Kafka, sinkless
`envelope=row`  | Emit the row data without any additional metadata field in the envelope. Not supported in Avro format or with the `diff` option. | Kafka, sinkless
`envelope=wrapped` (default) | Produce changefeed messages in a wrapped structure with metadata and row data. `wrapped` includes an `"after"` field, and optionally a `"before"` field if `diff` is used. **Note:** Envelopes contain a primary key when your changefeed is emitting to a sink that does not have a message key as part of its protocol. By default, messages emitting to Kafka sinks do not have the primary key array, because the key is part of the message metadata. Use the `key_in_value` option to include a primary key array in messages emitted to Kafka sinks. | All
`full_table_name` | Use the fully qualified table name (`database.schema.table`) in topics, subjects, schemas, and record output instead of the default table name. Including the full table name prevents unintended behavior when the same table name is present in multiple databases. | All
`key_in_value` | Add a primary key array to the emitted message in Kafka sinks. This makes the primary key of a deleted row recoverable in sinks where each message has a value, but not a key. To only emit the primary key of the changed row in Kafka sinks, use `envelope=key_only`. | Kafka
`mvcc_timestamp` | Emit the MVCC timestamp for each change event. The message envelope contains the MVCC timestamp of the changed row, even during the changefeed's initial scan. Provides a precise database commit timestamp, which is useful for debugging or strict ordering. | All
`resolved` | Emit `resolved` timestamps in a format depending on the connected sink. **Note:** The `resolved` timestamp is emitted as a separate message, and has its own envelope containing a `resolved` key and a timestamp value as a string. For more details on the `resolved` options, refer to [Resolved messages]({% link {{ page.version.version }}/changefeed-messages.md %}#resolved-messages).
`updated` | Add an `"updated"` timestamp field to each message, showing the commit time of the change. When the changefeed runs an initial scan or a schema change backfill, the `"updated"` field will reflect the time of the scan or backfill, not the MVCC timestamp. If you use `updated` with `enriched_properties=source`, the `"updated"` field will be replaced with `ts_ns` and `ts_hlc` in the `"source"` fields. | All

### `envelope` option examples

#### `wrapped`

`wrapped` is the default envelope structure for changefeed messages. This envelope contains an array of the primary key (or the key as part of the message metadata), a top-level field for the type of message, and the current state of the row (or `NULL` for [deleted rows]({% link {{ page.version.version }}/changefeed-messages.md %}#delete-messages)).

The message envelope contains a primary key array when your changefeed is emitting to a sink that does not have a message key as part of its protocol, (e.g., cloud storage, webhook sinks, or Google Pub/Sub). By default, messages emitted to Kafka sinks do not have the primary key array, because the key is part of the message metadata. If you would like messages emitted to Kafka sinks to contain a primary key array, you can use the [`key_in_value`]({% link {{ page.version.version }}/create-changefeed.md %}#key-in-value) option. Refer to the following message outputs for examples of this.

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

{% include_cached new-in.html version="v25.2" %} `enriched` introduces additional metadata to the envelope, which is further configurable with the `enriched_properties` option. This envelope option is supported for [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), Google Cloud Pub/Sub, and sinkless changefeeds.

- To add the operation type and the timestamp of the change event to envelope, use `envelope=enriched`:

    ~~~sql
    CREATE CHANGEFEED FOR TABLE products INTO 'external://kafka' WITH envelope=enriched;
    ~~~
    ~~~
    {"after": {"category": "Electronics", "created_at": "2025-04-24T14:59:28.96273", "description": "Ergonomic wireless mouse with USB receiver", "id": "cb1a3e43-dccf-422f-a27d-ea027c233682", "in_stock": true, "name": "Wireless Mouse", "price": 29.99}, "op": "c", "ts_ns": 1745525261013511000}
    ~~~

- To add the origin of the change data and the schema of the payload, use the `envelope=enriched` and `enriched_properties='source,schema'`:

    ~~~sql
    CREATE CHANGEFEED FOR TABLE products INTO 'external://kafka' WITH envelope=enriched, enriched_properties='source,schema';
    ~~~
    ~~~
    {"payload": {"after": {"category": "Electronics", "created_at": "2025-04-24T14:59:28.96273", "description": "Ergonomic wireless mouse with USB receiver", "id": "cb1a3e43-dccf-422f-a27d-ea027c233682", "in_stock": true, "name": "Wireless Mouse", "price": 29.99}, "op": "c", "source": {"changefeed_sink": "kafka", "cluster_id": "38269e9c-9823-4568-875e-d867e12156f2", "cluster_name": "", "database_name": "test", "db_version": "v25.2.0-beta.2", "job_id": "1066452286961614849", "node_id": "2", "node_name": "localhost", "origin": "cockroachdb", "primary_keys": ["id"], "schema_name": "public", "source_node_locality": "", "table_name": "products"}, "ts_ns": 1745525809913428000}, "schema": {"fields": [{"field": "after", "fields": [{"field": "id", "optional": false, "type": "string"}, {"field": "name", "optional": false, "type": "string"}, {"field": "description", "optional": true, "type": "string"}, {"field": "price", "name": "decimal", "optional": false, "parameters": {"precision": "10", "scale": "2"}, "type": "float64"}, {"field": "in_stock", "optional": true, "type": "boolean"}, {"field": "category", "optional": true, "type": "string"}, {"field": "created_at", "name": "timestamp", "optional": true, "type": "string"}], "name": "products.after.value", "optional": false, "type": "struct"}, {"field": "source", "fields": [{"field": "mvcc_timestamp", "optional": true, "type": "string"}, {"field": "ts_ns", "optional": true, "type": "int64"}, {"field": "ts_hlc", "optional": true, "type": "string"}, {"field": "table_name", "optional": false, "type": "string"}, {"field": "origin", "optional": false, "type": "string"}, {"field": "cluster_id", "optional": false, "type": "string"}, {"field": "node_id", "optional": false, "type": "string"}, {"field": "changefeed_sink", "optional": false, "type": "string"}, {"field": "schema_name", "optional": false, "type": "string"}, {"field": "node_name", "optional": false, "type": "string"}, {"field": "database_name", "optional": false, "type": "string"}, {"field": "source_node_locality", "optional": false, "type": "string"}, {"field": "primary_keys", "items": {"optional": false, "type": "string"}, "optional": false, "type": "array"}, {"field": "job_id", "optional": false, "type": "string"}, {"field": "db_version", "optional": false, "type": "string"}, {"field": "cluster_name", "optional": false, "type": "string"}], "name": "cockroachdb.source", "optional": true, "type": "struct"}, {"field": "ts_ns", "optional": false, "type": "int64"}, {"field": "op", "optional": false, "type": "string"}], "name": "cockroachdb.envelope", "optional": false, "type": "struct"}}
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

CockroachDB provides multiple changefeed envelopes, each supported by different sinks and use cases.

The possible top-level fields in a JSON-formatted envelope:

### `"payload"`

The change event data. `"payload"` is a wrapper only with webhook sinks and when the `enriched_properties` options is used.

{{site.data.alerts.callout_info}}
For [webhook sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), the response format arrives as a batch of changefeed messages with a `payload` and `length`.

~~~
{"payload": [{"after" : {"a" : 1, "b" : "a"}, "key": [1], "topic": "foo"}, {"after": {"a": 1, "b": "b"}, "key": [1], "topic": "foo" }], "length":2}
~~~
{{site.data.alerts.end}}

#### `"after"` 

The state of the row after the change. This contains the column names and values after an `INSERT` or `UPDATE`. For delete operations, `"after"` will be `NULL`. In the default `wrapped` envelope, every message for an insert/update has an `"after"` field with the new data. In a `row` envelope, the whole message is the state of the row without the `"after"` wrapper, and in the `key_only` envelope there is no `"after"` field because only the key is sent.

#### `"before"` 

The state of the row before the change. This field appears only if the `diff` option is enabled on a `wrapped` (or `enriched`) envelope. For updates, `"before"` is the previous values of the row before the update. For deletes, `"before"` is the last state of the row. For inserts, `"before"` will be `NULL` (the row had no prior state). This field is useful for auditing changes or computing differences. (Not applicable to envelopes like `row` or `key_only`, which do not support the `"before"` or `"after"` fields.)

#### `"key"` 

An array composed of the row's `PRIMARY KEY` field(s) (e.g., `[1]` for JSON or `{"id":{"long":1}}` for Avro). The message envelope contains a primary key array when your changefeed is emitting to a sink that does not have a message key as part of its protocol, (e.g., cloud storage, webhook sinks, or Pub/Sub). By default, messages emitted to Kafka sinks do not have the primary key array, because the key is part of the message metadata. If you would like messages emitted to Kafka sinks to contain a primary key array, you can use the [`key_in_value`]({% link {{ page.version.version }}/create-changefeed.md %}#key-in-value) option.

#### `"updated"` 

A timestamp indicating when the change was committed. This field appears if the `updated` option is enabled. It is formatted as a string timestamp. The `updated` timestamp corresponds to the transaction commit time for that change. If the changefeed was started with a `cursor` (at a specific past timestamp), the updated times will align with the MVCC timestamps of each row version.

#### `"op"` 

{% include_cached new-in.html version="v25.2" %} The type of change operation. `"c"` for `INSERT`, `"u"` for `UPDATE`, `"d"` for `DELETE`.

#### `"source"` 

{% include_cached new-in.html version="v25.2" %} Metadata about the source of the change event. This is included when using `envelope=enriched` with `enriched_properties='source'` (or `'source,schema'`). The `"source"` field includes the following fields about the cluster running the changefeed:

- `"changefeed_sink"`: The sink type receiving the changefeed (e.g., `kafka`).
- `"cluster_id"`: The unique ID.
- `"cluster_name"`: The name, [if configured]({% link {{ page.version.version }}/cockroach-start.md %}#flags-cluster-name).
- `"db_version"`: The CockroachDB version.
- `"job_id"`: The changefeed's job ID.
- `"mvcc_timestamp"`: The MVCC timestamp of the change, as a string. This is CockroachDB’s timestamp for the version (a decimal number representing logical time). It’s included if the `mvcc_timestamp` option is set. Unlike `"updated"`, which might be omitted for initial scans, `"mvcc_timestamp"` is always present on each message when enabled, including backfill events. This field is mainly used for low-level debugging or when exact internal timestamps are needed. (`"mvcc_timestamp"` will be a top-level field when the changefeed is not using the `enriched` envelope.)
- `"node_id"`: The node that emitted the changefeed message.
- `"node_name"`: The name of the node that emitted the changefeed message.
- `"origin"`: The identifier for the changefeed's origin, always `cockroachdb`.
- `"primary_keys"`: An array of primary key column name(s) for the changed row.
- `"schema_name"`: The schema name of the changed table.
- `"source_node_locality"`: The locality of the node that emitted the changefeed messages, e.g., `"cloud=gce,region=us-east1,zone=us-east1-b"`.
- `"table_name"`: The name of the table that changed.
- `"ts_hlc"`: A timestamp indicating when the change was committed. Included instead of `"updated"` when the `enriched_options=source` and `updated` options are included at changefeed creation.

#### `"ts_ns"` 

{% include_cached new-in.html version="v25.2" %} Commit timestamp of the change event in nanoseconds since the epoch.

#### `table`: 

The name of the table that generated the change. This field appears in certain contexts:

- In sinkless changefeeds (those created with `EXPERIMENTAL CHANGEFEED FOR` or `CREATE CHANGEFEED ... WITH sinkless`), the output includes a `"table"` field for each row change, because a single sinkless feed could cover multiple tables.
- In the `enriched` envelope, the fully qualified table name is typically part of the `source` field (as `database`, `schema`, `table` sub-fields), rather than a separate top-level `"table"` field.

{{site.data.alerts.callout_info}}
When a changefeed targets a table with multiple column families, the family name is appended to the table name as part of the topic. Refer to [Tables with columns families in changefeeds]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %}#message-format) for guidance.
{{site.data.alerts.end}}

#### `__crdb__`

A field used by the `bare` envelope to carry CockroachDB metadata that would otherwise be top level. When `envelope=bare`, the message’s top level is the row data, so CockroachDB inserts any needed metadata (primary key, topic, timestamps, etc.) under a nested `"__crdb__"` object. For example:

~~~json
{
"__crdb__": {"key": [101]},
"id": 101,
"customer_id": 1,
"total": 50.00,
"status": "new"
}
~~~

Here `"__crdb__": {"key": [101]}` holds the primary key for the row, while the rest of the object are the row’s columns at top level. Other metadata like `"updated"` timestamps or `resolved` timestamps would also appear inside `__crdb__`, if present. This field is specific to the `bare` envelope or other cases (like custom [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}) with `SELECT`) where metadata needs to be attached without interfering with the selected row data.

### `"schema"` 

{% include_cached new-in.html version="v25.2" %} The schema and type of each payload field. This is included when using `envelope=enriched` with `enriched_properties='schema'`. The `"schema"` field provides information needed to interpret the data. The following are present for each schema present in the envelope, depending on the configured options:

- `"field"`: The name of field.
- `"type"`: The type of the field.
- `"optional"`: This is a boolean field that defines whether a field may be absent in the `"payload"` section of the envelope.
- `"name"`: The name of the described schema.

## See more

- For more detail on the file naming format for cloud storage sinks, refer to [changefeed files]({% link {{ page.version.version }}/create-changefeed.md %}#files).