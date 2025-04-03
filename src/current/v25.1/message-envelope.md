---
title: Changefeed Message Envelope
summary: Learn how to configure the changefeed message envelope.
toc: true
---

The _envelope_ defines the structure of a [changefeed message]({% link {{ page.version.version }}/changefeed-messages.md %}). By default changefeed messages emitted to a sink contain keys and values of the [watched table rows]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table) that have changed. You can use the `envelope` option to configure the message envelope's structure.

{{site.data.alerts.callout_info}}
You can also specify the _format_ of changefeed messages, such as Avro. For more details, refer to [Message formats]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats).
{{site.data.alerts.end}}

{% comment  %}

Add whole of responses section
Delete messages
and Message envelopes


{% endcomment %}




## Envelope fields

Depending on the sink and options you specified to create the changefeed, the envelope and available configuration can vary. The envelope can contain the following fields:

- `key`: An array composed of the row's `PRIMARY KEY` field(s) (e.g., `[1]` for JSON or `{"id":{"long":1}}` for Avro).
- `value`:
    - Possible top-level fields:
        - `after`, which contains the state of the row after the update (or `null` for `DELETE`s).
        - `updated`, which contains the [updated]({% link {{ page.version.version }}/create-changefeed.md %}#updated) timestamp
        - `resolved`, which is emitted for records representing [resolved](#resolved-messages) timestamps. These records do not include an `after` value since they only function as checkpoints.
        - `before`, which contains the state of the row before an update. Changefeeds must use the [`diff` option]({% link {{ page.version.version }}/create-changefeed.md %}#diff) with the default [`wrapped` envelope](#wrapped) to emit the `before` field. When a row did not previously have any data, the `before` field will emit `null`.
        - `op`
        - `ts_ns`
    - For [`INSERT`]({% link {{ page.version.version }}/insert.md %}) and [`UPDATE`]({% link {{ page.version.version }}/update.md %}), the current state of the row inserted or updated.
    - For [`DELETE`]({% link {{ page.version.version }}/delete.md %}), `null`.


## Message envelopes

The _envelope_ defines the structure of a changefeed message. You can use the [`envelope`]({% link {{ page.version.version }}/create-changefeed.md %}#envelope) option to manipulate the changefeed envelope. The values that the `envelope` option accepts are compatible with different [changefeed sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}), and the structure of the message will vary depending on the sink.

{{site.data.alerts.callout_info}}
Changefeeds created with [`EXPERIMENTAL CHANGEFEED FOR`]({% link {{ page.version.version }}/changefeed-for.md %}) or [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) with no sink specified (sinkless changefeeds) produce messages without the envelope metadata fields of changefeeds emitting to sinks.
{{site.data.alerts.end}}

The following sections provide examples of changefeed messages that are emitted when you specify each of the supported `envelope` options. Other [changefeed options]({% link {{ page.version.version }}/create-changefeed.md %}#options) can affect the message envelope and what messages are emitted. Therefore, the examples are a guide for what you can expect when only the `envelope` option is specified.

### `wrapped`

`wrapped` is the default envelope structure for changefeed messages. This envelope contains an array of the primary key (or the key as part of the message metadata), a top-level field for the type of message, and the current state of the row (or `null` for [deleted rows](#delete-messages)).

The message envelope contains a primary key array when your changefeed is emitting to a sink that does not have a message key as part of its protocol, (e.g., cloud storage, webhook sinks, or Google Pub/Sub). By default, messages emitted to Kafka sinks do not have the primary key array, because the key is part of the message metadata. If you would like messages emitted to Kafka sinks to contain a primary key array, you can use the [`key_in_value`]({% link {{ page.version.version }}/create-changefeed.md %}#key-in-value) option. Refer to the following message outputs for examples of this.

- Cloud storage sink:

    ~~~sql
    CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://cloud';
    ~~~
    ~~~
    {"after": {"city": "seattle", "creation_time": "2019-01-02T03:04:05", "current_location": "86359 Jeffrey Ranch", "ext": {"color": "yellow"}, "id": "68ee1f95-3137-48e2-8ce3-34ac2d18c7c8", "owner_id": "570a3d70-a3d7-4c00-8000-000000000011", "status": "in_use", "type": "scooter"}, "key": ["seattle", "68ee1f95-3137-48e2-8ce3-34ac2d18c7c8"]}
    ~~~

- Kafka sink:

    - Default when `envelope=wrapped` or `envelope` is not specified:

        ~~~sql
        CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://kafka';
        ~~~
        ~~~
        {"after": {"city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "24315 Elizabeth Mountains", "ext": {"color": "yellow"}, "id": "dadc1c0b-30f0-4c8b-bd16-046c8612bbea", "owner_id": "034075b6-5380-4996-a267-5a129781f4d3", "status": "in_use", "type": "scooter"}}
        ~~~

    - Kafka sink message with `key_in_value` provided:

        ~~~sql
        CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://kafka' WITH key_in_value, envelope=wrapped;
        ~~~
        ~~~
        {"after": {"city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "46227 Jeremy Haven Suite 92", "ext": {"brand": "Schwinn", "color": "red"}, "id": "298cc7a0-de6b-4659-ae57-eaa2de9d99c3", "owner_id": "beda1202-63f7-41d2-aa35-ee3a835679d1", "status": "in_use", "type": "bike"}, "key": ["washington dc", "298cc7a0-de6b-4659-ae57-eaa2de9d99c3"]}
        ~~~

#### `wrapped` and `diff`

To include a `before` field in the changefeed message that contains the state of a row before an update in the changefeed message, use the `diff` option with `wrapped`:

~~~sql
CREATE CHANGEFEED FOR TABLE rides INTO 'external://kafka' WITH diff, envelope=wrapped;
~~~

~~~
{"after": {"city": "seattle", "end_address": null, "end_time": null, "id": "f6c02fe0-a4e0-476d-a3b7-91934d15dce2", "revenue": 25.00, "rider_id": "14067022-6e9b-427b-bd74-5ef48e93da1f", "start_address": "2 Michael Field", "start_time": "2023-06-02T15:14:20.790155", "vehicle_city": "seattle", "vehicle_id": "55555555-5555-4400-8000-000000000005"}, "before": {"city": "seattle", "end_address": null, "end_time": null, "id": "f6c02fe0-a4e0-476d-a3b7-91934d15dce2", "revenue": 25.00, "rider_id": "14067022-6e9b-427b-bd74-5ef48e93da1f", "start_address": "5 Michael Field", "start_time": "2023-06-02T15:14:20.790155", "vehicle_city": "seattle", "vehicle_id": "55555555-5555-4400-8000-000000000005"}, "key": ["seattle", "f6c02fe0-a4e0-476d-a3b7-91934d15dce2"]}
~~~

### `bare`

`bare` removes the `after` key from the changefeed message and stores any metadata in a `crdb` field. When used with [`avro`](#avro) format, `record` will replace the `after` key.

- Cloud storage sink:

    ~~~sql
    CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://cloud' WITH envelope=bare;
    ~~~
    ~~~
    {"__crdb__": {"key": ["washington dc", "cd48e501-e86d-4019-9923-2fc9a964b264"]}, "city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "87247 Diane Park", "ext": {"brand": "Fuji", "color": "yellow"}, "id": "cd48e501-e86d-4019-9923-2fc9a964b264", "owner_id": "a616ce61-ade4-43d2-9aab-0e3b24a9aa9a", "status": "available", "type": "bike"}
    ~~~

{% include {{ page.version.version }}/cdc/bare-envelope-cdc-queries.md %}

- In CDC queries:

    - A changefeed containing a `SELECT` clause without any additional options:

        ~~~sql
        CREATE CHANGEFEED INTO 'external://kafka' AS SELECT city, type FROM movr.vehicles;
        ~~~
        ~~~
        {"city": "los angeles", "type": "skateboard"}
        ~~~

    - A changefeed containing a `SELECT` clause with the [`topic_in_value`]({% link {{ page.version.version }}/create-changefeed.md %}#topic-in-value) option specified:

        ~~~sql
        CREATE CHANGEFEED INTO 'external://kafka' WITH topic_in_value AS SELECT city, type FROM movr.vehicles;
        ~~~
        ~~~
        {"__crdb__": {"topic": "vehicles"}, "city": "los angeles", "type": "skateboard"}
        ~~~

### `key_only`

`key_only` emits only the key and no value, which is faster if you only need to know the key of the changed row. This envelope option is only supported for [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or sinkless changefeeds.

- Kafka sink:

    ~~~sql
    CREATE CHANGEFEED FOR TABLE users INTO 'external://kafka' WITH envelope=key_only;
    ~~~
    ~~~
    ["boston", "22222222-2222-4200-8000-000000000002"]
    ~~~

    {{site.data.alerts.callout_info}}
    It is necessary to set up a [Kafka consumer](https://docs.confluent.io/platform/current/clients/consumer.html) to display the key because the key is part of the metadata in Kafka messages, rather than in its own field. When you start a Kafka consumer, you can use `--property print.key=true` to have the key print in the changefeed message.
    {{site.data.alerts.end}}

- Sinkless changefeeds:

    ~~~sql
    CREATE CHANGEFEED FOR TABLE users WITH envelope=key_only;
    ~~~
    ~~~
    {"key":"[\"seattle\", \"fff726cc-13b3-475f-ad92-a21cafee5d3f\"]","table":"users","value":""}
    ~~~

### `row`

`row` emits the row without any additional metadata fields in the message. This envelope option is only supported for [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or sinkless changefeeds. `row` does not support [`avro`](#avro) format—if you are using `avro`, refer to the [`bare`](#bare) envelope option.

- Kafka sink:

    ~~~sql
    CREATE CHANGEFEED FOR TABLE vehicles INTO 'external://kafka' WITH envelope=row;
    ~~~
    ~~~
    {"city": "washington dc", "creation_time": "2019-01-02T03:04:05", "current_location": "85551 Moore Mountains Apt. 47", "ext": {"color": "red"}, "id": "d3b37607-1e9f-4e25-b772-efb9374b08e3", "owner_id": "4f26b516-f13f-4136-83e1-2ea1ae151c20", "status": "available", "type": "skateboard"}
    ~~~









## Options



### `enriched`

This is a complete list of possible user-visible fields in this enriched changefeed message:

Top-level:

- `key`
- `table`: use to preserve the origin/provenance of the change event, particularly when the changefeed is part of a multi-source system.
- `value`
    - Inside `value`:
        - `before` (optional): Reflects the state of the row before the change event. audit changes, debug, or implement logic that depends on changes in data.
        - `after` (default): Reflects the state of the row after the change event. Set to `NULL` for `DELETE` operations. Allow downstream systems to access the latest data for processing or storage.
        - `op`: route change events to handler logic in downstream systems based on the operation type.
        - `ts_ns`: 
        - `updated` (optional): apply a time filter, monitor for latency (compare the source commit time to when an event is processed at the destination). For analytics, this timestamp can serve as a watermark for an event.
        - `mvcc_timestamp` (optional): Determine when the change occurred in the database. Compare the age of rows by comparing current and previous MVCC timestamps.
        - `source` (optional): Includes fields to describe where the change came from. Provides contextual information.
        - `schema` (optional): Describes the schema of the change event payload.

## `value` Object Fields

### 1. `before` (optional)
- **Type:** `object`
- **Description:** The row state **before** the change (only present when `diff` is enabled and the change is an update or delete).

**Fields (example schema):**

| Field         | Type     | Description                                     |
|---------------|----------|-------------------------------------------------|
| `productid`   | `int64`  | Primary key value.                             |
| `productname` | `string` | Name of the product.                           |
| `description` | `string` | Product description.                           |
| `price`       | `float64`| Product price (with precision/scale metadata). |
| `stock`       | `int64`  | Quantity available.                            |
| `category`    | `string` | Product category.                              |

### 2. `after`
- **Type:** `object`
- **Description:** The row state **after** the change (present for inserts and updates).
- **Fields:** Same as `before`.

### 3. `op`
- **Type:** `string`
- **Description:** Operation type that triggered the change event.

**Possible Values:**
- `"c"` — Insert (create)
- `"u"` — Update
- `"d"` — Delete

### 4. `ts_ns`
- **Type:** `int64`
- **Description:** Logical timestamp of the change in **nanoseconds** since the Unix epoch.

### 5. `updated` (if `updated` is enabled)
- **Type:** `string` (ISO8601)
- **Description:** Human-readable version of `ts_ns`, representing the logical commit time of the change.

### 6. `mvcc_timestamp` (if `mvcc_timestamp` is enabled)
- **Type:** `string`
- **Description:** Internal MVCC timestamp of the row version that triggered the change. Used for exact versioning and replay.



{% comment  %}
Maybe outline can be:

Intro.
high-level overview page
Option and Field References
Examples which are broken down by option with sinks listed

{% endcomment %}


## Examples

Following are a selection of examples for 

- Route events based on operation type
- Replay changes up to a certain point in time
- Monitor for end-to-end lag
- Preserve the origin of data
- Audit changes in data

