---
title: Changefeed Messages
summary: Understand changefeed messages and the configuration options.
toc: true
docs_area: stream_data
key: use-changefeeds.html
---

Changefeeds emit messages as changes happen to watched tables. CockroachDB changefeeds have an at-least-once delivery guarantee as well as message ordering guarantees. You can also configure the format of changefeed messages with different [options](create-changefeed.html#options) (e.g., `format=avro`).

This page describes the format and behavior of changefeed messages. You will find the following information on this page:

- [Responses](#responses): The general format of changefeed messages.
- [Ordering guarantees](#ordering-guarantees): CockroachDB's guarantees for a changefeed's message ordering.
- [Delete messages](#delete-messages): The format of messages when a row is deleted.
- [Schema changes](#schema-changes): The effect of schema changes on a changefeed.
- [Garbage collection](#garbage-collection-and-changefeeds): How protected timestamps and garbage collection interacts with running changefeeds.
- [Avro](#avro): The limitations and type mapping when creating a changefeed using Avro format.

## Responses

By default, changefeed messages emitted to a [sink](changefeed-sinks.html) contain keys and values of the watched table entries that have changed, with messages composed of the following fields:

- **Key**: An array always composed of the row's `PRIMARY KEY` field(s) (e.g., `[1]` for `JSON` or `{"id":{"long":1}}` for Avro).
- **Value**:
    - One of three possible top-level fields:
        - `after`, which contains the state of the row after the update (or `null` for `DELETE`s).
        - `updated`, which contains the updated timestamp.
        - `resolved`, which is emitted for records representing resolved timestamps. These records do not include an `after` value since they only function as checkpoints.
    - For [`INSERT`](insert.html) and [`UPDATE`](update.html), the current state of the row inserted or updated.
    - For [`DELETE`](delete.html), `null`.

For example:

Statement                                      | Response
-----------------------------------------------+-----------------------------------------------------------------------
`INSERT INTO office_dogs VALUES (1, 'Petee');` | JSON: `[1]	{"after": {"id": 1, "name": "Petee"}}` </br>Avro: `{"id":{"long":1}}	{"after":{"office_dogs":{"id":{"long":1},"name":{"string":"Petee"}}}}`
`DELETE FROM office_dogs WHERE name = 'Petee'` | JSON: `[1]	{"after": null}` </br>Avro: `{"id":{"long":1}}	{"after":null}`

To limit messages to just the changed key value, use the [`envelope`](create-changefeed.html#options) option set to `key_only`.

When a changefeed targets a table with multiple column families, the family name is appended to the table name as part of the topic. See [Tables with columns families in changefeeds](changefeeds-on-tables-with-column-families.html#message-format) for guidance.

For webhook sinks, the response format arrives as a batch of changefeed messages with a `payload` and `length`. Batching is done with a per-key guarantee, which means that messages with the same key are considered for the same batch. Note that batches are only collected for row updates and not [resolved timestamps](create-changefeed.html#resolved-option):

~~~
{"payload": [{"after" : {"a" : 1, "b" : "a"}, "key": [1], "topic": "foo"}, {"after": {"a": 1, "b": "b"}, "key": [1], "topic": "foo" }], "length":2}
~~~

See [changefeed files](create-changefeed.html#files) for more detail on the file naming format for {{ site.data.products.enterprise }} changefeeds.

## Ordering guarantees

- In most cases, each version of a row will be emitted once. However, some infrequent conditions (e.g., node failures, network partitions) will cause them to be repeated. This gives our changefeeds an **at-least-once delivery guarantee**.

- Once a row has been emitted with some timestamp, no previously unseen versions of that row will be emitted with a lower timestamp. That is, you will never see a _new_ change for that row at an earlier timestamp.

    For example, if you ran the following:

    ~~~ sql
    > CREATE TABLE foo (id INT PRIMARY KEY DEFAULT unique_rowid(), name STRING);
    > CREATE CHANGEFEED FOR TABLE foo INTO 'kafka://localhost:9092' WITH UPDATED;
    > INSERT INTO foo VALUES (1, 'Carl');
    > UPDATE foo SET name = 'Petee' WHERE id = 1;
    ~~~

    You'd expect the changefeed to emit:

    ~~~ shell
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    [1]	{"__crdb__": {"updated": <timestamp 2>}, "id": 1, "name": "Petee"}
    ~~~

    It is also possible that the changefeed emits an out of order duplicate of an earlier value that you already saw:

    ~~~ shell
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    [1]	{"__crdb__": {"updated": <timestamp 2>}, "id": 1, "name": "Petee"}
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    ~~~

    However, you will **never** see an output like the following (i.e., an out of order row that you've never seen before):

    ~~~ shell
    [1]	{"__crdb__": {"updated": <timestamp 2>}, "id": 1, "name": "Petee"}
    [1]	{"__crdb__": {"updated": <timestamp 1>}, "id": 1, "name": "Carl"}
    ~~~

- If a row is modified more than once in the same transaction, only the last change will be emitted.

- Rows are sharded between Kafka partitions by the row’s [primary key](primary-key.html).

- <a name="resolved-def"></a>The `UPDATED` option adds an "updated" timestamp to each emitted row. You can also use the [`RESOLVED` option](create-changefeed.html#resolved-option) to emit "resolved" timestamp messages to each Kafka partition. A "resolved" timestamp is a guarantee that no (previously unseen) rows with a lower update timestamp will be emitted on that partition.

    For example:

    ~~~ shell
    {"__crdb__": {"updated": "1532377312562986715.0000000000"}, "id": 1, "name": "Petee H"}
    {"__crdb__": {"updated": "1532377306108205142.0000000000"}, "id": 2, "name": "Carl"}
    {"__crdb__": {"updated": "1532377358501715562.0000000000"}, "id": 3, "name": "Ernie"}
    {"__crdb__":{"resolved":"1532379887442299001.0000000000"}}
    {"__crdb__":{"resolved":"1532379888444290910.0000000000"}}
    {"__crdb__":{"resolved":"1532379889448662988.0000000000"}}
    ...
    {"__crdb__":{"resolved":"1532379922512859361.0000000000"}}
    {"__crdb__": {"updated": "1532379923319195777.0000000000"}, "id": 4, "name": "Lucky"}
    ~~~

- With duplicates removed, an individual row is emitted in the same order as the transactions that updated it. However, this is not true for updates to two different rows, even two rows in the same table.

    To compare two different rows for [happens-before](https://en.wikipedia.org/wiki/Happened-before), compare the "updated" timestamp. This works across anything in the same cluster (e.g., tables, nodes, etc.).

    Resolved timestamp notifications on every Kafka partition can be used to provide strong ordering and global consistency guarantees by buffering records in between timestamp closures. Use the "resolved" timestamp to see every row that changed at a certain time.

    The complexity with timestamps is necessary because CockroachDB supports transactions that can affect any part of the cluster, and it is not possible to horizontally divide the transaction log into independent changefeeds. For more information about this, [read our blog post on CDC](https://www.cockroachlabs.com/blog/change-data-capture/).

## Delete messages

Deleting a row will result in a changefeed outputting the primary key of the deleted row and a null value. For example, with default options, deleting the row with primary key `5` will output:

~~~ shell
[5] {"after": null}
~~~

In some unusual situations you may receive a delete message for a row without first seeing an insert message. For example, if an attempt is made to delete a row that does not exist, you may or may not get a delete message because the changefeed behavior is undefined to allow for optimizations at the storage layer. Similarly, if there are multiple writes to a row within a single transaction, only the last one will propagate to a changefeed. This means that creating and deleting a row within the same transaction will never result in an insert message, but may result in a delete message.

## Schema Changes

### Avro schema changes

To ensure that the Avro schemas that CockroachDB publishes will work with the schema compatibility rules used by the Confluent schema registry, CockroachDB emits all fields in Avro as nullable unions. This ensures that Avro and Confluent consider the schemas to be both backward- and forward-compatible, since the Confluent Schema Registry has a different set of rules than Avro for schemas to be backward- and forward-compatible.

Note that the original CockroachDB column definition is also included in the schema as a doc field, so it's still possible to distinguish between a `NOT NULL` CockroachDB column and a `NULL` CockroachDB column.

### Schema changes with column backfill

When schema changes with column backfill (e.g., adding a column with a default, adding a computed column, adding a `NOT NULL` column, dropping a column) are made to watched rows, the changefeed will emit some duplicates during the backfill. When it finishes, CockroachDB outputs all watched rows using the new schema. When using Avro, rows that have been backfilled by a schema change are always re-emitted.

For an example of a schema change with column backfill, start with the changefeed created in this [Kafka example](changefeed-examples.html#create-a-changefeed-connected-to-kafka):

~~~
[1]	{"id": 1, "name": "Petee H"}
[2]	{"id": 2, "name": "Carl"}
[3]	{"id": 3, "name": "Ernie"}
~~~

Add a column to the watched table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE office_dogs ADD COLUMN likes_treats BOOL DEFAULT TRUE;
~~~

The changefeed emits duplicate records 1, 2, and 3 before outputting the records using the new schema:

~~~
[1]	{"id": 1, "name": "Petee H"}
[2]	{"id": 2, "name": "Carl"}
[3]	{"id": 3, "name": "Ernie"}
[1]	{"id": 1, "name": "Petee H"}  # Duplicate
[2]	{"id": 2, "name": "Carl"}     # Duplicate
[3]	{"id": 3, "name": "Ernie"}    # Duplicate
[1]	{"id": 1, "likes_treats": true, "name": "Petee H"}
[2]	{"id": 2, "likes_treats": true, "name": "Carl"}
[3]	{"id": 3, "likes_treats": true, "name": "Ernie"}
~~~

When using the [`schema_change_policy = nobackfill` option](create-changefeed.html#schema-policy), the changefeed will still emit duplicate records for the table that is being altered. In the preceding output, the records marked as `# Duplicate` will still emit with this option, but not the new schema records.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/virtual-computed-column-cdc.md %}
{{site.data.alerts.end}}

## Garbage collection and changefeeds

By default, [protected timestamps](architecture/storage-layer.html#protected-timestamps) will protect changefeed data from [garbage collection](architecture/storage-layer.html#garbage-collection) up to the time of the [_checkpoint_](change-data-capture-overview.html#how-does-an-enterprise-changefeed-work).

Protected timestamps will protect changefeed data from garbage collection in the following scenarios:

- The downstream [changefeed sink](changefeed-sinks.html) is unavailable. Protected timestamps will protect changes until you either [cancel](cancel-job.html) the changefeed or the sink becomes available once again. 
- You [pause](pause-job.html) a changefeed with the [`protect_data_from_gc_on_pause`](create-changefeed.html#protect-pause) option enabled. Protected timestamps will protect changes until you [resume](resume-job.html) the changefeed.

However, if the changefeed lags too far behind, the protected changes could cause data storage issues. To release the protected timestamps and allow garbage collection to resume, you can cancel the changefeed or [resume](resume-job.html) in the case of a paused changefeed. 

We recommend [monitoring](monitor-and-debug-changefeeds.html) storage and the number of running changefeeds. If a changefeed is not advancing and is [retrying](monitor-and-debug-changefeeds.html#changefeed-retry-errors), it will (without limit) accumulate garbage while it retries to run.

When `protect_data_from_gc_on_pause` is **unset**, pausing the changefeed will release the existing protected timestamp record. As a result, you could lose the changes if the changefeed remains paused longer than the [garbage collection](configure-replication-zones.html#gc-ttlseconds) window.

The only ways for changefeeds to **not** protect data are:

- You pause the changefeed without `protect_data_from_gc_on_pause` set.
- You cancel the changefeed.
- The changefeed fails without [`on_error=pause`](create-changefeed.html#on-error) set.

## Avro

The following sections provide information on Avro usage with CockroachDB changefeeds. Creating a changefeed using Avro is available in Core and {{ site.data.products.enterprise }} changefeeds.

### Avro limitations

Below are clarifications for particular SQL types and values for Avro changefeeds:

{% include {{ page.version.version }}/cdc/avro-limitations.md %}

### Avro types

Below is a mapping of CockroachDB types to Avro types:

CockroachDB Type | Avro Type | Avro Logical Type
-----------------+-----------+---------------------
[`ARRAY`](array.html) | [`ARRAY`](https://avro.apache.org/docs/1.8.1/spec.html#schema_complex) |
[`BIT`](bit.html) | Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BLOB`](bytes.html) | [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BOOL`](bool.html) | [`BOOLEAN`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BYTEA`](bytes.html) | [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BYTES`](bytes.html) | [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`COLLATE`](collate.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`DATE`](date.html) | [`INT`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`DATE`](https://avro.apache.org/docs/1.8.1/spec.html#Date)
[`DECIMAL`](decimal.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive), [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`DECIMAL`](https://avro.apache.org/docs/1.8.1/spec.html#Decimal)
[`ENUMS`](enum.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`FLOAT`](float.html) | [`DOUBLE`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INET`](inet.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INT`](int.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INTERVAL`](interval.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`JSONB`](jsonb.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`STRING`](string.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`TIME`](time.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`TIMESTAMP`](timestamp.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`TIMESTAMPTZ`](timestamp.html) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`UUID`](uuid.html) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`VARBIT`](bit.html)| Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |

{{site.data.alerts.callout_info}}
The `DECIMAL` type is a union between Avro `STRING` and Avro `DECIMAL` types.
{{site.data.alerts.end}}

## CSV

You can use the [`format=csv`](create-changefeed.html#format) option to emit CSV format messages from your changefeed. However, there are the following limitations with this option:

- It **only** works in combination with the [`initial_scan = 'only'`](create-changefeed.html#initial-scan) option.
- It does **not** work when used with the [`diff`](create-changefeed.html#diff-opt) or [`resolved`](create-changefeed.html#resolved-option) options.

{% include {{ page.version.version }}/cdc/csv-changefeed-format.md %}

See [Export Data with Changefeeds](export-data-with-changefeeds.html) for detail on using changefeeds to export data from CockroachDB.

The following shows example CSV format output:

~~~
4ccccccc-cccc-4c00-8000-00000000000f,washington dc,Holly Williams,95153 Harvey Street Suite 5,2165526885
51eb851e-b851-4c00-8000-000000000010,washington dc,Ryan Hickman,21187 Dennis Village,1635328127
56242e0e-4935-4d21-a8cd-915f4002e53c,washington dc,Joshua Smith,80842 Edwards Bridge,1892482054
5707febd-0278-4e55-8715-adbb35f09759,washington dc,Preston Fisher,5603 David Mission Apt. 93,5802323725
576546de-d59c-429b-9251-be79472643d4,washington dc,Anna Underwood,81246 Lee Knoll,2838348371
596c1cf8-d59f-4ad6-9379-6aba82648ca9,washington dc,Gerald Good,59876 Wang Neck,6779715200
5d30f838-e24c-46cb-bb0c-4a5643ddc2b1,washington dc,Lawrence Lucas,67248 Robinson Way Apt. 46,6167017463
65c398b9-7cce-45c5-9a5b-9561569ae030,washington dc,Mr. Xavier Waters,85393 Diaz Camp,1783482816
7a78fb0b-d368-46f6-b530-f9c74c19ba25,washington dc,Christopher Owens,7460 Curtis Centers,1470959770
80696ab6-7ec9-4e55-afee-4f468478fe82,washington dc,Patricia Gibson,77436 Vaughn Ville,3271633253
93750763-f992-4018-8a11-bf15ebfecc06,washington dc,Alison Romero,15878 Grant Forks Suite 16,2742488244
9cc3f995-0a91-4612-a079-e81ca28257ab,washington dc,Corey Dunn,15958 Jenna Locks,2358457606
9efd7047-c5e5-4501-9fcd-cff2d27efc34,washington dc,Patricia Gray,16139 Nicholas Wells Suite 64,8935020269
a253a15c-8e0a-4d25-aa87-1a0839935005,washington dc,Samantha Lee,90429 Russell Coves,2990967825
a3081762-9841-4275-ad7a-75a7e8d5f69d,washington dc,Preston Fisher,5603 David Mission Apt. 93,5802323725
aebb80a6-eceb-4d10-9d9a-f26270188114,washington dc,Kenneth Miller,52393 Stephen Mill Apt. 7,3966083325
~~~

## See also

- [Online Schema Changes](online-schema-changes.html)
- [Change Data Capture Overview](change-data-capture-overview.html)
- [Create and Configure Changefeeds](create-and-configure-changefeeds.html)

