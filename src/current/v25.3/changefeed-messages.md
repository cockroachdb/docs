---
title: Changefeed Messages
summary: Understand changefeed messages and the configuration options.
toc: true
docs_area: stream_data
key: use-changefeeds.html
---

Changefeeds generate and emit _messages_ (on a per-key basis) to sinks as _change events_ (`INSERT`, `UPDATE`, `DELETE`) happen to the rows in [watched tables]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table). CockroachDB changefeeds have an at-least-once delivery guarantee as well as message ordering guarantees. 

This page has reference information for the following changefeed message topics:

- [Ordering and delivery guarantees](#ordering-and-delivery-guarantees): CockroachDB's guarantees for a changefeed's message ordering and delivery.
- [Delete messages](#delete-messages): The format of messages when a row is deleted.
- [Resolved messages](#resolved-messages): The resolved timestamp option and how to configure it.
- [Duplicate messages](#duplicate-messages): The causes of duplicate messages from a changefeed.
- [Schema changes](#schema-changes): The effect of schema changes on a changefeed.
- [Filtering changefeed messages](#filtering-changefeed-messages): The settings and syntax to prevent and filter the messages that changefeeds emit.
- [Message formats](#message-formats): The limitations and type mapping when creating a changefeed with different message formats.

To enable various use cases and sink support, you can use changefeed options to configure the message: 

- [_Envelope_]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}): the structure of each message. Include or exclude row data, payload schema definitions, and source metadata.
- [_Format_](#message-formats): the available formats, such as JSON, CSV, and Avro.

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/cdc/types-udt-composite-general.md %}
{{site.data.alerts.end}}

## Ordering and delivery guarantees

Changefeeds provide the following guarantees for message delivery to changefeed sinks:

- [Per-key ordering](#per-key-ordering) for the first emission of an event's message.
- [At-least-once delivery](#at-least-once-delivery) per event message.

{{site.data.alerts.callout_info}}
Changefeeds do not support total message ordering or transactional ordering of messages.
{{site.data.alerts.end}}

### Per-key ordering

Changefeeds provide a _per-key ordering guarantee_ for the **first emission** of a message to the sink. Once the changefeed has emitted a row with a timestamp, the changefeed will not emit any previously unseen versions of that row with a lower timestamp. Therefore, you will never receive a new change for that row at an earlier timestamp.

For example, a changefeed can emit updates to rows `A` at timestamp `T1`, `B` at `T2`, and `C` at `T3` in any order.

When there are updates to rows `A` at `T1`, `B` at `T2`, and `A` at `T3`, the changefeed will always emit `A` at `T3` (for the first time) **after** emitting `A` at `T1` (for the first time). However, `A` at `T3` could precede or follow `B` at `T2`, because there is no timestamp ordering between keys.

Under some circumstances, a changefeed will emit [duplicate messages](#duplicate-messages) of row updates. Changefeeds can emit duplicate messages in any order.

As an example, you run the following sequence of SQL statements to create a changefeed:

1. Create a table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE employees (
        id INT PRIMARY KEY,
        name STRING,
        office STRING
    );
    ~~~

1. Create a changefeed targeting the `employees` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE employees INTO 'external://sink' WITH updated;
    ~~~

1. Insert and update values in `employees`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO employees VALUES (1, 'Terry', 'new york city');
    INSERT INTO employees VALUES (2, 'Alex', 'los angeles');
    UPDATE employees SET name = 'Terri' WHERE id = 1;
    INSERT INTO employees VALUES (3, 'Ash', 'london');
    UPDATE employees SET name = 'Terrence' WHERE id = 1;
    UPDATE employees SET office = 'new york city' WHERE id = 2;
    INSERT INTO employees VALUES (4, 'Danny', 'los angeles');
    INSERT INTO employees VALUES (5, 'Robbie', 'london');
    ~~~

    {{site.data.alerts.callout_info}}
    In a [transaction]({% link {{ page.version.version }}/transactions.md %}), if a row is modified more than once in the same transaction, the changefeed will only emit the last change.
    {{site.data.alerts.end}}

1. The sink will receive messages of the inserted rows emitted per timestamp:

    ~~~
    {"after": {"id": 1, "name": "Terry", "office": "new york city"}, "key": [1], "updated": "1701102296662969433.0000000000"}
    {"after": {"id": 1, "name": "Terri", "office": "new york city"}, "key": [1], "updated": "1701102311425045162.0000000000"}
    {"after": {"id": 2, "name": "Alex", "office": "los angeles"}, "key": [2], "updated": "1701102305519323705.0000000000"}
    {"after": {"id": 3, "name": "Ash", "office": "london"}, "key": [3], "updated": "1701102316388801052.0000000000"}
    {"after": {"id": 1, "name": "Terrence", "office": "new york city"}, "key": [1], "updated": "1701102320607990564.0000000000"}
    {"after": {"id": 2, "name": "Alex", "office": "new york city"}, "key": [2], "updated": "1701102325724272373.0000000000"}
    {"after": {"id": 5, "name": "Robbie", "office": "london"}, "key": [5], "updated": "1701102330377135318.0000000000"}
    {"after": {"id": 4, "name": "Danny", "office": "los angeles"}, "key": [4], "updated": "1701102561022789676.0000000000"}
    ~~~

    The messages received at the sink are in order by timestamp **for each key**. Here, the update for key `[1]` is emitted before the insertion of key `[2]` even though the timestamp for the update to key `[1]` is higher. That is, if you follow the sequence of updates for a particular key at the sink, they will be in the correct timestamp order. However, if a changefeed starts to re-emit messages after the last [checkpoint]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}), it may not emit all duplicate messages between the first duplicate message and new updates to the table. For details on when changefeeds might re-emit messages, refer to [Duplicate messages](#duplicate-messages).

    The `updated` option adds an `updated` timestamp to each emitted row. You can also use the [`resolved` option](#resolved-messages) to emit a `resolved` timestamp message to each Kafka partition, or to a separate file at a cloud storage sink. A `resolved` timestamp guarantees that no (previously unseen) rows with a lower update timestamp will be emitted on that partition.

    {{site.data.alerts.callout_info}}
    Depending on the workload, you can use resolved timestamp notifications on every Kafka partition to provide strong ordering and global consistency guarantees by buffering records in between timestamp closures. Use the `resolved` timestamp to see every row that changed at a certain time.
    {{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
[Webhook message batching]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink-configuration) is subject to the same key [ordering guarantee](#ordering-and-delivery-guarantees) as other sinks. Therefore, as messages are batched, you will not receive two batches at the same time with overlapping keys. You may receive a single batch containing multiple messages about one key, because ordering is maintained for a single key within its batch.
{{site.data.alerts.end}}

#### Define a key column

Typically, changefeeds that emit to Kafka sinks shard rows between Kafka partitions using the row's primary key, which is hashed. The resulting hash remains the same and ensures a row will always emit to the same Kafka partition.

In some cases, you may want to specify another column in a table as the key by using the [`key_column`]({% link {{ page.version.version }}/create-changefeed.md %}#key-column) option, which will determine the partition your messages will emit to. However, if you implement `key_column` with a changefeed, consider that other columns may have arbitrary values that change. As a result, the same row (i.e., by primary key) may emit to any partition at the sink based upon the column value. A changefeed with a `key_column` specified will still maintain per-key and at-least-once delivery guarantees.

To confirm that messages may emit the same row to different partitions when an arbitrary column is used, you must include the [`unordered`]({% link {{ page.version.version }}/create-changefeed.md %}#unordered) option:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE employees INTO 'external://kafka-sink'
    WITH key_column='office', unordered;
~~~

### At-least-once delivery

Changefeeds also provide an _at-least-once delivery guarantee_, which means that each version of a row will be emitted once. Under some infrequent conditions a changefeed will emit duplicate messages. This happens when the changefeed was not able to emit all messages before reaching a checkpoint. As a result, it may re-emit some or all of the messages starting from the previous checkpoint to ensure that every message is delivered at least once, which could lead to some messages being delivered more than once.

Refer to [Duplicate messages](#duplicate-messages) for causes of messages repeating at the sink.

For example, the checkpoints and changefeed pauses marked in this output show how messages may be duplicated, but always delivered:

~~~
{"after": {"id": 1, "name": "Terry", "office": "new york city"}, "key": [1], "updated": "1701102296662969433.0000000000"}
{"after": {"id": 1, "name": "Terri", "office": "new york city"}, "key": [1], "updated": "1701102311425045162.0000000000"}
{"after": {"id": 2, "name": "Alex", "office": "los angeles"}, "key": [2], "updated": "1701102305519323705.0000000000"}

[checkpoint]

{"after": {"id": 3, "name": "Ash", "office": "london"}, "key": [3], "updated": "1701102316388801052.0000000000"}
{"after": {"id": 1, "name": "Terrence", "office": "new york city"}, "key": [1], "updated": "1701102320607990564.0000000000"}

[changefeed pauses before the next checkpoint was reached]

[changefeed resumes and re-emits the messages after the previous checkpoint to ensure the sink received the messages]

{"after": {"id": 3, "name": "Ash", "office": "london"}, "key": [3], "updated": "1701102316388801052.0000000000"}
{"after": {"id": 1, "name": "Terrence", "office": "new york city"}, "key": [1], "updated": "1701102320607990564.0000000000"}
{"after": {"id": 2, "name": "Alex", "office": "new york city"}, "key": [2], "updated": "1701102325724272373.0000000000"}

[changefeed continues to emit new events]

{"after": {"id": 5, "name": "Robbie", "office": "london"}, "key": [5], "updated": "1701102330377135318.0000000000"}
{"after": {"id": 4, "name": "Danny", "office": "los angeles"}, "key": [4], "updated": "1701102561022789676.0000000000"}

[checkpoint]
~~~

In this example, with duplicates removed, an individual row is emitted in the same order as the transactions that updated it. However, this is not true for updates to two different rows, even two rows in the same table. (Refer to [Per-key ordering](#per-key-ordering).)

{{site.data.alerts.callout_danger}}
The first time a message is delivered, it will be in the correct timestamp order, which follows the [per-key ordering guarantee](#per-key-ordering). However, when there are [duplicate messages](#duplicate-messages), the changefeed may **not** re-emit every row update. As a result, there may be gaps in a sequence of duplicate messages for a key.
{{site.data.alerts.end}}

To compare two different rows for [happens-before](https://wikipedia.org/wiki/Happened-before), compare the `updated` timestamp. This works across anything in the same cluster (tables, nodes, etc.). 

When you use the [`enriched` envelope]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}#enriched), if you require timestamps to order messages based on the change event's commit time, then you must specify `envelope=enriched, enriched_properties=source, updated` when you create the changefeed, which will include `"ts_hlc"` and `"ts_ns"` in the [`"source"`]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}#source) field. (It is important to ignore the [`ts_ns` field]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}#ts_ns) at the top level when you're comparing changes for ordering.) For more details on configuring envelope fields, refer to the [Changefeed Message Envelope]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}) page.

The complexity with timestamps is necessary because CockroachDB supports transactions that can affect any part of the cluster, and it is not possible to horizontally divide the transaction log into independent changefeeds. For more information about this, [read our blog post on CDC](https://www.cockroachlabs.com/blog/change-data-capture/).

{% include {{ page.version.version }}/cdc/composite-key-delete-insert.md %}

## Delete messages

Deleting a row will result in a changefeed outputting the primary key of the deleted row and a null value. For example, with default options, deleting the row with primary key `5` will output:

~~~json
[5] {"after": null}
~~~

In some unusual situations you may receive a delete message for a row without first seeing an insert message. For example, if an attempt is made to delete a row that does not exist, you may or may not get a delete message because the changefeed behavior is undefined to allow for optimizations at the storage layer. Similarly, if there are multiple writes to a row within a single transaction, only the last one will propagate to a changefeed. This means that creating and deleting a row within the same transaction will never result in an insert message, but may result in a delete message.

## Resolved messages

When you create a changefeed with the [`resolved` option]({% link {{ page.version.version }}/create-changefeed.md %}#resolved), the changefeed will emit resolved timestamp messages in a format dependent on the connected [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). The resolved timestamp is the high-water mark that guarantees that no previously unseen rows with an [earlier update timestamp](#ordering-and-delivery-guarantees) will be emitted to the sink. That is, resolved timestamp messages do not emit until the changefeed job has reached a [checkpoint]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}).

When you specify the `resolved` option at changefeed creation, the [job's coordinating node]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}) will send the resolved timestamp to each endpoint at the sink. For example, each [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) partition will receive a resolved timestamp message, or a [cloud storage sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink) will receive a resolved timestamp file.

There are three different ways to configure resolved timestamp messages:

- If you do not specify the `resolved` option at all, then the changefeed coordinator node will not send resolved timestamp messages.
- If you include `WITH resolved` in your changefeed creation statement **without** specifying a value, the coordinator node will emit resolved timestamps as the changefeed job checkpoints and the high-water mark advances. Note that new Kafka partitions may not receive resolved messages right away.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE ... WITH resolved;
    ~~~

- If you specify a duration like `WITH resolved={duration}`, the coordinator node will use the duration as the minimum amount of time that the changefeed's high-water mark (overall resolved timestamp) must advance by before another resolved timestamp is emitted. The changefeed will only emit a resolved timestamp message if the timestamp has advanced (and by at least the optional duration, if set). For example:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE CHANGEFEED FOR TABLE ... WITH resolved=30s;
    ~~~

### Resolved timestamp frequency

The changefeed job's coordinating node will emit resolved timestamp messages once the changefeed has reached a checkpoint. The frequency of the checkpoints determine how often the resolved timestamp messages emit to the sink. To configure how often the changefeed checkpoints, you can set the [`min_checkpoint_frequency`]({% link {{ page.version.version }}/create-changefeed.md %}#min-checkpoint-frequency) option and [flush frequency]({% link {{ page.version.version }}/changefeed-sinks.md %}) (if flushing is configurable for your sink).

The `min_checkpoint_frequency` option controls how often nodes flush their progress to the coordinating node. If you need resolved timestamp messages to emit from the changefeed more frequently than the `30s` default, then you must set `min_checkpoint_frequency` to at least the desired resolved timestamp frequency. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE ... WITH resolved=10s, min_checkpoint_frequency=10s;
~~~

When you configure the `min_checkpoint_frequency` and `resolved` options, there can be a tradeoff between changefeed message latency and cluster CPU usage.

- Lowering these options will cause the changefeed to checkpoint and send resolved timestamp messages more frequently, which can add overhead to CPU usage in the cluster.
- Raising these options will result in the changefeed checkpointing and sending resolved timestamp messages less frequently, which can cause latency in message delivery to the sink.

For example, you can set `min_checkpoint_frequency` and `resolved` to `0s` so that the changefeed job checkpoints as frequently as possible and messages are sent immediately followed by the resolved timestamp. However, the frequent checkpointing will increase CPU usage in the cluster. If your application can tolerate a longer duration than `0s` between checkpoints, this will help to reduce the overhead on the cluster.

## Duplicate messages

Under some circumstances, changefeeds will emit duplicate messages to ensure the sink is receiving each message at least once. The following can cause or increase duplicate messages:

- The changefeed job [encounters an error](#changefeed-encounters-an-error) and pauses, or is manually paused.
- A node in the cluster [restarts](#node-restarts) or fails.
- The changefeed job has the [`min_checkpoint_frequency` option set](#min_checkpoint_frequency-option), which can potentially increase duplicate messages.
- A target table undergoes a schema change. Schema changes may also cause the changefeed to emit the whole target table. Refer to [Schema changes](#schema-changes) for detail on duplicates in this case.

A changefeed job cannot confirm that a message has been received by the sink unless the changefeed has reached a checkpoint. As a changefeed job runs, each node will send checkpoint progress to the job's coordinator node. These progress reports allow the coordinator to update the high-water mark timestamp confirming that all changes before (or at) the timestamp have been emitted.

When a changefeed must pause and then resume, it will return to the last checkpoint (**A**), which is the last point at which the coordinator confirmed all changes for the given timestamp. As a result, when the changefeed resumes, it will re-emit the messages that were not confirmed in the next checkpoint. The changefeed may not re-emit every message, but it will ensure each change is emitted at least once.

<img src="/docs/images/{{ page.version.version }}/changefeed-duplicate-messages-emit.png" alt="How checkpoints will re-emit messages when a changefeed pauses. The changefeed returns to the last checkpoint and potentially sends duplicate messages." style="border:0px solid #eee;max-width:100%" />

### Changefeed encounters an error

By default, changefeeds treat errors as [retryable except for some specific terminal errors]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#changefeed-retry-errors). When a changefeed encounters a retryable or non-retryable error, the job will pause until a successful retry or you resume the job once the error is solved. This can cause duplicate messages at the sink as the changefeed returns to the last checkpoint.

We recommend monitoring for changefeed retry errors and failures. Refer to the [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#recommended-changefeed-metrics-to-track) page.

{{site.data.alerts.callout_info}}
A sink's batching behavior can increase the number of duplicate messages. For example, if Kafka receives a batch of `N` messages and successfully saves `N-1` of them, the changefeed job only knows that the batch failed, not which message failed to commit. As a result, the changefeed job will resend the full batch of messages, which means all but one of the messages are duplicates. For Kafka sinks, reducing the batch size with [`kafka_sink_config`]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka-sink-configuration) may help to reduce the number of duplicate messages at the sink.

Refer to the [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page for details on sink batching configuration.
{{site.data.alerts.end}}

### Node restarts

When a node restarts, the changefeed will emit duplicates since the last checkpoint. During a rolling restart of nodes, a changefeed can fall behind as it tries to catch up during each node restart. For example, as part of a rolling upgrade or cluster maintenance, a node may [drain]({% link {{ page.version.version }}/node-shutdown.md %}) every 5 minutes and the changefeed job checkpoints every 5 minutes.

To prevent the changefeed from falling too far behind, [pause]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#configuring-all-changefeeds) changefeed jobs before performing rolling node restarts.

### `min_checkpoint_frequency` option

The `min_checkpoint_frequency` option controls how often nodes flush their progress to the coordinating changefeed node. Therefore, changefeeds will wait for at least the `min_checkpoint_frequency` duration before flushing to the sink. If a changefeed pauses and then resumes, the `min_checkpoint_frequency` duration is the amount of time that the changefeed will need to catch up since its previous checkpoint. During this catch-up time, you could receive duplicate messages.

## Schema Changes

For some schema changes, changefeeds will **not** emit duplicate records for the table that is being altered. Instead, the changefeed will only emit a copy of the table using the new schema. Refer to [Schema changes with column backfill](#schema-changes-with-column-backfill) for examples of this.

### Avro schema changes

To ensure that the Avro schemas that CockroachDB publishes will work with the schema compatibility rules used by the Confluent schema registry, CockroachDB emits all fields in Avro as nullable unions. This ensures that Avro and Confluent consider the schemas to be both backward- and forward-compatible, because the Confluent Schema Registry has a different set of rules than Avro for schemas to be backward- and forward-compatible.

The original CockroachDB column definition is also included within a doc field `__crdb__` in the schema. This allows CockroachDB to distinguish between a `NOT NULL` CockroachDB column and a `NULL` CockroachDB column.

{{site.data.alerts.callout_danger}}
Schema validation tools should ignore the `__crdb__` field. This is an internal CockroachDB schema type description that may change between CockroachDB versions.
{{site.data.alerts.end}}

### Schema changes with column backfill

When schema changes with column backfill (e.g., adding a column with a default, adding a [stored computed column]({% link {{ page.version.version }}/computed-columns.md %}), adding a `NOT NULL` column, dropping a column) are made to watched rows, CockroachDB emits a copy of the table using the new schema.

The following example demonstrates the messages you will receive after creating a changefeed and then applying a schema change to the watched table:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE TABLE office_dogs (
     id INT PRIMARY KEY,
     name STRING);
~~~
{% include_cached copy-clipboard.html %}
~~~sql
INSERT INTO office_dogs VALUES
   (1, 'Petee H'),
   (2, 'Carl'),
   (3, 'Ernie');
~~~
{% include_cached copy-clipboard.html %}
~~~sql
CREATE CHANGEFEED FOR TABLE office_dogs INTO 'external://cloud';
~~~

You receive each of the rows at the sink:

~~~json
[1]	{"id": 1, "name": "Petee H"}
[2]	{"id": 2, "name": "Carl"}
[3]	{"id": 3, "name": "Ernie"}
~~~

For example, add a column to the watched table:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE office_dogs ADD COLUMN likes_treats BOOL DEFAULT TRUE;
~~~

After the schema change, the changefeed will emit a copy of the table with the new schema:

~~~json
[1]	{"id": 1, "name": "Petee H"}
[2]	{"id": 2, "name": "Carl"}
[3]	{"id": 3, "name": "Ernie"}
[1]	{"id": 1, "likes_treats": true, "name": "Petee H"}
[2]	{"id": 2, "likes_treats": true, "name": "Carl"}
[3]	{"id": 3, "likes_treats": true, "name": "Ernie"}
~~~

For some schema changes, the changefeed will emit a copy of the altered table and a copy of the table using the new schema:

~~~json
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

To prevent the changefeed from emitting a copy of the table with the new schema, use the `schema_change_policy = nobackfill` option. In the preceding two output blocks, the new schema messages that include the `"likes_treats"` column will not emit.

Refer to the [`CREATE CHANGEFEED` option table]({% link {{ page.version.version }}/create-changefeed.md %}#schema-change-events) for detail on the `schema_change_policy` option. You can also use the `schema_change_events` option to define the type of schema change event that triggers the behavior specified in `schema_change_policy`.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/virtual-computed-column-cdc.md %}
{{site.data.alerts.end}}

## Filtering changefeed messages

There are several ways to define messages, filter different types of message, or prevent all changefeed messages from emitting to the sink. The following sections outline configurable settings and SQL syntax to handle different use cases.

### Prevent changefeeds from emitting row-level TTL deletes

{% include {{ page.version.version }}/cdc/disable-replication-ttl.md %}

### Disable changefeeds from emitting messages

To prevent changefeeds from emitting messages for any changes (e.g., `INSERT`, `UPDATE`) issued to watched tables during that session, set the `disable_changefeed_replication` [session variable]({% link {{ page.version.version }}/session-variables.md %}) to `true`.

### Define the change data emitted to a sink

When you create a changefeed, use change data capture queries to define the change data emitted to your sink.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO 'scheme://sink-URI' WITH updated AS SELECT column, column FROM table;
~~~

For details on syntax and examples, refer to the [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %}) page.

### Specify a column as a Kafka header

Use the `headers_json_column_name` option to specify a [JSONB]({% link {{ page.version.version }}/jsonb.md %}) column that the changefeed emits as Kafka headers for each row’s change event. You can send metadata, such as routing or tracing information, at the protocol level in the header, separate from the message payload. This allows for Kafka brokers or routers to filter the metadata the header contains without deserializing the payload.

Headers enable efficient routing, filtering, and distributed tracing by intermediate systems, such as Kafka brokers, stream processors, or observability tools.

{{site.data.alerts.callout_info}}
The `headers_json_column_name` option is supported with changefeeds emitting to [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}).
{{site.data.alerts.end}}

For example, define a table that updates compliance events. This schema includes a `kafka_meta` column of type `JSONB`, used to store a trace ID and other metadata for the Kafka header:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE compliance_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type STRING NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    details STRING,
    kafka_meta JSONB
);
~~~

Insert example rows into the table, populating the `kafka_meta` column with the `JSONB` data. The changefeed will emit this column as Kafka headers alongside the row changes:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO compliance_events (
    user_id, event_type, details, kafka_meta
) VALUES
(gen_random_uuid(), 'policy_ack', 'User accepted data policy v2.1', '{"trace_id": "abc123", "compliance_level": "low"}'),
(gen_random_uuid(), 'access_review', 'Admin approved elevated access for app A', '{"trace_id": "def456", "compliance_level": "high"}'),
(gen_random_uuid(), 'policy_ack', 'User accepted retention policy update', '{"trace_id": "ghi789", "compliance_level": "medium"}'),
(gen_random_uuid(), 'access_review', 'User confirmed access to sensitive dataset', '{"trace_id": "xyz123", "compliance_level": "high"}'),
(gen_random_uuid(), 'policy_ack', 'Policy v3.0 acknowledged by contractor', '{"trace_id": "mno456", "compliance_level": "low"}');
~~~

Create a changefeed that emits messages from the `compliance_events` table to Kafka and specify the `kafka_meta` column using the `headers_json_column_name` option:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE compliance_events INTO 'kafka://localhost:9092' WITH headers_json_column_name = 'kafka_meta';
~~~

The changefeed will emit each row’s `kafka_meta` data as Kafka headers, which Kafka brokers or stream processors can use to access the metadata without inspecting the payload.

The Kafka topic receives the message payload with the row-level change, excluding the specified header column (`kafka_meta`):

~~~json
{"after": {"details": "User accepted data policy v2.1", "event_id": "ee321dc6-388b-4416-a389-adfafab50ee4", "event_timestamp": "2025-05-09T21:20:29.203923Z", "event_type": "policy_ack", "user_id": "06ba6114-529c-4a99-9811-1dd3d12dad07"}}
{"after": {"details": "User accepted retention policy update", "event_id": "59d391f8-c141-4dc9-9622-9079c3462201", "event_timestamp": "2025-05-09T21:20:29.203923Z", "event_type": "policy_ack", "user_id": "98213553-9c1a-43a6-a598-921c3c6c3b20"}}
{"after": {"details": "Admin approved elevated access for app A", "event_id": "41cf0dbe-c0bc-48aa-9b60-ef343bcef9e1", "event_timestamp": "2025-05-09T21:20:29.203923Z", "event_type": "access_review", "user_id": "ed192798-f7ef-4fe8-a496-f22bb5738b04"}}
. . .
~~~

The Kafka headers will contain:

Key (`event_id`) | Value (Kafka payload) | Headers
------------------+-----------------------+--------
`3e2a9b4a-f1e3-4202-b343-1a52e1ffb0d4` | `{"event_type": "policy_ack", "details": "User accepted data policy v2.1"}` | `trace_id=abc123, compliance_level=low`
`7c90a289-2f91-4666-a8d5-962dc894e1c2` | `{"event_type": "access_review", "details": "Admin approved elevated access for app A"}` | `trace_id=def456, compliance_level=high`
`1a6e0d3f-7191-4d99-9a36-7f4b85e5cd23` | `{"event_type": "policy_ack", "details": "User accepted retention policy update"} `| `trace_id=ghi789, compliance_level=medium` 
`89af6b6e-f34d-4a1d-a69d-91d29526e9f7` | `{"event_type": "access_review", "details": "User confirmed access to sensitive dataset"}` | `trace_id=xyz123, compliance_level=high`
`587cf30d-3f17-4942-8a01-f110ef8a5ae3` | `{"event_type": "policy_ack", "details": "Policy v3.0 acknowledged by contractor"}` | `trace_id=mno456, compliance_level=low` 

If you would like to filter the table columns that a changefeed emits, refer to the [CDC Queries]({% link {{ page.version.version }}/cdc-queries.md %}) page. To customize the message envelope, refer to the [Changefeed Message Envelope]({% link {{ page.version.version }}/changefeed-message-envelopes.md %}) page. 

## Message formats

{% include {{ page.version.version }}/cdc/message-format-list.md %}

{{site.data.alerts.callout_info}}
{% include {{page.version.version}}/cdc/types-udt-composite-general.md %}
{{site.data.alerts.end}}

The following sections outline the limitations and type mapping for relevant formats.

### Avro

The following sections provide information on Avro usage with CockroachDB changefeeds. Creating a changefeed using Avro is available with the [`confluent_schema_registry`](create-changefeed.html#confluent-schema-registry) option.

#### Avro limitations

Below are clarifications for particular SQL types and values for Avro changefeeds:

{% include {{ page.version.version }}/cdc/avro-limitations.md %}

#### Avro types

Below is a mapping of CockroachDB types to Avro types:

CockroachDB Type | Avro Type | Avro Logical Type
-----------------+-----------+---------------------
[`ARRAY`]({% link {{ page.version.version }}/array.md %}) | [`ARRAY`](https://avro.apache.org/docs/1.8.1/spec.html#schema_complex) |
[`BIT`]({% link {{ page.version.version }}/bit.md %}) | Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BLOB`]({% link {{ page.version.version }}/bytes.md %}) | [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BOOL`]({% link {{ page.version.version }}/bool.md %}) | [`BOOLEAN`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BYTEA`]({% link {{ page.version.version }}/bytes.md %}) | [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`BYTES`]({% link {{ page.version.version }}/bytes.md %}) | [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`COLLATE`]({% link {{ page.version.version }}/collate.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`DATE`]({% link {{ page.version.version }}/date.md %}) | [`INT`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`DATE`](https://avro.apache.org/docs/1.8.1/spec.html#Date)
[`DECIMAL`]({% link {{ page.version.version }}/decimal.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive), [`BYTES`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`DECIMAL`](https://avro.apache.org/docs/1.8.1/spec.html#Decimal)
[`ENUMS`]({% link {{ page.version.version }}/enum.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`FLOAT`]({% link {{ page.version.version }}/float.md %}) | [`DOUBLE`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INET`]({% link {{ page.version.version }}/inet.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INT`]({% link {{ page.version.version }}/int.md %}) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`STRING`]({% link {{ page.version.version }}/string.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`TIME`]({% link {{ page.version.version }}/time.md %}) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) | [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) | [`TIME-MICROS`](https://avro.apache.org/docs/1.8.1/spec.html#Time+%28microsecond+precision%29)
[`UUID`]({% link {{ page.version.version }}/uuid.md %}) | [`STRING`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |
[`VARBIT`]({% link {{ page.version.version }}/bit.md %})| Array of [`LONG`](https://avro.apache.org/docs/1.8.1/spec.html#schema_primitive) |

{{site.data.alerts.callout_info}}
The `DECIMAL` type is a union between Avro `STRING` and Avro `DECIMAL` types.
{{site.data.alerts.end}}

### CSV

You can use the [`format=csv`]({% link {{ page.version.version }}/create-changefeed.md %}#format) option to emit CSV format messages from your changefeed. However, there are the following limitations with this option:

- It **only** works in combination with the [`initial_scan = 'only'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) option.
- It does **not** work when used with the [`diff`]({% link {{ page.version.version }}/create-changefeed.md %}#diff) or [`resolved`]({% link {{ page.version.version }}/create-changefeed.md %}#resolved) options.
- {% include {{page.version.version}}/cdc/csv-udt-composite.md %}

{% include {{ page.version.version }}/cdc/csv-changefeed-format.md %}

See [Export Data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %}) for detail on using changefeeds to export data from CockroachDB.

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

### JSON

To distinguish between JSON `NULL` values and SQL `NULL` values in changefeed messages, you can use the [`encode_json_value_null_as_object` option]({% link {{ page.version.version }}/create-changefeed.md %}#encode-json-value-null-as-object) with [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}). When you enable `encode_json_value_null_as_object`, JSON `NULL` values will emit as `{"__crdb_json_null__": true}`.

For example, the following `test` table has a primary key column and a [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) column. The `INSERT` adds `NULL` values in each column. A changefeed without the option enabled will not distinguish between the SQL and JSON `NULL` values. With the `encode_json_value_null_as_object` option enabled, the changefeed emits the JSON `NULL` as `{"__crdb_json_null__": true}`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE test (id INT PRIMARY KEY, data JSONB);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO test VALUES (1, NULL), (2, 'null'::JSONB);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE test INTO 'external://sink';
~~~

Without the option enabled, it is not possible to distinguish the SQL and JSON `NULL` values in the emitted changefeed messages:

~~~
{"after": {"data": null, "id": 1}, "key": [1]}
{"after": {"data": null, "id": 2}, "key": [2]}
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE test INTO 'external://sink' WITH encode_json_value_null_as_object;
~~~

With `encode_json_value_null_as_object` enabled, the changefeed will encode the JSON `NULL` value in the emitted messages:

~~~
{"after": {"data": null, "id": 1}, "key": [1]}
{"after": {"data": {"__crdb_json_null__": true}, "id": 2}, "key": [2]}
~~~

When `encode_json_value_null_as_object` is enabled, if the changefeed encounters the literal value `{"__crdb_json_null__": true}` in JSON, it will have the same representation as a JSON `NULL` value and a warning will be printed to the [`DEV` logging channel]({% link {{ page.version.version }}/logging.md %}#dev).

## See also

- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Create and Configure Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %})
