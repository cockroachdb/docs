---
title: Use Changefeeds
summary: Set up and understand the output from changefeeds.
toc: true
docs_area: stream_data
---

This page describes the main components to enabling and using changefeeds:

- [Rangefeeds](#enable-rangefeeds)
- Changefeed [at-least-once-delivery-guarantees](#ordering-guarantees)
- [Schema changes](#schema-changes) with changefeeds
- [Changefeed responses](#responses)

Read the following [Considerations](#considerations) before working with changefeeds.

## Considerations

- It is necessary to [enable rangefeeds](#enable-rangefeeds) for changefeeds to work.
- Changefeeds do not share internal buffers, so each running changefeed will increase total memory usage. To watch multiple tables, we recommend creating a changefeed with a comma-separated list of tables.
- Many DDL queries (including [`TRUNCATE`](truncate.html), [`DROP TABLE`](drop-table.html), and queries that add a column family) will cause errors on a changefeed watching the affected tables. You will need to [start a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Partial or intermittent sink unavailability may impact changefeed stability. If a sink is unavailable, messages can't send, which means that a changefeed's high-water mark timestamp is at risk of falling behind the cluster's [garbage collection window](configure-replication-zones.html#replication-zone-variables). Throughput and latency can be affected once the sink is available again. However, [ordering guarantees](#ordering-guarantees) will still hold for as long as a changefeed [remains active](monitor-and-debug-changefeeds.html#monitor-a-changefeed).
- When an [`IMPORT INTO`](import-into.html) statement is run, any current changefeed jobs targeting that table will fail.
- {% include {{ page.version.version }}/cdc/virtual-computed-column-cdc.md %}

## Enable rangefeeds

Changefeeds connect to a long-lived request (i.e., a rangefeed), which pushes changes as they happen. This reduces the latency of row changes, as well as reduces transaction restarts on tables being watched by a changefeed for some workloads.

**Rangefeeds must be enabled for a changefeed to work.** To [enable the cluster setting](set-cluster-setting.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.rangefeed.enabled = true;
~~~

Any created changefeed will error until this setting is enabled. Note that enabling rangefeeds currently has a small performance cost (about a 5-10% increase in latencies), whether or not the rangefeed is being used in a changefeed.

The `kv.closed_timestamp.target_duration` [cluster setting](cluster-settings.html) can be used with changefeeds. Resolved timestamps will always be behind by at least this setting's duration; however, decreasing the duration leads to more transaction restarts in your cluster, which can affect performance.

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

## Responses

### Messages

The messages (i.e., keys and values) emitted to a sink are specific to the [`envelope`](create-changefeed.html#options). The default format is `wrapped`, and the output messages are composed of the following:

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

When a changefeed targets a table with multiple column families, the family name is appended to the table name as part of the topic. See [Tables with columns families in changefeeds](#col-family-response) for guidance.

For webhook sinks, the response format comes as a batch of changefeed messages with a `payload` and `length`. Batching is done with a per-key guarantee, which means that the messages with the same key are considered for the same batch. Note that batches are only collected for row updates and not [resolved timestamps](create-changefeed.html#resolved-option):

~~~
{"payload": [{"after" : {"a" : 1, "b" : "a"}, "key": [1], "topic": "foo"}, {"after": {"a": 1, "b": "b"}, "key": [1], "topic": "foo" }], "length":2}
~~~

See [Files](create-changefeed.html#files) for more detail on the file naming format for {{ site.data.products.enterprise }} changefeeds.

## Garbage collection and changefeeds

{% include_cached new-in.html version="v22.1" %} By default, [protected timestamps](architecture/storage-layer.html#protected-timestamps) will protect changefeed data from [garbage collection](architecture/storage-layer.html#garbage-collection) up to the time of the [_checkpoint_](change-data-capture-overview.html#how-does-an-enterprise-changefeed-work).

Protected timestamps will protect changefeed data from garbage collection in the following scenarios:

- The downstream [changefeed sink](changefeed-sinks.html) is unavailable. Protected timestamps will protect changes until you either [cancel](cancel-job.html) the changefeed or the sink becomes available once again. 
- You [pause](pause-job.html) a changefeed with the [`protect_data_from_gc_on_pause`](create-changefeed.html#protect-pause) option enabled. Protected timestamps will protect changes until you [resume](resume-job.html) the changefeed.

However, if the changefeed lags too far behind, the protected changes could cause data storage issues. To release the protected timestamps and allow garbage collection to resume, you can cancel the changefeed or [resume](resume-job.html) in the case of a paused changefeed. 

We recommend [monitoring](monitor-and-debug-changefeeds.html) storage and the number of running changefeeds. If a changefeed is not advancing and is retrying, it will (without limit) accumulate garbage while it retries to run.

When `protect_data_from_gc_on_pause` is **unset**, pausing the changefeed will release the existing protected timestamp record. As a result, you could lose the changes if the changefeed remains paused longer than the [garbage collection](configure-replication-zones.html#gc-ttlseconds) window.

The only ways for changefeeds to **not** protect data are:

- You pause the changefeed without `protect_data_from_gc_on_pause` set.
- You cancel the changefeed.
- The changefeed fails without [`on_error=pause`](create-changefeed.html#on-error) set.

## Changefeeds on tables with column families

{% include_cached new-in.html version="v22.1" %} You can create changefeeds on tables with more than one [column family](column-families.html). Changefeeds will emit individual messages per column family on a table.

To target a table with multiple column families, set the [`split_column_families` option](create-changefeed.html#split-column-families) when creating a changefeed:

~~~ sql
CREATE CHANGEFEED FOR TABLE {table} INTO {sink} WITH split_column_families;
~~~

To emit messages for a specific column family, use the `FAMILY` keyword:

~~~ sql
CREATE CHANGEFEED FOR TABLE {table} FAMILY {family} INTO {sink};
~~~

{{site.data.alerts.callout_info}}
You can also use [Core changefeeds](changefeed-examples.html#create-a-core-changefeed-on-a-table-with-column-families) on tables with column families by using the [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html) statement with `split_column_families` or the `FAMILY` keyword.
{{site.data.alerts.end}}

If a table has multiple column families, the `FAMILY` keyword will ensure the changefeed emits messages for **each** column family you define with `FAMILY` in the `CREATE CHANGEFEED` statement. If you do not specify `FAMILY`, then the changefeed will emit messages for **all** the table's column families.

To specify multiple families on the same table, it is necessary to define the table and family in both instances:

~~~ sql
CREATE CHANGEFEED FOR TABLE tbl FAMILY f_1, TABLE tbl FAMILY f_2;
~~~

<a name="col-family-response"></a>The response will follow a typical [changefeed message format](#messages), but with the family name appended to the table name with a `.`, in the format `table.family`:

~~~
{"after":{"column":"value"},"key":[1],"topic":"table.family"}
~~~

For [cloud storage sinks](changefeed-sinks.html#cloud-storage-sink), the filename will include the family name appended to the table name with a `+`, in the format `table+primary`.

[Avro](#avro) schema names will include the family name concatenated to the table name.

The primary key columns will appear in the `key` for **all** column families, and will also appear in the value **only** for the families that they are a member of.

For example, if the table `office_dogs` has a column family `primary`, containing the primary key and a `STRING` column, and a `secondary` column family containing a different `STRING` column, then you'll receive two messages for an insert.

~~~ sql
CREATE TABLE office_dogs (
   id INT PRIMARY KEY,
   name STRING,
   owner STRING,
   FAMILY primary (id, name),
   FAMILY secondary (owner)
 );
~~~

The changefeed targeting this table (started with `split_column_families`) will emit the following when there are inserts to the table:

~~~
{"after":{"id":4,"name":"Toby"},"key":[4],"topic":"office_dogs.primary"}],"length":1}
{"after":{"owner":"Ashley"},"key":[4],"topic":"office_dogs.secondary"}],"length":1}
~~~

The output shows the `primary` column family with `4` in the value (`{"id":4,"name":"Toby"}`) and the key (`"key":[4]`). The `secondary` family doesn't contain the `id` column, so the primary key `4` is only in the key and **not** the value. For an update that only affects data in one column family, the changefeed will send one message for that update relating to the family.

It is important to consider the following when creating a changefeed on a table with multiple column families:

- If you create a table **without** column families and then start a changefeed with the `split_column_families` option, it is not possible to add column families. A subsequent `ALTER TABLE` statement adding a column family to the table will cause the changefeed to fail.
- When you do not specify column family names in the `CREATE` or `ALTER TABLE` statement, the family names will default to either of the following:
    - `primary`: Since `primary` is a key word, you'll receive a syntax error if you run `CREATE CHANGEFEED FOR table FAMILY primary`. To avoid this syntax error, use double quotes: `CREATE CHANGEFEED FOR table FAMILY "primary"`. You'll receive output from the changefeed like: `table.primary`.
    - `fam_<zero-indexed family id>_<delimited list of columns>`: For a table that does not include a name for the family: `FAMILY (id, name)`, you'll receive output from the changefeed containing: `table.fam_0_id_name`. This references the table, the family ID and the two columns that this column family includes.

For an example of starting changefeeds on tables with column families, see the [Changefeed Examples](changefeed-examples.html#create-a-changefeed-on-a-table-with-column-families) page.

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

## See also

- [Online Schema Changes](online-schema-changes.html)
- [Change Data Capture Overview](change-data-capture-overview.html)
- [Create and Configure Changefeeds](create-and-configure-changefeeds.html)
